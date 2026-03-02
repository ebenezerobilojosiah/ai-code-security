# Quick Start Guide - v2.1.0

## 5-Minute Setup

### 1. Clone & Install
```bash
pnpm install
cp .env.example .env.local
```

### 2. Configure Database

**Option A: Local PostgreSQL (fastest)**
```bash
psql -U postgres

CREATE DATABASE security_testing;
CREATE USER sec_user WITH PASSWORD 'SecurePass123!';
GRANT ALL PRIVILEGES ON DATABASE security_testing TO sec_user;
\q
```

Update `.env.local`:
```env
DATABASE_URL="postgresql://sec_user:SecurePass123!@localhost:5432/security_testing"
JWT_SECRET="your-secret-key-min-32-chars"
```

**Option B: Vercel Postgres (cloud)**
Visit vercel.com/storage → Create Postgres → Copy URL to DATABASE_URL

### 3. Migrate & Run
```bash
pnpm prisma migrate dev --name init
pnpm dev
```

Visit `http://localhost:3000`

---

## Testing the APIs

### In Browser (Recommended)

1. **Testing Terminal Tab**
   - Type curl commands dynamically
   - Real-time responses with syntax highlighting
   - Pre-loaded templates for hardened & baseline

2. **Security Analysis Tab**
   - Side-by-side comparison of 11 vulnerabilities
   - Hardened vs Baseline scores
   - Visual security indicators

### Example Commands (Copy-Paste Ready)

**Register User (Hardened)**
```bash
curl -X POST http://localhost:3000/api/hardened/auth \
  -H "Content-Type: application/json" \
  -d '{"action":"register","email":"test@example.com","password":"SecurePass123!@#"}'
```

**Register User (Baseline - Weak)**
```bash
curl -X POST http://localhost:3000/api/baseline/auth \
  -H "Content-Type: application/json" \
  -d '{"action":"register","email":"test@example.com","password":"weak"}'
```

**Test User Enumeration (Baseline)**
```bash
# Returns "User not found" (reveals user doesn't exist)
curl -X POST http://localhost:3000/api/baseline/auth \
  -H "Content-Type: application/json" \
  -d '{"action":"login","email":"nonexistent@example.com","password":"test"}'
```

**Test IDOR (Baseline)**
```bash
# Try to access another user's tasks
curl -X GET "http://localhost:3000/api/baseline/tasks?user_id=other_user_id"
```

---

## Database Schema

4 tables in PostgreSQL (managed by Prisma):

**User** - Authentication
- id (CUID), email (unique), password_hash, timestamps

**Task** - Work items
- id, user_id (FK), title, description, status, priority

**LoginAttempt** - Security
- Tracks login attempts for account lockout (5 failures = 15 min)
- Used by hardened API only

**AuditLog** - Compliance
- Logs: login_success, login_failed, register_success, errors
- IP address, user agent, timestamp tracking

View with: `pnpm prisma studio`

---

## API Endpoints

### Hardened (✅ Secure)
```
POST /api/hardened/auth
  - Register: strong password validation (Zod)
  - Login: bcrypt verification, JWT token, account lockout

POST /api/hardened/tasks
  - Create task: ownership verified, XSS sanitized
```

### Baseline (⚠️ Vulnerable)
```
POST /api/baseline/auth
  - Register: weak password (MD5 hash exposed)
  - Login: user enumeration, weak session token

POST /api/baseline/tasks
  - IDOR: can access/modify any user's tasks
  - XSS: no sanitization
GET  /api/baseline/tasks         - Fetch tasks (exploitable)
POST /api/baseline/tasks         - Create task (XSS vulnerable)
PUT  /api/baseline/tasks         - Update task (IDOR flaw)
DELETE /api/baseline/tasks       - Delete task (no access control)
```

## Testing Examples

### Example 1: Password Strength Comparison
**Terminal Command:**
```bash
curl -X POST "http://localhost:3000/api/hardened/auth" \
  -H "Content-Type: application/json" \
  -d '{"action":"register","email":"test@example.com","password":"SecurePass123!@#"}'
```
**Result**: Success ✓ (strong password accepted)

**Baseline:**
```bash
curl -X POST "http://localhost:3000/api/baseline/auth" \
  -H "Content-Type: application/json" \
  -d '{"action":"register","email":"test@example.com","password":"weak"}'
```
**Result**: Success ✗ (weak password accepted - vulnerability!)

### Example 2: User Enumeration
**Hardened**: Both queries return "Invalid credentials"
**Baseline**: Returns different errors - reveals user existence

