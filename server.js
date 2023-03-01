const express = require("express");
const path = require("path");
const web3 = require("web3");
const crypto = require("crypto");
const ethers = require("ethers");
const axios = require("axios");
const app = express();
const port = process.env.PORT || 3001;

const BURN_MAX = 250;
const DROP_START_DATE = Date.parse(process.env.DROP_DATE);
const NULL_ADDRESS = "0x000000000000000000000000000000000000dead";
const TESTING = process.env.TESTING;
const EARLY_ACCESS = process.env.EARLY_ACCESS;
const ETHER_NETWORK = process.env.ETHER_NETWORK;
const API_KEY = process.env.API_KEY;
const WALLET_KEY = process.env.WALLET_KEY;
const SYSTEM_WALLET = "0xFf5E190e1362605a39Dd7a235Ba69F5f14FE1430";
const ALCHEMY_KEY = process.env.ALCHEMY_KEY;
const ALCHEMY_KEY_TEST = process.env.ALCHEMY_KEY_TEST;
const INFURA_KEY = process.env.INFURA_KEY;
const POCKET_KEY = process.env.POCKET_KEY;

const {
  abi: testAbi,
  bytecode: testByteCode,
  address: testAddress,
} = require("./src/abi/test_contract.json");

const {
  abi: newAbi,
  bytecode: newByteCode,
  address: newAddress,
} = require("./src/abi/new_contract.json");

app.use(express.json());
app.use(express.static(path.join(__dirname, "build")));

app.post("/mint", async (req, res) => {
  const body = req.body;
  if (!body || !body.address || !body.amount) {
    res.status(500).json({
      message: "Bad post body",
    });
    return;
  }

  if (body.amount != 1) {
        res.status(500).json({
          message: "You can only mint 1",
        });
        return;
  }

  const address = body.address.toLowerCase();
  const amount = body.amount;

  // Get owned OG tokens
  let ogTokenResponse = await getOwnedTokensOG(
    address.toLowerCase(),
    testAddress
  );
  let ogTokens = ogTokenResponse.tokens;
  if (ogTokenResponse.pageKey) {
    let moreTokens = await getOwnedTokensOG(
      address.toLowerCase(),
      testAddress,
      ogTokenResponse.pageKey
    );
    ogTokens.push(moreTokens);
  }

  // Get redeemed tokens
  let redeemedTokens = await getOwnedTokensNewContract(
    address.toLowerCase(),
    newAddress
  );
  // Get burned OG tokens
  let burnedTokens = await getNumberOfTokensBurned(
    address.toLowerCase(),
    testAddress
  );

  if (!ogTokens) {
    res.status(500).json({ message: "Server error" });
    return;
  }

  // Check if already redeemed
  if (ogTokens.length >= 50 && redeemedTokens.length >= 2) {
    res.status(500).json({ message: "You have already redeemed 2 tokens" });
    return;
  } else if (ogTokens.length < 50 && redeemedTokens.length >= 1) {
    res.status(500).json({ message: "You have already redeemed 1 token" });
    return;
  }

  let sign = signing(address, 1);
  res.status(200).json(sign);
});

/* ======================= API CALLS ======================= */
const getNumberOfTokensBurned = async (address, contractAddress) => {
  let alchemyKey = ETHER_NETWORK === "mainnet" ? ALCHEMY_KEY : ALCHEMY_KEY_TEST;
  const options = {
    method: "POST",
    url: `https://eth-${ETHER_NETWORK}.g.alchemy.com/v2/${alchemyKey}`,
    headers: { accept: "application/json", "content-type": "application/json" },
    data: {
      id: 1,
      jsonrpc: "2.0",
      method: "alchemy_getAssetTransfers",
      params: [
        {
          fromAddress: address,
          contractAddresses: [contractAddress],
          toAddress: NULL_ADDRESS,
          category: ["erc721"],
          withMetadata: true,
        },
      ],
    },
  };
  return await axios
    .request(options)
    .then(function (response) {
      let transfers = response.data.result.transfers;
      if (!transfers) {
        return [];
      }
      return transfers.map((transfer) => {
        /*
        Enable in future burns
        let date = transfer.metadata.blockTimestamp;
        let parsedDate = Date.parse(date);
        check parsedDate > DROP_START_DATE
        */
        return transfer.hash;
      });
    })
    .catch(function (error) {
      console.error(error);
    });
};

