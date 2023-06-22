const BIGINT_ROUNDER = 1000000;
const TIMING_PRECISION = 3;

export const getCurrentTime = () => {
  return typeof window !== undefined
    ? performance.now()
    : Number((Number(process.hrtime.bigint()) / BIGINT_ROUNDER).toFixed(TIMING_PRECISION));
};
