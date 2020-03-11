/**
 * Graphql query variables
 *
 * We use "where" and "data", but other keys are possible
 *
 * I believe variable can only contain scalar types, but that could be wrong
 *
 * @example {id: 'value'}
 */
export declare type GqlVariables = {
  // @ts-ignore
  where?: {
    [key: string]: string | number | boolean;
  };
  // @ts-ignore
  data?: {
    [key: string]: string | number | boolean;
  };
  [key: string]: string | number | boolean | {
    [key: string]: string | number | boolean;
  }; // eslint-disable-line @typescript-eslint/no-explicit-any
};
