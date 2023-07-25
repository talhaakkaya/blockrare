// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.10;

import {ERC721, IERC721} from "openzeppelin/token/ERC721/ERC721.sol";
import {ERC721Enumerable} from "openzeppelin/token/ERC721/extensions/ERC721Enumerable.sol";
import {ERC721Burnable} from "openzeppelin/token/ERC721/extensions/ERC721Burnable.sol";
import {ERC721URIStorage} from "openzeppelin/token/ERC721/extensions/ERC721URIStorage.sol";
import {ReentrancyGuard} from "openzeppelin/security/ReentrancyGuard.sol";
import {IERC20} from "openzeppelin/token/ERC20/IERC20.sol";
import {SafeERC20} from "openzeppelin/token/ERC20/utils/SafeERC20.sol";
import {Ownable} from "openzeppelin/access/Ownable.sol";
import {IMetadata} from "./Metadata.sol";

contract BlockRare is ERC721, ERC721Enumerable, ERC721URIStorage, ERC721Burnable, ReentrancyGuard, Ownable {
    using SafeERC20 for IERC20;

    uint256 private _isActive;
    uint256 private _isFrozen;
    uint64 private immutable gasToLeave;
    uint256 private _nextTokenId;
    uint256 public mintFee;
    IMetadata private _metadata;

    struct Block {
        uint256 blockNumber;
        uint256 oneOfInBlock;
        string blockName;
        bool isImmutable;
        bytes blockData;
        uint256 mintGasPrice;
        uint256 targetGasSpend;
    }

    mapping(uint256 => Block) private _blocks;
    mapping(uint256 => uint256) private _wastedStorage;
    mapping(address => bool) private _blacklist;

    event TokenURIUpdated(uint256 indexed tokenId, string indexed uri);
    event StatusUpdated(uint256 indexed isActive, uint256 indexed isFrozen);
    event FeeUpdated(uint256 indexed price);
    event BlacklistUpdated(address indexed account, bool indexed status);
    event MetadataUpdated(address indexed metadata);

    constructor(string memory name_, string memory symbol_) ERC721(name_, symbol_) {
        mintFee = 2 * 10 ** 17;
        gasToLeave = 21 * 10 ** 3; // for evm
        _isFrozen++;
    }

    function approxMintCost(uint256 tokenId) public view returns (uint256) {
        require(_exists(tokenId), "NO_TOKEN");
        return _blocks[tokenId].mintGasPrice * _blocks[tokenId].targetGasSpend;
    }

    function getBlock(uint256 tokenId) external view returns (Block memory) {
        require(_exists(tokenId), "NO_TOKEN");
        return _blocks[tokenId];
    }

    function getStatus() external view returns (uint256, uint256) {
        return (_isActive, _isFrozen);
    }

    function mint(
        uint256 targetBlockNumber,
        uint32 numberOfTokens,
        address to,
        string[] calldata blockNames,
        bool isImmutable,
        bytes calldata blockData,
        uint256 txnGasLimit
    ) external payable nonReentrant {
        if (_msgSender() != owner()) {
            require(_isActive > 0, "NOT_ACTIVE");
            require(msg.value >= mintFee, "INCORRECT_AVAX_SENT");
        }
        require(targetBlockNumber == block.number, "WRONG_BLOCK_NUMBER");
        require(block.gaslimit == txnGasLimit, "TXN_BLOCK_GL_MISMATCH");

        bool isMatched = numberOfTokens == blockNames.length;
        require(isMatched, "LENGTH_MISSMATCH");

        for (uint32 i = 0; numberOfTokens > i; i++) {
            uint256 mintIndex = _nextTokenId;
            _nextTokenId++;

            _blocks[mintIndex] = Block({
                blockNumber: block.number,
                oneOfInBlock: numberOfTokens,
                blockName: blockNames[i],
                isImmutable: isImmutable,
                blockData: blockData,
                mintGasPrice: tx.gasprice,
                targetGasSpend: txnGasLimit / numberOfTokens
            });

            _safeMint(to, mintIndex);
        }

        uint256 x = 0;
        while (gasleft() >= gasToLeave) {
            _wastedStorage[uint256(blockhash(block.number - 1)) + x] = x;
            x++;
        }
    }

    function setTokenURIs(uint256[] calldata tokenIds, string[] calldata uris) external {
        for (uint256 i = 0; tokenIds.length > i; i++) {
            uint256 tokenId = tokenIds[i];
            require(_msgSender() == ownerOf(tokenId), "ONLY_OWNER_CAN_SET_URI");

            require(!_blocks[tokenId].isImmutable, "TOKEN_IMMUTABLE");

            _blocks[tokenId].isImmutable = true;
            _setTokenURI(tokenId, uris[i]);

            emit TokenURIUpdated({tokenId: tokenId, uri: uris[i]});
        }
    }

    function setFee(uint256 price) external onlyOwner {
        mintFee = price;

        emit FeeUpdated({price: price});
    }

    function setMetadata(address metadata) external onlyOwner {
        _metadata = IMetadata(metadata);

        emit MetadataUpdated({metadata: metadata});
    }

    function setStatus(uint256 isActive, uint256 isFrozen) external onlyOwner {
        _isActive = isActive;
        _isFrozen = isFrozen;

        emit StatusUpdated({isActive: isActive, isFrozen: isFrozen});
    }

    function sweep() external onlyOwner {
        // solhint-disable-next-line
        (bool success,) = _msgSender().call{value: address(this).balance}("");
        require(success, "UNABLE_TO_SEND_VALUE");
    }

    function rescueERC20(IERC20 token, uint256 amount) external onlyOwner {
        require(address(token) != address(this), "SAME_AS_CONTRACT");
        IERC20(token).safeTransfer(owner(), amount);
    }

    function rescueERC721(IERC721 token, uint256 tokenId) external onlyOwner {
        require(address(token) != address(this), "SAME_AS_CONTRACT");
        IERC721(token).safeTransferFrom(address(this), owner(), tokenId);
    }

    function setBlacklisted(address[] memory accounts, bool approval) external onlyOwner {
        for (uint256 i = 0; accounts.length > i; i++) {
            _blacklist[accounts[i]] = approval;

            emit BlacklistUpdated({account: accounts[i], status: approval});
        }
    }

    // solhint-disable-next-line no-empty-blocks
    receive() external payable {}

    fallback() external payable {}

    // The following functions are overrides required by Solidity.

    function _beforeTokenTransfer(address from, address to, uint256 tokenId, uint256 batchSize)
        internal
        override(ERC721, ERC721Enumerable)
    {
        bool isBlocked = _blacklist[from] || _blacklist[to] || _blacklist[_msgSender()];

        require(!isBlocked, "BLOCKED");
        require(_isFrozen > 0, "FROZEN");

        super._beforeTokenTransfer(from, to, tokenId, batchSize);
    }

    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }

    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        bool isDefined = bytes(super.tokenURI(tokenId)).length > 0;
        if (!isDefined) {
            return IMetadata(_metadata).generate(
                _blocks[tokenId].blockNumber,
                _blocks[tokenId].blockName,
                _blocks[tokenId].oneOfInBlock,
                approxMintCost(tokenId),
                _blocks[tokenId].blockData,
                _blocks[tokenId].isImmutable
            );
        }

        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
