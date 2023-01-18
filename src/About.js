import React from "react";
import "./App.css";
import header from './img/header.png';
import header2 from './img/header2.png';

import cone from './img/cone.png';
import cup from './img/cup.png';


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
                <div>
                    <div style={{flex:1, margin: "10px"}}>
                        <picture>
                            <source media="(max-width: 900px)" srcSet={header2} style={{height: "50px"}} />
                            <img src={header} style={{height: "50px"}}/>
                        </picture>

                    </div>
                </div>
                <div style={{margin: "5%", flex: "row", maxWidth: "1600px"}}>
                    <div class="flex_about">
                        <div style={{width: "45%"}}>90's Kids is a digital collectible project and brand inspired by skateboard culture of the 1990s and 2000s that continues to define the trends of today. Beyond just another PFP project, 90s Kids will foster a community and support that encourage members to create art and skate together through contests both on and off board, both online and IRL.</div>
                        <img style={{marginLeft: "50px", maxWidth: "200px", width: "auto", height: "auto"}} src={cup} />
                    </div>
                    <div class="flex_about">
                        <img style={{maxWidth: "200px", width: "auto", height: "auto"}} src={cone} />
                        <div style={{marginLeft: "50px", width: "45%"}}>Skateboarding was originally based in counter culture ideology, but the creativity and DIY-attitude of skateboarders has impacted culture on a broader scale, much like the evolution of NFTs in mainstream culture. This project pays homage to the striking power of skateboarding as a guiding force for creativity in the Web3 era. 90s Kids provides a model example of transitioning existing spaces from physical to digital.</div>
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

export default About;
