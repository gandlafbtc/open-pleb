# OpenPleb REST API Documentation

## Overview

OpenPleb is a peer-to-peer fiat-to-bitcoin exchange platform. This API uses cryptographic signatures for authentication and an invite code system for user registration.

---

## Quick Reference

### REST API Endpoints

#### User Registration & Authentication
- `GET /oidc-api/pubkey/:pubkey` - Check if pubkey is registered (OIDC API only)
- `POST /admin/invite-codes` - Generate invite code (Admin)
- `GET /invite-codes/:code/validate` - Validate invite code
- `POST /users/register` - Register new user
- `PATCH /admin/users/:userId/status` - Update user status (Admin)

#### Session Management
- `GET /sessions/validate` - Validate BAT/session (BAT required)
- `DELETE /sessions` - Revoke BAT/session (BAT required)

#### Offer Management
- `POST /offers` - Create offer (BAT required)
- `GET /offers/:id` - Get offer details
- `GET /offers` - List offers
- `POST /offers/:id/claim` - Claim offer (BAT required)
- `POST /offers/:id/pay` - Confirm invoice payment (BAT required)
- `POST /offers/:id/receipt` - Submit payment receipt (BAT required)
- `POST /offers/:id/complete` - Complete trade (BAT required)
- `POST /offers/:id/issue` - Mark issue (BAT required)
- `POST /offers/:id/dispute` - Initiate dispute (BAT required)
- `POST /offers/:id/dispute/respond` - Respond to dispute (BAT required)
- `POST /admin/offers/:id/resolve` - Resolve dispute (Admin)

#### Fiat Providers
- `GET /fiat-providers` - List fiat providers
- `POST /admin/fiat-providers` - Create fiat provider (Admin)
- `PATCH /admin/fiat-providers/:id` - Update fiat provider (Admin)
- `DELETE /admin/fiat-providers/:id` - Delete fiat provider (Admin)

#### Push Notifications
- `POST /notifications/subscribe` - Subscribe to notifications (BAT required)
- `DELETE /notifications/subscribe` - Unsubscribe from notifications (BAT required)

#### Platform Statistics
- `GET /stats` - Get platform statistics
- `GET /config` - Get platform configuration

---

### Socket.IO Events

#### Unauthenticated Connection (Public)

**Events Received:**
- `offer:created` - New public offer available
- `offer:updated` - Public offer updated
- `offer:claimed` - Public offer claimed
- `offer:expired` - Public offer expired
- `stats:updated` - Platform statistics updated

**Events Emitted:**
- None (read-only)

#### BAT-Authenticated Connection

**Events Received:**
- `session:authenticated` - Session authenticated successfully
- `session:error` - Session authentication error
- `offer:maker:created` - Maker created offer
- `offer:maker:paid` - Maker paid bond/escrow
- `offer:maker:claimed` - Maker's offer was claimed
- `offer:taker:claimed` - Taker claimed offer
- `offer:invoice:paid` - Invoice paid (maker or taker)
- `offer:receipt:submitted` - Payment receipt submitted
- `offer:completed` - Trade completed
- `offer:issue:marked` - Offer marked with issue
- `offer:disputed` - Dispute initiated
- `offer:dispute:responded` - Dispute response received
- `offer:resolved` - Dispute resolved
- `notification` - General notification

**Events Emitted:**
- `offer:subscribe` - Subscribe to offer updates
- `offer:unsubscribe` - Unsubscribe from offer updates

#### Admin Connection

**Events Received:**
- All unauthenticated and BAT-authenticated events, plus:
- `admin:authenticated` - Admin authenticated
- `admin:user:registered` - New user registered
- `admin:offer:all` - All offer state changes
- `admin:dispute:created` - Dispute created
- `admin:dispute:responded` - Dispute responded
- `admin:system:alert` - System alert

**Events Emitted:**
- `admin:offer:subscribe:all` - Subscribe to all offers
- `admin:offer:unsubscribe:all` - Unsubscribe from all offers
- `admin:user:subscribe` - Subscribe to user updates

---

## Authentication

OpenPleb uses a multi-layered authentication system:

### 1. User Registration (Public Key)
Users register with a client-generated public key (secp256k1) linked to an invite code.

### 2. OIDC Authentication (External)
After registration, users authenticate with the Cashu mint using **nostr-oidc** (handled externally, not by OpenPleb backend). The mint uses the OIDC API endpoint to verify the user's pubkey is registered.

### 3. Blind Authentication Tokens (BAT)
Users obtain Blind Authentication Tokens (BAT) from the Cashu mint after OIDC authentication. These tokens provide privacy-preserving authentication.

### 4. Sessions (BAT as Session Identifier)
BATs are used directly as session identifiers on OpenPleb. Sessions are required for:
- Creating offers
- Claiming offers
- Any state-changing operations

**Note:** Viewing **unclaimed** offers (status: `INVOICE_PAID`) and public data does NOT require authentication or sessions. Once an offer is claimed (status: `INVOICE_CREATED` and beyond), only the maker, taker, and admins can view the offer details.

### Authentication Flow

```
1. User registers on OpenPleb → Public Key + Signature (one-time)
2. User authenticates with Cashu mint → Uses nostr-oidc (external)
3. Mint verifies pubkey → Calls OpenPleb OIDC API endpoint
4. User receives BAT from mint → Blind authentication token
5. User uses BAT for OpenPleb operations → BAT in Authorization header
```

### Signed Payloads (for registration only)

Only the initial user registration requires a Schnorr-signed payload:

```typescript
{
  payload: {
    inviteCode: string,
    pubkey: string
  },
  signature: string,    // Schnorr signature of the payload
  nonce: string,        // Random nonce for replay protection
  timestamp: number     // Unix timestamp (must be within 60 seconds)
}
```

The signature is created by:
1. Sorting the payload object keys alphabetically
2. Creating a message: `nonce + timestamp + JSON.stringify(sortedPayload)`
3. Hashing the message with SHA-256
4. Signing with the user's private key using Schnorr signatures

**Note:** All other operations use BAT authentication. OIDC is handled externally by nostr-oidc and the Cashu mint.

## Base URLs

OpenPleb runs **two separate API servers** on different ports for security and network isolation:

### Public API
```
https://api.openpleb.com/api/v1
```

**Endpoints:**
- User registration
- Session management
- Offer management (create, claim, trade)
- Fiat providers (read-only)
- Platform statistics
- Public offer listings

**Socket.IO:** `/ws` (unauthenticated), `/wsba` (BAT-authenticated)

