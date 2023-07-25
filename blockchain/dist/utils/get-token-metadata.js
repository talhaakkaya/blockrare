"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const helpers_1 = require("./helpers");
(async () => {
    try {
        const { contract } = await (0, helpers_1.connectContract)();
        const tokenURI = await contract.tokenURI(process.argv[2]);
        try {
            const encodedTokenURI = atob(tokenURI.substring(29));
            const result = JSON.parse(encodedTokenURI);
            process.stdout.write(`${JSON.stringify(result)}\n`);
        }
        catch (err) {
            throw new Error("Invalid JSON");
        }
    }
    catch (err) {
        process.stderr.write(`${err}\n`);
        process.exit(1);
    }
})();
