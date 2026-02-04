# OpenPleb Capacity Analysis

## Concurrent Sessions on 4GB RAM VPS

### Memory Breakdown

#### System & Base Services (~1.5GB)
- Operating System: ~500MB
- PostgreSQL: ~300MB (with connection pooling)
- Node.js Runtime: ~200MB (base)
- System buffers/cache: ~500MB

**Available for Application: ~2.5GB**

---

### Per-Session Memory Footprint

#### Session Wallet (SQLite + Coco Cashu)
- SQLite database file: ~100KB (on disk)
- SQLite in-memory cache: ~2-5MB (when active)
- Coco Cashu instance: ~1-2MB
- Node.js object overhead: ~500KB

**Per Active Session: ~3-8MB**

#### Session Data (PostgreSQL)
- Session record: ~1KB
- Associated offer data: ~2-5KB
- Cached in application: ~500KB per session

**Total per active session: ~4-9MB**

---

### Capacity Calculations

#### Conservative Estimate (8MB per session)
```
Available RAM: 2.5GB = 2,560MB
Per session: 8MB
Concurrent sessions: 2,560 / 8 = 320 sessions
```

#### Optimistic Estimate (4MB per session)
```
Available RAM: 2.5GB = 2,560MB
Per session: 4MB
Concurrent sessions: 2,560 / 4 = 640 sessions
```

#### Realistic Estimate (6MB per session)
```
Available RAM: 2.5GB = 2,560MB
Per session: 6MB
Concurrent sessions: 2,560 / 6 = ~425 sessions
```

---

### Recommended Limits

#### Safe Operating Capacity
**300-400 concurrent sessions**

This provides:
- 20% memory headroom for spikes
- Room for caching and buffers
- Stable performance under load

#### With Optimizations
**500-600 concurrent sessions**

Achievable with:
- Aggressive wallet caching eviction (LRU)
- Lazy loading of inactive wallets
- Connection pooling optimization
- Short session timeout (1 hour maximum)

---

### Optimization Strategies

#### 1. Wallet Caching with LRU Eviction

```typescript
class SessionWalletManager {
  private maxCachedWallets = 200; // Keep only 200 wallets in memory
  private walletCache: LRUCache<string, CocoCashu>;

  constructor(config: SessionWalletConfig) {
    this.walletCache = new LRUCache({
      max: this.maxCachedWallets,
      dispose: async (wallet) => {
        await wallet.close?.();
      }
    });
  }

  async getWalletForSession(sessionId: string): Promise<CocoCashu> {
    // Check cache first
    let wallet = this.walletCache.get(sessionId);
    
    if (!wallet) {
      // Load from disk
      wallet = await this.loadWallet(sessionId);
      this.walletCache.set(sessionId, wallet);
    }
    
    return wallet;
  }
}
```

**Memory Savings:**
- Only 200 wallets in memory at once
- Inactive wallets closed and evicted
- Reduces memory from 6MB to ~2MB per session
- **New capacity: ~1,000 concurrent sessions**

#### 2. Short Session Timeout (1 Hour)

```typescript
// Maximum 1 hour session lifetime
SESSION_EXPIRY=3600  // 1 hour in seconds
```

**Benefits:**
- Very fast cleanup of inactive sessions
- Significantly reduced average concurrent sessions
- Aggressive resource reclamation
- Forces users to actively trade or re-authenticate
- Reduces attack surface for session hijacking

#### 3. Database Connection Pooling

```typescript
// Optimize PostgreSQL connections
DATABASE_POOL_SIZE=10  // Reduced from 20
DATABASE_POOL_MIN=2
DATABASE_POOL_IDLE_TIMEOUT=30000
```

**Memory Savings:**
- Each connection: ~10MB
- Savings: 10 connections × 10MB = 100MB
- **Additional capacity: ~16 sessions**

#### 4. Lazy Wallet Loading

```typescript
// Only load wallet when actually needed for operations
async function createOffer(sessionId: string, offerData: OfferData) {
  // Don't load wallet until invoice is paid
  const invoice = await generateInvoice(amount);
  
  // Store offer without loading wallet
  await db.offers.create({
    ...offerData,
    sessionId,
    makerBondAndEscrow: invoice
  });
  
  return { offerId, invoice };
}

// Load wallet only when payment is received
async function handleInvoicePaid(offerId: string) {
  const offer = await db.offers.findById(offerId);
  const wallet = await walletManager.getWalletForSession(offer.sessionId);
  // Now process the payment
}
```

