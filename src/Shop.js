import React from "react";
import "./App.css";
import "animate.css/animate.min.css";
import {AnimationOnScroll} from 'react-animation-on-scroll';

import header from './img/header_black.png';

import cone from './img/cone.png';
import cup from './img/cup.png';
import banner from './img/banner.mp4';
import park from './img/park.png';
import bg from './img/shop_bg.png';
import star from './img/star.png';
import comingSoon from './img/coming_soon.png';

import os from './img/os.png';
import osHoverImage from './img/os_hover.png';

import mint from './img/mint.png';
import mintHoverImage from './img/mint_hover.png';
import projectHoverImage from './img/project_hover.png';

import shop from './img/shop.png';
import shopHoverImage from './img/shop_hover.png';

import discord from './img/discord.png';
import discordHoverImage from './img/discord_hover.png';

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '500px',
    height: '600px',
    backgroundColor: 'black',
    textAlign: "center",
    color: 'lightgray',
    outline: 0,
    borderRadius: "10px",
    boxShadow: "lightgray 0px 0px 20px 0px"

};

class Shop extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            osHover: false,
            discordHover: false,
            shopHover: false,
            projectHover: false,
            mintHover: false
        }
        this.handleMouseEnter = this.handleMouseEnter.bind(this);
        this.handleMouseLeave = this.handleMouseLeave.bind(this);
        this.opensea = this.opensea.bind(this);
        this.discord = this.discord.bind(this);
    }

    async componentDidMount() {

    }

    handleMouseEnter(event) {
        this.setState({
            [event.target.id]: true
        });
    };

    handleMouseLeave(event) {
        this.setState({
            [event.target.id]: false
        });
    };

    opensea() {
        window.open("https://opensea.io/collection/90s-kids", "_blank")
    }

    discord() {
        window.open("https://t.co/y2nWTn2K1B", "_blank")
    }

    render() {
        const {osHover, discordHover, shopHover, mintHover, projectHover} = this.state;
        return (
            <div style={{ backgroundSize: "contain", backgroundColor: "black", color: "lightgray", backgroundImage: `url(${bg})`, lineHeight: "1.8", letterSpacing: "1px"}}>

                <div style={{
                    flexDirection: "row",
                    display: "flex",
                    alignItems: "center"
                }}>
                    <div style={{margin: "10px"}}>
                        <picture>
                            <source media="(max-width: 900px)" srcSet={header} style={{height: "75px"}}/>
                            <img src={header} style={{height: "75px"}}/>
                        </picture>
                    </div>
                </div>

                <div style={{margin: "100px", textAlign: "center"}}>
                    <picture>
                        <img src={comingSoon} class="flex_img"/>
                    </picture>
                </div>

                <div style={{color: "black", textAlign: "right", marginTop: "500px"}}>
                    90s kids © 2022
                </div>
            </div>
        );
    }
}


export default Shop;
