import React from "react";
import "./App.css";
import { Link } from "react-router-dom";
import header from './img/header.png';
import { abi, address, bytecode }  from  "../src/abi/og_contract.json"
import {BigNumber, ethers} from "ethers"
import banner from './img/banner.mp4';
import metamask from './img/metamask.png';
import comingSoon from './img/coming_soon_fence.png';
import styled from "styled-components";

class Mint extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            accounts: undefined
        };
        this.connectMetamask = this.connectMetamask.bind(this);
    }

    async connectMetamask() {
        const {ethereum} = window
        let accounts = await ethereum.request({ method: 'eth_requestAccounts' });
        this.setState({
            accounts : accounts
        })
    }

    async componentDidMount() {
        const {ethereum} = window
        if (ethereum) {
            const accounts = await ethereum.request({
                method: 'eth_accounts',
            }).catch((error) => {
                console.error(error);
            });

            if (!accounts || accounts.length === 0) {
                return;
            }

            this.setState({
                accounts: accounts,
            })
        }
    }

    render() {

        const { accounts } = this.state;

        return (
            <div style={{backgroundSize: "cover", backgroundColor: "black", color: "lightgray", lineHeight: "1.8", letterSpacing: "1px"}}>

                <div style={{marginTop: "10px"}}><Link to="/">
                    <img src={header} style={{marginLeft: "10px", height: "75px"}} alt="header"/></Link>
{/*                    <video style={{maxWidth: "100%"}} autoPlay playsInline loop muted>
                        <source src={banner} type="video/mp4"/>
                    </video>*/}
                </div>

                {!accounts || accounts.length === 0 ?

                    <div style={{textAlign: "center", marginTop: "20px"}}>
                        <div>

                        <div style={{ display: "flex", justifyContent: "center"}} onClick={() => this.connectMetamask()}>

                            <div style={{ border: "1px dashed", padding: "10px", display: "flex", alignItems: "center"}}>
                    

                            <img src={metamask} style={{ height: "32px"}} alt="comingSoon"/>
                                <span style={{  paddingLeft: "10px", height: "32px"}}>Connect with MetaMask</span>
                            </div>
                        </div>
                        </div>
                    </div>
                    :
                    <div style={{textAlign: "center"}}>
                        <img src={comingSoon} style={{ marginTop: "10px", width: "50%"}} alt="comingSoon"/>
                    </div>





                }



                <div style={{textAlign: "center", marginTop : "500px"}}>
                    90s kids © 2023
                </div>
            </div>
        );
    }
}


export default Mint;
