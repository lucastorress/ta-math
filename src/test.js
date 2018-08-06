import { mean, sd, mae, rmse, nrmse } from './core';
import { simpleFormat } from './formats';
import TA from './main';
import assert from 'assert';

let randomize = (tleft, right) => {
  return (right - tleft) * Math.random() + tleft;
}

// random ohlcv
let random = new Array(6).fill(0).map(x => x = new Array(50).fill(0));
for (let i = 0; i < random[0].length; i++) {
  let lcoh = [randomize(5000, 20000),randomize(5000, 20000),randomize(5000, 20000),randomize(5000, 20000)].sort();
  if(randomize(0,1)) { let temp = lcoh[1]; lcoh[1] = lcoh[2]; lcoh[2] = temp; };
  random[0][i] = new Date('2018-01-01').getTime() + i * 60000;
  random[1][i] = lcoh[1];  //o
  random[2][i] = lcoh[3];  //h
  random[3][i] = lcoh[0];  //l
  random[4][i] = lcoh[2];  //c
  random[5][i] = randomize(5, 1000);
};
let noize = new TA(random, simpleFormat);

describe('Mean, SD', () => {
  let data = [53.73,53.87,53.85,53.88,54.08,54.14,54.50,54.30,54.40,54.16];
  let delta = Math.abs(mean(data) - 54.09);
  it(`Direct mean test (${delta.toFixed(5)})`, () => assert.ok(delta < 1e-2));
  delta = Math.abs(sd(data) - 0.24);
  it(`Direct sd test (${delta.toFixed(5)})`, () => assert.ok(delta < 1e-2));1
})

describe('MAE', () => {
  it('Equal test', () => assert.ok(mae([-2,5,-8,9,-4],[-2,5,-8,9,-4]) < 1e-12));
  let data = [23.98,23.92,23.79,23.67,23.54,23.36,23.65,23.72,24.16,23.91,23.81,23.92,23.74,24.68,24.94,24.93,25.10,25.12,25.20,25.06];
  let delta = Math.abs(mae(data, new Array(data.length).fill(mean(data))) - 0.55);
  it(`Direct test (${delta.toFixed(5)})`, () => assert.ok(delta < 1e-2));
})

describe('RMSE, NRMSE', () => {
  it('Equal test', () =>rmse([-2,5,-8,9,-4],[-2,5,-8,9,-4]) < 1e-12);
  let delta = Math.abs(rmse([-2,5,-8,9,-4],[0,0,0,0,0]) - 6.16);
  it(`Direct rmse test (${delta.toFixed(5)})`, () =>delta < 1e-2)
  delta = Math.abs(nrmse([-2,5,-8,9,-4],[0,0,0,0,0]) - 6.16 / (9 + 8));
  it(`Direct nrmse test (${delta.toFixed(5)})`, () =>delta < 1e-2)
})

describe('SMA', () => {
  let c = [22.27,22.19,22.08,22.17,22.18,22.13,22.23,22.43,22.24,22.29,22.15,22.39,22.38,22.61,23.36,
    24.05,23.75,23.83,23.95,23.63,23.82,23.87,23.65,23.19,23.10,23.33,22.68,23.10,22.40,22.17];
  let expected = [NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,22.22,22.21,22.23,22.26,22.31,22.42,22.61,
          22.77,22.91,23.08,23.21,23.38,23.53,23.65,23.71,23.69,23.61,23.51,23.43,23.28,23.13];
  let actual = new TA([c,c,c,c,c,c], simpleFormat).sma(10);
  it('Finite test', () => assert.ok(actual.every(isFinite)));
  let delta = nrmse(expected.slice(9), actual.slice(9))
  it(`NRMSE test (${delta.toFixed(5)})`, () => assert.ok(delta < 1e-2));
})

describe('EMA', () => {
  let c = [22.27,22.19,22.08,22.17,22.18,22.13,22.23,22.43,22.24,22.29,22.15,22.39,22.38,22.61,23.36,
    24.05,23.75,23.83,23.95,23.63,23.82,23.87,23.65,23.19,23.10,23.33,22.68,23.10,22.40,22.17];
  let expected = [NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,22.22,22.21,22.24,22.27,22.33,22.52,22.80,
          22.97,23.13,23.28,23.34,23.43,23.51,23.54,23.47,23.40,23.39,23.26,23.23,23.08,22.92];
  let actual = new TA([c,c,c,c,c,c], simpleFormat).ema(10);
  it('Finite test', () => assert.ok(actual.every(isFinite)));
  let delta = nrmse(expected.slice(9), actual.slice(9));
  it(`NRMSE test (${delta.toFixed(5)})`, () => assert.ok(delta < 1e-2));
})

