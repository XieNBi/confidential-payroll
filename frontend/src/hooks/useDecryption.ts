/**
 * useDecryption Hook - 完整的解密流程
 * 参考：FHEVM 开发标准手册第 3.4 节
 */

import { useState, useCallback } from 'react';
import { ethers } from 'ethers';
import RelayerClient, { PollProgress } from '../utils/relayerClient';
import { PAYROLL_FHE_ADDRESS } from '../constants/contracts';
import { PAYROLL_FHE_ABI } from '../constants/abis';

export interface DecryptionStatus {
  status: 'idle' | 'requesting' | 'polling' | 'waiting' | 'success' | 'failed';
  progress: number;
  error: string | null;
  result: {
    planId: number;
    decryptedSalary: string;
    requestId?: bigint;
  } | null;
}

/**
 * 完整的解密流程 Hook（5个步骤）
 */
export function useDecryption() {
  const [status, setStatus] = useState<DecryptionStatus['status']>('idle');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<DecryptionStatus['result']>(null);

  const relayerClient = new RelayerClient('sepolia');

  /**
   * 完整的解密流程
   */
  const requestSalaryDecryption = useCallback(async (
    contract: ethers.Contract,
    planId: number
  ) => {
    try {
      setStatus('requesting');
      setProgress(0);
      setError(null);
      setResult(null);

      console.log('🎮 Starting salary decryption for plan:', planId);

      // ===== Step 1: 提交链上解密请求 =====
      setProgress(10);
      console.log('📝 Step 1: Submitting decryption request...');
      
      const tx = await contract.requestSalaryDecryption(planId);
      console.log('📝 Transaction sent:', tx.hash);

      setProgress(20);
      const receipt = await tx.wait();
      console.log('✅ Transaction confirmed');

      // ===== Step 2: 从事件中获取 requestId =====
      setProgress(30);
      console.log('🔑 Step 2: Extracting requestId from event...');

      const event = receipt.logs?.find((log: any) => {
        try {
          const parsed = contract.interface.parseLog(log);
          return parsed?.name === 'SalaryDecryptionRequested';
        } catch {
          return false;
        }
      });

      if (!event) {
        throw new Error('SalaryDecryptionRequested event not found');
      }

      const parsedEvent = contract.interface.parseLog(event);
      const requestId = parsedEvent?.args[0];
      
      if (!requestId) {
        throw new Error('Failed to extract requestId from event');
      }

      console.log('🔑 Decryption request ID:', requestId.toString());

      // ===== Step 3: 轮询 Gateway（关键步骤）=====
      setStatus('polling');
      console.log('⏳ Step 3: Polling Gateway...');

      await relayerClient.pollDecryption(
        BigInt(requestId.toString()),
        PAYROLL_FHE_ADDRESS,
        {
          onProgress: (pollProgress: PollProgress) => {
            const percentage = 30 + (pollProgress.percentage * 0.5);
            setProgress(Math.round(percentage));
          }
        }
      );

      console.log('✅ Gateway decryption completed');

      // ===== Step 4: 等待链上回调完成 =====
      setStatus('waiting');
      setProgress(85);
      console.log('⏳ Step 4: Waiting for on-chain callback...');

      await waitForCallbackCompletion(contract, planId, (waitProgress: number) => {
        const percentage = 85 + (waitProgress * 0.15);
        setProgress(Math.round(percentage));
      });

      // ===== Step 5: 获取最终结果 =====
      setProgress(95);
      console.log('💰 Step 5: Getting final result...');

      const decryptedSalary = await contract.getMyDecryptedSalary(planId);
      const salaryInWei = BigInt(decryptedSalary.toString());

      const decryptionResult = {
        planId,
        decryptedSalary: ethers.formatEther(salaryInWei),
        requestId: BigInt(requestId.toString())
      };

      setProgress(100);
      setStatus('success');
      setResult(decryptionResult);

      console.log('🎉 Decryption process completed!', decryptionResult);

      return decryptionResult;

    } catch (err: any) {
      console.error('❌ Decryption failed:', err);
      setStatus('failed');
      setError(err.message || 'Decryption failed');
      throw err;
    }
  }, []);

  /**
   * 等待链上回调完成
   */
  const waitForCallbackCompletion = async (
    contract: ethers.Contract,
    planId: number,
    onProgress: (progress: number) => void
  ) => {
    const MAX_WAIT = 120; // 2分钟
    const INTERVAL = 2000; // 2秒

    for (let i = 0; i < MAX_WAIT; i++) {
      onProgress(i / MAX_WAIT);

      try {
        const planInfo = await contract.getPlanInfo(planId);
        // status: 0 = ACTIVE, 1 = PENDING_DECRYPT, 2 = COMPLETED, etc.
        // 解密完成后应该回到 ACTIVE (0) 或变成其他状态
        
        const decryptedSalary = await contract.getMyDecryptedSalary(planId);
        if (decryptedSalary > 0) {
          console.log('✅ Callback completed on-chain');
          return;
        }
      } catch (err) {
        // 继续等待
      }

      await new Promise(resolve => setTimeout(resolve, INTERVAL));
    }

    throw new Error('Waiting for callback timeout - please check contract state or retry');
  };

  /**
   * 重试解密请求
   */
  const retryDecryption = useCallback(async (
    contract: ethers.Contract,
    planId: number
  ) => {
    try {
      setStatus('requesting');
      setError(null);

      const tx = await contract.retrySalaryDecryption(planId);
      await tx.wait();

      // 重新开始解密流程
      return await requestSalaryDecryption(contract, planId);
    } catch (err: any) {
      setStatus('failed');
      setError(err.message || 'Retry failed');
      throw err;
    }
  }, [requestSalaryDecryption]);

  return {
    requestSalaryDecryption,
    retryDecryption,
    status,
    progress,
    error,
    result
  };
}

