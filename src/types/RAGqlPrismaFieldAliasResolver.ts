import { IntrospectionField } from 'graphql';
import { IntrospectionResult } from '../constants/interfaces';

/**
 * Optional, used as fallback field resolver when aliases are used
 *
 * @example Useful with GraphCMS for localised fields, because localised fields aren't described in the GraphQL schema
 * For instance, having a localised field named "title" will create a "title" entry in the schema, but a titleFR and titleEN (titleEN: String) for mutations
 * Also, you may want to use an alias with queries (titleFR: title(locale: FR))
 *
 * @example return isLocalisedField(fieldName) ? getLocalisedFieldAlias(fieldName) : fieldName;
 */
export declare type RAGqlPrismaFieldAliasResolver = (field: IntrospectionField, fieldName: string, acc: object, introspectionResults: IntrospectionResult) => string;