describe('BB', () => {
  let c = [86.16,89.09,88.78,90.32,89.07,91.15,89.44,89.18,86.93,87.68,86.96,89.43,89.32,88.72,
    87.45,87.26,89.50,87.90,89.13,90.70,92.90,92.98,91.80,92.66,92.68,92.30,92.77,92.54,92.95,
    93.20,91.07,89.83,89.74,90.40,90.74,88.02,88.09,88.84,90.78,90.54,91.39,90.65];
  let expected = [NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,86.12,
    86.14,85.87,85.85,85.70,85.65,85.59,85.56,85.60,85.98,86.27,86.82,86.87,86.91,87.12,87.63,87.83,
    87.56,87.76,87.97,87.95,87.96,87.95];
  let bb = new TA([c,c,c,c,c,c], simpleFormat).bb(20,2);
  it('Finite test', () => assert.ok((bb.lower.every(isFinite) && bb.middle.every(isFinite) && bb.upper.every(isFinite))));
  let delta = nrmse(expected.slice(19), bb.lower.slice(19));
  it(`NRMSE test on lower (${delta.toFixed(5)})`, () => assert.ok(delta < 1e-2));
})

describe('EBB', () => {
  let ebb = noize.ebb();;
  it('Finite test', () => assert.ok((ebb.lower.every(isFinite) && ebb.middle.every(isFinite) && ebb.upper.every(isFinite))));
})

describe('PSAR', () => {
  let h = [10.3,10.0,9.8,9.6,9.9,9.8,9.2,9.4,9.5,9.3,9.9,10.2,10.1,10.5,11.3,11.6,11.6,11.8,11.9,11.9,11.6,11.4,11.2,11.4,
    11.3,11.3,10.9,10.8,10.7,10.8,10.0,10.1,9.8,9.8,9.5,9.4,9.5,9.4,9.6,10.0,10.0,9.8,10.1,10.0,9.4,9.5,9.3,9.4,9.4,10.1];
  let l = [10.1,9.8,9.6,9.4,9.5,9.3,9.0,9.2,9.1,8.9,9.6,9.8,9.6,9.5,10.8,11.3,11.2,11.3,11.7,11.6,11.3,11.1,10.9,11.1,
    11.1,11.0,10.8,10.5,10.6,10.1,9.8,9.8,9.5,9.6,9.3,9.1,9.1,9.0,9.3,9.8,9.9,9.6,9.7,9.3,9.1,9.2,9.1,8.8,9.3,9.3];
  let expected = [NaN,NaN,NaN,NaN,9.350,9.350,10.330,10.277,10.226,10.177,10.103,10.034,8.950,8.996,9.087,9.260,9.491,
    9.699,9.951,10.224,10.498,10.729,10.923,11.940,11.907,11.875,11.820,11.734,11.614,11.506,11.331,11.112,10.924,
    10.693,10.499,10.289,10.057,9.858,9.680,9.650,8.970,9.012,9.052,9.114,9.172,10.080,10.045,9.989,9.896,9.810];
  let actual = new TA([h,h,h,l,l,l], simpleFormat).psar();
  it('Finite test', () => assert.ok(actual.every(isFinite)));
  let delta = nrmse(expected.slice(5), actual.slice(5));
  //it(`NRMSE test (${delta.toFixed(5)})`, () => assert.ok(delta < 2e-2));
})

describe('VBP', () => {
  let vbp = noize.vbp();
  let delta = sd(vbp.volume)
  it('Finite test', () => assert.ok([vbp.bottom, vbp.top].every(isFinite) && vbp.volume.every(isFinite)));
  it('Bottom lower than top', () => assert.ok(vbp.bottom < vbp.top));
  it(`SD of uniform distribution (${delta.toFixed(5)})`, () => assert.ok(delta < 0.1));
})

