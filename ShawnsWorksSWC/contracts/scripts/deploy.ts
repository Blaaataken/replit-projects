import { ethers, network } from "hardhat";

interface DeploymentInfo {
  network: string;
  chainId: number;
  address: string;
  treasury: string;
  deployer: string;
  timestamp: number;
  txHash: string;
}

async function main() {
  console.log("=".repeat(60));
  console.log("SHAWNSWORKS (SWC) Token Deployment");
  console.log("=".repeat(60));
  
  const [deployer] = await ethers.getSigners();
  const chainId = network.config.chainId || 1;
  
  console.log(`\nNetwork: ${network.name}`);
  console.log(`Chain ID: ${chainId}`);
  console.log(`Deployer: ${deployer.address}`);
  
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log(`Balance: ${ethers.formatEther(balance)} ETH\n`);
  
  // Treasury wallet (can be set to a multisig in production)
  const treasuryWallet = process.env.TREASURY_WALLET || deployer.address;
  console.log(`Treasury: ${treasuryWallet}`);
  
  // Deploy SWC Token
  console.log("\nDeploying SWC Token...");
  const SWCToken = await ethers.getContractFactory("SWCToken");
  const swcToken = await SWCToken.deploy(treasuryWallet);
  
  await swcToken.waitForDeployment();
  const tokenAddress = await swcToken.getAddress();
  
  console.log(`\n${"=".repeat(60)}`);
  console.log("DEPLOYMENT SUCCESSFUL!");
  console.log(`${"=".repeat(60)}`);
  console.log(`SWC Token deployed to: ${tokenAddress}`);
  
  // Get token info
  const tokenInfo = await swcToken.getTokenInfo();
  console.log(`\nToken Info:`);
  console.log(`  Name: ${tokenInfo.name_}`);
  console.log(`  Symbol: ${tokenInfo.symbol_}`);
  console.log(`  Decimals: ${tokenInfo.decimals_}`);
  console.log(`  Total Supply: ${ethers.formatEther(tokenInfo.totalSupply_)} SWC`);
  console.log(`  Max Supply: ${ethers.formatEther(tokenInfo.maxSupply_)} SWC`);
  
  // Deployment info for logging
  const deploymentInfo: DeploymentInfo = {
    network: network.name,
    chainId,
    address: tokenAddress,
    treasury: treasuryWallet,
    deployer: deployer.address,
    timestamp: Date.now(),
    txHash: swcToken.deploymentTransaction()?.hash || "",
  };
  
  console.log(`\nDeployment Info:`);
  console.log(JSON.stringify(deploymentInfo, null, 2));
  
  // Verification instructions
  console.log(`\n${"=".repeat(60)}`);
  console.log("VERIFICATION COMMAND:");
  console.log(`${"=".repeat(60)}`);
  console.log(`npx hardhat verify --network ${network.name} ${tokenAddress} "${treasuryWallet}"`);
  
  return deploymentInfo;
}

main()
  .then((info) => {
    console.log("\nDeployment completed successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\nDeployment failed:", error);
    process.exit(1);
  });
