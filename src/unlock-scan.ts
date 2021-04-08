import { BalanceMap, encode, ProviderLike, withId } from '@mycrypto/eth-scan';
import { callMultiple } from './api';
import { CALL_ID, CALL_TYPE, CONTRACT_ADDRESS, DEFAULT_CONTRACTS } from './constants';

/**
 * An object that contains the address (key) and timestamp or timestamp map (value).
 */
export type TimestampMap = BalanceMap<BalanceMap>;

export interface UnlockScanOptions {
  /**
   * The address of the contract to use. Defaults to the eth-scan contract.
   */
  contractAddress?: string;

  /**
   * An array of contracts to scan. Defaults to the contracts used by MyCrypto, e.g.:
   *  - 0x6cA105D2AF7095B1BCEeb6A2113D168ddDCD57cf
   *  - 0xfe58C642A3F703e7Dc1060B3eE02ED4619046125
   *  - 0x7a84f1074B5929cBB7bd08Fb450CF9Fb22bf5329
   *  - 0xee2B7864d8bc731389562F820148e372F57571D8
   *  - 0x098D8b363933D742476DDd594c4A5a5F1a62326a
   */
  contracts?: string[];
}

/**
 * Get the Unlock Protocol timestamps for multiple contracts, for multiple addresses.
 *
 * @param {ProviderLike} provider
 * @param {string[]} addresses
 * @param {UnlockScanOptions} options
 * @return {Promise<TimestampMap>}
 */
export const getUnlockTimestamps = async (
  provider: ProviderLike,
  addresses: string[],
  options?: UnlockScanOptions
): Promise<TimestampMap> => {
  const contractAddress = options?.contractAddress ?? CONTRACT_ADDRESS;
  const contracts = options?.contracts ?? DEFAULT_CONTRACTS;

  return callMultiple(
    provider,
    addresses,
    contracts,
    (batchedAddresses, batchedContracts) =>
      withId(CALL_ID, encode(CALL_TYPE, [batchedContracts, batchedAddresses])),
    {
      contractAddress
    }
  );
};
