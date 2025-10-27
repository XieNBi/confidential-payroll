# 🔐 Confidential Payroll System
<img width="2560" height="1279" alt="image" src="https://github.com/user-attachments/assets/3067ab64-b37d-4bde-9d8d-2d90780c1f5a" />
- **Demo**: [Live Demo](https://celadon-meerkat-ee26c4.netlify.app/)


> **Privacy-Preserving Payroll Platform Powered by Zama FHEVM**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Built with FHEVM](https://img.shields.io/badge/Built%20with-FHEVM-blue)](https://www.zama.ai/)
[![Solidity](https://img.shields.io/badge/Solidity-0.8.24-363636?logo=solidity)](https://soliditylang.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)](https://react.dev/)

A revolutionary Web3 payroll distribution platform using Zama's Fully Homomorphic Encryption (FHE) technology to ensure complete confidentiality of employee salary information.

## 🌟 Highlights

### 🔒 **Cryptographic-Level Privacy Protection**
- Salary amounts are **fully encrypted** on-chain using FHE technology
- Only employees can decrypt their own salary - even employers cannot see individual amounts
- Zero-knowledge proof ensures complete privacy

### 🏗️ **Dual Contract Architecture**
- **FHE Mode**: Production-ready with full encryption
- **Simple Mode**: Testing fallback when Gateway is offline
- Automatic health monitoring and intelligent switching

### ⚡ **Enterprise-Grade Features**
- Batch salary distribution for multiple employees
- Real-time Gateway health monitoring (60s polling)
- Automatic fallback mechanism ensures high availability
- Transparent total expenditure tracking for employers

### 🎨 **Modern UI/UX**
- Dark Professional design theme
- Three-column responsive layout
- Real-time status indicators
- Intuitive employer and employee portals

---

## 📋 Table of Contents

- [Problem Statement](#-problem-statement)
- [Solution](#-solution)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Getting Started](#-getting-started)
- [Usage Guide](#-usage-guide)
- [Project Structure](#-project-structure)
- [Security](#-security)
- [Roadmap](#-roadmap)
- [Contributing](#-contributing)
- [License](#-license)

---

## 💡 Problem Statement

Traditional on-chain payroll systems face critical privacy challenges:

1. **Privacy Leakage** - All transaction amounts are publicly visible on blockchain explorers
2. **Team Conflicts** - Salary disparities can lead to internal tensions and unfair comparisons
3. **Competitive Intelligence** - Competitors can analyze salary structures
4. **Regulatory Compliance** - Violates privacy regulations in many jurisdictions

## ✅ Solution

Confidential Payroll System solves these problems using **Fully Homomorphic Encryption (FHE)**:

- ✅ **Complete Encryption** - Salary amounts are encrypted on-chain
- ✅ **Selective Decryption** - Only the employee can decrypt their own salary
- ✅ **Employer Transparency** - Employers see total expenditure, not individual salaries
- ✅ **Cryptographic Security** - Military-grade privacy protection
- ✅ **Compliance Ready** - Meets GDPR and privacy regulations

---

## 🛠️ Tech Stack

### Smart Contracts
- **Solidity** 0.8.24
- **Zama FHEVM** 0.7.0+
- **Hardhat** - Development framework
- **fhevm-core-contracts** - FHE primitives

### Frontend
- **React** 18 + **TypeScript**
- **ethers.js** v6 - Blockchain interaction
- **Vite** - Build tool
- **CSS3** - Dark Professional theme

### Infrastructure
- **Sepolia Testnet** - Ethereum test network
- **Zama Gateway** - FHE decryption service
- **MetaMask** - Wallet connection

---

## 🏗️ Architecture

### System Overview

```
┌─────────────────────────────────────────────────────┐
│                 Frontend Application                 │
│        React + TypeScript + ethers.js                │
└──────────────────┬──────────────────────────────────┘
                   │
                   ├─── Gateway Health Check
                   │
            ┌──────┴───────┐
            │              │
    ┌───────▼──────┐  ┌───▼────────┐
    │  FHE Contract│  │   Simple   │
    │  (Encrypted) │  │  Contract  │
    │   euint64    │  │ (Fallback) │
    └──────────────┘  └────────────┘
```

### Dual Contract Architecture

| Feature | FHE Mode | Simple Mode |
|---------|----------|-------------|
| **Privacy** | ✅ Cryptographic | ❌ Frontend-only |
| **Gateway Required** | ✅ Yes | ❌ No |
| **Decryption Speed** | 🐢 5-15s | ⚡ Instant |
| **Use Case** | Production | Testing/Demo |

### Data Flow

1. **Employer Creates Payroll**
   - Frontend encrypts salary amounts using FHE SDK
   - Smart contract stores encrypted values (`euint64`)
   - Only handles are stored on-chain, not actual values

2. **Employee Claims Salary**
   - Queries encrypted salary from contract
   - Requests decryption via Zama Gateway
   - Receives decrypted amount in wallet

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+
- **npm** or **yarn**
- **MetaMask** wallet
- **Sepolia testnet ETH** (get from [Sepolia Faucet](https://sepoliafaucet.com/))

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/confidential-payroll.git
cd confidential-payroll
```

2. **Install root dependencies (Smart Contracts)**
```bash
npm install
```

3. **Install frontend dependencies**
```bash
cd frontend
npm install
cd ..
```

4. **Configure environment variables**
```bash
cp .env.example .env
```

Edit `.env` and add your private key:
```env
PRIVATE_KEY=0xyour_private_key_here
SEPOLIA_RPC_URL=https://eth-sepolia.public.blastapi.io
```

⚠️ **Security Warning**: Never commit your `.env` file or expose private keys!

### Deployment

5. **Compile contracts**
```bash
npx hardhat compile
```

6. **Deploy contracts to Sepolia**
```bash
# Deploy Simple fallback contract
npm run deploy:simple

# Deploy FHE contract
npm run deploy:fhe
```

7. **Update contract addresses**

After deployment, update the addresses in `frontend/src/constants/contracts.ts`:
```typescript
export const PAYROLL_SIMPLE_ADDRESS = "0xYourSimpleContractAddress";
export const PAYROLL_FHE_ADDRESS = "0xYourFHEContractAddress";
```

8. **Start the frontend**
```bash
npm run frontend
# or
cd frontend && npm run dev
```

9. **Open in browser**
```
http://localhost:5173
```

---

## 📖 Usage Guide

### For Employers

1. **Connect Wallet**
   - Click "Connect Wallet" button
   - Approve MetaMask connection

2. **Create Payroll Plan**
   - Switch to "Employer" panel
   - Enter payroll plan name (e.g., "January 2025 Salary")
   - Add employee wallet addresses and salary amounts
   - Click "Add Employee" for multiple entries
   - Review total amount
   - Click "Create Payroll Plan"

3. **Confirm Transaction**
   - Approve the transaction in MetaMask
   - Wait for confirmation
   - Note the Plan ID and share with employees

### For Employees

1. **Connect Wallet**
   - Use your employee wallet in MetaMask
   - Connect to the application

2. **Query Salary**
   - Switch to "Employee" panel
   - Ask your employer for the Plan ID
   - Enter the Plan ID
   - Click "Query Salary"

3. **View & Claim**
   - Review your encrypted salary amount
   - Click "Claim Salary" to withdraw
   - Approve transaction in MetaMask
   - Funds transfer directly to your wallet

---

## 📁 Project Structure

```
confidential-payroll/
├── contracts/                    # Smart contracts
│   ├── PayrollFHE.sol           # FHE encrypted contract
│   └── PayrollSimple.sol        # Simple fallback contract
├── scripts/                      # Deployment scripts
│   ├── deploy_fhe.js
│   └── deploy_simple.js
├── frontend/                     # React frontend
│   ├── src/
│   │   ├── components/          # UI components
│   │   │   ├── Header.tsx
│   │   │   ├── EmployerPanel.tsx
│   │   │   ├── EmployeePanel.tsx
│   │   │   ├── GatewayStatusBadge.tsx
│   │   │   └── ContractSelector.tsx
│   │   ├── contexts/            # React contexts
│   │   │   ├── WalletContext.tsx
│   │   │   └── ContractContext.tsx
│   │   ├── hooks/               # Custom hooks
│   │   │   └── usePayroll.ts
│   │   ├── constants/           # Configuration
│   │   │   ├── contracts.ts
│   │   │   └── abis.ts
│   │   ├── utils/               # Utilities
│   │   │   └── gateway.ts
│   │   ├── App.tsx              # Main app
│   │   └── main.tsx             # Entry point
│   ├── index.html
│   └── package.json
├── hardhat.config.js            # Hardhat configuration
├── package.json
├── .gitignore
├── .env.example
└── README.md
```

---

## 🔐 Security

### FHE Mode Privacy Guarantees

In FHE mode, the system provides:

- ✅ **On-chain Encryption** - Salary amounts stored as `euint64` encrypted values
- ✅ **Selective Decryption** - Only the employee can decrypt their salary
- ✅ **Gateway Security** - Decryption happens in secure Zama Gateway
- ✅ **No Plaintext Leakage** - Employers cannot see individual salaries
- ✅ **Immutable Privacy** - Cryptographic guarantees, not just access control

### Simple Mode Warnings

⚠️ **Simple mode is for TESTING ONLY:**

- Salaries are stored in plaintext on-chain
- Anyone can view contract storage
- Frontend "hiding" is UI-only, not cryptographic
- **DO NOT use in production with real funds**

### Best Practices

- ✅ Always use FHE mode for production
- ✅ Never commit `.env` files
- ✅ Use hardware wallets for employer accounts
- ✅ Verify contract addresses before transactions
- ✅ Test on testnet before mainnet deployment

---

## 🗺️ Roadmap

### Phase 1: Core Features ✅ (Completed)
- [x] Dual contract architecture
- [x] FHE encryption for salaries
- [x] Gateway health monitoring
- [x] Automatic fallback mechanism
- [x] Basic UI/UX

### Phase 2: Enhanced Features 🚧 (In Progress)
- [ ] Multi-token support (ERC20 payments)
- [ ] Recurring payroll schedules
- [ ] Bulk CSV upload for employees
- [ ] Email notifications
- [ ] Payment history dashboard

### Phase 3: Enterprise Features 🔮 (Planned)
- [ ] Role-based access control (RBAC)
- [ ] Multi-signature approval
- [ ] Compliance reporting
- [ ] Integration with accounting software
- [ ] Mobile app (React Native)

### Phase 4: Mainnet & Scale 🌐 (Future)
- [ ] Mainnet deployment
- [ ] Cross-chain support
- [ ] DAO governance
- [ ] Staking and rewards

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/AmazingFeature
   ```
3. **Commit your changes**
   ```bash
   git commit -m 'Add some AmazingFeature'
   ```
4. **Push to the branch**
   ```bash
   git push origin feature/AmazingFeature
   ```
5. **Open a Pull Request**

### Development Guidelines

- Follow existing code style
- Add comments for complex logic
- Update README for new features
- Test thoroughly before submitting

---

## 🐛 Troubleshooting

### Gateway Connection Failed
```
❌ Gateway unavailable: Failed to fetch
```
**Solution**: System automatically switches to Simple mode. Gateway will retry every 60 seconds.

### Transaction Reverted
```
❌ Error: execution reverted
```
**Common causes:**
- Incorrect network (ensure Sepolia is selected)
- Insufficient balance
- Contract address not updated
- Gas limit too low

### MetaMask Issues
- Ensure you're connected to Sepolia testnet
- Try resetting MetaMask account (Settings → Advanced → Reset Account)
- Clear browser cache

---

## 📚 Resources

### Zama Documentation
- [Zama Official Website](https://www.zama.ai/)
- [FHEVM Documentation](https://docs.zama.ai/fhevm)
- [Gateway Guide](https://docs.zama.ai/fhevm/guides/gateway)
- [Developer Program](https://www.zama.ai/programs/developer-program)

### Learning Resources
- [Solidity Documentation](https://docs.soliditylang.org/)
- [ethers.js Documentation](https://docs.ethers.org/)
- [React Documentation](https://react.dev/)
- [Hardhat Documentation](https://hardhat.org/)

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **[Zama](https://www.zama.ai/)** - For providing the groundbreaking FHEVM technology
- **[Zama Developer Program](https://www.zama.ai/programs/developer-program)** - For supporting this project
- The Ethereum and Web3 community

---

## 📞 Contact & Links

- **GitHub**: [yourusername/confidential-payroll](https://github.com/yourusername/confidential-payroll)
- **Demo**: [Live Demo](https://your-demo-link.com)
- **Issues**: [Report Issues](https://github.com/yourusername/confidential-payroll/issues)

---

<div align="center">

**Built with ❤️ for Zama Developer Program**

⭐ **Star this repo if you find it useful!** ⭐

</div>
