const express = require("express");
const path = require("path")
const web3 = require("web3")
const crypto = require("crypto")
const ethers = require("ethers")
const axios = require("axios")
const app = express();
const port = process.env.PORT || 3001;

//const WALLET_KEY = process.env.WALLET_KEY;
//const ETHER_API_KEY = process.env.ETHER_API_KEY;
//const ETHER_NETWORK = process.env.ETHER_NETWORK;
const ETHER_NETWORK = 'mainnet';
const API_KEY = '';

app.use(express.json());
app.use(express.static(path.join(__dirname, 'build')));

app.post("/owned", async (req, res) => {
    const body = req.body
    if (!body) {
        res.status(500).json({
            message: "No post body"
        })
        return;
    }

    const address = body.address;
    if (!address) {
        res.status(500).json({
            message: "No Address in post body"
        })
        return;
    }

    let tokens = await getOwnedTokens(address);

    if (tokens) {
        res.status(200).json(tokens)
    } else {
        res.status(500).json({ message : "Could not get owned tokens"})
    }
});

const getOwnedTokens = async (address) => {
    let network = ETHER_NETWORK === 'mainnet' ? '' : `-${ETHER_NETWORK}`;
    const contractAddress = '0xAc5Aeb3b4Ac8797c2307320Ed00a84B869ab9333';
    return axios.get(`https://api${network}.etherscan.io/api?module=account&action=tokennfttx&contractaddress=${contractAddress}&address=${address}&page=1&offset=100&startblock=0&endblock=27025780&sort=asc&apikey=${API_KEY}`).then(response => {
        let responseData = response.data;
        console.log(response);
        let tokens = responseData.result;

        let tokenId = [];
        if (!tokens) {
            return tokenId;
        }
        tokens.forEach(token => {
            if (token.to === address) {
                tokenId.push(token.tokenID);
            }
        })

        tokens.forEach(token => {
            if (token.from === address) {
                tokenId.splice(tokenId.indexOf(token.tokenID), 1);
            }
        })

        return tokenId;
    }).catch(err => {
        console.log(err);
    });
}

app.get('*', (req, res) => res.sendFile(path.resolve('build', 'index.html')));
app.listen(port, () => console.log(`Example app listening on port ${port}!`));
