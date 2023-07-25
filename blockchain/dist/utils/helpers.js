"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.stringToBytes32 = exports.connectContract = void 0;
const ethers_1 = require("ethers");
const BlockRare_json_1 = require("../out/BlockRare.sol/BlockRare.json");
const connectContract = async () => {
    const rpcUrl = process.env.RPC_URL;
    const privateKey = process.env.PRIVATE_KEY;
    if (!rpcUrl || !privateKey)
        throw new Error("Missing environment variables.");
    const provider = new ethers_1.JsonRpcProvider(rpcUrl);
    const wallet = new ethers_1.Wallet(privateKey, provider);
    const contract = new ethers_1.Contract("0x9Fe9451DA86a3b1FF954435bbDda8DF2C52E69b6", BlockRare_json_1.abi, wallet);
    return {
        provider,
        wallet,
        contract,
    };
};
exports.connectContract = connectContract;
const stringToBytes32 = (inputString) => {
    const utf8Encoder = new TextEncoder();
    return utf8Encoder.encode(inputString);
    // const bytes32Array = new Uint8Array(32);
    // bytes32Array.set(encodedString);
    // return `0x${Buffer.from(bytes32Array).toString("hex")}`;
};
exports.stringToBytes32 = stringToBytes32;