**Benefits:**
- Wallets only loaded when actively trading
- Many sessions may never need wallet loaded
- Significant memory reduction for inactive sessions

---

### Real-World Scenarios

**Note:** With 1-hour session timeout, concurrent sessions are significantly lower than total users.

#### Scenario 1: Small Community (100 users)
- Active users in any given hour: ~20-30
- **20-30 concurrent sessions**
- Memory usage: ~200MB
- **Very comfortable on 4GB VPS**

#### Scenario 2: Growing Platform (500 users)
- Active users in any given hour: ~100-150
- **100-150 concurrent sessions**
- Memory usage: ~600-900MB
- **Comfortable on 4GB VPS**

#### Scenario 3: Popular Exchange (1000+ users)
- Active users in any given hour: ~200-300
- **200-300 concurrent sessions**
- Memory usage: ~1.2-1.8GB
- **Comfortable on 4GB VPS**

#### Scenario 4: Very Large Platform (5000+ users)
- Active users in any given hour: ~500-750
- **500-750 concurrent sessions**
- Memory usage: ~2.0-3.0GB (with optimizations)
- **Feasible on 4GB VPS with LRU caching**

---

### Monitoring Thresholds

#### Memory Alerts
```yaml
Warning: 70% memory usage (2.8GB / 4GB)
Critical: 85% memory usage (3.4GB / 4GB)
Emergency: 95% memory usage (3.8GB / 4GB)
```

#### Session Alerts
```yaml
Warning: 300 concurrent sessions
Critical: 400 concurrent sessions
Emergency: 450 concurrent sessions
```

#### Actions on Threshold Breach
1. **Warning**: Log alert, monitor closely
2. **Critical**: Reduce session timeout, aggressive cleanup
3. **Emergency**: Reject new sessions, force cleanup of idle sessions

---

### Scaling Path

#### Vertical Scaling
- **4GB → 8GB VPS**: ~800-1,200 sessions
- **8GB → 16GB VPS**: ~2,000-3,000 sessions

#### Horizontal Scaling
- Add second API server
- Shared PostgreSQL + NFS for wallets
- Load balancer distributes sessions
- **Linear scaling**: 2 servers = 2× capacity

#### Hybrid Approach
- Start with 4GB VPS (300-400 sessions)
- Monitor growth and usage patterns
- Upgrade to 8GB when hitting 300 sessions consistently
- Add horizontal scaling when single server hits limits

---

### Recommendations for 4GB VPS

#### Configuration
```bash
# Optimized settings for 1-hour sessions
SESSION_EXPIRY=3600  # 1 hour (maximum)
WALLET_CACHE_SIZE=200  # Max wallets in memory
WALLET_CLEANUP_INTERVAL=300000  # 5 minutes (aggressive cleanup)
DATABASE_POOL_SIZE=10
SESSION_LIMIT=600  # Hard limit on concurrent sessions
```

#### Expected Performance
- **Concurrent sessions**: 200-400 (typical)
- **Peak capacity**: 500-600 sessions
- **Active trades**: 50-150 simultaneously
- **Response time**: <100ms (p95)
- **Uptime**: 99.5%+

#### Growth Indicators
Monitor these metrics to know when to upgrade:
- Sustained >400 concurrent sessions
- Memory usage >70% for >30 minutes
- Response times >200ms (p95)
- Session creation failures

---

## Conclusion

**With 1-hour session timeout, a 4GB RAM VPS can comfortably handle 500-600 concurrent sessions** with the OpenPleb architecture.

### Key Benefits of 1-Hour Sessions:
- **Lower concurrent sessions**: Only active traders have sessions
- **Better security**: Reduced session hijacking window
- **Faster cleanup**: Resources freed quickly
- **Higher capacity**: Can support 2,000-5,000 total users on 4GB VPS

### Capacity Summary:
- **Typical load**: 200-400 concurrent sessions
- **Peak capacity**: 500-600 concurrent sessions
- **Total users supported**: 2,000-5,000 users
- **Memory headroom**: 30-40% for spikes

With optimizations (LRU caching, lazy loading), this can be pushed to **700-800 sessions** during peak times.

For a new platform, start with 4GB and plan to upgrade to 8GB when you consistently see 400+ concurrent sessions. The 1-hour timeout provides excellent resource efficiency and security.
