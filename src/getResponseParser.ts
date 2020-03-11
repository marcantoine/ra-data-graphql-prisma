import { IntrospectionField, IntrospectionObjectType, TypeKind } from 'graphql';
import { GET_LIST, GET_MANY, GET_MANY_REFERENCE } from 'ra-core';
import { IntrospectionResult, Resource } from './constants/interfaces';
import { ApolloResponse } from './types/ApolloResponse';
import { ApolloResponseData, MultipleRecordsResponse, SingleRecordResponse } from './types/ApolloResponseData';
import { GqlRecord } from './types/GqlRecord';
import { GetResponseParserSignature, ResponseParserResult, ResponseParserSignature } from './types/ResponseParser';
import getFinalType from './utils/getFinalType';

declare type Sanitize = (record: GqlRecord) => any;

const sanitizeResource = (
  introspectionResults: IntrospectionResult,
  resource: Resource,
  fieldAliasResolver?: Function,
) => (record: GqlRecord): any => {
  return Object.keys(record).reduce((acc, fieldName: string) => {
    if (fieldName.startsWith('_')) {
      return acc;
    }

    let field: IntrospectionField | undefined = (resource.type as IntrospectionObjectType).fields.find(
      (field) => {
        return field.name === fieldName; // Aliased fields won't be found through such simple comparison (ie: myTitle: title)
      },
    );
    if (typeof field === 'undefined' && fieldAliasResolver) {
      // The field wasn't resolved, it's likely an alias, try to resolve alias
      const fieldAlias: IntrospectionField | undefined = (resource.type as IntrospectionObjectType).fields.find(
        (field) => {
          return field.name === fieldAliasResolver(field, fieldName, acc, introspectionResults);
        },
      );

      // If alias is found, copy alias property but keep the actual field name
      if (fieldAlias) {
        field = {
          ...fieldAlias,
          name: fieldName,
        };
      }
    }
    if (typeof field === 'undefined') {
      // The field wasn't resolved still, ignore it
      // eslint-disable-next-line no-console
      console.error(`Field "${fieldName}" couldn't be resolved from introspection using resource "${resource.type.name}":`, resource);
      return acc;
    }
    const type = getFinalType(field.type);

    if (type.kind !== TypeKind.OBJECT) {
      return { ...acc, [field.name]: record[field.name] };
    }

    // FIXME: We might have to handle linked types which are not resources but will have to be careful about endless circular dependencies
    const linkedResource = introspectionResults.resources.find(
      (r) => r.type.name === type.name,
    );

    if (linkedResource) {
      const linkedResourceData = record[field.name];

      if (Array.isArray(linkedResourceData)) {
        return {
          ...acc,
          [field.name]: record[field.name].map(
            sanitizeResource(introspectionResults, linkedResource),
          ),
          [`${field.name}Ids`]: record[field.name].map(
            (d: { id: string }) => d.id,
          ),
        };
      }

      return {
        ...acc,
        [`${field.name}.id`]: linkedResourceData
          ? record[field.name].id
          : undefined,
        [field.name]: linkedResourceData
          ? sanitizeResource(introspectionResults, linkedResource)(
            record[field.name],
          )
          : undefined,
      };
    }

    return { ...acc, [field.name]: record[field.name] };
  }, {});
};

export default (introspectionResults: IntrospectionResult, fieldAliasResolver?: Function): GetResponseParserSignature => (
  aorFetchType: string,
  resource: Resource,
): ResponseParserSignature => (response: ApolloResponse): ResponseParserResult => {
  const sanitize: Sanitize = sanitizeResource(introspectionResults, resource, fieldAliasResolver);

  if (
    aorFetchType === GET_LIST ||
    aorFetchType === GET_MANY ||
    aorFetchType === GET_MANY_REFERENCE
  ) {
    const data: ApolloResponseData<MultipleRecordsResponse> = response.data as MultipleRecordsResponse;

    return {
      data: data.items.map(sanitize),
      total: data.total.aggregate.count,
    };
  } else {
    const data: ApolloResponseData<SingleRecordResponse> = response.data as SingleRecordResponse;

    return { data: sanitize(data.data) };
  }
};
