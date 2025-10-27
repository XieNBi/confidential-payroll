// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title PayrollSimple
 * @notice 简化版薪酬系统（Fallback 模式 - 用于测试和 Gateway 离线时）
 * @dev 薪资金额以明文存储，前端通过逻辑隐藏（不是真正的隐私保护）
 */
contract PayrollSimple {
    
    // ========== 状态变量 ==========
    
    struct PayrollPlan {
        uint256 id;
        address employer;           // 创建者（企业）
        string title;               // 薪酬计划名称
        address[] employees;        // 员工地址列表
        mapping(address => uint256) salaries;  // 员工 => 薪资金额
        mapping(address => bool) hasClaimed;   // 员工 => 是否已领取
        uint256 totalAmount;        // 总金额
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
     * @param _salaries 薪资金额列表（明文）
     */
    function createPayroll(
        string memory _title,
        address[] memory _employees,
        uint256[] memory _salaries
    ) external payable {
        require(_employees.length > 0, "No employees");
        require(_employees.length == _salaries.length, "Length mismatch");
        require(bytes(_title).length > 0, "Empty title");
        
        // 计算总金额
        uint256 totalAmount = 0;
        for (uint256 i = 0; i < _salaries.length; i++) {
            require(_salaries[i] > 0, "Salary must be > 0");
            totalAmount += _salaries[i];
        }
        
        require(msg.value >= totalAmount, "Insufficient funds");
        
        uint256 planId = planCounter++;
        PayrollPlan storage plan = plans[planId];
        
        plan.id = planId;
        plan.employer = msg.sender;
        plan.title = _title;
        plan.employees = _employees;
        plan.totalAmount = totalAmount;
        plan.createdAt = block.timestamp;
        plan.isActive = true;
        
        // 存储每个员工的薪资
        for (uint256 i = 0; i < _employees.length; i++) {
            plan.salaries[_employees[i]] = _salaries[i];
        }
        
        // 退还多余的资金
        if (msg.value > totalAmount) {
            payable(msg.sender).transfer(msg.value - totalAmount);
        }
        
        emit PayrollCreated(
            planId,
            msg.sender,
            _title,
            _employees.length,
            totalAmount,
            block.timestamp
        );
    }
    
    /**
     * @notice 员工领取薪资
     * @param _planId 薪酬计划 ID
     */
    function claimSalary(uint256 _planId) external {
        PayrollPlan storage plan = plans[_planId];
        
        require(plan.isActive, "Plan not active");
        require(plan.salaries[msg.sender] > 0, "Not in payroll");
        require(!plan.hasClaimed[msg.sender], "Already claimed");
        
        uint256 salary = plan.salaries[msg.sender];
        plan.hasClaimed[msg.sender] = true;
        
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
            if (!plan.hasClaimed[employee]) {
                unclaimedAmount += plan.salaries[employee];
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
     * @notice 获取我的薪资（明文）
     */
    function getMySalary(uint256 _planId) external view returns (uint256) {
        return plans[_planId].salaries[msg.sender];
    }
    
    /**
     * @notice 检查是否已领取
     */
    function hasClaimed(uint256 _planId, address _employee) external view returns (bool) {
        return plans[_planId].hasClaimed[_employee];
    }
    
    /**
     * @notice 获取特定员工的薪资（仅创建者或本人可查看）
     */
    function getSalary(uint256 _planId, address _employee) external view returns (uint256) {
        PayrollPlan storage plan = plans[_planId];
        require(
            msg.sender == plan.employer || msg.sender == _employee,
            "Unauthorized"
        );
        return plan.salaries[_employee];
    }
}

