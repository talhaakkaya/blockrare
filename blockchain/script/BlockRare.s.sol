// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script} from "forge-std/Script.sol";
import {BlockRare} from "../src/BlockRare.sol";
import {Metadata} from "../src/Metadata.sol";

contract BlockRareScript is Script {
    Metadata public metadata;
    BlockRare public blockRare;

    function run() public {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

        vm.startBroadcast(deployerPrivateKey);

        metadata = new Metadata();
        blockRare = new BlockRare("BlockRare", "BLOCK");

        blockRare.setStatus(1, 1);
        blockRare.setMetadata(address(metadata));

        vm.stopBroadcast();
    }
}
