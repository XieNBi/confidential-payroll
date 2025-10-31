// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "fhevm/lib/TFHE.sol";
import "fhevm/gateway/GatewayCaller.sol";

/**
 * @title PayrollFHE
 * @notice 完全加密的薪酬系统（使用 Zama FHEVM）
 * @dev 薪资金额以密文存储，使用完全同态加密技术
 * 
 * 🔐 使用 Zama FHEVM 技术：
 * - euint64: 加密的 64 位无符号整数
 * - TFHE库: 完全同态加密操作
 * - Gateway: 链下解密服务
 * - 链上数据完全加密存储
 */
contract PayrollFHE is GatewayCaller {
    
    // ========== 状态枚举 ==========
    
    enum PlanStatus {
        ACTIVE,           // 进行中
        PENDING_DECRYPT,  // 等待解密
        COMPLETED,        // 已完成
        CANCELLED,        // 已取消
        EXPIRED           // 已过期
    }
    
    // ========== 解密请求结构 ==========
    
    struct DecryptionRequest {
        uint256 planId;
        address requester;
        uint256 timestamp;
        uint8 retryCount;
        bool processed;
    }
    
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
        PlanStatus status;          // 计划状态
    }
    
    uint256 public planCounter;
    mapping(uint256 => PayrollPlan) public plans;
    
    // ========== 请求追踪系统 ==========
    mapping(uint256 => DecryptionRequest) public decryptionRequests;
    mapping(uint256 => uint256) public planToRequestId;  // 计划ID => 请求ID
    mapping(uint256 => uint256) public requestIdToPlan;  // 请求ID => 计划ID
    mapping(uint256 => address) public requestToEmployee; // 请求ID => 员工地址
    
    // ========== 配置常量 ==========
    uint256 public constant CALLBACK_GAS_LIMIT = 500000;
    uint256 public constant REQUEST_TIMEOUT = 30 minutes;
    uint8 public constant MAX_RETRIES = 3;
    
    // ========== 事件 ==========
    
    event PayrollCreated(
        uint256 indexed planId,
        address indexed employer,
        string title,
        uint256 employeeCount,
        uint256 totalAmount,
        uint256 timestamp
    );
    
    event SalaryDecryptionRequested(
        uint256 indexed requestId,
        uint256 indexed planId,
        address indexed employee,
        uint256 timestamp
    );
    
    event SalaryDecryptionCompleted(
        uint256 indexed requestId,
        uint256 indexed planId,
        address indexed employee,
        uint256 decryptedSalary,
        uint256 timestamp
    );
    
    event SalaryDecryptionFailed(
        uint256 indexed requestId,
        uint256 indexed planId,
        string reason
    );
    
    event SalaryDecryptionRetrying(
        uint256 indexed requestId,
        uint8 retryCount
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
        plan.status = PlanStatus.ACTIVE;
        
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
     * @notice 请求解密薪资（标准 Gateway 流程）
     * @param _planId 薪酬计划 ID
     * @return requestId Gateway 请求 ID
     */
    function requestSalaryDecryption(uint256 _planId) 
        external 
        returns (uint256 requestId) 
    {
        PayrollPlan storage plan = plans[_planId];
        
        // 1. 验证计划状态
        require(plan.status == PlanStatus.ACTIVE, "Plan not active");
        require(!plan.hasClaimed[msg.sender], "Already claimed");
        
        // 2. 验证是否在员工列表中
        bool isEmployee = false;
        for (uint256 i = 0; i < plan.employees.length; i++) {
            if (plan.employees[i] == msg.sender) {
                isEmployee = true;
                break;
            }
        }
        require(isEmployee, "Not in payroll");
        
        // 3. 获取加密薪资
        euint64 encryptedSalary = plan.encryptedSalaries[msg.sender];
        
        // 4. 授权 Gateway 访问
        TFHE.allow(encryptedSalary, Gateway.GATEWAY_CONTRACT_ADDRESS);
        
        // 5. 转换为 uint256 数组（Gateway 需要）
        uint256[] memory cts = new uint256[](1);
        cts[0] = Gateway.toUint256(encryptedSalary);
        
        // 6. 请求 Gateway 解密
        requestId = Gateway.requestDecryption(
            cts,
            this._handleSalaryDecryptionCallback.selector,
            CALLBACK_GAS_LIMIT,
            block.timestamp + REQUEST_TIMEOUT,
            false  // 不是单用户解密
        );
        
        // 7. 记录请求映射
        decryptionRequests[requestId] = DecryptionRequest({
            planId: _planId,
            requester: msg.sender,
            timestamp: block.timestamp,
            retryCount: 0,
            processed: false
        });
        
        planToRequestId[_planId] = requestId;
        requestIdToPlan[requestId] = _planId;
        requestToEmployee[requestId] = msg.sender;
        
        // 8. 更新状态
        plan.status = PlanStatus.PENDING_DECRYPT;
        
        emit SalaryDecryptionRequested(requestId, _planId, msg.sender, block.timestamp);
    }
    
    /**
     * @notice Gateway 回调函数（解密完成后调用）
     * @param requestId Gateway 请求 ID
     * @param decryptedSalary 解密后的薪资金额
     */
    function _handleSalaryDecryptionCallback(
        uint256 requestId,
        uint64 decryptedSalary
    ) public onlyGateway {
        DecryptionRequest storage request = decryptionRequests[requestId];
        
        // 完整验证（防止重放攻击）
        require(request.timestamp > 0, "Invalid request ID");
        require(!request.processed, "Request already processed");
        require(
            block.timestamp <= request.timestamp + REQUEST_TIMEOUT,
            "Request expired"
        );
        
        uint256 planId = request.planId;
        PayrollPlan storage plan = plans[planId];
        address employee = requestToEmployee[requestId];
        
        require(plan.status == PlanStatus.PENDING_DECRYPT, "Invalid plan state");
        require(!plan.hasClaimed[employee], "Already claimed");
        
        // 更新解密结果
        plan.decryptedSalaries[employee] = decryptedSalary;
        plan.status = PlanStatus.ACTIVE;  // 恢复为活跃状态
        
        // 标记已处理
        request.processed = true;
        
        emit SalaryDecryptionCompleted(
            requestId,
            planId,
            employee,
            decryptedSalary,
            block.timestamp
        );
    }
    
    /**
     * @notice 重试解密请求
     * @param _planId 薪酬计划 ID
     * @return newRequestId 新的请求 ID
     */
    function retrySalaryDecryption(uint256 _planId) 
        external 
        returns (uint256 newRequestId) 
    {
        uint256 oldRequestId = planToRequestId[_planId];
        DecryptionRequest storage request = decryptionRequests[oldRequestId];
        PayrollPlan storage plan = plans[_planId];
        
        require(plan.status == PlanStatus.PENDING_DECRYPT, "Not retriable");
        require(!request.processed, "Already processed");
        require(request.retryCount < MAX_RETRIES, "Max retries exceeded");
        require(
            block.timestamp > request.timestamp + 5 minutes,
            "Too soon to retry"
        );
        
        request.retryCount++;
        emit SalaryDecryptionRetrying(oldRequestId, request.retryCount);
        
        // 重新提交请求
        address employee = requestToEmployee[oldRequestId];
        require(employee == msg.sender, "Only requester can retry");
        
        // 调用原始请求函数（重置状态）
        newRequestId = this.requestSalaryDecryption(_planId);
        return newRequestId;
    }
    
    /**
     * @notice 员工领取薪资（需要先完成解密）
     * @param _planId 薪酬计划 ID
     */
    function claimSalary(uint256 _planId) external {
        PayrollPlan storage plan = plans[_planId];
        
        require(
            plan.status == PlanStatus.ACTIVE || plan.status == PlanStatus.PENDING_DECRYPT,
            "Plan not active"
        );
        require(!plan.hasClaimed[msg.sender], "Already claimed");
        require(plan.decryptedSalaries[msg.sender] > 0, "Salary not decrypted yet");
        
        uint256 salary = plan.decryptedSalaries[msg.sender];
        plan.hasClaimed[msg.sender] = true;
        
        require(address(this).balance >= salary, "Insufficient contract balance");
        
        payable(msg.sender).transfer(salary);
        
        emit SalaryClaimed(_planId, msg.sender, salary, block.timestamp);
        
        // 检查是否所有人都已领取
        bool allClaimed = true;
        for (uint256 i = 0; i < plan.employees.length; i++) {
            if (!plan.hasClaimed[plan.employees[i]]) {
                allClaimed = false;
                break;
            }
        }
        
        if (allClaimed) {
            plan.status = PlanStatus.COMPLETED;
        }
    }
    
    /**
     * @notice 取消薪酬计划（仅创建者，未领取的退款）
     * @param _planId 薪酬计划 ID
     */
    function cancelPayroll(uint256 _planId) external {
        PayrollPlan storage plan = plans[_planId];
        
        require(msg.sender == plan.employer, "Not employer");
        require(
            plan.status == PlanStatus.ACTIVE || plan.status == PlanStatus.PENDING_DECRYPT,
            "Plan not active"
        );
        
        plan.status = PlanStatus.CANCELLED;
        
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
        uint8 status  // 返回枚举值
    ) {
        PayrollPlan storage plan = plans[_planId];
        return (
            plan.id,
            plan.employer,
            plan.title,
            plan.employees.length,
            plan.totalAmount,
            plan.createdAt,
            uint8(plan.status)
        );
    }
    
    /**
     * @notice 获取解密请求信息
     */
    function getDecryptionRequest(uint256 _requestId) 
        external 
        view 
        returns (
            uint256 planId,
            address requester,
            uint256 timestamp,
            uint8 retryCount,
            bool processed
        ) 
    {
        DecryptionRequest storage request = decryptionRequests[_requestId];
        return (
            request.planId,
            request.requester,
            request.timestamp,
            request.retryCount,
            request.processed
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

