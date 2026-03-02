# Complete Build & Deployment Guide

## 🚀 Project Overview

**Security Testing Framework v2.1.0** - A professional cybersecurity research platform with:
- Next.js 16 API routes with TypeScript
- PostgreSQL database with Prisma ORM
- Zod schema validation
- Dynamic hacker terminal interface
- Side-by-side hardened vs baseline vulnerability comparison
- Real-time curl command execution and response display
- Complete audit logging and security controls

## 📋 What's Included

### Backend
- **Hardened API** (`/api/hardened/`) - Production-ready secure implementation
  - bcrypt password hashing (12 rounds)
  - JWT token authentication
  - Zod schema validation
  - Access control verification (prevents IDOR)
  - Account lockout protection
  - Comprehensive audit logging
  - Input sanitization and HTML escaping
  - SQL injection prevention (parameterized queries)

- **Baseline API** (`/api/baseline/`) - Intentionally vulnerable for comparison
  - 11+ documented vulnerabilities
  - MD5 hashing (cryptographically broken)
  - No input validation
  - IDOR flaws
  - User enumeration possible
  - Weak session tokens
  - Stored XSS vulnerabilities

### Frontend
- **Hacker Terminal Component** - Real-time shell emulator
  - Execute custom curl commands dynamically
  - Real-time API response display
  - 8 pre-loaded curl templates
  - Shell-like command handling
  - Error handling and status codes
  - Request timing information
  - Full payload/header inspection

- **Security Comparison Component** - Vulnerability analysis
- **Professional Hacker UI** - Cyan neon theme with animations

### Database
- **PostgreSQL Schema** with 4 core tables
  - Users (with bcrypt hashing)
  - Tasks (with status/priority)
  - LoginAttempts (for security monitoring)
  - AuditLogs (comprehensive activity tracking)

## 🔧 Quick Setup (5 minutes)

### 1. Prerequisites
```bash
# Required:
- Node.js 18+ (https://nodejs.org/)
- PostgreSQL 12+ (https://www.postgresql.org/)
- pnpm or npm

# Verify installation:
node --version      # v18+
npm --version       # 9+
psql --version      # 12+
```

### 2. Install Dependencies
```bash
cd /vercel/share/v0-project
pnpm install
# or: npm install
```

### 3. Setup PostgreSQL Database
```bash
# Create database
psql -U postgres -c "CREATE DATABASE security_testing;"

# Create .env.local file
cat > .env.local << 'EOF'
DATABASE_URL="postgresql://postgres:password@localhost:5432/security_testing"
JWT_SECRET="change-this-to-a-long-random-string-in-production"
NODE_ENV="development"
EOF
```

### 4. Run Prisma Migrations
```bash
pnpm prisma generate
pnpm prisma migrate dev --name init
```

### 5. Start Development Server
```bash
pnpm dev
```

Visit `http://localhost:3000` in your browser.

## 🎮 Using the Hacker Terminal

### Built-in Commands
```bash
help                    # Show available commands
clear / cls             # Clear terminal
list-templates          # Show curl templates
load-template [number]  # Load a template
example                 # Show example commands
whoami                  # Current user
pwd                     # Current directory
ls                      # List files
echo [text]             # Print text
```

### Dynamic Curl Execution
```bash
# Type or paste any curl command directly
$ curl -X POST http://localhost:3000/api/hardened/auth \
  -H "Content-Type: application/json" \
  -d '{"action":"register","email":"user@test.com","password":"SecurePass123!@#"}'

# Terminal shows:
# > POST http://localhost:3000/api/hardened/auth
# > Headers: {"Content-Type": "application/json"}
# > Body: {"action":"register",...}
# < HTTP/201
# < Content-Type: application/json
# {response JSON}
# Response time: 234ms
```

### Quick Template Buttons
Click any template button to auto-load the curl command, then press Enter to execute.

## 📚 Documentation Files

| File | Purpose |
|------|---------|
| `DATABASE_SETUP.md` | PostgreSQL setup & configuration |
| `API_DOCUMENTATION.md` | Complete API endpoints reference |
| `VULNERABILITY_REGISTRY.md` | Detailed vulnerability analysis |
| `IMPLEMENTATION_GUIDE.md` | Security controls breakdown |
| `.env.example` | Environment variables template |

