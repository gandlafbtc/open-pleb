# OpenPleb Backend Architecture

## Overview

OpenPleb is a privacy-focused peer-to-peer fiat-to-bitcoin exchange platform. The backend architecture is designed around privacy preservation, cryptographic authentication, and secure escrow management using Cashu ecash.

---

## Core Components

### 1. Authentication System

#### Multi-Layer Authentication
1. **User Registration** - One-time public key registration with Schnorr signatures
2. **OIDC Integration** - OpenID Connect for Cashu mint authentication
3. **Blind Authentication Tokens (BAT)** - Privacy-preserving session tokens from Cashu mint
4. **Session Management** - BAT tokens used directly as session identifiers

#### Authentication Flow
```
User Registration (One-time)
    ↓
User obtains OIDC credentials (Client-side)
    ↓
User authenticates with Cashu Mint (OIDC)
    ↓
Mint issues BAT (Blind Authentication Token)
    ↓
User opens session with BAT
    ↓
Backend verifies BAT with Mint (one-time)
    ↓
Backend creates session in sessions table
    ↓
User uses BAT for all authenticated operations
    ↓
Backend checks sessions table for validity (not expired)
```

### 2. Session Wallet Architecture

#### Design Philosophy
Each user session has its own isolated Cashu wallet to ensure:
- Complete privacy between sessions
- No cross-session data leakage
- Easy session cleanup and expiration
- Simplified escrow management per trade

#### Implementation with Coco Cashu

**Coco Cashu** is used for server-side Cashu wallet management. Each session gets its own SQLite database file for complete isolation.

##### Directory Structure
```
/data/wallets/
  ├── session_<sessionId1>.db
  ├── session_<sessionId2>.db
  ├── session_<sessionId3>.db
  └── ...
```

##### Session Wallet Manager

```typescript
import { CocoCashu } from 'coco-cashu';
import path from 'path';
import fs from 'fs/promises';

interface SessionWalletConfig {
  walletsDir: string;
  mintUrl: string;
}

class SessionWalletManager {
  private walletsDir: string;
  private mintUrl: string;
  private activeWallets: Map<string, CocoCashu>;

  constructor(config: SessionWalletConfig) {
    this.walletsDir = config.walletsDir;
    this.mintUrl = config.mintUrl;
    this.activeWallets = new Map();
  }

  /**
   * Get or create a wallet for a specific session
   */
  async getWalletForSession(sessionId: string): Promise<CocoCashu> {
    // Return cached wallet if already loaded
    if (this.activeWallets.has(sessionId)) {
      return this.activeWallets.get(sessionId)!;
    }

    const dbPath = path.join(this.walletsDir, `session_${sessionId}.db`);
    
    // Initialize wallet with session-specific DB
    const wallet = new CocoCashu({
      mintUrl: this.mintUrl,
      dbPath: dbPath,
      unit: 'sat'
    });

    // Cache the wallet instance
    this.activeWallets.set(sessionId, wallet);
    
    return wallet;
  }

  /**
   * Close and cleanup a session wallet
   */
  async cleanupSession(sessionId: string): Promise<void> {
    // Remove from cache
    const wallet = this.activeWallets.get(sessionId);
    if (wallet) {
      // Close any open connections
      await wallet.close?.();
      this.activeWallets.delete(sessionId);
    }

    // Delete the SQLite file
    const dbPath = path.join(this.walletsDir, `session_${sessionId}.db`);
    try {
      await fs.unlink(dbPath);
    } catch (error) {
      // File might not exist, ignore
    }
  }

  /**
   * Cleanup expired sessions (run periodically)
   */
  async cleanupExpiredSessions(
    isSessionExpired: (sessionId: string) => Promise<boolean>
  ): Promise<void> {
    const files = await fs.readdir(this.walletsDir);
    
    for (const file of files) {
      if (file.startsWith('session_') && file.endsWith('.db')) {
        const sessionId = file.replace('session_', '').replace('.db', '');
        
        if (await isSessionExpired(sessionId)) {
          await this.cleanupSession(sessionId);
        }
      }
    }
  }

  /**
   * Get wallet balance for a session
   */
  async getSessionBalance(sessionId: string): Promise<number> {
    const wallet = await this.getWalletForSession(sessionId);
    return await wallet.getBalance();
  }

  /**
   * Receive ecash into session wallet
   */
  async receiveEcash(sessionId: string, token: string): Promise<void> {
    const wallet = await this.getWalletForSession(sessionId);
    await wallet.receive(token);
  }

  /**
   * Send ecash from session wallet
   */
  async sendEcash(sessionId: string, amount: number): Promise<string> {
    const wallet = await this.getWalletForSession(sessionId);
    const token = await wallet.send(amount);
    return token;
  }
}
```