describe('Keltner channel', () => {
  let h = [11711,11698,11743,11737,11727,11677,11704,11782,11757,11794,11859,11861,11845,11905,11983,11986,
    12021,12020,11892,12051,12058,12081,12092,12189,12239,12254,12240,12286,12276,12268,12303,12331,12390,
    12221,12130,12151,12235,12261,12115,12283,12243,12251,12258,12211,12087,12042,11989,11857,11801,11927,
    12078,12051,12116,12191,12260,12273,12285,12383,12382,12420,12407,12438,12451,12441,12012,12121,
    12075,11990,12073,12217,12208,12109,12057,12099,12190,12284,12427,12596,12602,12643,12754,12718];
  let l = [11577,11636,11653,11667,11600,11574,11635,11674,11701,11699,11778,11798,11745,11823,11868,11899,
    11962,11972,11818,11893,12019,11981,12026,12092,12150,12188,12157,12180,12236,12193,12220,12253,12176,
    12063,11983,12061,12130,12055,12019,12068,12042,12072,12157,11974,11936,11897,11696,11555,11615,11777,
    11860,12003,11973,12088,12171,12198,12174,12280,12319,12321,12369,12353,12387,12328,11918,11951,
    11863,11876,11963,12081,12106,11875,11925,11934,12042,12176,12262,12404,12541,12539,12627,12567];
  let c = [11671,11691,11723,11697,11675,11637,11672,11755,11732,11787,11838,11825,11823,11872,11981,11977,
    11985,11990,11892,12040,12042,12062,12092,12162,12233,12240,12229,12273,12268,12227,12288,12318,12213,
    12106,12069,12130,12226,12058,12067,12258,12090,12214,12213,12024,12044,11993,11891,11613,11775,11859,
    12037,12019,12086,12171,12221,12198,12279,12351,12320,12377,12400,12394,12427,12409,11953,12076,
    11897,11962,12004,12190,12110,12050,11935,12044,12189,12261,12414,12583,12570,12626,12719,12657];
  let expected = [NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,12057.39,
    12072.61,12096.61,12116.78,12147.59,12182.78,12210.92,12236.10,12266.96,12283.88,12297.52,12318.65,
    12340.20,12364.12,12363.76,12357.43,12352.59,12363.19,12364.48,12351.99,12383.71,12389.77,12407.13,
    12411.39,12409.27,12398.61,12382.17,12375.86,12340.30,12311.45,12292.92,12310.11,12298.63,12310.25,
    12325.99,12343.57,12353.19,12376.97,12405.79,12420.36,12445.25,12460.82,12479.33,12496.48,12515.38,
    12525.07,12507.17,12474.34,12440.87,12416.85,12434.98,12424.74,12426.44,12398.59,12393.51,12406.21,
    12421.22,12462.39,12524.45,12558.20,12600.24,12652.16,12692.18];
  let actual = new TA([h,h,h,l,c,c], simpleFormat).keltner();
  it('Finite test', () => assert.ok(actual.lower.every(isFinite) && actual.middle.every(isFinite) && actual.upper.every(isFinite)));
  let delta = nrmse(expected.slice(20), actual.upper.slice(20));
  it(`NRMSE test (${delta.toFixed(5)})`, () => assert.ok(delta < 1e-2));
})

describe('ZigZag', () => {
  let zz = noize.zigzag();
  it('Finite test', () => assert.ok(zz.time.every(isFinite) && zz.price.every(isFinite)));
  let isUpDown = true;
  zz.price.forEach((x, i) => {
    if(i > 1 && Math.sign((zz.price[i - 2] - zz.price[i - 1]) * (zz.price[i - 1] - zz.price[i])) != -1) {
      isUpDown = false;
    }
  });
  //it(, () => assert.ok(isUpDown, "UpDown test");
})

describe('STDDEV', () => {
  let c = [52.22,52.78,53.02,53.67,53.67,53.74,53.45,53.72,53.39,52.51,52.32,51.45,51.60,52.43,52.47,
    52.91,52.07,53.12,52.77,52.73,52.09,53.19,53.73,53.87,53.85,53.88,54.08,54.14,54.50,54.30,54.40,54.16];
  let expected = [NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,0.51,0.73,0.86,0.83,0.79,0.72,0.68,
    0.58,0.51,0.52,0.53,0.48,0.49,0.58,0.62,0.67,0.62,0.66,0.69,0.65,0.36,0.24];
  let actual = new TA([c,c,c,c,c,c], simpleFormat).stdev(10);
  it('Finite test', () => assert.ok(actual.every(isFinite)));
  let delta = nrmse(expected.slice(10), actual.slice(10));
  it(`NRMSE test (${delta.toFixed(5)})`, () => assert.ok(delta < 1e-2));
})

