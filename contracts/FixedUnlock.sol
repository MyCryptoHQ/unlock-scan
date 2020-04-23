pragma solidity 0.6.4;

/**
 * @title Fixed Unlock Protocol Contract
 * @author Maarten Zuidhoorn
 * @dev This contract exists purely for testing purposes
 */
contract FixedUnlock {
  /**
   * @dev This function always returns the same value, regardless of the address provided
   * @return A fixed value of 100000
   */
  function keyExpirationTimestampFor(address who) public pure returns (uint256) {
    return 100000;
  }
}
