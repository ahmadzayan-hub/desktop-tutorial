import type { en } from "./en";

/**
 * Widen the `as const` English dictionary into structural string types while
 * preserving object/tuple shape. This lets ar.ts carry different string values
 * but forces it to keep the exact same keys and array lengths as en.ts.
 */
export type Widen<T> = T extends string
  ? string
  : { [K in keyof T]: Widen<T[K]> };

export type Dict = Widen<typeof en>;
