import React from "react";
import "./App.css";
import { Link } from "react-router-dom";
import header from "./img/header.png";

import banner from "./img/banner.mp4";
import comingSoon from "./img/coming_soon_may.png";
import closed from "./img/closed_fence.png";

class Mint extends React.Component {
  async componentDidMount() {}

  render() {
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
        <div style={{ textAlign: "center", marginTop: "10px" }}>
          <Link to="/">
            <img
              src={header}
              style={{
                marginLeft: "10px",
                height: "75px",
                zIndex: 1,
                position: "absolute",
              }}
              alt="header"
            />
          </Link>
          <video style={{ maxWidth: "100%" }} autoPlay playsInline loop muted>
            <source src={banner} type="video/mp4" />
          </video>
        </div>

        <div style={{ textAlign: "center" }}>
          <img
            src={closed}
            style={{ marginTop: "10px", width: "50%" }}
            alt="closed"
          />
        </div>

        <div style={{ textAlign: "center" }}>90s kids © 2023</div>
      </div>
    );
  }
}

export default Mint;
