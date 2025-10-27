# 📦 部署指南

本指南将帮助您将机密薪酬系统部署到 Sepolia 测试网。

---

## 📋 前置准备

### 1. 获取 Sepolia ETH

您需要一些 Sepolia 测试网 ETH 来部署合约和支付 Gas 费用。

**推荐水龙头:**
- https://sepoliafaucet.com/
- https://sepolia-faucet.pk910.de/
- https://www.alchemy.com/faucets/ethereum-sepolia

**所需 ETH:**
- 部署 Simple 合约: ~0.005 ETH
- 部署 FHE 合约: ~0.01 ETH（更复杂）
- 测试交易: ~0.01 ETH
- **总计建议:** 0.03 - 0.05 ETH

### 2. 准备私钥

1. 在 MetaMask 中创建一个新账户（专门用于部署）
2. 导出私钥:
   - 点击账户右侧的三个点
   - 选择"账户详情"
   - 点击"导出私钥"
   - 输入密码确认

⚠️ **安全警告:**
- 不要使用包含真实资金的账户
- 不要提交私钥到 Git
- 部署后可以废弃该账户

### 3. 配置环境变量

```bash
# 复制环境变量模板
cp .env.example .env

# 编辑 .env 文件
nano .env  # 或使用你喜欢的编辑器
```

填入您的私钥:
```env
PRIVATE_KEY=your_private_key_here_without_0x_prefix
SEPOLIA_RPC_URL=https://eth-sepolia.public.blastapi.io
```

---

## 🔨 部署合约

### 步骤 1: 安装依赖

```bash
# 在项目根目录
npm install
```

### 步骤 2: 编译合约

```bash
npx hardhat compile
```

**预期输出:**
```
Compiled 2 Solidity files successfully
```

如果遇到编译错误，请检查:
- fhevm 库是否正确安装
- Solidity 版本是否匹配

### 步骤 3: 部署 Simple 合约

```bash
npm run deploy:simple
```

**预期输出:**
```
📦 部署 PayrollSimple (Fallback 测试合约)...

部署账户: 0x...
账户余额: 0.05 ETH

✅ PayrollSimple 部署成功!
📍 合约地址: 0x1234567890123456789012345678901234567890
🔗 Sepolia Etherscan: https://sepolia.etherscan.io/address/0x...

💾 部署信息已保存到 deployment_simple.json
```

**重要:** 复制合约地址，稍后需要用到！

### 步骤 4: 部署 FHE 合约

```bash
npm run deploy:fhe
```

**注意:** FHE 合约编译和部署需要更长时间（可能 1-2 分钟）

**预期输出:**
```
📦 部署 PayrollFHE (FHE 加密合约)...

部署账户: 0x...
账户余额: 0.045 ETH

正在部署合约（FHE 合约编译和部署需要较长时间）...
✅ PayrollFHE 部署成功!
📍 合约地址: 0xabcdefabcdefabcdefabcdefabcdefabcdefabcd
🔗 Sepolia Etherscan: https://sepolia.etherscan.io/address/0x...

💾 部署信息已保存到 deployment_fhe.json
```

### 步骤 5: 验证部署

在 Sepolia Etherscan 上查看您的合约:
1. 访问输出中的 Etherscan 链接
2. 确认合约创建交易成功
3. 查看合约代码（可能需要等待索引）

---

## 🎨 配置前端

### 步骤 1: 更新合约地址

编辑 `frontend/src/constants/contracts.ts`:

```typescript
// 部署后填写
export const PAYROLL_SIMPLE_ADDRESS = "0x1234..."; // 填入 Simple 合约地址
export const PAYROLL_FHE_ADDRESS = "0xabcd...";    // 填入 FHE 合约地址
```

### 步骤 2: 安装前端依赖

```bash
cd frontend
npm install
```

### 步骤 3: 启动开发服务器

```bash
npm run dev
```

访问 `http://localhost:5173`

---

## ✅ 测试部署

### 1. 连接钱包

1. 打开应用
2. 点击"连接钱包"
3. 在 MetaMask 中确认连接
4. 确保已切换到 Sepolia 网络

### 2. 测试 Simple 模式

1. 确保 Gateway 状态显示"离线"（或手动切换到 Simple 模式）
2. 切换到"企业端"
3. 创建一个测试薪酬计划:
   - 名称: "测试计划"
   - 员工地址: 使用您的另一个测试账户地址
   - 薪资: 0.001 ETH
4. 点击"创建薪酬计划"
5. 在 MetaMask 中确认交易
6. 等待交易确认（约 15 秒）
7. 记录显示的计划 ID

### 3. 测试员工领取

