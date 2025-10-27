/**
 * Wallet Connection Context
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ethers } from 'ethers';
import { NETWORK_CONFIG } from '../constants/contracts';

interface WalletContextType {
  address: string | null;
  signer: ethers.Signer | null;
  provider: ethers.BrowserProvider | null;
  isConnected: boolean;
  isConnecting: boolean;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [address, setAddress] = useState<string | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  const isConnected = !!address && !!signer;

  // 连接钱包
  const connectWallet = async () => {
    if (!window.ethereum) {
      alert("请安装 MetaMask 钱包!");
      return;
    }

    try {
      setIsConnecting(true);

      const provider = new ethers.BrowserProvider(window.ethereum);

      // 请求账户访问
      await provider.send("eth_requestAccounts", []);

      // 检查网络
      const network = await provider.getNetwork();
      if (Number(network.chainId) !== NETWORK_CONFIG.chainId) {
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: ethers.toQuantity(NETWORK_CONFIG.chainId) }],
          });
        } catch (switchError: any) {
          // 如果网络不存在，添加网络
          if (switchError.code === 4902) {
            alert(`请在 MetaMask 中切换到 ${NETWORK_CONFIG.name} 网络`);
          }
          throw switchError;
        }
      }

      const signer = await provider.getSigner();
      const address = await signer.getAddress();

      setProvider(provider);
      setSigner(signer);
      setAddress(address);

      console.log("✅ 钱包已连接:", address);
    } catch (error) {
      console.error("连接钱包失败:", error);
      alert("连接钱包失败，请重试");
    } finally {
      setIsConnecting(false);
    }
  };

  // 断开钱包
  const disconnectWallet = () => {
    setAddress(null);
    setSigner(null);
    setProvider(null);
    console.log("✅ 钱包已断开");
  };

  // 监听账户变化
  useEffect(() => {
    if (!window.ethereum) return;

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        disconnectWallet();
      } else if (accounts[0] !== address) {
        connectWallet();
      }
    };

    const handleChainChanged = () => {
      window.location.reload();
    };

    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);

    return () => {
      window.ethereum?.removeListener('accountsChanged', handleAccountsChanged);
      window.ethereum?.removeListener('chainChanged', handleChainChanged);
    };
  }, [address]);

  return (
    <WalletContext.Provider
      value={{
        address,
        signer,
        provider,
        isConnected,
        isConnecting,
        connectWallet,
        disconnectWallet,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within WalletProvider');
  }
  return context;
}

