export type TypeSkipFirstArg<TFunction> = TFunction extends (
  params: infer FirstArgument,
  ...args: infer OtherArguments
) => infer ResultType
  ? (...args: OtherArguments) => ResultType
  : unknown;
