import React from "react";
import { Link } from "react-router-dom";

class Flip extends React.Component {
  async componentDidMount() {}

  render() {
    return (
      <iframe
        src="assets/iframe.html?hash=RkY2RDc5NjZBRUQrdGpzNGk5aGJkYw=="
        width="100%"
        height="100%"
        seamless="seamless"
        scrolling="no"
        frameborder="0"
        allowtransparency="true"
        allowfullscreen="true"
      ></iframe>
    );
  }
}

export default Flip;
