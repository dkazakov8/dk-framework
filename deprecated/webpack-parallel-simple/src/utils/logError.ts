export function logError(err: Error) {
  console.error(err.stack || err.message);

  // @ts-ignore
  if (err.details) console.error(err.details);

  process.exit(1);
}
