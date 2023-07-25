import { request } from "graphql-request";

export const fetcher = <TData>(query: string): Promise<TData> => {
  return request(
    "https://api.thegraph.com/subgraphs/id/Qma8j4JaXDA5k8DjCN183eStkMYetAP77yUwjTAGVgDsJv",
    query
  );
};

export const contractABI =
  "https://bafybeih4j5yo52j27bd7u47gu2u6tyeqxd5uunk2ge2gzgoeskmn7rrnhu.ipfs.dweb.link/";

export const contractAddress = "0x9Fe9451DA86a3b1FF954435bbDda8DF2C52E69b6";

export const CHAIN_ID = 43113;
