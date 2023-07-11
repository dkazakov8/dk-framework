export type TypeActionLog = {
  name: string;
  type: 'ACTION' | 'API';
  executionTime?: number;
  routeName: string;
};
