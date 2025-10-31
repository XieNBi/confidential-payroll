/**
 * 智能合约 ABI
 */

export const PAYROLL_SIMPLE_ABI = [
  "function createPayroll(string memory _title, address[] memory _employees, uint256[] memory _salaries) external payable",
  "function claimSalary(uint256 _planId) external",
  "function cancelPayroll(uint256 _planId) external",
  "function getPlanInfo(uint256 _planId) external view returns (uint256 id, address employer, string memory title, uint256 employeeCount, uint256 totalAmount, uint256 createdAt, bool isActive)",
  "function getEmployees(uint256 _planId) external view returns (address[] memory)",
  "function getMySalary(uint256 _planId) external view returns (uint256)",
  "function hasClaimed(uint256 _planId, address _employee) external view returns (bool)",
  "function getSalary(uint256 _planId, address _employee) external view returns (uint256)",
  "function planCounter() external view returns (uint256)",
  "event PayrollCreated(uint256 indexed planId, address indexed employer, string title, uint256 employeeCount, uint256 totalAmount, uint256 timestamp)",
  "event SalaryClaimed(uint256 indexed planId, address indexed employee, uint256 amount, uint256 timestamp)",
  "event PayrollCancelled(uint256 indexed planId, address indexed employer, uint256 timestamp)"
];

export const PAYROLL_FHE_ABI = [
  // Core functions
  "function createPayroll(string memory _title, address[] memory _employees, einput[] memory _encryptedSalaries, bytes[] memory _inputProofs) external payable",
  "function requestSalaryDecryption(uint256 _planId) external returns (uint256 requestId)",
  "function retrySalaryDecryption(uint256 _planId) external returns (uint256 newRequestId)",
  "function claimSalary(uint256 _planId) external",
  "function cancelPayroll(uint256 _planId) external",
  
  // View functions
  "function getPlanInfo(uint256 _planId) external view returns (uint256 id, address employer, string memory title, uint256 employeeCount, uint256 totalAmount, uint256 createdAt, uint8 status)",
  "function getEmployees(uint256 _planId) external view returns (address[] memory)",
  "function getMyEncryptedSalary(uint256 _planId) external view returns (euint64)",
  "function getMyDecryptedSalary(uint256 _planId) external view returns (uint256)",
  "function hasClaimed(uint256 _planId, address _employee) external view returns (bool)",
  "function getDecryptionRequest(uint256 _requestId) external view returns (uint256 planId, address requester, uint256 timestamp, uint8 retryCount, bool processed)",
  "function planCounter() external view returns (uint256)",
  "function planToRequestId(uint256) external view returns (uint256)",
  "function requestIdToPlan(uint256) external view returns (uint256)",
  
  // Constants
  "function CALLBACK_GAS_LIMIT() external view returns (uint256)",
  "function REQUEST_TIMEOUT() external view returns (uint256)",
  "function MAX_RETRIES() external view returns (uint8)",
  
  // Events
  "event PayrollCreated(uint256 indexed planId, address indexed employer, string title, uint256 employeeCount, uint256 totalAmount, uint256 timestamp)",
  "event SalaryDecryptionRequested(uint256 indexed requestId, uint256 indexed planId, address indexed employee, uint256 timestamp)",
  "event SalaryDecryptionCompleted(uint256 indexed requestId, uint256 indexed planId, address indexed employee, uint256 decryptedSalary, uint256 timestamp)",
  "event SalaryDecryptionFailed(uint256 indexed requestId, uint256 indexed planId, string reason)",
  "event SalaryDecryptionRetrying(uint256 indexed requestId, uint8 retryCount)",
  "event SalaryClaimed(uint256 indexed planId, address indexed employee, uint256 amount, uint256 timestamp)",
  "event PayrollCancelled(uint256 indexed planId, address indexed employer, uint256 timestamp)"
];

