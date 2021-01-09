// SPDX-License-Identifier: MIT

pragma solidity 0.8.0;

/**
 * @title An Unlock Protocol scanner
 * @author Maarten Zuidhoorn
 */
contract UnlockScanner {
  /**
   * @notice Get expiration timestamp for a single address
   * @param owner The address to get the timestamps for
   * @param unlockContract The address of the Unlock Protocol contract
   * @return timestamp The expiration timestamp, or zero if the address is not a contract, or does not implement the `keyExpirationTimestampFor` function
   */
  function unlockTimestamp(address owner, address unlockContract)
    public
    view
    returns (uint256 timestamp)
  {
    uint256 size = codeSize(unlockContract);

    if (size > 0) {
      (bool success, bytes memory data) =
        unlockContract.staticcall(
          abi.encodeWithSignature("keyExpirationTimestampFor(address)", owner)
        );
      if (success) {
        (timestamp) = abi.decode(data, (uint256));
      }
    }
  }

  /**
   * @notice Get expiration timestamp for multiple contracts, for multiple addresses
   * @param addresses The addresses to get the timestamps for
   * @param contracts The addresses of the Unlock Protocol contracts
   * @return timestamps The timestamps in the same order as the addresses specified
   */
  function unlockTimestamps(address[] calldata addresses, address[] calldata contracts)
    public
    view
    returns (uint256[][] memory timestamps)
  {
    timestamps = new uint256[][](addresses.length);

    for (uint256 i = 0; i < addresses.length; i++) {
      timestamps[i] = new uint256[](contracts.length);
      for (uint256 j = 0; j < contracts.length; j++) {
        timestamps[i][j] = unlockTimestamp(addresses[i], contracts[j]);
      }
    }
  }

  /**
   * @notice Get code size of an address
   * @param _address The address to get code size for
   * @return size The size of the code
   */
  function codeSize(address _address) internal view returns (uint256 size) {
    // solhint-disable-next-line no-inline-assembly
    assembly {
      size := extcodesize(_address)
    }
  }
}
