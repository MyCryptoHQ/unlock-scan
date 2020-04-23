const UnlockScanner = artifacts.require('UnlockScanner');

/**
 * @param {Deployer} deployer
 */
module.exports = deployer => {
  deployer.deploy(UnlockScanner);
};