##### Usage Example

```typescript
// Initialize the manager
const walletManager = new SessionWalletManager({
  walletsDir: '/data/wallets',
  mintUrl: 'https://mint.openpleb.com'
});

// When user creates an offer
async function createOffer(sessionId: string, offerData: OfferData) {
  // Get the session's wallet
  const wallet = await walletManager.getWalletForSession(sessionId);
  
  // Handle escrow and bonds in this isolated wallet
  const escrowAmount = calculateEscrow(offerData);
  const bondAmount = calculateBond(offerData);
  
  // Generate invoice for maker bond + escrow
  const invoice = await generateInvoice(escrowAmount + bondAmount);
  
  // Store offer with session association
  await db.offers.create({
    ...offerData,
    sessionId,
    makerBondAndEscrow: invoice
  });
  
  return { offerId, invoice };
}

// When session expires
async function expireSession(sessionId: string) {
  // Return any remaining funds to user
  const balance = await walletManager.getSessionBalance(sessionId);
  if (balance > 0) {
    const refundToken = await walletManager.sendEcash(sessionId, balance);
    // Send refund token to user via notification
  }
  
  // Cleanup the session wallet
  await walletManager.cleanupSession(sessionId);
}

// Periodic cleanup job (run every hour)
setInterval(async () => {
  await walletManager.cleanupExpiredSessions(async (sessionId) => {
    const session = await db.sessions.findById(sessionId);
    return !session || session.expiresAt < Date.now();
  });
}, 3600000); // 1 hour
```

#### Benefits of Per-Session Wallets

1. **Privacy Isolation**
   - No cross-session data leakage
   - Each trade is completely isolated
   - Session wallet contents are never mixed

2. **Security**
   - Compromised session only affects that specific wallet
   - Easy to audit individual session transactions
   - Clear separation of funds per trade

3. **Simplicity**
   - Easy to track escrow and bonds per offer
   - Straightforward cleanup on session expiration
   - No complex queries to separate session data

4. **Performance**
   - SQLite is extremely lightweight
   - Each wallet DB is small and fast
   - No contention between sessions

5. **Operational**
   - Easy backup/restore per session
   - Simple debugging of individual trades
   - Clear audit trail per session

#### Considerations

1. **File System Limits**
   - SQLite is lightweight (~100KB per DB)
   - Modern systems handle thousands of file descriptors
   - Monitor with: `ulimit -n` (increase if needed)

2. **Connection Pooling**
   - Keep active session wallets in memory
   - Close inactive wallets after timeout
   - Reopen on demand if needed

3. **Cleanup Strategy**
   - Run periodic cleanup job (hourly recommended)
   - Delete expired session DBs
   - Return remaining funds before deletion

4. **Backup**
   - Active sessions: backup individual DB files
   - Completed trades: archive session DBs
   - Disputed trades: preserve until resolution

---

## Database Architecture

### PostgreSQL (Main Database)

Stores platform data, user information, and offer metadata.

**Schema:**
- `users` - User registration and profile data
- `invite_codes` - Invite code management
- `offers` - Offer metadata and status
- `fiat_providers` - Payment provider information
- `sessions` - Session tracking (BAT associations)
- `disputes` - Dispute records and resolutions
- `settings` - User preferences

**Note:** The main database does NOT store ecash tokens or wallet data. All ecash is managed in session-specific SQLite databases.

