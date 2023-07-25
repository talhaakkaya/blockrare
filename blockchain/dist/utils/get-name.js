"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ethers_1 = require("ethers");
const CBlocks_json_1 = require("../out/Block.sol/CBlocks.json");
const stringToBytes32 = (inputString) => {
    const utf8Encoder = new TextEncoder();
    return utf8Encoder.encode(inputString);
    // const bytes32Array = new Uint8Array(32);
    // bytes32Array.set(encodedString);
    // return `0x${Buffer.from(bytes32Array).toString("hex")}`;
};
const connectContract = async (rpcUrl, privateKey) => {
    const provider = new ethers_1.JsonRpcProvider(rpcUrl);
    const wallet = new ethers_1.Wallet(privateKey, provider);
    const contract = new ethers_1.Contract("0x684C098aB469410e4f96AeeAd140036a0c3Ff309", CBlocks_json_1.abi, wallet);
    return {
        provider,
        wallet,
        contract,
    };
};
(async () => {
    if (!process.env.RPC_URL || !process.env.PRIVATE_KEY)
        process.exit(1);
    try {
        const { contract, provider, wallet } = await connectContract(process.env.RPC_URL, process.env.PRIVATE_KEY);
        let isMinted = false;
        let targetBlockNumber = 0;
        while (isMinted === false) {
            const blockNumber = await provider.getBlockNumber();
            process.stdout.write(`Current block number: \t${blockNumber}\n`);
            if (targetBlockNumber === 0) {
                targetBlockNumber = blockNumber + 1;
            }
            else {
                targetBlockNumber = blockNumber + targetBlockNumber;
            }
            process.stdout.write(`Target block number: \t${targetBlockNumber}\n`);
            const block = await provider.getBlock(blockNumber);
            const gasLimit = block?.gasLimit
                ? block.gasLimit
                : BigInt(21 * 10 ** 6);
            process.stdout.write(`Network gas limit: \t${gasLimit}\n`);
            const mint = await contract.mint(targetBlockNumber, 1, wallet.address, ["Test"], true, stringToBytes32("Test x1 x3 Creative Commons Attribution license (reuse allowed)"), gasLimit, {
                value: BigInt(2 * 10 ** 17),
                gasLimit,
            });
            const receipt = await mint.wait();
            isMinted =
                receipt.blockNumber === targetBlockNumber && receipt.status > 0;
            process.stdout.write(`${isMinted ? "Minted." : `Missed(${receipt.blockNumber}).`}\n`);
            targetBlockNumber = receipt.blockNumber - blockNumber;
            if (isMinted)
                process.exit(0);
            process.stdout.write(String("-").repeat(process.stdout.columns));
        }
    }
    catch (err) {
        process.stderr.write(`${err}\n`);
    }
})();
