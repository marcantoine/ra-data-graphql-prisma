import { ApolloError, NetworkStatus } from 'apollo-client';
import { ApolloResponseData, MultipleRecordsResponse, SingleRecordResponse } from './ApolloResponseData';

export declare type ApolloResponse<T = SingleRecordResponse | MultipleRecordsResponse> = {
  data: ApolloResponseData<T>;
  error?: ApolloError;
  loading?: boolean;
  networkStatus?: NetworkStatus;
}