### Admin API
```
https://admin-api.openpleb.com/admin/v1
```

**Endpoints:**
- Invite code generation
- User management
- Dispute resolution
- Fiat provider management (create, update, delete)
- OIDC API (for Cashu mint integration)

**Socket.IO:** `/wsa` (admin-authenticated)

**Note:** The admin API runs on a **separate port** (default: 3001) and can be configured to:
- Bind to localhost only (`127.0.0.1`)
- Bind to internal network IP (e.g., `10.0.1.100`)
- Be accessible only via VPN or internal network
- Use IP whitelisting for additional security

This separation allows backend operators to make decisions about exposing admin APIs to specific networks while keeping the public API accessible to all users.

---

## Admin Roles

OpenPleb has two distinct admin roles:

1. **`admin`** - Full administrative access
   - Generate invite codes
   - Manage fiat providers
   - Resolve disputes
   - Update user status
   - All platform management operations

2. **`oidc-api`** - Limited API access for OIDC integration
   - Check if pubkey is registered
   - Used by the Cashu mint for OIDC authentication flow
   - Cannot perform other administrative operations

---

## User Registration & Authentication

### 1. Check Pubkey Registration (OIDC API)

**Endpoint:** `GET /oidc-api/pubkey/:pubkey`

**Description:** Checks if a pubkey is registered (OIDC API role only). Used by the Cashu mint during OIDC authentication.

**Request Parameters:**
- `pubkey` (path) - The public key to check (hex-encoded)

**Request Headers:**
```
Authorization: Bearer <oidc_api_token>
```

**Response:** `200 OK`
```json
{
  "registered": true,
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "isActive": true
}
```

**Error Responses:**
- `401 Unauthorized` - Invalid or missing OIDC API token
- `403 Forbidden` - Insufficient permissions (not oidc-api role)
- `404 Not Found` - Pubkey not registered

**Notes:**
- This endpoint is specifically for the OIDC integration with the Cashu mint
- Only accessible by admins with the `oidc-api` role
- Returns minimal information for privacy

---

### 2. Generate Invite Code (Admin Only)

**Endpoint:** `POST /admin/invite-codes`

**Description:** Generates a new invite code for user registration.

**Request Headers:**
```
Authorization: Bearer <admin_token>
```

**Request Body:**
```json
{
  "expiresIn": 86400  // Optional: expiration time in seconds (default: 7 days)
}
```

**Response:** `201 Created`
```json
{
  "inviteCode": "ABC123XYZ789",
  "expiresAt": 1706400000,
  "createdAt": 1706313600
}
```

**Error Responses:**
- `401 Unauthorized` - Invalid or missing admin token
- `403 Forbidden` - Insufficient permissions

---

### 3. Validate Invite Code

**Endpoint:** `GET /invite-codes/:code/validate`

**Description:** Checks if an invite code is valid and not expired.

**Request Parameters:**
- `code` (path) - The invite code to validate

**Response:** `200 OK`
```json
{
  "valid": true,
  "expiresAt": 1706400000
}
```

**Error Responses:**
- `404 Not Found` - Invite code does not exist
- `410 Gone` - Invite code has expired

---

### 4. Register User

**Endpoint:** `POST /users/register`

**Description:** Registers a new user by linking an invite code with a client-generated public key.

**Request Body:**
```json
{
  "payload": {
    "inviteCode": "ABC123XYZ789",
    "pubkey": "02a1b2c3d4e5f6..."  // User's public key (hex-encoded)
  },
  "signature": "3045022100...",
  "nonce": "a1b2c3d4...",
  "timestamp": 1706313600000
}
```

**Response:** `201 Created`
```json
{
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "pubkey": "02a1b2c3d4e5f6...",
  "isActive": true,
  "createdAt": 1706313600
}
```

**Error Responses:**
- `400 Bad Request` - Invalid signature, expired timestamp, or malformed request
- `404 Not Found` - Invite code does not exist
- `409 Conflict` - Public key already registered
- `410 Gone` - Invite code has expired or already used

**Notes:**
- The invite code can only be used once
- The public key must be unique across all users
- The signature must be valid and timestamp within 60 seconds

---

### 5. Update User Status (Admin Only)

**Endpoint:** `PATCH /admin/users/:userId/status`

**Description:** Activates or deactivates a user account (admin only).

**Request Parameters:**
- `userId` (path) - The user ID

**Request Headers:**
```
Authorization: Bearer <admin_token>
```

**Request Body:**
```json
{
  "isActive": false
}
```

**Response:** `200 OK`
```json
{
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "isActive": false,
  "updatedAt": 1706313600
}
```

**Error Responses:**
- `401 Unauthorized` - Invalid or missing admin token
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - User not found

---

## Session Management

Sessions are required for creating and claiming offers. The BAT (Blind Authentication Token) obtained from the Cashu mint is used directly as the session identifier.

### 6. Validate BAT/Session

**Endpoint:** `GET /sessions/validate`

**Description:** Validates a BAT and checks if it's valid for use as a session.

**Request Headers:**
```
Authorization: Bearer <bat_token>
```

**Response:** `200 OK`
```json
{
  "valid": true,
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "expiresAt": 1706317200
}
```

**Error Responses:**
- `401 Unauthorized` - Invalid BAT
- `404 Not Found` - BAT not found or already spent
- `410 Gone` - BAT has expired

**Notes:**
- The BAT is obtained from the Cashu mint using OIDC credentials
- BAT is verified with the mint only when opening a session (one-time)
- Session is created in the backend sessions table with expiration time
- Subsequent requests check the sessions table for validity
- Once a session expires, it cannot be reused
- The platform tracks session state to prevent replay attacks

---

### 7. Revoke BAT/Session

**Endpoint:** `DELETE /sessions`

**Description:** Revokes a BAT, preventing further use (logout).

**Request Headers:**
```
Authorization: Bearer <bat_token>
```

**Response:** `204 No Content`

**Error Responses:**
- `401 Unauthorized` - Invalid BAT
- `404 Not Found` - BAT not found

---

## Offer Management

### 8. Create Offer

**Endpoint:** `POST /offers`

**Description:** Creates a new fiat-to-bitcoin offer. Requires an active session.

**Request Headers:**
```
Authorization: Bearer <bat_token>
```

**Request Body:**
```json
{
  "fiatCurrency": "KRW",
  "fiatAmount": 50000,
  "fiatProviderId": 1,
  "fiatAddress": "account@bank.com",
  "description": "Quick trade, online transfer only",
  "expiresIn": 3600,  // Optional: offer expiration in seconds
  "reputationStake": "cashuAeyJ0b2tlbiI6W3sicHJvb2ZzIjpb..."  // Optional: reputation token to stake
}
```

