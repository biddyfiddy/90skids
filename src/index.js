import React from "react";
import ReactDOM from "react-dom";
import "./App.css";
import App from "./App";
import Layout from "./Layout";
import About from "./About";
import Shop from "./Shop";
import Mint from "./Mint";
import { BrowserRouter, Routes, Route } from "react-router-dom";

ReactDOM.render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<App />} />
          <Route path="about" element={<About />} />
          <Route path="shop" element={<Shop />} />
          <Route path="burn" element={<Mint />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
  document.getElementById("root")
);
