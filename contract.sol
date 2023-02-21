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

  string private _limitedEditionTokenURI;

  address private _systemAddress;

  mapping(string => bool) public _usedNonces;

  Counters.Counter private _tokenIdCounter;

  Counters.Counter private _currentBaseUriCounter;

  Counters.Counter private _currentLimitedEditionUriCounter;

  constructor(address systemAddress) ERC721("90s Kids", "90SKIDS") EIP712("90s Kids", "90SKIDS") {
    _systemAddress =  systemAddress;
  }

  function publicMint(
    uint256 amount,
    string memory nonce,
    bytes32 hash,
    bytes memory signature
  ) external payable {

    require(matchSigner(hash, signature), "Mint must be done from 90skidsclub.xyz");
    require(bytes(_baseTokenURI).length > 0, "base uri is not set");
    require(!_usedNonces[nonce], "Hash reused");
    require(
      hashTransaction(msg.sender, amount, nonce) == hash,
      "Hash failed"
    );

    _usedNonces[nonce] = true;

    for (uint256 i = 1; i <= amount; i++) {
      _safeMint(msg.sender, _tokenIdCounter.current());
      _setTokenURI(_tokenIdCounter.current(), append(_baseTokenURI, _currentBaseUriCounter.current()));
      _tokenIdCounter.increment();
      _currentBaseUriCounter.increment();
    }
  }

  function publicLimitedEditionMint(
    uint256 amount,
    string memory nonce,
    bytes32 hash,
    bytes memory signature
  ) external payable {

    require(matchSigner(hash, signature), "Mint must be done from 90skidsclub.xyz");
    require(bytes(_limitedEditionTokenURI).length > 0, "limited edition uri is not set");
    require(!_usedNonces[nonce], "Hash reused");
    require(
      hashTransaction(msg.sender, amount, nonce) == hash,
      "Hash failed"
    );

    _usedNonces[nonce] = true;

    for (uint256 i = 1; i <= amount; i++) {
      _safeMint(msg.sender, _tokenIdCounter.current());
      _setTokenURI(_tokenIdCounter.current(), append(_limitedEditionTokenURI, _currentLimitedEditionUriCounter.current()));
      _tokenIdCounter.increment();
      _currentLimitedEditionUriCounter.increment();
    }
  }

  function mint(address receiver, string memory tokenURI) external payable onlyOwner {
      _safeMint(receiver, _tokenIdCounter.current());
      _setTokenURI(_tokenIdCounter.current(), tokenURI);
      _tokenIdCounter.increment();
  }

  function append(string memory a, uint256 b) internal pure returns (string memory) {
    return string(abi.encodePacked(a, Strings.toString(b)));
 }

  function matchSigner(bytes32 hash, bytes memory signature) public view returns (bool) {
    return _systemAddress == hash.toEthSignedMessageHash().recover(signature);
  }

  function hashTransaction(
    address sender,
    uint256 amount,
    string memory nonce
  ) public view returns (bytes32) {

    bytes32 hash = keccak256(
      abi.encodePacked(sender, amount, nonce, address(this))
    );

    return hash;
  }

  function withdrawAll(address payable to) external onlyOwner {
    to.transfer(address(this).balance);
  }

  function totalSupply() public view returns (uint) {
    return _tokenIdCounter.current();
  }

  // Set a new base uri and reset the counter to 0 for the new IPFS hash
  function setBaseUri(string memory uri) external onlyOwner {
    _baseTokenURI = uri;
    _currentBaseUriCounter.reset();
  }

  function baseUri() public view returns (string memory) {
    return _baseTokenURI;
  }

  // Set a limited edition base uri and reset the counter to 0 for the new IPFS hash
  function setLimitedEditionTokenURI(string memory uri) external onlyOwner {
    _limitedEditionTokenURI = uri;
    _currentLimitedEditionUriCounter.reset();
  }

  function limitedEditionTokenURI() public view returns (string memory) {
    return _limitedEditionTokenURI;
  }
}