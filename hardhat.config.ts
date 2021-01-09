import { HardhatUserConfig } from 'hardhat/config';
import '@nomiclabs/hardhat-ethers';
import '@nomiclabs/hardhat-waffle';
import 'hardhat-typechain';

const config: HardhatUserConfig = {
  defaultNetwork: 'hardhat',
  networks: {
    hardhat: {
      accounts: [
        {
          privateKey: '0xeaf2c50dfd10524651e7e459c1286f0c2404eb0f34ffd2a1eb14373db49fceb6',
          balance: '10000000000000000000000'
        },
        {
          privateKey: '0x4adb19cafa5fdf467215fa30b56a50facac2dee40a7015063c6a7a0f1f4e2576\n',
          balance: '10000000000000000000000'
        },
        {
          privateKey: '0xc1fe9bf97eaac301cab7c4acdbf5180584272c58737dd52aa7eb497d1d55868c\n',
          balance: '10000000000000000000000'
        }
      ]
    }
  },
  solidity: {
    version: '0.6.4',
    settings: {
      optimizer: {
        enabled: true,
        runs: 2000
      }
    }
  },
  typechain: {
    outDir: 'src/contracts',
    target: 'ethers-v5'
  }
};

export default config;
