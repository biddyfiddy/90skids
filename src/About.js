import React from "react";
import "./App.css";
import "animate.css/animate.min.css";
import {AnimationOnScroll} from 'react-animation-on-scroll';

import header from './img/header.png';
import header2 from './img/header2.png';

import cone from './img/cone.png';
import cup from './img/cup.png';
import banner from './img/banner.mp4';
import park from './img/park.png';

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

class About extends React.Component {

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
            <div style={{backgroundColor: "black", color: "lightgray", lineHeight: "1.8", letterSpacing: "1px"}}>

                <div style={{
                    flexDirection: "row",
                    display: "flex",
                    alignItems: "center"
                }}>
                    <div style={{margin: "10px"}}>
                        <picture>
                            <source media="(max-width: 900px)" srcSet={header2} style={{height: "50px"}}/>
                            <img src={header} style={{height: "50px"}}/>
                        </picture>
                    </div>

                    <div id="shopHover" style={{margin: "10px"}}
                         onMouseEnter={this.handleMouseEnter}
                         onMouseLeave={this.handleMouseLeave}
                    >
                        <img id="shopHover" src={shopHover ? shopHoverImage : shop} style={{width: "65px"}}/>
                    </div>

                    <div id="mintHover" style={{margin: "10px"}}
                         onMouseEnter={this.handleMouseEnter}
                         onMouseLeave={this.handleMouseLeave}
                    >
                        <img id="mintHover" src={mintHover ? mintHoverImage : mint} style={{width: "65px"}}/>
                    </div>

                    <div id="projectHover" style={{flex: 1, margin: "10px"}}
                         onMouseEnter={this.handleMouseEnter}
                         onMouseLeave={this.handleMouseLeave}
                    >
                        <img id="projectHover" src={projectHoverImage} style={{width: "100px"}}/>
                    </div>

                    <div style={{margin: "20px"}} id="osHover"
                         onMouseEnter={this.handleMouseEnter}
                         onMouseLeave={this.handleMouseLeave}
                         onClick={this.opensea}
                    >
                        <img id="osHover" src={osHover ? osHoverImage : os} style={{width: "100px"}}/>
                    </div>
                </div>

                <div style={{marginTop: "50px"}}>
                    <video style={{maxWidth: "100%"}} autoPlay playsInline loop muted>
                        <source src={banner} type="video/mp4"/>
                    </video>
                </div>

                <div style={{marginTop: "100px", marginBottom: "100px", textAlign: "center"}}>
                    <img style={{maxWidth: "200px", width: "auto", height: "auto"}} src={cup}/>
                    <img style={{marginLeft: "50px", marginRight: "50px"}} className="park" src={park}/>
                    <img style={{maxWidth: "150px", width: "auto", height: "auto"}} src={cone}/>

                </div>

                <AnimationOnScroll style={{marginTop: "100px", marginBottom: "100px"}}
                                   animateIn='animate__bounceInRight'
                                   animateOut='animate__bounceOutLeft'>
                    <div class="about_flex">
                        <div class="about_flex_text_1">90's Kids is a digital collectible project and brand inspired by
                            skateboard
                            culture of the 1990s and 2000s that continues to define the trends of today. Beyond just
                            another PFP
                            project, 90s Kids will foster a community and support that encourage members to create art
                            and skate
                            together through contests both on and off board, both online and IRL.
                        </div>
                        <div class="about_flex_text_2">Skateboarding was originally based in counter
                            culture ideology, but the creativity and DIY-attitude of skateboarders has impacted culture
                            on a
                            broader scale, much like the evolution of NFTs in mainstream culture. This project pays
                            homage to
                            the striking power of skateboarding as a guiding force for creativity in the Web3 era. 90s
                            Kids
                            provides a model example of transitioning existing spaces from physical to digital.
                        </div>
                    </div>
                </AnimationOnScroll>


                <div style={{borderTop: "1px solid #FF7044", margin: "100px"}}>
                    <div style={{marginTop: "100px", marginBottom: "20px"}}>
                        To Enter our Skate and Art contests and learn more about our monthly drops mechanic, join<img
                        id="discordHover" src={discordHover ? discordHoverImage : discord}
                        style={{marginLeft: "10px", width: "100px"}} onMouseEnter={this.handleMouseEnter}
                        onMouseLeave={this.handleMouseLeave} onClick={this.discord}/>
                    </div>
                    <div style={{}}>
                        Become part of the community and own your first 90s kid on<img id="osHover"
                                                                                       src={osHover ? osHoverImage : os}
                                                                                       style={{
                                                                                           marginLeft: "10px",
                                                                                           width: "100px"
                                                                                       }}
                                                                                       onMouseEnter={this.handleMouseEnter}
                                                                                       onMouseLeave={this.handleMouseLeave}
                                                                                       onClick={this.opensea}/>
                    </div>
                </div>

                <div style={{textAlign: "center"}}>
                    goatpasture © 2022
                </div>
            </div>
        );
    }
}


export default About;
