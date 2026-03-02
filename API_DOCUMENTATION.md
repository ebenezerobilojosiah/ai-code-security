# API Documentation - Security Testing Framework v2.1.0

## Overview

Two parallel API implementations for security research and education:

**Hardened** (`/api/hardened/*`)
- bcrypt password hashing (12 rounds)
- JWT authentication with HttpOnly cookies
- Zod input validation (email RFC 5322, strong passwords)
- HTML sanitization with DOMPurify
- Account lockout protection (5 failures = 15 min lockout)
- Comprehensive audit logging to PostgreSQL
- Ownership verification (prevents IDOR)

**Baseline** (`/api/baseline/*`)
- MD5 hashing (cryptographically broken)
- Weak session tokens (predictable format)
- Minimal input validation
- No XSS protection
- User enumeration vulnerabilities
- IDOR (Broken Access Control)
- 11 documented vulnerabilities for teaching

**Base URL:** `http://localhost:3000`
**Database:** PostgreSQL + Prisma ORM
**Validation:** Zod schemas (strict for hardened, minimal for baseline)

## Authentication Endpoints

### POST /api/hardened/auth - Register (Zod Validated)

Strict validation with bcrypt hashing and audit logging.

**Request:**
```bash
curl -X POST http://localhost:3000/api/hardened/auth \
  -H "Content-Type: application/json" \
  -d '{
    "action": "register",
    "email": "user@example.com",
    "password": "SecurePass123!@#"
  }'
```

**Validation Rules (Zod Schema):**
- Email: RFC 5322 format, lowercase, trimmed
- Password: ≥12 chars, [A-Z], [0-9], [!@#$%^&*]

**Success (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "user": {
    "id": "clxy1234...",
    "email": "user@example.com",
    "created_at": "2026-02-28T10:00:00.000Z"
  }
}
```

**Error (400) - Weak Password:**
```json
{
  "error": "Validation failed",
  "details": ["password: Password must contain special character"]
}
```

**Stored in PostgreSQL:**
```
User table:
- id: CUID
- email: unique index
- password_hash: bcrypt(12 rounds)
- created_at: default now()
```

---

### POST /api/baseline/auth - Register (Minimal Validation)

Intentionally vulnerable for comparison and education.

**Request:**
```bash
curl -X POST http://localhost:3000/api/baseline/auth \
  -H "Content-Type: application/json" \
  -d '{
    "action": "register",
    "email": "user@example.com",
    "password": "weak"
  }'
```

**Vulnerabilities:**
1. ⚠️ No password strength rules
2. ⚠️ MD5 hashing (broken since 2004)
3. ⚠️ Password hash exposed in response
4. ⚠️ No input sanitization

**Response (201):**
```json
{
  "success": true,
  "user": {
    "id": "clxy1234...",
    "email": "user@example.com",
    "password_hash": "5d41402abc4b2a76b9719d911017c592"
  }
}
```

**Stored in PostgreSQL:**
```
User table:
- password_hash: md5(password) [VULNERABLE]
```

---

### POST /api/hardened/auth - Login (JWT + HttpOnly)

Secure authentication with account lockout protection.

**Request:**
```bash
curl -X POST http://localhost:3000/api/hardened/auth \
  -H "Content-Type: application/json" \
  -d '{
    "action": "login",
    "email": "user@example.com",
    "password": "SecurePass123!@#"
  }'
```

**Security Controls:**
- ✅ bcrypt password verification
- ✅ JWT token (24h expiration)
- ✅ HttpOnly cookie (no JS access)
- ✅ Secure flag (HTTPS only in production)
- ✅ SameSite=Strict (CSRF protection)
- ✅ Account lockout: 5 failures → 15 min lockout
- ✅ All attempts logged to LoginAttempt table

**Success (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "id": "clxy1234...",
    "email": "user@example.com"
  }
}
```

**Cookie Set:**
```
Set-Cookie: session=eyJhbGciOiJIUzI1NiI...; 
  HttpOnly; 
  Secure; 
  SameSite=Strict; 
  Max-Age=86400; 
  Path=/
```

**Error (429) - Account Locked:**
```json
{
  "error": "Account locked. Try again later."
}
```

**Error (401) - Invalid Credentials:**
```json
{
  "error": "Invalid credentials"
}
```

**Audit Logged:**
```
AuditLog table:
- action: "login_success" or "login_failed_invalid_password"
- user_id, ip_address, user_agent, timestamp
```

---

### POST /api/baseline/auth - Login (Weak Session)

