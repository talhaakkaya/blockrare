# CBlocks Dapp Subgraph

## Overview

The CBlocks Dapp Subgraph is a decentralized application (dapp) that enables users to mint a whole block on the blockchain as a non-fungible token (NFT). The main logic behind this dapp is to mint an NFT and write dummy data to the slots until the gas runs out, ensuring that the user is the sole transaction in the entire block on the blockchain. This README file will guide you through the setup and usage of the CBlocks Dapp Subgraph.

## Smart Contracts

The CBlocks Dapp utilizes smart contracts deployed on the blockchain to handle the minting of NFTs and writing dummy data to fill the blocks. The contract ABI and address should be configured in the `subgraph.yaml` file to allow the subgraph to interact with the smart contract and retrieve necessary data.

## Data Indexing

The CBlocks Dapp Subgraph is responsible for indexing data from the blockchain and storing it in a format that enables efficient querying. It listens for relevant events emitted by the smart contract and updates the data accordingly.

## Queries

The subgraph allows for querying various data related to the CBlocks Dapp, such as block owners, NFT metadata, and other relevant information. These queries can be made through GraphQL using the API provided by The Graph Node.

## Troubleshooting

If you encounter any issues while running the subgraph or have any questions, please refer to the project's documentation or feel free to open an issue on the GitHub repository.

## Disclaimer

Please note that the CBlocks Dapp Subgraph is a research and educational project and might not be suitable for production environments. Use it at your own risk.

## License

The CBlocks Dapp Subgraph is released under the [MIT License](LICENSE). Feel free to use, modify, and distribute it as per the terms of the license.

---

Feel free to customize this README file with specific instructions, diagrams, or additional information to suit your project's requirements. Provide clear instructions for users to deploy and interact with your CBlocks Dapp Subgraph. If your Dapp has additional functionalities or specific usage examples, make sure to document them in the README file. Happy coding!
