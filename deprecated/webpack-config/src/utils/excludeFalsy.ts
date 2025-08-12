export const excludeFalsy = Boolean as unknown as <T>(x: T | false | null | undefined) => x is T;
