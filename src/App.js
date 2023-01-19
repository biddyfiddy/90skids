import React from "react";
import "./App.css";
import header from './img/header.png';
import header2 from './img/header2.png';

import { Link } from "react-router-dom";

import one from './img/1.png';
import oneBw from './img/1_bw.png';
import two from './img/2.png';
import twoBw from './img/2_bw.png';
import three from './img/3.png';
import threeBw from './img/3_bw.png';
import os from './img/os.png';
import osHoverImage from './img/os_hover.png';

import shop from './img/shop.png';
import project from './img/project.png';
import mint from './img/mint.png';

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

class App extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            pane1Hover: false,
            pane2Hover: false,
            pane3Hover: false,
            osHover: false,
            accounts: null,
        }
        this.handleMouseEnter = this.handleMouseEnter.bind(this);
        this.handleMouseLeave = this.handleMouseLeave.bind(this);
        this.opensea = this.opensea.bind(this);
    }

    async componentDidMount() {

    }

    opensea() {
        window.open("https://opensea.io/collection/90s-kids", "_blank")
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

        const { pane1Hover, pane2Hover, pane3Hover, osHover } = this.state;
        return (
            <div style={{backgroundColor: "black", color: "lightgray", lineHeight: "1.8", letterSpacing: "1px"}}>
                <div style={{
                    flexDirection: "row",
                         display: "flex"
                }}>
                    <div style={{flex:1, margin: "10px"}}>
                        <picture>
                            <source media="(max-width: 900px)" srcSet={header2} style={{height: "50px"}} />
                            <img src={header} style={{height: "50px"}}/>
                        </picture>
                    </div>
                    <div style={{margin: "20px"}} id="osHover"
                         onMouseEnter={this.handleMouseEnter}
                         onMouseLeave={this.handleMouseLeave}
                        onClick={this.opensea}
                    >
                        <img id="osHover" src={osHover ? osHoverImage : os} style={{ width: "100px"}} />
                        </div>
                </div>
                <div class="flex">
                    <div style={{
                        flex: 1,
                        border: "1px dashed"
                    }} class="flex_pane"
                         onMouseEnter={this.handleMouseEnter}
                         onMouseLeave={this.handleMouseLeave}
                         id="pane1Hover"
                    >
                        <div style={{
                            fontWeight: "bold",
                            position: "absolute",
                            marginTop: "10%",
                            marginLeft: "5%",
                            fontSize: "1.5rem",
                            zIndex: "1"
                        }} id="pane1Hover">
                            <img src={shop} style={{ height: "20px"}}/>
                        </div>
                        <img id="pane1Hover" src={pane1Hover ? one : oneBw} style={{
                            opacity: pane1Hover ? "1.0" : "0.5",
                            width : "100%",
                            transition: "opacity 300ms ease-in",
                            MozTransition:  "opacity 300ms ease-in",
                            WebkitTransition:  "opacity 300ms ease-in"
                        }} />

                    </div>
                    <div class="flex_container" 
                         onMouseEnter={this.handleMouseEnter}
                         onMouseLeave={this.handleMouseLeave}
                         id="pane2Hover"

                    ><Link to="/about">
                        <div style={{
                            fontWeight: "bold",
                            position: "absolute",
                            marginTop: "10%",
                            marginLeft: "5%",
                            fontSize: "1.5rem",
                            zIndex: "1"
                        }}                          id="pane2Hover">
                            <img src={project} style={{ height: "20px"}}/>
                        <br />
                        </div>
                        <img id="pane2Hover" src={pane2Hover ? two : twoBw}  style={{
                            opacity: pane2Hover ? "1.0" : "0.5",
                            width : "100%",
                            transition: "opacity 300ms ease-in",
                            MozTransition:  "opacity 300ms ease-in",
                            WebkitTransition:  "opacity 300ms ease-in"
                        }} /></Link>
                    </div>
                    <div style={{
                        flex: 1,
                        border: "1px dashed"
                    }} class="flex_pane"
                         onMouseEnter={this.handleMouseEnter}
                         onMouseLeave={this.handleMouseLeave}
                         id="pane3Hover"
                    >
                        <div style={{
                            fontWeight: "bold",
                            position: "absolute",
                            marginTop: "10%",
                            marginLeft: "5%",
                            fontSize: "1.5rem",
                            zIndex: "1"

                        }}  id="pane3Hover">
                            <img src={mint} style={{ height: "20px"}}/>
                        </div>
                        <img id="pane3Hover" src={pane3Hover ? three : threeBw} style={{
                            opacity: pane3Hover ? "1.0" : "0.5",
                            width : "100%",
                            transition: "opacity 300ms ease-in",
                            MozTransition:  "opacity 300ms ease-in",
                            WebkitTransition:  "opacity 300ms ease-in"
                        }} />
                    </div>
                </div>
                <div style={{    textAlign: "center"}}>
                    <a href={"https://t.co/y2nWTn2K1B"} target="_blank">discord</a>
                    <span> / </span>
                    <a href={"https://mobile.twitter.com/90s_kids_club"} target="_blank">twitter</a>
                    <span> / </span>
                    <a href={"https://www.instagram.com/90s_kids_club/"} target="_blank">instagram</a>
                </div>
                <div style={{    textAlign: "center"}}>
                    90s kids © 2023
                </div>
            </div>
        );
    }
}

export default App;
