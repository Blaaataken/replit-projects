import { ethers, network } from "hardhat";
import * as fs from "fs";

interface DeploymentRecord {
  network: string;
  chainId: number;
  address: string;
  treasury: string;
  deployer: string;
  timestamp: number;
  status: "success" | "failed";
  error?: string;
}

const TESTNET_CONFIGS = [
  {
    name: "sepolia",
    chainId: 11155111,
    rpcUrl: "https://sepolia.infura.io/v3/",
    explorer: "https://sepolia.etherscan.io",
    nativeSymbol: "ETH",
  },
  {
    name: "mumbai",
    chainId: 80001,
    rpcUrl: "https://rpc-mumbai.maticvigil.com",
    explorer: "https://mumbai.polygonscan.com",
    nativeSymbol: "MATIC",
  },
  {
    name: "bscTestnet",
    chainId: 97,
    rpcUrl: "https://data-seed-prebsc-1-s1.binance.org:8545",
    explorer: "https://testnet.bscscan.com",
    nativeSymbol: "BNB",
  },
];

async function deployToNetwork(
  networkName: string,
  treasuryWallet: string
): Promise<DeploymentRecord> {
  console.log(`\n${"=".repeat(50)}`);
  console.log(`Deploying to ${networkName}...`);
  console.log(`${"=".repeat(50)}`);

  try {
    const [deployer] = await ethers.getSigners();
    const chainId = network.config.chainId || 0;

    console.log(`Deployer: ${deployer.address}`);
    const balance = await ethers.provider.getBalance(deployer.address);
    console.log(`Balance: ${ethers.formatEther(balance)}`);

    const SWCToken = await ethers.getContractFactory("SWCToken");
    const swcToken = await SWCToken.deploy(treasuryWallet);
    await swcToken.waitForDeployment();

    const address = await swcToken.getAddress();
    console.log(`SWC Token deployed to: ${address}`);

    return {
      network: networkName,
      chainId,
      address,
      treasury: treasuryWallet,
      deployer: deployer.address,
      timestamp: Date.now(),
      status: "success",
    };
  } catch (error: any) {
    console.error(`Deployment to ${networkName} failed:`, error.message);
    return {
      network: networkName,
      chainId: 0,
      address: "",
      treasury: treasuryWallet,
      deployer: "",
      timestamp: Date.now(),
      status: "failed",
      error: error.message,
    };
  }
}

async function main() {
  console.log("=".repeat(60));
  console.log("SHAWNSWORKS (SWC) Multi-Network Testnet Deployment");
  console.log("=".repeat(60));

  const [deployer] = await ethers.getSigners();
  const treasuryWallet = process.env.TREASURY_WALLET || deployer.address;

  console.log(`\nTreasury Wallet: ${treasuryWallet}`);
  console.log(`Deployer: ${deployer.address}`);

  // Deploy to current network
  const result = await deployToNetwork(network.name, treasuryWallet);

  // Save deployment record
  const deploymentsPath = "./deployments.json";
  let deployments: DeploymentRecord[] = [];

  if (fs.existsSync(deploymentsPath)) {
    deployments = JSON.parse(fs.readFileSync(deploymentsPath, "utf-8"));
  }

  deployments.push(result);
  fs.writeFileSync(deploymentsPath, JSON.stringify(deployments, null, 2));

  console.log("\nDeployment record saved to deployments.json");

  // Print summary
  console.log(`\n${"=".repeat(60)}`);
  console.log("DEPLOYMENT SUMMARY");
  console.log(`${"=".repeat(60)}`);
  console.log(`Network: ${result.network}`);
  console.log(`Status: ${result.status}`);
  if (result.status === "success") {
    console.log(`Contract: ${result.address}`);
    
    const config = TESTNET_CONFIGS.find((c) => c.name === result.network);
    if (config) {
      console.log(`Explorer: ${config.explorer}/address/${result.address}`);
    }
  } else {
    console.log(`Error: ${result.error}`);
  }

  return result;
}

main()
  .then(() => {
    console.log("\nScript completed!");
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
