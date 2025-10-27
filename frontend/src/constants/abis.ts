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
  "function createPayroll(string memory _title, address[] memory _employees, bytes[] memory _encryptedSalaries, bytes[] memory _inputProofs) external payable",
  "function requestSalaryDecryption(uint256 _planId) external",
  "function claimSalary(uint256 _planId) external",
  "function cancelPayroll(uint256 _planId) external",
  "function getPlanInfo(uint256 _planId) external view returns (uint256 id, address employer, string memory title, uint256 employeeCount, uint256 totalAmount, uint256 createdAt, bool isActive)",
  "function getEmployees(uint256 _planId) external view returns (address[] memory)",
  "function getMyEncryptedSalary(uint256 _planId) external view returns (bytes memory)",
  "function getMyDecryptedSalary(uint256 _planId) external view returns (uint256)",
  "function hasClaimed(uint256 _planId, address _employee) external view returns (bool)",
  "function planCounter() external view returns (uint256)",
  "event PayrollCreated(uint256 indexed planId, address indexed employer, string title, uint256 employeeCount, uint256 totalAmount, uint256 timestamp)",
  "event SalaryDecryptionRequested(uint256 indexed planId, address indexed employee, uint256 requestId, uint256 timestamp)",
  "event SalaryClaimed(uint256 indexed planId, address indexed employee, uint256 amount, uint256 timestamp)",
  "event PayrollCancelled(uint256 indexed planId, address indexed employer, uint256 timestamp)"
];

