const express = require("express");
const path = require("path")
const web3 = require("web3")
const crypto = require("crypto")
const ethers = require("ethers")
const axios = require("axios")
const app = express();
const port = process.env.PORT || 3001;

const WALLET_KEY = process.env.WALLET_KEY;
const ETHER_API_KEY = process.env.ETHER_API_KEY;
const ETHER_NETWORK = process.env.ETHER_NETWORK;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'build')));
app.get('*', (req, res) => res.sendFile(path.resolve('build', 'index.html')));
app.listen(port, () => console.log(`Example app listening on port ${port}!`));
