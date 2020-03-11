/**
 * Graphql server record
 *
 * Returned by the GraphQL API
 * Used by react-admin
 */
export type GqlRecord = {
  id: string;
  __typename: string;
  [key: string]: any; // eslint-disable-line @typescript-eslint/no-explicit-any
};
