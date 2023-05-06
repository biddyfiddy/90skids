const express = require("express");
const path = require("path");
const web3 = require("web3");
const crypto = require("crypto");
const ethers = require("ethers");
const axios = require("axios");
const app = express();
const port = process.env.PORT || 3001;

const SOTY = 50; // 50
const BURN_MAX = 664; // 400 + 250 + 14 shitty tokens  (414 from old 250 new)
const BASE_NUM = 449; //  token id of the last mint of the previous month
const LIMITED_EDITION_BASE_NUM = 50; // 50

const DROP_START_DATE = Date.parse(process.env.DROP_DATE);
const NULL_ADDRESS = "0x000000000000000000000000000000000000dead";
const TESTING = process.env.TESTING;
const EARLY_ACCESS = 1;
//const EARLY_ACCESS = process.env.EARLY_ACCESS;
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

/*app.post("/mintTemp", async (req, res) => {
  const body = req.body;
  const address = body.address.toLowerCase();
  const amount = body.amount;
  let sign = signing(address, amount);
  res.status(200).json(sign);
});*/

/* ======================= ENDPOINTS ======================= */
app.post("/redeemed", async (req, res) => {
  const body = req.body;
  if (!body || !body.address) {
    res.status(500).json({
      message: "Bad post body",
    });
    return;
  }
  const address = body.address.toLowerCase();

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

  // Break out early if the account is not a soty
  if (!ogTokens || ogTokens.length < SOTY) {
    res.status(200).json({
      redeemed: true,
    });
    return;
  }

  // Get redeemed status
  let redeemed = await getLimitedEditionMintedAlchemy(
    address.toLowerCase(),
    newAddress
  );

  res.status(200).json({
    redeemed: redeemed,
  });
});

app.post("/mintLimitedEdition", async (req, res) => {
  const body = req.body;
  if (!body || !body.address || !body.amount) {
    res.status(500).json({
      message: "Bad post body",
    });
    return;
  }

  const address = body.address.toLowerCase();
  const amount = body.amount;

  // Check for malicious people doing malicious shit
  if (amount != 1) {
    res.status(500).json({
      message: "Who the fuck do you think you are?",
    });
    return;
  }

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
  // Check for SOTY
  if (!ogTokens || ogTokens.length < SOTY) {
    res.status(500).json({
      message: "You cannot claim a limited edition token.",
    });
    return;
  }

  // Get redeemed status
  let redeemed = await getLimitedEditionMintedAlchemy(
    address.toLowerCase(),
    newAddress
  );

  if (redeemed) {
    res.status(500).json({
      message: "You have already redeemed your limited edition token.",
    });
    return;
  } else if (ogTokens.length < SOTY) {
    res.status(500).json({
      message: "You cannot claim a limited edition token.",
    });
    return;
  }

  let sign = signing(address, amount);
  res.status(200).json(sign);
});

