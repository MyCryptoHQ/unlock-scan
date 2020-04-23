import { expect } from 'chai';
import { BigNumber } from '@ethersproject/bignumber';
import { callWithHttp, getPayload } from '../../src';
import { decode, encodeWithId } from '../../src/utils';
import { UNLOCK_TIMESTAMPS_ID, UNLOCK_TIMESTAMPS_TYPE } from '../../src/constants';

const UnlockScanner = artifacts.require('UnlockScanner');
const FixedUnlock = artifacts.require('FixedUnlock');

const LOCAL_PROVIDER: string = (web3 as any).currentProvider.host;

describe('providers/http', () => {
  describe('getPayload()', () => {
    it('should return the request body as JSON string', async () => {
      const { address } = await UnlockScanner.deployed();

      const payload = getPayload(address, '0x');
      expect(payload.method).to.equal('eth_call');
      expect(payload.params[0].to).to.equal(address);
      expect(payload.params[0].data).to.equal('0x');
    });
  });

  describe('callWithHttp()', async () => {
    it('should get timestamps from the contract', async () => {
      const { address } = await UnlockScanner.deployed();
      const contract = await FixedUnlock.new();
      const accounts = await web3.eth.getAccounts();

      const data = encodeWithId(UNLOCK_TIMESTAMPS_ID, UNLOCK_TIMESTAMPS_TYPE, accounts, [
        contract.address
      ]);
      const response = await callWithHttp(LOCAL_PROVIDER, address, data);

      const decoded = decode<[BigNumber[][]]>(['uint256[][]'], response)[0];

      for (let i = 0; i < accounts.length; i++) {
        expect(decoded[i][0].eq(BigNumber.from('100000'))).to.equal(true);
      }
    });
  });
});
