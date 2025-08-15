export const mockProtocols = [
  {
    id: 1,
    name: "AaveDAO",
    type: "lending",
    tvl: 12500000000, // $12.5B
    traits: {
      leadership: 85,
      riskManagement: 92,
      communityBuilding: 78,
      economicStrategy: 88
    },
    color: "#ff6b6b",
    description: "Decentralized lending protocol with focus on risk management"
  },
  {
    id: 2,
    name: "Uniswap",
    type: "dex",
    tvl: 8200000000, // $8.2B
    traits: {
      leadership: 90,
      riskManagement: 75,
      communityBuilding: 95,
      economicStrategy: 85
    },
    color: "#4ecdc4",
    description: "Leading decentralized exchange protocol"
  },
  {
    id: 3,
    name: "Compound",
    type: "lending",
    tvl: 6800000000, // $6.8B
    traits: {
      leadership: 80,
      riskManagement: 88,
      communityBuilding: 72,
      economicStrategy: 82
    },
    color: "#ff6b6b",
    description: "Algorithmic money markets protocol"
  },
  {
    id: 4,
    name: "Curve",
    type: "dex",
    tvl: 5900000000, // $5.9B
    traits: {
      leadership: 75,
      riskManagement: 95,
      communityBuilding: 68,
      economicStrategy: 92
    },
    color: "#4ecdc4",
    description: "Stable coin focused DEX with high capital efficiency"
  },
  {
    id: 5,
    name: "MakerDAO",
    type: "lending",
    tvl: 4500000000, // $4.5B
    traits: {
      leadership: 88,
      riskManagement: 90,
      communityBuilding: 85,
      economicStrategy: 95
    },
    color: "#ff6b6b",
    description: "Decentralized autonomous organization governing the Dai stablecoin"
  },
  {
    id: 6,
    name: "Balancer",
    type: "dex",
    tvl: 2100000000, // $2.1B
    traits: {
      leadership: 72,
      riskManagement: 78,
      communityBuilding: 80,
      economicStrategy: 75
    },
    color: "#4ecdc4",
    description: "Automated portfolio manager and trading protocol"
  },
  {
    id: 7,
    name: "dYdX",
    type: "derivatives",
    tvl: 3800000000, // $3.8B
    traits: {
      leadership: 85,
      riskManagement: 85,
      communityBuilding: 70,
      economicStrategy: 88
    },
    color: "#45b7d1",
    description: "Decentralized derivatives trading protocol"
  },
  {
    id: 8,
    name: "Yearn",
    type: "yield",
    tvl: 1800000000, // $1.8B
    traits: {
      leadership: 78,
      riskManagement: 82,
      communityBuilding: 88,
      economicStrategy: 92
    },
    color: "#96ceb4",
    description: "Yield farming aggregator protocol"
  },
  {
    id: 9,
    name: "Synthetix",
    type: "derivatives",
    tvl: 1200000000, // $1.2B
    traits: {
      leadership: 82,
      riskManagement: 80,
      communityBuilding: 85,
      economicStrategy: 78
    },
    color: "#45b7d1",
    description: "Synthetic asset issuance protocol"
  },
  {
    id: 10,
    name: "Nexus Mutual",
    type: "insurance",
    tvl: 800000000, // $800M
    traits: {
      leadership: 75,
      riskManagement: 98,
      communityBuilding: 72,
      economicStrategy: 80
    },
    color: "#feca57",
    description: "Decentralized insurance protocol"
  },
  {
    id: 11,
    name: "Sushi",
    type: "dex",
    tvl: 1500000000, // $1.5B
    traits: {
      leadership: 70,
      riskManagement: 72,
      communityBuilding: 92,
      economicStrategy: 75
    },
    color: "#4ecdc4",
    description: "Community-driven DEX and DeFi platform"
  },
  {
    id: 12,
    name: "Bancor",
    type: "dex",
    tvl: 900000000, // $900M
    traits: {
      leadership: 68,
      riskManagement: 75,
      communityBuilding: 65,
      economicStrategy: 70
    },
    color: "#4ecdc4",
    description: "Automated market maker with single-sided liquidity"
  },
  {
    id: 13,
    name: "Convex",
    type: "yield",
    tvl: 2800000000, // $2.8B
    traits: {
      leadership: 75,
      riskManagement: 78,
      communityBuilding: 80,
      economicStrategy: 88
    },
    color: "#96ceb4",
    description: "Platform for Curve liquidity providers"
  },
  {
    id: 14,
    name: "1inch",
    type: "dex",
    tvl: 700000000, // $700M
    traits: {
      leadership: 80,
      riskManagement: 75,
      communityBuilding: 78,
      economicStrategy: 82
    },
    color: "#4ecdc4",
    description: "DEX aggregator finding best prices across exchanges"
  },
  {
    id: 15,
    name: "Olympus",
    type: "yield",
    tvl: 600000000, // $600M
    traits: {
      leadership: 65,
      riskManagement: 60,
      communityBuilding: 95,
      economicStrategy: 70
    },
    color: "#96ceb4",
    description: "Decentralized reserve currency protocol"
  }
];

export const mockMissions = [
  {
    id: 1,
    title: "Market Crash Survival",
    description: "Navigate your protocol through a 50% market downturn",
    reward: "+2 Risk Management",
    duration: 30, // 30 seconds for demo
    completed: false,
    requirements: {
      minRiskManagement: 20
    }
  },
  {
    id: 2,
    title: "Community Growth",
    description: "Increase your protocol's community by 1000 users",
    reward: "+3 Community Building",
    duration: 45,
    completed: false,
    requirements: {
      minCommunityBuilding: 15
    }
  },
  {
    id: 3,
    title: "TVL Milestone",
    description: "Reach $2M TVL through strategic partnerships",
    reward: "+2 Economic Strategy, +1 Leadership",
    duration: 60,
    completed: false,
    requirements: {
      minEconomicStrategy: 25,
      minLeadership: 20
    }
  },
  {
    id: 4,
    title: "Alliance Formation",
    description: "Form a strategic alliance with another major protocol",
    reward: "+3 Leadership, +1 Community Building",
    duration: 90,
    completed: false,
    requirements: {
      minLeadership: 30,
      minCommunityBuilding: 25
    }
  },
  {
    id: 5,
    title: "Security Audit",
    description: "Successfully pass a comprehensive security audit",
    reward: "+4 Risk Management",
    duration: 120,
    completed: false,
    requirements: {
      minRiskManagement: 35
    }
  }
];
