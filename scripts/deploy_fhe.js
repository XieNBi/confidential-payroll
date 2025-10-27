const hre = require("hardhat");
const fs = require("fs");

async function main() {
  console.log("📦 部署 PayrollFHE (FHE 加密合约)...\n");

  const [deployer] = await hre.ethers.getSigners();
  console.log("部署账户:", deployer.address);
  console.log("账户余额:", hre.ethers.formatEther(await hre.ethers.provider.getBalance(deployer.address)), "ETH\n");

  // 部署合约
  console.log("正在部署合约（FHE 合约编译和部署需要较长时间）...");
  const PayrollFHE = await hre.ethers.getContractFactory("PayrollFHE");
  const payroll = await PayrollFHE.deploy();
  await payroll.waitForDeployment();

  const address = await payroll.getAddress();
  console.log("✅ PayrollFHE 部署成功!");
  console.log("📍 合约地址:", address);
  console.log("🔗 Sepolia Etherscan:", `https://sepolia.etherscan.io/address/${address}\n`);

  // 保存部署信息
  const deployment = {
    network: hre.network.name,
    contractName: "PayrollFHE",
    address: address,
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    blockNumber: await hre.ethers.provider.getBlockNumber()
  };

  fs.writeFileSync(
    "deployment_fhe.json",
    JSON.stringify(deployment, null, 2)
  );

  console.log("💾 部署信息已保存到 deployment_fhe.json");
  console.log("\n📝 请将合约地址更新到前端配置文件：");
  console.log(`   frontend/src/constants/contracts.ts`);
  console.log(`   PAYROLL_FHE_ADDRESS = "${address}"`);
  
  console.log("\n⚠️ 重要提示:");
  console.log("   1. FHE 合约需要 Gateway 服务支持");
  console.log("   2. 确保前端 Gateway URL 配置正确");
  console.log("   3. 前端会自动检测 Gateway 健康状况并 Fallback");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

