import { decode, encode } from '@findeth/abi';
import {
  BalanceMap,
  call,
  ProviderLike,
  Result,
  toNestedBalanceMap,
  withId
} from '@mycrypto/eth-scan';
import {
  CALL_ID,
  CALL_TYPE,
  CONTRACT_ADDRESS,
  KEY_EXPIRATION_TIMESTAMP_FOR_ID,
  KEY_EXPIRATION_TIMESTAMP_FOR_TYPE
} from './constants';
import { UnlockScanOptions } from './unlock-scan';

export const callMultiple = async (
  provider: ProviderLike,
  addresses: string[],
  contractAddresses: string[],
  encodeData: (addresses: string[], contractAddresses: string[]) => string,
  options?: UnlockScanOptions
): Promise<BalanceMap<BalanceMap>> => {
  const contractAddress = options?.contractAddress ?? CONTRACT_ADDRESS;

  const results = await addresses.reduce<Promise<Result[][]>>(async (promise, address) => {
    const results = await promise;
    const encodedData = withId(
      KEY_EXPIRATION_TIMESTAMP_FOR_ID,
      encode(KEY_EXPIRATION_TIMESTAMP_FOR_TYPE, [address])
    );
    const encodedCallData = withId(
      CALL_ID,
      encode(CALL_TYPE, [contractAddresses, new Array(contractAddresses.length).fill(encodedData)])
    );

    const result = decode(
      ['(bool,bytes)[]'],
      await call(provider, contractAddress, encodedCallData)
    )[0] as Result[];
    return [...results, result];
  }, Promise.resolve([]));

  return toNestedBalanceMap(addresses, contractAddresses, results);
};
