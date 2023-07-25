import {
  json,
  ByteArray,
  Bytes,
  ipfs,
  BigInt,
  log,
} from "@graphprotocol/graph-ts";
import {
  Contract,
  Approval,
  ApprovalForAll,
  BlacklistUpdated,
  FeeUpdated,
  OwnershipTransferred,
  StatusUpdated,
  MetadataUpdated,
  TokenURIUpdated,
  Transfer,
} from "../generated/Contract/Contract";

import { Token } from "../generated/schema";

export function handleApproval(event: Approval): void {}

export function handleApprovalForAll(event: ApprovalForAll): void {}

export function handleBlacklistUpdated(event: BlacklistUpdated): void {}

export function handleFeeUpdated(event: FeeUpdated): void {}

export function handleOwnershipTransferred(event: OwnershipTransferred): void {}

export function handleStatusUpdated(event: StatusUpdated): void {}

export function handleMetadataUpdated(event: MetadataUpdated): void {
  let master = Contract.bind(event.address);
  let totalSupply = master.totalSupply();

  for (let i = 0; totalSupply.toI32() > i; ++i) {
    let block = master.getBlock(BigInt.fromI32(i));

    let token = Token.load(i.toString());
    if (!token) return;
    if (token.isOriginal == false) return;

    token.metadata = master.tokenURI(BigInt.fromI32(i));
    token.save();
  }
}

export function handleTokenURIUpdated(event: TokenURIUpdated): void {
  let master = Contract.bind(event.address);
  let tokenId = event.params.tokenId;
  let block = master.getBlock(tokenId);

  let token = Token.load(tokenId.toString());
  if (!token) return;

  token.metadata = master.tokenURI(tokenId);
  token.isImmutable = block.isImmutable;
  token.updatedAt = event.block.timestamp;
  token.isOriginal = false;
  token.save();
}

export function handleTransfer(event: Transfer): void {
  let master = Contract.bind(event.address);
  let tokenId = event.params.tokenId;
  let to = event.params.to;
  let block = master.getBlock(tokenId);

  let token = Token.load(tokenId.toString());
  if (!token) {
    token = new Token(tokenId.toString());

    token.blockNumber = event.block.number;
    token.isOriginal = true;
    token.metadata = master.tokenURI(tokenId);
    token.blockName = block.blockName;
    token.blockData = block.blockData;
    token.oneOfInBlock = block.oneOfInBlock;
    token.isImmutable = block.isImmutable;
    token.approxMintCost = master.approxMintCost(tokenId);
    token.mintedAt = event.block.timestamp;
  }
  token.updatedAt = event.block.timestamp;
  token.owner = to;
  token.save();
}
