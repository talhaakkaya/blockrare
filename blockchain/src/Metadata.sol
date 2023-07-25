// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.10;

import {Base64} from "openzeppelin/utils/Base64.sol";

interface IMetadata {
    function generate(uint256, string memory, uint256, uint256, bytes memory, bool)
        external
        pure
        returns (string memory);
}

contract Metadata is IMetadata {
    function generate(
        uint256 blockNumber,
        string memory blockName,
        uint256 tokenCount,
        uint256 cost,
        bytes calldata blockData,
        bool isImmutable
    ) external pure override returns (string memory) {
        string memory immutability = isImmutable ? "Yes" : "No";
        // prettier-ignore
        string memory image = _toImage(_svgAsString(blockName, blockNumber, tokenCount));

        return string(
            abi.encodePacked(
                "data:application/json;base64,",
                /* solhint-disable quotes */
                Base64.encode(
                    bytes(
                        abi.encodePacked(
                            '{"name":"',
                            blockName,
                            '", "description": "Mint the blocks."',
                            ', "attributes": ',
                            _attributes(blockNumber, tokenCount, blockData, cost, immutability),
                            ', "image":"',
                            image,
                            '"}'
                        )
                    )
                )
            )
        );
        /* solhint-enable quotes */
    }

    function _attributes(
        uint256 blockNumber,
        uint256 tokenCount,
        bytes calldata blockData,
        uint256 cost,
        string memory isImmutable
    ) private pure returns (string memory) {
        /* solhint-disable quotes */
        return string(
            abi.encodePacked(
                '[{"trait_type":"Block Number","value":"',
                _uint2str(blockNumber),
                '"},{"trait_type":"One Of In The Block","value":"',
                _uint2str(tokenCount),
                '"},{"trait_type":"Approx Mint Cost","value":"',
                _uint2str(cost),
                '"},{"trait_type":"Block Data","value":"',
                blockData,
                '"},{"trait_type":"Is Immutable?","value":"',
                isImmutable,
                '"}]'
            )
        );
        /* solhint-enable quotes */
    }

    function _svgAsString(string memory blockName, uint256 blockNumber, uint256 tokenCount)
        private
        pure
        returns (string memory)
    {
        /* solhint-disable quotes */
        return string(
            abi.encodePacked(
                '<svg id="eAV4Dond13k1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 512 512" shape-rendering="geometricPrecision" text-rendering="geometricPrecision" style="background-color:#000"><defs><radialGradient id="eVK6PyZsTXv3-fill" cx="0" cy="0" r="0.714887" spreadMethod="pad" gradientUnits="objectBoundingBox" gradientTransform="translate(0.5 0.5)"><stop id="eVK6PyZsTXv3-fill-0" offset="0%" stop-color="#492727"/><stop id="eVK6PyZsTXv3-fill-1" offset="100%" stop-color="#000"/></radialGradient></defs><rect width="512" height="512" rx="0" ry="0" stroke-width="0"/><rect width="512" height="128" rx="0" ry="0" transform="translate(0 192)" fill="url(#eVK6PyZsTXv3-fill)" stroke-width="0"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="&quot;monospace&quot;" font-size="21" font-weight="700" fill="#E84142">',
                blockName,
                '</text><text x="50%" y="90%" dominant-baseline="middle" text-anchor="middle" font-family="&quot;monospace&quot;" font-size="12" font-weight="400" fill="#505050">',
                _uint2str(blockNumber),
                ".",
                _uint2str(tokenCount),
                "</text></svg>"
            )
        );
        /* solhint-enable quotes */
    }

    function _uint2str(uint256 _i) private pure returns (string memory) {
        if (_i == 0) {
            return "0";
        }
        uint256 j = _i;
        uint256 len;
        while (j != 0) {
            len++;
            j /= 10;
        }
        bytes memory bstr = new bytes(len);
        uint256 k = len;
        while (_i != 0) {
            k = k - 1;
            uint8 temp = (48 + uint8(_i - (_i / 10) * 10));
            bytes1 b1 = bytes1(temp);
            bstr[k] = b1;
            _i /= 10;
        }
        return string(bstr);
    }

    function _toImage(string memory svg) private pure returns (string memory) {
        string memory baseURL = "data:image/svg+xml;base64,";
        string memory svgBase64Encoded = Base64.encode(bytes(string(abi.encodePacked(svg))));
        return string(abi.encodePacked(baseURL, svgBase64Encoded));
    }
}
