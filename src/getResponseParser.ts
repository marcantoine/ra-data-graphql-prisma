import { TypeKind, IntrospectionObjectType, IntrospectionField } from 'graphql';
import { GET_LIST, GET_MANY, GET_MANY_REFERENCE } from 'react-admin';
import getFinalType from './utils/getFinalType';
import { IntrospectionResult, Resource } from './constants/interfaces';

const sanitizeResource = (
  introspectionResults: IntrospectionResult,
  resource: Resource,
  fieldLookup?: Function
) => (data: { [key: string]: any }): any => {
  console.log('data', data)
  console.log('introspectionResults', introspectionResults)
  console.log('resource', resource)
  return Object.keys(data).reduce((acc, key) => {
    if (key.startsWith('_')) {
      return acc;
    }

    const field: IntrospectionField = (resource.type as IntrospectionObjectType).fields.find(
      field => {
        console.log('f.name', field.name, key)
        return field.name === (fieldLookup ? fieldLookup(field, key, acc, introspectionResults) : key)
      }
    )!;
      console.log('field', field)
      console.log('type', field.type)
    const type = getFinalType(field.type);

    if (type.kind !== TypeKind.OBJECT) {
      return { ...acc, [field.name]: data[field.name] };
    }

    // FIXME: We might have to handle linked types which are not resources but will have to be careful about endless circular dependencies
    const linkedResource = introspectionResults.resources.find(
      r => r.type.name === type.name
    );

    if (linkedResource) {
      const linkedResourceData = data[field.name];

      if (Array.isArray(linkedResourceData)) {
        return {
          ...acc,
          [field.name]: data[field.name].map(
            sanitizeResource(introspectionResults, linkedResource)
          ),
          [`${field.name}Ids`]: data[field.name].map(
            (d: { id: string }) => d.id
          )
        };
      }

      return {
        ...acc,
        [`${field.name}.id`]: linkedResourceData
          ? data[field.name].id
          : undefined,
        [field.name]: linkedResourceData
          ? sanitizeResource(introspectionResults, linkedResource)(
            data[field.name]
          )
          : undefined
      };
    }

    return { ...acc, [field.name]: data[field.name] };
  }, {});
};

export default (introspectionResults: IntrospectionResult, fieldLookup?: Function) => (
  aorFetchType: string,
  resource: Resource
) => (response: { [key: string]: any }) => {
  const sanitize = sanitizeResource(introspectionResults, resource, fieldLookup);
  const data = response.data;

  if (
    aorFetchType === GET_LIST ||
    aorFetchType === GET_MANY ||
    aorFetchType === GET_MANY_REFERENCE
  ) {
    return {
      data: response.data.items.map(sanitize),
      total: response.data.total.aggregate.count
    };
  }

  return { data: sanitize(data.data) };
};
