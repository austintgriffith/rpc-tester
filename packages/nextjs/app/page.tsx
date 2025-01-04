"use client";

import { useState } from "react";
import { getBlockNumber } from "@wagmi/core";
import type { NextPage } from "next";
import { isAddress, parseEther } from "viem";
import { AddressInput } from "~~/components/scaffold-eth";
import { useTransactor } from "~~/hooks/scaffold-eth";
import { wagmiConfig } from "~~/services/web3/wagmiConfig";
import { notification } from "~~/utils/scaffold-eth";

const Home: NextPage = () => {
  const [blockNumber, setBlockNumber] = useState<bigint | null>(null);
  const [sendAddress, setSendAddress] = useState("");
  const transactor = useTransactor();

  const sendTx = async () => {
    // check if sendAddress is valid
    if (!isAddress(sendAddress)) {
      notification.error("Invalid address");
      return;
    }

    const writeTx = transactor({
      to: sendAddress,
      value: parseEther("0.0001"),
    });
    await writeTx;
  };

  const handleGetBlock = async () => {
    try {
      console.log("handleGetBlock");
      const block = await getBlockNumber(wagmiConfig, {
        cacheTime: 0,
      });
      setBlockNumber(block);
    } catch (error) {
      console.error("Error fetching block number:", error);
    }
  };

  return (
    <>
      <div className="flex items-center flex-col flex-grow pt-10">
        <div className="flex flex-col gap-4">
          <button onClick={handleGetBlock} className="btn btn-primary">
            Get Current Block
          </button>
          <p className="mt-2">{blockNumber ? `Current block: ${blockNumber.toString()}` : " "}</p>
        </div>

        <div className="mt-4">
          <p className="font-bold">Sent 0.0001 to (+ check ENS resolution!):</p>
          <AddressInput onChange={value => setSendAddress(value)} value={sendAddress} />
          <button onClick={sendTx} className="btn btn-primary mt-2">
            Send 0.0001
          </button>
        </div>
      </div>
    </>
  );
};

export default Home;
