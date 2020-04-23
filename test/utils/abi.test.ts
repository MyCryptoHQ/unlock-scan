import { expect } from 'chai';
import { BigNumber } from '@ethersproject/bignumber';
import { decode, encode, encodeWithId, stringToBuffer } from '../../src/utils';
import { UNLOCK_TIMESTAMPS_ID, UNLOCK_TIMESTAMPS_TYPE } from '../../src/constants';

describe('utils/abi', () => {
  describe('decode()', () => {
    it('should decode data', () => {
      const encoded = stringToBuffer(
        '0x' +
          '0000000000000000000000000000000000000000000000000000000000000020' +
          '0000000000000000000000000000000000000000000000000000000000000001' +
          '0000000000000000000000000000000000000000000000056bc75e2d63100000'
      );

      const decoded = decode<[BigNumber[]]>(['uint256[]'], encoded)[0];

      expect(decoded.length).to.equal(1);
      expect(decoded[0].eq(BigNumber.from('100000000000000000000'))).to.equal(true);
    });
  });

  describe('encode()', () => {
    it('should encode addresses', () => {
      const encoded = encode(
        UNLOCK_TIMESTAMPS_TYPE,
        ['0xf00f00f00f00f00f00f00f00f00f00f00f00f00f'],
        ['0xf00f00f00f00f00f00f00f00f00f00f00f00f00f']
      );

      expect(encoded).to.equal(
        '0x' +
          '0000000000000000000000000000000000000000000000000000000000000040' +
          '0000000000000000000000000000000000000000000000000000000000000080' +
          '0000000000000000000000000000000000000000000000000000000000000001' +
          '000000000000000000000000f00f00f00f00f00f00f00f00f00f00f00f00f00f' +
          '0000000000000000000000000000000000000000000000000000000000000001' +
          '000000000000000000000000f00f00f00f00f00f00f00f00f00f00f00f00f00f'
      );
    });
  });

  describe('encodeWithId()', () => {
    it('should encode addresses with a function identifier', () => {
      const encoded = encodeWithId(
        UNLOCK_TIMESTAMPS_ID,
        UNLOCK_TIMESTAMPS_TYPE,
        ['0xf00f00f00f00f00f00f00f00f00f00f00f00f00f'],
        ['0xf00f00f00f00f00f00f00f00f00f00f00f00f00f']
      );

      expect(encoded).to.equal(
        '0x' +
          UNLOCK_TIMESTAMPS_ID +
          '0000000000000000000000000000000000000000000000000000000000000040' +
          '0000000000000000000000000000000000000000000000000000000000000080' +
          '0000000000000000000000000000000000000000000000000000000000000001' +
          '000000000000000000000000f00f00f00f00f00f00f00f00f00f00f00f00f00f' +
          '0000000000000000000000000000000000000000000000000000000000000001' +
          '000000000000000000000000f00f00f00f00f00f00f00f00f00f00f00f00f00f'
      );
    });
  });
});
