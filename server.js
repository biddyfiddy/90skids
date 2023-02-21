const express = require("express");
const path = require("path");
const web3 = require("web3");
const crypto = require("crypto");
const ethers = require("ethers");
const axios = require("axios");
const app = express();
const port = process.env.PORT || 3001;

const NULL_ADDRESS = "0x000000000000000000000000000000000000dead";
const TESTING = process.env.TESTING;
const EARLY_ACCESS = process.env.EARLY_ACCESS;
const ETHER_NETWORK = process.env.ETHER_NETWORK;
const API_KEY = process.env.API_KEY;
const WALLET_KEY = process.env.WALLET_KEY;
const ALCHEMY_KEY = process.env.ALCHEMY_KEY;
const ALCHEMY_KEY_TEST = process.env.ALCHEMY_KEY_TEST;
const INFURA_KEY = process.env.INFURA_KEY;
const POCKET_KEY = process.env.POCKET_KEY;

const {
  abi: ogAbi,
  bytecode: ogByteCode,
  address: ogAddress,
} = require("./src/abi/og_contract.json");

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

  const signner = signMessage(hash, WALLET_KEY);

  return {
    amount: amount,
    nonce: newNonce,
    hash: signner.message,
    signature: signner.signature,
  };
};

app.post("/mint", async (req, res) => {
  const body = req.body;
  if (!body || !body.address || !body.amount) {
    res.status(500).json({
      message: "Bad post body",
    });
    return;
  }

  const address = body.address.toLowerCase();
  const amount = body.amount;

  // Get owned OG tokens
  let ogTokens = await getOwnedTokensAlchemy(
    address.toLowerCase(),
    testAddress
  );
  // Get redeemed tokens
  let redeemedTokens = await getOwnedTokensAlchemy(
    address.toLowerCase(),
    newAddress
  );
  // Get burned OG tokens
  let burnedTokens = await getBurnedAlchemy(address.toLowerCase(), testAddress);

  // mint if:
  // is soty and burned != redeemed
  // is soty and burned == 1 and redeemed == 0

  let sign = signing(address, amount);
  res.status(200).json(sign);
});

const getBurnedAlchemy = async (address, contractAddress) => {
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
          contractAddress: [contractAddress],
          toAddress: NULL_ADDRESS,
          category: ["erc721"],
          withMetadata: false,
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

const getOwnedTokensAlchemy = async (address, contractAddress) => {
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
      if (!tokens) {
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

        let imageUriRaw = token.metadata.image;
        let imageUri = imageUriRaw.replace(
          "ipfs://",
          "https://nftstorage.link/ipfs/"
        );
        let tokenId = parseInt(token.id.tokenId, 16);
        tokenIds.push({
          tokenId: tokenId,
          imageUri: imageUri,
          type: type,
        });
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
  let ogTokens = await getOwnedTokensAlchemy(
    address.toLowerCase(),
    testAddress
  );
  // Get redeemed tokens
  let redeemedTokens = await getOwnedTokensAlchemy(
    address.toLowerCase(),
    newAddress
  );
  // Get burned OG tokens
  let burnedTokens = await getBurnedAlchemy(address.toLowerCase(), testAddress);

  console.log(`OG Images fetched for ${address}`);

  // Check if wallet has 90s Kids Tokens
  if (!ogTokens) {
    res.status(500).json({ message: "Could not get owned tokens" });
    return;
  }

  if (ogTokens.length == 0) {
    res.status(500).json({ message: "You have no owned tokens." });
    return;
  }

  // If someone burned and couldn't redeem, always resume
  if (!TESTING && burnedTokens.length != redeemedTokens.length) {
    res.status(200).json({
      tokens: ogTokens,
      numToMint: burnedTokens.length - redeemedTokens.length,
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
  if (EARLY_ACCESS == 1 && ogTokens.length >= 50) {
    // Check if already redeemed
    if (!TESTING && redeemedTokens.length >= 2) {
      res
        .status(500)
        .json({ message: "You have already redeemed your tokens." });
      return;
    } else {
      res.status(200).json({ tokens: ogTokens });
    }
  } else if (EARLY_ACCESS == 1 && ogTokens.length < 50) {
    res.status(500).json({ message: "Only SOTY members get early access" });
    return;
  }

  if (EARLY_ACCESS == 0 && ogTokens.length >= 50) {
    if (!TESTING && redeemedTokens.length >= 2) {
      res
        .status(500)
        .json({ message: "You have already redeemed your tokens." });
      return;
    } else {
      res.status(200).json({ tokens: ogTokens });
    }
  } else if (EARLY_ACCESS == 0 && ogTokens.length < 50) {
    // Check if wallet has all 4 types
    if (!nonSotyCanMint(ogTokens)) {
      res.status(500).json({
        message:
          "You must have all 4 NFTs types to participate. (VX, Coffee Cup, Keyset, Traffic Cone)",
      });
      return;
      // Check if wallet already redeemed
    } else if (!TESTING && redeemedTokens.length >= 1) {
      res
        .status(500)
        .json({ message: "You have already redeemed your tokens." });
      return;
    } else {
      res.status(200).json({ tokens: ogTokens });
    }
  }
});

app.get("*", (req, res) => res.sendFile(path.resolve("build", "index.html")));
app.listen(port, () => console.log(`90s kids listening on port ${port}!`));
