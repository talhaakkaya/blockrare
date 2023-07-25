import { connectContract } from "./helpers";

(async () => {
  try {
    const { contract } = await connectContract();

    const tokenURI = await contract.tokenURI(process.argv[2]);

    try {
      const encodedTokenURI = atob(tokenURI.substring(29));
      const result = JSON.parse(encodedTokenURI);
      process.stdout.write(`${JSON.stringify(result)}\n`);
    } catch (err) {
      throw new Error("Invalid JSON");
    }
  } catch (err) {
    process.stderr.write(`${err}\n`);
    process.exit(1);
  }
})();
