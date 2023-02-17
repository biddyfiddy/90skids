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

class Mint extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      accounts: undefined,
      imageLoading: false,
      imageLoadingError: '',
      images: [],
      selectedNfts: [],
      burnLimit: 1,
    };
    this.connectMetamask = this.connectMetamask.bind(this);
    this.selectNft = this.selectNft.bind(this);
    this.burn = this.burn.bind(this);
    this.renderMetamaskLogin = this.renderMetamaskLogin.bind(this);
    this.renderImageLoading = this.renderImageLoading.bind(this);
  }

  async burn() {
    console.log("burn");
  }

  async selectNft(event) {
    const nftId = event.target.id;
    const { selectedNfts, burnLimit } = this.state;
    if (selectedNfts.length < burnLimit && !selectedNfts.includes(nftId)) {
      selectedNfts.push(event.target.id);
    } else if (selectedNfts.includes(nftId)) {
      selectedNfts.splice(selectedNfts.indexOf(nftId), 1);
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
        console.log("err : " + json.message)
      this.setState({
        imageLoading: false,
        imageLoadingError: json.message,
      });
    } else {
        this.setState({
          imageLoading: false,
          imageLoadingError: '',
          images: json,
          burnLimit: json.length >= 50 ? 2 : 1,
        });
    }
  }

  renderImageLoading() {
      return (              <div style={{ textAlign: "center" }}>
                              <ScaleLoader color="#FF7044" />
                            </div>);
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
                      }}
                    >
                      <img
                        src={metamask}
                        style={{ height: "32px" }}
                        alt="comingSoon"
                      />
                      <span style={{ paddingLeft: "10px", height: "32px" }}>
                        Connect with MetaMask
                      </span>
                    </div>
                  </div>
    </div>
    );
  }

  render() {
    const { accounts, imageLoading, images, imageLoadingError, selectedNfts, burnLimit } =
      this.state;

    const ColorButton = styled(Button)(({ theme }) => ({
      backgroundColor: "#FF7044",
      "&:hover": {
        backgroundColor: "#FF7044",
      },
      ":disabled": {
        backgroundColor: "#888888",
      },
    }));

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

        {!accounts || accounts.length === 0 ? (this.renderMetamaskLogin()) : <></>}

        {imageLoading ? this.renderImageLoading() : <></>}

        {!imageLoading && imageLoadingError != '' ? <div style={{ textAlign: "center", marginTop: "20px" }}>
            <img src={keys} style={{ width: "200px"}} />
            <div>{imageLoadingError}</div>
        </div> : <></>}

        {images.length > 0 ? (
           <>
           <div style={{                                  textAlign: "center"}}>
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
                    id={image}
                    style={{
                      cursor: "pointer",
                      padding: "10px",
                      flex: 1,
                      border: "1px dashed",
                    }}
                    onClick={this.selectNft}
                  >
                    {selectedNfts.includes(image) ? (
                      <img
                        id={image}
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
                      id={image}
                      src={image}
                      class={
                        selectedNfts.includes(image)
                          ? "img_selected"
                          : "img_unselected"
                      }
                    />
                  </div>
                ))}
              </div>
              </>
            ) : <></>}

        <div style={{ textAlign: "center", marginTop: "500px" }}>
          90s kids © 2023
        </div>
      </div>
    );
  }
}

export default Mint;
