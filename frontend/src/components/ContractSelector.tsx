/**
 * 合约类型选择器组件
 */

import { useContract } from '../contexts/ContractContext';
import './ContractSelector.css';

export default function ContractSelector() {
  const { contractType, isAutoMode, setContractType, setAutoMode } = useContract();

  return (
    <div className="contract-selector">
      <div className="mode-toggle">
        <label className="toggle-label">
          <input
            type="checkbox"
            checked={isAutoMode}
            onChange={(e) => setAutoMode(e.target.checked)}
          />
          <span>Auto Switch</span>
        </label>
      </div>

      {!isAutoMode && (
        <div className="contract-buttons">
          <button
            className={`contract-btn ${contractType === 'simple' ? 'active' : ''}`}
            onClick={() => setContractType('simple')}
          >
            📝 Simple
          </button>
          <button
            className={`contract-btn ${contractType === 'fhe' ? 'active' : ''}`}
            onClick={() => setContractType('fhe')}
          >
            🔐 FHE
          </button>
        </div>
      )}

      {isAutoMode && (
        <div className="auto-mode-info">
          <span className="badge info">Auto Mode</span>
          <span className="current-contract">
            Current: {contractType === 'fhe' ? '🔐 FHE' : '📝 Simple'}
          </span>
        </div>
      )}
    </div>
  );
}

