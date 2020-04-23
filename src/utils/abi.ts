import { defaultAbiCoder } from '@ethersproject/abi';

/**
 * Encode the addresses and optional args to an input data string.
 *
 * @param {string[]} types An array of types.
 * @param {...any[]} args The arguments as defined by the types.
 * @return {string} The input data formatted as hexadecimal string.
 */
export const encode = (types: string[], ...args: any[]): string => {
  return defaultAbiCoder.encode(types, [...args]);
};

/**
 * Decode data from a raw Buffer.
 *
 * @param {string[]} types An array of types.
 * @param {Buffer} data The Buffer to decode.
 * @return {T} The decoded data.
 * @template T
 */
export const decode = <T>(types: string[], data: Buffer): T => {
  // TODO: See if there's a better way to type this
  return (defaultAbiCoder.decode(types, data) as unknown) as T;
};

/**
 * Encode the addresses and optional args to an input data string with the function identifier.
 *
 * @param {string} id The function identifier as a hexadecimal string.
 * @param {string[]} types An array of types.
 * @param {...any[]} args The arguments as defined by the types.
 * @return {string} The input data as a hexadecimal string.
 */
export const encodeWithId = (id: string, types: string[], ...args: any[]): string => {
  return `0x${id}${encode(types, ...args).slice(2)}`;
};

/**
 * Get a buffer from a hexadecimal string.
 *
 * @param {string} data The hexadecimal string including the 0x prefix.
 * @return {Buffer} A Buffer of the hexadecimal string.
 */
export const stringToBuffer = (data: string): Buffer => {
  return Buffer.from(data.slice(2), 'hex');
};
