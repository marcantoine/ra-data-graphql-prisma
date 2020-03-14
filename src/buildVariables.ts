/* eslint-disable @typescript-eslint/camelcase */
import { IntrospectionField, IntrospectionInputObjectType, IntrospectionNamedTypeRef, IntrospectionObjectType } from 'graphql';
import isDate from 'lodash/isDate';
import isObject from 'lodash/isObject';
import { CREATE, DELETE, GET_LIST, GET_MANY, GET_MANY_REFERENCE, GET_ONE, UPDATE } from 'ra-core';
import { IntrospectionResult, Resource } from './constants/interfaces';

import { PRISMA_CONNECT, PRISMA_DISCONNECT, PRISMA_SET, PRISMA_UPDATE } from './constants/mutations';
import { CreateParams, DeleteParams, GetListParams, GetManyParams, GetManyReferenceParams, GetOneParams, Params, UpdateParams } from './types/Params';
import { RAGqlPrismaFieldAliasResolver } from './types/RAGqlPrismaFieldAliasResolver';
import { computeFieldsToAddRemoveUpdate } from './utils/computeAddRemoveUpdate';

import getFinalType from './utils/getFinalType';

//TODO: Object filter weren't tested yet
const buildGetListVariables = (introspectionResults: IntrospectionResult) => (
  resource: Resource,
  aorFetchType: string,
  params: GetListParams,
) => {
  const filter = Object.keys(params.filter).reduce((acc, key) => {
    if (key === 'ids') {
      return { ...acc, id_in: params.filter[key] };
    }

    if (Array.isArray(params.filter[key])) {

      const type = introspectionResults.types.find(
        (t) => t.name === `${resource.type.name}WhereInput`,
      ) as IntrospectionInputObjectType;
      const inputField = type.inputFields.find((t) => t.name === key);

      if (!!inputField) {
        return {
          ...acc,
          [key]: { id_in: params.filter[key] },
        };
      }
    }

    if (isObject(params.filter[key])) {

      const type = introspectionResults.types.find(
        (t) => t.name === `${resource.type.name}WhereInput`,
      ) as IntrospectionInputObjectType;
      const filterSome = type.inputFields.find((t) => t.name === `${key}_some`);

      if (filterSome) {
        const filter = Object.keys(params.filter[key]).reduce(
          (acc, k: string) => ({
            ...acc,
            [`${k}_in`]: params.filter[key][k] as string[],
          }),
          {} as { [key: string]: string[] },
        );
        return { ...acc, [`${key}_some`]: filter };
      }
    }

    const parts = key.split('.');

    if (parts.length > 1) {
      if (parts[1] == 'id') {
        const type = introspectionResults.types.find(
          (t) => t.name === `${resource.type.name}WhereInput`,
        ) as IntrospectionInputObjectType;
        const filterSome = type.inputFields.find(
          (t) => t.name === `${parts[0]}_some`,
        );

        if (filterSome) {
          return {
            ...acc,
            [`${parts[0]}_some`]: { id: params.filter[key] },
          };
        }

        return { ...acc, [parts[0]]: { id: params.filter[key] } };
      }

      const resourceField = (resource.type as IntrospectionObjectType).fields.find(
        (f) => f.name === parts[0],
      )!;
      if ((resourceField.type as IntrospectionNamedTypeRef).name === 'Int') {
        return { ...acc, [key]: parseInt(params.filter[key]) };
      }
      if ((resourceField.type as IntrospectionNamedTypeRef).name === 'Float') {
        return { ...acc, [key]: parseFloat(params.filter[key]) };
      }
    }

    return { ...acc, [key]: params.filter[key] };
  }, {});

  return {
    skip: (params.pagination.page - 1) * params.pagination.perPage,
    first: params.pagination.perPage,
    orderBy: `${params.sort.field}_${params.sort.order}`,
    where: filter,
  };
};

const findInputFieldForType = (
  introspectionResults: IntrospectionResult,
  typeName: string,
  field: string,
): IntrospectionNamedTypeRef | null => {
  const type = introspectionResults.types.find(
    (t) => t.name === typeName,
  ) as IntrospectionInputObjectType;

  if (!type) {
    return null;
  }
  // if field fish with Ids, its an array of relation

  const inputFieldType = type.inputFields.find((t) => t.name === field);

  return !!inputFieldType ? getFinalType(inputFieldType.type) : null;
};

const inputFieldExistsForType = (
  introspectionResults: IntrospectionResult,
  typeName: string,
  field: string,
): boolean => {
  return !!findInputFieldForType(introspectionResults, typeName, field);
};