**Response:** `201 Created`
```json
{
  "offerId": 456,
  "status": "CREATED",
  "fiatCurrency": "KRW",
  "fiatAmount": 50000,
  "fiatProviderId": 1,
  "fiatAddress": "account@bank.com",
  "conversionRate": 1350000000,
  "satsAmount": 37037,
  "platformFeeFlatRate": 100,
  "platformFeePercentage": 1,
  "takerFeeFlatRate": 50,
  "takerFeePercentage": 0,
  "makerBondFlatRate": 1000,
  "makerBondPercentage": 5,
  "takerBondFlatRate": 1000,
  "takerBondPercentage": 5,
  "makerBondAndEscrow": "lnbc370370n1...",
  "updatedAt": 1706313600,
  "expiresAt": 1706317200,
  "description": "Quick trade, online transfer only"
}
```

**Notes:**
- The offer is created with status `CREATED` and includes a Lightning invoice for maker bond and escrow
- Maker must pay the invoice to make the offer publicly visible
- Once paid, status changes to `INVOICE_PAID` and offer appears in public listings
- BAT tokens are never included in responses to protect authentication credentials
- The platform internally tracks which BAT is associated with each offer (session)
- Only the user who created the offer can perform maker actions

**Error Responses:**
- `400 Bad Request` - Invalid data
- `401 Unauthorized` - Invalid or missing BAT
- `422 Unprocessable Entity` - Amount exceeds maximum allowed

**Notes:**
- Requires a valid BAT from the Cashu mint
- The BAT is linked to the offer as the maker's authentication
- Session validity is checked in the backend sessions table

### 9. Get Offer

**Endpoint:** `GET /offers/:id`

**Description:** Retrieves details of a specific offer. 

**Request Parameters:**
- `id` (path) - The offer ID

**Request Headers (Optional):**

```
Authorization: Bearer <bat_token>
```

**Response:** `200 OK`
```json
{
  "offerId": 456,
  "status": "INVOICE_PAID",
  "fiatCurrency": "KRW",
  "fiatAmount": 50000,
  "fiatProviderId": 1,
  "fiatAddress": "account@bank.com",
  "conversionRate": 1350000000,
  "satsAmount": 37037,
  "platformFeeFlatRate": 100,
  "platformFeePercentage": 1,
  "takerFeeFlatRate": 50,
  "takerFeePercentage": 0,
  "makerBondFlatRate": 1000,
  "makerBondPercentage": 5,
  "takerBondFlatRate": 1000,
  "takerBondPercentage": 5,
  "updatedAt": 1706313600,
  "expiresAt": 1706317200,
  "description": "Quick trade, online transfer only"
}
```

**Error Responses:**
- `401 Unauthorized` - Offer is claimed and requires BAT authentication (only maker/taker can view)
- `403 Forbidden` - BAT is not authorized to view this offer
- `404 Not Found` - Offer not found

**Notes:**
- **Public offers** (status: `INVOICE_PAID`) can be viewed by anyone without authentication
- **Maker-only statuses** (status: `CREATED`, `INVOICE_CREATED`) require maker's BAT authentication
- **Claimed offers** (all statuses after claiming) require BAT authentication from maker or taker
- Only the maker's BAT, taker's BAT, or admin can view offers in these private statuses
- This ensures privacy for active trades
- **BAT tokens are never included in responses** to protect authentication credentials
- The platform internally verifies BAT ownership without exposing tokens

---

### 10. List Offers

**Endpoint:** `GET /offers`

**Description:** Lists available offers with optional filtering. Only returns unclaimed offers when accessed without authentication.

**Query Parameters:**
- `currency` (optional) - Filter by fiat currency (e.g., "KRW")
- `status` (optional) - Filter by status (e.g., "INVOICE_PAID")
- `minAmount` (optional) - Minimum fiat amount
- `maxAmount` (optional) - Maximum fiat amount
- `providerId` (optional) - Filter by fiat provider ID
- `page` (optional) - Page number (default: 1)
- `limit` (optional) - Items per page (default: 20, max: 100)

**Request Headers (Optional):**
```
Authorization: Bearer <bat_token>
```

**Response:** `200 OK`
```json
{
  "offers": [
    {
      "offerId": 456,
      "status": "INVOICE_PAID",
      "fiatCurrency": "KRW",
      "fiatAmount": 50000,
      "satsAmount": 37037,
      "conversionRate": 1350000000,
      "fiatProviderId": 1,
      "updatedAt": 1706313600,
      "expiresAt": 1706317200
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "totalPages": 3
  }
}
```

**Notes:**
- **Without authentication**: Only returns public offers (status: `INVOICE_PAID`)
- **With maker's BAT**: Also includes maker's own offers in `CREATED` and `INVOICE_CREATED` statuses
- **With taker's BAT**: Also includes offers where the BAT is the taker (claimed offers)
- Offers only appear in public listings after the maker has paid the bond and escrow invoice
- Offers in `CREATED` status are only visible to the maker (waiting for payment)
- Offers in `INVOICE_CREATED` status are only visible to the maker (waiting for taker to pay bond)

---

### 11. Claim Offer (Taker)

**Endpoint:** `POST /offers/:id/claim`

**Description:** Claims an offer as a taker, initiating the trade. Requires an active session.

**Request Parameters:**
- `id` (path) - The offer ID

**Request Headers:**
```
Authorization: Bearer <bat_token>
```

**Request Body:**
```json
{
  "reputationStake": "cashuAeyJ0b2tlbiI6W3sicHJvb2ZzIjpb..."  // Optional: reputation token to stake
}
```

**Response:** `200 OK`
```json
{
  "offerId": 456,
  "status": "INVOICE_CREATED",
  "makerBondAndEscrow": "lnbc370370n1...",
  "takerBond": "lnbc18518n1...",
  "updatedAt": 1706313700
}
```

**Notes:**
- BAT tokens are never included in responses to protect authentication credentials
- The platform internally tracks which BAT claimed the offer
- Only the user who claimed the offer can perform taker actions

**Error Responses:**
- `400 Bad Request` - Offer already claimed
- `401 Unauthorized` - Invalid or missing BAT
- `404 Not Found` - Offer not found
- `410 Gone` - Offer has expired

**Notes:**
- The BAT is used to identify the taker
- The BAT is linked to the offer as the taker's authentication

---

### 12. Pay Invoice

