/**
 * 薪酬系统 Hook - 统一的合约交互接口
 * 支持双合约架构（FHE + Simple）
 */

import { useState, useCallback } from 'react';
import { ethers } from 'ethers';
import { useWallet } from '../contexts/WalletContext';
import { useContract } from '../contexts/ContractContext';
import {
  PAYROLL_SIMPLE_ADDRESS,
  PAYROLL_FHE_ADDRESS,
} from '../constants/contracts';
import { PAYROLL_SIMPLE_ABI, PAYROLL_FHE_ABI } from '../constants/abis';

export interface PayrollPlan {
  id: number;
  employer: string;
  title: string;
  employeeCount: number;
  totalAmount: string; // 格式化后的 ETH
  createdAt: number;
  isActive: boolean;
}

export interface EmployeeSalary {
  address: string;
  salary: string; // 格式化后的 ETH
  hasClaimed: boolean;
}

export function usePayroll() {
  const { signer, address } = useWallet();
  const { contractType } = useContract();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 获取当前合约实例
  const getContract = useCallback(() => {
    if (!signer) throw new Error("钱包未连接");

    const contractAddress = contractType === "fhe" 
      ? PAYROLL_FHE_ADDRESS 
      : PAYROLL_SIMPLE_ADDRESS;
    
    const abi = contractType === "fhe" 
      ? PAYROLL_FHE_ABI 
      : PAYROLL_SIMPLE_ABI;

    return new ethers.Contract(contractAddress, abi, signer);
  }, [signer, contractType]);

  // 创建薪酬计划（Simple 模式）
  const createPayrollSimple = useCallback(async (
    title: string,
    employees: string[],
    salaries: string[] // ETH 金额字符串数组
  ) => {
    try {
      setLoading(true);
      setError(null);

      const contract = getContract();

      // 转换为 Wei
      const salariesWei = salaries.map(s => ethers.parseEther(s));
      
      // 计算总金额
      const totalAmount = salariesWei.reduce((sum, amount) => sum + amount, 0n);

      console.log("📝 创建薪酬计划 (Simple):", {
        title,
        employees: employees.length,
        totalAmount: ethers.formatEther(totalAmount)
      });

      const tx = await contract.createPayroll(
        title,
        employees,
        salariesWei,
        { value: totalAmount }
      );

      console.log("⏳ 交易已发送:", tx.hash);
      const receipt = await tx.wait();
      console.log("✅ 交易已确认");

      // 从事件中获取 planId
      const event = receipt.logs
        .map((log: any) => {
          try {
            return contract.interface.parseLog(log);
          } catch {
            return null;
          }
        })
        .find((e: any) => e && e.name === "PayrollCreated");

      const planId = event ? Number(event.args[0]) : null;

      return { success: true, planId, txHash: tx.hash };
    } catch (err: any) {
      console.error("创建薪酬计划失败:", err);
      const message = err.reason || err.message || "创建失败";
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  }, [getContract]);

  // 创建薪酬计划（FHE 模式）
  const createPayrollFHE = useCallback(async (
    title: string,
    employees: string[],
    encryptedSalaries: string[], // 加密的薪资（handles）
    inputProofs: string[]         // 证明（attestations）
  ) => {
    try {
      setLoading(true);
      setError(null);

      const contract = getContract();

      console.log("📝 创建薪酬计划 (FHE):", {
        title,
        employees: employees.length
      });

      // 注意：FHE 模式下，总金额通过 msg.value 传递
      // 这里需要前端计算总金额（或由企业输入）
      // 简化处理：假设前端已经知道总金额
      const totalAmount = ethers.parseEther("0.1"); // TODO: 实际应该计算

      const tx = await contract.createPayroll(
        title,
        employees,
        encryptedSalaries,
        inputProofs,
        { value: totalAmount }
      );

      console.log("⏳ 交易已发送:", tx.hash);
      const receipt = await tx.wait();
      console.log("✅ 交易已确认");

      const event = receipt.logs
        .map((log: any) => {
          try {
            return contract.interface.parseLog(log);
          } catch {
            return null;
          }
        })
        .find((e: any) => e && e.name === "PayrollCreated");

      const planId = event ? Number(event.args[0]) : null;

      return { success: true, planId, txHash: tx.hash };
    } catch (err: any) {
      console.error("创建薪酬计划失败:", err);
      const message = err.reason || err.message || "创建失败";
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  }, [getContract]);

  // 获取薪酬计划信息
  const getPlanInfo = useCallback(async (planId: number): Promise<PayrollPlan | null> => {
    try {
      const contract = getContract();
      const info = await contract.getPlanInfo(planId);

      return {
        id: Number(info[0]),
        employer: info[1],
        title: info[2],
        employeeCount: Number(info[3]),
        totalAmount: ethers.formatEther(info[4]),
        createdAt: Number(info[5]),
        isActive: info[6],
      };
    } catch (err) {
      console.error("获取计划信息失败:", err);
      return null;
    }
  }, [getContract]);

  // 获取我的薪资
  const getMySalary = useCallback(async (planId: number): Promise<string | null> => {
    try {
      const contract = getContract();
      
      if (contractType === "simple") {
        const salary = await contract.getMySalary(planId);
        return ethers.formatEther(salary);
      } else {
        // FHE 模式：需要先解密
        const decryptedSalary = await contract.getMyDecryptedSalary(planId);
        if (decryptedSalary > 0) {
          return ethers.formatEther(decryptedSalary);
        }
        return null; // 尚未解密
      }
    } catch (err) {
      console.error("获取薪资失败:", err);
      return null;
    }
  }, [getContract, contractType]);

  // 领取薪资
  const claimSalary = useCallback(async (planId: number) => {
    try {
      setLoading(true);
      setError(null);

      const contract = getContract();

      console.log("💰 领取薪资:", planId);

      const tx = await contract.claimSalary(planId);
      console.log("⏳ 交易已发送:", tx.hash);
      
      await tx.wait();
      console.log("✅ 领取成功");

      return { success: true, txHash: tx.hash };
    } catch (err: any) {
      console.error("领取薪资失败:", err);
      const message = err.reason || err.message || "领取失败";
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  }, [getContract]);

  // 请求解密薪资（仅 FHE 模式）
  const requestDecryption = useCallback(async (planId: number) => {
    if (contractType !== "fhe") {
      throw new Error("只有 FHE 模式需要解密");
    }

    try {
      setLoading(true);
      setError(null);

      const contract = getContract();

      console.log("🔓 请求解密薪资:", planId);

      const tx = await contract.requestSalaryDecryption(planId);
      console.log("⏳ 解密请求已发送:", tx.hash);
      
      await tx.wait();
      console.log("✅ 解密请求已提交，等待 Gateway 回调...");

      return { success: true, txHash: tx.hash };
    } catch (err: any) {
      console.error("请求解密失败:", err);
      const message = err.reason || err.message || "请求失败";
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  }, [getContract, contractType]);

  // 获取薪酬计划数量
  const getPlanCount = useCallback(async (): Promise<number> => {
    try {
      const contract = getContract();
      const count = await contract.planCounter();
      return Number(count);
    } catch (err) {
      console.error("获取计划数量失败:", err);
      return 0;
    }
  }, [getContract]);

  return {
    loading,
    error,
    createPayrollSimple,
    createPayrollFHE,
    getPlanInfo,
    getMySalary,
    claimSalary,
    requestDecryption,
    getPlanCount,
  };
}

