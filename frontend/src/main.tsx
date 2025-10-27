import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { WalletProvider } from './contexts/WalletContext.tsx'
import { ContractProvider } from './contexts/ContractContext.tsx'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <WalletProvider>
      <ContractProvider>
        <App />
      </ContractProvider>
    </WalletProvider>
  </React.StrictMode>,
)