**Endpoint:** `POST /offers/:id/pay`

**Description:** Confirms payment of the bond/escrow invoice using Cashu tokens. Requires session authentication.

**Payment Method:** For the first version, payment is done **in-band via Cashu token only**. Lightning invoice payment will be supported in future versions.

**Request Parameters:**
- `id` (path) - The offer ID

**Request Headers:**
```
Authorization: Bearer <bat_token>
```

**Request Body:**
```json
{
  "role": "maker",  // "maker" or "taker"
  "cashuToken": "cashuAeyJ0b2tlbiI6W3sicHJvb2ZzIjpb..."  // Cashu token for payment
}
```

**Response:** `200 OK`
```json
{
  "offerId": 456,
  "status": "INVOICE_PAID",
  "paidAt": 1706313800,
  "updatedAt": 1706313800
}
```

**Error Responses:**
- `400 Bad Request` - Invalid payment or Cashu token
- `401 Unauthorized` - Invalid or missing BAT
- `403 Forbidden` - BAT not associated with this offer
- `404 Not Found` - Offer not found
- `422 Unprocessable Entity` - Cashu token amount insufficient or invalid

**Notes:**
- The Cashu token must have sufficient value to cover the bond/escrow amount
- The backend verifies and melts the Cashu token upon receipt
- Future versions will support out-of-band Lightning invoice payment

---

### 13. Submit Receipt

**Endpoint:** `POST /offers/:id/receipt`

**Description:** Submits proof of fiat payment (taker). Requires session authentication.

**Request Parameters:**
- `id` (path) - The offer ID

**Request Headers:**
```
Authorization: Bearer <bat_token>
```

**Request Body:**
```json
{
  "receiptImg": "data:image/png;base64,iVBORw0KGgoAAAANS..."
}
```

**Response:** `200 OK`
```json
{
  "offerId": 456,
  "status": "RECEIPT_SUBMITTED",
  "receiptImg": "data:image/png;base64,iVBORw0KGgoAAAANS...",
  "updatedAt": 1706314000
}
```

**Error Responses:**
- `400 Bad Request` - Invalid image format
- `401 Unauthorized` - Invalid or missing BAT
- `403 Forbidden` - BAT is not the taker of this offer
- `404 Not Found` - Offer not found
- `409 Conflict` - Invalid offer status for receipt submission

---

### 14. Complete Offer (Maker)

**Endpoint:** `POST /offers/:id/complete`

**Description:** Confirms receipt of fiat payment and completes the trade (maker). Requires session authentication.

**Request Parameters:**
- `id` (path) - The offer ID

**Request Headers:**
```
Authorization: Bearer <bat_token>
```

**Request Body:**
```json
{
  "feedback": "Great trader, fast payment!"  // Optional
}
```

**Response:** `200 OK`
```json
{
  "offerId": 456,
  "status": "COMPLETED",
  "completedAt": 1706314200,
  "makerFeedback": "Great trader, fast payment!",
  "takerRewardToken": "cashuAeyJ0b2tlbiI6W3sicHJvb2ZzIjpb...",
  "makerReputationToken": "cashuAeyJ0b2tlbiI6W3sicHJvb2ZzIjpb...",
  "takerReputationToken": "cashuAeyJ0b2tlbiI6W3sicHJvb2ZzIjpb...",
  "updatedAt": 1706314200
}
```

**Notes:**
- Both maker and taker receive reputation tokens upon successful completion
- Reputation tokens have "reputation" as backing value instead of monetary value
- These tokens can be staked in future offers to demonstrate trustworthiness
- Any staked reputation tokens are returned along with new reputation tokens

**Error Responses:**
- `400 Bad Request` - Invalid request
- `401 Unauthorized` - Invalid or missing BAT
- `403 Forbidden` - BAT is not the maker of this offer
- `404 Not Found` - Offer not found
- `409 Conflict` - Invalid offer status

---

### 15. Mark Issue

**Endpoint:** `POST /offers/:id/issue`

**Description:** Marks an offer as having an issue (maker). Requires session authentication. **Important:** Marking an issue reveals your pubkey to the platform.

**Request Parameters:**
- `id` (path) - The offer ID

**Request Headers:**
```
Authorization: Bearer <bat_token>
```

**Request Body:**
```json
{
  "pubkey": "02a1b2c3d4e5f6...",  // Maker's public key (hex-encoded)
  "reason": "Payment not received after 2 hours",
  "evidence": "data:image/png;base64,..."  // Optional evidence
}
```

**Response:** `200 OK`
```json
{
  "offerId": 456,
  "status": "MARKED_WITH_ISSUE",
  "makerFeedback": "Payment not received after 2 hours",
  "updatedAt": 1706314400
}
```

**Error Responses:**
- `400 Bad Request` - Invalid request
- `401 Unauthorized` - Invalid or missing BAT
- `403 Forbidden` - BAT is not the maker of this offer
- `404 Not Found` - Offer not found

**Notes:**
- **Privacy Warning:** Marking an issue requires revealing your pubkey to the platform
- Your pubkey will be linked to this offer and used to lock ecash refunds/rewards after settlement
- This allows the taker to respond by either forfeiting or escalating to dispute

---

### 16. Respond to Issue (Taker)

**Endpoint:** `POST /offers/:id/issue/respond`

**Description:** Responds to a marked issue (taker). Can either forfeit or escalate to dispute. Requires session authentication. **Important:** Responding reveals your pubkey to the platform.

**Request Parameters:**
- `id` (path) - The offer ID

**Request Headers:**
```
Authorization: Bearer <bat_token>
```

**Request Body (Forfeit):**
```json
{
  "pubkey": "02b2c3d4e5f6a7...",  // Taker's public key (hex-encoded)
  "response": "FORFEIT"
}
```

**Request Body (Escalate to Dispute):**
```json
{
  "pubkey": "02b2c3d4e5f6a7...",  // Taker's public key (hex-encoded)
  "response": "DISPUTE",
  "reason": "Payment was sent but not acknowledged",
  "evidence": "data:image/png;base64,..."  // Optional additional evidence
}
```

**Response (Forfeit):** `200 OK`
```json
{
  "offerId": 456,
  "status": "RESOLVED",
  "resolution": "MAKER_WINS",
  "makerRefundToken": "cashuAeyJ0b2tlbiI6W3sicHJvb2ZzIjpb...",
  "updatedAt": 1706314600
}
```

**Response (Dispute):** `200 OK`
```json
{
  "offerId": 456,
  "status": "DISPUTED",
  "takerFeedback": "Payment was sent but not acknowledged",
  "updatedAt": 1706314600
}
```

