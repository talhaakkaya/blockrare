import { JsonRpcProvider, Contract, Wallet } from "ethers";
import { abi } from "../out/BlockRare.sol/BlockRare.json";

export const connectContract = async () => {
  const rpcUrl = process.env.RPC_URL;
  const privateKey = process.env.PRIVATE_KEY;

  if (!rpcUrl || !privateKey) throw new Error("Missing environment variables.");

  const provider = new JsonRpcProvider(rpcUrl);
  const wallet = new Wallet(privateKey, provider);
  const contract = new Contract(
    "0x9Fe9451DA86a3b1FF954435bbDda8DF2C52E69b6",
    abi,
    wallet
  );

  return {
    provider,
    wallet,
    contract,
  };
};

export const stringToBytes32 = (inputString: string): Uint8Array => {
  const utf8Encoder = new TextEncoder();
  return utf8Encoder.encode(inputString);

  // const bytes32Array = new Uint8Array(32);
  // bytes32Array.set(encodedString);

  // return `0x${Buffer.from(bytes32Array).toString("hex")}`;
};