1. 在 MetaMask 中切换到员工账户
2. 切换到"员工端"
3. 输入刚才的计划 ID
4. 点击"查询薪资"
5. 确认显示正确的薪资金额
6. 点击"领取薪资"
7. 在 MetaMask 中确认交易
8. 等待交易确认
9. 检查账户余额是否增加

### 4. 测试 FHE 模式（可选）

⚠️ **注意:** FHE 模式需要 Gateway 在线，目前前端的加密功能尚未完全实现。

如果您想测试 FHE 模式:
1. 确保 Gateway 状态显示"在线"
2. 切换到 FHE 模式
3. 创建薪酬计划时需要额外的加密步骤
4. 员工查询时需要解密操作

---

## 🔍 验证合约

### 在 Etherscan 上验证

验证合约可以让其他人查看您的源代码。

#### 使用 Hardhat 验证

```bash
# 安装验证插件
npm install --save-dev @nomicfoundation/hardhat-verify

# 配置 API Key（在 hardhat.config.js 中添加）
etherscan: {
  apiKey: "YOUR_ETHERSCAN_API_KEY"
}

# 验证 Simple 合约
npx hardhat verify --network sepolia SIMPLE_CONTRACT_ADDRESS

# 验证 FHE 合约
npx hardhat verify --network sepolia FHE_CONTRACT_ADDRESS
```

#### 手动验证

1. 访问 Sepolia Etherscan
2. 找到您的合约
3. 点击"Contract"标签
4. 点击"Verify and Publish"
5. 选择编译器版本: 0.8.20 (Simple) 或 0.8.24 (FHE)
6. 上传合约源代码
7. 提交验证

---

## 🚀 生产部署（可选）

如果您想部署到主网或其他网络:

### 1. 更新网络配置

编辑 `hardhat.config.js`:

```javascript
networks: {
  mainnet: {
    url: process.env.MAINNET_RPC_URL,
    accounts: [process.env.PRIVATE_KEY],
    chainId: 1
  }
}
```

### 2. 更新前端配置

编辑 `frontend/src/constants/contracts.ts`:

```typescript
export const NETWORK_CONFIG = {
  chainId: 1,  // Mainnet
  name: "Ethereum Mainnet",
  // ...
};
```

### 3. 部署到主网

```bash
npm run deploy:simple -- --network mainnet
npm run deploy:fhe -- --network mainnet
```

⚠️ **主网部署注意事项:**
- 需要真实的 ETH
- Gas 费用更高
- 无法撤销
- 确保充分测试后再部署

---

## 📊 部署成本估算

### Sepolia 测试网

| 项目 | Gas 估算 | ETH (假设 20 Gwei) |
|------|----------|-------------------|
| Simple 合约部署 | ~500,000 | ~0.01 ETH |
| FHE 合约部署 | ~1,000,000 | ~0.02 ETH |
| 创建薪酬计划 | ~200,000 | ~0.004 ETH |
| 领取薪资 | ~50,000 | ~0.001 ETH |

### 以太坊主网（参考）

Gas 价格波动较大，建议在 [ETH Gas Station](https://ethgasstation.info/) 查看实时价格。

---

## 🐛 常见部署问题

### 问题 1: 私钥格式错误

```
Error: invalid private key
```

**解决方案:**
- 确保私钥是 64 位十六进制字符串
- 不要包含 `0x` 前缀
- 检查是否有多余的空格或换行

### 问题 2: 余额不足

```
Error: insufficient funds for gas
```

**解决方案:**
- 访问水龙头获取更多测试 ETH
- 检查账户地址是否正确

### 问题 3: 网络连接失败

```
Error: could not detect network
```

**解决方案:**
- 检查网络连接
- 尝试使用不同的 RPC URL
- 检查防火墙设置

### 问题 4: 合约编译失败

```
Error: Compiler version not found
```

**解决方案:**
```bash
# 清理并重新编译
npx hardhat clean
npx hardhat compile
```

---

## 📝 部署检查清单

部署前检查:
- [ ] 已获取足够的 Sepolia ETH
- [ ] 已配置 .env 文件
- [ ] 已安装所有依赖
- [ ] 已测试编译通过

部署后检查:
- [ ] 合约部署成功
- [ ] 已在 Etherscan 上验证
- [ ] 已更新前端合约地址
- [ ] 已测试创建薪酬计划
- [ ] 已测试员工领取
- [ ] 已测试 Gateway Fallback

---

## 🎉 完成！

恭喜！您已成功部署机密薪酬系统。

**下一步:**
- 测试完整的用户流程
- 准备演示视频
- 提交到 Zama Developer Program

**需要帮助?**
- 查看 [README.md](README.md)
- 查看 [故障排查](#-常见部署问题)
- 提交 Issue

---

**祝您部署顺利！** 🚀