**Error Responses:**
- `400 Bad Request` - Invalid response
- `401 Unauthorized` - Invalid or missing BAT
- `403 Forbidden` - BAT is not the taker of this offer
- `404 Not Found` - Offer not found
- `409 Conflict` - Offer is not in "MARKED_WITH_ISSUE" status

**Notes:**
- **Privacy Warning:** Responding requires revealing your pubkey to the platform
- Your pubkey will be linked to this offer and used to lock ecash refunds/rewards after settlement
- If you forfeit, the maker wins automatically and receives refunds
- If you escalate to dispute, an admin must resolve the dispute
- Dispute stats (wins/losses) will be associated with your pubkey

---

### 17. Respond to Dispute (Maker)

**Endpoint:** `POST /offers/:id/dispute/respond`

**Description:** Responds to a dispute (maker). Can either forfeit or provide counter-evidence. Requires session authentication.

**Request Parameters:**
- `id` (path) - The offer ID

**Request Headers:**
```
Authorization: Bearer <bat_token>
```

**Request Body (Forfeit):**
```json
{
  "response": "FORFEIT"
}
```

**Request Body (Counter-Evidence):**
```json
{
  "response": "COUNTER",
  "counterEvidence": "data:image/png;base64,..."  // Counter-evidence
}
```

**Response (Forfeit):** `200 OK`
```json
{
  "offerId": 456,
  "status": "RESOLVED",
  "resolution": "TAKER_WINS",
  "takerRewardToken": "cashuAeyJ0b2tlbiI6W3sicHJvb2ZzIjpb...",
  "updatedAt": 1706314800
}
```

**Response (Counter):** `200 OK`
```json
{
  "offerId": 456,
  "status": "DISPUTED",
  "makerCounterEvidence": "data:image/png;base64,...",
  "updatedAt": 1706314800
}
```

**Error Responses:**
- `400 Bad Request` - Invalid response
- `401 Unauthorized` - Invalid or missing BAT
- `403 Forbidden` - BAT is not the maker of this offer
- `404 Not Found` - Offer not found
- `409 Conflict` - Offer is not in disputed status

**Notes:**
- If maker forfeits, the taker wins automatically and receives rewards
- If maker provides counter-evidence, the dispute remains open for admin resolution
- Maker's pubkey was already revealed when marking the issue

---

### 18. Resolve Dispute (Admin)

**Endpoint:** `POST /admin/offers/:id/resolve`

**Description:** Resolves a disputed offer (admin only). Ecash refunds/rewards are locked to the revealed pubkeys of the parties involved.

**Request Parameters:**
- `id` (path) - The offer ID

**Request Headers:**
```
Authorization: Bearer <admin_token>
```

**Request Body:**
```json
{
  "resolution": "MAKER_WINS",  // "MAKER_WINS", "TAKER_WINS", "SPLIT", "RETURN"
  "reason": "Evidence clearly shows payment was made"
}
```

**Response:** `200 OK`
```json
{
  "offerId": 456,
  "status": "RESOLVED",
  "resolutionReason": "Evidence clearly shows payment was made",
  "takerRewardToken": "cashuAeyJ0b2tlbiI6W3sicHJvb2ZzIjpb...",
  "takerRewardPubkeyLock": "02a1b2c3d4e5f6...",
  "makerRefundToken": null,
  "updatedAt": 1706315000
}
```

**Error Responses:**
- `401 Unauthorized` - Invalid or missing admin token
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Offer not found
- `409 Conflict` - Offer is not in disputed status

**Notes:**
- Ecash refunds/rewards are locked to the pubkeys revealed during the dispute
- This ensures only the rightful party can claim the funds
- Pubkey locks prevent token theft or misappropriation
- Dispute outcomes are recorded in user dispute stats
- Users in a dispute lose up to 3 reputation tokens

---

## Fiat Providers

### 19. List Fiat Providers

**Endpoint:** `GET /fiat-providers`

**Description:** Lists all available fiat payment providers. No authentication required.

**Response:** `200 OK`
```json
{
  "providers": [
    {
      "id": 1,
      "label": "KakaoBank",
      "icon": "https://cdn.openpleb.com/icons/kakaobank.png",
      "matchTemplate": "^[0-9]{10,12}$",
      "createdAt": 1706313600
    },
    {
      "id": 2,
      "label": "Toss",
      "icon": "https://cdn.openpleb.com/icons/toss.png",
      "matchTemplate": "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$",
      "createdAt": 1706313600
    }
  ]
}
```

---

### 20. Create Fiat Provider (Admin)

**Endpoint:** `POST /admin/fiat-providers`

**Description:** Creates a new fiat payment provider (admin only).

**Request Headers:**
```
Authorization: Bearer <admin_token>
```

**Request Body:**
```json
{
  "label": "KakaoBank",
  "icon": "https://cdn.openpleb.com/icons/kakaobank.png",
  "matchTemplate": "^[0-9]{10,12}$"  // Optional regex for validation
}
```

**Response:** `201 Created`
```json
{
  "id": 1,
  "label": "KakaoBank",
  "icon": "https://cdn.openpleb.com/icons/kakaobank.png",
  "matchTemplate": "^[0-9]{10,12}$",
  "createdAt": 1706313600
}
```

**Error Responses:**
- `401 Unauthorized` - Invalid or missing admin token
- `403 Forbidden` - Insufficient permissions
- `409 Conflict` - Provider with this label already exists

---

### 21. Update Fiat Provider (Admin)

**Endpoint:** `PATCH /admin/fiat-providers/:id`

**Description:** Updates a fiat payment provider (admin only).

**Request Parameters:**
- `id` (path) - The provider ID

**Request Headers:**
```
Authorization: Bearer <admin_token>
```

**Request Body:**
```json
{
  "label": "KakaoBank Updated",
  "icon": "https://cdn.openpleb.com/icons/kakaobank-new.png",
  "matchTemplate": "^[0-9]{10,14}$"
}
```

**Response:** `200 OK`
```json
{
  "id": 1,
  "label": "KakaoBank Updated",
  "icon": "https://cdn.openpleb.com/icons/kakaobank-new.png",
  "matchTemplate": "^[0-9]{10,14}$",
  "createdAt": 1706313600
}
```

**Error Responses:**
- `401 Unauthorized` - Invalid or missing admin token
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Provider not found

---

### 22. Delete Fiat Provider (Admin)

**Endpoint:** `DELETE /admin/fiat-providers/:id`

