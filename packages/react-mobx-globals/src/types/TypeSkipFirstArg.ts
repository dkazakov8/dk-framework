export type TypeSkipFirstArg<TFunction> = TFunction extends (
  // biome-ignore lint/correctness/noUnusedVariables: false
  params: infer FirstArgument,
  ...args: infer OtherArguments
) => infer ResultType
  ? (...args: OtherArguments) => ResultType
  : unknown;