const getTransferredAlchemy = async (address, contractAddress) => {
  let alchemyKey = ETHER_NETWORK === "mainnet" ? ALCHEMY_KEY : ALCHEMY_KEY_TEST;
  const options = {
    method: "POST",
    url: `https://eth-${ETHER_NETWORK}.g.alchemy.com/v2/${alchemyKey}`,
    headers: { accept: "application/json", "content-type": "application/json" },
    data: {
      id: 1,
      jsonrpc: "2.0",
      method: "alchemy_getAssetTransfers",
      params: [
        {
          fromAddress: "0x0000000000000000000000000000000000000000",
          contractAddresses: [contractAddress],
          toAddress: address,
          category: ["erc721"],
          withMetadata: true,
        },
      ],
    },
  };
  return await axios
    .request(options)
    .then(function (response) {
      let transfers = response.data.result.transfers;
      if (!transfers) {
        return [];
      }
      return transfers.map((transfer) => {
        return transfer.hash;
      });
    })
    .catch(function (error) {
      console.error(error);
    });
};

const getLimitedEditionMintedAlchemy = async (address, contractAddress) => {
  let alchemyKey = ETHER_NETWORK === "mainnet" ? ALCHEMY_KEY : ALCHEMY_KEY_TEST;
  const options = {
    method: "GET",
    url: `https://eth-${ETHER_NETWORK}.g.alchemy.com/nft/v2/${alchemyKey}/getNFTs`,
    params: {
      owner: address,
      contractAddresses: [contractAddress],
      withMetadata: true,
    },
    headers: { accept: "application/json" },
  };

  return axios
    .request(options)
    .then((response) => {
      let responseData = response.data;
      let tokens = responseData.ownedNfts;

      if (!tokens || tokens.length == 0) {
        console.log("No tokens found.");
        return false;
      }

      let ownedLimitedEdition = false;
      tokens.forEach((token) => {
        let attributes = token.metadata.attributes;
        let type;
        if (attributes) {
          attributes.forEach((attribute) => {
            if (
              attribute.trait_type === "Type" &&
              attribute.value.startsWith("SOTY")
            ) {
              ownedLimitedEdition = true;
            }
          });
        }
      });
      return ownedLimitedEdition;
    })
    .catch((err) => {
      console.log(err);
    });
};

const nonSotyCanMint = (ogTokens) => {
  let coffeeCup = 0;
  let vx = 0;
  let keyset = 0;
  let trafficCone = 0;
  ogTokens.map((token) => {
    if (token.type === "Coffee Cup") {
      coffeeCup++;
    } else if (token.type === "VX") {
      vx++;
    } else if (token.type === "Keyset") {
      keyset++;
    } else if (token.type === "Traffic Cone") {
      trafficCone++;
    }
  });
  return coffeeCup > 0 && vx > 0 && keyset > 0 && trafficCone > 0;
};

