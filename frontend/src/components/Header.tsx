/**
 * 页面头部组件
 */

import { useWallet } from '../contexts/WalletContext';
import './Header.css';

export default function Header() {
  const { address, isConnected, isConnecting, connectWallet, disconnectWallet } = useWallet();

  const formatAddress = (addr: string) => {
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  return (
    <header className="header">
      <div className="header-container">
      <div className="logo">
        <span className="logo-icon">🔐</span>
        <span className="logo-text">CONFIDENTIAL PAYROLL</span>
      </div>

        <div className="header-actions">
          {!isConnected ? (
            <button 
              className="primary connect-btn" 
              onClick={connectWallet}
              disabled={isConnecting}
            >
              {isConnecting ? (
                <>
                  <span className="spinner"></span>
                  <span>Connecting...</span>
                </>
              ) : (
                'Connect Wallet'
              )}
            </button>
          ) : (
            <div className="wallet-info">
              <span className="address-badge">{formatAddress(address!)}</span>
              <button 
                className="secondary disconnect-btn" 
                onClick={disconnectWallet}
              >
                Disconnect
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

