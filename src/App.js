import React from "react";
import "./App.css";
import header from './img/header.png';
import header2 from './img/header2.png';

import one from './img/1.png';
import two from './img/2.png';
import three from './img/3.png';

import "@fontsource/montserrat";
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
            accounts: null,
        }
        this.handleMouseEnter = this.handleMouseEnter.bind(this);
        this.handleMouseLeave = this.handleMouseLeave.bind(this);
    }

    async componentDidMount() {
        const {ethereum} = window
        if (ethereum) {
            const accounts = await ethereum.request({
                method: 'eth_accounts',
            }).catch((error) => {
                console.error(error);
            });

            this.setState({
                accounts: accounts,
            })
        }
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
                <div class="flex">
                    <div style={{
                        height: "600px",
                        flex: 1
                    }}
                         onMouseEnter={this.handleMouseEnter}
                         onMouseLeave={this.handleMouseLeave}
                         id="pane1Hover"
                    >
                        <div style={{
                            fontWeight: "bold",
                            position: "absolute",
                            "marginTop": "10%",
                            "marginLeft": "5%",
                            zIndex: "1"
                        }} id="pane1Hover">SHOP</div>
                        <img id="pane1Hover" src={one} style={{
                            opacity: pane1Hover ? "1.0" : "0.0",
                            height: "100%",
                            width : "100%",
                            transition: "opacity 300ms ease-in",
                            MozTransition:  "opacity 300ms ease-in",
                            WebkitTransition:  "opacity 300ms ease-in"
                        }} />

                    </div>
                    <div class="flex_container" style={{
                        height: "600px",
                    }}
                         onMouseEnter={this.handleMouseEnter}
                         onMouseLeave={this.handleMouseLeave}
                         id="pane2Hover"
                    >
                        <div style={{
                            fontWeight: "bold",
                            position: "absolute",
                            "marginTop": "10%",
                            "marginLeft": "5%",
                            zIndex: "1"
                        }}                          id="pane2Hover">ABOUT</div>
                        <img id="pane2Hover" src={two} style={{
                            opacity: pane2Hover ? "1.0" : "0.0",
                            height: "100%",
                            width : "100%",
                            transition: "opacity 300ms ease-in",
                            MozTransition:  "opacity 300ms ease-in",
                            WebkitTransition:  "opacity 300ms ease-in"
                        }} />
                    </div>
                    <div style={{
                        height: "600px",
                        flex: 1
                    }}
                         onMouseEnter={this.handleMouseEnter}
                         onMouseLeave={this.handleMouseLeave}
                         id="pane3Hover"
                    >
                        <div style={{
                            fontWeight: "bold",
                            position: "absolute",
                            "marginTop": "10%",
                            "marginLeft": "5%",
                            zIndex: "1"

                        }}  id="pane3Hover">MINT</div>
                        <img id="pane3Hover" src={three} style={{
                            opacity: pane3Hover ? "1.0" : "0.0",
                            height: "100%",
                            width : "100%",
                            transition: "opacity 300ms ease-in",
                            MozTransition:  "opacity 300ms ease-in",
                            WebkitTransition:  "opacity 300ms ease-in"
                        }} />
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

export default App;
