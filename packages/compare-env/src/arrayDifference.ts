export function arrayDifference(first: Array<string>, second: Array<string>): Array<string> {
  return first.filter((x) => !second.includes(x)).concat(second.filter((x) => !first.includes(x)));
}
