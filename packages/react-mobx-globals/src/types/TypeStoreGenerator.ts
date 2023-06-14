import { TypeStoreItem } from './TypeStoreItem';

export type TypeStoreGenerator<
  TStaticStores extends TypeStoreItem,
  TModularStores extends Record<string, TypeStoreItem>
> = {
  [TStoreFileName in keyof TStaticStores]: InstanceType<TStaticStores[TStoreFileName]>;
} & {
  [Key in keyof TModularStores]: {
    [Key2 in keyof TModularStores[Key]]: InstanceType<TModularStores[Key][Key2]>;
  };
};