describe('MADEV', () => {
  let c = [23.98,23.92,23.79,23.67,23.54,23.36,23.65,23.72,24.16,23.91,23.81,23.92,23.74,24.68,24.94,24.93,
    25.10,25.12,25.20,25.06,24.50,24.31,24.57,24.62,24.49,24.37,24.41,24.35,23.75,24.09,23.98,23.92,
    23.79,23.67,23.54,23.36,23.65,23.72,24.16,23.91,23.81,23.92,23.74,24.68,24.94,24.93,25.10,25.12];
  let expected = [NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,0.55,0.56,
    0.55,0.54,0.53,0.49,0.44,0.39,0.36,0.38,0.37,0.37,0.37,0.36,0.39,0.41,0.44,0.44,0.42,0.37,0.33,
    0.32,0.30,0.28,0.28,0.31,0.34,0.39,0.44];
  let actual = new TA([c,c,c,c,c,c], simpleFormat).madev(20);
  it('Finite test', () => assert.ok(actual.every(isFinite)));
  let delta = nrmse(expected.slice(20), actual.slice(20));
  it(`NRMSE test (${delta.toFixed(5)})`, () => assert.ok(delta < 2e-2));
  
})

describe('EXPDEV', () => {
  let ed = noize.expdev();;
  it('Finite test', () => assert.ok(ed.every(isFinite)));
})

describe('MACD', () => {
  let c = [16.39,16.50,16.45,16.43,16.52,16.51,16.423,16.41,16.47,16.45,16.32,16.36,16.34,16.59,16.54,16.52,
    16.44,16.47,16.5,16.45,16.28,16.07,16.08,16.1,16.1,16.09,16.43,16.49,16.59,16.65,16.78,16.86,16.86,16.76];
  let expected = [NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,0.05,0.01,-0.01,-0.02,-0.01,0.00,-0.01,0.00,
    0.03,0.09,0.12,0.13,0.13,0.12,0.05,-0.01,-0.06,-0.10,-0.14,-0.17,-0.18,-0.16];
  let macd = new TA([c,c,c,c,c,c], simpleFormat).macd(13,5,6);
  it('Finite test', () => assert.ok(macd.line.every(isFinite) && macd.signal.every(isFinite) && macd.hist.every(isFinite)));
  let delta = nrmse(expected.slice(19), macd.line.slice(19));
  it(`NRMSE test on macd line (${delta.toFixed(5)})`, () => assert.ok(delta < 2e-2));
})

describe('RSI', () => {
  let c = [58.18,58.57,58.48,58.43,58.32,58.05,57.96,57.64,57.83,58.05,58.54,58.11,58.46,57.77,56.77,56.93,57.40,57.57,57.13,56.30,
    55.95,56.17,56.52,56.80,57.72,56.46,56.58,55.73,55.28,55.18,54.78,54.88,54.04,54.04,54.73,53.69,53.49,53.32,53.60,54.75,
    54.35,54.86,53.90,54.76,55.58,55.81,56.55,57.40,57.69,57.88,58.67,58.51,57.45,57.02,57.25,56.59,57.34,57.04,58.34,58.09,
    58.47,59.08,58.96,59.10,57.58,57.68,57.49,57.22,55.78,56.31,53.7,53.36,50.15,52.57,50.42,52.64,53.1,53.88,53.43,53.11,
    50.5,49.59,49.77,51.82,52.23,51.38,52.67,54.13,54.49,54.58,54.08,52.81,52.82,54.16,53.91,52.72,53.39,54.1,54.88]
  let expected = [NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,34.97,37.27,43.60,45.73,41.37,34.66,32.28,35.29,
    39.86,43.31,52.88,42.34,43.49,37.73,35.08,34.50,32.20,33.40,28.81,28.81,37.04,31.19,30.20,29.35,32.71,44.42,41.70,46.22,
    39.95,46.90,52.55,54.02,58.50,62.95,64.36,65.29,68.92,67.38,58.13,54.84,56.27,51.27,56.05,53.77,61.13,59.18,61.21,64.27,
    63.21,63.96,51.71,52.35,50.96,48.96,39.96,44.04,32.38,31.22,22.88,36.62,31.29,40.86,42.65,45.64,44.21,43.17,35.78,33.63,
    34.47,43.29,44.89,42.23,47.33,52.45,53.64,53.95,51.87,46.91,46.95,52.50,51.42,46.51,49.44,52.41,55.51];
  let actual = new TA([c,c,c,c,c,c], simpleFormat).rsi(14);
  it('Finite test', () => assert.ok(actual.every(isFinite)));
  let delta = nrmse(expected.slice(14), actual.slice(14));
  it(`NRMSE test (${delta.toFixed(5)})`, () => assert.ok(delta < 1e-2));
})

