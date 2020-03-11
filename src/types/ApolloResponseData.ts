import { GqlRecord } from './GqlRecord';

export declare type SingleRecordResponse = {
  data: GqlRecord;
};

export declare type MultipleRecordsResponse = {
  items: GqlRecord[];
  total: {
    aggregate: {
      count: number;
      __typename: string;
    };
  };
};

export declare type ApolloResponseData<T = SingleRecordResponse | MultipleRecordsResponse> = T;
