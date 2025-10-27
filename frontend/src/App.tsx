/**
 * 主应用组件
 */

import { useState } from 'react';
import { useWallet } from './contexts/WalletContext';
import { useContract } from './contexts/ContractContext';
import Header from './components/Header';
import GatewayStatusBadge from './components/GatewayStatusBadge';
import ContractSelector from './components/ContractSelector';
import EmployerPanel from './components/EmployerPanel';
import EmployeePanel from './components/EmployeePanel';
import './App.css';

function App() {
  const { isConnected } = useWallet();
  const { contractType } = useContract();
  const [activePanel, setActivePanel] = useState<'employer' | 'employee'>('employer');

  return (
    <div className="app">
      <Header />
      
      <main className="main-content">
        {/* 未连接钱包提示 */}
        {!isConnected && (
          <div className="welcome-container">
            <div className="welcome-card card">
              <h2>👋 Welcome to Confidential Payroll System</h2>
              <p>Fully Encrypted Payroll Platform Powered by Zama FHEVM</p>
              <ul className="feature-list">
                <li>✅ Salary amounts fully encrypted</li>
                <li>✅ Only employees can decrypt their own salary</li>
                <li>✅ Employers can see total expenditure</li>
                <li>✅ Batch payment support</li>
                <li>✅ Automatic Gateway fallback</li>
              </ul>
              <p className="connect-hint">👆 Please connect your wallet to get started</p>
            </div>
          </div>
        )}

        {/* 已连接：三栏布局 */}
        {isConnected && (
          <div className="three-column-layout">
            {/* 左侧导航栏 */}
            <aside className="left-sidebar">
              <div className="sidebar-header">
                <h3>📋 MENU</h3>
              </div>
              
              {/* 面板切换 */}
              <div className="sidebar-tabs">
                <button
                  className={`sidebar-tab ${activePanel === 'employer' ? 'active' : ''}`}
                  onClick={() => setActivePanel('employer')}
                >
                  <span className="tab-icon">🏢</span>
                  <span className="tab-text">Employer</span>
                </button>
                <button
                  className={`sidebar-tab ${activePanel === 'employee' ? 'active' : ''}`}
                  onClick={() => setActivePanel('employee')}
                >
                  <span className="tab-icon">👤</span>
                  <span className="tab-text">Employee</span>
                </button>
              </div>

              {/* 状态信息 */}
              <div className="sidebar-status">
                <GatewayStatusBadge />
                <ContractSelector />
              </div>
            </aside>

            {/* 中间主要内容区 */}
            <main className="center-content">
              <div className="content-header">
                <h2>{activePanel === 'employer' ? '🏢 Employer - Create Payroll Plan' : '👤 Employee - View & Claim Salary'}</h2>
                <p className="content-subtitle">
                  {activePanel === 'employer' 
                    ? 'Create encrypted payroll plans with complete confidentiality' 
                    : 'Query your encrypted salary and securely claim payments'}
                </p>
              </div>
              
              <div className="content-body">
                {activePanel === 'employer' ? (
                  <EmployerPanel />
                ) : (
                  <EmployeePanel />
                )}
              </div>
            </main>

            {/* 右侧信息栏 */}
            <aside className="right-sidebar">
              <div className="sidebar-info-card">
                <h4>ℹ️ CURRENT MODE</h4>
                <div className="mode-badge">
                  {contractType === 'fhe' ? '🔐 FHE Encrypted' : '📝 Simple Test'}
                </div>
                <p className="mode-description">
                  {contractType === 'fhe' 
                    ? 'Salary amounts are fully encrypted with cryptographic-level privacy protection' 
                    : 'Salary stored in plaintext (Test only, automatically switches when Gateway is offline)'}
                </p>
              </div>

              <div className="sidebar-help-card">
                <h4>📖 INSTRUCTIONS</h4>
                {activePanel === 'employer' ? (
                  <ol className="help-steps">
                    <li>Enter payroll plan name (e.g., January 2025 Salary)</li>
                    <li>Add employee addresses and corresponding salary amounts</li>
                    <li>System automatically calculates total and encrypts data</li>
                    <li>Confirm and click "Create Payroll Plan" button</li>
                    <li>Employees can view and claim salary using plan ID</li>
                  </ol>
                ) : (
                  <ol className="help-steps">
                    <li>Get payroll plan ID from your employer (number)</li>
                    <li>Enter plan ID in the input field and query</li>
                    <li>System displays your encrypted salary information</li>
                    <li>Click "Claim Salary" button to withdraw funds</li>
                    <li>Salary will be transferred directly to your wallet</li>
                  </ol>
                )}
              </div>

              <div className="sidebar-tech-card">
                <h4>🔐 TECH FEATURES</h4>
                <ul className="tech-features">
                  <li>✨ Fully Homomorphic Encryption (FHE)</li>
                  <li>🔒 On-chain encrypted salary amounts</li>
                  <li>🎯 Zero-knowledge proof privacy</li>
                  <li>⚡ Gateway health monitoring</li>
                  <li>🔄 Auto-fallback to simple mode</li>
                </ul>
              </div>
            </aside>
          </div>
        )}
      </main>

      <footer className="footer">
        <p>
          Powered by <a href="https://www.zama.ai/" target="_blank">Zama FHEVM</a> | 
          Built for <a href="https://www.zama.ai/programs/developer-program" target="_blank">Zama Developer Program</a>
        </p>
      </footer>
    </div>
  );
}

export default App;