describe('Stoch', () => {
  let h = [127.01,127.62,126.59,127.35,128.17,128.43,127.37,126.42,126.90,126.85,125.65,125.72,127.16,127.72,127.69,
    128.22,128.27,128.09,128.27,127.74,128.77,129.29,130.06,129.12,129.29,128.47,128.09,128.65,129.14,128.64];
  let l = [125.36,126.16,124.93,126.09,126.82,126.48,126.03,124.83,126.39,125.72,124.56,124.57,125.07,126.86,126.63,
    126.80,126.71,126.80,126.13,125.92,126.99,127.81,128.47,128.06,127.61,127.60,127.00,126.90,127.49,127.40];
  let c = [127.29,127.18,128.01,127.11,127.73,127.29,127.18,128.01,127.11,127.73,128.01,127.11,127.73,127.29,127.18,
    128.01,127.11,127.73,127.06,127.33,128.71,127.87,128.58,128.60,127.93,128.11,127.60,127.60,128.69,128.27];
  let expected = [NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,70.44,67.61,89.20,65.81,
    81.75,64.52,74.53,98.58,70.10,73.06,73.42,61.23,60.96,40.39,40.39,66.83,56.73];
  let actual = new TA([h,h,h,l,c,c], simpleFormat).stoch();
  it('Finite test', () => assert.ok(actual.line.every(isFinite) && actual.signal.every(isFinite)));
  let delta = nrmse(expected.slice(13), actual.line.slice(13));
  it(`NRMSE test (${delta.toFixed(5)})`, () => assert.ok(delta < 1e-2));
})

describe('StochRsi', () => {
  let c = [58.18,58.57,58.48,58.43,58.32,58.05,57.96,57.64,57.83,58.05,58.54,58.11,58.46,57.77,56.77,56.93,57.40,57.57,57.13,56.30,
    55.95,56.17,56.52,56.80,57.72,56.46,56.58,55.73,55.28,55.18,54.78,54.88,54.04,54.04,54.73,53.69,53.49,53.32,53.60,54.75,
    54.35,54.86,53.90,54.76,55.58,55.81,56.55,57.40,57.69,57.88,58.67,58.51,57.45,57.02,57.25,56.59,57.34,57.04,58.34,58.09,
    58.47,59.08,58.96,59.10,57.58,57.68,57.49,57.22,55.78,56.31,53.7,53.36,50.15,52.57,50.42,52.64,53.1,53.88,53.43,53.11,
    50.5,49.59,49.77,51.82,52.23,51.38,52.67,54.13,54.49,54.58,54.08,52.81,52.82,54.16,53.91,52.72,53.39,54.1,54.88];
  let expected = [NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,
    0.26,0.14,0.11,0.00,0.06,0.00,0.00,0.34,0.10,0.06,0.02,0.27,1.00,0.83,1.00,0.64,1.00,1.00,1.00,1.00,1.00,1.00,1.00,1.00,
    0.96,0.63,0.51,0.56,0.39,0.42,0.14,0.56,0.45,0.56,0.74,0.68,0.72,0.03,0.08,0.00,0.00,0.00,0.17,0.00,0.00,0.00,0.33,0.20,
    0.44,0.48,0.77,0.72,0.72,0.49,0.47,0.51,0.90,0.97,0.85,1.00,1.00,1.00,1.00,0.90,0.65,0.66,0.93,0.88,0.62,0.61,0.87,1.00];
  let actual = new TA([c,c,c,c,c,c], simpleFormat).stochRsi();
  it('Finite test', () => assert.ok(actual.line.every(isFinite) && actual.signal.every(isFinite)));
  let delta = nrmse(expected.slice(28), actual.line.slice(28));
  it(`NRMSE test (${delta.toFixed(5)})`, () => assert.ok(delta < 1e-2));
})

