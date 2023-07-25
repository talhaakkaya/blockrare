"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const helpers_1 = require("./helpers");
(async () => {
    try {
        const { contract, provider, wallet } = await (0, helpers_1.connectContract)();
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
            process.stdout.write("\x1B[2K\rTX publishing...");
            const mint = await contract.mint(targetBlockNumber, 1, wallet.address, ["INIT"], true, (0, helpers_1.stringToBytes32)("INIT"), gasLimit, {
                value: BigInt(2 * 10 ** 17),
                gasLimit,
            });
            process.stdout.write("\x1B[2K\rWaiting for the confirmations...");
            const receipt = await mint.wait();
            isMinted =
                receipt.blockNumber === targetBlockNumber && receipt.status > 0;
            process.stdout.write(`\x1B[2K\r${isMinted ? "Minted." : `Missed(It's already ${receipt.blockNumber}).`}\n`);
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
