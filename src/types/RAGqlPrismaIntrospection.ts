import { Resource } from '../constants/interfaces';
import { RAGqlPrismaFilter } from './RAGqlPrismaFilter';
import { CREATE, DELETE, GET_LIST, GET_MANY, GET_MANY_REFERENCE, GET_ONE, UPDATE } from './ra-core';

export declare type RAGqlPrismaIntrospection = {
  operationNames: {
    [GET_LIST]: (resource: Resource) => string;
    [GET_ONE]: (resource: Resource) => string;
    [GET_MANY]: (resource: Resource) => string;
    [GET_MANY_REFERENCE]: (resource: Resource) => string;
    [CREATE]: (resource: Resource) => string;
    [UPDATE]: (resource: Resource) => string;
    [DELETE]: (resource: Resource) => string;
  };
  exclude?: RAGqlPrismaFilter;
  include?: RAGqlPrismaFilter;
};
