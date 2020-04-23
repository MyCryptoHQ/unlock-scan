import { expect } from 'chai';
import { JsonRpcProvider } from '@ethersproject/providers';
import { BigNumber } from '@ethersproject/bignumber';
import { callWithEthers } from '../../src';
import { decode, encodeWithId } from '../../src/utils';
import { UNLOCK_TIMESTAMPS_ID, UNLOCK_TIMESTAMPS_TYPE } from '../../src/constants';

const UnlockScanner = artifacts.require('UnlockScanner');
const FixedUnlock = artifacts.require('FixedUnlock');

const LOCAL_PROVIDER: string = (web3 as any).currentProvider.host;

describe('providers/ethers', () => {
  describe('callWithEthers()', async () => {
    const provider = new JsonRpcProvider(LOCAL_PROVIDER);

    it('should get timestamps from the contract', async () => {
      const { address } = await UnlockScanner.deployed();
      const contract = await FixedUnlock.new();
      const accounts = await web3.eth.getAccounts();

      const data = encodeWithId(UNLOCK_TIMESTAMPS_ID, UNLOCK_TIMESTAMPS_TYPE, accounts, [
        contract.address
      ]);
      const response = await callWithEthers(provider, address, data);

      const decoded = decode<[BigNumber[][]]>(['uint256[][]'], response)[0];

      for (let i = 0; i < accounts.length; i++) {
        expect(decoded[i][0].eq(BigNumber.from('100000'))).to.equal(true);
      }
    });
  });
});
