# Security Guidelines for Subagents.sh

## Overview

This document outlines the security measures implemented in the Subagents.sh platform and provides guidelines for developers contributing to the project.

## Security Measures Implemented

### 1. Authentication & Authorization

- **OAuth 2.0 with PKCE**: GitHub OAuth integration with Proof Key for Code Exchange
- **Row Level Security (RLS)**: Implemented on all Supabase tables
- **JWT Token Management**: Secure token storage and refresh handling
- **Session Management**: Secure session handling with httpOnly cookies for refresh tokens

### 2. Input Validation & Sanitization

- **Zod Schema Validation**: Comprehensive input validation using Zod
- **HTML Sanitization**: DOMPurify integration for safe HTML rendering
- **SQL Injection Prevention**: Parameterized queries through Supabase client
- **XSS Protection**: Content sanitization and CSP headers

### 3. API Security

- **Rate Limiting**: Implemented on all API endpoints
- **CSRF Protection**: CSRF tokens for state-changing operations
- **Request Size Limits**: Protection against large payload attacks
- **Error Sanitization**: Production error messages don't expose internals

### 4. Security Headers

- **Content Security Policy (CSP)**: Strict CSP implementation
- **HSTS**: HTTP Strict Transport Security in production
- **X-Frame-Options**: Clickjacking protection
- **X-Content-Type-Options**: MIME type sniffing prevention
- **Cross-Origin Policies**: CORS, COEP, COOP, CORP headers

### 5. Data Protection

- **Encryption in Transit**: HTTPS everywhere
- **Secure Cookie Configuration**: Proper cookie flags (Secure, HttpOnly, SameSite)
- **Password Security**: Handled by Supabase Auth
- **Environment Variable Security**: Sensitive data in environment variables

## Security Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Client App    │    │   Next.js API   │    │   Supabase      │
│                 │    │                 │    │                 │
│ • CSP Headers   │◄──►│ • Rate Limiting │◄──►│ • RLS Policies  │
│ • Input Valid.  │    │ • CSRF Tokens   │    │ • Auth Service  │
│ • XSS Protection│    │ • Input Sanit.  │    │ • Encrypted DB  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Threat Model

### Assets Protected
1. User accounts and authentication data
2. Agent repository data and metadata
3. User reviews and ratings
4. Personal user information
5. GitHub integration tokens

### Threat Actors
1. **External Attackers**: Unauthorized access attempts
2. **Malicious Users**: Abuse of platform features
3. **Automated Bots**: Spam, scraping, DDoS attempts
4. **Insider Threats**: Unauthorized access by team members

### Attack Vectors Mitigated
1. **Injection Attacks**: SQL injection, XSS, command injection
2. **Authentication Attacks**: Brute force, credential stuffing
3. **Session Attacks**: Session hijacking, fixation
4. **CSRF Attacks**: Cross-site request forgery
5. **Data Exposure**: Information disclosure, enumeration

## Critical Security Vulnerabilities Fixed

### 1. Environment Variable Exposure (CRITICAL)
- **Issue**: Sensitive credentials in .env.local
- **Fix**: Credential rotation and secure management
- **Status**: ✅ Fixed with security documentation

### 2. Error Information Disclosure (HIGH)
- **Issue**: Stack traces and internal errors exposed to clients
- **Fix**: Production error sanitization
- **Status**: ✅ Fixed

### 3. Admin Endpoint Security (HIGH)
- **Issue**: Weak admin authentication
- **Fix**: Enhanced authentication and audit logging
- **Status**: ✅ Fixed

### 4. XSS in Structured Data (MEDIUM)
- **Issue**: Unsafe HTML injection in JSON-LD
- **Fix**: Input sanitization and validation
- **Status**: ✅ Fixed

### 5. Missing CSRF Protection (MEDIUM)
- **Issue**: State-changing operations vulnerable to CSRF
- **Fix**: CSRF token implementation
- **Status**: ✅ Fixed

## Security Best Practices

### For Developers

1. **Input Validation**
   ```typescript
   // ✅ Good: Always validate input
   const schema = z.object({
     name: z.string().min(1).max(100),
     email: z.string().email(),
   });
   const validated = schema.parse(input);

   // ❌ Bad: Using raw input
   const user = await db.users.create(rawInput);
   ```

2. **Error Handling**
   ```typescript
   // ✅ Good: Sanitized errors
   return NextResponse.json(
     { error: 'Invalid request' },
     { status: 400 }
   );

   // ❌ Bad: Exposing internals
   return NextResponse.json(
     { error: error.stack },
     { status: 500 }
   );
   ```

3. **Authentication**
   ```typescript
   // ✅ Good: Proper auth check
   const user = await getAuthenticatedUser(request);
   if (!user) {
     return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
   }

   // ❌ Bad: No auth check
   const user = request.headers.get('user-id');
   ```

### For Operations

1. **Environment Management**
   - Never commit .env files to version control
   - Use different credentials for each environment
   - Rotate credentials regularly
   - Use secure credential management systems

2. **Monitoring**
   - Monitor for suspicious activity patterns
   - Set up alerts for failed authentication attempts
   - Log security events for audit trails
   - Regular security reviews

3. **Deployment**
   - Use HTTPS in production
   - Enable all security headers
   - Configure proper CORS policies
   - Regular dependency updates

## Security Testing

### Static Analysis
- ESLint security rules
- Semgrep for vulnerability scanning
- Dependency vulnerability scanning with npm audit

### Dynamic Testing
- Regular penetration testing
- Automated security testing in CI/CD
- Manual security reviews for new features

### Tools Used
- **DOMPurify**: HTML sanitization
- **Zod**: Input validation
- **Supabase**: Database security and auth
- **Next.js**: Framework security features

## Incident Response

### In Case of Security Incident

1. **Immediate Response**
   - Contain the incident (block IPs, disable accounts)
   - Assess the scope and impact
   - Document the incident

2. **Investigation**
   - Analyze logs and traces
   - Identify root cause
   - Determine data impact

3. **Recovery**
   - Apply fixes and patches
   - Restore services if needed
   - Update security measures

4. **Post-Incident**
   - Document lessons learned
   - Update security procedures
   - Notify affected users if required

## Compliance

### Data Protection
- GDPR compliance for EU users
- User data deletion capabilities
- Privacy policy and terms of service

### Security Standards
- OWASP Top 10 mitigation
- NIST Cybersecurity Framework alignment
- Regular security assessments

## Contact

For security issues or questions:
- Email: security@subagents.sh
- Create a private security issue on GitHub
- Follow responsible disclosure guidelines

## Changelog

- **2025-01-XX**: Initial security implementation
- **2025-01-XX**: Fixed critical environment variable exposure
- **2025-01-XX**: Enhanced API security measures
- **2025-01-XX**: Added comprehensive input validation

---

⚠️ **Note**: This is a living document that should be updated as security measures evolve.