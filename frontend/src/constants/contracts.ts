/**
 * 合约地址配置
 * 部署后请更新这些地址
 */

// Sepolia 测试网配置
export const NETWORK_CONFIG = {
  chainId: 11155111,
  name: "Sepolia",
  rpcUrl: "https://eth-sepolia.public.blastapi.io",
  blockExplorer: "https://sepolia.etherscan.io",
};

// 合约地址（已部署）
export const PAYROLL_SIMPLE_ADDRESS = "0xaC01Df2ac189F83aB24320b472007a8b6228948F"; // ✅ 已部署
export const PAYROLL_FHE_ADDRESS = "0xe2d2ECf4e768F4D6330861D71b17885ce58DFc8D"; // ✅ FHE 合约（使用 Zama FHEVM）

// Gateway 配置（Zama Sepolia）
export const GATEWAY_URL = "https://gateway.sepolia.zama.ai";
export const RELAYER_URL = "https://relayer.testnet.zama.cloud";

// 合约类型
export type ContractType = "simple" | "fhe";

// Gateway 状态
export type GatewayStatus = "up" | "down" | "checking";

