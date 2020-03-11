import { GqlRecord } from './GqlRecord';

/**
 * Result sent to the consumer when calling getResponseParser
 * getResponseParser is automatically called when calling the main function ""
 *
 */
export declare type ResponseParserResult = { // Single record
  data: GqlRecord;
} | { // Multiple records
  data: GqlRecord[];
  total: number;
}