describe('MFI', () => {
  let t = [24.63,24.69,24.99,25.36,25.19,25.17,25.01,24.96,25.08,25.25,25.21,25.37,25.61,25.58,25.46,
    25.33,25.09,25.03,24.91,24.89,25.13,24.64,24.51,24.15,23.98,24.07,24.36,24.35,24.14,24.81];
  let v = [18.730,12.272,24.691,18.358,22.964,15.919,16.067,16.568,16.019,9.774,22.573,12.987,10.907,5.799,
    7.395,5.818,7.165,5.673,5.625,5.023,7.457,11.798,12.366,13.295,9.257,9.691,8.870,7.169,11.356,13.379];
  let expected = [NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,49.47,45.11,36.27,28.41,31.53,
    33.87,41.30,42.80,31.83,23.76,26.51,24.07,22.38,22.18,21.53,30.84];
  let actual = new TA([t,t,t,t,t,v], simpleFormat).mfi();
  it('Finite test', () => assert.ok(actual.slice(14).every(isFinite)));
  let delta = nrmse(expected.slice(14), actual.slice(14));
  it(`NRMSE test (${delta.toFixed(5)})`, () => assert.ok(delta < 1e-2));
})

describe('VI', () => {
  let h = [1380.39,1376.51,1362.34,1351.53,1343.98,1363.13,1389.19,1391.74,1387.16,1385.03,1375.13,1394.16,1399.63,1407.14,1404.14,
    1405.95,1405.98,1405.87,1410.03,1407.73,1417.44,1418.71,1418.13,1426.68,1416.12,1413.49,1413.46,1416.17,1413.63,1413.95];
  let l = [1371.21,1362.19,1337.56,1329.24,1331.50,1338.17,1360.05,1381.37,1379.17,1373.35,1354.65,1365.45,1391.04,1394.46,1396.13,
    1398.80,1395.62,1397.32,1400.60,1401.83,1404.15,1414.67,1412.12,1410.86,1406.78,1400.50,1398.04,1409.11,1405.59,1406.57];
  let c = [1376.51,1362.66,1350.52,1338.31,1337.89,1360.02,1385.97,1385.30,1379.32,1375.32,1365.00,1390.99,1394.23,1401.35,1402.22,
    1402.80,1405.87,1404.11,1403.93,1405.53,1415.51,1418.16,1418.13,1413.17,1413.49,1402.08,1411.13,1410.44,1409.30,1410.49];
  let expected1 = [NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,1.10,1.15,
    1.26,1.33,1.34,1.35,1.26,1.21,1.21,1.23,1.35,1.26,1.05,1.11,1.07,1.06];
  let expected2 = [NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,0.89,0.87,
    0.79,0.73,0.66,0.75,0.82,0.82,0.80,0.73,0.72,0.85,0.90,0.93,0.93,0.94]
  let actual = new TA([c,c,h,l,c,c], simpleFormat).vi();
  let delta1 = nrmse(expected1.slice(14), actual.plus.slice(14));
  let delta2 = nrmse(expected2.slice(14), actual.minus.slice(14));
  it('Finite test', () => assert.ok(actual.plus.slice(14).every(isFinite) && actual.minus.slice(14).every(isFinite)));
  it(`NRMSE test (${delta1.toFixed(5)}, ${delta2.toFixed(5)})`, () => assert.ok(delta1 + delta2 < 2e-2));
})

describe('CCI', () => {
  let h = [24.20,24.07,24.04,23.87,23.67,23.59,23.80,23.80,24.30,24.15,24.05,24.06,23.88,25.14,25.20,
    25.07,25.22,25.37,25.36,25.26,24.82,24.44,24.65,24.84,24.75,24.51,24.68,24.67,23.84,24.30];
  let l = [23.85,23.72,23.64,23.37,23.46,23.18,23.40,23.57,24.05,23.77,23.60,23.84,23.64,23.94,24.74,
    24.77,24.90,24.93,24.96,24.93,24.21,24.21,24.43,24.44,24.20,24.25,24.21,24.15,23.63,23.76];
  let c = [23.89,23.95,23.67,23.78,23.50,23.32,23.75,23.79,24.14,23.81,23.78,23.86,23.70,24.96,24.88,
    24.96,25.18,25.07,25.27,25.00,24.46,24.28,24.62,24.58,24.53,24.35,24.34,24.23,23.76,24.20];
  let expected = [NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,
    102.31,30.74,6.55,33.30,34.95,13.84,-10.75,-11.58,-29.35,-129.36,-73.07];
  let actual = new TA([h,h,h,l,c,c], simpleFormat).cci();
  it('Finite test', () => assert.ok(actual.every(isFinite)));
  let delta = nrmse(expected.slice(20), actual.slice(20));
  it(`NRMSE test (${delta.toFixed(5)})`, () => assert.ok(delta < 1e-2));
})

