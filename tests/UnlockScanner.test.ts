import { waffle } from 'hardhat';
import { BigNumber, Signer } from 'ethers';
import { UnlockScanner } from '../src/contracts';
import UnlockScannerArtifact from '../artifacts/contracts/UnlockScanner.sol/UnlockScanner.json';

const { deployContract, deployMockContract, createFixtureLoader, provider } = waffle;

const loadFixture = createFixtureLoader(provider.getWallets(), provider);

const UNLOCK_CONTRACT_ABI = [
  {
    inputs: [
      {
        internalType: 'address',
        name: 'who',
        type: 'address'
      }
    ],
    name: 'keyExpirationTimestampFor',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256'
      }
    ],
    stateMutability: 'pure',
    type: 'function'
  }
];

/**
 * Low-level tests for the contract itself, using direct contract interactions. For the library itself, you can refer
 * to `src/unlock-scan.test.ts`.
 */
describe('UnlockScanner', () => {
  const fixture = async (signers: Signer[]) => {
    const signer = signers[0];
    const contract = (await deployContract(signer, UnlockScannerArtifact)) as UnlockScanner;
    const unlockContract = await deployMockContract(signer, UNLOCK_CONTRACT_ABI);

    return { contract, unlockContract, signers };
  };

  describe('unlockTimestamp', () => {
    it('gets the expiration timestamp from a contract for a single address', async () => {
      const { contract, unlockContract, signers } = await loadFixture(fixture);
      const address = await signers[0].getAddress();

      await unlockContract.mock.keyExpirationTimestampFor.returns('100000');
      await expect(contract.unlockTimestamp(address, unlockContract.address)).resolves.toEqual(
        BigNumber.from('100000')
      );

      await unlockContract.mock.keyExpirationTimestampFor.returns('12345');
      await expect(contract.unlockTimestamp(address, unlockContract.address)).resolves.toEqual(
        BigNumber.from('12345')
      );
    });

    it('returns zero for invalid contracts', async () => {
      const { contract, signers } = await loadFixture(fixture);
      const address = await signers[0].getAddress();

      const mockContract = await deployMockContract(signers[0], []);

      await expect(contract.unlockTimestamp(address, mockContract.address)).resolves.toEqual(
        BigNumber.from('0')
      );
    });
  });

  describe('unlockTimestamps', () => {
    it('gets the expiration timestamps from multiple contracts for multiple addresses', async () => {
      const { contract, unlockContract, signers } = await loadFixture(fixture);
      const secondContract = await deployMockContract(signers[0], UNLOCK_CONTRACT_ABI);
      const addresses = await Promise.all(signers.slice(1).map(signer => signer.getAddress()));

      await unlockContract.mock.keyExpirationTimestampFor.returns('100000');
      await secondContract.mock.keyExpirationTimestampFor.returns('123456');

      await expect(
        contract.unlockTimestamps(addresses, [unlockContract.address, secondContract.address])
      ).resolves.toEqual([
        [BigNumber.from('100000'), BigNumber.from('123456')],
        [BigNumber.from('100000'), BigNumber.from('123456')]
      ]);
    });

    it('returns zero for invalid contracts', async () => {
      const { contract, unlockContract, signers } = await loadFixture(fixture);
      const invalidContract = await deployMockContract(signers[0], []);
      const addresses = await Promise.all(signers.slice(1).map(signer => signer.getAddress()));

      await unlockContract.mock.keyExpirationTimestampFor.returns('100000');

      await expect(
        contract.unlockTimestamps(addresses, [unlockContract.address, invalidContract.address])
      ).resolves.toEqual([
        [BigNumber.from('100000'), BigNumber.from('0')],
        [BigNumber.from('100000'), BigNumber.from('0')]
      ]);
    });
  });
});