**Description:** Deletes a fiat payment provider (admin only).

**Request Parameters:**
- `id` (path) - The provider ID

**Request Headers:**
```
Authorization: Bearer <admin_token>
```

**Response:** `204 No Content`

**Error Responses:**
- `401 Unauthorized` - Invalid or missing admin token
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Provider not found
- `409 Conflict` - Provider is in use by active offers

---

## Push Notifications

### 23. Subscribe to Notifications

**Endpoint:** `POST /notifications/subscribe`

**Description:** Subscribes to push notifications.

**Request Headers:**
```
Authorization: Bearer <bat_token>
```

**Request Body:**
```json
{
  "subscription": {
    "endpoint": "https://fcm.googleapis.com/fcm/send/...",
    "keys": {
      "p256dh": "BNcRd...",
      "auth": "tBHI..."
    }
  },
  "type": "web-push"  // "web-push" or "fcm"
}
```

**Response:** `201 Created`
```json
{
  "subscriptionId": 789,
  "createdAt": 1706313600
}
```

**Error Responses:**
- `400 Bad Request` - Invalid subscription data
- `401 Unauthorized` - Invalid or missing BAT
- `409 Conflict` - Subscription already exists

---

### 24. Unsubscribe from Notifications

**Endpoint:** `DELETE /notifications/subscribe`

**Description:** Unsubscribes from push notifications.

**Request Headers:**
```
Authorization: Bearer <bat_token>
```

**Request Body:**
```json
{
  "endpoint": "https://fcm.googleapis.com/fcm/send/..."
}
```

**Response:** `204 No Content`

**Error Responses:**
- `401 Unauthorized` - Invalid or missing BAT
- `404 Not Found` - Subscription not found

---

## Platform Statistics

### 25. Get Platform Stats

**Endpoint:** `GET /stats`

**Description:** Retrieves platform-wide statistics. No authentication required.

**Response:** `200 OK`
```json
{
  "takers": 42,
  "makers": 38,
  "price": 1350000000,
  "totalOffers": 156,
  "completedOffers": 89,
  "activeOffers": 12,
  "totalVolume": 45000000,
  "currencies": ["KRW", "JPY", "LAK"]
}
```

---

### 26. Get Platform Configuration

**Endpoint:** `GET /config`

**Description:** Retrieves public platform configuration. No authentication required.

**Response:** `200 OK`
```json
{
  "platformFeePercentage": 1,
  "platformFeeFlatRate": 100,
  "takerFeePercentage": 0,
  "takerFeeFlatRate": 50,
  "bondPercentage": 5,
  "bondFlatRate": 1000,
  "currency": "KRW",
  "maxFiatAmount": 1000000,
  "mintUrl": "https://mint.openpleb.com"
}
```

---

## Socket.IO Real-time API

OpenPleb uses Socket.IO for real-time updates. There are three types of socket connections with different paths:

1. **Unauthenticated** (`/ws`) - Public updates for listed offers
2. **BAT-authenticated** (`/wsba`) - Session-specific updates for authenticated users
3. **Admin** (`/wsa`) - Full platform updates for administrators

**Note:** BAT and unauthenticated connections can be active simultaneously on the same client.

### Connection Endpoint

**Base URL:** `wss://api.openpleb.com`

**Socket.IO Paths:**
- Unauthenticated: `/ws`
- BAT-authenticated: `/wsba`
- Admin: `/wsa`

---

### 1. Unauthenticated Connection

**Description:** Receives public updates for offers with status `INVOICE_PAID` (listed offers).

**Path:** `/ws`

**Connection:**
```javascript
import { io } from 'socket.io-client';

const socket = io('wss://api.openpleb.com', {
  path: '/ws',
  transports: ['websocket', 'polling']
});
```

**Events Received:**

#### `offer:created`
Emitted when a new offer becomes publicly available (status: `INVOICE_PAID`).

```json
{
  "offerId": 456,
  "status": "INVOICE_PAID",
  "fiatCurrency": "KRW",
  "fiatAmount": 50000,
  "satsAmount": 37037,
  "conversionRate": 1350000000,
  "fiatProviderId": 1,
  "createdAt": 1706313600,
  "expiresAt": 1706317200
}
```

#### `offer:updated`
Emitted when a public offer is updated (e.g., amount changed, expiration extended).

```json
{
  "offerId": 456,
  "status": "INVOICE_PAID",
  "fiatAmount": 55000,
  "satsAmount": 40740,
  "updatedAt": 1706313700
}
```

#### `offer:claimed`
Emitted when a public offer is claimed (removed from public listings).

```json
{
  "offerId": 456,
  "claimedAt": 1706313800
}
```

#### `offer:expired`
Emitted when a public offer expires without being claimed.

```json
{
  "offerId": 456,
  "expiredAt": 1706317200
}
```

#### `stats:updated`
Emitted when platform statistics change.

```json
{
  "takers": 43,
  "makers": 39,
  "price": 1350000000,
  "totalOffers": 157,
  "completedOffers": 90,
  "activeOffers": 13,
  "totalVolume": 45500000,
  "currencies": ["KRW", "JPY", "LAK"]
}
```

**Events Emitted:**

None - unauthenticated connections are read-only.

---

### 2. BAT-Authenticated Connection

**Description:** Receives session-specific updates for the authenticated user's offers and trades.

**Path:** `/wsba`

**Connection:**
```javascript
import { io } from 'socket.io-client';

const socket = io('wss://api.openpleb.com', {
  path: '/wsba',
  transports: ['websocket', 'polling'],
  auth: {
    token: 'cashuAeyJ0b2tlbiI6W3sicHJvb2ZzIjpb...'  // BAT token
  }
});
```

**Authentication:**
The BAT token is verified with the Cashu mint upon connection. If invalid, the connection is rejected.

**Events Received:**

#### `session:authenticated`
Emitted upon successful authentication.

```json
{
  "sessionId": "550e8400-e29b-41d4-a716-446655440000",
  "authenticatedAt": 1706313600
}
```

#### `session:error`
Emitted if authentication fails or session becomes invalid.

```json
{
  "error": "INVALID_BAT",
  "message": "BAT token is invalid or expired"
}
```

#### `offer:maker:created`
Emitted when the user creates an offer (status: `CREATED`).

```json
{
  "offerId": 456,
  "status": "CREATED",
  "fiatCurrency": "KRW",
  "fiatAmount": 50000,
  "satsAmount": 37037,
  "makerBondAndEscrow": "lnbc370370n1...",
  "createdAt": 1706313600,
  "expiresAt": 1706317200
}
```

