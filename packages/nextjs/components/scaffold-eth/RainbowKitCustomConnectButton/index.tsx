"use client";

import { useState } from "react";
// @refresh reset
import { Balance } from "../Balance";
import { AddressInfoDropdown } from "./AddressInfoDropdown";
import { AddressQRCodeModal } from "./AddressQRCodeModal";
import { WrongNetworkDropdown } from "./WrongNetworkDropdown";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Address, formatEther } from "viem";
import { useAccount } from "wagmi";
import { getBalance } from "wagmi/actions";
import { useNetworkColor } from "~~/hooks/scaffold-eth";
import { useTargetNetwork } from "~~/hooks/scaffold-eth/useTargetNetwork";
import { wagmiConfig } from "~~/services/web3/wagmiConfig";
import { getBlockExplorerAddressLink } from "~~/utils/scaffold-eth";

/**
 * Custom Wagmi Connect Button (watch balance + custom design)
 */
export const RainbowKitCustomConnectButton = () => {
  const networkColor = useNetworkColor();
  const { targetNetwork } = useTargetNetwork();
  const { address: connectedAccountAddress } = useAccount();
  const [formattedBalance, setFormattedBalance] = useState<number | null>(null);

  const getBalanceFromConnectedAccount = async () => {
    if (!connectedAccountAddress) {
      console.error("No connected account address");
      return;
    }

    const balance = await getBalance(wagmiConfig, {
      address: connectedAccountAddress,
    });
    const calculatedFormattedBalance = balance ? Number(formatEther(balance.value)) : 0;
    setFormattedBalance(calculatedFormattedBalance);
  };

  return (
    <ConnectButton.Custom>
      {({ account, chain, openConnectModal, mounted }) => {
        const connected = mounted && account && chain;
        const blockExplorerAddressLink = account
          ? getBlockExplorerAddressLink(targetNetwork, account.address)
          : undefined;

        return (
          <>
            {(() => {
              if (!connected) {
                return (
                  <button className="btn btn-primary btn-sm" onClick={openConnectModal} type="button">
                    Connect Wallet
                  </button>
                );
              }

              if (chain.unsupported || chain.id !== targetNetwork.id) {
                return <WrongNetworkDropdown />;
              }

              return (
                <>
                  <div className="flex flex-col items-center mr-1">
                    <button
                      className={`btn btn-sm btn-ghost flex flex-col font-normal items-center hover:bg-transparent`}
                      onClick={getBalanceFromConnectedAccount}
                      type="button"
                    >
                      <div className="w-full flex flex-col items-center justify-center">
                        <div>
                          {formattedBalance === null ? (
                            <span>Click to get balance</span>
                          ) : (
                            <>
                              <span>{formattedBalance.toFixed(4)}</span>
                              <span className="text-[0.8em] font-bold ml-1">{targetNetwork.nativeCurrency.symbol}</span>
                            </>
                          )}
                        </div>
                        <span className="text-xs" style={{ color: networkColor }}>
                          {chain.name}
                        </span>
                      </div>
                    </button>
                  </div>
                  <AddressInfoDropdown
                    address={account.address as Address}
                    displayName={account.displayName}
                    ensAvatar={account.ensAvatar}
                    blockExplorerAddressLink={blockExplorerAddressLink}
                  />
                  <AddressQRCodeModal address={account.address as Address} modalId="qrcode-modal" />
                </>
              );
            })()}
          </>
        );
      }}
    </ConnectButton.Custom>
  );
};
