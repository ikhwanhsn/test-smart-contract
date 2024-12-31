"use client";

import React, { useState, useEffect } from "react";
import Web3 from "web3";
import { contractABI } from "./services/abi";
import { Contract, ContractAbi } from "web3";

declare global {
  interface Window {
    ethereum: any;
  }
}

const contractAddress = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";

const Home = () => {
  const [web3, setWeb3] = useState<Web3 | null>(null);
  const [account, setAccount] = useState<string>("");
  const [contract, setContract] = useState<Contract<ContractAbi> | null>(null);
  const [message, setMessage] = useState<string>("");
  const [latestMessage, setLatestMessage] = useState<string>("");
  const [latestSender, setLatestSender] = useState<string>("");

  useEffect(() => {
    const initWeb3 = async () => {
      try {
        if (typeof window.ethereum !== "undefined") {
          const web3Instance = new Web3(window.ethereum);
          await window.ethereum.request({ method: "eth_requestAccounts" });
          const accounts = await web3Instance.eth.getAccounts();
          setAccount(accounts[0]);

          const contractInstance = new web3Instance.eth.Contract(
            contractABI,
            contractAddress
          );
          setWeb3(web3Instance);
          setContract(contractInstance);
        } else {
          alert("Please install MetaMask!");
        }
      } catch (error) {
        alert(`Error: ${error}`);
      }
    };

    initWeb3();
  }, []);

  const postMessage = async () => {
    try {
      if (contract && web3 && message.trim()) {
        await contract.methods.postMessage(message).send({ from: account });
        alert("Message posted successfully!");
        setMessage("");
      } else {
        alert("Please enter a message.");
      }
    } catch (error) {
      alert(`Error: ${error}`);
    }
  };

  const fetchLatestMessage = async () => {
    try {
      if (!contract) {
        alert("Contract not initialized.");
        return;
      }
      const res: [string, string] = await contract.methods
        .getLatestMessage()
        .call();
      setLatestMessage(res[0]);
      setLatestSender(res[1]);
    } catch (error) {
      alert(`Error: ${error}`);
    }
  };

  return (
    <div
      style={{ padding: "20px" }}
      className="bg-white min-h-screen text-black"
    >
      <h1>Message DApp</h1>
      <div>
        <h3>Post a Message</h3>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Enter your message"
          style={{ width: "300px", marginRight: "10px" }}
          className="input input-bordered input-primary w-full max-w-xs bg-white"
        />
        <button onClick={postMessage} className="btn btn-primary">
          Post Message
        </button>
      </div>
      <div style={{ marginTop: "20px" }}>
        <h3>Latest Message</h3>
        <button onClick={fetchLatestMessage} className="btn btn-primary">
          Get Latest Message
        </button>
        <p>
          <strong>Message:</strong> {latestMessage || "N/A"}
        </p>
        <p>
          <strong>Sender:</strong> {latestSender || "N/A"}
        </p>
      </div>
    </div>
  );
};

export default Home;