## 🏗️ Project Structure

```
/vercel/share/v0-project/
├── app/
│   ├── api/
│   │   ├── hardened/         # ✅ Secure API endpoints
│   │   │   ├── auth/route.ts
│   │   │   └── tasks/route.ts
│   │   └── baseline/         # ⚠️ Vulnerable API endpoints
│   │       ├── auth/route.ts
│   │       └── tasks/route.ts
│   ├── page.tsx              # Main dashboard
│   ├── layout.tsx            # App layout
│   └── globals.css           # Hacker theme styles
├── components/
│   ├── HackerTerminal.tsx    # Dynamic curl terminal
│   └── SecurityComparison.tsx # Vulnerability comparison
├── lib/
│   ├── prisma.ts             # Prisma client
│   └── validation.ts         # Zod schemas
├── prisma/
│   └── schema.prisma         # Database schema
├── DATABASE_SETUP.md         # Database guide
├── API_DOCUMENTATION.md      # API reference
└── package.json
```

## 🔐 Security Features (Hardened)

### Authentication & Authorization
- ✅ bcrypt password hashing (12 rounds)
- ✅ JWT token authentication
- ✅ HttpOnly, Secure, SameSite cookies
- ✅ Account lockout (5 attempts / 15 min)
- ✅ Owner verification (prevents IDOR)

### Input Validation
- ✅ Zod schema validation
- ✅ Email format validation
- ✅ Password strength requirements
- ✅ Field length limits
- ✅ HTML sanitization with DOMPurify

### Database Security
- ✅ Parameterized queries (Prisma ORM)
- ✅ User-scoped queries
- ✅ Soft deletes with timestamps
- ✅ Audit logging on all actions
- ✅ Login attempt tracking

### Error Handling
- ✅ Generic error messages (no information leakage)
- ✅ Proper HTTP status codes
- ✅ Detailed logging for debugging
- ✅ No stack traces in responses

## ⚠️ Vulnerabilities (Baseline - Educational)

### Authentication Flaws
- ❌ MD5 password hashing (cryptographically broken)
- ❌ Weak session tokens (predictable format)
- ❌ Non-HttpOnly cookies (XSS vulnerable)
- ❌ User enumeration possible
- ❌ No account lockout

### Access Control
- ❌ IDOR - can access/modify other users' tasks
- ❌ No owner verification
- ❌ Client-controlled user_id parameter

### Input Validation
- ❌ No input validation
- ❌ No HTML sanitization (Stored XSS)
- ❌ No field length limits
- ❌ Allows arbitrary user_id assignment

### Error Handling
- ❌ Detailed error messages expose DB info
- ❌ Stack traces in responses
- ❌ Different errors for user enumeration

## 📊 Testing Vulnerability Scenarios

### Test Password Security
```bash
# Hardened rejects weak password
curl -X POST http://localhost:3000/api/hardened/auth \
  -d '{"action":"register","email":"test@test.com","password":"weak"}'
# Returns: 400 Validation failed

# Baseline accepts weak password
curl -X POST http://localhost:3000/api/baseline/auth \
  -d '{"action":"register","email":"test@test.com","password":"weak"}'
# Returns: 201 Created
```

### Test Account Lockout (Hardened Only)
```bash
# Make 6 failed login attempts
for i in {1..6}; do
  curl -X POST http://localhost:3000/api/hardened/auth \
    -d '{"action":"login","email":"test@test.com","password":"wrong"}'
done

# 6th attempt returns 429 Locked
```

### Test IDOR (Baseline Only)
```bash
# Register two users and get their IDs
# Then try to access User A's tasks as User B:
curl -X GET "http://localhost:3000/api/baseline/tasks?user_id=USER_A_ID" \
  -H "Cookie: session=session_USER_B_TIMESTAMP"
# Baseline returns User A's tasks!
# Hardened returns 404 or empty list
```

### Test Stored XSS (Baseline)
```bash
curl -X POST http://localhost:3000/api/baseline/tasks \
  -H "Cookie: session=session_..." \
  -d '{"title":"<img src=x onerror=alert(1)>","description":"Test"}'
# Baseline stores the script tags
# Hardened sanitizes the input
```

## 🚀 Deployment

