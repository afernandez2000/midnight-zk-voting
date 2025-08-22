# Midnight ZK Voting DApp

A privacy-preserving voting decentralized application built with Midnight's zero-knowledge technology. This DApp enables completely anonymous voting while maintaining verifiable integrity and preventing double voting.

## 🌙 Features

- **Complete Privacy**: Zero-knowledge proofs ensure vote choices remain anonymous
- **Real-Time Double Vote Detection**: Live checking of vote eligibility with visual feedback
- **Interactive Demo System**: Comprehensive demonstrations of ZK voting concepts
- **Beautiful Modern UI**: Glassmorphism design with smooth animations
- **Verification Dashboard**: Detailed view of participation verification mechanisms
- **Mock Wallet Integration**: Full wallet simulation for development and demonstration
- **Nullifier Registry**: Public view of participation proofs without revealing identities

## 🏗️ Architecture

### Zero-Knowledge Circuit (`circuits/anonymous_voting.compact`)
- Implements anonymous voting logic using Midnight's Compact language
- Verifies voter eligibility through Merkle tree membership
- Generates cryptographic proofs without revealing voter identity
- Prevents double voting using nullifiers

### Smart Contract (`contracts/VotingContract.js`)
- Manages proposal creation and voting lifecycle
- Verifies zero-knowledge proofs on-chain
- Tracks nullifiers to prevent double voting
- Aggregates votes while preserving privacy

### User Interface (`ui/`)
- React-based voting interface
- Real-time proposal viewing and creation
- Privacy-preserving vote casting
- Results visualization with anonymity preserved

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Modern web browser (Chrome, Firefox, Safari, Edge)

### Quick Start

1. **Clone the repository:**
   ```bash
   git clone https://github.com/afernandez2000/midnight-zk-voting.git
   cd midnight-zk
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the application:**
   ```bash
   npm start
   ```

4. **Open your browser:**
   - Navigate to `http://localhost:3000`
   - Click "Connect Wallet" to use the demo wallet
   - Explore the privacy-preserving voting system!

### 🚀 Try These Features Right Away
- **Vote on Proposals**: Test the real-time double vote detection
- **Visit `/verification`**: See participation verification in action  
- **Visit `/double-vote-demo`**: Run interactive prevention demonstrations
- **Use Test Controls**: Switch between voter scenarios to see different outcomes

### Available Scripts

- `npm start` - Start the development server (recommended)
- `npm run build` - Build UI for production
- `npm test` - Run tests
- `npm run lint` - Check code quality

## 🔒 Privacy Features

### How Zero-Knowledge Voting Works

1. **Voter Registration**: Eligible voters are added to a Merkle tree registry
2. **Vote Casting**: Users generate ZK proofs proving:
   - They are registered voters (Merkle tree membership)
   - They haven't voted before (unique nullifier)
   - Their vote is valid (yes/no choice)
3. **Privacy Preservation**: The proof reveals no information about:
   - Voter identity
   - Vote choice
   - Any linking between voters and votes
4. **Result Aggregation**: Votes are tallied using cryptographic aggregation

### Double Vote Prevention

The system uses **cryptographic nullifiers** to prevent double voting:

```
nullifier = hash(voterSecret + proposalId + salt)
```

**How it works:**
- Each voter's secret + proposal ID generates a unique nullifier
- Same voter voting twice = same nullifier = rejected
- Different voters = different nullifiers = allowed
- Cross-proposal voting = different nullifiers = allowed

**Security Properties:**
- **Deterministic**: Same inputs always produce same nullifier
- **Unlinkable**: Cannot trace nullifier back to voter identity
- **Verifiable**: Anyone can verify no nullifier appears twice
- **Efficient**: O(1) lookup to check for duplicates

### Security Guarantees

- **Anonymity**: Impossible to link votes to voters
- **Integrity**: All votes are cryptographically verified
- **No Double Voting**: Nullifier system prevents repeat voting
- **Verifiability**: Anyone can verify the election results
- **Sybil Resistance**: Only pre-registered voters can participate

## 📁 Project Structure

```
midnight-zk/
├── circuits/                    # ZK circuits in Compact
│   └── anonymous_voting.compact
├── contracts/                   # Smart contracts
│   └── VotingContract.js
├── ui/                         # React frontend application
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   ├── pages/             # Application pages
│   │   │   ├── Home.tsx       # Proposal listing
│   │   │   ├── VotePage.tsx   # Voting interface with real-time detection
│   │   │   ├── VerificationPage.tsx  # Participation verification
│   │   │   └── DoubleVoteDemo.tsx   # Interactive prevention demo
│   │   ├── contexts/          # React contexts
│   │   ├── services/          # Business logic
│   │   │   └── nullifierService.ts  # Double vote prevention
│   │   └── lib/              # Mock implementations
│   └── public/
├── src/                        # Shared utilities
│   ├── zkProofGenerator.ts
│   ├── doubleVotePrevention.ts
│   └── voterRegistry.ts
└── lib/                       # Core libraries
    └── midnight-mock.ts
```

## 🎮 Usage

