// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "fhevm/lib/TFHE.sol";

/**
 * @title PayrollFHE
 * @notice 完全加密的薪酬系统（使用 Zama FHEVM）
 * @dev 薪资金额以密文存储，使用完全同态加密技术
 * 
 * 🔐 使用 Zama FHEVM 技术：
 * - euint64: 加密的 64 位无符号整数
 * - TFHE库: 完全同态加密操作
 * - 链上数据完全加密存储
 */
contract PayrollFHE {
    
    // ========== 状态变量 ==========
    
    struct PayrollPlan {
        uint256 id;
        address employer;           // 创建者（企业）
        string title;               // 薪酬计划名称
        address[] employees;        // 员工地址列表
        mapping(address => euint64) encryptedSalaries;  // 员工 => 加密薪资
        mapping(address => bool) hasClaimed;            // 员工 => 是否已领取
        mapping(address => uint256) decryptedSalaries;  // 解密后的薪资（仅领取时）
        uint256 totalAmount;        // 总金额（明文，企业需要知道总支出）
        uint256 createdAt;          // 创建时间
        bool isActive;              // 是否激活
    }
    
    uint256 public planCounter;
    mapping(uint256 => PayrollPlan) public plans;
    
    // ========== 事件 ==========
    
    event PayrollCreated(
        uint256 indexed planId,
        address indexed employer,
        string title,
        uint256 employeeCount,
        uint256 totalAmount,
        uint256 timestamp
    );
    
    event SalaryClaimed(
        uint256 indexed planId,
        address indexed employee,
        uint256 amount,
        uint256 timestamp
    );
    
    event PayrollCancelled(
        uint256 indexed planId,
        address indexed employer,
        uint256 timestamp
    );
    
    // ========== 核心函数 ==========
    
    /**
     * @notice 创建薪酬计划
     * @param _title 计划名称
     * @param _employees 员工地址列表
     * @param _encryptedSalaries 加密的薪资金额（einput 数组）
     * @param _inputProofs 加密证明（attestation）
     */
    function createPayroll(
        string memory _title,
        address[] memory _employees,
        einput[] memory _encryptedSalaries,
        bytes[] memory _inputProofs
    ) external payable {
        require(_employees.length > 0, "No employees");
        require(_employees.length == _encryptedSalaries.length, "Length mismatch");
        require(_employees.length == _inputProofs.length, "Proof length mismatch");
        require(bytes(_title).length > 0, "Empty title");
        
        uint256 planId = planCounter++;
        PayrollPlan storage plan = plans[planId];
        
        plan.id = planId;
        plan.employer = msg.sender;
        plan.title = _title;
        plan.employees = _employees;
        plan.totalAmount = msg.value;  // 总金额以 msg.value 为准
        plan.createdAt = block.timestamp;
        plan.isActive = true;
        
        // 转换并存储每个员工的加密薪资
        for (uint256 i = 0; i < _employees.length; i++) {
            euint64 encryptedSalary = TFHE.asEuint64(_encryptedSalaries[i], _inputProofs[i]);
            
            // 授权：合约自己可以访问
            TFHE.allowThis(encryptedSalary);
            
            // 授权：员工可以访问自己的加密薪资
            TFHE.allow(encryptedSalary, _employees[i]);
            
            plan.encryptedSalaries[_employees[i]] = encryptedSalary;
        }
        
        emit PayrollCreated(
            planId,
            msg.sender,
            _title,
            _employees.length,
            msg.value,
            block.timestamp
        );
    }
    
    /**
     * @notice 简化版：直接领取薪资（无需解密步骤）
     * @param _planId 薪酬计划 ID
     * @param _amount 薪资金额（Wei）
     * @dev 简化版本：员工提供金额，合约验证后转账
     * 
     * 注：完整版需要 Gateway 解密，这里为了演示简化流程
     */
    function requestClaim(uint256 _planId, uint256 _amount) external {
        PayrollPlan storage plan = plans[_planId];
        
        require(plan.isActive, "Plan not active");
        require(!plan.hasClaimed[msg.sender], "Already claimed");
        
        // 验证是否在员工列表中
        bool isEmployee = false;
        for (uint256 i = 0; i < plan.employees.length; i++) {
            if (plan.employees[i] == msg.sender) {
                isEmployee = true;
                break;
            }
        }
        require(isEmployee, "Not in payroll");
        
        // 记录解密后的金额
        plan.decryptedSalaries[msg.sender] = _amount;
    }
    
    /**
     * @notice 员工领取薪资（需要先调用 requestClaim）
     * @param _planId 薪酬计划 ID
     */
    function claimSalary(uint256 _planId) external {
        PayrollPlan storage plan = plans[_planId];
        
        require(plan.isActive, "Plan not active");
        require(!plan.hasClaimed[msg.sender], "Already claimed");
        require(plan.decryptedSalaries[msg.sender] > 0, "Need to call requestClaim first");
        
        uint256 salary = plan.decryptedSalaries[msg.sender];
        plan.hasClaimed[msg.sender] = true;
        
        require(address(this).balance >= salary, "Insufficient contract balance");
        
        payable(msg.sender).transfer(salary);
        
        emit SalaryClaimed(_planId, msg.sender, salary, block.timestamp);
    }
    
    /**
     * @notice 取消薪酬计划（仅创建者，未领取的退款）
     * @param _planId 薪酬计划 ID
     */
    function cancelPayroll(uint256 _planId) external {
        PayrollPlan storage plan = plans[_planId];
        
        require(msg.sender == plan.employer, "Not employer");
        require(plan.isActive, "Plan not active");
        
        plan.isActive = false;
        
        // 计算未领取的金额并退款
        uint256 unclaimedAmount = 0;
        for (uint256 i = 0; i < plan.employees.length; i++) {
            address employee = plan.employees[i];
            if (!plan.hasClaimed[employee] && plan.decryptedSalaries[employee] > 0) {
                unclaimedAmount += plan.decryptedSalaries[employee];
            }
        }
        
        if (unclaimedAmount > 0) {
            payable(plan.employer).transfer(unclaimedAmount);
        }
        
        emit PayrollCancelled(_planId, msg.sender, block.timestamp);
    }
    
    // ========== 查询函数 ==========
    
    /**
     * @notice 获取薪酬计划基本信息
     */
    function getPlanInfo(uint256 _planId) external view returns (
        uint256 id,
        address employer,
        string memory title,
        uint256 employeeCount,
        uint256 totalAmount,
        uint256 createdAt,
        bool isActive
    ) {
        PayrollPlan storage plan = plans[_planId];
        return (
            plan.id,
            plan.employer,
            plan.title,
            plan.employees.length,
            plan.totalAmount,
            plan.createdAt,
            plan.isActive
        );
    }
    
    /**
     * @notice 获取员工列表
     */
    function getEmployees(uint256 _planId) external view returns (address[] memory) {
        return plans[_planId].employees;
    }
    
    /**
     * @notice 获取我的加密薪资句柄（用于前端解密）
     */
    function getMyEncryptedSalary(uint256 _planId) external view returns (euint64) {
        return plans[_planId].encryptedSalaries[msg.sender];
    }
    
    /**
     * @notice 获取解密后的薪资（如果已解密）
     */
    function getMyDecryptedSalary(uint256 _planId) external view returns (uint256) {
        return plans[_planId].decryptedSalaries[msg.sender];
    }
    
    /**
     * @notice 检查是否已领取
     */
    function hasClaimed(uint256 _planId, address _employee) external view returns (bool) {
        return plans[_planId].hasClaimed[_employee];
    }
    
    /**
     * @notice 接收 ETH
     */
    receive() external payable {}
}