const getOwnedTokensOG = async (address, contractAddress, page) => {
  let alchemyKey = ETHER_NETWORK === "mainnet" ? ALCHEMY_KEY : ALCHEMY_KEY_TEST;

  let options;
  if (page) {
    options = {
      method: "GET",
      url: `https://eth-${ETHER_NETWORK}.g.alchemy.com/nft/v2/${alchemyKey}/getNFTs`,
      params: {
        pageKey: page,
        owner: address,
        contractAddresses: [contractAddress],
        withMetadata: "true",
      },
      headers: { accept: "application/json" },
    };
  } else {
    options = {
      method: "GET",
      url: `https://eth-${ETHER_NETWORK}.g.alchemy.com/nft/v2/${alchemyKey}/getNFTs`,
      params: {
        owner: address,
        contractAddresses: [contractAddress],
        withMetadata: "true",
      },
      headers: { accept: "application/json" },
    };
  }
  return axios
    .request(options)
    .then((response) => {
      let responseData = response.data;
      let tokens = responseData.ownedNfts;
      let pageKey;
      if (responseData.pageKey) {
        pageKey = responseData.pageKey;
      }

      let tokenIds = [];
      if (!tokens || tokens.length == 0) {
        return tokenIds;
      }
      tokens.forEach((token) => {
        let attributes = token.metadata.attributes;
        let type;
        if (attributes) {
          attributes.forEach((attribute) => {
            if (attribute.trait_type === "Type") {
              type = attribute.value;
            }
          });
        }

        let imageUri = token.metadata.image;
        if (imageUri) {
          imageUri = imageUri.replace(
            "ipfs://",
            "https://nftstorage.link/ipfs/"
          );
          let tokenId = parseInt(token.id.tokenId, 16);
          tokenIds.push({
            tokenId: tokenId,
            imageUri: imageUri,
            type: type,
          });
        }
      });
      return { tokens: tokenIds, pageKey: pageKey };
    })
    .catch((err) => {
      console.log(err);
    });
};

const getTotalTokens = async (contractAddress) => {
  let alchemyKey = ETHER_NETWORK === "mainnet" ? ALCHEMY_KEY : ALCHEMY_KEY_TEST;
  const options = {
    method: "GET",
    url: `https://eth-${ETHER_NETWORK}.g.alchemy.com/nft/v2/${alchemyKey}/getNFTsForCollection`,
    params: {
      contractAddress: contractAddress,
      withMetadata: "true",
    },
    headers: { accept: "application/json" },
  };
  return axios
    .request(options)
    .then((response) => {
      let responseData = response.data;
      return responseData.nfts.length;
    })
    .catch((err) => {
      console.log(err);
    });
};

const getOwnedTokensNewContract = async (address, contractAddress) => {
  let alchemyKey = ETHER_NETWORK === "mainnet" ? ALCHEMY_KEY : ALCHEMY_KEY_TEST;
  const options = {
    method: "GET",
    url: `https://eth-${ETHER_NETWORK}.g.alchemy.com/nft/v2/${alchemyKey}/getNFTs`,
    params: {
      owner: address,
      contractAddresses: [contractAddress],
      withMetadata: "true",
    },
    headers: { accept: "application/json" },
  };
  return axios
    .request(options)
    .then((response) => {
      let responseData = response.data;
      let tokens = responseData.ownedNfts;

      let tokenIds = [];
      if (!tokens || tokens.length == 0) {
        console.log("No tokens found.");
        return tokenIds;
      }
      tokens.forEach((token) => {
        if (token.metadata && token.metadata.attributes) {
          let isLimitedEdition = false;
          token.metadata.attributes.forEach((attribute) => {
            if (
              attribute.trait_type === "Type" &&
              attribute.value.startsWith("SOTY")
            ) {
              isLimitedEdition = true;
            }
          });
          if (!isLimitedEdition) {
            let tokenId = parseInt(token.id.tokenId, 16);
            tokenIds.push({
              tokenId: tokenId,
            });
          }
        }
      });
      return tokenIds;
    })
    .catch((err) => {
      console.log(err);
    });
};

