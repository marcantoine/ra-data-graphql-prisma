import { TypeKind, IntrospectionObjectType, IntrospectionField } from 'graphql';
import { GET_LIST, GET_MANY, GET_MANY_REFERENCE } from 'react-admin';
import getFinalType from './utils/getFinalType';
import { IntrospectionResult, Resource } from './constants/interfaces';

const sanitizeResource = (
  introspectionResults: IntrospectionResult,
  resource: Resource,
  fieldAliasResolver?: Function,
) => (data: { [key: string]: any }): any => {
  return Object.keys(data).reduce((acc, key) => {
    if (key.startsWith('_')) {
      return acc;
    }

    let field: IntrospectionField | undefined = (resource.type as IntrospectionObjectType).fields.find(
      field => {
        return field.name === key; // Aliased fields won't be found through such simple comparison (ie: myTitle: title)
      }
    );
    if(typeof field === 'undefined' && fieldAliasResolver){
      // The field wasn't resolved, it's likely an alias, try to resolve alias
      const fieldAlias: IntrospectionField | undefined = (resource.type as IntrospectionObjectType).fields.find(
        field => {
          return field.name === fieldAliasResolver(field, key, acc, introspectionResults);
        }
      );

      // If alias is found, copy alias property but keep the actual field name
      if(fieldAlias){
        field = {
          ...fieldAlias,
          name: key,
        }
      }
    }
    if (typeof field === 'undefined') {
      // The field wasn't resolved still, ignore it
      console.error(`Field "${key}" couldn't be resolved from introspection using resource "${resource.type.name}":`, resource);
      return acc;
    }
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

export default (introspectionResults: IntrospectionResult, fieldAliasResolver?: Function) => (
  aorFetchType: string,
  resource: Resource
) => (response: { [key: string]: any }) => {
  const sanitize = sanitizeResource(introspectionResults, resource, fieldAliasResolver);
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
