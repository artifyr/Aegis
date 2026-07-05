# AEGIS — Security Checklist
> Use this before every major release, after adding new API routes, or when onboarding new contributors.
> Each section maps to a vulnerability class discovered during the Jul 2026 audit.

---

## 1. API Route Authentication

Every API route must be protected. Run this checklist whenever a new `route.ts` is created.

- [ ] **Middleware coverage** — Confirm `src/middleware.ts` matcher includes the new route. The matcher must **not** exclude `/api/*` globally.
- [ ] **No unauthenticated GET/POST** — Open each `route.ts` and verify it either:
  - Is listed in `PUBLIC_API_ROUTES` in `middleware.ts` (only `/api/auth/*` should be here), **or**
  - Calls `getAuthRole()` from `@/lib/auth` at the very top of the handler and returns `401` if `null`.
- [ ] **Grep check** — Run the following and confirm every result either contains `getAuthRole` or is in the public list:
  ```bash
  grep -rL "getAuthRole" src/app/api --include="route.ts"
  ```
- [ ] **Manual test** — Log out, then curl or use the browser to hit a protected endpoint directly. Expect `401`, not data.

---

## 2. Role-Based Access Control (Admin vs Guest)

- [ ] **AI endpoints are admin-only** — `/api/ai/briefing` and `/api/ai/analyze` must return `401` if `getAuthRole()` returns `'guest'` or `null`.
- [ ] **No UI-only gating** — Never rely on `localStorage.aegis_role` alone for access control. The UI may hide panels but the API must enforce it independently.
- [ ] **Guest login produces correct cookie** — Login as guest -> check DevTools -> `aegis_auth_token` should be `authenticated_aegis_session_guest`.
- [ ] **Admin login produces correct cookie** — Login as 0bserver -> `aegis_auth_token` should be `authenticated_aegis_session_admin`.

---

## 3. Login Endpoint Hardening

File: `src/app/api/auth/login/route.ts`

- [ ] **isGuest must be strict boolean** — Code must read `body.isGuest === true`. Never use loose truthiness.
- [ ] **Username and password are typed strings** — Verify inputs are cast: `typeof body.username === 'string'`.
- [ ] **No credential reflection in errors** — 401 response must say `"Invalid credentials"` only.
- [ ] **Guest credentials are in env** — `GUEST_USER` and `GUEST_PASS` must be environment variables, not hardcoded.
- [ ] **Brute force** — No per-IP login rate limiting currently. Add if app becomes publicly discoverable.

---

## 4. Cookie Security

- [ ] `httpOnly: true` — Cookie is not readable from JavaScript.
- [ ] `sameSite: 'strict'` — Cookie is not sent on cross-site requests (CSRF protection).
- [ ] `secure: true` in production — Cookie only sent over HTTPS.
- [ ] `maxAge` is set — Session expires (currently 7 days).
- [ ] **Logout clears cookie** — After `/api/auth/logout`, cookie must be absent in DevTools.

---

## 5. HTTP Security Headers

File: `next.config.ts` — Verify all headers apply to `source: '/(.*)'`:

- [ ] `Strict-Transport-Security` with `max-age` >= 31536000
- [ ] `X-Frame-Options: SAMEORIGIN` (prevents clickjacking)
- [ ] `X-Content-Type-Options: nosniff` (prevents MIME sniffing)
- [ ] `Referrer-Policy: strict-origin-when-cross-origin`
- [ ] `Permissions-Policy` (deny camera, mic, geolocation)
- [ ] `X-XSS-Protection: 1; mode=block`

**Verify in browser:** DevTools -> Network -> any page response -> Headers tab. All 6 must appear.

---

## 6. Input Validation

- [ ] **Numeric query params are clamped** — Any `parseFloat(searchParams.get(...))` must check `isNaN()`/`isFinite()` and clamp to a sensible range.
- [ ] **String inputs are trimmed** — Usernames/queries must be `.trim()`-ed before comparison.
- [ ] **No eval / dynamic code** — Search server-side code:
  ```bash
  grep -rn "eval\|new Function\|innerHTML" src/app/api --include="*.ts"
  ```

