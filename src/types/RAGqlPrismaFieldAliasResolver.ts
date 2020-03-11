import { IntrospectionField } from 'graphql';
import { IntrospectionResult } from '../constants/interfaces';

export declare type RAGqlPrismaFieldAliasResolver = (field: IntrospectionField, fieldName: string, acc: object, introspectionResults: IntrospectionResult) => string;
