import { DocumentNode } from 'graphql';

import buildGqlQuery, { Query } from './buildGqlQuery';
import buildVariables from './buildVariables';
import { IntrospectionResult } from './constants/interfaces';
import getResponseParser from './getResponseParser';
import { BuildQueryFactorySignature, BuildQueryResult } from './types/BuildQuery';
import { GqlVariables } from './types/GqlVariables';
import { Params } from './types/Params';
import { RAGqlPrismaFieldAliasResolver } from './types/RAGqlPrismaFieldAliasResolver';

export const buildQueryFactory = () => (
  introspectionResults: IntrospectionResult,
  fieldAliasResolver?: RAGqlPrismaFieldAliasResolver,
): BuildQueryFactorySignature => {
  const knownResources = introspectionResults.resources.map((r) => r.type.name);

  return (
    aorFetchType: string,
    resourceName: string,
    params: Params,
    fragment: DocumentNode,
  ): BuildQueryResult => {
    const resource = introspectionResults.resources.find(
      (r) => r.type.name === resourceName,
    );

    if (!resource) {
      throw new Error(
        `Unknown resource ${resourceName}. Make sure it has been declared on your server side schema. Known resources are ${knownResources.join(
          ', ',
        )}`,
      );
    }
    const queryType: Query = resource[aorFetchType];

    if (!queryType) {
      throw new Error(
        `No query or mutation matching aor fetch type ${aorFetchType} could be found for resource ${resource.type.name}`,
      );
    }
    const variables: GqlVariables = buildVariables(introspectionResults)(
      resource,
      aorFetchType,
      params,
    )!;
    const query: DocumentNode = buildGqlQuery(introspectionResults)(
      resource,
      aorFetchType,
      queryType,
      variables,
      fragment,
    );
    const parseResponse = getResponseParser(introspectionResults, fieldAliasResolver)(
      aorFetchType,
      resource,
    );

    return {
      query,
      variables,
      parseResponse,
    };
  };
};

export default buildQueryFactory();
