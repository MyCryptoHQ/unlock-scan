import { waffle, ethers } from 'hardhat';
import UnlockScannerArtifact from '../artifacts/contracts/UnlockScanner.sol/UnlockScanner.json';
import { UNLOCK_CONTRACT_ABI } from './constants';
import { UnlockScanner } from './contracts';
import { getUnlockTimestamps } from './unlock-scan';

const { deployContract, deployMockContract, provider } = waffle;

describe('getUnlockTimestamps', () => {
  it('gets the expiry timestamps for multiple contracts', async () => {
    const contract = (await deployContract(
      provider.getWallets()[0],
      UnlockScannerArtifact
    )) as UnlockScanner;
    const unlockContract = await deployMockContract(provider.getWallets()[0], UNLOCK_CONTRACT_ABI);

    const addresses = await Promise.all(
      provider.getWallets().map(wallet => wallet.getAddress())
    ).then(wallets => wallets.slice(0, 3));
    await unlockContract.mock.keyExpirationTimestampFor.withArgs(addresses[0]).returns('12345');
    await unlockContract.mock.keyExpirationTimestampFor.withArgs(addresses[1]).returns('54321');
    await unlockContract.mock.keyExpirationTimestampFor.withArgs(addresses[2]).returns('10000');

    const timestamps = await getUnlockTimestamps(ethers.provider, addresses, {
      contractAddress: contract.address,
      contracts: [unlockContract.address]
    });

    expect(timestamps).toEqual({
      [addresses[0]]: {
        [unlockContract.address]: 12345n
      },
      [addresses[1]]: {
        [unlockContract.address]: 54321n
      },
      [addresses[2]]: {
        [unlockContract.address]: 10000n
      }
    });
  });
});