app.post("/mint", async (req, res) => {
  const body = req.body;
  if (!body || !body.address || !body.amount) {
    res.status(500).json({
      message: "Bad post body",
    });
    return;
  }

  /*  if (body.amount != 1) {
        res.status(500).json({
          message: "You can only mint 1",
        });
        return;
  }*/

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
    res.status(500).json({ message: "You have no tokens" });
    return;
  }

  // Check if already redeemed
  if (ogTokens.length >= SOTY && redeemedTokens.length >= 2) {
    res.status(500).json({ message: "You have already redeemed 2 tokens" });
    return;
  } else if (ogTokens.length < SOTY && redeemedTokens.length >= 1) {
    res.status(500).json({ message: "You have already redeemed 1 token" });
    return;
  }

  let sign = signing(address, amount);
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
      return transfers
        .filter((transfer) => {
          let date = transfer.metadata.blockTimestamp;
          let parsedDate = Date.parse(date);
          return parsedDate > DROP_START_DATE;
        })
        .map((transfer) => {
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
            let sotyString = attribute.value;
            let sotyNumber = parseInt(
              sotyString.replace("SOTY Edition #", ""),
              10
            );
            if (
              attribute.trait_type === "Type" &&
              sotyString.startsWith("SOTY Edition #") &&
              sotyNumber > LIMITED_EDITION_BASE_NUM
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

const getTotalTokens = async (contractAddress, startToken) => {
  let alchemyKey = ETHER_NETWORK === "mainnet" ? ALCHEMY_KEY : ALCHEMY_KEY_TEST;
  let options;
  if (startToken) {
    options = {
      method: "GET",
      url: `https://eth-${ETHER_NETWORK}.g.alchemy.com/nft/v2/${alchemyKey}/getNFTsForCollection`,
      params: {
        startToken: startToken,
        contractAddress: contractAddress,
        withMetadata: "true",
      },
      headers: { accept: "application/json" },
    };
  } else {
    options = {
      method: "GET",
      url: `https://eth-${ETHER_NETWORK}.g.alchemy.com/nft/v2/${alchemyKey}/getNFTsForCollection`,
      params: {
        contractAddress: contractAddress,
        withMetadata: "true",
      },
      headers: { accept: "application/json" },
    };
  }

  return axios
    .request(options)
    .then((response) => {
      let responseData = response.data;
      let nextToken = undefined;

      // If response has nextToken, we need to page
      if (responseData.nextToken) {
        nextToken = responseData.nextToken;
      }

      // If response has tokens, use them
      let tokens = []
      if (responseData.nfts && responseData.nfts.length > 0) {
        tokens = responseData.nfts
      }

      // Filter non-soty tokens to count number of generic tokens claimed
      tokens = tokens
              .filter((token) => {
                let title = token.title
                return !token.title.startsWith("SOTY Edition");
              })
      // Return the amount of generic tokens in the page, and the start of the next page
      return {
        number: tokens.length,
        nextToken: nextToken
      }
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
          let tokenId = parseInt(token.id.tokenId, 16);
          if (!isLimitedEdition && tokenId > BASE_NUM) {
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

  let totalTokensResponse = await getTotalTokens(newAddress);
  let numTokens = totalTokensResponse.number;
  while (totalTokensResponse.nextToken) {
    totalTokensResponse = await getTotalTokens(newAddress, totalTokensResponse.nextToken);
    numTokens += totalTokensResponse.number;
  }

  console.log("Total General Tokens Claimed : " + numTokens);

  if (numTokens >= BURN_MAX) {
    res.status(500).json({ message: "All NFTs from this drop have been claimed." });
    return;
  }

  // Check if wallet has 90s Kids Tokens
  if (!ogTokens) {
    res.status(500).json({ message: "You have no owned tokens." });
    return;
  }

  if (ogTokens.length == 0) {
    res.status(500).json({ message: "You have no owned tokens." });
    return;
  }

  console.log(
    `OG Images fetched for ${address} (originals : ${ogTokens.length})(redeemed : ${redeemedTokens.length})`
  );

  let originallyOwned = ogTokens.length + burnedTokens.length;
  // If someone burned and didn't redeem, always resume
  if (
    TESTING == 0 &&
    originallyOwned >= SOTY &&
    burnedTokens.length == 2 &&
    redeemedTokens.length == 1
  ) {
    res.status(200).json({
      tokens: ogTokens,
      numToMint: 1,
      burnedHashes: burnedTokens,
    });
    return;
  } else if (
    TESTING == 0 &&
    originallyOwned >= SOTY &&
    burnedTokens.length == 2 &&
    redeemedTokens.length == 0
  ) {
    res.status(200).json({
      tokens: ogTokens,
      numToMint: 2,
      burnedHashes: burnedTokens,
    });
    return;
  } else if (
    TESTING == 0 &&
    originallyOwned >= SOTY &&
    burnedTokens.length == 1 &&
    redeemedTokens.length == 0
  ) {
    res.status(200).json({
      tokens: ogTokens,
      numToMint: 2,
      burnedHashes: burnedTokens,
    });
    return;
  } else if (
    TESTING == 0 &&
    originallyOwned >= SOTY &&
    burnedTokens.length == 2 &&
    redeemedTokens.length == 2
  ) {
    res.status(200).json({
      tokens: ogTokens,
      numToMint: 0,
      burnedHashes: burnedTokens,
    });
    return;
  } else if (
    TESTING == 0 &&
    originallyOwned < SOTY &&
    burnedTokens.length == 1 &&
    redeemedTokens.length < 1
  ) {
    res.status(200).json({
      tokens: ogTokens,
      numToMint: 1,
      burnedHashes: burnedTokens,
    });
    return;
  } else if (
    TESTING == 0 &&
    originallyOwned < SOTY &&
    burnedTokens.length == 1 &&
    redeemedTokens.length == 1
  ) {
    res.status(200).json({
      tokens: ogTokens,
      numToMint: 0,
      burnedHashes: burnedTokens,
    });
    return;
  }

  /*
    Early Access:
        Only SOTY members can burn 2 / claim 2  and redeem special tokens
    Normal Access:
        SOTY members can burn 2 / claim 2  and redeem special tokens
        Non SOTY members can burn 1 / claim 1
  */

  if (EARLY_ACCESS == 1 && ogTokens.length >= SOTY) {
    // Check if already redeemed
    if (TESTING == 0 && redeemedTokens.length >= 2) {
      res
        .status(500)
        .json({ message: "You have already redeemed your tokens." });
      return;
    } else {
      res.status(200).json({ tokens: ogTokens });
    }
  } else if (EARLY_ACCESS == 1 && ogTokens.length < SOTY) {
    res.status(500).json({ message: "Only SOTY members get early access" });
    return;
  }

  if (EARLY_ACCESS == 0 && ogTokens.length >= SOTY) {
    if (TESTING == 0 && redeemedTokens.length >= 2) {
      res
        .status(500)
        .json({ message: "You have already redeemed your tokens." });
      return;
    } else {
      res.status(200).json({ tokens: ogTokens });
    }
  } else if (EARLY_ACCESS == 0 && ogTokens.length < SOTY) {
    // Check if wallet has all 4 types
    if (!nonSotyCanMint(ogTokens)) {
      res.status(500).json({
        message:
          "You must have all 4 NFTs types to participate. (VX, Coffee Cup, Keyset, Traffic Cone)",
      });
      return;
      // Check if wallet already redeemed
    } else if (TESTING == 0 && redeemedTokens.length >= 1) {
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
