# ⚡ 快速开始指南

5分钟快速上手机密薪酬系统！

---

## 🎯 最简流程

### 1️⃣ 安装（2分钟）

```bash
# 克隆项目
git clone <your-repo>
cd confidential-payroll

# 安装依赖
npm install
cd frontend && npm install && cd ..
```

### 2️⃣ 配置（1分钟）

```bash
# 创建环境变量
cp .env.example .env

# 编辑 .env，填入您的私钥
PRIVATE_KEY=your_private_key_here
```

### 3️⃣ 部署（2分钟）

```bash
# 编译
npx hardhat compile

# 部署到 Sepolia
npm run deploy:simple
# 记录输出的合约地址！

# 更新前端配置
# 编辑 frontend/src/constants/contracts.ts
# 填入合约地址
```

### 4️⃣ 启动（立即）

```bash
cd frontend
npm run dev
```

访问 `http://localhost:5173` - 完成！🎉

---

## 📖 使用示例

### 企业创建薪酬计划

1. 连接钱包（MetaMask）
2. 切换到"企业端"
3. 填写:
   - 名称: "2025年1月工资"
   - 员工地址: `0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb`
   - 薪资: `0.001`
4. 点击"创建薪酬计划"
5. 在 MetaMask 确认交易
6. 记录计划 ID（例如：0）

### 员工领取薪资

1. 在 MetaMask 切换到员工账户
2. 切换到"员工端"
3. 输入计划 ID: `0`
4. 点击"查询薪资"
5. 看到薪资金额: `0.001 ETH`
6. 点击"领取薪资"
7. 在 MetaMask 确认
8. 完成！💰

---

## 🔧 故障排查

### ❌ 合约地址未配置

**错误:** 交易失败或无法连接

**解决:**
1. 检查 `frontend/src/constants/contracts.ts`
2. 确保填入了正确的合约地址
3. 重启前端服务器

### ❌ 网络错误

**错误:** 提示切换网络

**解决:**
1. 在 MetaMask 中切换到 Sepolia 测试网
2. 刷新页面

### ❌ 余额不足

**错误:** insufficient funds

**解决:**
1. 访问 https://sepoliafaucet.com/
2. 获取测试 ETH
3. 重试交易

---

## 📚 下一步

- 📖 阅读完整 [README.md](README.md)
- 📦 查看 [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)
- 🎥 准备演示视频
- 🏆 提交到 Zama Developer Program

---

**就这么简单！** 🚀

