/**
 * Gateway 状态徽章组件
 */

import { useContract } from '../contexts/ContractContext';
import './GatewayStatusBadge.css';

export default function GatewayStatusBadge() {
  const { gatewayStatus, refreshGatewayStatus } = useContract();

  const getStatusInfo = () => {
    switch (gatewayStatus) {
      case 'up':
        return {
          text: 'Gateway Online',
          icon: '✅',
          className: 'status-up'
        };
      case 'down':
        return {
          text: 'Gateway Offline',
          icon: '❌',
          className: 'status-down'
        };
      case 'checking':
        return {
          text: 'Checking...',
          icon: '🔍',
          className: 'status-checking'
        };
    }
  };

  const status = getStatusInfo();

  return (
    <div className={`gateway-status-badge ${status.className}`}>
      <span className="status-icon">{status.icon}</span>
      <span className="status-text">{status.text}</span>
      <button 
        className="refresh-btn" 
        onClick={refreshGatewayStatus}
        disabled={gatewayStatus === 'checking'}
        title="Refresh Gateway Status"
      >
        🔄
      </button>
    </div>
  );
}