### Vercel (Recommended)
```bash
# Login to Vercel
vercel login

# Deploy
vercel --prod

# Set environment variables
vercel env add DATABASE_URL
vercel env add JWT_SECRET
```

### Docker
```bash
# Build image
docker build -t security-testing .

# Run container
docker run -p 3000:3000 \
  -e DATABASE_URL="..." \
  -e JWT_SECRET="..." \
  security-testing
```

### Manual VPS
```bash
# SSH to server
ssh user@server.com

# Clone repository
git clone <repo>
cd /app

# Install & build
pnpm install
pnpm build

# Run with PM2
pm2 start "pnpm start" --name "security-testing"
```

## 📈 Monitoring & Debugging

### View Database with Prisma Studio
```bash
pnpm prisma studio
# Opens http://localhost:5555
```

### Check Login Attempts
```bash
# Via Prisma Studio or SQL:
SELECT email, success, ip_address, created_at 
FROM login_attempt 
ORDER BY created_at DESC 
LIMIT 20;
```

### View Audit Log
```bash
SELECT action, resource, success, error_message, created_at 
FROM audit_log 
ORDER BY created_at DESC 
LIMIT 50;
```

### Check Response Times
```bash
# In terminal, look for "Response time: Xms"
# Hardened should be 50-200ms
# Baseline should be similar (vulnerabilities don't slow it down)
```

## 🧪 Running Tests

```bash
# Unit tests
pnpm test

# Integration tests
pnpm test:integration

# Load testing
pnpm test:load

# Security scanning
pnpm test:security
```

## 📝 API Testing Checklist

- [ ] **Registration**
  - [ ] Hardened rejects weak passwords
  - [ ] Baseline accepts any password
  - [ ] Hardened hashes with bcrypt
  - [ ] Baseline uses MD5
  
- [ ] **Login**
  - [ ] Hardened: Account lockout after 5 failures
  - [ ] Baseline: No lockout (brute force possible)
  - [ ] Hardened: HttpOnly cookies
  - [ ] Baseline: Accessible to JavaScript

- [ ] **Tasks (CRUD)**
  - [ ] Hardened: Cannot access other users' tasks
  - [ ] Baseline: Can request any user's tasks (IDOR)
  - [ ] Hardened: Input validation on title/description
  - [ ] Baseline: Accepts XSS payloads

- [ ] **Audit Logging**
  - [ ] All actions logged (hardened)
  - [ ] Includes IP & user agent
  - [ ] Can trace security incidents

## 🔍 Code Quality

```bash
# Lint code
pnpm lint

# Format code
pnpm format

# Type check
pnpm type-check

# Build check
pnpm build
```

## 📞 Support & Resources

- **Prisma Docs**: https://www.prisma.io/docs/
- **Next.js Docs**: https://nextjs.org/docs
- **Zod Validation**: https://zod.dev/
- **PostgreSQL**: https://www.postgresql.org/docs/
- **OWASP Top 10**: https://owasp.org/www-project-top-ten/
- **NIST SSDF**: https://csrc.nist.gov/projects/secure-software-development-framework/

## ✅ Verification Checklist

After setup, verify:
- [ ] PostgreSQL database created and accessible
- [ ] `.env.local` file created with DATABASE_URL
- [ ] Prisma migrations ran successfully
- [ ] Server starts at `http://localhost:3000`
- [ ] Terminal loads and accepts commands
- [ ] Can execute curl commands dynamically
- [ ] Hardened API registers users successfully
- [ ] Baseline API accepts weak passwords
- [ ] Audit logs are recorded
- [ ] Prisma Studio opens at `http://localhost:5555`

## 🎓 Learning Outcomes

This project demonstrates:
1. Secure API design patterns
2. Common vulnerability types (OWASP Top 10)
3. Input validation and sanitization
4. Password hashing and authentication
5. Authorization and access control
6. Audit logging and monitoring
7. Error handling best practices
8. SQL injection prevention
9. XSS attack prevention
10. Broken access control (IDOR) prevention

## 📄 License

For educational and research purposes only.

---

**Version:** 2.1.0  
**Last Updated:** 2026-02-28  
**Framework:** Next.js 16 + TypeScript + PostgreSQL + Prisma  
**Target:** Master's Level Cybersecurity Research
