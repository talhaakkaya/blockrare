// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.10;

import {Test} from "forge-std/Test.sol";
import {BlockRare} from "../src/BlockRare.sol";
import {Metadata} from "../src/Metadata.sol";

contract BlockTest is Test {
    Metadata public metadata;
    BlockRare public blockRare;

    function setUp() public {
        metadata = new Metadata();
        blockRare = new BlockRare("BlockRare", "BLOCK");

        blockRare.setStatus(0, 1);
        blockRare.setMetadata(address(metadata));
    }

    function testDeployed() public {
        assertEq(blockRare.name(), "BlockRare");
    }

    function testMint() public {
        string[] memory blockNames = new string[](2);
        blockNames[0] = "x1";
        blockNames[1] = "x2";

        blockRare.mint{gas: 15 * 10 ** 6, value: 2 * 10 ** 17}(
            block.number, 2, address(1), blockNames, false, "null", block.gaslimit
        );
    }
}
