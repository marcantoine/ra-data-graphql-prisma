import { DocumentNode } from 'graphql';
import { GqlVariables } from './GqlVariables';
import { ResponseParserSignature } from './ResponseParser';

export declare type BuildQueryResult = {
  query: DocumentNode;
  variables: GqlVariables;
  parseResponse: ResponseParserSignature;
};

export declare type BuildQueryFactorySignature = (aorFetchType: string, resourceName: string, params: any, fragment: DocumentNode) => any;
