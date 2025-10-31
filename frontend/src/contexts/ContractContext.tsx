/**
 * Contract Context - Manage dual contract architecture and Gateway status
 * Based on documentation best practices
 */

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ContractType, GatewayStatus } from '../constants/contracts';
import { checkGatewayHealth, startGatewayMonitor } from '../utils/gateway';

interface ContractContextType {
  contractType: ContractType;
  gatewayStatus: GatewayStatus;
  isAutoMode: boolean;
  setContractType: (type: ContractType) => void;
  setAutoMode: (auto: boolean) => void;
  refreshGatewayStatus: () => Promise<void>;
}

const ContractContext = createContext<ContractContextType | undefined>(undefined);

export function ContractProvider({ children }: { children: ReactNode }) {
  const [contractType, setContractType] = useState<ContractType>("simple");
  const [gatewayStatus, setGatewayStatus] = useState<GatewayStatus>("checking");
  const [isAutoMode, setIsAutoMode] = useState(true); // Auto mode by default

  // Refresh Gateway status
  const refreshGatewayStatus = async () => {
    setGatewayStatus("checking");
    const isUp = await checkGatewayHealth();
    setGatewayStatus(isUp ? "up" : "down");
    return Promise.resolve();
  };

  // 初始化：检查 Gateway 状态
  useEffect(() => {
    const init = async () => {
      console.log("🔍 检查 Gateway 状态...");
      const isUp = await checkGatewayHealth();
      const newStatus: GatewayStatus = isUp ? "up" : "down";
      setGatewayStatus(newStatus);

      // 自动模式：根据 Gateway 状态自动切换合约
      if (isAutoMode) {
        const newType: ContractType = isUp ? "fhe" : "simple";
        setContractType(newType);
        console.log(`🤖 自动模式: 使用 ${newType === "fhe" ? "FHE" : "Simple"} 合约`);
      }
    };

    init();
  }, []);

  // 启动 Gateway 监控（60 秒轮询）
  useEffect(() => {
    console.log("🚀 启动 Gateway 健康监控...");
    
    const cleanup = startGatewayMonitor((isUp) => {
      const newStatus: GatewayStatus = isUp ? "up" : "down";
      setGatewayStatus(newStatus);

      // 自动模式：Gateway 状态变化时自动切换合约
      if (isAutoMode) {
        const newType: ContractType = isUp ? "fhe" : "simple";
        if (newType !== contractType) {
          setContractType(newType);
          console.log(`🔄 Gateway 状态变化，自动切换到 ${newType === "fhe" ? "FHE" : "Simple"} 合约`);
        }
      }
    });

    return cleanup;
  }, [isAutoMode, contractType]);

  // 当自动模式状态改变时，可能需要调整合约类型
  useEffect(() => {
    if (isAutoMode) {
      const newType: ContractType = gatewayStatus === "up" ? "fhe" : "simple";
      if (newType !== contractType) {
        setContractType(newType);
        console.log(`🤖 切换到自动模式: 使用 ${newType === "fhe" ? "FHE" : "Simple"} 合约`);
      }
    }
  }, [isAutoMode]);

  // 手动切换合约类型
  const handleSetContractType = (type: ContractType) => {
    setContractType(type);
    // 切换到手动模式
    if (isAutoMode) {
      setIsAutoMode(false);
      console.log("👤 切换到手动模式");
    }
  };

  return (
    <ContractContext.Provider
      value={{
        contractType,
        gatewayStatus,
        isAutoMode,
        setContractType: handleSetContractType,
        setAutoMode: setIsAutoMode,
        refreshGatewayStatus,
      }}
    >
      {children}
    </ContractContext.Provider>
  );
}

export function useContract() {
  const context = useContext(ContractContext);
  if (!context) {
    throw new Error('useContract must be used within ContractProvider');
  }
  return context;
}

