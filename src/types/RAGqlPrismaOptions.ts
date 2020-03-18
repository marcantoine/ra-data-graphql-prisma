import { ApolloClient, ApolloClientOptions } from 'apollo-client';
import { IntrospectionResult } from '../constants/interfaces';
import { BuildQueryFactorySignature } from './BuildQuery';
import { RAGqlPrismaFieldAliasResolver } from './RAGqlPrismaFieldAliasResolver';
import { RAGqlPrismaIntrospection } from './RAGqlPrismaIntrospection';

/**
 * Options of the main function
 * None are required because of default values
 */
export declare type RAGqlPrismaOptions = {
  buildQuery?: (
    introspectionResults: IntrospectionResult,
    fieldAliasResolver?: RAGqlPrismaFieldAliasResolver,
  ) => BuildQueryFactorySignature;
  introspection?: RAGqlPrismaIntrospection;
  client?: ApolloClient<any>;
  clientOptions?: ApolloClientOptions<any>;
  debug?: boolean;
  handleError?: (e: Error, origin: string) => any;
}
