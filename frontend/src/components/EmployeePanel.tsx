/**
 * Employee Panel - View and Claim Salary
 */

import { useState, useEffect } from 'react';
import { usePayroll, PayrollPlan } from '../hooks/usePayroll';
import { useWallet } from '../contexts/WalletContext';
import { useContract } from '../contexts/ContractContext';
import './EmployeePanel.css';

export default function EmployeePanel() {
  const { address } = useWallet();
  const { contractType } = useContract();
  const { getPlanCount, getPlanInfo, getMySalary, claimSalary, loading } = usePayroll();

  const [planId, setPlanId] = useState<string>('');
  const [currentPlan, setCurrentPlan] = useState<PayrollPlan | null>(null);
  const [mySalary, setMySalary] = useState<string | null>(null);
  const [hasClaimed, setHasClaimed] = useState<boolean>(false);
  const [result, setResult] = useState<{type: 'success' | 'error', message: string} | null>(null);
  const [totalPlans, setTotalPlans] = useState<number>(0);

  // Load total payroll plans count
  useEffect(() => {
    const loadTotalPlans = async () => {
      const count = await getPlanCount();
      setTotalPlans(count);
    };
    loadTotalPlans();
  }, [getPlanCount]);

  // Query salary
  const handleQuery = async () => {
    setResult(null);
    setCurrentPlan(null);
    setMySalary(null);

    if (!planId || isNaN(Number(planId))) {
      setResult({ type: 'error', message: 'Please enter a valid plan ID' });
      return;
    }

    try {
      // Get plan information
      const plan = await getPlanInfo(Number(planId));
      
      if (!plan) {
        setResult({ type: 'error', message: '❌ Payroll plan not found' });
        return;
      }

      setCurrentPlan(plan);

      // Get my salary
      const salary = await getMySalary(Number(planId));
      
      if (salary === null || salary === '0.0') {
        setResult({ 
          type: 'error', 
          message: '❌ You are not in this payroll plan, or salary not yet decrypted (FHE mode requires decryption)' 
        });
        setMySalary(null);
        return;
      }

      setMySalary(salary);
      
      // Check if already claimed
      // TODO: Implement hasClaimed check
      setHasClaimed(false);

      setResult({
        type: 'success',
        message: '✅ Query successful!'
      });

    } catch (err: any) {
      console.error('Query failed:', err);
      setResult({
        type: 'error',
        message: `❌ Query failed: ${err.message}`
      });
    }
  };

  // Claim salary
  const handleClaim = async () => {
    if (!planId || !mySalary) {
      setResult({ type: 'error', message: 'Please query your salary first' });
      return;
    }

    if (hasClaimed) {
      setResult({ type: 'error', message: 'You have already claimed' });
      return;
    }

    setResult(null);

    try {
      const res = await claimSalary(Number(planId));

      if (res.success) {
        setResult({
          type: 'success',
          message: `✅ Claim successful!\nSalary: ${mySalary} ETH\nTx Hash: ${res.txHash}`
        });
        setHasClaimed(true);
      } else {
        setResult({
          type: 'error',
          message: `❌ Claim failed: ${res.error}`
        });
      }
    } catch (err: any) {
      setResult({
        type: 'error',
        message: `❌ Error occurred: ${err.message}`
      });
    }
  };

  return (
    <div className="employee-panel">
      <div className="card">
        <h2>👤 View and Claim Salary</h2>
        <p className="subtitle">
          Enter payroll plan ID to view your salary (Total {totalPlans} plans available)
        </p>

        {/* Query form */}
        <div className="query-section">
          <div className="query-form">
            <input
              type="number"
              placeholder="Enter Payroll Plan ID (e.g., 0, 1, 2...)"
              value={planId}
              onChange={(e) => setPlanId(e.target.value)}
              disabled={loading}
              className="plan-id-input"
            />
            <button
              onClick={handleQuery}
              disabled={loading || !planId}
              className="primary query-btn"
            >
              {loading ? 'Querying...' : '🔍 Query Salary'}
            </button>
          </div>
        </div>

        {/* Plan information */}
        {currentPlan && (
          <div className="plan-info-card">
            <h3>📋 Payroll Plan Information</h3>
            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">Plan Name:</span>
                <span className="info-value">{currentPlan.title}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Creator:</span>
                <span className="info-value mono">{currentPlan.employer}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Employees:</span>
                <span className="info-value">{currentPlan.employeeCount} people</span>
              </div>
              <div className="info-item">
                <span className="info-label">Total Amount:</span>
                <span className="info-value">{currentPlan.totalAmount} ETH</span>
              </div>
              <div className="info-item">
                <span className="info-label">Status:</span>
                <span className={`badge ${currentPlan.isActive ? 'success' : 'warning'}`}>
                  {currentPlan.isActive ? '✅ Active' : '⏸️ Cancelled'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* My salary */}
        {mySalary && (
          <div className="salary-card">
            <div className="salary-header">
              <h3>💰 Your Salary</h3>
              {contractType === 'fhe' && (
                <span className="badge info">🔐 Decrypted</span>
              )}
            </div>
            <div className="salary-amount">
              {mySalary} ETH
            </div>
            <div className="salary-actions">
              {!hasClaimed ? (
                <button
                  onClick={handleClaim}
                  disabled={loading}
                  className="primary claim-btn"
                >
                  {loading ? (
                    <>
                      <span className="spinner"></span>
                      <span>Claiming...</span>
                    </>
                  ) : (
                    '💰 Claim Salary'
                  )}
                </button>
              ) : (
                <div className="claimed-badge">
                  <span className="badge success">✅ Claimed</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Result message */}
        {result && (
          <div className={`result-message ${result.type}`}>
            <pre>{result.message}</pre>
          </div>
        )}

        {/* Help information */}
        <div className="help-box">
          <h4>💡 Instructions</h4>
          <ul>
            <li>1. Ask your employer for the payroll plan ID</li>
            <li>2. Enter the ID and click the query button</li>
            <li>3. System will display your salary amount ({contractType === 'fhe' ? 'decrypted real amount' : 'plaintext amount'})</li>
            <li>4. Click "Claim Salary" button, funds will be transferred directly to your wallet</li>
            <li>5. Each salary can only be claimed once</li>
          </ul>
          
          {contractType === 'fhe' && (
            <div className="fhe-notice">
              <strong>🔐 FHE Encryption Mode:</strong>
              <p>In FHE mode, your salary amount is fully encrypted on-chain. Only you can decrypt and view it. Even your employer cannot see your specific salary amount.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

