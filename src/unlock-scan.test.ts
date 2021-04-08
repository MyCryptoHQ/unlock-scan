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
    const unlockContractA = await deployMockContract(provider.getWallets()[0], UNLOCK_CONTRACT_ABI);
    const unlockContractB = await deployMockContract(provider.getWallets()[0], UNLOCK_CONTRACT_ABI);

    const addresses = await Promise.all(
      provider.getWallets().map(wallet => wallet.getAddress())
    ).then(wallets => wallets.slice(0, 3));

    await unlockContractA.mock.keyExpirationTimestampFor.withArgs(addresses[0]).returns('12345');
    await unlockContractA.mock.keyExpirationTimestampFor.withArgs(addresses[1]).returns('54321');
    await unlockContractA.mock.keyExpirationTimestampFor.withArgs(addresses[2]).returns('10000');

    await unlockContractB.mock.keyExpirationTimestampFor.withArgs(addresses[0]).returns('54321');
    await unlockContractB.mock.keyExpirationTimestampFor.withArgs(addresses[1]).returns('12345');
    await unlockContractB.mock.keyExpirationTimestampFor.withArgs(addresses[2]).returns('10101');

    const timestamps = await getUnlockTimestamps(ethers.provider, addresses, {
      contractAddress: contract.address,
      contracts: [unlockContractA.address, unlockContractB.address]
    });

    expect(timestamps).toEqual({
      [addresses[0]]: {
        [unlockContractA.address]: 12345n,
        [unlockContractB.address]: 54321n
      },
      [addresses[1]]: {
        [unlockContractA.address]: 54321n,
        [unlockContractB.address]: 12345n
      },
      [addresses[2]]: {
        [unlockContractA.address]: 10000n,
        [unlockContractB.address]: 10101n
      }
    });
  });
});