### SQLite (Session Wallets)

Each session has its own SQLite database managed by Coco Cashu.

**Contents:**
- Ecash proofs
- Transaction history
- Pending operations
- Wallet state

**Lifecycle:**
1. Created when session starts
2. Used for all ecash operations during session
3. Deleted when session expires (after returning funds)

---

## Offer Lifecycle

### 1. Offer Creation (Maker)

```
Maker creates offer (BAT required)
    ↓
Backend generates invoice for bond + escrow
    ↓
Offer status: CREATED (only visible to maker)
    ↓
Maker pays invoice
    ↓
Funds received in maker's session wallet
    ↓
Offer status: INVOICE_PAID (publicly visible)
```

### 2. Offer Claiming (Taker)

```
Taker claims offer (BAT required)
    ↓
Backend generates invoice for taker bond
    ↓
Offer status: INVOICE_CREATED (private to maker/taker)
    ↓
Taker pays invoice
    ↓
Funds received in taker's session wallet
    ↓
Offer status: TAKER_BOND_PAID
```

### 3. Trade Execution

```
Taker sends fiat payment
    ↓
Taker submits receipt
    ↓
Offer status: RECEIPT_SUBMITTED
    ↓
Maker confirms receipt
    ↓
Backend releases escrow to taker
    ↓
Backend returns bonds to both parties
    ↓
Backend issues reputation tokens
    ↓
Offer status: COMPLETED
```

### 4. Dispute Flow

```
Party initiates dispute (reveals pubkey)
    ↓
Offer status: DISPUTED
    ↓
Other party responds (FORFEIT or COUNTER)
    ↓
Admin reviews evidence
    ↓
Admin resolves dispute
    ↓
Funds distributed based on resolution
    ↓
Ecash locked to revealed pubkeys
    ↓
Offer status: RESOLVED
```

---

## Privacy Architecture

### Blinded Interactions

1. **Public Offers**
   - No user identification in public listings
   - Only offer details visible
   - Cannot link offers to users without BAT

2. **Active Trades**
   - Only maker and taker can view details
   - BAT verification required for access
   - No public visibility of trade progress

3. **Reputation System**
   - Reputation tokens instead of public ratings
   - No user profiles or trade history
   - Stake reputation to demonstrate trustworthiness

### Privacy Trade-offs

1. **Dispute Resolution**
   - Requires pubkey revelation
   - Necessary for ecash locking
   - Dispute stats tracked per pubkey
   - Users informed before initiating dispute

2. **Admin Access**
   - Admins can view all offers
   - Required for dispute resolution
   - Audit trail for platform integrity

---

## Security Considerations

### 1. BAT Verification

- BAT verified with Cashu mint only when opening session (one-time)
- Session created in sessions table with expiration time
- Subsequent requests check sessions table for validity
- Prevents replay attacks by tracking session state
- Sessions expire after configured timeout
- Expired sessions automatically cleaned up

### 2. Escrow Management

- Funds held in session wallets
- Released only on successful completion or dispute resolution
- Bonds returned on successful trades
- Automatic refunds on session expiration

### 3. Signature Verification

- User registration requires Schnorr signature
- Prevents unauthorized registration
- Timestamp validation (60-second window)
- Nonce prevents replay attacks

### 4. Rate Limiting

- Anonymous: 100 req/15min
- Authenticated: 1000 req/15min
- Admin: 5000 req/15min
- Prevents abuse and DoS attacks

---

## Scalability Considerations

### Horizontal Scaling

1. **Stateless API Servers**
   - BAT verification is stateless
   - Session wallets on shared filesystem (NFS/EFS)
   - PostgreSQL for shared state

2. **Session Wallet Distribution**
   - Shard session wallets across multiple volumes
   - Use consistent hashing for session-to-volume mapping
   - Each API server can access all volumes

3. **Database Scaling**
   - PostgreSQL read replicas for queries
   - Write operations to primary
   - Connection pooling

### Performance Optimization

