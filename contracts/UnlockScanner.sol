// SPDX-License-Identifier: MIT

pragma solidity 0.8.3;

/**
 * @title An Unlock Protocol scanner
 * @dev This contract is only used for testing purposes
 * @author Maarten Zuidhoorn
 */
contract UnlockScanner {
  struct Result {
    bool success;
    bytes data;
  }

  /**
   * @notice Call multiple contracts with the provided arbitrary data
   * @param contracts The contracts to call
   * @param data The data to call the contracts with
   * @return results The raw result of the contract calls
   */
  function call(address[] calldata contracts, bytes[] calldata data)
    external
    view
    returns (Result[] memory results)
  {
    return call(contracts, data, gasleft());
  }

  /**
   * @notice Call multiple contracts with the provided arbitrary data
   * @param contracts The contracts to call
   * @param data The data to call the contracts with
   * @param gas The amount of gas to call the contracts with
   * @return results The raw result of the contract calls
   */
  function call(
    address[] calldata contracts,
    bytes[] calldata data,
    uint256 gas
  ) public view returns (Result[] memory results) {
    require(contracts.length == data.length, "Length must be equal");
    results = new Result[](contracts.length);

    for (uint256 i = 0; i < contracts.length; i++) {
      results[i] = staticCall(contracts[i], data[i], gas);
    }
  }

  /**
   * @notice Static call a contract with the provided data
   * @param target The address of the contract to call
   * @param data The data to call the contract with
   * @param gas The amount of gas to forward to the call
   * @return result The result of the contract call
   */
  function staticCall(
    address target,
    bytes memory data,
    uint256 gas
  ) private view returns (Result memory) {
    uint256 size = codeSize(target);

    if (size > 0) {
      (bool success, bytes memory result) = target.staticcall{gas: gas}(data);
      if (success) {
        return Result(success, result);
      }
    }

    return Result(false, "");
  }

  /**
   * @notice Get code size of address
   * @param _address The address to get code size from
   * @return size Unsigned 256-bits integer
   */
  function codeSize(address _address) private view returns (uint256 size) {
    // solhint-disable-next-line no-inline-assembly
    assembly {
      size := extcodesize(_address)
    }
  }
}