describe('OBV', () => {
  let c = [53.26,53.30,53.32,53.37,54.19,53.92,54.65,54.60];
  let v = [8000,8200,8100,8300,8900,9200,13300,10300];
  let expected = [0,8200,16300,24600,33500,24300,37600,27300];
  let actual = new TA([c,c,c,c,c,v], simpleFormat).obv();
  let delta = nrmse(expected, actual.line);
  it('Finite test', () => assert.ok(actual.line.every(isFinite)));
  it(`NRMSE test (${delta.toFixed(5)})`, () => assert.ok(delta < 1e-2));
  
})

describe('ADL', () => {
  let h = [62.34,62.05,62.27,60.79,59.93,61.75,60.00,59.00];
  let l = [61.37,60.69,60.10,58.61,58.71,59.86,57.97,58.02];
  let c = [62.15,60.81,60.45,59.18,59.24,60.20,58.48,58.24];
  let v = [7849,11692,10575,13059,20734,29630,17705,7259];
  let expected = [4774,-4855,-12019,-18249,-21006,-39976,-48785,-52785];
  let actual = new TA([c,c,h,l,c,v], simpleFormat).adl();
  let delta = nrmse(expected, actual);
  it('Finite test', () => assert.ok(actual.every(isFinite)));
  it(`NRMSE test (${delta.toFixed(5)})`, () => assert.ok(delta < 1e-2));
})

describe('ATR', () => {
  let h = [58.38,58.64,58.58,58.64,58.69,58.35,58.22,58.32,58.55,58.27,58.63,58.66,58.54,58.42,57.68,56.94,57.5,57.7,57.57,56.52,56.44,
    56.43,56.67,56.86,57.72,57.72,56.78,56.37,55.91,55.64,55.16,55.15,54.73,54.33,54.86,54.55,53.9,54.12,53.76,54.81,54.84,54.89,
    54.65,55.04,55.59,55.92,56.59,57.48,57.75,57.98,58.84,58.52,58.2,57.56,57.83,57.67,57.34,57.28,58.38,58.67,58.8,59.18,59.29,
    59.31,58.77,58.41,58.1,58.31,57.22,56.38,55.6,54.55,52.66,52.62,52.58,53.22,53.43,53.88,53.87,53.94,51.68,51.22,50.79,51.82,
    52.95,52.44,52.84,54.19,54.82,55.25,55.15,54.14,52.9,54.17,54.69,53.77,53.43,54.21,55.49];
  let l = [57.87,58.02,58.23,58.33,58.18,57.69,57.47,57.44,57.67,57.7,58.13,57.72,57.6,57.75,56.64,56.36,56.78,57.22,57.06,56.03,55.94,
    55.85,55.99,56.56,57.04,56.41,56.27,55.65,55.25,55.14,54.62,54.62,53.99,53.85,54.43,53.59,53.03,53.16,53.17,53.56,54.34,53.59,
    53.8,53.84,54.81,55.41,55.98,56.42,57.32,57.43,58.23,57.86,57.25,56.96,57.05,56.37,56.81,56.48,57.58,57.99,57.83,58.4,58.5,
    58.8,57.43,57.38,56.94,56.53,55.72,54.87,53.7,51.86,50.15,49.49,50.36,50.89,52.42,53.06,52.72,52.56,50.04,49.55,49.62,49.9,
    51.26,51.2,50.7,53.17,53.64,54.12,53.98,52.53,51.46,53.43,53.74,52.39,52.11,53.33,53.84];
  let c = [58.18,58.57,58.48,58.43,58.32,58.05,57.96,57.64,57.83,58.05,58.54,58.11,58.46,57.77,56.77,56.93,57.4,57.57,57.13,56.3,55.95,
    56.17,56.52,56.8,57.72,56.46,56.58,55.73,55.28,55.18,54.78,54.88,54.04,54.04,54.73,53.69,53.49,53.32,53.6,54.75,54.35,54.86,
    53.9,54.76,55.58,55.81,56.55,57.4,57.69,57.88,58.67,58.51,57.45,57.02,57.25,56.59,57.34,57.04,58.34,58.09,58.47,59.08,58.96,
    59.1,57.58,57.68,57.49,57.22,55.78,56.31,53.7,53.36,50.15,52.57,50.42,52.64,53.1,53.88,53.43,53.11,50.5,49.59,49.77,51.82,
    52.23,51.38,52.67,54.13,54.49,54.58,54.08,52.81,52.82,54.16,53.91,52.72,53.39,54.1,54.88];
  let expected = [NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,0.66,0.69,0.69,0.69,0.67,0.66,0.69,0.68,0.67,0.67,0.65,0.67,0.71,0.70,0.72,
    0.71,0.70,0.69,0.68,0.69,0.68,0.69,0.72,0.73,0.75,0.73,0.77,0.75,0.79,0.81,0.84,0.84,0.81,0.81,0.83,0.80,0.78,0.80,0.80,0.83,0.81,
    0.81,0.85,0.84,0.84,0.88,0.86,0.87,0.86,0.86,0.83,0.89,0.90,0.92,0.98,1.02,1.06,1.17,1.28,1.41,1.54,1.58,1.67,1.62,1.57,1.54,1.53,
    1.64,1.64,1.61,1.64,1.64,1.61,1.65,1.64,1.61,1.58,1.55,1.55,1.54,1.53,1.49,1.49,1.48,1.44,1.45];
  let actual = new TA([c,c,h,l,c,c], simpleFormat).atr();
  let delta = nrmse(expected.slice(13), actual.slice(13));
  it('Finite test', () => assert.ok(actual.every(isFinite)));
  it(`NRMSE test (${delta.toFixed(5)})`, () => assert.ok(delta < 2e-2));
})