#### `offer:maker:paid`
Emitted when the maker pays the bond and escrow invoice (status: `INVOICE_PAID`).

```json
{
  "offerId": 456,
  "status": "INVOICE_PAID",
  "paidAt": 1706313700
}
```

#### `offer:maker:claimed`
Emitted when someone claims the maker's offer.

```json
{
  "offerId": 456,
  "status": "INVOICE_CREATED",
  "takerBond": "lnbc18518n1...",
  "claimedAt": 1706313800
}
```

#### `offer:taker:claimed`
Emitted when the user successfully claims an offer as taker.

```json
{
  "offerId": 456,
  "status": "INVOICE_CREATED",
  "takerBond": "lnbc18518n1...",
  "claimedAt": 1706313800
}
```

#### `offer:invoice:paid`
Emitted when an invoice is paid (maker or taker bond).

```json
{
  "offerId": 456,
  "role": "taker",
  "status": "TAKER_BOND_PAID",
  "paidAt": 1706313900
}
```

#### `offer:receipt:submitted`
Emitted when the taker submits a payment receipt.

```json
{
  "offerId": 456,
  "status": "RECEIPT_SUBMITTED",
  "receiptImg": "data:image/png;base64,iVBORw0KGgoAAAANS...",
  "submittedAt": 1706314000
}
```

#### `offer:completed`
Emitted when the trade is completed successfully.

```json
{
  "offerId": 456,
  "status": "COMPLETED",
  "completedAt": 1706314200,
  "makerFeedback": "Great trader!",
  "takerRewardToken": "cashuAeyJ0b2tlbiI6W3sicHJvb2ZzIjpb...",
  "makerReputationToken": "cashuAeyJ0b2tlbiI6W3sicHJvb2ZzIjpb...",
  "takerReputationToken": "cashuAeyJ0b2tlbiI6W3sicHJvb2ZzIjpb..."
}
```

#### `offer:issue:marked`
Emitted when an offer is marked with an issue.

```json
{
  "offerId": 456,
  "status": "MARKED_WITH_ISSUE",
  "markedAt": 1706314400
}
```

#### `offer:disputed`
Emitted when a dispute is initiated.

```json
{
  "offerId": 456,
  "status": "DISPUTED",
  "disputedAt": 1706314600,
  "disputedBy": "taker"
}
```

#### `offer:dispute:responded`
Emitted when the other party responds to a dispute.

```json
{
  "offerId": 456,
  "status": "DISPUTED",
  "response": "COUNTER",
  "respondedAt": 1706314800
}
```

#### `offer:resolved`
Emitted when a dispute is resolved by an admin.

```json
{
  "offerId": 456,
  "status": "RESOLVED",
  "resolution": "TAKER_WINS",
  "resolutionReason": "Evidence clearly shows payment was made",
  "takerRewardToken": "cashuAeyJ0b2tlbiI6W3sicHJvb2ZzIjpb...",
  "resolvedAt": 1706315000
}
```

#### `notification`
Emitted for general notifications.

```json
{
  "type": "info",
  "title": "Trade Update",
  "message": "Your offer has been claimed",
  "offerId": 456,
  "timestamp": 1706313800
}
```

**Events Emitted:**

#### `offer:subscribe`
Subscribe to updates for a specific offer.

```javascript
socket.emit('offer:subscribe', { offerId: 456 });
```

**Response:**
```json
{
  "success": true,
  "offerId": 456
}
```

#### `offer:unsubscribe`
Unsubscribe from updates for a specific offer.

```javascript
socket.emit('offer:unsubscribe', { offerId: 456 });
```

**Response:**
```json
{
  "success": true,
  "offerId": 456
}
```

---

### 3. Admin Connection

**Description:** Receives all platform updates for administrative monitoring and management.

**Path:** `/wsa`

**Connection:**
```javascript
import { io } from 'socket.io-client';

const socket = io('wss://api.openpleb.com', {
  path: '/wsa',
  transports: ['websocket', 'polling'],
  auth: {
    adminToken: 'admin_token_here'
  }
});
```

**Authentication:**
The admin token is verified upon connection. If invalid, the connection is rejected.

**Events Received:**

All events from unauthenticated and BAT-authenticated connections, plus:

#### `admin:authenticated`
Emitted upon successful admin authentication.

```json
{
  "role": "admin",
  "authenticatedAt": 1706313600
}
```

#### `admin:user:registered`
Emitted when a new user registers.

```json
{
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "pubkey": "02a1b2c3d4e5f6...",
  "registeredAt": 1706313600
}
```

#### `admin:offer:all`
Emitted for all offer state changes across the platform.

```json
{
  "offerId": 456,
  "status": "RECEIPT_SUBMITTED",
  "makerId": "550e8400-e29b-41d4-a716-446655440000",
  "takerId": "660e8400-e29b-41d4-a716-446655440001",
  "updatedAt": 1706314000
}
```

#### `admin:dispute:created`
Emitted when any dispute is created.

```json
{
  "offerId": 456,
  "disputedBy": "taker",
  "disputedByPubkey": "02a1b2c3d4e5f6...",
  "reason": "Payment was sent but not acknowledged",
  "disputedAt": 1706314600
}
```

#### `admin:dispute:responded`
Emitted when any dispute receives a response.

```json
{
  "offerId": 456,
  "respondedBy": "maker",
  "response": "COUNTER",
  "respondedAt": 1706314800
}
```

#### `admin:system:alert`
Emitted for system-level alerts.

```json
{
  "type": "warning",
  "message": "High dispute rate detected",
  "details": {
    "disputeRate": 0.15,
    "threshold": 0.10
  },
  "timestamp": 1706315000
}
```

**Events Emitted:**

#### `admin:offer:subscribe:all`
Subscribe to all offer updates across the platform.

```javascript
socket.emit('admin:offer:subscribe:all');
```

**Response:**
```json
{
  "success": true,
  "subscribedAt": 1706313600
}
```

#### `admin:offer:unsubscribe:all`
Unsubscribe from all offer updates.

```javascript
socket.emit('admin:offer:unsubscribe:all');
```

**Response:**
```json
{
  "success": true,
  "unsubscribedAt": 1706313700
}
```

#### `admin:user:subscribe`
Subscribe to updates for a specific user.

```javascript
socket.emit('admin:user:subscribe', { 
  userId: '550e8400-e29b-41d4-a716-446655440000' 
});
```

**Response:**
```json
{
  "success": true,
  "userId": "550e8400-e29b-41d4-a716-446655440000"
}
```

