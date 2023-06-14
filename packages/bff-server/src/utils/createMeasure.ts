import { measuresServer } from './measuresServer';

export type TypeMeasures = Record<keyof typeof measuresServer, number | bigint>;

export function bigIntToMs(bigInt: bigint) {
  const BIGINT_ROUNDER = 1000000;
  const TIMING_PRECISION = 3;

  return Number((Number(bigInt) / BIGINT_ROUNDER).toFixed(TIMING_PRECISION));
}

export function createMeasure() {
  const measures: TypeMeasures = {} as any;

  return {
    wrap(name: keyof typeof measuresServer) {
      return (promiseReturnData: any) => {
        const currentTime = process.hrtime.bigint();
        const startMark = measures[name];

        if (!startMark) {
          measures[name] = currentTime;
        } else {
          measures[name] = bigIntToMs(currentTime - (startMark as bigint));
        }

        return promiseReturnData;
      };
    },
    getMeasures(): TypeMeasures {
      return measures;
    },
  };
}
