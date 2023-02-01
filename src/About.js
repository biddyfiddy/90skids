import React from "react";
import "./App.css";
import { Link } from "react-router-dom";
import header from './img/header.png';

import bg from './img/bg.png';
import star from './img/star.png';

import os from './img/os.png';
import osHoverImage from './img/os_hover.png';

import discord from './img/discord.png';
import discordHoverImage from './img/discord_hover.png';

class About extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            osHover: false,
            discordHover: false,
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
        const {osHover, discordHover} = this.state;
        return (
            <div style={{
                backgroundSize: "cover",
                backgroundColor: "black",
                color: "lightgray",
                backgroundImage: `url(${bg})`,
                lineHeight: "1.8",
                letterSpacing: "1px"
            }}>

                <div style={{
                    flexDirection: "row",
                    display: "flex",
                    alignItems: "center"
                }}>
                    <div style={{margin: "10px"}}><Link to="/">
                        <picture>
                            <source media="(max-width: 900px)" srcSet={header} style={{height: "75px"}}/>
                            <img src={header} style={{height: "75px"}} alt="header" />
                        </picture></Link>
                    </div>
                </div>

                <div style={{marginTop: "100px", marginBottom: "200px", display: "flex", justifyContent: "center"}}>
                    <img id="star" src={star} style={{height: "50px", marginRight: "20px"}} alt="star"/>
                    <div style={{marginTop: "20px", width: "400px"}}>90's Kids is a digital collectible project and
                        brand inspired by
                        skateboard culture of the 1990s and 2000s that continues to define the trends of today.
                        Beyond just another PFP project, 90s Kids will foster a community and support that encourage
                        members to create art and skate together through contests both on and off board, both online and
                        IRL.
                        Skateboarding was originally based in counter culture ideology, but the creativity and
                        DIY-attitude of skateboarders has impacted culture on a broader scale, much like the evolution
                        of NFTs in mainstream culture. This project pays homage to the striking power of skateboarding
                        as a
                        guiding force for creativity in the Web3 era. 90s Kids provides a model example of transitioning
                        existing spaces from physical to digital.
                    </div>
                </div>

                <div class="flex_new">
                    <div style={{width: "200px", marginTop: "10px"}}>
                        To Enter our Skate and Art contests and learn more about our monthly drops mechanic, join
                        <img
                            alt="discord"
                            id="discordHover"
                            src={discordHover ? discordHoverImage : discord}
                            style={{marginTop: "10px", width: "100px"}}
                            onMouseEnter={this.handleMouseEnter}
                            onMouseLeave={this.handleMouseLeave}
                            onClick={this.discord}/>
                    </div>
                    <div style={{width: "200px", marginTop: "10px"}}></div>
                    <div style={{width: "200px", marginTop: "10px"}}>
                        Become part of the community and own your first 90s kid on
                        <img id="osHover" alt="opensea"
                             src={osHover ? osHoverImage : os}
                             style={{
                                 marginTop: "10px",
                                 width: "100px"
                             }}
                             onMouseEnter={this.handleMouseEnter}
                             onMouseLeave={this.handleMouseLeave}
                             onClick={this.opensea}/>
                    </div>
                </div>

                <div style={{textAlign: "center"}}>
                    90s kids © 2023
                </div>
            </div>
        );
    }
}


export default About;