### Example 3: Broken Access Control (IDOR)
**Hardened**: Can only modify own tasks
**Baseline**: Can modify any task (ownership not verified)

## Design Features

### Visual Elements
- **Dark Theme**: Deep space black background (professional)
- **Neon Glow**: Cyan accents with animation effects
- **Monospace Font**: Geist Mono for authentic terminal feel
- **Scanline Effect**: CRT monitor-style background animation
- **Border Glow**: Dynamic illumination on interactive elements

### Animations
- Neon pulse on highlights
- Smooth transitions between states
- Glitch effects on errors
- Data stream visualization
- Terminal text animations

## Key Security Concepts Demonstrated

### Hardened Version Implements
- Bcrypt password hashing (12 rounds)
- JWT authentication with secure cookies
- Input sanitization (XSS protection)
- Parameterized queries (SQL injection safe)
- Account lockout (brute force protection)
- Proper access control (no IDOR)
- Generic error messages (no info leakage)

### Baseline Version Shows
- MD5 hashing (broken)
- Weak session tokens
- No input sanitization
- String concatenation queries
- No rate limiting
- Missing access control
- Detailed error messages

## File Structure

```
app/
├── page.tsx                    # Main dashboard (hacker UI)
├── layout.tsx                  # App layout
├── globals.css                 # Hacker animations & theme
└── api/
    ├── hardened/
    │   ├── auth/route.ts       # Secure auth endpoint
    │   └── tasks/route.ts      # Secure task management
    └── baseline/
        ├── auth/route.ts       # Vulnerable auth endpoint
        └── tasks/route.ts      # Vulnerable task management

components/
├── HackerTerminal.tsx          # Terminal interface component
└── SecurityComparison.tsx      # Security analysis component

documentation/
├── HACKER_UI_GUIDE.md         # Complete design guide
├── QUICKSTART.md              # This file
├── VULNERABILITY_REGISTRY.md  # Detailed vulnerability list
├── IMPLEMENTATION_GUIDE.md    # Development instructions
└── README.md                  # Project overview
```

## Customization

### Change Neon Color
Edit `globals.css` and replace `rgba(34, 211, 238, *)` with your color:
- Green: `rgba(74, 222, 128, *)`
- Red: `rgba(239, 68, 68, *)`
- Purple: `rgba(168, 85, 247, *)`

### Adjust Terminal Speed
In `HackerTerminal.tsx`, modify animation delays:
```typescript
setTimeout(() => {
  // Change 500 to higher value for slower response
}, 500);
```

### Add New API Tests
In `HackerTerminal.tsx`, add to `predefinedCurls` array:
```typescript
{
  name: 'Your Test Name',
  endpoint: '/api/hardened/your-endpoint',
  method: 'POST',
  version: 'hardened',
  body: { /* test data */ },
}
```

## Performance Tips

- Terminal updates are optimized (auto-scroll on new messages)
- CSS animations use hardware acceleration
- Monospace font is system-installed (no network load)
- Minimal bundle size with Tailwind CSS v4

## Troubleshooting

### Terminal not responding
- Clear terminal with `clear` command
- Refresh page if stuck
- Check browser console for errors

### API endpoints not working
- Ensure dev server is running (`npm run dev`)
- Check that you're on `http://localhost:3000`
- Verify API route files exist in `/app/api/`

### Animations not smooth
- Check GPU acceleration is enabled in browser
- Try a different browser (Chrome/Firefox recommended)
- Reduce browser tabs if CPU limited

## Next Steps

1. **Explore the Terminal**: Click through predefined tests
2. **Compare Security**: Switch to analysis tab
3. **Read Full Docs**: See `HACKER_UI_GUIDE.md` for detailed info
4. **Test Custom APIs**: Write your own curl commands
5. **Review Code**: Check hardened vs baseline implementations

## Master's Project Quality

This implementation demonstrates:
- Professional cybersecurity interface design
- Full-stack Next.js development skills
- Security knowledge (hardened vs vulnerable patterns)
- UI/UX expertise (hacker-themed aesthetic)
- Code organization (separated hardened/baseline)

The combination of secure implementation, intentional vulnerabilities for comparison, and professional interface design creates an impressive research project suitable for Master's-level submission.

---

**Happy Testing!** 🔐

For detailed documentation, see:
- `HACKER_UI_GUIDE.md` - Complete design and architecture guide
- `VULNERABILITY_REGISTRY.md` - Detailed vulnerability analysis
- `IMPLEMENTATION_GUIDE.md` - Development and deployment guide
