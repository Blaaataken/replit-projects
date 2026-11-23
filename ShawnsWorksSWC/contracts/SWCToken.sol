// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title SWCToken
 * @dev SHAWNSWORKS (SWC) Multi-Chain Utility Token
 * 
 * Features:
 * - ERC-20 standard compliance
 * - Burnable tokens for deflationary mechanics
 * - Permit for gasless approvals (EIP-2612)
 * - Pausable for emergency situations
 * - Cross-chain bridge support
 * - Staking rewards distribution
 * - Gas optimization fee collection
 */
contract SWCToken is ERC20, ERC20Burnable, ERC20Permit, Ownable, Pausable {
    // Token configuration
    uint256 public constant MAX_SUPPLY = 1_000_000_000 * 10**18; // 1 billion tokens
    uint256 public constant INITIAL_SUPPLY = 100_000_000 * 10**18; // 100 million tokens
    
    // Fee configuration (in basis points, 100 = 1%)
    uint256 public bridgeFee = 10; // 0.1%
    uint256 public stakingRewardRate = 500; // 5% annual
    uint256 public gasOptimizationFee = 5; // 0.05%
    
    // Role addresses
    address public bridgeContract;
    address public stakingContract;
    address public treasuryWallet;
    
    // Staking state
    mapping(address => uint256) public stakedBalance;
    mapping(address => uint256) public stakingStartTime;
    mapping(address => uint256) public pendingRewards;
    
    // Cross-chain bridge state
    mapping(bytes32 => bool) public processedBridgeTransactions;
    mapping(uint256 => bool) public supportedChains;
    
    // Events
    event TokensBridged(address indexed from, address indexed to, uint256 amount, uint256 targetChainId, bytes32 txHash);
    event TokensStaked(address indexed user, uint256 amount);
    event TokensUnstaked(address indexed user, uint256 amount, uint256 rewards);
    event RewardsClaimed(address indexed user, uint256 amount);
    event BridgeContractUpdated(address indexed oldBridge, address indexed newBridge);
    event StakingContractUpdated(address indexed oldStaking, address indexed newStaking);
    event ChainSupported(uint256 indexed chainId, bool supported);
    event FeesUpdated(uint256 bridgeFee, uint256 stakingRate, uint256 gasOptFee);
    
    constructor(
        address _treasuryWallet
    ) ERC20("SHAWNSWORKS", "SWC") ERC20Permit("SHAWNSWORKS") Ownable(msg.sender) {
        require(_treasuryWallet != address(0), "Invalid treasury address");
        treasuryWallet = _treasuryWallet;
        
        // Mint initial supply to deployer
        _mint(msg.sender, INITIAL_SUPPLY);
        
        // Initialize supported chains (Ethereum mainnet, BSC, Polygon)
        supportedChains[1] = true;     // Ethereum Mainnet
        supportedChains[56] = true;    // BSC Mainnet
        supportedChains[137] = true;   // Polygon Mainnet
        supportedChains[11155111] = true; // Sepolia Testnet
        supportedChains[80001] = true;    // Mumbai Testnet
        supportedChains[97] = true;       // BSC Testnet
    }
    
    // ===== TRANSFER FUNCTIONS =====
    
    function transfer(address to, uint256 amount) public override whenNotPaused returns (bool) {
        return super.transfer(to, amount);
    }
    
    function transferFrom(address from, address to, uint256 amount) public override whenNotPaused returns (bool) {
        return super.transferFrom(from, to, amount);
    }
    
    // ===== STAKING FUNCTIONS =====
    
    /**
     * @dev Stake tokens to earn rewards
     * @param amount Amount of tokens to stake
     */
    function stake(uint256 amount) external whenNotPaused {
        require(amount > 0, "Cannot stake 0");
        require(balanceOf(msg.sender) >= amount, "Insufficient balance");
        
        // Calculate and store pending rewards before updating stake
        if (stakedBalance[msg.sender] > 0) {
            pendingRewards[msg.sender] += calculateRewards(msg.sender);
        }
        
        _transfer(msg.sender, address(this), amount);
        stakedBalance[msg.sender] += amount;
        stakingStartTime[msg.sender] = block.timestamp;
        
        emit TokensStaked(msg.sender, amount);
    }
    
    /**
     * @dev Unstake tokens and claim rewards
     * @param amount Amount of tokens to unstake
     */
    function unstake(uint256 amount) external whenNotPaused {
        require(amount > 0, "Cannot unstake 0");
        require(stakedBalance[msg.sender] >= amount, "Insufficient staked balance");
        
        uint256 rewards = calculateRewards(msg.sender) + pendingRewards[msg.sender];
        pendingRewards[msg.sender] = 0;
        
        stakedBalance[msg.sender] -= amount;
        stakingStartTime[msg.sender] = block.timestamp;
        
        // Transfer staked amount back
        _transfer(address(this), msg.sender, amount);
        
        // Mint rewards (up to max supply)
        if (rewards > 0 && totalSupply() + rewards <= MAX_SUPPLY) {
            _mint(msg.sender, rewards);
        }
        
        emit TokensUnstaked(msg.sender, amount, rewards);
    }
    
    /**
     * @dev Claim staking rewards without unstaking
     */
    function claimRewards() external whenNotPaused {
        uint256 rewards = calculateRewards(msg.sender) + pendingRewards[msg.sender];
        require(rewards > 0, "No rewards to claim");
        
        pendingRewards[msg.sender] = 0;
        stakingStartTime[msg.sender] = block.timestamp;
        
        // Mint rewards (up to max supply)
        require(totalSupply() + rewards <= MAX_SUPPLY, "Max supply reached");
        _mint(msg.sender, rewards);
        
        emit RewardsClaimed(msg.sender, rewards);
    }
    
    /**
     * @dev Calculate pending staking rewards for a user
     */
    function calculateRewards(address user) public view returns (uint256) {
        if (stakedBalance[user] == 0) return 0;
        
        uint256 stakingDuration = block.timestamp - stakingStartTime[user];
        uint256 annualReward = (stakedBalance[user] * stakingRewardRate) / 10000;
        
        return (annualReward * stakingDuration) / 365 days;
    }
    
    /**
     * @dev Get total rewards (pending + claimable) for a user
     */
    function getTotalRewards(address user) external view returns (uint256) {
        return calculateRewards(user) + pendingRewards[user];
    }
    
    // ===== BRIDGE FUNCTIONS =====
    
    /**
     * @dev Lock tokens for cross-chain bridge transfer
     * @param amount Amount to bridge
     * @param targetChainId Destination chain ID
     * @param recipient Recipient address on target chain
     */
    function bridgeTo(
        uint256 amount,
        uint256 targetChainId,
        address recipient
    ) external whenNotPaused returns (bytes32) {
        require(amount > 0, "Cannot bridge 0");
        require(supportedChains[targetChainId], "Chain not supported");
        require(recipient != address(0), "Invalid recipient");
        require(balanceOf(msg.sender) >= amount, "Insufficient balance");
        
        // Calculate and deduct bridge fee
        uint256 fee = (amount * bridgeFee) / 10000;
        uint256 netAmount = amount - fee;
        
        // Transfer fee to treasury
        if (fee > 0) {
            _transfer(msg.sender, treasuryWallet, fee);
        }
        
        // Lock tokens in contract
        _transfer(msg.sender, address(this), netAmount);
        
        // Generate unique transaction hash
        bytes32 txHash = keccak256(abi.encodePacked(
            msg.sender,
            recipient,
            netAmount,
            targetChainId,
            block.timestamp,
            block.number
        ));
        
        emit TokensBridged(msg.sender, recipient, netAmount, targetChainId, txHash);
        
        return txHash;
    }
    
    /**
     * @dev Release bridged tokens (called by bridge contract)
     * @param recipient Address to receive tokens
     * @param amount Amount to release
     * @param sourceTxHash Original transaction hash from source chain
     */
    function bridgeRelease(
        address recipient,
        uint256 amount,
        bytes32 sourceTxHash
    ) external onlyBridge {
        require(!processedBridgeTransactions[sourceTxHash], "Transaction already processed");
        require(recipient != address(0), "Invalid recipient");
        require(amount > 0, "Amount must be > 0");
        
        processedBridgeTransactions[sourceTxHash] = true;
        
        // Release from contract's locked balance or mint if insufficient
        if (balanceOf(address(this)) >= amount) {
            _transfer(address(this), recipient, amount);
        } else {
            require(totalSupply() + amount <= MAX_SUPPLY, "Max supply exceeded");
            _mint(recipient, amount);
        }
    }
    
    // ===== GAS OPTIMIZATION FUNCTIONS =====
    
    /**
     * @dev Calculate gas optimization fee for a transaction
     */
    function calculateGasOptimizationFee(uint256 amount) external view returns (uint256) {
        return (amount * gasOptimizationFee) / 10000;
    }
    
    /**
     * @dev Execute optimized transfer with gas fee collection
     */
    function optimizedTransfer(
        address to,
        uint256 amount
    ) external whenNotPaused returns (bool) {
        uint256 fee = (amount * gasOptimizationFee) / 10000;
        uint256 netAmount = amount - fee;
        
        if (fee > 0) {
            _transfer(msg.sender, treasuryWallet, fee);
        }
        _transfer(msg.sender, to, netAmount);
        
        return true;
    }
    
    // ===== ADMIN FUNCTIONS =====
    
    function pause() external onlyOwner {
        _pause();
    }
    
    function unpause() external onlyOwner {
        _unpause();
    }
    
    function setBridgeContract(address _bridge) external onlyOwner {
        address oldBridge = bridgeContract;
        bridgeContract = _bridge;
        emit BridgeContractUpdated(oldBridge, _bridge);
    }
    
    function setStakingContract(address _staking) external onlyOwner {
        address oldStaking = stakingContract;
        stakingContract = _staking;
        emit StakingContractUpdated(oldStaking, _staking);
    }
    
    function setSupportedChain(uint256 chainId, bool supported) external onlyOwner {
        supportedChains[chainId] = supported;
        emit ChainSupported(chainId, supported);
    }
    
    function updateFees(
        uint256 _bridgeFee,
        uint256 _stakingRewardRate,
        uint256 _gasOptimizationFee
    ) external onlyOwner {
        require(_bridgeFee <= 100, "Bridge fee too high"); // Max 1%
        require(_stakingRewardRate <= 2000, "Staking rate too high"); // Max 20%
        require(_gasOptimizationFee <= 50, "Gas opt fee too high"); // Max 0.5%
        
        bridgeFee = _bridgeFee;
        stakingRewardRate = _stakingRewardRate;
        gasOptimizationFee = _gasOptimizationFee;
        
        emit FeesUpdated(_bridgeFee, _stakingRewardRate, _gasOptimizationFee);
    }
    
    function setTreasury(address _treasury) external onlyOwner {
        require(_treasury != address(0), "Invalid treasury");
        treasuryWallet = _treasury;
    }
    
    /**
     * @dev Mint additional tokens (up to max supply)
     */
    function mint(address to, uint256 amount) external onlyOwner {
        require(totalSupply() + amount <= MAX_SUPPLY, "Exceeds max supply");
        _mint(to, amount);
    }
    
    // ===== MODIFIERS =====
    
    modifier onlyBridge() {
        require(msg.sender == bridgeContract, "Only bridge contract");
        _;
    }
    
    // ===== VIEW FUNCTIONS =====
    
    function getStakingInfo(address user) external view returns (
        uint256 staked,
        uint256 rewards,
        uint256 startTime,
        uint256 apy
    ) {
        return (
            stakedBalance[user],
            calculateRewards(user) + pendingRewards[user],
            stakingStartTime[user],
            stakingRewardRate
        );
    }
    
    function getTokenInfo() external view returns (
        string memory name_,
        string memory symbol_,
        uint8 decimals_,
        uint256 totalSupply_,
        uint256 maxSupply_
    ) {
        return (
            name(),
            symbol(),
            decimals(),
            totalSupply(),
            MAX_SUPPLY
        );
    }
}