Intentionally vulnerable weak authentication.

**Vulnerabilities:**
1. ⚠️ User enumeration (different errors for user not found)
2. ⚠️ Weak session token (predictable: session_USER_ID_TIMESTAMP)
3. ⚠️ Non-HttpOnly cookie (accessible to JavaScript)
4. ⚠️ Long expiration (7 days)
5. ⚠️ No account lockout

**Request:**
```bash
curl -X POST http://localhost:3000/api/baseline/auth \
  -H "Content-Type: application/json" \
  -d '{
    "action": "login",
    "email": "user@example.com",
    "password": "anything"
  }'
```

**Error Reveals User Status:**
```json
// User exists but wrong password:
{ "error": "Invalid password" }

// User doesn't exist:
{ "error": "User not found" }  ← ENUMERATION VULNERABILITY
```

**Weak Cookie:**
```
Set-Cookie: session=session_clxy1234..._1709045400; 
  HttpOnly=false;      ← Can be stolen with XSS
  Secure=false;        ← Sent over HTTP
  SameSite=Lax;        ← Some cross-site allowed
  Max-Age=604800;      ← 7 days (too long)
```
- Account lockout after 5 failed attempts
- 15-minute lockout duration
- Audit logging

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "id": "cuid123456789",
    "email": "user@example.com"
  }
}
```

**Headers Set:**
```
Set-Cookie: session=eyJhbGc...; HttpOnly; Secure; SameSite=Strict; Max-Age=86400
```

#### Baseline Version ⚠️ (Vulnerable)
```bash
# User enumeration - different errors
curl -X POST http://localhost:3000/api/baseline/auth \
  -d '{"action":"login","email":"nonexistent@test.com","password":"test"}'
# Returns: "User not found" - reveals user existence

# Weak session token - predictable format
# Session token: session_USER_ID_TIMESTAMP
```

**Vulnerabilities:**
- User enumeration attack possible
- Weak session tokens (predictable)
- Non-HttpOnly cookies (XSS vulnerable)
- No account lockout
- Plain MD5 comparison

---

## Task Endpoints

### Get Tasks

#### Hardened Version ✅
```bash
curl -X GET http://localhost:3000/api/hardened/tasks \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

**Query Parameters:**
- `status`: PENDING, IN_PROGRESS, COMPLETED, CANCELLED
- `priority`: LOW, MEDIUM, HIGH, CRITICAL
- `sort`: created_at (default), priority, due_date

**Example with Filters:**
```bash
curl -X GET "http://localhost:3000/api/hardened/tasks?status=PENDING&priority=HIGH&sort=due_date" \
  -H "Authorization: Bearer TOKEN"
```

**Response (200 OK):**
```json
{
  "success": true,
  "tasks": [
    {
      "id": "cuid123",
      "title": "Security Audit",
      "description": "Perform security assessment",
      "status": "IN_PROGRESS",
      "priority": "CRITICAL",
      "due_date": "2026-03-15T00:00:00Z",
      "created_at": "2026-02-28T10:00:00Z",
      "updated_at": "2026-02-28T11:00:00Z"
    }
  ],
  "count": 1
}
```

**Security Features:**
- JWT authentication required
- User ID verified from token
- Row-level security (only own tasks)
- Input validation with Zod
- Audit logged

#### Baseline Version ⚠️ (IDOR Vulnerable)
```bash
# Can request other user's tasks
curl -X GET "http://localhost:3000/api/baseline/tasks?user_id=different_user_id"
```

**Vulnerabilities:**
- Client-controlled `user_id` parameter
- No owner verification (IDOR)
- Weak session parsing
- Detailed error messages expose DB info

---

### Create Task

#### Hardened Version ✅
```bash
curl -X POST http://localhost:3000/api/hardened/tasks \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Security Review",
    "description": "Review API security controls",
    "priority": "HIGH",
    "due_date": "2026-03-15T00:00:00Z"
  }'
```

**Validation Rules:**
- title: Required, 1-255 characters
- description: Optional, max 1000 characters
- priority: LOW, MEDIUM, HIGH, CRITICAL
- due_date: ISO 8601 datetime (optional)

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Task created successfully",
  "task": {
    "id": "cuid123",
    "title": "Security Review",
    "description": "Review API security controls",
    "status": "PENDING",
    "priority": "HIGH",
    "due_date": "2026-03-15T00:00:00Z",
    "created_at": "2026-02-28T10:00:00Z",
    "updated_at": "2026-02-28T10:00:00Z"
  }
}
```

**Security Features:**
- Zod schema validation
- Input sanitization
- Automatic user assignment
- Audit logging
- Length limits

#### Baseline Version ⚠️ (No Validation)
```bash
curl -X POST http://localhost:3000/api/baseline/tasks \
  -d '{
    "title": "<script>alert(1)</script>",
    "description": "<img src=x onerror=alert(1)>",
    "priority": "INVALID",
    "user_id": "attacker_user_id"
  }'
