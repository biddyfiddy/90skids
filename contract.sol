//SPDX-License-Identifier: MIT
pragma solidity ^0.8.11;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/cryptography/draft-EIP712.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract NinetiesKids is ERC721URIStorage, Ownable, EIP712 {
  using ECDSA for bytes32;

  using Counters for Counters.Counter;

  string private _baseTokenURI;

  address private _systemAddress;

  mapping(string => bool) public _usedNonces;

  Counters.Counter private _tokenIdCounter;

  constructor(address systemAddress) ERC721("90s Kids", "90SKIDS") EIP712("90s Kids", "90SKIDS") {
    _systemAddress =  systemAddress;
  }

  function publicMint(
    string memory uri,
    string memory nonce,
    bytes32 hash,
    bytes memory signature
  ) external payable {

    require(matchSigner(hash, signature), "Mint must be done from 90skidsclub.xyz");
    require(!_usedNonces[nonce], "Hash reused");
    require(
      hashTransaction(msg.sender, uri, nonce) == hash,
      "Hash failed"
    );

    _usedNonces[nonce] = true;
      _safeMint(msg.sender, _tokenIdCounter.current());
      _setTokenURI(_tokenIdCounter.current(), uri);
      _tokenIdCounter.increment();
  }

  function mint(address receiver, string memory tokenURI) external payable onlyOwner {
      _safeMint(receiver, _tokenIdCounter.current());
      _setTokenURI(_tokenIdCounter.current(), tokenURI);
      _tokenIdCounter.increment();
  }

  function append(string memory a, uint256 b) internal pure returns (string memory) {
    return string(abi.encodePacked(a, Strings.toString(b), ".json"));
 }

  function matchSigner(bytes32 hash, bytes memory signature) public view returns (bool) {
    return _systemAddress == hash.toEthSignedMessageHash().recover(signature);
  }

  function hashTransaction(
    address sender,
    string memory uri,
    string memory nonce
  ) public view returns (bytes32) {

    bytes32 hash = keccak256(
      abi.encodePacked(sender, uri, nonce, address(this))
    );

    return hash;
  }

  function withdrawAll(address payable to) external onlyOwner {
    to.transfer(address(this).balance);
  }

  function totalSupply() public view returns (uint) {
    return _tokenIdCounter.current();
  }
}