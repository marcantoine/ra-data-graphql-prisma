/**
 * Graphql query variables
 *
 * I believe variable can only contain scalar types, but that could be wrong
 *
 * @example {id: 'value'}
 */
export type GqlVariables = {
  [key: string]: string | number | boolean; // eslint-disable-line @typescript-eslint/no-explicit-any
};
