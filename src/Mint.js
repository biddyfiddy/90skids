import React from "react";
import "./App.css";
import { Link } from "react-router-dom";
import header from "./img/header.png";
import { abi, address, bytecode } from "../src/abi/og_contract.json";
import { BigNumber, ethers } from "ethers";
import banner from "./img/banner.mp4";
import metamask from "./img/metamask.png";
import check from "./img/check.png";
import mint from "./img/mint.png";
import keys from "./img/keys.png";
import comingSoon from "./img/coming_soon_fence.png";
import ScaleLoader from "react-spinners/ScaleLoader";
import Button from "@mui/material/Button";
import { styled } from "@mui/material/styles";
import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";

import {
  address as testAddress,
  abi as testAbi,
  bytecode as testByteCode,
} from "./abi/test_contract.json";

import {
  address as newAddress,
  abi as newAbi,
  bytecode as newByteCode,
} from "./abi/new_contract.json";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "80%",
  height: "50%",
  backgroundColor: "black",
  textAlign: "center",
  color: "lightgray",
  outline: 0,
  borderRadius: "10px",
  boxShadow: "lightgray 0px 0px 20px 0px",
};

const ColorButton = styled(Button)(({ theme }) => ({
  backgroundColor: "#FF7044",
  "&:hover": {
    backgroundColor: "#FF7044",
  },
  ":disabled": {
    backgroundColor: "#888888",
  },
}));

