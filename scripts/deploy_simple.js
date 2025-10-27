const hre = require("hardhat");
const fs = require("fs");

async function main() {
  console.log("📦 部署 PayrollSimple (Fallback 测试合约)...\n");

  const [deployer] = await hre.ethers.getSigners();
  console.log("部署账户:", deployer.address);
  console.log("账户余额:", hre.ethers.formatEther(await hre.ethers.provider.getBalance(deployer.address)), "ETH\n");

  // 部署合约
  const PayrollSimple = await hre.ethers.getContractFactory("PayrollSimple");
  const payroll = await PayrollSimple.deploy();
  await payroll.waitForDeployment();

  const address = await payroll.getAddress();
  console.log("✅ PayrollSimple 部署成功!");
  console.log("📍 合约地址:", address);
  console.log("🔗 Sepolia Etherscan:", `https://sepolia.etherscan.io/address/${address}\n`);

  // 保存部署信息
  const deployment = {
    network: hre.network.name,
    contractName: "PayrollSimple",
    address: address,
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    blockNumber: await hre.ethers.provider.getBlockNumber()
  };

  fs.writeFileSync(
    "deployment_simple.json",
    JSON.stringify(deployment, null, 2)
  );

  console.log("💾 部署信息已保存到 deployment_simple.json");
  console.log("\n📝 请将合约地址更新到前端配置文件：");
  console.log(`   frontend/src/constants/contracts.ts`);
  console.log(`   PAYROLL_SIMPLE_ADDRESS = "${address}"`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