const buildReferenceField = (
  {
    inputArg,
    introspectionResults,
    typeName,
    field,
    mutationType,
  }: {
    inputArg: { [key: string]: any };
    introspectionResults: IntrospectionResult;
    typeName: string;
    field: string;
    mutationType: string;
  }) => {
  const inputType: IntrospectionNamedTypeRef | null = findInputFieldForType(
    introspectionResults,
    typeName,
    field,
  );
  const mutationInputType: IntrospectionNamedTypeRef | null = findInputFieldForType(
    introspectionResults,
    inputType!.name,
    mutationType,
  );

  return Object.keys(inputArg).reduce((acc, key) => {
    if (!mutationInputType) {
      console.error(`Couldn't find a GraphQL mutation type of type "${mutationType}" for "${inputType?.name}" input type through introspection. Field "${field}" has been ignored.`);
      return acc;
    }
    return ((Object.keys(acc).length === 0) && inputFieldExistsForType(
      introspectionResults,
      mutationInputType!.name,
      key,
    ))
      ? { ...acc, [key]: inputArg[key] }
      : acc;
  }, {});
};

const buildUpdateVariables = (introspectionResults: IntrospectionResult) => (
  resource: Resource,
  aorFetchType: string,
  params: UpdateParams,
  fieldAliasResolver?: RAGqlPrismaFieldAliasResolver,
) => {
  return Object.keys(params.data).reduce(
    (acc, fieldName: string) => {
      let value: any | any[] = params.data[fieldName];
      let previousValue: any | any[] = params.previousData[fieldName];

      if (Array.isArray(value)) {

        // if key finish with Ids, its an array of relation
        if (/Ids$/.test(fieldName)) {
          previousValue = params.previousData[fieldName].map((id: string) => ({ id }));
          //we remove Ids form field
          fieldName = fieldName.replace(/Ids$/, '');
          //and put id in the array
          value = value.map((id: string) => ({ id }));
        }

        const inputType = findInputFieldForType(
          introspectionResults,
          `${resource.type.name}UpdateInput`,
          fieldName,
        );

        if (!inputType) {
          return acc;
        }

        // if its an array, it can be an array of relation or an array of Scalar
        // we check the corresponding input in introspectionresult to know if it use "set" or something else

        const hasConnectMethod = findInputFieldForType(
          introspectionResults,
          inputType.name,
          'connect',
        );
        if (!hasConnectMethod) {
          return {
            ...acc,
            data: {
              ...acc.data,
              [fieldName]: {
                [PRISMA_SET]: value,
              },
            },
          };
        }

        //if key connect already exist we dont do anything
        const {
          fieldsToAdd,
          fieldsToRemove,
        } = computeFieldsToAddRemoveUpdate(
          previousValue,
          value,
        );
        return {
          ...acc,
          data: {
            ...acc.data,
            [fieldName]: {
              [PRISMA_CONNECT]: fieldsToAdd,
              [PRISMA_DISCONNECT]: fieldsToRemove,
            },
          },
        };
      }

      if (isObject(value) && !isDate(value)) {

        const fieldsToConnect = buildReferenceField({
          inputArg: value,
          introspectionResults,
          typeName: `${resource.type.name}UpdateInput`,
          field: fieldName,
          mutationType: PRISMA_CONNECT,
        });
        const fieldsToUpdate = buildReferenceField({
          inputArg: value,
          introspectionResults,
          typeName: `${resource.type.name}UpdateInput`,
          field: fieldName,
          mutationType: PRISMA_UPDATE,
        });

        // XXX We allow either a connect or an update, if there is a node connection, then it gets the priority over node update
        //  I don't see how we could have both a connect and an update at the same time (for the same field), it wouldn't make any sense
        if (Object.keys(fieldsToConnect).length === 0) {
          if (Object.keys(fieldsToUpdate).length === 0) {
            // If no fields in the object are valid, continue
            return acc;
          } else {
            // Else, update the nodes
            return {
              ...acc,
              data: {
                ...acc.data,
                [fieldName]: { [PRISMA_UPDATE]: { ...fieldsToUpdate } },
              },
            };
          }
        } else {
          // Else, connect the nodes
          return {
            ...acc,
            data: {
              ...acc.data,
              [fieldName]: { [PRISMA_CONNECT]: { ...fieldsToConnect } },
            },
          };
        }
      }

      // Put id field in a where object
      if (fieldName === 'id' && value) {
        return {
          ...acc,
          where: {
            id: value,
          },
        };
      }

      const type = introspectionResults.types.find(
        (t) => t.name === resource.type.name,
      ) as IntrospectionObjectType;

      // XXX The original author checked if the field is defined in the schema (through introspection),
      //  but with GraphCMS it's more complicated because localised fields don't appear in the schema and cannot be resolved this way
      //  We use the same fieldAliasResolver to resolve whether the field is an alias, and if it is then we include it in the mutation
      let field: IntrospectionField | undefined = type.fields.find((t: IntrospectionField) => t.name === fieldName);

      if (!field) {
        if (typeof field === 'undefined' && fieldAliasResolver) {
          // The field wasn't resolved, it's likely an alias, try to resolve alias
          field = (resource.type as IntrospectionObjectType).fields.find(
            (field: IntrospectionField) => {
              return field.name === fieldAliasResolver(field, fieldName, acc, introspectionResults);
            },
          );
        }
      }

      if (field) {
        // Rest should be put in data object

        return {
          ...acc,
          data: {
            ...acc.data,
            [fieldName]: value,
          },
        };
      }

      return acc;
    },
    {} as { [key: string]: any },
  );
};

