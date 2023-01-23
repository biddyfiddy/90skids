import React, { useRef } from "react";
import "./App.css";
import header from './img/header.png';
import header2 from './img/header2.png';

import cone from './img/cone.png';
import cup from './img/cup.png';
import keys from './img/keys.png';
import phone from './img/phone.png';
import mov from './img/teaser.m4v';
import banner from './img/banner.mp4';
import park from './img/park.png';

import star from './img/star.png';
import chain from './img/chain.png';
import cloud from './img/cloud.png';
import explosion from './img/explosion.png';

import {ethers} from "ethers"

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

class About extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            pane1Hover: false,
            pane2Hover: false,
            pane3Hover: false,
            accounts: null,
        }
        this.handleMouseEnter = this.handleMouseEnter.bind(this);
        this.handleMouseLeave = this.handleMouseLeave.bind(this);
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

    render() {
        const { pane1Hover, pane2Hover, pane3Hover } = this.state;
        return (
            <div style={{backgroundColor: "black", color: "lightgray", lineHeight: "1.8", letterSpacing: "1px"}}>
                <div style={{textAlign: "center", marginTop: "50px"}}>
                    <video style={{    maxWidth: "50%" }} autoPlay loop muted>
                        <source src={banner} type="video/mp4" />
                    </video>
                </div>
                <div style={{margin: "5%", flex: "row"}}>
                    <div class="flex_about">
                        <div class="about_text">90's Kids is a digital collectible project and brand inspired by skateboard culture of the 1990s and 2000s that continues to define the trends of today. Beyond just another PFP project, 90s Kids will foster a community and support that encourage members to create art and skate together through contests both on and off board, both online and IRL.</div>
                        <img style={{marginLeft: "50px", maxWidth: "200px", width: "auto", height: "auto"}} src={cup} />
                    </div>
                    <div class="flex_about">
                        <img style={{maxWidth: "150px", width: "auto", height: "auto"}} src={cone} />
                        <div class="about_text" style={{marginLeft: "50px"}}>Skateboarding was originally based in counter culture ideology, but the creativity and DIY-attitude of skateboarders has impacted culture on a broader scale, much like the evolution of NFTs in mainstream culture. This project pays homage to the striking power of skateboarding as a guiding force for creativity in the Web3 era. 90s Kids provides a model example of transitioning existing spaces from physical to digital.</div>
                    </div>
                </div>
                <div style={{ textAlign: "center" }}>
                    <img class="park" src={park} />
                </div>
                <div style={{marginTop: "50px"}}>
                    <div className="flex_about">
                        <div className="about_text" style={{marginLeft: "50px"}}>Every month, we will release new characters that can be claimed for free through our burn mechanics. These characters will be available on a first-come, first-serve basis, and some may be available for purchase. To be eligible for the first drops, you will need to own a full set of the OG collection (VX, Cone, Keyset, and coffee cup).</div>
                    </div>
                    <div style={{ textAlign: "center" }}>
                        <img style={{ marginTop: "50px", marginBottom: "50px", maxWidth: "50px" }} src={star}/>
                    </div>
                    <div className="flex_about">
                        <div className="about_text" style={{marginLeft: "50px"}}>The burning system allows you to burn one NFT from the OG collection in exchange for a new character. The limited edition characters may come with unique redemption perks. Also after the drops, we will do discounts for the various holder roles (5+ NFTs, 10+).</div>
                    </div>
                    <div style={{ textAlign: "center" }}>
                        <img style={{ marginTop: "50px", marginBottom: "50px", maxWidth: "50px" }} src={chain}/>
                    </div>
                    <div className="flex_about">
                        <div className="about_text" style={{marginLeft: "50px"}}>We plan to create a clothing brand inspired by our characters and build immersive storylines around them. We will work with notable brands and figures to create new sets of characters and traits for upcoming releases. We will release complete merch collections every season, including t-shirts, hats, hoodies, pants, skateboard accessories, and more. Holders will have early access to these collections and will receive a holder discount.</div>
                    </div>
                    <div style={{ textAlign: "center" }}>
                        <img style={{ marginTop: "50px", marginBottom: "50px", maxWidth: "50px" }} src={explosion}/>
                    </div>
                    <div className="flex_about">
                        <div className="about_text" style={{marginLeft: "50px"}}>We will host contests every few months, including a skate contest and an art contest. For the art contest, we will provide a base model for artists to work with, and the winner will receive a cash prize.</div>
                    </div>
                    <div style={{ textAlign: "center" }}>
                        <img style={{ marginTop: "50px", marginBottom: "50px", maxWidth: "50px" }} src={cloud}/>
                    </div>
                    <div className="flex_about">
                        <div className="about_text" style={{marginLeft: "50px"}}>We will also airdrop the winning artwork to all of our collectors, along with a mention of the artist (these contests will use a holder voting system).</div>
                    </div>
                    <div style={{textAlign: "center", marginTop: "50px", marginBottom: "50px"}}>
                        <video style={{    maxWidth: "20%" }} autoPlay loop muted>
                            <source src={mov} type="video/mp4" />
                        </video>
                    </div>
                    <div className="flex_about">
                        <div className="about_text" style={{marginLeft: "50px"}}>We want to be active members of the NFT events and participate in physical events, such as NFT NYC and other meetups. These events will include skate contests, art shows, and other fun activities. We look forward to hanging out and getting to know our collectors in person!</div>
                    </div>
                </div>
                <div style={{    textAlign: "center"}}>
                    <a href={"https://opensea.io/collection/90s-kids"} target="_blank">opensea</a>
                    <span> / </span>
                    <a href={"https://t.co/y2nWTn2K1B"} target="_blank">discord</a>
                    <span> / </span>
                    <a href={"https://mobile.twitter.com/90s_kids_club"} target="_blank">twitter</a>
                    <span> / </span>
                    <a href={"https://www.instagram.com/90s_kids_club/"} target="_blank">instagram</a>
                </div>
                <div style={{    textAlign: "center"}}>
                    goatpasture © 2022
                </div>
            </div>
        );
    }
}

/*
Goals : -

Every month, we will release new characters that can be claimed for free through our burn mechanics. These characters will be available on a first-come, first-serve basis, and some may be available for purchase. To be eligible for the first drops, you will need to own a full set of the OG collection (VX, Cone, Keyset, and coffee cup).
The burning system allows you to burn one NFT from the OG collection in exchange for a new character. The limited edition characters may come with unique redemption perks. Also after the drops, we will do discounts for the various holder roles (5+ NFTs, 10+).
We plan to create a clothing brand inspired by our characters and build immersive storylines around them. We will work with notable brands and figures to create new sets of characters and traits for upcoming releases. We will release complete merch collections every season, including t-shirts, hats, hoodies, pants, skateboard accessories, and more. Holders will have early access to these collections and will receive a holder discount.
We will host contests every few months, including a skate contest and an art contest. For the art contest, we will provide a base model for artists to work with, and the winner will receive a cash prize.
We will also airdrop the winning artwork to all of our collectors, along with a mention of the artist (these contests will use a holder voting system).
We want to be active members of the NFT events and participate in physical events, such as NFT NYC and other meetups. These events will include skate contests, art shows, and other fun activities. We look forward to hanging out and getting to know our collectors in person!
 */

export default About;