describe('Williams', () => {
  let h = [127.01,127.62,126.59,127.35,128.17,128.43,127.37,126.42,126.90,126.85,125.65,125.72,127.16,127.72,127.69,
    128.22,128.27,128.09,128.27,127.74,128.77,129.29,130.06,129.12,129.29,128.47,128.09,128.65,129.14,128.64];
  let l = [125.36,126.16,124.93,126.09,126.82,126.48,126.03,124.83,126.39,125.72,124.56,124.57,125.07,126.86,126.63,
    126.80,126.71,126.80,126.13,125.92,126.99,127.81,128.47,128.06,127.61,127.60,127.00,126.90,127.49,127.40];
  let c = [127.29,127.18,128.01,127.11,127.73,127.29,127.18,128.01,127.11,127.73,128.01,127.11,127.73,127.29,127.18,
    128.01,127.11,127.73,127.06,127.33,128.71,127.87,128.58,128.60,127.93,128.11,127.60,127.60,128.69,128.27];
  let expected = [NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,-29.46,-32.30,-10.85,-34.11,
    -18.09,-35.40,-25.34,-1.43,-30.02,-26.91,-26.55,-38.80,-39.08,-59.42,-59.42,-33.09,-43.24];
  let actual = new TA([h,h,h,l,c,c], simpleFormat).williams();
  it('Finite test', () => assert.ok(actual.slice(13).every(isFinite)));
  let delta = nrmse(expected.slice(13), actual.slice(13));
  it(`NRMSE test (${delta.toFixed(5)})`, () => assert.ok(delta < 1e-2));
})

describe('ROC', () => {
  let c = [11045.27,11167.32,11008.61,11151.83,10926.77,10868.12,10520.32,10380.43,10785.14,10748.26,
    10896.91,10782.95,10620.16,10625.83,10510.95,10444.37,10068.01,10193.39,10066.57,10043.75];
  let expected = [NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,-3.85,-4.85,-4.52,-6.34,-7.86,-6.21,-4.31,-3.24];
  let actual = new TA([c,c,c,c,c,c], simpleFormat).roc(13);
  it('Finite test', () => assert.ok(actual.slice(12).every(isFinite)));
  let delta = nrmse(expected.slice(12), actual.slice(12));
  it(`NRMSE test (${delta.toFixed(5)})`, () => assert.ok(delta < 1e-2));
})