class Mint extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      modalOpen: false,
      accounts: undefined,
      imageLoading: false,
      imageLoadingError: "",
      images: [],
      selectedNfts: [],
      burnLimit: 1,
      burningTokens: false,
      mintingTokens: true,
      failedMessage: "",
      mintHashes: [],
      burnHashes: [],
    };
    this.connectMetamask = this.connectMetamask.bind(this);
    this.selectNft = this.selectNft.bind(this);
    this.burn = this.burn.bind(this);
    this.handleClose = this.handleClose.bind(this);

    // Render methods
    this.renderMetamaskLogin = this.renderMetamaskLogin.bind(this);
    this.renderImageLoading = this.renderImageLoading.bind(this);
    this.renderImageLoadingError = this.renderImageLoadingError.bind(this);
    this.renderImages = this.renderImages.bind(this);
    this.renderBurningTokens = this.renderBurningTokens.bind(this);
    this.renderMintingTokens = this.renderMintingTokens.bind(this);
    this.renderFailed = this.renderFailed.bind(this);

    // Utility methods
    this.nftIncludes = this.nftIncludes.bind(this);
  }

  async handleClose(event, reason) {
    if (reason && reason == "backdropClick") {
      return;
    }
    this.setState({
      modalOpen: false,
    });
  }

  async burn() {
    this.setState({
      modalOpen: true,
      burningTokens: true,
      mintingTokens: false,
    });

    const { accounts, selectedNfts } = this.state;

    const ethersProvider = new ethers.providers.Web3Provider(
      window.ethereum,
      "any"
    );
    const signer = ethersProvider.getSigner();

    const contractFactory = new ethers.ContractFactory(
      testAbi,
      testByteCode,
      signer
    );

    const contractInstance = contractFactory.attach(testAddress);

    const hashes = selectedNfts.map(async (selectedNft) => {
      let rawTxn = await contractInstance.populateTransaction.transferFrom(
        accounts[0],
        "0x000000000000000000000000000000000000dead",
        selectedNft.tokenId
      );

      if (!rawTxn) {
        return;
      }

      let signedTxn = await signer.sendTransaction(rawTxn);

      if (!signedTxn) {
        return;
      }

      let hash = await signedTxn.wait().then((reciept) => {
        return "https://etherscan.io/tx/" + signedTxn.hash;
      });

      return hash;
    });

    let resolvedHashes = await Promise.all(hashes).catch((err) => {
      this.setState({
        failedMessage: err.message,
        burningTokens: false,
        mintingTokens: false,
      });
    });

    if (resolvedHashes && resolvedHashes.length > 0) {
      this.mint(resolvedHashes);
    }
  }

  async mint(hashes) {
    const { accounts } = this.state;

    if (!accounts || accounts.length === 0) {
      return [];
    }

    this.setState({
      burningTokens: false,
      mintingTokens: true,
    });

    const ethersProvider = new ethers.providers.Web3Provider(
      window.ethereum,
      "any"
    );
    const signer = ethersProvider.getSigner();

    let mintHashes = hashes.map(async (hash) => {
      const requestOptions = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          address: accounts[0],
        }),
      };

      let response = await fetch("/mint", requestOptions);

      if (!response || response.status !== 200) {
        let reason = await response.json();
        return;
      }

      let json = await response.json();
      let rshoePcontractFactory = new ethers.ContractFactory(
        newAbi,
        newByteCode,
        signer
      );

      let contractInstance = rshoePcontractFactory.attach(newAddress);

      let rawTxn = await contractInstance.populateTransaction.publicMint(
        json.uri,
        json.nonce,
        json.hash,
        json.signature
      );

      if (!rawTxn) {
        return;
      }

      let signedTxn = await signer.sendTransaction(rawTxn);

      if (!signedTxn) {
        return;
      }

      return await signedTxn.wait().then((reciept) => {
        return "https://etherscan.io/tx/" + signedTxn.hash;
      });
    });

    let resolvedHashes = await Promise.all(mintHashes).catch((err) => {
      this.setState({
        failedMessage: err.message,
      });
    });

    this.setState({
      burningTokens: false,
      mintingTokens: false,
      burnHashes: hashes,
      mintHashes: resolvedHashes,
    });
  }

  nftIncludes(imageUri) {
    const { selectedNfts } = this.state;
    let includes = false;

    selectedNfts.forEach((nft) => {
      if (nft.imageUri === imageUri) {
        includes = true;
      }
    });
    return includes;
  }

  async selectNft(event, nft) {
    const nftId = event.target.id;
    const { selectedNfts, burnLimit } = this.state;
    if (selectedNfts.length < burnLimit && !this.nftIncludes(nftId)) {
      selectedNfts.push(nft);
    } else if (this.nftIncludes(nftId)) {
      selectedNfts.splice(nft, 1);
    }
    this.setState({
      selectedNfts,
    });
  }

  async connectMetamask() {
    const { ethereum } = window;
    let accounts = await ethereum.request({ method: "eth_requestAccounts" });
    this.setState({
      accounts: accounts,
    });
    this.getTokens();
  }

  async componentDidMount() {
    const { ethereum } = window;
    if (ethereum) {
      const accounts = await ethereum
        .request({
          method: "eth_accounts",
        })
        .catch((error) => {
          console.error(error);
        });

      if (!accounts || accounts.length === 0) {
        return;
      }

      this.setState({
        accounts: accounts,
      });
      this.getTokens();
    }
  }

  async getTokens() {
    const { accounts } = this.state;
    this.setState({
      imageLoading: true,
    });

    const requestOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        address: accounts[0],
      }),
    };

    let response = await fetch("/owned", requestOptions);
    let json = await response.json();

    if (response.status != 200) {
      this.setState({
        imageLoading: false,
        imageLoadingError: json.message,
      });
    } else {
      this.setState({
        imageLoading: false,
        imageLoadingError: "",
        images: json,
        burnLimit: json.length >= 50 ? 2 : 1,
      });
    }
  }

  renderImageLoading() {
    return (
      <div style={{ textAlign: "center" }}>
        <ScaleLoader color="#FF7044" />
        <div>Grabbing your NFT(s) from the Ethereum Network</div>
      </div>
    );
  }

  renderImageLoadingError() {
    const { imageLoadingError } = this.state;
    return (
      <div style={{ textAlign: "center", marginTop: "20px" }}>
        <img src={keys} style={{ width: "200px" }} />
        <div>{imageLoadingError}</div>
      </div>
    );
  }

  renderImages() {
    const { images, burnLimit, selectedNfts } = this.state;

    return (
      <>
        <div style={{ textAlign: "center" }}>
          <h2>Select {burnLimit} Token(s) To Burn</h2>
          <ColorButton
            disabled={selectedNfts.length != burnLimit}
            onClick={this.burn}
          >
            <img src={mint} style={{ padding: "10px", width: "100px" }} />
          </ColorButton>
        </div>
        <div
          style={{
            textAlign: "center",
            display: "flex",
            flexWrap: "wrap",
            margin: "100px",
          }}
        >
          {images.map((image) => (
            <div
              id={image.imageUri}
              style={{
                cursor: "pointer",
                padding: "10px",
                flex: 1,
                border: "1px dashed",
              }}
              onClick={(e) => {
                this.selectNft(e, image);
              }}
            >
              {selectedNfts.includes(image) ? (
                <img
                  id={image.imageUri}
                  src={check}
                  style={{
                    width: "200px",
                    zIndex: 1,
                    position: "absolute",
                  }}
                />
              ) : (
                <img />
              )}{" "}
              <img
                id={image.imageUri}
                src={image.imageUri}
                class={
                  this.nftIncludes(image.imageUri)
                    ? "img_selected"
                    : "img_unselected"
                }
              />
            </div>
          ))}
        </div>
      </>
    );
  }

  renderMetamaskLogin() {
    return (
      <div style={{ textAlign: "center", marginTop: "20px" }}>
        <div
          style={{ display: "flex", justifyContent: "center" }}
          onClick={() => this.connectMetamask()}
        >
          <div
            style={{
              border: "1px dashed",
              padding: "10px",
              display: "flex",
              alignItems: "center",
              cursor: "pointer",
            }}
          >
            <img src={metamask} style={{ height: "32px" }} alt="comingSoon" />
            <span style={{ paddingLeft: "10px", height: "32px" }}>
              Connect with MetaMask
            </span>
          </div>
        </div>
      </div>
    );
  }

  renderBurningTokens() {
    return (
      <div style={{ marginTop: "10%" }}>
        <ScaleLoader color="#FF7044" />
        <div>Burning Tokens</div>
      </div>
    );
  }

  renderFailed() {
    const { failedMessage } = this.state
      return (
        <div style={{ marginTop: "10%" }}>
                    <img src={keys} style={{ width: "200px" }} />
                                      <div>{failedMessage}</div>
        </div>
      );
  }

  renderMintingTokens() {
    return (
      <div style={{ marginTop: "10%" }}>
        <ScaleLoader color="#FF7044" />
        <div>Minting Tokens</div>
      </div>
    );
  }

  renderSuccess() {
    const { mintHashes, burnHashes } = this.state;
    console.log(mintHashes);
    console.log(burnHashes);
    return (
      <div style={{ marginTop: "10%" }}>
        <h1>You have successfully redeemed your token(s)</h1>
        <h3>Burned Token Transaction(s)</h3>
        <div>
          {burnHashes.map((burnHash) => {
            <div>{burnHash}</div>;
          })}
        </div>
        <h3>Minted Token Transaction(s)</h3>
        <div>
          {mintHashes.map((mintHash) => {
            <div>{mintHash}</div>;
          })}
        </div>
      </div>
    );
  }

  render() {
    const {
      accounts,
      imageLoading,
      images,
      imageLoadingError,
      selectedNfts,
      burnLimit,
      burningTokens,
      mintingTokens,
      modalOpen,
      failedMessage,
      burnHashes,
      mintHashes,
    } = this.state;

    return (
      <div
        style={{
          backgroundSize: "cover",
          backgroundColor: "black",
          color: "lightgray",
          lineHeight: "1.8",
          letterSpacing: "1px",
        }}
      >
        <div style={{ marginTop: "10px" }}>
          <Link to="/">
            <img
              src={header}
              style={{ marginLeft: "10px", height: "75px" }}
              alt="header"
            />
          </Link>
        </div>

        <Modal
          open={modalOpen}
          onClose={this.handleClose}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <Box sx={style}>
            {burningTokens ? this.renderBurningTokens() : <></>}
            {mintingTokens ? this.renderMintingTokens() : <></>}
            {failedMessage !== "" ? this.renderFailed() : <></>}
            {burnHashes.length > 0 && mintHashes.length > 0 ? (
              this.renderSuccess()
            ) : (
              <></>
            )}
          </Box>
        </Modal>

        {!accounts || accounts.length === 0 ? (
          this.renderMetamaskLogin()
        ) : (
          <></>
        )}

        {imageLoading ? this.renderImageLoading() : <></>}

        {!imageLoading && imageLoadingError != "" ? (
          this.renderImageLoadingError()
        ) : (
          <></>
        )}

        {images.length > 0 ? this.renderImages() : <></>}

        <div style={{ textAlign: "center", marginTop: "500px" }}>
          90s kids © 2023
        </div>
      </div>
    );
  }
}

export default Mint;
