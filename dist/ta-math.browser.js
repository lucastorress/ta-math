var TA = (function () {
  'use strict';

  function mean(array) {
    let sum = 0;
    for (let i = 0; i < array.length; i++) { sum += array[i]; }
    return sum / array.length;
  }

  function sd(array) {
    //const correction = (array.length > 1) ? Math.sqrt(array.length / (array.length - 1)) : 1;
    return rmsd(array, fillarray(array.length, mean(array)));
  }

  function rmsd(f, g) {
    const sqrDiff = pointwise(f, g, (a, b) => (a - b) * (a - b));
    return (f.length != g.length) ? Infinity : Math.sqrt(mean(sqrDiff));
  }

  function fillarray(length, value) {
    let result = [];
    for (let i = 0; i < length; i++) {
      result.push(value);
    }
    return result;
  }

  function pointwise(f, g, operation) {
    let result = [];
    for (let i = 0; i < f.length; i++) {
      result.push(operation(f[i], g[i]));
    }
    return result;
  }

  function rolling(array, window, operation) {
    let result = [];
    for (let i = 0; i < array.length; i++) {
      let j = i + 1 - window;
      result.push(operation(array.slice((j > 0) ? j : 0, i + 1)));
    }
    return result;
  }

  function sma($close, window) {
    return rolling($close, window, x => mean(x));
  }

  function std($close, window) {
    return rolling($close, window, x => sd(x));
  }

  function ema($close, window, weight = null) {
    let result = [$close[0]];
    weight = weight ? weight : 2 / (window + 1);
    for (let i = 1; i < $close.length; i++) {
      result.push(($close[i] - result[i - 1]) * weight + result[i - 1]);
    }  return result;
  }

  function bband($close, window, mult) {
    const middle = sma($close, window);
    const upper = pointwise(middle, std($close, window), (a, b) => a + b * mult);
    const lower = pointwise(middle, std($close, window), (a, b) => a - b * mult);
    return [lower, middle, upper];
  }

  function vbp($close, $volume, nzones, left, right) {
    let result = fillarray(nzones, 0);
    let bottom = Infinity, top = -Infinity, total = 0;
    for (let i = left; i < (right ? right : $close.length); i++) {
      total += $volume[i];
      top = (top < $close[i]) ? $close[i] : top;
      bottom = (bottom > $close[i]) ? $close[i] : bottom;
    }
    for (let i = left; i < (right ? right : $close.length); i++) {
      result[Math.floor(($close[i] - bottom + 1e-14) / (top - bottom + 1e-12) * (nzones - 1))] += $volume[i];
    }
    return { bottom: bottom, top: top, volume: result.map((x) => { return x / total })};
  }

  function zigzag($time, $high, $low, percent) {
    let low = $low[0],    high = $high[0];
    let isUp = true,      time = [],            zigzag = [];
    for (let i = 1; i < $time.length; i++) {
      if (isUp) {
        high = ($high[i] > high) ? $high[i] : high;
        if ($low[i] < low + (high - low) * (100 - percent) / 100) {
          isUp = false;   time.push($time[i]);  zigzag.push($low[i]);
        }
      } else {
        low = ($low[i] < low) ? $low[i] : low;
        if ($high[i] > low + (high - low) * percent / 100) {
          isUp = true;    time.push($time[i]);  zigzag.push($low[i]);
        }
      }
    }  return [time, zigzag];
  }

  function macd($close, wshort, wlong, wsig) {
    const macd_line = pointwise(ema($close, wshort), ema($close, wlong), (a, b) => a - b);
    const macd_signal = ema(macd_line, wsig);
    const macd_hist = pointwise(macd_line, macd_signal, (a, b) => a - b);
    return [macd_line, macd_signal, macd_hist];
  }

  function rsi($close, window) {
    let gains = [1e-14], loss = [0];
    for (let i = 1; i < $close.length; i++) {
      let diff = $close[i] - $close[i - 1];
      gains.push(diff >= 0 ? diff : 0);
      loss.push(diff < 0 ? -diff : 0);
    }
    let again = sma(gains, window);
    let aloss = sma(loss, window);
    return pointwise(again, aloss, (a, b) => 100 - 100 / (1 + a / b));
  }

  function obv($close, $volume) {
    let obv = [0];
    for(let i = 1; i < $close.length; i++) {
      obv.push(obv[i - 1] + Math.sign($close[i] - $close[i - 1]) * $volume[i]);
    }
    return obv;
  }

  function adl($high, $low, $close, $volume) {
    let result = [$volume[0] * (2*$close[0] - $low[0] - $high[0]) / ($high[0] - $low[0])];
    for(let i = 1; i < $high.length; i++) {
      result[i] = result[i - 1] + $volume[i] * (2*$close[i] - $low[i] - $high[i]) / ($high[i] - $low[i]);
    }
    return result;
  }

  let exchangeFormat = (x) => {
    return {
      length: x.length,
      time: (i) => x[i][0],
      open: (i) => x[i][1],
      high: (i) => x[i][2],
      low: (i) => x[i][3],
      close: (i) => x[i][4],
      volume: (i) => x[i][5]
    }
  };

  /**
   * Class for calculating technical analysis indicators and overlays
   */
  class TA {
    constructor(data, format = null) {
      this.format = (format == null) ? exchangeFormat : format;

      let proxy = (prop) => new Proxy(this.format(data)[prop], {
        get: (obj, key) => {
          if(key == 'length') {                 //length
            return this.format(data).length;
          } else if (key == 'slice') {          //slice
            return (start, end) => {
              var result = [];
              for (var i = start; i < end; i++) { result.push(obj(i)); }
              return result;
            }
          } else {
            try {
              if (key === parseInt(key).toString()) {   //operator[]
                return obj(key);
              }
            } catch(er) {}
          }
        }
      });

      this.$ = ['time', 'open', 'high', 'low', 'close', 'volume'];
      this.$.forEach(prop => this.$[prop] = proxy(prop));


      /* TECHNICAL ANALYSYS METHOD DEFENITION */

      return {
        sma:    (window = 15)                           =>    sma(this.$.close, window),
        ema:    (window = 10)                           =>    ema(this.$.close, window),
        std:    (window = 15)                           =>    std(this.$.close, window),
        bband:  (window = 15, mult = 2)                 =>    bband(this.$.close, window, mult),
        macd:   (wshort = 12, wlong = 26, wsig = 9)     =>    macd(this.$.close, wshort, wlong, wsig),
        rsi:    (window = 14)                           =>    rsi(this.$.close, window),
        vbp:    (zones = 12, left = 0, right = null)    =>    vbp(this.$.close, this.$.volume, zones, left, right),
        zigzag: (percent = 15)                          =>    zigzag(this.$.time, this.$.high, this.$.low, percent),
        obv:    ()                                      =>    obv(this.$.close, this.$.volume),
        adl:    ()                                      =>    adl(this.$.high, this.$.low, this.$.close, this.$.volume)
      }
    }
  }

  return TA;

}());
