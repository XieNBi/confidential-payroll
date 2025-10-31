/**
 * FHE Encryption Utility
 * Handles encryption of payroll data using Zama's relayer SDK
 */

import { createEncryptedInput } from '@zama-fhe/relayer-sdk';
import { ethers } from 'ethers';
import { PAYROLL_FHE_ADDRESS } from '../constants/contracts';

export interface EncryptedSalaryResult {
  encryptedInputs: string[];
  inputProofs: string[];
  totalAmount: bigint;
}

/**
 * Creates encrypted salary inputs for FHE payroll creation
 * @param signerAddress The address of the signer (employer)
 * @param salaries Array of salary amounts in ETH (as strings)
 * @returns Encrypted inputs, proofs, and total amount
 */
export async function createEncryptedSalaries(
  signerAddress: string,
  salaries: string[]
): Promise<EncryptedSalaryResult> {
  const encryptedInputs: string[] = [];
  const inputProofs: string[] = [];
  let totalAmount = 0n;

  console.log('🔐 Starting salary encryption...', {
    count: salaries.length,
    signerAddress,
    contractAddress: PAYROLL_FHE_ADDRESS
  });

  // Encrypt each salary
  for (let i = 0; i < salaries.length; i++) {
    const salaryEth = salaries[i];
    const salaryInWei = ethers.parseEther(salaryEth);

    console.log(`📝 Encrypting salary ${i + 1}/${salaries.length}: ${salaryEth} ETH (${salaryInWei} Wei)`);

    try {
      // 1. Create encrypted input context
      const input = createEncryptedInput(
        PAYROLL_FHE_ADDRESS,
        signerAddress
      );

      // 2. Add salary as 64-bit integer
      const salaryBigInt = BigInt(salaryInWei.toString());
      input.add64(salaryBigInt);

      // 3. Encrypt and generate proof
      const { handles, inputProof } = await input.encrypt();

      if (!handles || handles.length === 0) {
        throw new Error(`Encryption failed for salary ${i + 1}: no handles returned`);
      }

      if (!inputProof) {
        throw new Error(`Encryption failed for salary ${i + 1}: no proof returned`);
      }

      // 4. Store encrypted handle and proof
      encryptedInputs.push(handles[0]);
      inputProofs.push(inputProof);

      // 5. Accumulate total amount
      totalAmount += salaryInWei;

      console.log(`✅ Salary ${i + 1} encrypted successfully`);
    } catch (error: any) {
      console.error(`❌ Failed to encrypt salary ${i + 1}:`, error);
      throw new Error(`Encryption failed for salary ${i + 1}: ${error.message}`);
    }
  }

  console.log('✅ All salaries encrypted successfully', {
    count: encryptedInputs.length,
    totalAmount: ethers.formatEther(totalAmount)
  });

  return {
    encryptedInputs,
    inputProofs,
    totalAmount
  };
}