app.post("/owned", async (req, res) => {
  const body = req.body;
  if (!body) {
    res.status(500).json({
      message: "No post body",
    });
    return;
  }

  const address = body.address;
  if (!address) {
    res.status(500).json({
      message: "No Address in post body",
    });
    return;
  }

  console.log(`Fetching image urls for ${address}`);

  // Get owned OG tokens
  let ogTokenResponse = await getOwnedTokensOG(
    address.toLowerCase(),
    testAddress
  );
  let ogTokens = ogTokenResponse.tokens;
  if (ogTokenResponse.pageKey) {
    let moreTokens = await getOwnedTokensOG(
      address.toLowerCase(),
      testAddress,
      ogTokenResponse.pageKey
    );
    ogTokens = ogTokens.concat(moreTokens.tokens);
  }

  // Get redeemed tokens
  let redeemedTokens = await getOwnedTokensNewContract(
    address.toLowerCase(),
    newAddress
  );

  // Get burned OG tokens
  let burnedTokens = await getNumberOfTokensBurned(
    address.toLowerCase(),
    testAddress
  );

  // Get redeemed status
  let redeemed = true;

  let numTokens = await getTotalTokens(newAddress);
  if (numTokens >= BURN_MAX) {
    res.status(500).json({ message: "All new NFTs have been claimed." });
    return;
  }

  console.log(`OG Images fetched for ${address}`);

  // Check if wallet has 90s Kids Tokens
  if (!ogTokens) {
    res.status(500).json({ message: "You have no owned tokens." });
    return;
  }

  if (ogTokens.length == 0) {
    res.status(500).json({ message: "You have no owned tokens." });
    return;
  }

  let originallyOwned = ogTokens.length + burnedTokens.length;
    if (originallyOwned >= 50) {
              res
                .status(500)
                .json({ message: "You have already redeemed your tokens." });
              return;
    }

  // If someone burned and didn't redeem, always resume
  if (
    originallyOwned < 50 &&
    burnedTokens.length == 1 &&
    redeemedTokens.length < 1
  ) {
    res.status(200).json({
      tokens: ogTokens,
      numToMint: 1,
      redeemed: redeemed,
      burnedHashes: burnedTokens,
    });
    return;
  } else if (
    originallyOwned < 50 &&
    burnedTokens.length == 1 &&
    redeemedTokens.length == 1
  ) {
    res.status(200).json({
      tokens: ogTokens,
      numToMint: 0,
      redeemed: redeemed,
      burnedHashes: burnedTokens,
    });
    return;
  }

  if (ogTokens.length < 50) {
    // Check if wallet has all 4 types
    if (!nonSotyCanMint(ogTokens)) {
      res.status(500).json({
        message:
          "You must have all 4 NFTs types to participate. (VX, Coffee Cup, Keyset, Traffic Cone)",
      });
      return;
      // Check if wallet already redeemed
    } else if (redeemedTokens.length >= 1) {
      res
        .status(500)
        .json({ message: "You have already redeemed your tokens." });
      return;
    } else {
      res.status(200).json({ tokens: ogTokens });
    }
  }
});

const web3Instance = new web3(process.env.MAINNET_RPC_URL);

const generateNonce = () => {
  return crypto.randomBytes(16).toString("hex");
};

const mintMsgHash = (recipient, amount, newNonce, contract) => {
  return (
    web3Instance.utils.soliditySha3(
      { t: "address", v: recipient },
      { t: "uint256", v: amount },
      { t: "string", v: newNonce },
      { t: "address", v: contract }
    ) || ""
  );
};

const signMessage = (msgHash, privateKey) => {
  return web3Instance.eth.accounts.sign(msgHash, privateKey);
};

const signing = (address, amount) => {
  const newNonce = generateNonce();

  const hash = mintMsgHash(address, amount, newNonce, newAddress);

  const signer = signMessage(hash, WALLET_KEY);

  return {
    amount: amount,
    nonce: newNonce,
    hash: signer.message,
    signature: signer.signature,
  };
};

app.get("*", (req, res) => res.sendFile(path.resolve("build", "index.html")));
app.listen(port, () => console.log(`90s kids listening on port ${port}!`));
