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
import redeem from "./img/redeem.png";
import continued from "./img/continue.png";
import keys from "./img/keys.png";
import close from "./img/x.png";
import cone from "./img/cone.png";
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
  maxHeight: "500px",
  maxWidth: "65%",
  overflow: "scroll",
  transform: "translate(-50%, -50%)",
  backgroundColor: "black",
  textAlign: "center",
  alignItems: "center",
  justifyContent: "center",
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
      redeemMode: false,
      redeemingMode: false,
      redeemedMode: false,
      redeemError: "",
      accounts: undefined,
      imageLoading: false,
      imageLoadingError: "",
      images: [],
      selectedNfts: [],
      burnLimit: 1,
      burningTokens: false,
      mintingTokens: false,
      failedMessage: "",
      mintHashes: [],
      burnHashes: [],
    };
    this.connectMetamask = this.connectMetamask.bind(this);
    this.selectNft = this.selectNft.bind(this);
    this.burn = this.burn.bind(this);
    this.handleClose = this.handleClose.bind(this);
    this.redeem = this.redeem.bind(this);
    this.redeemed = this.redeemed.bind(this);

    // Burn Render Methods
    this.renderMetamaskLogin = this.renderMetamaskLogin.bind(this);
    this.renderImageLoading = this.renderImageLoading.bind(this);
    this.renderImageLoadingError = this.renderImageLoadingError.bind(this);
    this.renderImages = this.renderImages.bind(this);
    this.renderBurningTokens = this.renderBurningTokens.bind(this);
    this.renderMintingTokens = this.renderMintingTokens.bind(this);
    this.renderFailed = this.renderFailed.bind(this);

    // Redeem Render Methods
    this.renderRedeem = this.renderRedeem.bind(this);
    this.renderRedeeming = this.renderRedeeming.bind(this);
    this.renderRedeemed = this.renderRedeemed.bind(this);
    this.renderRedeemError = this.renderRedeemError.bind(this);

    // Utility methods
    this.nftIncludes = this.nftIncludes.bind(this);
  }

  redeemed() {
    this.setState({
      redeemMode: false,
      redeemingMode: false,
      redeemedMode: false,
      redeemError: "",
    });
    this.getTokens();
  }

  async handleClose(event, reason) {
    if (reason && reason == "backdropClick") {
      return;
    }
    this.setState({
      modalOpen: false,
      imageLoading: false,
      imageLoadingError: "",
      images: [],
      selectedNfts: [],
      burnLimit: 1,
      burningTokens: false,
      mintingTokens: false,
      failedMessage: "",
      mintHashes: [],
      burnHashes: [],
    });
    this.getRedeemed();
  }

  async burn() {
    this.setState({
      modalOpen: true,
      burningTokens: true,
      mintingTokens: false,
    });

    const { accounts, selectedNfts } = this.state;

    let resolvedHashes = [];
    let hash = await this.mintSingle(selectedNfts[0]).catch((err) => {
      this.setState({
        failedMessage: err.message,
        burningTokens: false,
        mintingTokens: false,
      });
      return;
    });

    if (!hash) {
      return;
    }

    resolvedHashes.push(hash);

    if (selectedNfts.length == 2) {
      let hash = await this.mintSingle(selectedNfts[1]).catch((err) => {
        this.setState({
          failedMessage: err.message,
          burningTokens: false,
          mintingTokens: false,
        });
      });
      if (!hash) {
        return;
      }
      resolvedHashes.push(hash);
    }

    if (!resolvedHashes) {
      return;
    }

    this.setState({
      burnHashes: resolvedHashes,
    });

    if (resolvedHashes && resolvedHashes.length > 0) {
      this.mint(resolvedHashes.length);
    }
  }

  async mintSingle(selectedNft) {
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
  }

  async mintLimitedEdition() {
    const { accounts } = this.state;

    if (!accounts || accounts.length === 0) {
      return;
    }

    this.setState({
      redeemMode: false,
      redeemingMode: true,
    });

    const ethersProvider = new ethers.providers.Web3Provider(
      window.ethereum,
      "any"
    );
    const signer = ethersProvider.getSigner();
    let rshoePcontractFactory = new ethers.ContractFactory(
      newAbi,
      newByteCode,
      signer
    );

    let contractInstance = rshoePcontractFactory.attach(newAddress);

    let mintHashes = [];
    try {
      const requestOptions = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          address: accounts[0],
          amount: 1,
        }),
      };

      let response = await fetch("/mintLimitedEdition", requestOptions);

      if (!response || response.status !== 200) {
        let reason = await response.json();
        this.setState({
          redeemingMode: false,
          redeemError: reason.message,
        });
        return;
      }

      let json = await response.json();

      let rawTxn =
        await contractInstance.populateTransaction.publicLimitedEditionMint(
          json.amount,
          json.nonce,
          json.hash,
          json.signature
        );

      if (!rawTxn) {
        this.setState({
          redeemingMode: false,
        });
        return;
      }

      let signedTxn = await signer.sendTransaction(rawTxn);

      if (!signedTxn) {
        this.setState({
          redeemingMode: false,
        });
        return;
      }

      mintHashes.push(
        await signedTxn.wait().then((reciept) => {
          return "https://etherscan.io/tx/" + signedTxn.hash;
        })
      );
    } catch (err) {
      let message;
      if (err.error) {
        message = err.error.message;
      } else {
        message = err.message;
      }

      this.setState({
        redeemingMode: false,
        redeemError: message,
      });
    }

    let resolvedHashes = await Promise.all(mintHashes).catch((err) => {
      this.setState({
        redeemingMode: false,
      });
    });

    this.setState({
      redeemedHash: resolvedHashes,
      redeemingMode: false,
      redeemedMode: true,
    });
  }

  async mint(numToMint) {
    const { accounts } = this.state;

    if (!accounts || accounts.length === 0) {
      return [];
    }

    this.setState({
      numToMint: numToMint,
      burningTokens: false,
      mintingTokens: true,
    });

    const ethersProvider = new ethers.providers.Web3Provider(
      window.ethereum,
      "any"
    );

    const signer = ethersProvider.getSigner();
    let rshoePcontractFactory = new ethers.ContractFactory(
      newAbi,
      newByteCode,
      signer
    );

    let contractInstance = rshoePcontractFactory.attach(newAddress);

    let mintHashes = [];
    try {
      const requestOptions = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          address: accounts[0],
          amount: numToMint,
        }),
      };

      let response = await fetch("/mint", requestOptions);

      if (!response || response.status !== 200) {
        let reason = await response.json();
        return;
      }

      let json = await response.json();

      let rawTxn = await contractInstance.populateTransaction.publicMint(
        json.amount,
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

      mintHashes.push(
        await signedTxn.wait().then((reciept) => {
          return "https://etherscan.io/tx/" + signedTxn.hash;
        })
      );
    } catch (err) {
      let message;
      if (err.error) {
        message = err.error.message;
      } else {
        message = err.message;
      }

      this.setState({
        failedMessage: message,
        burningTokens: false,
        mintingTokens: false,
      });
    }

    let resolvedHashes = await Promise.all(mintHashes).catch((err) => {
      this.setState({
        failedMessage: err.message,
      });
    });

    this.setState({
      burningTokens: false,
      mintingTokens: false,
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
      selectedNfts.splice(selectedNfts.indexOf(nft), 1);
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
    await this.getRedeemed();
  }

  async redeem() {
    await this.mintLimitedEdition();
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
      this.getRedeemed();
    }
  }

  async getRedeemed() {
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

    let response = await fetch("/redeemed", requestOptions);
    let json = await response.json();

    if (!json.redeemed) {
      this.setState({
        imageLoading: false,
        imageLoadingError: "",
        redeemMode: json.redeemed === undefined ? false : !json.redeemed,
      });
    } else {
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
    let tokens = json.tokens;

    if (response.status != 200) {
      this.setState({
        imageLoading: false,
        imageLoadingError: json.message,
      });
    } else if (json.numToMint) {
      this.setState({
        imageLoading: false,
        imageLoadingError: "",
        images: tokens,
        burnLimit: json.numToMint,
        modalOpen: true,
          burningTokens: false,
          mintingTokens: true,
        burnHashes: json.burnedHashes,
      });
      this.mint(json.numToMint);
    } else if (json.numToMint == 0) {
      this.setState({
        imageLoading: false,
        imageLoadingError: "",
        images: tokens,
        burnLimit: 0,
      });
    } else {
      this.setState({
        imageLoading: false,
        imageLoadingError: "",
        images: tokens,
        burnLimit: tokens.length >= 50 ? 2 : 1,
      });
    }
  }

  renderRedeemError() {
    const { redeemError } = this.state;
    return (
      <div style={{ display: "flex", justifyContent: "center" }}>
        <div style={{ maxWidth: "300px" }}>
          <img src={keys} style={{ width: "200px" }} />
          <div>{redeemError}</div>
          <ColorButton onClick={this.redeemed}>
            <img src={continued} style={{ width: "100px" }} />
          </ColorButton>
        </div>
      </div>
    );
  }

  renderRedeemed() {
    const { redeemedHash } = this.state;
    return (
      <div style={{ display: "flex", justifyContent: "center" }}>
        <div style={{ maxWidth: "300px", textAlign: "center" }}>
          <img src={cone} style={{ width: "200px" }} />
          <div>You have redeemed your limited edition NFT</div>
          {redeemedHash.map((redeemHash) => (
            <div style={{ marginTop: "10px", marginBottom: "10px" }}>
              <a
                style={{ color: "#FF7044", cursor: "pointer" }}
                href={redeemHash}
                target="_blank"
              >
                view on etherscan
              </a>
            </div>
          ))}
          <ColorButton onClick={this.redeemed}>
            <img src={continued} style={{ width: "100px" }} />
          </ColorButton>
        </div>
      </div>
    );
  }

  renderRedeeming() {
    return (
      <div style={{ display: "flex", justifyContent: "center" }}>
        <div style={{ maxWidth: "300px", textAlign: "center" }}>
          <ScaleLoader color="#FF7044" />
          <div>Redeeming limited edition NFT</div>
        </div>
      </div>
    );
  }

  renderRedeem() {
    return (
      <div style={{ display: "flex", justifyContent: "center" }}>
        <div style={{ maxWidth: "300px", textAlign: "center" }}>
          <img src={cone} style={{ width: "200px" }} />
          <div style={{ marginTop: "10px", marginBottom: "10px" }}>
            You hold 50 or more 90's Kids NFTs and are eligible to redeem a
            Limited Edition NFT.
          </div>
          <ColorButton onClick={this.redeem}>
            <img src={redeem} style={{ width: "100px" }} />
          </ColorButton>
        </div>
      </div>
    );
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
            disabled={selectedNfts.length != burnLimit || burnLimit == 0}
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
                <></>
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
    const { selectedNfts } = this.state;
    return (
      <div style={{ margin: "50px" }}>
        <ScaleLoader color="#FF7044" />
        <div>Burning {selectedNfts.length} Token(s)</div>
        <div>Please do not navigate away from this page.</div>
      </div>
    );
  }

  renderFailed() {
    const { failedMessage } = this.state;
    return (
      <>
        <div style={{ textAlign: "end", margin: " 10px" }}>
          <ColorButton
            style={{ marginLeft: "10px" }}
            onClick={this.handleClose}
          >
            <img style={{ width: "15px" }} src={close} />
          </ColorButton>
        </div>
        <div style={{ margin: "50px" }}>
          <img src={keys} style={{ width: "200px" }} />
          <div>{failedMessage}</div>
        </div>
      </>
    );
  }

  renderMintingTokens() {
    const { numToMint } = this.state;
    return (
      <div style={{ margin: "50px" }}>
        <ScaleLoader color="#FF7044" />
        <div>Minting {numToMint} Token(s)</div>
        <div>Please do not navigate away from this page.</div>
      </div>
    );
  }

  renderSuccess() {
    const { mintHashes, burnHashes } = this.state;
    return (
      <>
        <div style={{ textAlign: "end", margin: " 10px" }}>
          <ColorButton
            style={{ marginLeft: "10px" }}
            onClick={this.handleClose}
          >
            <img style={{ width: "15px" }} src={close} />
          </ColorButton>
        </div>
        <div style={{ margin: "50px" }}>
          <h2>You have successfully redeemed {mintHashes.length} token(s)</h2>
          <h4>Burned Token Transaction(s)</h4>
          <div>
            {burnHashes.map((burnHash) => (
              <div>
                <a
                  style={{ color: "#FF7044", cursor: "pointer" }}
                  href={burnHash}
                  target="_blank"
                >
                  etherscan
                </a>
              </div>
            ))}
          </div>
          <h4>Minted Token Transaction(s)</h4>
          <div>
            {mintHashes.map((mintHash) => (
              <div>
                <a
                  style={{ color: "#FF7044", cursor: "pointer" }}
                  href={mintHash}
                  target="_blank"
                >
                  etherscan
                </a>
              </div>
            ))}
          </div>
        </div>
      </>
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
      redeemMode,
      redeemingMode,
      redeemedMode,
      redeemError,
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
        {redeemMode ? this.renderRedeem() : <></>}
        {redeemingMode ? this.renderRedeeming() : <></>}
        {redeemError !== "" ? this.renderRedeemError() : <></>}
        {redeemError === "" && redeemedMode ? this.renderRedeemed() : <></>}
        {!imageLoading && imageLoadingError != "" ? (
          this.renderImageLoadingError()
        ) : (
          <></>
        )}
        {!redeemMode &&
        !redeemingMode &&
        !redeemedMode &&
        redeemError === "" &&
        images.length > 0 ? (
          this.renderImages()
        ) : (
          <></>
        )}

        <div style={{ textAlign: "center", marginTop: "500px" }}>
          90s kids © 2023
        </div>
      </div>
    );
  }
}

export default Mint;
