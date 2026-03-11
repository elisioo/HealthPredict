# Glucogu — Diabetes Risk Prediction System

## Secure Software Development Documentation

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Secure Coding Practices](#2-secure-coding-practices)
3. [Authentication and Authorization](#3-authentication-and-authorization)
4. [Data Encryption](#4-data-encryption)
5. [Input Validation and Sanitization](#5-input-validation-and-sanitization)
6. [Error Handling and Logging](#6-error-handling-and-logging)
7. [Access Control](#7-access-control)
8. [Code Auditing Tools](#8-code-auditing-tools)
9. [Testing](#9-testing)
10. [Security Policies](#10-security-policies)
11. [Incident Response Plan](#11-incident-response-plan)

---

## 1. Project Overview

### System Description

**Glucogu** is a web-based diabetes risk prediction system that uses a trained machine learning model (HistGradient Boosting Classifier) to assess a user's diabetes risk based on health metrics such as age, BMI, HbA1c level, blood glucose level, smoking history, and pre-existing conditions (hypertension and heart disease). The system provides a probability score, a risk level classification (Low / Moderate / High), and a positive/negative diabetes indication.

Beyond prediction, the system includes user account management, health profile storage, prediction history tracking, messaging between patients and staff, appointment scheduling, admin analytics dashboards, a reports module with PDF/CSV export, and comprehensive system logging.

### Purpose of the System

The system aims to:

- **Provide early diabetes risk assessment** — Enable users to evaluate their diabetes risk using a trained ML model without requiring a clinic visit.
- **Provide secure data management and access control** — Protect sensitive health data with role-based access, encrypted tokens, and hashed passwords.
- **Protect user accounts and system resources** — Enforce password complexity, login lockout after failed attempts, and session management with JWT tokens.
- **Prevent common cyber threats** — Defend against SQL injection (parameterized queries), unauthorized access (middleware guards), credential leakage (environment variables), XSS (Helmet security headers), brute-force attacks (rate limiting + CAPTCHA), and session hijacking (httpOnly cookies).
- **Facilitate patient–staff communication** — Provide a messaging system and appointment scheduling for follow-up care.
- **Give administrators full system visibility** — Offer dashboards, user management, system logs, and prediction reports.

### Intended Users

The system is designed for three distinct user roles:

| Role                        | DB Value      | Description                                                                                                                                                                                                                                 |
| --------------------------- | ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Patient (Health User)**   | `health_user` | End-users who create health profiles, submit diabetes risk predictions, view prediction history, message healthcare staff, and schedule appointments.                                                                                       |
| **Healthcare Staff**        | `staff`       | Medical professionals who view patient records, receive messages from patients, manage appointment statuses, and can run predictions on behalf of patients.                                                                                 |
| **Administrator**           | `admin`       | System administrators who manage all user accounts (activate, deactivate, unlock, change roles, schedule deletion), view system logs, view all predictions, monitor activity, manage messages, and access analytics dashboards and reports. |
| **Guest (Unauthenticated)** | N/A           | Visitors who can view the landing page and access the registration and login pages only.                                                                                                                                                    |

### Platform and Technology Used

| Component                | Technology                                                      | Version                     |
| ------------------------ | --------------------------------------------------------------- | --------------------------- |
| **Programming Language** | JavaScript (Node.js backend, React frontend), Python (ML model) | Node.js runtime, Python 3.x |
| **Backend Framework**    | Express.js                                                      | 5.2.1                       |
| **Frontend Framework**   | React                                                           | 19.2.4                      |
| **Frontend Routing**     | React Router                                                    | 7.13.1                      |
| **CSS Framework**        | Tailwind CSS                                                    | 4.1.11                      |
| **Database**             | MySQL / MariaDB                                                 | Via mysql2 3.18.2 driver    |
| **ML Model**             | scikit-learn HistGradientBoostingClassifier                     | scikit-learn 1.8.0          |
| **Authentication**       | JSON Web Tokens (JWT)                                           | jsonwebtoken 9.0.3          |
| **Password Hashing**     | bcrypt                                                          | bcryptjs 3.0.3              |
| **Platform**             | Web Application (SPA + REST API)                                |                             |

---

## 2. Secure Coding Practices

### 2.1 Environment Variables — Avoiding Hardcoded Credentials

All sensitive credentials and configuration values are stored in environment variables loaded via the `dotenv` package, never hardcoded in source code.

**Environment variables used in the system:**

| Variable               | Purpose                            | Default (Dev Only)          |
| ---------------------- | ---------------------------------- | --------------------------- |
| `DB_HOST`              | MySQL database host                | `127.0.0.1`                 |
| `DB_PORT`              | MySQL database port                | `3307`                      |
| `DB_USER`              | MySQL username                     | `root`                      |
| `DB_PASSWORD`          | MySQL password                     | `""`                        |
| `DB_NAME`              | Database name                      | `glucogu_db`                |
| `DB_SSL`               | Enable SSL for database connection | `false`                     |
| `JWT_SECRET`           | Access token signing key           | **Required — no default**   |
| `JWT_REFRESH_SECRET`   | Refresh token signing key          | **Required — no default**   |
| `JWT_EXPIRES_IN`       | Access token expiration            | `15m`                       |
| `NODE_ENV`             | Environment mode                   | `development`               |
| `PORT`                 | Server port                        | `3000`                      |
| `CLIENT_URL`           | Allowed CORS origin                | `http://localhost:3001`     |
| `RECAPTCHA_SECRET_KEY` | Google reCAPTCHA verification key  | Skipped if unset            |
| `ENCRYPTION_KEY`       | AES-256-GCM key (64-char hex)      | **Required for encryption** |

> **Note:** In production, `DB_HOST`, `DB_USER`, `DB_PASSWORD`, and `DB_NAME` are **required** — the server will refuse to start without them. A `.env.example` template is provided in `backend/.env.example` as a reference.

**`.gitignore` protections:**

The root `.gitignore` file explicitly excludes sensitive files from version control:

```
.env
.env.local
.env.production
credentials.txt
node_modules/
```

**Sample secure code — Database connection (`backend/database/db.js`):**

```javascript
require("dotenv").config();
const mysql = require("mysql2/promise");

// Enforce required env vars in production
const REQUIRED_DB_VARS = ["DB_HOST", "DB_USER", "DB_PASSWORD", "DB_NAME"];
if (process.env.NODE_ENV === "production") {
  for (const key of REQUIRED_DB_VARS) {
    if (!process.env[key]) {
      throw new Error(`Missing required environment variable: ${key}`);
    }
  }
}

const pool = mysql.createPool({
  host: process.env.DB_HOST || "127.0.0.1",
  port: process.env.DB_PORT || 3307,
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "glucogu_db",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  // SSL encryption for DB connection in production
  ...(process.env.DB_SSL === "true"
    ? { ssl: { rejectUnauthorized: true } }
    : {}),
});
```

**Sample secure code — JWT signing (`backend/controllers/authController.js`):**

```javascript
const SECRET = process.env.JWT_SECRET;
const REFRESH_SEC = process.env.JWT_REFRESH_SECRET;
const EXPIRES = process.env.JWT_EXPIRES_IN || "15m";

// Tokens are signed with environment-variable secrets, never hardcoded
const accessToken = jwt.sign({ id: userId, role }, SECRET, {
  expiresIn: EXPIRES,
});
const refreshToken = jwt.sign({ id: userId }, REFRESH_SEC, { expiresIn: "7d" });
```

### 2.2 HTTP Security Headers

The `helmet` middleware (v8.1.0) is applied globally in `backend/server.js` to set security-related HTTP response headers:

```javascript
const helmet = require("helmet");
app.use(helmet());
```

Helmet automatically sets:

- **Content-Security-Policy** — Prevents XSS by restricting script/style/media sources
- **X-Frame-Options** — Prevents clickjacking by disallowing embedding in iframes
- **Strict-Transport-Security (HSTS)** — Forces HTTPS connections
- **X-Content-Type-Options** — Prevents MIME type sniffing
- **X-DNS-Prefetch-Control** — Controls DNS prefetching
- **X-Permitted-Cross-Domain-Policies** — Restricts cross-domain policy files

Additionally, a custom **Permissions-Policy** header is set to disable unused browser APIs:

```javascript
app.use((_req, res, next) => {
  res.setHeader(
    "Permissions-Policy",
    "geolocation=(), microphone=(), camera=(), payment=()",
  );
  next();
});
```

### 2.3 CORS Restriction

Cross-Origin Resource Sharing is restricted to the client application URL only, with preflight caching:

```javascript
const cors = require("cors");
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3001",
    credentials: true, // allow httpOnly cookie transmission
    maxAge: 3600, // cache preflight responses for 1 hour
  }),
);
```

### 2.4 Request Body Size Limiting

The server limits JSON request payloads to 10KB to prevent large payload denial-of-service attacks:

```javascript
app.use(express.json({ limit: "10kb" }));
```

### 2.5 XSS Input Sanitization Middleware

A global sanitization middleware (`backend/middleware/sanitize.js`) strips HTML tags from all string values in `req.body`, `req.query`, and `req.params` on every incoming request:

```javascript
const sanitizeInput = require("./middleware/sanitize");
app.use(sanitizeInput);
```

This provides defense-in-depth against Cross-Site Scripting (XSS) attacks by ensuring that even if validation misses a field, HTML tags are removed before processing.

### 2.6 SQL Injection Prevention — Parameterized Queries

All database queries use parameterized placeholders (`?`) via the `mysql2` driver. User input is never concatenated into SQL strings.

**Example — User lookup (`backend/models/userModel.js`):**

```javascript
async findByEmail(email) {
  const [rows] = await db.query(
    "SELECT * FROM users WHERE email = ? LIMIT 1",
    [email]  // parameterized — prevents SQL injection
  );
  return rows[0] || null;
}
```

**Example — User search with LIKE (`backend/models/userModel.js`):**

```javascript
if (search) {
  sql += " AND (full_name LIKE ? OR email LIKE ?)";
  const like = `%${search}%`;
  params.push(like, like); // search term is parameterized, not concatenated
}
```

### 2.7 Child Process Safety — ML Prediction

The Python ML script is invoked via `child_process.spawn()` with array arguments (no shell interpolation), and data is passed via stdin JSON — not command-line arguments:

```javascript
const proc = spawn("python", [SCRIPT], { stdio: ["pipe", "pipe", "pipe"] });
proc.stdin.write(JSON.stringify(inputData));
proc.stdin.end();
```

This prevents:

- **Command injection** — No shell is spawned; arguments are not interpreted
- **Argument injection** — User data never appears in the command-line argument list

---

## 3. Authentication and Authorization

### 3.1 Registration Process

1. User submits first name, last name, middle initial (optional), email, phone, password, and role selection.
2. **Google reCAPTCHA v2** is verified server-side by calling `https://www.google.com/recaptcha/api/siteverify` with the `RECAPTCHA_SECRET_KEY`.
3. **Input validation** runs via `express-validator`:
   - `firstName` / `lastName`: non-empty, trimmed
   - `email`: valid email format, normalized
   - `password`: minimum 12 characters, at least 1 uppercase, 1 lowercase, 1 digit, 1 special character
   - `role`: must be one of `health_user`, `staff`, `admin`
4. **Duplicate email check**: system queries the database to ensure the email is not already registered.
5. **Password hashing**: the password is hashed using **bcrypt** with **12 salt rounds** before storage.
6. The user record is inserted into the `users` table with `is_active = 1`.
7. A JWT access token and refresh token are generated and returned.

**Password hashing code (`backend/controllers/authController.js`):**

```javascript
const SALT_ROUNDS = 12;
const hash = await bcrypt.hash(password, SALT_ROUNDS);

await UserModel.create({
  firstName,
  lastName,
  mi: mi || null,
  email,
  passwordHash: hash,
  role,
  phone: phone || null,
});
```

### 3.2 Login Process

1. User submits email and password.
2. **reCAPTCHA** is verified server-side (same as registration).
3. **Input validation** ensures email and password fields are non-empty.
4. System looks up the user by email. If not found → `"Invalid credentials"` (no user enumeration).
5. **Account lockout check**: if `login_attempts >= 5` and `locked_until > now`, the request is rejected with HTTP 423 and `seconds_left` until unlock.
6. **Account active check**: if `is_active === false`, login is rejected with `"Account is deactivated"`.
7. **Password verification**: `bcrypt.compare()` checks the plaintext password against the stored hash.
8. On **failure**: `login_attempts` is incremented; if reaching 5, `locked_until` is set to `now + 60 seconds`. The response includes `attempts_remaining`.
9. On **success**: `login_attempts` is reset to 0 and `locked_until` is cleared. JWT tokens are issued.

**Token issuance code:**

```javascript
const accessToken = jwt.sign({ id: user.user_id, role: user.role }, SECRET, {
  expiresIn: EXPIRES,
});
const refreshToken = jwt.sign({ id: user.user_id }, REFRESH_SEC, {
  expiresIn: "7d",
});

// httpOnly cookies — not accessible via JavaScript
res.cookie("token", accessToken, {
  httpOnly: true,
  secure: isProd,
  sameSite: isProd ? "strict" : "lax",
  maxAge: 15 * 60 * 1000,
});

res.cookie("refreshToken", refreshToken, {
  httpOnly: true,
  secure: isProd,
  sameSite: isProd ? "strict" : "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000,
});
```

### 3.3 Password Hashing

| Property              | Value                                           |
| --------------------- | ----------------------------------------------- |
| **Algorithm**         | bcrypt                                          |
| **Library**           | bcryptjs v3.0.3                                 |
| **Salt Rounds**       | 12                                              |
| **Storage Column**    | `users.password_hash` (VARCHAR 255)             |
| **Plaintext Storage** | Never — passwords are hashed before INSERT      |
| **Comparison**        | `bcrypt.compare(plaintext, hash)` — timing-safe |

### 3.4 JWT Token Strategy

| Token             | Secret                       | Expiry                                         | Storage                                 |
| ----------------- | ---------------------------- | ---------------------------------------------- | --------------------------------------- |
| **Access Token**  | `JWT_SECRET` env var         | 15 minutes (configurable via `JWT_EXPIRES_IN`) | httpOnly cookie `token` + response body |
| **Refresh Token** | `JWT_REFRESH_SECRET` env var | 7 days                                         | httpOnly cookie `refreshToken`          |

**Cookie security attributes:**

- `httpOnly: true` — Not accessible via `document.cookie` (prevents XSS token theft)
- `secure: true` (production) — Only sent over HTTPS
- `sameSite: "strict"` (production) — Prevents CSRF by blocking cross-site cookie transmission

### 3.5 Token Refresh Flow

1. Client calls `POST /api/auth/refresh` (no Authorization header needed — uses cookie)
2. Server reads `refreshToken` from `req.cookies`
3. Token is verified with `JWT_REFRESH_SECRET`
4. User is re-fetched from database to confirm they still exist and are active
5. A new access token is issued and set as a cookie

### 3.6 Token Blacklisting on Logout

When a user logs out, the current access token is added to an in-memory blacklist (`backend/middleware/tokenBlacklist.js`). The blacklist entry automatically expires when the token would have naturally expired.

```javascript
// On logout — blacklist the current token
const decoded = jwt.decode(token);
if (decoded && decoded.exp) {
  tokenBlacklist.add(token, decoded.exp * 1000);
}

// On every authenticated request — check blacklist
if (tokenBlacklist.isBlacklisted(token)) {
  return res.status(401).json({ error: "Token has been revoked" });
}
```

This prevents stolen tokens from being used after logout, even if the token hasn't expired yet. Cookies are also cleared with proper `httpOnly`, `secure`, and `sameSite` attributes matching the issuance settings.

### 3.7 User Roles and Access Control

**Roles implemented:**

| Role                      | DB Value      | Permissions                                                                                                                |
| ------------------------- | ------------- | -------------------------------------------------------------------------------------------------------------------------- |
| **Administrator**         | `admin`       | Full system access — manage users, view all predictions, view logs, manage messages, view reports, analytics dashboards    |
| **Healthcare Staff**      | `staff`       | View patient records, manage appointments, send/receive messages, run predictions for patients, set availability status    |
| **Health User (Patient)** | `health_user` | Create/view own health profile, submit predictions, view own prediction history, send messages to staff, book appointments |
| **Guest**                 | N/A           | View landing page, register, login only                                                                                    |

**Middleware enforcement (`backend/middleware/authMiddleware.js`):**

```javascript
// Verify JWT token and load user
const requireAuth = async (req, res, next) => {
  const token =
    req.headers.authorization?.replace("Bearer ", "") || req.cookies?.token;
  if (!token) return res.status(401).json({ error: "Authentication required" });

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const user = await UserModel.findById(decoded.id);
  if (!user) return res.status(401).json({ error: "User no longer exists" });
  if (!user.is_active)
    return res.status(403).json({ error: "Account has been deactivated" });

  req.user = user;
  next();
};

// Check role after authentication
const requireRole =
  (...roles) =>
  (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res
        .status(403)
        .json({ error: "Access denied — insufficient role" });
    }
    next();
  };
```

---

## 4. Data Encryption

### 4.1 Data Protection Summary

| Data                     | Protection Method               | Details                                                                 |
| ------------------------ | ------------------------------- | ----------------------------------------------------------------------- |
| **User passwords**       | bcrypt hashing (12 salt rounds) | Stored as `password_hash`; original password is never stored or logged  |
| **JWT tokens**           | HMAC-SHA256 digital signature   | Signed with `JWT_SECRET` / `JWT_REFRESH_SECRET` environment variables   |
| **Auth cookies**         | httpOnly + secure + sameSite    | Prevents XSS access, enforces HTTPS in production, blocks CSRF          |
| **Data in transit**      | HTTPS / TLS                     | Enforced via Helmet HSTS headers and `secure` cookie flag in production |
| **Data at rest**         | AES-256-GCM encryption          | Encryption utility available for sensitive health data fields           |
| **Database connection**  | Optional SSL/TLS                | Enabled via `DB_SSL=true` env var for encrypted DB connections          |
| **Database credentials** | Environment variables           | Loaded via `dotenv`; never committed to source code                     |
| **reCAPTCHA secret**     | Environment variable            | `RECAPTCHA_SECRET_KEY` stored in `.env` file                            |
| **Encryption key**       | Environment variable            | `ENCRYPTION_KEY` (64-char hex) stored in `.env` file                    |

### 4.2 AES-256-GCM Encryption Utility

A dedicated encryption module (`backend/middleware/encryption.js`) provides AES-256-GCM authenticated encryption for sensitive data at rest:

```javascript
const { encrypt, decrypt } = require("./middleware/encryption");

// Encrypt sensitive data before storage
const ciphertext = encrypt("sensitive health data");
// → { iv: "hex...", tag: "hex...", data: "hex..." }

// Decrypt when retrieval is needed
const plaintext = decrypt(ciphertext);
// → "sensitive health data"
```

**AES-256-GCM properties:**

| Property               | Value                                      |
| ---------------------- | ------------------------------------------ |
| **Algorithm**          | AES-256-GCM (Galois/Counter Mode)          |
| **Key size**           | 256 bits (32 bytes, stored as 64-char hex) |
| **IV size**            | 128 bits (16 bytes, randomly generated)    |
| **Authentication tag** | 128 bits (prevents tampering)              |
| **Key storage**        | `ENCRYPTION_KEY` environment variable      |
| **Key in source code** | Never — loaded from environment only       |

### 4.2 Password Hash Storage

Passwords are stored as bcrypt hashes in the `users.password_hash` column. A bcrypt hash looks like:

```
$2a$12$LJ3m4ys8Hrl0YQGPlcP3v.5eT3GwN1NX5dMiKjS3zLh9F7uAwnpQO
```

- `$2a$` — bcrypt algorithm identifier
- `12$` — cost factor (12 salt rounds = 2^12 = 4,096 iterations)
- Remaining characters — 22-character salt + 31-character hash

The original plaintext password cannot be recovered from the hash.

### 4.3 JWT Token Structure

Each JWT access token contains:

```json
{
  "header": { "alg": "HS256", "typ": "JWT" },
  "payload": {
    "id": 1,
    "role": "health_user",
    "iat": 1741686000,
    "exp": 1741686900
  },
  "signature": "HMAC-SHA256(header.payload, JWT_SECRET)"
}
```

The token is tamper-proof — any modification invalidates the signature.

---

## 5. Input Validation and Sanitization

### 5.1 Validated Inputs

All user inputs are validated server-side using **express-validator** (v7.3.1) before processing. The system validates:

| Input Context           | Fields Validated                                                                                                                   | Validation Rules                                                                                                             |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| **User Registration**   | `firstName`, `lastName`, `email`, `password`, `role`, `phone`, `mi`                                                                | Non-empty, trimmed, email format, password complexity (12+ chars, upper/lower/digit/special), role enum, optional phone trim |
| **User Login**          | `email`, `password`                                                                                                                | Non-empty, email format                                                                                                      |
| **Health Profile**      | `date_of_birth`, `gender`, `height_cm`, `weight_kg`, `smoking_status`                                                              | ISO date, gender enum (male/female/other), height 50–300, weight 1–500, smoking enum                                         |
| **Messages**            | `receiver_id`, `message`                                                                                                           | Integer ≥ 1, non-empty string, max 2000 characters                                                                           |
| **Appointments**        | `staff_id`, `appointment_date`, `notes`, `status`                                                                                  | Integer ≥ 1, ISO 8601 date, max 500 chars, status enum (pending/approved/completed/cancelled)                                |
| **Role Change (Admin)** | `role`                                                                                                                             | Must be one of `admin`, `staff`, `health_user`                                                                               |
| **Prediction**          | `gender`, `age`, `hypertension`, `heart_disease`, `smoking_history`, `bmi`, `HbA1c_level`, `blood_glucose_level`, `target_user_id` | Gender enum, age 0–150, binary 0/1 fields, smoking enum, BMI 1–100, HbA1c 0–20, glucose 0–600, optional int ID               |
| **Admin Search**        | `search`, `type`, `risk`, `from`, `to`, `limit`                                                                                    | Search max 200 chars, type/risk enum validation, ISO date format, limit capped at 500/2000                                   |

### 5.2 Validation Code Examples

**Registration password validation (`backend/routes/authRoutes.js`):**

```javascript
body("password")
  .isLength({ min: 12 }).withMessage("Password must be at least 12 characters")
  .matches(/[A-Z]/).withMessage("Must contain an uppercase letter")
  .matches(/[a-z]/).withMessage("Must contain a lowercase letter")
  .matches(/[0-9]/).withMessage("Must contain a digit")
  .matches(/[^A-Za-z0-9]/).withMessage("Must contain a special character"),
```

**Health profile validation (`backend/routes/profileRoutes.js`):**

```javascript
body("height_cm").isFloat({ min: 50, max: 300 }).withMessage("Height must be 50–300 cm"),
body("weight_kg").isFloat({ min: 1, max: 500 }).withMessage("Weight must be 1–500 kg"),
body("gender").isIn(["male", "female", "other"]).withMessage("Invalid gender"),
body("smoking_status").isIn(["non-smoker", "former", "current"]).withMessage("Invalid smoking status"),
```

**Message validation (`backend/routes/messageRoutes.js`):**

```javascript
body("receiver_id").isInt({ min: 1 }),
body("message").trim().notEmpty().isLength({ max: 2000 }),
```

**Prediction input validation (`backend/routes/predictionRoutes.js`):**

```javascript
body("gender").isIn(["Male", "Female", "Other"]),
body("age").isFloat({ min: 0, max: 150 }),
body("hypertension").isIn([0, 1, "0", "1"]),
body("heart_disease").isIn([0, 1, "0", "1"]),
body("smoking_history").isIn(["never", "former", "current", "not current", "ever", "No Info"]),
body("bmi").isFloat({ min: 1, max: 100 }),
body("HbA1c_level").isFloat({ min: 0, max: 20 }),
body("blood_glucose_level").isFloat({ min: 0, max: 600 }),
body("target_user_id").optional().isInt({ min: 1 }),
```

### 5.3 Validation Error Handling

When validation fails, the server returns a structured error array with HTTP 400:

```json
{
  "errors": [
    {
      "type": "field",
      "msg": "Password must be at least 12 characters",
      "path": "password",
      "location": "body"
    }
  ]
}
```

### 5.4 SQL Injection Prevention

All database queries use parameterized placeholders. No user input is ever string-concatenated into SQL:

```javascript
// SAFE — parameterized query
const [rows] = await db.query("SELECT * FROM users WHERE email = ? LIMIT 1", [
  email,
]);

// SAFE — parameterized search
sql += " AND (full_name LIKE ? OR email LIKE ?)";
params.push(`%${search}%`, `%${search}%`);
```

### 5.5 XSS Prevention — Global HTML Sanitization

In addition to output encoding (via React's built-in JSX escaping on the frontend), the backend applies a global sanitization middleware that strips all HTML tags from incoming request data:

```javascript
// backend/middleware/sanitize.js — applied globally in server.js
function stripTags(str) {
  if (typeof str !== "string") return str;
  return str.replace(/<[^>]*>/g, "");
}

// Applied to req.body, req.query, and req.params on every request
app.use(sanitizeInput);
```

This provides **defense-in-depth**: even if a validation rule is missing on a specific field, HTML injection is prevented at the middleware level.

### 5.6 Database Integrity

Database integrity is enforced through:

- **Foreign key constraints** — All relationships (`users → predictions`, `users → messages`, `users → appointments`, `users → health_profiles`) use `FOREIGN KEY` with `REFERENCES` to ensure referential integrity
- **ENUM types** — Role, status, gender, smoking history, and risk level fields use MySQL ENUM types to enforce valid values at the database level
- **NOT NULL constraints** — Required fields (`full_name`, `email`, `password_hash`, `role`) cannot be NULL
- **UNIQUE constraints** — `users.email` has a UNIQUE index to prevent duplicate registrations
- **AUTO_INCREMENT** — Primary keys use auto-increment to prevent ID conflicts
- **Transactional operations** — User deletion uses database transactions (`BEGIN → DELETE cascade → COMMIT/ROLLBACK`) to maintain consistency

---

## 6. Error Handling and Logging

### 6.1 Secure Error Handling

The system implements a global error handler that prevents technical details from leaking to end users in production:

```javascript
// backend/server.js — Global error handler
app.use((err, _req, res, _next) => {
  console.error(err); // full error logged server-side
  res.status(err.status || 500).json({
    error:
      process.env.NODE_ENV === "production"
        ? "Internal server error" // generic message in production
        : err.message, // detailed message in development only
  });
});
```

**Error handling patterns across the system:**

| Scenario                         | Response to Client                                        | Server-Side Log                        |
| -------------------------------- | --------------------------------------------------------- | -------------------------------------- |
| Login — wrong email              | `"Invalid credentials"` (no user enumeration)             | None (intentional)                     |
| Login — wrong password           | `"Invalid credentials. N attempts remaining"`             | None                                   |
| Login — account locked           | `"Account locked..."` + `locked_until` + `seconds_left`   | None                                   |
| Login — account deactivated      | `"Account is deactivated"`                                | None                                   |
| Token expired                    | `"Token expired — please log in again"`                   | None                                   |
| Token invalid                    | `"Invalid or expired token"`                              | None                                   |
| Account deactivated (middleware) | `"Account has been deactivated"`                          | None                                   |
| Role mismatch                    | `"Access denied — insufficient role"`                     | None                                   |
| Validation failure               | `{ errors: [...] }` structured array                      | None                                   |
| Controller error (any)           | Feature-specific message (e.g., `"Failed to load users"`) | `console.error("[functionName]", err)` |
| Unhandled error (production)     | `"Internal server error"`                                 | Full stack trace via `console.error`   |
| Unhandled error (development)    | `err.message`                                             | Full stack trace via `console.error`   |

### 6.2 System Logging

The system logs administrative and security-relevant actions to the `system_logs` database table via a centralized audit logger module (`backend/middleware/auditLogger.js`):

```javascript
// backend/middleware/auditLogger.js
const { logAction } = require("../middleware/auditLogger");

async function logAction(req, actionType, description) {
  const userId = req.user?.user_id || null;
  const ip =
    req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
    req.socket?.remoteAddress ||
    "unknown";
  await db.query(
    "INSERT INTO system_logs (user_id, action_type, ip_address, description) VALUES (?, ?, ?, ?)",
    [userId, actionType, ip, description],
  );
}
```

**Logged action types:**

| Action Type          | Description                                                 | Trigger                                 |
| -------------------- | ----------------------------------------------------------- | --------------------------------------- |
| `login_success`      | `"User {email} logged in successfully"`                     | Successful user login                   |
| `login_failure`      | `"Failed login attempt for {email} (attempt N/5)"`          | Failed password verification            |
| `account_locked`     | `"Account locked for {email} after 5 failed attempts"`      | 5th consecutive failed login            |
| `activate_user`      | `"Activated user #{id} ({email})"`                          | Admin activates a user account          |
| `deactivate_user`    | `"Deactivated user #{id} ({email})"`                        | Admin deactivates a user account        |
| `change_role`        | `"Changed user #{id} role to {role}"`                       | Admin changes a user's role             |
| `schedule_delete`    | `"Scheduled deletion for user #{id} ({email})"`             | Admin schedules permanent user deletion |
| `unlock_account`     | `"Unlocked account for user #{id} ({email})"`               | Admin unlocks a locked-out user         |
| `delete_message`     | `"Deleted message #{id}"`                                   | Admin deletes a specific message        |
| `delete_thread`      | `"Deleted conversation between users #{id1} and #{id2}"`    | Admin deletes an entire message thread  |
| `prediction_created` | `"Prediction #{id} for user #{uid} — risk: {level} ({%}%)"` | Any user creates a diabetes prediction  |

**Log record fields:**

| Column        | Type         | Content                                                   |
| ------------- | ------------ | --------------------------------------------------------- |
| `log_id`      | INT (PK)     | Auto-incrementing ID                                      |
| `user_id`     | INT (FK)     | Admin who performed the action                            |
| `action_type` | VARCHAR(100) | Event type identifier                                     |
| `ip_address`  | VARCHAR(50)  | Client IP (supports X-Forwarded-For for proxied requests) |
| `description` | TEXT         | Human-readable description of the action                  |
| `created_at`  | TIMESTAMP    | Timestamp of the event                                    |

### 6.3 Login Attempt Tracking

Login attempts are tracked in the `users` table:

| Column           | Purpose                                          |
| ---------------- | ------------------------------------------------ |
| `login_attempts` | Counter incremented on each failed login         |
| `locked_until`   | Timestamp when lock expires (NULL if not locked) |

The `login_attempts` column is indexed for efficient lockout queries.

### 6.4 Log Viewing

Administrators can view system logs through two endpoints:

- **`GET /api/admin/logs`** — Paginated log search with optional filters by `search` keyword and `action_type`. Limited to 500 entries.
- **`GET /api/admin/activity`** — Returns the 50 most recent log entries for the activity monitor dashboard.

---

## 7. Access Control

### 7.1 Role-Based Access Control (RBAC) Matrix

| System Feature / Resource   | Guest      | Health User (Patient)  | Staff                     | Administrator             |
| --------------------------- | ---------- | ---------------------- | ------------------------- | ------------------------- |
| View Landing Page           | ✅ Allowed | ✅ Allowed             | ✅ Allowed                | ✅ Allowed                |
| User Registration           | ✅ Allowed | ❌ Denied (redirected) | ❌ Denied (redirected)    | ❌ Denied (redirected)    |
| Login                       | ✅ Allowed | ❌ Denied (redirected) | ❌ Denied (redirected)    | ❌ Denied (redirected)    |
| User Dashboard              | ❌ Denied  | ✅ Allowed             | ❌ Denied (own dashboard) | ❌ Denied (own dashboard) |
| Staff Dashboard             | ❌ Denied  | ❌ Denied              | ✅ Allowed                | ❌ Denied                 |
| Admin Dashboard             | ❌ Denied  | ❌ Denied              | ❌ Denied                 | ✅ Allowed                |
| Edit Health Profile         | ❌ Denied  | ✅ Allowed (own)       | ❌ Denied                 | ❌ Denied                 |
| Submit Prediction           | ❌ Denied  | ✅ Allowed             | ✅ Allowed                | ✅ Allowed                |
| View Own Prediction History | ❌ Denied  | ✅ Allowed             | ✅ Allowed                | ✅ Allowed                |
| View All Predictions        | ❌ Denied  | ❌ Denied              | ❌ Denied                 | ✅ Allowed                |
| Send/Receive Messages       | ❌ Denied  | ✅ Allowed             | ✅ Allowed                | ✅ Allowed                |
| Book Appointments           | ❌ Denied  | ✅ Allowed             | ❌ Denied                 | ❌ Denied                 |
| View Own Appointments       | ❌ Denied  | ✅ Allowed             | ❌ Denied                 | ❌ Denied                 |
| View Staff Appointments     | ❌ Denied  | ❌ Denied              | ✅ Allowed                | ✅ Allowed                |
| View All Appointments       | ❌ Denied  | ❌ Denied              | ❌ Denied                 | ✅ Allowed                |
| Manage Users                | ❌ Denied  | ❌ Denied              | ❌ Denied                 | ✅ Allowed                |
| Activate / Deactivate Users | ❌ Denied  | ❌ Denied              | ❌ Denied                 | ✅ Allowed                |
| Change User Roles           | ❌ Denied  | ❌ Denied              | ❌ Denied                 | ✅ Allowed                |
| Unlock Locked Accounts      | ❌ Denied  | ❌ Denied              | ❌ Denied                 | ✅ Allowed                |
| Delete Users                | ❌ Denied  | ❌ Denied              | ❌ Denied                 | ✅ Allowed                |
| View System Logs            | ❌ Denied  | ❌ Denied              | ❌ Denied                 | ✅ Allowed                |
| View Activity Monitor       | ❌ Denied  | ❌ Denied              | ❌ Denied                 | ✅ Allowed                |
| Reports & PDF/CSV Export    | ❌ Denied  | ❌ Denied              | ✅ Allowed                | ✅ Allowed                |
| System Configuration        | ❌ Denied  | ❌ Denied              | ❌ Denied                 | ✅ Allowed                |
| Manage Admin Messages       | ❌ Denied  | ❌ Denied              | ❌ Denied                 | ✅ Allowed                |

### 7.2 Backend Route Protection

**Admin routes** — All routes under `/api/admin/*` are guarded at the router level:

```javascript
// backend/routes/adminRoutes.js
router.use(requireAuth, requireRole("admin")); // applies to ALL admin routes
```

**Staff + Admin routes** — Certain endpoints use combined role checks:

```javascript
router.get("/staff", requireAuth, requireRole("admin", "staff"));
```

**Patient-only routes** — Health profile endpoints are restricted:

```javascript
router.get("/health", requireAuth, requireRole("health_user"));
router.put("/health", requireAuth, requireRole("health_user"), [...validation]);
```

### 7.3 Frontend Route Protection

**ProtectedRoute component** — Wraps all authenticated routes:

- Unauthenticated users → redirected to `/login`
- Authenticated users with wrong role → redirected to their role-specific dashboard
- Saves the intended destination in `location.state.from` for post-login redirect

**GuestRoute component** — Wraps login/register pages:

- Already authenticated users → redirected to their role-appropriate dashboard
- Prevents re-login when a session already exists

**Role-based home routes:**

```javascript
const ROLE_HOME = {
  health_user: "/dashboard",
  staff: "/staff",
  admin: "/admin",
};
```

---

## 8. Code Auditing Tools

### 8.1 Tools Used

| Tool                               | Purpose                                                                                                 | Scope                                        |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------- | -------------------------------------------- |
| **ESLint (Backend)**               | JavaScript static analysis with security plugin — detects unsafe regex, eval, timing attacks, injection | Backend (`backend/.eslintrc.js`)             |
| **eslint-plugin-security**         | Dedicated security-focused ESLint rules — detects object injection, non-literal regex, buffer overflows | Backend (integrated with ESLint)             |
| **ESLint (Frontend)**              | React-specific linting — code quality, hooks violations, accessibility                                  | Frontend (via react-scripts built-in ESLint) |
| **npm audit**                      | Dependency vulnerability scanning — checks all npm packages against known CVE databases                 | Backend + Frontend                           |
| **Browser DevTools (Network tab)** | Manual inspection of HTTP headers, cookie attributes, API responses                                     | Runtime                                      |
| **VS Code IntelliSense**           | Real-time type checking, import verification, unused code detection                                     | Development                                  |

### 8.2 Backend ESLint Configuration with Security Plugin

The backend uses ESLint v8 with `eslint-plugin-security` (`backend/.eslintrc.js`):

```javascript
module.exports = {
  env: { node: true, commonjs: true, es2021: true },
  extends: ["eslint:recommended"],
  plugins: ["security"],
  rules: {
    // Security rules
    "security/detect-object-injection": "warn",
    "security/detect-non-literal-regexp": "warn",
    "security/detect-unsafe-regex": "error",
    "security/detect-buffer-noassert": "error",
    "security/detect-eval-with-expression": "error",
    "security/detect-no-csrf-before-method-override": "error",
    "security/detect-possible-timing-attacks": "warn",
    "security/detect-child-process": "warn",
    // General quality
    "no-eval": "error",
    "no-implied-eval": "error",
    "no-new-func": "error",
    eqeqeq: ["error", "always"],
  },
};
```

**Run commands:**

```bash
cd backend
npm run lint        # Check for issues
npm run lint:fix    # Auto-fix fixable issues
npm run audit       # Dependency vulnerability scan
```

### 8.3 ESLint Audit Results

Latest backend ESLint audit result: **0 errors, 14 warnings** (all informational security warnings about generic object injection sinks — reviewed and confirmed safe due to parameterized queries).

### 8.4 Frontend ESLint Configuration

### 8.4 Frontend ESLint Configuration

The frontend uses the default `react-scripts` ESLint configuration which includes:

- `eslint-plugin-react` — React-specific linting rules
- `eslint-plugin-react-hooks` — Enforces Rules of Hooks
- `eslint-plugin-jsx-a11y` — Accessibility checks

### 8.5 Vulnerability Scan Summary

**Backend `npm audit` result:** **0 vulnerabilities** (as of latest audit — `express-rate-limit` IPv4-mapped IPv6 bypass was fixed via `npm audit fix`).

**Frontend `npm audit` result:** Moderate vulnerabilities exist in development dependencies (inherited from `tailwind` package — `@babel/runtime` regex complexity). These are **development-only** packages not shipped to production.

Run `npm audit` in both `backend/` and `frontend/` directories to check for known vulnerabilities in dependencies:

```bash
cd backend && npm audit
cd frontend && npm audit
```

**Recommended regular auditing schedule:**

- Run `npm audit` before each deployment
- Update dependencies monthly using `npm update`
- Address critical/high severity vulnerabilities immediately

---

## 9. Testing

### 9.1 Authentication Testing

| Test Case                                 | Expected Result                                  | Method                                    |
| ----------------------------------------- | ------------------------------------------------ | ----------------------------------------- |
| Register with valid data                  | Account created, tokens issued                   | POST `/api/auth/register`                 |
| Register with duplicate email             | 409 error: "Email already in use"                | POST `/api/auth/register`                 |
| Register with weak password (< 12 chars)  | 400 error: validation message                    | POST `/api/auth/register`                 |
| Register without uppercase in password    | 400 error: "Must contain an uppercase letter"    | POST `/api/auth/register`                 |
| Login with correct credentials            | 200 + tokens + user object                       | POST `/api/auth/login`                    |
| Login with wrong email                    | 401: "Invalid credentials"                       | POST `/api/auth/login`                    |
| Login with wrong password                 | 401: "Invalid credentials. N attempts remaining" | POST `/api/auth/login`                    |
| Login after 5 failed attempts             | 423: "Account locked" + seconds_left             | POST `/api/auth/login`                    |
| Login after lockout expires               | Successful login                                 | POST `/api/auth/login` (wait 60s)         |
| Login with deactivated account            | 403: "Account is deactivated"                    | POST `/api/auth/login`                    |
| Access protected route without token      | 401: "Authentication required"                   | GET `/api/predictions/history`            |
| Access protected route with expired token | 401: "Token expired"                             | GET with expired Bearer token             |
| Access admin route as patient             | 403: "Access denied"                             | GET `/api/admin/stats` with patient token |
| Refresh token                             | 200 + new access token                           | POST `/api/auth/refresh`                  |
| Logout                                    | Cookies cleared                                  | POST `/api/auth/logout`                   |

### 9.2 Input Validation Testing

| Test Case                                | Expected Result                 | Method                            |
| ---------------------------------------- | ------------------------------- | --------------------------------- |
| Register with email `"notanemail"`       | 400: "Invalid email"            | POST `/api/auth/register`         |
| Health profile with height = 0           | 400: "Height must be 50–300 cm" | PUT `/api/profile/health`         |
| Send message with empty body             | 400: validation error           | POST `/api/messages`              |
| Send message exceeding 2000 chars        | 400: validation error           | POST `/api/messages`              |
| Submit prediction missing required field | 400: "All fields are required"  | POST `/api/predictions/predict`   |
| Admin change role to invalid value       | 400: "Invalid role"             | PATCH `/api/admin/users/:id/role` |

### 9.3 Access Control Testing

| Test Case                           | Expected Result            | Method                                 |
| ----------------------------------- | -------------------------- | -------------------------------------- |
| Patient accesses admin dashboard    | Redirected to `/dashboard` | Navigate to `/admin` as patient        |
| Guest accesses prediction page      | Redirected to `/login`     | Navigate to `/prediction` without auth |
| Patient accesses health profile API | 200 + profile data         | GET `/api/profile/health` as patient   |
| Staff accesses health profile API   | 403: "Access denied"       | GET `/api/profile/health` as staff     |
| Patient accesses admin users API    | 403: "Access denied"       | GET `/api/admin/users` as patient      |
| Admin accesses admin users API      | 200 + user list            | GET `/api/admin/users` as admin        |

### 9.4 Feature Testing

| Feature                   | Tests                                                                                     |
| ------------------------- | ----------------------------------------------------------------------------------------- |
| **Dashboard**             | Stats cards load real data, prediction history table populates, trend chart renders       |
| **Prediction Form**       | All 8 fields present, auto-fill from health profile works, form submission returns result |
| **Result Page**           | Shows probability %, risk level badge, diabetes result, recommendations                   |
| **History Page**          | Shows all past predictions with correct data, loading/empty states work                   |
| **Messages**              | Send message, receive real-time inbox, unread count updates                               |
| **Appointments**          | Create appointment, staff approval flow, status updates                                   |
| **Admin User Management** | Edit modal opens, role change saves, activate/deactivate works, unlock works              |
| **Reports**               | PDF download generates valid document, CSV export includes all fields                     |
| **System Logs**           | Logs page loads, search filters work, action types display correctly                      |

---

## 10. Security Policies

### 10.1 Password Policy

| Requirement              | Rule                                                                                           |
| ------------------------ | ---------------------------------------------------------------------------------------------- |
| **Minimum Length**       | 12 characters                                                                                  |
| **Character Complexity** | Must include at least 1 uppercase letter, 1 lowercase letter, 1 digit, and 1 special character |
| **Hashing Algorithm**    | bcrypt with 12 salt rounds                                                                     |
| **Plaintext Storage**    | Strictly prohibited — passwords are hashed before database insertion                           |
| **Password Display**     | Password fields use `type="password"` and are never echoed in API responses                    |

### 10.2 Login Attempt Policy

| Parameter                   | Value                                                                                    |
| --------------------------- | ---------------------------------------------------------------------------------------- |
| **Maximum Failed Attempts** | 5 consecutive failures                                                                   |
| **Lockout Duration**        | 60 seconds (1 minute)                                                                    |
| **Lockout Trigger**         | Automatic after 5th failed attempt                                                       |
| **Unlock Method**           | Automatic after lockout expires, or manual unlock by administrator                       |
| **Counter Reset**           | Resets to 0 on successful login                                                          |
| **User Feedback**           | Remaining attempts shown on failed login; locked status with countdown shown when locked |
| **Admin Visibility**        | Locked accounts visible in admin dashboard with unlock controls                          |

### 10.3 Rate Limiting Policy

| Scope              | Window     | Maximum Requests | Applied To                              |
| ------------------ | ---------- | ---------------- | --------------------------------------- |
| **Authentication** | 15 minutes | 10 requests      | `/api/auth/register`, `/api/auth/login` |
| **General API**    | 1 minute   | 100 requests     | All `/api/*` routes                     |
| **ML Predictions** | 1 minute   | 5 requests       | `POST /api/predictions/predict`         |
| **Appointments**   | 1 hour     | 10 requests      | `POST /api/appointments`                |
| **Messages**       | 1 minute   | 20 requests      | `POST /api/messages`                    |

Rate limit headers (`RateLimit-Policy`, `RateLimit-Limit`, `RateLimit-Remaining`, `RateLimit-Reset`) are included in all rate-limited responses per the IETF standard headers specification.

### 10.4 Data Handling Policy

| Policy                        | Implementation                                                                                |
| ----------------------------- | --------------------------------------------------------------------------------------------- |
| **Sensitive data encryption** | Passwords hashed with bcrypt; tokens signed with HMAC-SHA256; AES-256-GCM utility available   |
| **Data in transit**           | HTTPS enforced via Helmet HSTS headers and secure cookie flags in production                  |
| **Database encryption**       | Optional SSL/TLS for MySQL connections via `DB_SSL=true` environment variable                 |
| **Request payload limits**    | JSON body limited to 10KB                                                                     |
| **Database access**           | Parameterized queries only — no string concatenation of user input                            |
| **Credential storage**        | All secrets (DB password, JWT secrets, reCAPTCHA key, encryption key) stored in env variables |
| **Cookie security**           | httpOnly (no JS access), secure (HTTPS only in production), sameSite strict (CSRF prevention) |
| **Token expiration**          | Access tokens expire in 15 minutes; refresh tokens in 7 days                                  |
| **Token revocation**          | Tokens are blacklisted on logout and rejected by auth middleware                              |
| **XSS prevention**            | Global HTML tag stripping middleware + React JSX auto-escaping                                |

### 10.5 Access Control Policy

| Policy                         | Implementation                                                                                    |
| ------------------------------ | ------------------------------------------------------------------------------------------------- |
| **Admin-only configuration**   | All `/api/admin/*` routes protected by `requireAuth` + `requireRole("admin")` at the router level |
| **Role verification**          | Every protected request verifies the user's role against allowed roles                            |
| **Account deactivation check** | Middleware rejects requests from deactivated accounts (HTTP 403)                                  |
| **Session validation**         | JWT token verified on every request; user existence confirmed from database                       |
| **Frontend guards**            | `ProtectedRoute` and `GuestRoute` components enforce client-side access restrictions              |
| **Cross-role redirection**     | Users attempting to access pages outside their role are redirected to their own dashboard         |

### 10.6 Logging and Monitoring Policy

| Policy                       | Implementation                                                                                                                                                                       |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Administrative actions**   | All user management actions (activate, deactivate, role change, delete, unlock, message deletion) are logged to `system_logs` with user ID, IP address, action type, and description |
| **Authentication events**    | Login successes, login failures (with attempt count), and account lockouts are logged with IP address and user email                                                                 |
| **Prediction activity**      | Every prediction creation is logged with prediction ID, target user, risk level, and probability                                                                                     |
| **Centralized audit module** | All logging flows through `backend/middleware/auditLogger.js` for consistent formatting and error handling                                                                           |
| **Log retention**            | Logs are stored persistently in the database with indexed columns for efficient querying                                                                                             |
| **Log access**               | Only administrators can view logs via `/api/admin/logs` and `/api/admin/activity`                                                                                                    |
| **IP tracking**              | Client IP recorded for each logged action (supports `X-Forwarded-For` for proxied environments)                                                                                      |
| **Request logging**          | HTTP method and path logged to console in development mode                                                                                                                           |
| **Database indexes**         | `system_logs` has indexes on `action_type`, `created_at`, and `(user_id, created_at)` for fast queries                                                                               |

### 10.7 Backup and Recovery Policy

| Policy                        | Recommendation                                                                                                                                          |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Database backups**          | Perform weekly full backups of the `glucogu_db` MySQL database using `mysqldump`                                                                        |
| **Backup storage**            | Store backups in a separate, secure location with restricted access                                                                                     |
| **Backup encryption**         | Encrypt backup files before storage                                                                                                                     |
| **Recovery testing**          | Test backup restoration quarterly to verify backup integrity                                                                                            |
| **Scheduled deletion safety** | User deletion is scheduled with a 60-second grace period; admin can cancel by re-activating the user before permanent deletion executes                 |
| **Transactional deletion**    | Permanent user deletion uses database transactions to ensure complete cascade of related records (messages, predictions, health profiles, appointments) |

---

## 11. Incident Response Plan

### 11.1 Detection

| Detection Method           | Description                                                                                                                                                                   |
| -------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **System Logs Monitoring** | Admin reviews `system_logs` table via the Activity Monitor and System Logs pages for unusual patterns — multiple role changes, mass deactivations, or unfamiliar IP addresses |
| **Login Failure Tracking** | `login_failure` and `account_locked` events in system_logs reveal brute-force patterns. Admin can monitor failed login trends across all users                                |
| **Login Lockout Alerts**   | Repeated account lockouts may indicate brute-force attacks. Admin can view all currently locked accounts via the Locked Accounts page (`GET /api/admin/locked-accounts`)      |
| **Rate Limit Triggers**    | HTTP 429 responses from rate limiters (auth: 10/15min, predictions: 5/min, messages: 20/min) indicate potential automated attacks                                             |
| **Failed Login Pattern**   | Monitoring `login_attempts` across users can reveal credential stuffing — multiple accounts showing elevated failure counts simultaneously                                    |
| **Prediction Audit Trail** | `prediction_created` events in system_logs track all ML predictions with risk levels, enabling detection of suspicious bulk prediction attempts                               |
| **Application Error Logs** | Server-side `console.error` logs capture unhandled errors that may indicate exploitation attempts (malformed payloads, injection attempts)                                    |
| **Database Auditing**      | Regular review of `users`, `predictions`, and `messages` tables for anomalous data (e.g., unusual spikes in prediction volume, unauthorized role escalations)                 |

### 11.2 Reporting

| Step                         | Action                                                                                                                            |
| ---------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| **Internal Reporting**       | The administrator who detects the incident documents the finding with timestamp, affected resources, and suspected attack vector  |
| **Log Preservation**         | Export relevant system logs from `GET /api/admin/logs` immediately — these serve as evidence and audit trail                      |
| **Stakeholder Notification** | Notify the development team and system owner with incident details                                                                |
| **User Notification**        | If user data may be compromised, notify affected users with details of what was accessed and recommended actions (password reset) |

### 11.3 Containment

| Threat                       | Containment Action                                                                                                                                                                                                      |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Compromised user account** | Admin deactivates the user via `PATCH /api/admin/users/:id/deactivate` — the auth middleware immediately blocks all further requests from the deactivated account                                                       |
| **Brute-force attack**       | Account lockout engages automatically after 5 failed attempts. Admin can view and manage locked accounts. Rate limiter blocks excessive requests at the network level                                                   |
| **Suspicious admin account** | Change the admin's role to `health_user` via the role management API to strip privileges immediately, then deactivate                                                                                                   |
| **Token compromise**         | Rotate `JWT_SECRET` and `JWT_REFRESH_SECRET` environment variables and restart the server — all existing tokens become invalid immediately. Individual tokens can also be blacklisted via the token blacklist mechanism |
| **Database credential leak** | Change the `DB_PASSWORD` environment variable, update MySQL user password, restart the application                                                                                                                      |
| **Malicious data injection** | Review and clean affected database records. Parameterized queries prevent SQL injection, but application-level data validation should also be reviewed                                                                  |

### 11.4 Recovery

| Step                               | Action                                                                                                                                                                                                                                         |
| ---------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Service Restoration**            | After containment, restart the application server with updated credentials/secrets                                                                                                                                                             |
| **Account Recovery**               | Re-activate legitimate user accounts that were deactivated during containment. Reset affected users' passwords by having them use the registration flow or direct database update                                                              |
| **Data Integrity Verification**    | Compare current database state against last known-good backup. Verify no unauthorized data modifications to `users`, `predictions`, or `system_logs` tables                                                                                    |
| **System Hardening**               | 1. Review and strengthen the specific vulnerability that was exploited. 2. Update all npm packages via `npm audit fix`. 3. Rotate all secrets even if not confirmed compromised. 4. Review and tighten rate limits if brute-force was involved |
| **Post-Incident Review**           | Document root cause, timeline, impact scope, and corrective actions. Update security policies based on lessons learned                                                                                                                         |
| **Backup Restoration (if needed)** | Restore the `glucogu_db` database from the most recent verified backup using `mysql < backup.sql`. Verify data integrity post-restoration                                                                                                      |

---

## Appendix A: Database Schema

### Users Table

```sql
CREATE TABLE users (
  user_id INT(11) PRIMARY KEY AUTO_INCREMENT,
  full_name VARCHAR(100) NOT NULL,
  email VARCHAR(120) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('health_user','staff','admin') NOT NULL,
  phone VARCHAR(20),
  is_active TINYINT(1) DEFAULT 1,
  login_attempts TINYINT UNSIGNED DEFAULT 0,
  locked_until DATETIME DEFAULT NULL,
  scheduled_delete_at DATETIME DEFAULT NULL,
  availability_status VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Predictions Table

```sql
CREATE TABLE predictions (
  prediction_id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  gender ENUM('Male','Female','Other'),
  age FLOAT, bmi FLOAT, HbA1c_level FLOAT, blood_glucose_level FLOAT,
  hypertension TINYINT(1), heart_disease TINYINT(1),
  smoking_history ENUM('never','former','current','not current','ever','No Info'),
  diabetes_result TINYINT(1),
  risk_level ENUM('low','moderate','high'),
  probability DECIMAL(5,2),
  predicted_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id),
  FOREIGN KEY (predicted_by) REFERENCES users(user_id)
);
```

### System Logs Table

```sql
CREATE TABLE system_logs (
  log_id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT,
  action_type VARCHAR(100),
  ip_address VARCHAR(50),
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id)
);
```

---

## Appendix B: API Route Summary

| Method | Route                             | Auth     | Role(s)      | Rate Limit         | Purpose                         |
| ------ | --------------------------------- | -------- | ------------ | ------------------ | ------------------------------- |
| POST   | `/api/auth/register`              | Public   | —            | Global (100/15min) | User registration               |
| POST   | `/api/auth/login`                 | Public   | —            | Login (5/15min)    | User login                      |
| GET    | `/api/auth/me`                    | Required | Any          | Global             | Get current session             |
| POST   | `/api/auth/logout`                | Public   | —            | Global             | Clear session & blacklist token |
| POST   | `/api/auth/refresh`               | Public   | —            | Global             | Refresh access token            |
| POST   | `/api/predictions/predict`        | Required | Any          | 5/min per user     | Submit ML prediction            |
| GET    | `/api/predictions/history`        | Required | Any          | Global             | Own prediction history          |
| GET    | `/api/profile/health`             | Required | health_user  | Global             | Get health profile              |
| PUT    | `/api/profile/health`             | Required | health_user  | Global             | Update health profile           |
| GET    | `/api/messages/inbox`             | Required | Any          | Global             | Message inbox                   |
| POST   | `/api/messages`                   | Required | Any          | 20/min per user    | Send message                    |
| GET    | `/api/appointments/my`            | Required | health_user  | Global             | Own appointments                |
| POST   | `/api/appointments`               | Required | health_user  | 10/hr per user     | Create appointment              |
| GET    | `/api/appointments/staff`         | Required | staff, admin | Global             | Staff appointments              |
| GET    | `/api/appointments/all`           | Required | admin        | Global             | All appointments                |
| GET    | `/api/admin/users`                | Required | admin        | Global             | List all users                  |
| GET    | `/api/admin/stats`                | Required | admin        | Global             | System statistics               |
| PATCH  | `/api/admin/users/:id/activate`   | Required | admin        | Global             | Activate user                   |
| PATCH  | `/api/admin/users/:id/deactivate` | Required | admin        | Global             | Deactivate user                 |
| PATCH  | `/api/admin/users/:id/unlock`     | Required | admin        | Global             | Unlock account                  |
| PATCH  | `/api/admin/users/:id/role`       | Required | admin        | Global             | Change user role                |
| DELETE | `/api/admin/users/:id`            | Required | admin        | Global             | Schedule user deletion          |
| GET    | `/api/admin/logs`                 | Required | admin        | Global             | View system logs                |
| GET    | `/api/admin/activity`             | Required | admin        | Global             | View recent activity            |
| GET    | `/api/admin/predictions`          | Required | admin        | Global             | All predictions report          |
| GET    | `/api/admin/locked-accounts`      | Required | admin        | Global             | Locked accounts list            |

---

_Document generated for the Glucogu Diabetes Risk Prediction System. All code references correspond to the project source at `D:\Downloads(March)\HealthPredict`._