1. **Wallet Caching**
   - Keep active session wallets in memory
   - LRU eviction for inactive wallets
   - Lazy loading on demand

2. **BAT Verification Caching**
   - Cache valid BAT verifications (short TTL)
   - Reduce mint API calls
   - Invalidate on token spend

3. **Database Indexing**
   - Index on session_id, offer_id, status
   - Composite indexes for common queries
   - Regular VACUUM and ANALYZE

---

## Monitoring and Observability

### Key Metrics

1. **Session Metrics**
   - Active sessions count
   - Session wallet count
   - Average session duration
   - Session cleanup rate

2. **Offer Metrics**
   - Offers created per hour
   - Offers completed per hour
   - Average time to completion
   - Dispute rate

3. **Wallet Metrics**
   - Total ecash in session wallets
   - Average wallet balance
   - Wallet operations per second
   - Failed wallet operations

4. **Performance Metrics**
   - API response times
   - BAT verification latency
   - Database query times
   - Wallet operation latency

### Logging

- Structured logging (JSON format)
- Log levels: ERROR, WARN, INFO, DEBUG
- Sensitive data redaction (BAT tokens, private keys)
- Correlation IDs for request tracing

### Alerting

- High dispute rate (>10%)
- Session wallet cleanup failures
- BAT verification failures
- Database connection issues
- High API error rates

---

## Deployment Architecture

### Recommended Setup

```
┌─────────────────┐
│   Load Balancer │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
┌───▼──┐  ┌──▼───┐
│ API  │  │ API  │
│Server│  │Server│
└───┬──┘  └──┬───┘
    │         │
    └────┬────┘
         │
    ┌────▼────────────┐
    │   PostgreSQL    │
    │   (Primary)     │
    └─────────────────┘
         │
    ┌────▼────────────┐
    │   PostgreSQL    │
    │  (Read Replica) │
    └─────────────────┘

┌─────────────────────┐
│  Shared Filesystem  │
│  (Session Wallets)  │
│  /data/wallets/     │
└─────────────────────┘

┌─────────────────────┐
│   Cashu Mint        │
│  (External Service) │
└─────────────────────┘
```

### Environment Variables

```bash
# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/openpleb
DATABASE_POOL_SIZE=20

# Cashu Mint
MINT_URL=https://mint.openpleb.com
MINT_UNIT=sat

# Session Wallets
WALLETS_DIR=/data/wallets
WALLET_CLEANUP_INTERVAL=3600000  # 1 hour in ms

# API
API_PORT=3000
API_BASE_PATH=/api/v1

# Security
SESSION_EXPIRY=3600  # 1 hour in seconds (maximum)
BAT_VERIFICATION_CACHE_TTL=300  # 5 minutes in seconds

# Rate Limiting
RATE_LIMIT_ANONYMOUS=100
RATE_LIMIT_AUTHENTICATED=1000
RATE_LIMIT_ADMIN=5000
RATE_LIMIT_WINDOW=900000  # 15 minutes in ms

# Admin
ADMIN_TOKEN=<secure_random_token>
OIDC_API_TOKEN=<secure_random_token>
```

---

## Future Considerations

### 1. Multi-Mint Support

- Support multiple Cashu mints
- User chooses preferred mint
- Cross-mint atomic swaps

### 2. Lightning Integration

- Direct Lightning payments for bonds/escrow
- Reduce dependency on ecash for large amounts
- Hybrid ecash + Lightning approach

### 3. Advanced Reputation

- Reputation token staking tiers
- Time-weighted reputation
- Reputation decay for inactive users

### 4. Automated Market Making

- Platform-provided liquidity
- Automated offer creation
- Dynamic pricing based on demand

### 5. Mobile Support

- Native mobile apps
- Push notifications via FCM/APNS
- Offline-first architecture

---

## Conclusion

The OpenPleb backend architecture prioritizes privacy, security, and scalability. The use of per-session Cashu wallets with Coco Cashu provides strong isolation guarantees while maintaining operational simplicity. The combination of BAT authentication, blinded interactions, and cryptographic escrow creates a trustless peer-to-peer exchange platform.