### 🗳️ Basic Voting Flow
1. **Connect Wallet**: Click "Connect Wallet" to use the demo wallet
2. **Browse Proposals**: View active and completed proposals on the home page
3. **Vote Privately**: Click "Vote Privately" on any active proposal
4. **Real-Time Check**: See immediate feedback on your vote eligibility
5. **Cast Vote**: Select Yes/No and submit your anonymous vote
6. **View Results**: Check completed proposals for privacy-preserving results

### 🔍 Exploring Privacy Features

#### Participation Verification (`/verification`)
- View eligible voter statistics
- See participation rates without revealing identities
- Examine public nullifier registry
- Run interactive verification demos

#### Double Vote Prevention (`/double-vote-demo`)
- Test manual vote attempts with different voters
- Run automated scenarios showing prevention in action
- See real-time nullifier checking
- Understand cryptographic protection mechanisms

#### Real-Time Vote Status
- Visit any voting page to see live eligibility checking
- Use "🧪 Test Controls" to switch between voter scenarios
- See immediate feedback: ✅ Can vote vs 🚫 Already voted
- Understand nullifier-based prevention

## 🧪 Technical Implementation

### Zero-Knowledge Proof Generation

The system generates proofs for:
- Voter eligibility (Merkle tree membership)
- Vote validity (binary choice: 0 or 1)
- Non-reusability (unique nullifier per vote)

```typescript
const proof = await generateVoteProof({
  proposalId: "proposal_1",
  choice: 1, // 0 for No, 1 for Yes
  voterSecret: "user_secret_key",
  nullifier: "unique_nullifier"
});
```

### Privacy-Preserving Vote Aggregation

Votes are aggregated without revealing individual choices:
1. Each vote generates a commitment
2. Commitments are collected on-chain
3. Final tallies are computed using ZK aggregation
4. Results published without compromising privacy

## 🎯 Key Interactive Features

### 🔴 Real-Time Double Vote Detection
- **Live Status Checking**: Instant feedback on vote eligibility when visiting voting pages
- **Visual Indicators**: Green ✅ for eligible, Red 🚫 for already voted
- **Nullifier Display**: Shows cryptographic proof of vote status
- **Test Different Scenarios**: Switch between voter identities to see prevention in action

### 🎮 Interactive Demonstrations
- **Automated Demo Sequences**: Watch step-by-step double vote prevention
- **Manual Testing**: Try to vote multiple times and see system response
- **Educational Explanations**: Learn how nullifiers work through hands-on experience
- **Comprehensive Analytics**: View participation stats and nullifier registries

### 🎨 Modern User Experience
- **Glassmorphism Design**: Beautiful glass cards with backdrop blur effects
- **Smooth Animations**: Engaging transitions and hover effects
- **Responsive Layout**: Works perfectly on desktop and mobile
- **Accessibility**: Clear visual feedback and intuitive navigation

### 📊 Transparency Features
- **Public Nullifier Registry**: See all participation proofs without revealing identities
- **Participation Verification**: Understand how voter eligibility is verified
- **Real-Time Updates**: Watch vote counts and prevention mechanisms in action
- **Educational Content**: Learn ZK concepts through interactive examples

## 🔧 Development

### UI Development (Primary)
```bash
npm start          # Start development server
npm run build      # Build for production
npm run lint       # Check code quality
```

### Working Directory
The main development happens in the `ui/` directory:
```bash
cd ui
npm start          # Start UI development server
npm run build      # Build UI for production
npm test           # Run UI tests
```

### Demo Features
- **Mock Wallet**: No real wallet installation needed
- **Test Controls**: Switch between voter scenarios in voting pages
- **Interactive Demos**: Comprehensive ZK voting demonstrations
- **Real-Time Feedback**: Live vote eligibility checking

## 📜 License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Implement your changes
4. Add tests for new functionality
5. Submit a pull request

## ⚠️ Important Notes

### Demo Application
- **Mock Implementation**: Uses simulated Midnight SDK for demonstration
- **No Real Blockchain**: All transactions are mocked for educational purposes
- **Instant Setup**: No wallet installation or network setup required
- **Educational Focus**: Designed to showcase ZK voting concepts

### Real-World Usage
- **Security Audits Required**: Thorough auditing needed before production use
- **Real Wallet Integration**: Would require actual Midnight wallet installation
- **Network Deployment**: Would need deployment to Midnight blockchain
- **Cryptographic Verification**: All mock operations would use real cryptography

### What's Real vs Mock
| Component | Current Status | Real Implementation |
|-----------|---------------|-------------------|
| UI/UX | ✅ Fully functional | Same interface |
| ZK Concepts | ✅ Accurately demonstrated | Same logic, real crypto |
| Nullifier System | ✅ Working demo | Same mechanism, on-chain |
| Double Vote Prevention | ✅ Live demonstration | Same prevention, blockchain verified |
| Wallet Connection | 🎭 Mock simulation | Real browser extension |
| Transactions | 🎭 Simulated | Real blockchain txs |

## 🔗 Resources

- [Midnight Documentation](https://docs.midnight.network/)
- [Compact Language Guide](https://docs.midnight.network/compact/)
- [Zero-Knowledge Proofs](https://docs.midnight.network/zk-proofs/)

---

Built with 🌙 **Midnight's Privacy Technology**