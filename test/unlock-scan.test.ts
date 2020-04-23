import { expect } from 'chai';
import { BigNumber } from '@ethersproject/bignumber';
import { getUnlockTimestamps } from '../src';

const UnlockScanner = artifacts.require('UnlockScanner');
const FixedUnlock = artifacts.require('FixedUnlock');
const InvalidUnlock = artifacts.require('InvalidUnlock');

const LOCAL_PROVIDER: string = (web3 as any).currentProvider.host;

describe('unlock-scan', () => {
  it('should get multiple timestamps for multiple addresses from the contract', async () => {
    const { address: contractAddress } = await UnlockScanner.deployed();
    const unlockContract = await FixedUnlock.new();
    const secondUnlockContract = await FixedUnlock.new();
    const accounts = await web3.eth.getAccounts();
    accounts.shift();

    const timestamps = await getUnlockTimestamps(LOCAL_PROVIDER, accounts, {
      contractAddress,
      contracts: [unlockContract.address, secondUnlockContract.address]
    });

    for (const account of accounts) {
      expect(Object.keys(timestamps[account]).length).to.equal(2);
      expect(Object.keys(timestamps[account])[0]).to.equal(unlockContract.address);
      expect(Object.keys(timestamps[account])[1]).to.equal(secondUnlockContract.address);
      expect(timestamps[account][unlockContract.address].eq(BigNumber.from('100000'))).to.equal(
        true
      );
      expect(
        timestamps[account][secondUnlockContract.address].eq(BigNumber.from('100000'))
      ).to.equal(true);
    }
  });

  it('should not throw on invalid contracts or non-contract addresses', async () => {
    const { address: contractAddress } = await UnlockScanner.deployed();
    const token = await FixedUnlock.new();
    const invalidToken = await InvalidUnlock.new();
    const accounts = await web3.eth.getAccounts();

    const timestamps = await getUnlockTimestamps(LOCAL_PROVIDER, accounts, {
      contractAddress,
      contracts: [token.address, invalidToken.address, accounts[0]]
    });

    expect(Object.keys(timestamps).length).to.equal(10);
    expect(timestamps[accounts[0]][token.address].eq(BigNumber.from('100000'))).to.equal(true);
    expect(timestamps[accounts[0]][invalidToken.address].eq(BigNumber.from('0'))).to.equal(true);
    expect(timestamps[accounts[0]][accounts[0]].eq(BigNumber.from('0'))).to.equal(true);
  });
});