---

## 7. SSRF (Server-Side Request Forgery)

- [ ] **Domain allowlist is strict** — `proxy-tiles` only allows `*.mapbox.com` and `*.cartocdn.com`.
- [ ] **No new open proxy endpoints** — Any route that fetches a client-supplied URL must validate against a strict allowlist.
- [ ] **No localhost in production allowlist** — The CCTV `ensureHttps` helper allows `localhost` through; confirm this is dev-only.

---

## 8. Injection Vulnerabilities

- [ ] **SPARQL** — Country name in `region-dossier/route.ts` sanitized with `replace(/\\/g,'\\\\').replace(/"/g,'\\"')` before interpolation.
- [ ] **SQL** — All DB access via Supabase client (parameterized). No raw SQL string concatenation:
  ```bash
  grep -rn "\.rpc\|pg\.query" src --include="*.ts"
  ```
- [ ] **XSS** — No `dangerouslySetInnerHTML` with user content:
  ```bash
  grep -rn "dangerouslySetInnerHTML" src --include="*.tsx"
  ```

---

## 9. Secrets and Environment Variables

- [ ] **No secrets in client bundle** — `AUTH_USER`, `AUTH_PASS`, `GUEST_USER`, `GUEST_PASS`, `GEMINI_API_KEY_*`, `AIS_API_KEY` must NOT be prefixed `NEXT_PUBLIC_`.
- [ ] **`.env` is gitignored** — `git status` must not show `.env` or `.env.local` as tracked.
- [ ] **Vercel env vars** — All secrets in `.env` must exist in Vercel project settings.
- [ ] **No hardcoded secrets** — Search codebase:
  ```bash
  grep -rn "password.*=.*[\"'][a-zA-Z0-9]\|api_key.*=.*[\"']" src --include="*.ts" --include="*.tsx" -i
  ```

---

## 10. Rate Limiting

- [ ] **AI endpoints** — `/api/ai/analyze` and `/api/ai/briefing` enforce 5 req/min per IP.
- [ ] **Login endpoint** — Currently unrate-limited. Add rate limiter before going fully public.
- [ ] **Future** — Replace in-memory `Map` rate limiter with Upstash Redis for serverless persistence.

---

## 11. Client-Side Security

- [ ] **localStorage is UI-only** — `aegis_role` in `localStorage` only shows/hides UI, never makes security decisions.
- [ ] **No sensitive data in localStorage** — Only `aegis_role` (non-secret) and `aegis_ai_briefing` (cached output). No tokens, passwords, or API keys.
- [ ] **Logout clears localStorage** — `TopNavBar.tsx` logout handler calls `localStorage.removeItem('aegis_role')`.

---

## 12. Dependency Security

Run before every release:

```bash
npm audit --audit-level=high
```

- [ ] No critical vulnerabilities.
- [ ] No high vulnerabilities unless documented.
- [ ] Keep `next`, `react`, `mapbox-gl`, `@supabase/ssr` up to date.

---

## Quick Audit Command Cheatsheet

```bash
# 1. Find API routes without auth checks
grep -rL "getAuthRole" src/app/api --include="route.ts"

# 2. Find potential secrets
grep -rn "password\|secret\|api_key\|apikey" src --include="*.ts" --include="*.tsx" -i

# 3. Find dangerouslySetInnerHTML usage
grep -rn "dangerouslySetInnerHTML" src --include="*.tsx"

# 4. Find eval/dynamic code execution
grep -rn "eval\|new Function" src --include="*.ts" --include="*.tsx"

# 5. Find unvalidated parseFloat calls
grep -rn "parseFloat\|parseInt" src/app/api --include="route.ts"

# 6. Check for raw SQL interpolation
grep -rn "\.rpc\|\.query\" src --include="*.ts"

# 7. Confirm isGuest is strictly typed
grep "isGuest" src/app/api/auth/login/route.ts

# 8. Check npm vulnerabilities
npm audit --audit-level=high
```

---

*Last updated: 2026-07-06 | Based on full audit of Aegis v1.x*