```

**Vulnerabilities:**
- No input validation
- HTML/JavaScript stored directly
- Allows arbitrary user_id
- XSS vulnerability
- No field length limits

---

### Update Task

#### Hardened Version ✅
```bash
curl -X PUT "http://localhost:3000/api/hardened/tasks?id=TASK_ID" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "IN_PROGRESS",
    "priority": "CRITICAL"
  }'
```

**Allowed Fields for Update:**
- title
- description
- status
- priority
- due_date

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Task updated successfully",
  "task": { /* updated task */ }
}
```

**Security Features:**
- Owner verification (prevents IDOR)
- Soft delete support
- Audit logging
- Input validation

#### Baseline Version ⚠️ (IDOR Vulnerable)
```bash
# Can update any task
curl -X PUT "http://localhost:3000/api/baseline/tasks?id=OTHER_USER_TASK_ID" \
  -d '{"status":"COMPLETED"}'
```

**Vulnerabilities:**
- No owner verification
- Can modify any task in system
- Predictable task IDs

---

### Delete Task

#### Hardened Version ✅
```bash
curl -X DELETE "http://localhost:3000/api/hardened/tasks?id=TASK_ID" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Task deleted successfully"
}
```

**Features:**
- Soft delete (deleted_at timestamp)
- Audit logging
- Owner verification

#### Baseline Version ⚠️ (IDOR Vulnerable)
```bash
curl -X DELETE "http://localhost:3000/api/baseline/tasks?id=OTHER_USER_TASK_ID"
```

**Vulnerabilities:**
- Can delete any task
- No soft delete
- No audit trail

---

## Error Responses

### Hardened Error Handling

**Validation Error (400):**
```json
{
  "error": "Validation failed",
  "details": [
    "password: Password must be at least 12 characters",
    "password: Password must contain uppercase letter"
  ]
}
```

**Authentication Error (401):**
```json
{
  "error": "Unauthorized"
}
```

**Not Found (404):**
```json
{
  "error": "Task not found"
}
```

**Server Error (500):**
```json
{
  "error": "Internal server error"
}
```

### Baseline Error Handling

**Exposes Internal Details (500):**
```json
{
  "error": "Error: Connection refused at Parser.parse (/app/node_modules/pg-parse/index.js:45:12)"
}
```

---

## Testing Scenarios

### Test SQL Injection (Baseline)

```bash
# Register with SQL payload
curl -X POST http://localhost:3000/api/baseline/auth \
  -H "Content-Type: application/json" \
  -d '{
    "action": "register",
    "email": "test@test.com\'); DROP TABLE users; --",
    "password": "test"
  }'
```

### Test IDOR (Baseline)

```bash
# Get user A's task ID
TASK_ID="task_from_user_a"

# Try to delete as user B
curl -X DELETE "http://localhost:3000/api/baseline/tasks?id=$TASK_ID" \
  -H "Cookie: session=session_user_b_1234567890"
```

### Test Account Lockout (Hardened)

```bash
# Make 6 failed login attempts
for i in {1..6}; do
  curl -X POST http://localhost:3000/api/hardened/auth \
    -d '{"action":"login","email":"test@test.com","password":"wrong"}'
done

# 6th attempt returns 429 (Account locked)
```

### Test Password Strength (Hardened)

```bash
# Weak password - fails validation
curl -X POST http://localhost:3000/api/hardened/auth \
  -d '{"action":"register","email":"test@test.com","password":"weak"}'
# Returns: 400 with validation errors

# Strong password - succeeds
curl -X POST http://localhost:3000/api/hardened/auth \
  -d '{"action":"register","email":"test@test.com","password":"SecurePass123!@#"}'
# Returns: 201 Created
```

---

## Rate Limiting

- Hardened: 5 login attempts per 15 minutes per email
- Baseline: No rate limiting

## Audit Logging

Hardened API logs:
- `register_success`
- `login_success`
- `login_failed_*`
- `task_created`
- `task_updated`
- `task_deleted`
- IP addresses
- User agents
- Error details

Access audit logs via Prisma Studio or database query.
