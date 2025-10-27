/**
 * Employer Panel - Create and Manage Payroll Plans
 */

import { useState } from 'react';
import { usePayroll } from '../hooks/usePayroll';
import { useWallet } from '../contexts/WalletContext';
import { useContract } from '../contexts/ContractContext';
import './EmployerPanel.css';

interface Employee {
  address: string;
  salary: string;
}

export default function EmployerPanel() {
  const { address } = useWallet();
  const { contractType } = useContract();
  const { createPayrollSimple, loading } = usePayroll();

  const [title, setTitle] = useState('');
  const [employees, setEmployees] = useState<Employee[]>([
    { address: '', salary: '' }
  ]);
  const [result, setResult] = useState<{type: 'success' | 'error', message: string} | null>(null);

  // Add employee row
  const addEmployee = () => {
    setEmployees([...employees, { address: '', salary: '' }]);
  };

  // Remove employee row
  const removeEmployee = (index: number) => {
    if (employees.length > 1) {
      setEmployees(employees.filter((_, i) => i !== index));
    }
  };

  // Update employee information
  const updateEmployee = (index: number, field: 'address' | 'salary', value: string) => {
    const updated = [...employees];
    updated[index][field] = value;
    setEmployees(updated);
  };

  // Calculate total amount
  const calculateTotal = () => {
    return employees.reduce((sum, emp) => {
      const salary = parseFloat(emp.salary) || 0;
      return sum + salary;
    }, 0);
  };

  // Validate inputs
  const validateInputs = (): string | null => {
    if (!title.trim()) {
      return 'Please enter payroll plan name';
    }

    for (let i = 0; i < employees.length; i++) {
      const emp = employees[i];
      
      if (!emp.address.trim()) {
        return `Row ${i + 1}: Please enter employee address`;
      }
      
      if (!emp.address.match(/^0x[a-fA-F0-9]{40}$/)) {
        return `Row ${i + 1}: Invalid address format`;
      }
      
      if (!emp.salary || parseFloat(emp.salary) <= 0) {
        return `Row ${i + 1}: Please enter valid salary amount`;
      }
    }

    return null;
  };

  // Submit and create
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setResult(null);

    // Validate
    const error = validateInputs();
    if (error) {
      setResult({ type: 'error', message: error });
      return;
    }

    // FHE mode reminder
    if (contractType === 'fhe') {
      setResult({ 
        type: 'error', 
        message: '⚠️ FHE encryption is not fully implemented yet. Please use Simple mode for testing.' 
      });
      return;
    }

    try {
      const addresses = employees.map(e => e.address);
      const salaries = employees.map(e => e.salary);

      const res = await createPayrollSimple(title, addresses, salaries);

      if (res.success) {
        setResult({
          type: 'success',
          message: `✅ Payroll plan created successfully! Plan ID: ${res.planId}\nTx Hash: ${res.txHash}`
        });
        
        // Reset form
        setTitle('');
        setEmployees([{ address: '', salary: '' }]);
      } else {
        setResult({
          type: 'error',
          message: `❌ Creation failed: ${res.error}`
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
    <div className="employer-panel">
      <div className="card">
        <h2>🏢 Create Payroll Plan</h2>
        <p className="subtitle">Batch salary payment with complete confidentiality</p>

        <form onSubmit={handleSubmit} className="payroll-form">
          {/* Plan name */}
          <div className="form-group">
            <label>Payroll Plan Name</label>
            <input
              type="text"
              placeholder="e.g., January 2025 Salary"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={loading}
            />
          </div>

          {/* Employee list */}
          <div className="form-group">
            <label>Employee List</label>
            <div className="employees-list">
              {employees.map((emp, index) => (
                <div key={index} className="employee-row">
                  <div className="employee-number">{index + 1}</div>
                  <input
                    type="text"
                    placeholder="Employee Wallet Address (0x...)"
                    value={emp.address}
                    onChange={(e) => updateEmployee(index, 'address', e.target.value)}
                    disabled={loading}
                    className="address-input"
                  />
                  <input
                    type="number"
                    step="0.001"
                    placeholder="Salary (ETH)"
                    value={emp.salary}
                    onChange={(e) => updateEmployee(index, 'salary', e.target.value)}
                    disabled={loading}
                    className="salary-input"
                  />
                  {employees.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeEmployee(index)}
                      disabled={loading}
                      className="remove-btn"
                      title="Remove"
                    >
                      ❌
                    </button>
                  )}
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={addEmployee}
              disabled={loading}
              className="secondary add-employee-btn"
            >
              ➕ Add Employee
            </button>
          </div>

          {/* Total amount */}
          <div className="total-amount">
            <span className="total-label">Total Amount:</span>
            <span className="total-value">{calculateTotal().toFixed(4)} ETH</span>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading || employees.length === 0}
            className="primary submit-btn"
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                <span>Creating...</span>
              </>
            ) : (
              `💰 Create Payroll Plan (${contractType === 'fhe' ? 'FHE Encrypted' : 'Simple'})`
            )}
          </button>
        </form>

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
            <li>1. Enter payroll plan name (e.g., January 2025 Salary)</li>
            <li>2. Add employee wallet addresses and corresponding salary amounts</li>
            <li>3. System will automatically calculate total and deduct from your wallet</li>
            <li>4. Employees can view and claim their salary on the employee panel</li>
            <li>
              <strong>Current Mode:</strong> {contractType === 'fhe' ? '🔐 FHE Encrypted (Fully Confidential)' : '📝 Simple Mode (Testing)'}
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