---

### Connection Management

**Reconnection:**
Socket.IO automatically handles reconnection with exponential backoff. BAT tokens are re-verified on reconnection.

**Disconnection:**
```javascript
socket.on('disconnect', (reason) => {
  console.log('Disconnected:', reason);
  // Reasons: 'io server disconnect', 'io client disconnect', 'ping timeout', 'transport close', 'transport error'
});
```

**Error Handling:**
```javascript
socket.on('connect_error', (error) => {
  console.error('Connection error:', error.message);
  // Handle authentication errors, network issues, etc.
});
```

**Multiple Connections:**
Clients can maintain both unauthenticated and BAT-authenticated connections simultaneously:

```javascript
// Public updates
const publicSocket = io('wss://api.openpleb.com', {
  path: '/ws'
});

// Authenticated updates
const authSocket = io('wss://api.openpleb.com', {
  path: '/wsba',
  auth: { token: batToken }
});
```

This allows clients to receive public offer updates while also getting personalized session updates.

---

### Socket.IO Client Examples



**Svelte Example:**
```javascript
import { onMount, onDestroy } from 'svelte';
import { io } from 'socket.io-client';

let socket;

onMount(() => {
  socket = io('https://api.openpleb.com', {
    auth: { token: batToken }
  });

  socket.on('offer:maker:claimed', (data) => {
    // Handle offer claimed
  });
});

onDestroy(() => {
  socket?.close();
});
```

---

## Error Responses

All error responses follow this format:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {}  // Optional additional details
  }
}
```

### Common Error Codes

- `INVALID_SIGNATURE` - Cryptographic signature verification failed
- `EXPIRED_TIMESTAMP` - Request timestamp is too old (>60 seconds)
- `INVALID_INVITE_CODE` - Invite code is invalid or expired
- `PUBKEY_ALREADY_REGISTERED` - Public key is already associated with a user
- `UNAUTHORIZED` - Authentication required or failed
- `FORBIDDEN` - Insufficient permissions
- `NOT_FOUND` - Resource not found
- `CONFLICT` - Resource conflict (e.g., duplicate entry)
- `VALIDATION_ERROR` - Request validation failed
- `RATE_LIMIT_EXCEEDED` - Too many requests

---

## Rate Limiting

All endpoints are rate-limited:

- **Anonymous requests:** 100 requests per 15 minutes
- **Authenticated requests:** 1000 requests per 15 minutes
- **Admin requests:** 5000 requests per 15 minutes

Rate limit headers are included in all responses:
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1706314500
```

---

## Versioning

The API uses URL versioning. The current version is `v1`. Breaking changes will result in a new version (e.g., `v2`).

---

## Notes

1. All timestamps are Unix timestamps in seconds unless otherwise specified
2. All amounts are in the smallest unit (satoshis for Bitcoin, cents/smallest denomination for fiat)
3. Conversion rates are represented as satoshis per fiat unit multiplied by 100,000,000
4. All cryptographic operations use Schnorr signatures with secp256k1 curve
5. Image data should be base64-encoded with appropriate MIME type prefix
6. The platform uses Cashu tokens for reward distribution and Blind Authentication Tokens (BAT)
7. **Authentication Flow:**
   - User registration uses public key + signature (one-time only)
   - OIDC authentication handled externally by nostr-oidc and Cashu mint
   - Mint verifies pubkey registration via OIDC API endpoint
   - BAT obtained from Cashu mint after OIDC authentication
   - **BAT used directly for all authenticated operations on OpenPleb**
   - BAT included in Authorization header
   - BAT verified with mint only when opening session (one-time)
   - Subsequent requests check sessions table in backend database
   - **No user profiles exist** - OpenPleb is a fully blinded system
8. **Public endpoints** (no authentication required):
   - List offers with status `INVOICE_PAID` (`GET /offers`)
   - Get offer details for status `INVOICE_PAID` (`GET /offers/:id`)
   - List fiat providers (`GET /fiat-providers`)
   - Platform stats (`GET /stats`)
   - Platform config (`GET /config`)
   - Note: Offers in `CREATED` or `INVOICE_CREATED` status require maker's BAT
   - Note: Offers in claimed statuses require maker's or taker's BAT
9. **BAT-required endpoints:**
   - Create offer (`POST /offers`)
   - Claim offer (`POST /offers/:id/claim`)
   - View offers in `CREATED` or `INVOICE_CREATED` status (maker only)
   - View claimed offers (only maker/taker BATs)
   - All offer state-changing operations (pay, submit receipt, complete, dispute, etc.)
10. **Offer Privacy:**
    - **`CREATED` status**: Only visible to maker (waiting for maker to pay bond and escrow)
    - **`INVOICE_CREATED` status**: Only visible to maker (waiting for taker to pay bond)
    - **`INVOICE_PAID` status**: Public - anyone can view, but claiming requires BAT authentication
    - **All statuses after claiming**: Private - only maker, taker, and admins can view
    - This protects sensitive information during offer setup and active trades
11. **BAT Usage:**
    - BATs are obtained from the Cashu mint and used directly as authentication
    - BAT verified with mint only when opening session (one-time)
    - Session created in backend sessions table with expiration time
    - Subsequent requests check sessions table for validity
    - Once session expires, it cannot be reused
    - Platform tracks session state to prevent replay attacks
    - **BAT tokens are sensitive credentials and are NEVER included in API responses**
    - The platform internally tracks BAT-to-offer associations without exposing tokens
    - This prevents BAT theft and ensures only the rightful owner can use their authentication
12. **Reputation System:**
    - Users earn reputation tokens upon successful trade completion (no disputes)
    - Reputation tokens are ecash tokens with "reputation" as backing value
    - Each successful trade earns 1 reputation point
    - Users can stake reputation tokens when creating or claiming offers
    - Staked reputation demonstrates trustworthiness and commitment
    - Staked reputation is returned upon successful completion along with new reputation
    - Traditional trade stats are not available due to blinded interactions
    - **Reputation token verification and burning is a backend internal operation** (not exposed as API endpoint)
    - Backend verifies and burns staked reputation tokens, then issues new ones after successful completion
13. **Dispute Privacy Trade-off:**
    - Initiating a dispute requires revealing your pubkey to the platform
    - Pubkeys are used to lock ecash refunds/rewards after dispute settlement
    - Dispute stats (total, won, lost, pending) are tracked per pubkey
    - This is necessary for dispute resolution and preventing abuse
    - Users should consider this privacy trade-off before initiating disputes