const buildCreateVariables = (introspectionResults: IntrospectionResult) => (
  resource: Resource,
  aorFetchType: string,
  params: CreateParams,
  fieldAliasResolver?: RAGqlPrismaFieldAliasResolver,
) => {
  return Object.keys(params.data).reduce(
    (acc, fieldName: string) => {
      let data = params.data[fieldName];
      if (Array.isArray(data)) {

        // if key finish with Ids, its an array of relation
        if (/Ids$/.test(fieldName)) {
          //we remove Ids form field
          fieldName = fieldName.replace(/Ids$/, '');
          //and put id in the array
          data = data.map((id: string) => ({ id }));
        }

        const entryIsObject = data.some((entry: any) => isObject(entry) && !isDate(entry));

        if (entryIsObject) {
          data = data.map((entry: any) => Object.keys(entry)
            .reduce((obj: any, key: any) => {
              if (key === 'id') {
                obj[key] = entry[key];
              }
              return obj;
            }, {}));
        }

        const inputType = findInputFieldForType(
          introspectionResults,
          `${resource.type.name}CreateInput`,
          fieldName,
        );
        if (!inputType) {
          return acc;
        }

        // if its an array, it can be an array of relation or an array of Scalar
        // we check the corresponding input in introspectionresult to know if it use "set" or something else

        const hasSetMethod = findInputFieldForType(
          introspectionResults,
          inputType.name,
          'set',
        );

        if (hasSetMethod) {
          return {
            ...acc,
            data: {
              ...acc.data,
              [fieldName]: {
                [PRISMA_SET]: data,
              },
            },
          };
        }

        return {
          ...acc,
          data: {
            ...acc.data,
            [fieldName]: {
              [PRISMA_CONNECT]: data,
            },
          },
        };
      }

      if (isObject(data) && !isDate(data)) {
        const fieldsToConnect = buildReferenceField({
          inputArg: data,
          introspectionResults,
          typeName: `${resource.type.name}CreateInput`,
          field: fieldName,
          mutationType: PRISMA_CONNECT,
        });
        // If no fields in the object are valid, continue
        if (Object.keys(fieldsToConnect).length === 0) {
          return acc;
        }

        // Else, connect the nodes
        return {
          ...acc,
          data: {
            ...acc.data,
            [fieldName]: { [PRISMA_CONNECT]: { ...fieldsToConnect } },
          },
        };
      }

      // Put id field in a where object
      if (fieldName === 'id' && params.data[fieldName]) {
        return {
          ...acc,
          where: {
            id: params.data[fieldName],
          },
        };
      }

      const type = introspectionResults.types.find(
        (t) => t.name === resource.type.name,
      ) as IntrospectionObjectType;

      // XXX The original author checked if the field is defined in the schema (through introspection),
      //  but with GraphCMS it's more complicated because localised fields don't appear in the schema and cannot be resolved this way
      //  We use the same fieldAliasResolver to resolve whether the field is an alias, and if it is then we include it in the mutation
      let field: IntrospectionField | undefined = type.fields.find((t: IntrospectionField) => t.name === fieldName);

      if (!field) {
        if (typeof field === 'undefined' && fieldAliasResolver) {
          // The field wasn't resolved, it's likely an alias, try to resolve alias
          field = (resource.type as IntrospectionObjectType).fields.find(
            (field: IntrospectionField) => {
              return field.name === fieldAliasResolver(field, fieldName, acc, introspectionResults);
            },
          );
        }
      }

      if (field) {
        // Rest should be put in data object
        return {
          ...acc,
          data: {
            ...acc.data,
            [fieldName]: data,
          },
        };
      }

      return acc;
    },
    {} as { [key: string]: any },
  );
};

export default (introspectionResults: IntrospectionResult) => (
  resource: Resource,
  aorFetchType: string,
  params: Params,
  fieldAliasResolver?: RAGqlPrismaFieldAliasResolver,
) => {
  switch (aorFetchType) {
    case GET_LIST: {
      return buildGetListVariables(introspectionResults)(
        resource,
        aorFetchType,
        params as GetListParams,
      );
    }
    case GET_MANY:
      return {
        where: { id_in: (params as GetManyParams).ids },
      };
    case GET_MANY_REFERENCE: {
      const parts = (params as GetManyReferenceParams).target.split('.');

      return {
        where: { [parts[0]]: { id: (params as GetOneParams).id } },
      };
    }
    case GET_ONE:
      return {
        where: { id: (params as GetOneParams).id },
      };
    case UPDATE: {
      return buildUpdateVariables(introspectionResults)(
        resource,
        aorFetchType,
        params as UpdateParams,
        fieldAliasResolver,
      );
    }

    case CREATE: {
      return buildCreateVariables(introspectionResults)(
        resource,
        aorFetchType,
        params as CreateParams,
        fieldAliasResolver,
      );
    }

    case DELETE:
      return {
        where: { id: (params as DeleteParams).id },
      };
  }
};
