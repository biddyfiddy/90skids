const express = require("express");
const path = require("path");
const web3 = require("web3");
const crypto = require("crypto");
const ethers = require("ethers");
const axios = require("axios");
const app = express();
const port = process.env.PORT || 3001;

const NULL_ADDRESS = "0x0000000000000000000000000000000000000000";

const EARLY_ACCESS = process.env.EARLY_ACCESS;
const ETHER_NETWORK = process.env.ETHER_NETWORK;
const API_KEY = process.env.API_KEY;

const {
  abi: ogAbi,
  ogByteCode,
  address: ogAddress,
} = require("./src/abi/og_contract.json");

const {
  abi: testAbi,
  testByteCode,
  address: testAddress,
} = require("./src/abi/test_contract.json");

app.use(express.json());
app.use(express.static(path.join(__dirname, "build")));

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

  let network = ETHER_NETWORK === "mainnet" ? "" : `-${ETHER_NETWORK}`;
  let burned = await axios
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

    console.log(burned);

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

 /*return res.status(200).json([
               "https://nftstorage.link/ipfs/QmXCdfwNjocw9ENQR8mHzCoevc5sZHaePyZGosmqXt4X5p",
               "https://nftstorage.link/ipfs/QmYrLprksr7tMJxirrhRTFYNSWNA6AHTQezCmo9BSYbBcS",
               "https://nftstorage.link/ipfs/QmZQWuDDUQcMCtkRwHimR8KMNaPqT3QrZg91uJxRaUcw9J",
               "https://nftstorage.link/ipfs/QmfMvceU7nu4ofQy3CJP5FR4UsDTVDsj9QRbGxFaNeEeX9",
               "https://nftstorage.link/ipfs/QmZCy3FBcab63zgpFm4kXYCybsoA8jtkUhjaSzs9GXRMwC",
               "https://nftstorage.link/ipfs/QmbVXMcMmQUs1fBbqeguBgokTTUvC5ASQwmCWfmp3niG26",
               "https://nftstorage.link/ipfs/QmRVwzsR4MUf8a4jnwkZo4B1G7p2a2AR18dizrd2gno9vf",
               "https://nftstorage.link/ipfs/QmRCqZvLNu3KbXvMr3Xn6wP19AAoa4A6Yj1kVZFF6mB7cg",
               "https://nftstorage.link/ipfs/QmPqGNjx6GnN4JWcDL5NYv87xiKyTQW6N3NYos1qwpWrGF",
               "https://nftstorage.link/ipfs/QmdmjsU1pQHZqDNXBmPR79ByiDqEK1RpEibPDiDzno4zyT",
               "https://nftstorage.link/ipfs/Qmcq3ucpbcVFB5XUuQWNvfkrMtKehHuNKc9r5Eg5gR4Zjz",
               "https://nftstorage.link/ipfs/Qmb7bkLXLmouL8u3xv7ykUxNhFSbh4dAQLYKgk5erwUuMP",
               "https://nftstorage.link/ipfs/QmXUxQGceD35nmEcru5WpdSyJuhiuAkKmsm92Y4rNukTq9",
               "https://nftstorage.link/ipfs/QmZ9Ecwu5CPGvtDoT712WbRRkjSPdtYiozC9Qa8WuW2PkP",
               "https://nftstorage.link/ipfs/QmckVawm26Gt3wcT3jbhZmupdWxjjAdisy68omcxc2foCw",
               "https://nftstorage.link/ipfs/QmTkEWBbHqnHh3ENLLfm1o8hj2AGme7Y3Ky1JmoKNS9LsC",
               "https://nftstorage.link/ipfs/Qmdc7385pDE7tF4hsp6pDR8gQ6aCsPnebvQBW9Et2PEUD8",
               "https://nftstorage.link/ipfs/QmPcjcZRVDc7yaNTiNLa8iFXdTrdbb7yQaYJPsKRApdXyJ",
               "https://nftstorage.link/ipfs/QmX29sBxJSrPYjaNittfFTB6hJJ7E1RGantgRMhCXxJFUU",
               "https://nftstorage.link/ipfs/QmRe73AVgM4H45Kkd5izqSoQqqLcy7Gw5kaqwqrULg5KXY",
               "https://nftstorage.link/ipfs/QmYhE9aENbPSCmXckYMh4zCxMU9fT2VnRvbuZVG56cvLMX",
               "https://nftstorage.link/ipfs/QmUJ7ahmh572vEweoiQexfoM7qeumx49mzq3yMFLz1WKDw",
               "https://nftstorage.link/ipfs/QmVnHUXBAZufxZj5DWF4NZGiFyEKtDtpe5zoFgNL1e3a1f",
               "https://nftstorage.link/ipfs/QmZi79MueT675WG95eJLYu7TPxCQU4UgMXbGfK2h4rbWBL",
               "https://nftstorage.link/ipfs/QmanmsNE111HPVHeAHE58JCcnoMqbHJoMV8rwrVJDT6KbR",
               "https://nftstorage.link/ipfs/QmNoUBk9ZvCoMAnEJMbvgiYJHRZcYq9MacnuvWJDTAVZto",
               "https://nftstorage.link/ipfs/QmREFHqk2tkJHp8kNGosMQtSuRoCePdCjGaweo3rJuzpu3",
               "https://nftstorage.link/ipfs/QmRFw1SuTjyVtMZA8S5un7sWZSwTUtQ9zP7psxGKSioTGo",
               "https://nftstorage.link/ipfs/QmQRwFceesM3CdTNyz9bR4wVmMa4zEQQomRsp9oTYD3kFG",
               "https://nftstorage.link/ipfs/QmeHxGght912DxrivmvAVDkG4KCvNGgzss4zHKBrrz4dTV",
               "https://nftstorage.link/ipfs/Qmb3P44ENceHMt6kGv96tVwtbrZ6EWgUUDtTx9aKpYQUev",
               "https://nftstorage.link/ipfs/QmRRhMVg6PKh8AB8tSWeUPZq3J9oPRmuGGp2jXV3MVZd3P",
               "https://nftstorage.link/ipfs/QmaKoWWBZnZ4tEjXgJZpn1MpXTiMA375A1QRcfHb8rCFiB",
               "https://nftstorage.link/ipfs/QmRPzfy2y7YBx7n8UPdQVACKdPsWW4ZHEqnGmMa9v4HBit",
               "https://nftstorage.link/ipfs/QmbkFqkhA59fvpRXHjEWeBJofp3jVSKs7PNvT7sC76Aumc",
               "https://nftstorage.link/ipfs/QmeAGUmCwhwZc85EuL7R53Z8e4WziUkD2rPGgQMZ8q94eL",
               "https://nftstorage.link/ipfs/QmYN78vBrRaGaxwY3yniF2gBjbUKXrfttmFZwwZeRYRxng",
               "https://nftstorage.link/ipfs/QmdgLEhgXpuAP5wGV41UTQ2bMEXd9VSpRynG9kdcswhELd",
               "https://nftstorage.link/ipfs/QmdFTygfUxLiuDeELrgPGRS1BBeh2wXUnyMcaAdn8jtfwg",
               "https://nftstorage.link/ipfs/QmXpRtsPYijjKRpCAWrE3XBcu9beomhyzCJDVxssMfdUHj",
               "https://nftstorage.link/ipfs/QmQnCf4AzvTaU91rnEaWRPQz55FFcLJFfQ5QmPX6X4N2Vq",
               "https://nftstorage.link/ipfs/QmTPXQw5rmTvZyMc1ug981Ru1KpqwbP84BbnyjXC35cm2E",
               "https://nftstorage.link/ipfs/QmS7cs8hYRTNK1YBoXKhsa1uMAfccmrRL36TpVud4Ar8iM",
               "https://nftstorage.link/ipfs/QmTsHvwK9sFcoBho698dkrrGqEG9Rbq5jAsLpHnYKDGo3C",
               "https://nftstorage.link/ipfs/QmNnd4FQcL4bkRCzGrbNYXwDtZpaEzh2LXRVga7zCpQbra",
               "https://nftstorage.link/ipfs/QmVf47Zzp1EqUb1K1jU7v9Q6263kMM2ZysmahJ9YgUhPZx",
               "https://nftstorage.link/ipfs/QmXPAnhc7kujaGGm7i4X3eW15F1Vjzmo81AZEn8ukAiKLk",
               "https://nftstorage.link/ipfs/QmPrb9ai4KYpo5Jsp4y35egWo6ZziEsEQtqYZGD8yPdHdB",
               "https://nftstorage.link/ipfs/QmTaBT28ruqseur151w5ExeBNQSqBH6Gc3GtKiS5KfnNE4",
               "https://nftstorage.link/ipfs/QmTdVV57pEtk8CotWzEZBty2bBxEBE91R8iMsTYfmE8Nef",
               "https://nftstorage.link/ipfs/QmNosygMLkRak3t22sDYV7yPhXwKNiajbrdxbr5iyW1AM6",
               "https://nftstorage.link/ipfs/QmcjympKpkffJoC5k8SzZm1JnMwo8riiVLBLCm5wDa2YFp",
               "https://nftstorage.link/ipfs/QmWkAFc4HFaMGifQr3zn49Qy8ek4ywcTPw6aPbMhAnAdA4",
               "https://nftstorage.link/ipfs/QmRxixSoFEaRC5oSxUSnwmLbnLFzL2SK3CrU7MGdhS2zQ2",
               "https://nftstorage.link/ipfs/QmdM2dvTfQ4pxtTFFVGM3dU2SvBVBYNW9f6fH74UXdNnAp",
               "https://nftstorage.link/ipfs/QmYyRaXUiKBXRU78P6Jvy5AhcWqShMDZYDwzDjXCzrhSyx",
               "https://nftstorage.link/ipfs/QmSeTQdmJ9Hsp31uw27cXahSW4R8zNJxD8gBTxjAx77eXt",
               "https://nftstorage.link/ipfs/QmPFsiCnNPpyep4AJBcZhUnaKguudfuZVutTSdZhzZ5Zpw",
               "https://nftstorage.link/ipfs/QmT76vThYjgbir1AopGApzT2qWRGqaGT6ZqMtwUz3QEUvx",
               "https://nftstorage.link/ipfs/QmYM74RpuHhWiHFVRzCcTX7gFwwXTmbRa6J3XwAPa1SWYL"
           ]);*/

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

    return imageUri;
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

const getOwnedTokens = async (address) => {
  let network = ETHER_NETWORK === "mainnet" ? "" : `-${ETHER_NETWORK}`;
  return axios
    .get(
      `https://api${network}.etherscan.io/api?module=account&action=tokennfttx&contractaddress=${testAddress}&address=${address}&page=1&offset=100&startblock=0&endblock=27025780&sort=asc&apikey=${API_KEY}`
    )
    .then((response) => {
      let responseData = response.data;
      let tokens = responseData.result;
      console.log(address);
      console.log(`https://api${network}.etherscan.io/api?module=account&action=tokennfttx&contractaddress=${testAddress}&address=${address}&page=1&offset=100&startblock=0&endblock=27025780&sort=asc&apikey=${API_KEY}`);
      console.log(responseData.result);
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

app.get("*", (req, res) => res.sendFile(path.resolve("build", "index.html")));
app.listen(port, () => console.log(`Example app listening on port ${port}!`));