import React from "react";
import "./App.css";
import { Link } from "react-router-dom";
import header from "./img/header_black.png";

import bg from "./img/shop_bg.png";
import comingSoon from "./img/coming_soon.png";

class Shop extends React.Component {
  async componentDidMount() {}

  render() {
    return (
      <div
        style={{
          backgroundSize: "contain",
          backgroundColor: "black",
          color: "lightgray",
          backgroundImage: `url(${bg})`,
          lineHeight: "1.8",
          letterSpacing: "1px",
        }}
      >
        <div
          style={{
            flexDirection: "row",
            display: "flex",
            alignItems: "center",
          }}
        >
          <div style={{ margin: "10px" }}>
            <Link to="/">
              <picture>
                <source
                  media="(max-width: 900px)"
                  srcSet={header}
                  style={{ height: "75px" }}
                />
                <img src={header} style={{ height: "75px" }} alt="header" />
              </picture>
            </Link>
          </div>
        </div>

        <div style={{ margin: "100px", textAlign: "center" }}>
          <picture>
            <img src={comingSoon} class="flex_img" alt="comingSoon" />
          </picture>
        </div>

        <div style={{ color: "black", textAlign: "right", marginTop: "500px" }}>
          90s kids © 2023
        </div>
      </div>
    );
  }
}

export default Shop;
