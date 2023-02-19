const express = require("express");
const path = require("path");
const web3 = require("web3");
const crypto = require("crypto");
const ethers = require("ethers");
const axios = require("axios");
const app = express();
const port = process.env.PORT || 3001;

const NULL_ADDRESS = "0x000000000000000000000000000000000000dead";

const EARLY_ACCESS = process.env.EARLY_ACCESS;
const ETHER_NETWORK = process.env.ETHER_NETWORK;
const API_KEY = process.env.API_KEY;
const WALLET_KEY = process.env.WALLET_KEY;

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

const mintMsgHash = (recipient, uri, newNonce, contract) => {
  return (
    web3Instance.utils.soliditySha3(
      { t: "address", v: recipient },
      { t: "string", v: uri },
      { t: "string", v: newNonce },
      { t: "address", v: contract }
    ) || ""
  );
};

const signMessage = (msgHash, privateKey) => {
  return web3Instance.eth.accounts.sign(msgHash, privateKey);
};

const signing = (address, uri) => {
  const newNonce = generateNonce();

  const hash = mintMsgHash(address, uri, newNonce, newAddress);

  const signner = signMessage(hash, WALLET_KEY);

  return {
    uri: uri,
    nonce: newNonce,
    hash: signner.message,
    signature: signner.signature,
  };
};

app.post("/mint", async (req, res) => {
  const body = req.body;
  if (!body) {
    res.status(500).json({
      message: "No post body",
    });
    return;
  }

  const address = body.address.toLowerCase();
  if (!address) {
    res.status(500).json({
      message: "No Address in post body",
    });
    return;
  }

  let uri = "ipfs://QmP4mykhP5HZ45H5qtLLWBZVbnVaakQripoX7m5dKKS9pF/2396";

  let sign = signing(address, uri);
  res.status(200).json(sign);
});

const getBurned = async (address) => {
  let network = ETHER_NETWORK === "mainnet" ? "" : `-${ETHER_NETWORK}`;
  return await axios
    .get(
      `https://api${network}.etherscan.io/api?module=account&action=tokennfttx&contractaddress=${testAddress}&address=${address}&page=1&offset=100&startblock=0&endblock=27025780&sort=asc&apikey=${API_KEY}`
    )
    .then((response) => {
      let responseData = response.data;
      let tokens = responseData.result;

      let tokenId = [];
      if (!tokens) {
        return tokenId;
      }
      tokens.forEach((token) => {
        if (token.to === NULL_ADDRESS) {
          tokenId.push(token.tokenID);
        }
      });

      return tokenId;
    })
    .catch((err) => {
      console.log(err);
    });
};

const getOwnedTokens = async (address) => {
  let network = ETHER_NETWORK === "mainnet" ? "" : `-${ETHER_NETWORK}`;
  return axios
    .get(
      `https://api${network}.etherscan.io/api?module=account&action=tokennfttx&contractaddress=${testAddress}&address=${address}&page=1&offset=100&startblock=0&endblock=27025780&sort=asc&apikey=${API_KEY}`
    )
    .then((response) => {
      let responseData = response.data;
      let tokens = responseData.result;
      let tokenId = [];
      if (!tokens) {
        return tokenId;
      }
      tokens.forEach((token) => {
        if (token.to === address) {
          tokenId.push(token.tokenID);
        }
      });

      tokens.forEach((token) => {
        if (token.from === address) {
          tokenId.splice(tokenId.indexOf(token.tokenID), 1);
        }
      });

      return tokenId;
    })
    .catch((err) => {
      console.log(err);
    });
};

app.post("/burned", async (req, res) => {
  const body = req.body;
  if (!body) {
    res.status(500).json({
      message: "No post body",
    });
    return;
  }

  const address = body.address.toLowerCase();
  if (!address) {
    res.status(500).json({
      message: "No Address in post body",
    });
    return;
  }

  let burned = await getBurned(address);

  res.status(200).json(burned);
});

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

  let tokens = await getOwnedTokens(address.toLowerCase());

  if (!tokens) {
    res.status(500).json({ message: "Could not get owned tokens" });
    return;
  }

  if (EARLY_ACCESS == 1 && tokens.length < 50) {
    res.status(500).json({ message: "Only SOTY members get early access" });
    return;
  }

  let burned = await getBurned(address.toLowerCase());
  /*  if (tokens.length < 50 && burned.length > 1) {
    res.status(500).json({ message: "Tokens already redeemed" });
    return;
  } else if (tokens.length >= 50 && burned.length > 2) {
    res.status(500).json({ message: "Tokens already redeemed" });
    return;
  }*/

  let provider = new ethers.providers.EtherscanProvider(ETHER_NETWORK, API_KEY);
  const contract = new ethers.Contract(testAddress, testAbi, provider);

  let imageUris = tokens.map(async (token) => {
    let uri = await contract.tokenURI(token);
    uri = uri.replace("ipfs://", "https://nftstorage.link/ipfs/");
    let imageUri;
    let response = await axios
      .get(uri, {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      })
      .then((response) => {
        let responseData = response.data;
        imageUri = responseData.image.replace(
          "ipfs://",
          "https://nftstorage.link/ipfs/"
        );
      });

    return {
      tokenId: token,
      imageUri: imageUri,
    };
  });

  if (!imageUris) {
    res.status(500).json({ message: "Could not get owned tokens." });
    return;
  }

  if (imageUris.length == 0) {
    res.status(500).json({ message: "You have no owned tokens." });
    return;
  }

  let responseUris = await Promise.all(imageUris);
  console.log(`Images fetched for ${address}`);
  if (responseUris) {
    res.status(200).json(responseUris);
  } else {
    res.status(500).json({ message: "Could not get owned tokens" });
  }
});

app.get("*", (req, res) => res.sendFile(path.resolve("build", "index.html")));
app.listen(port, () => console.log(`Example app listening on port ${port}!`));
