import { BigNumber } from '@ethersproject/bignumber';
import { batch, decode, encodeWithId } from './utils';
import {
  BATCH_SIZE,
  CONTRACT_ADDRESS,
  DEFAULT_CONTRACTS,
  UNLOCK_TIMESTAMPS_ID,
  UNLOCK_TIMESTAMPS_TYPE
} from './constants';
import { call, ProviderLike } from './providers';

/**
 * An object that contains the address (key) and timestamp or timestamp map (value).
 */
export interface TimestampMap<T = BigNumber> {
  [key: string]: T;
}

export interface UnlockScanOptions {
  /**
   * The address of the contract to use. Defaults to 0x60EfD418BEB6E0064AcBb7CD704169F07De67480.
   */
  contractAddress?: string;

  /**
   * It's not possible to check thousands of addresses at the same time, due to gas limitations.
   * Calls are split per `batchSize` addresses, by default set to 1000.
   */
  batchSize?: number;

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
 * Get the Unlock Protocol timestamps for multiple contracts, for multiple addresses. Note that this may fail if there are
 * too many addresses or contracts, and the batch size is too large.
 *
 * @param {ProviderLike} provider
 * @param {string[]} addresses
 * @param {UnlockScanOptions} options
 * @return {Promise<TimestampMap<TimestampMap>>}
 */
export const getUnlockTimestamps = async (
  provider: ProviderLike,
  addresses: string[],
  options?: UnlockScanOptions
): Promise<TimestampMap<TimestampMap>> => {
  const contractAddress = options?.contractAddress ?? CONTRACT_ADDRESS;
  const batchSize = options?.batchSize ?? BATCH_SIZE;
  const contracts = options?.contracts ?? DEFAULT_CONTRACTS;

  const timestamps = await batch<BigNumber[]>(
    async (batchedAddresses: string[]) => {
      const data = encodeWithId(
        UNLOCK_TIMESTAMPS_ID,
        UNLOCK_TIMESTAMPS_TYPE,
        batchedAddresses,
        contracts
      );

      return decode<[BigNumber[][]]>(
        ['uint256[][]'],
        await call(provider, contractAddress, data)
      )[0];
    },
    batchSize,
    addresses
  );

  return toNestedMap(addresses, contracts, timestamps);
};

/**
 * Get a map from an array of addresses and an array of timestamps.
 *
 * @param {string[]} addresses
 * @param {BigNumber[]} timestamps
 * @return {TimestampMap}
 */
export const toMap = (addresses: string[], timestamps: BigNumber[]): TimestampMap => {
  return timestamps.reduce<TimestampMap>((current, next, index) => {
    return {
      ...current,
      [addresses[index]]: next
    };
  }, {});
};

/**
 * Get a nested map from an array of addresses, contract addresses, and timestamps.
 *
 * @param {string[]} addresses
 * @param {BigNumber[]} contractAddresses
 * @param {TimestampMap<TimestampMap>} timestamps
 */
export const toNestedMap = (
  addresses: string[],
  contractAddresses: string[],
  timestamps: BigNumber[][]
): TimestampMap<TimestampMap> => {
  return timestamps.reduce<TimestampMap<TimestampMap>>(
    (current, next, index) => ({
      ...current,
      [addresses[index]]: toMap(contractAddresses, next)
    }),
    {}
  );
};