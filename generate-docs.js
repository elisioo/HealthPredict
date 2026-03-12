const {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  Table,
  TableRow,
  TableCell,
  WidthType,
  AlignmentType,
  BorderStyle,
  ShadingType,
  PageBreak,
  NumberFormat,
  convertInchesToTwip,
  UnderlineType,
  ImageRun,
} = require("docx");
const fs = require("fs");

const BLUE = "1F4E79";
const LIGHT_BLUE = "D6E4F0";
const DARK_TEXT = "1A1A1A";
const GRAY = "F2F2F2";
const ACCENT = "2E75B6";

function heading1(text) {
  return new Paragraph({
    text,
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 400, after: 160 },
    children: [
      new TextRun({
        text,
        bold: true,
        size: 28,
        color: BLUE,
        font: "Calibri",
      }),
    ],
  });
}

function heading2(text) {
  return new Paragraph({
    spacing: { before: 280, after: 120 },
    children: [
      new TextRun({
        text,
        bold: true,
        size: 24,
        color: ACCENT,
        font: "Calibri",
      }),
    ],
  });
}

function heading3(text) {
  return new Paragraph({
    spacing: { before: 200, after: 80 },
    children: [
      new TextRun({
        text,
        bold: true,
        size: 22,
        color: DARK_TEXT,
        font: "Calibri",
      }),
    ],
  });
}

function body(text, options = {}) {
  return new Paragraph({
    spacing: { after: 100 },
    children: [
      new TextRun({
        text,
        size: 20,
        font: "Calibri",
        ...options,
      }),
    ],
  });
}

function bullet(text, bold = false) {
  return new Paragraph({
    bullet: { level: 0 },
    spacing: { after: 80 },
    children: [
      new TextRun({
        text,
        size: 20,
        font: "Calibri",
        bold,
      }),
    ],
  });
}

function subBullet(text) {
  return new Paragraph({
    bullet: { level: 1 },
    spacing: { after: 60 },
    children: [
      new TextRun({
        text,
        size: 20,
        font: "Calibri",
      }),
    ],
  });
}

function code(text) {
  return new Paragraph({
    spacing: { after: 80 },
    shading: { type: ShadingType.SOLID, color: "F5F5F5" },
    children: [
      new TextRun({
        text,
        size: 18,
        font: "Courier New",
        color: "C7254E",
      }),
    ],
  });
}

function screenshot(label, guide) {
  return [
    new Paragraph({
      spacing: { before: 160, after: 60 },
      border: {
        top: { style: BorderStyle.SINGLE, size: 1, color: ACCENT },
        bottom: { style: BorderStyle.SINGLE, size: 1, color: ACCENT },
        left: { style: BorderStyle.SINGLE, size: 4, color: ACCENT },
        right: { style: BorderStyle.SINGLE, size: 1, color: ACCENT },
      },
      shading: { type: ShadingType.SOLID, color: "EBF3FB" },
      children: [
        new TextRun({
          text: `  SCREENSHOT – ${label}`,
          bold: true,
          size: 20,
          font: "Calibri",
          color: ACCENT,
        }),
      ],
    }),
    new Paragraph({
      spacing: { after: 60 },
      shading: { type: ShadingType.SOLID, color: "EBF3FB" },
      children: [
        new TextRun({
          text: `  How to capture: ${guide}`,
          italic: true,
          size: 18,
          font: "Calibri",
          color: "555555",
        }),
      ],
    }),
    new Paragraph({
      spacing: { after: 60 },
      shading: { type: ShadingType.SOLID, color: "FFFFFF" },
      border: {
        top: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" },
        bottom: { style: BorderStyle.DASHED, size: 1, color: "CCCCCC" },
        left: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" },
        right: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" },
      },
      children: [
        new TextRun({
          text: "     [ Paste screenshot here ]",
          size: 20,
          color: "AAAAAA",
          font: "Calibri",
          italics: true,
        }),
      ],
    }),
    new Paragraph({ spacing: { after: 160 } }),
  ];
}

function spacer() {
  return new Paragraph({ spacing: { after: 120 } });
}

function tableRow(cells, isHeader = false) {
  return new TableRow({
    tableHeader: isHeader,
    children: cells.map(
      (cell) =>
        new TableCell({
          shading: isHeader
            ? { type: ShadingType.SOLID, color: BLUE }
            : undefined,
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: cell,
                  bold: isHeader,
                  color: isHeader ? "FFFFFF" : DARK_TEXT,
                  size: 18,
                  font: "Calibri",
                }),
              ],
            }),
          ],
        }),
    ),
  });
}

function rbacTable() {
  const rows = [
    ["System Feature / Resource", "Guest", "Patient / User", "Staff", "Admin"],
    ["View Homepage / Landing Page", "✔ Yes", "✔ Yes", "✔ Yes", "✔ Yes"],
    ["Register Account", "✔ Yes", "✘ No", "✘ No", "✘ No"],
    ["Login", "✔ Yes", "✔ Yes", "✔ Yes", "✔ Yes"],
    ["View Own Health Dashboard", "✘ No", "✔ Yes", "✔ Yes", "✔ Yes"],
    ["Edit Personal Profile", "✘ No", "✔ Yes", "✔ Yes", "✔ Yes"],
    ["Submit Health Data & Predict", "✘ No", "✔ Yes", "✘ No", "✘ No"],
    ["View Own Prediction History", "✘ No", "✔ Yes", "✘ No", "✘ No"],
    ["Book Appointments", "✘ No", "✔ Yes", "✘ No", "✘ No"],
    ["View Appointments", "✘ No", "✔ Yes", "✔ Yes", "✔ Yes"],
    ["Send / Receive Messages", "✘ No", "✔ Yes", "✔ Yes", "✔ Yes"],
    ["View All Users & Predictions", "✘ No", "✘ No", "✘ No", "✔ Yes"],
    ["Manage Users (activate/lock)", "✘ No", "✘ No", "✘ No", "✔ Yes"],
    ["Assign / Change User Roles", "✘ No", "✘ No", "✘ No", "✔ Yes"],
    ["View System Logs", "✘ No", "✘ No", "✘ No", "✔ Yes"],
    ["View Activity Monitor", "✘ No", "✘ No", "✘ No", "✔ Yes"],
    ["Delete User Accounts", "✘ No", "✘ No", "✘ No", "✔ Yes"],
    ["Manage ML Model", "✘ No", "✘ No", "✘ No", "✔ Yes"],
  ];
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: rows.map((r, i) => tableRow(r, i === 0)),
  });
}

async function buildDoc() {
  const doc = new Document({
    styles: {
      default: {
        document: {
          run: { font: "Calibri", size: 20 },
        },
      },
    },
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: convertInchesToTwip(1),
              right: convertInchesToTwip(1),
              bottom: convertInchesToTwip(1),
              left: convertInchesToTwip(1.25),
            },
          },
        },
        children: [
          /* ── COVER PAGE ── */
          new Paragraph({ spacing: { before: 1200 } }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: "HEALTHPREDICT",
                bold: true,
                size: 56,
                color: BLUE,
                font: "Calibri",
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 160 },
            children: [
              new TextRun({
                text: "Health Prediction & Management System",
                size: 28,
                color: ACCENT,
                font: "Calibri",
              }),
            ],
          }),
          new Paragraph({ spacing: { before: 200 } }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: "Security & System Documentation",
                bold: true,
                size: 32,
                color: DARK_TEXT,
                font: "Calibri",
              }),
            ],
          }),
          new Paragraph({ spacing: { before: 600 } }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: "March 2026",
                size: 22,
                color: "666666",
                font: "Calibri",
              }),
            ],
          }),

          /* ── PAGE BREAK ── */
          new Paragraph({ children: [new PageBreak()] }),

          /* ══════════════════════════════════════════════
             SECTION 1 – PROJECT OVERVIEW
          ══════════════════════════════════════════════ */
          heading1("1. Project Overview"),

          heading2("System Description"),
          body(
            "HealthPredict is a web-based health management system that allows patients to submit their health data and receive diabetes risk predictions powered by a machine learning model. It also supports appointment booking, secure messaging between patients and healthcare staff, and a full admin dashboard for system management.",
          ),
          spacer(),

          heading2("Purpose of the System"),
          body("The system aims to:"),
          bullet(
            "Help patients monitor and understand their health risk for diabetes.",
          ),
          bullet(
            "Provide a secure platform for managing health records and appointments.",
          ),
          bullet(
            "Allow healthcare staff to communicate with patients through a secure messaging system.",
          ),
          bullet(
            "Give administrators full control over user accounts, system logs, and reports.",
          ),
          bullet(
            "Protect all user data using industry-standard security practices.",
          ),
          spacer(),

          heading2("Intended Users"),
          bullet(
            "Guests – Visitors who can view the landing page and register for an account.",
          ),
          bullet(
            "Patients (Health Users) – Registered users who submit health data, view predictions, book appointments, and send messages.",
          ),
          bullet(
            "Healthcare Staff – Medical team members who manage appointments and communicate with patients.",
          ),
          bullet(
            "Administrators – System managers who oversee all users, view audit logs, manage roles, and configure the system.",
          ),
          spacer(),

          heading2("Platform and Technology Used"),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              tableRow(["Category", "Technology"], true),
              tableRow([
                "Programming Language",
                "JavaScript (Node.js), Python",
              ]),
              tableRow(["Frontend Framework", "React.js"]),
              tableRow(["Backend Framework", "Express.js (Node.js)"]),
              tableRow([
                "Machine Learning",
                "Python (scikit-learn / custom model)",
              ]),
              tableRow(["Database", "MySQL"]),
              tableRow([
                "Platform",
                "Web Application (accessible via browser)",
              ]),
              tableRow([
                "Authentication",
                "JSON Web Tokens (JWT) + httpOnly Cookies",
              ]),
              tableRow([
                "Encryption",
                "AES-256-GCM (health data), bcrypt (passwords)",
              ]),
              tableRow([
                "Security Libraries",
                "Helmet, CORS, express-rate-limit, express-validator",
              ]),
            ],
          }),
          spacer(),

          /* ══════════════════════════════════════════════
             SECTION 2 – SECURE CODING PRACTICES
          ══════════════════════════════════════════════ */
          new Paragraph({ children: [new PageBreak()] }),
          heading1("2. Secure Coding Practices"),

          heading2("No Hardcoded Credentials"),
          body(
            "All sensitive values such as database passwords, encryption keys, JWT secrets, and API keys are stored in environment variable files (.env) that are never uploaded to the internet. The code only reads these values at runtime from the server environment.",
          ),
          spacer(),

          heading2("Sample – Environment Variable Usage"),
          code("// ✔ Secure: reading from environment, never written in code"),
          code("const jwtSecret = process.env.JWT_SECRET;"),
          code("const dbPassword = process.env.DB_PASSWORD;"),
          code("const encryptionKey = process.env.ENCRYPTION_KEY;"),
          spacer(),

          heading2("Other Secure Coding Practices Applied"),
          bullet(
            "JSON body size is limited to 10 KB to prevent large-payload attacks.",
          ),
          bullet(
            "All API routes are protected with security headers via the Helmet library (stops common browser-based attacks).",
          ),
          bullet(
            "CORS is configured to only allow requests from the official frontend address.",
          ),
          bullet(
            "Passwords are never stored or logged anywhere in the system.",
          ),
          bullet(
            "Database queries use parameterized statements to prevent SQL Injection.",
          ),
          spacer(),

          ...screenshot(
            "Environment Variables (.env file) — blurred sensitive values",
            "Open the backend/.env file. Take a screenshot and blur or highlight-redact the actual secret values. This shows that credentials are stored as environment variables, not hardcoded.",
          ),

          ...screenshot(
            "Helmet Security Headers in server.js",
            "Open backend/server.js. Screenshot the section starting with app.use(helmet()) through the CORS configuration block.",
          ),

          /* ══════════════════════════════════════════════
             SECTION 3 – AUTHENTICATION & AUTHORIZATION
          ══════════════════════════════════════════════ */
          new Paragraph({ children: [new PageBreak()] }),
          heading1("3. Authentication and Authorization"),

          heading2("Registration Process"),
          body("When a user registers, the system:"),
          bullet(
            "Validates all form inputs (name, email, password format, phone number).",
          ),
          bullet(
            "Requires the user to complete a Google reCAPTCHA challenge to prevent bots.",
          ),
          bullet(
            "Hashes the password using bcrypt with a strength setting of 12 rounds before saving it.",
          ),
          bullet(
            "Stores only the hashed password — the original password is never saved.",
          ),
          spacer(),

          heading2("Login Process"),
          body("When a user logs in, the system:"),
          bullet("Checks that the account exists and is active."),
          bullet("Verifies the password against the stored hash using bcrypt."),
          bullet(
            "Issues a short-lived Access Token (15 minutes) and a Refresh Token (7 days), both stored as secure httpOnly cookies.",
          ),
          bullet("Records the login attempt in the audit log."),
          bullet(
            "Locks the account after 5 consecutive failed login attempts.",
          ),
          spacer(),

          heading2("Password Hashing"),
          body(
            "Passwords are protected using bcrypt with 12 salt rounds. This means even if someone got access to the database, they could not read any user's password.",
          ),
          code(
            "// Password is hashed before saving — never stored as plain text",
          ),
          code("const SALT_ROUNDS = 12;"),
          code(
            "const hashedPassword = await bcrypt.hash(plainPassword, SALT_ROUNDS);",
          ),
          spacer(),

          heading2("Account Lockout Policy"),
          bullet(
            "After 5 failed login attempts — account is temporarily locked.",
          ),
          bullet("Lockout duration — 30 minutes."),
          bullet(
            "Administrators can manually unlock accounts from the admin dashboard.",
          ),
          spacer(),

          heading2("User Roles"),
          bullet(
            "Guest — Not logged in. Can only view the landing page and register.",
          ),
          bullet(
            "Patient (health_user) — Logged-in patient. Can use health features and messaging.",
          ),
          bullet(
            "Staff — Healthcare staff. Manages appointments and communicates with patients.",
          ),
          bullet(
            "Admin — Full system access including user management and logs.",
          ),
          spacer(),

          ...screenshot(
            "Registration Form with reCAPTCHA",
            "Open the app at https://glucogu.local:3001/register. Take a screenshot showing the registration form with the reCAPTCHA checkbox visible.",
          ),

          ...screenshot(
            "Login Page",
            "Navigate to https://glucogu.local:3001/login. Screenshot the login form.",
          ),

          ...screenshot(
            "Account Lockout Message",
            "On the login page, enter a wrong password 5 times. Screenshot the error message that says the account is locked.",
          ),

          ...screenshot(
            "Hashed Password in Database",
            "Open MySQL and run: SELECT email, password FROM users LIMIT 5; Screenshot the result showing the $2b$12$... hashed passwords, NOT plain text.",
          ),

          /* ══════════════════════════════════════════════
             SECTION 4 – DATA ENCRYPTION
          ══════════════════════════════════════════════ */
          new Paragraph({ children: [new PageBreak()] }),
          heading1("4. Data Encryption"),

          heading2("What Data is Encrypted"),
          body("The following types of data are protected with encryption:"),
          bullet(
            "Passwords — hashed using bcrypt (one-way, cannot be reversed).",
          ),
          bullet(
            "Sensitive health records — encrypted using AES-256-GCM before being saved to the database.",
          ),
          bullet(
            "All communication between browser and server — protected by HTTPS/TLS.",
          ),
          bullet(
            "Authentication tokens — stored in secure, httpOnly cookies that JavaScript cannot access.",
          ),
          spacer(),

          heading2("Encryption Methods"),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              tableRow(["What is Protected", "Method Used", "Purpose"], true),
              tableRow([
                "User Passwords",
                "bcrypt (12 rounds)",
                "Prevent password theft",
              ]),
              tableRow([
                "Sensitive Health Data",
                "AES-256-GCM",
                "Secure data stored in database",
              ]),
              tableRow([
                "Browser ↔ Server Traffic",
                "HTTPS / TLS",
                "Prevent network eavesdropping",
              ]),
              tableRow([
                "Auth Tokens",
                "httpOnly Cookies",
                "Prevent JavaScript access (XSS protection)",
              ]),
            ],
          }),
          spacer(),

          body(
            "AES-256-GCM is a military-grade encryption standard. Each piece of data is encrypted with a unique random key component (IV) so that even identical inputs produce different encrypted outputs.",
          ),
          spacer(),

          ...screenshot(
            "Encrypted Health Data in Database",
            "Open MySQL and query the health profiles table: SELECT * FROM health_profiles LIMIT 3; Screenshot the result showing encrypted values (hex strings) instead of readable health numbers.",
          ),

          ...screenshot(
            "HTTPS Padlock in Browser",
            "Open the app at https://glucogu.local:3001. Screenshot the browser address bar showing the padlock icon and 'https://'.",
          ),

          /* ══════════════════════════════════════════════
             SECTION 5 – INPUT VALIDATION & SANITIZATION
          ══════════════════════════════════════════════ */
          new Paragraph({ children: [new PageBreak()] }),
          heading1("5. Input Validation and Sanitization"),

          heading2("What Inputs are Validated"),
          body(
            "Every piece of data submitted by users is checked before being processed:",
          ),
          bullet(
            "Registration form — first name, last name, email format, password strength, phone number, selected role.",
          ),
          bullet("Login form — email format and presence of password."),
          bullet(
            "Health data form — numeric ranges for health metrics (e.g., glucose, BMI, blood pressure).",
          ),
          bullet("Appointment form — valid date, time, and reason."),
          bullet("Messages — length limits and HTML-tag stripping."),
          bullet("Password reset — matching codes and new password strength."),
          spacer(),

          heading2("Validation and Sanitization Tools"),
          bullet(
            "express-validator — checks that all submitted fields meet required formats and lengths before any processing.",
          ),
          bullet(
            "Custom XSS sanitizer — automatically strips all HTML tags from every incoming request body, query, and URL parameter. This prevents Cross-Site Scripting (XSS) attacks.",
          ),
          bullet(
            "Body size limit — request bodies are capped at 10 KB to prevent memory-exhaustion attacks.",
          ),
          spacer(),

          heading2("Password Strength Requirements"),
          bullet("Minimum 8 characters."),
          bullet("Must include at least one uppercase letter."),
          bullet("Must include at least one number."),
          bullet(
            "Must include at least one special character (e.g., !, @, #).",
          ),
          spacer(),

          ...screenshot(
            "Validation Error — Missing or Invalid Fields",
            "On the registration or login page, submit the form with an empty email or a weak password (e.g., 'abc'). Screenshot the red error messages shown below the fields.",
          ),

          ...screenshot(
            "XSS Attempt Rejected",
            "In any text input field (e.g., name or message), type: <script>alert('hacked')</script> and submit. Screenshot showing that the script was stripped and no popup appeared.",
          ),

          /* ══════════════════════════════════════════════
             SECTION 6 – ERROR HANDLING & LOGGING
          ══════════════════════════════════════════════ */
          new Paragraph({ children: [new PageBreak()] }),
          heading1("6. Error Handling and Logging"),

          heading2("Safe Error Messages"),
          body(
            "When an error occurs, the system shows a simple, user-friendly message without revealing any technical details (such as database structure, stack traces, or internal file paths). For example:",
          ),
          bullet(
            '"Invalid credentials" — instead of "User not found in table users"',
          ),
          bullet(
            '"Something went wrong" — instead of showing a full database error',
          ),
          body(
            "This prevents attackers from using error messages to learn about the system's internals.",
          ),
          spacer(),

          heading2("What Gets Logged"),
          body(
            "The system records the following events in a secure audit log stored in the database:",
          ),
          bullet(
            "LOGIN_SUCCESS — Successful user login with timestamp and IP address.",
          ),
          bullet("LOGIN_FAILED — Failed login attempt with IP address."),
          bullet(
            "ACCOUNT_LOCKED — Account locked after too many failed attempts.",
          ),
          bullet("LOGOUT — User logout event."),
          bullet("REGISTER — New account created."),
          bullet("PASSWORD_RESET — Password reset requested or completed."),
          bullet("ROLE_CHANGED — Admin changed a user's role."),
          bullet("USER_DEACTIVATED / USER_ACTIVATED — Account status changes."),
          bullet("PREDICTION_MADE — Patient submitted a health prediction."),
          spacer(),

          body(
            "Each log entry includes: the user's ID, the action type, the IP address, a description, and a timestamp.",
          ),
          spacer(),

          ...screenshot(
            "System Logs in Admin Dashboard",
            "Log in as admin, go to System Logs page. Screenshot the table showing log entries with columns: User, Action Type, IP Address, Description, and Timestamp.",
          ),

          ...screenshot(
            "User-Friendly Error Message",
            "Go to the login page and enter a wrong password. Screenshot the error message on screen — it should say something generic like 'Invalid credentials', not show a database error.",
          ),

          /* ══════════════════════════════════════════════
             SECTION 7 – ACCESS CONTROL
          ══════════════════════════════════════════════ */
          new Paragraph({ children: [new PageBreak()] }),
          heading1("7. Access Control"),

          heading2("How Unauthorized Access is Prevented"),
          body(
            "Every protected page and API route checks two things before allowing access:",
          ),
          bullet(
            "Authentication — Is the user logged in? (Valid JWT token required)",
          ),
          bullet(
            "Authorization — Does the user have the correct role for this action?",
          ),
          body(
            "If either check fails, the system returns an error and the user is redirected to the login page or shown an 'Access Denied' message. The token is stored in a secure httpOnly cookie that cannot be stolen via JavaScript.",
          ),
          spacer(),

          heading2("Role-Based Access Control (RBAC) Table"),
          spacer(),
          rbacTable(),
          spacer(),

          body(
            "Note: Tokens are automatically invalidated on logout using a server-side token blacklist. Expired tokens are also rejected.",
          ),
          spacer(),

          ...screenshot(
            "Admin Dashboard — User Management",
            "Log in as admin. Navigate to the Manage Users page. Screenshot the user list table showing user roles, status (active/inactive), and action buttons.",
          ),

          ...screenshot(
            "Access Denied — Non-Admin tries Admin Page",
            "Log in as a regular patient. Try to navigate directly to https://glucogu.local:3001/admin. Screenshot the redirect to login or the 'Access Denied' message.",
          ),

          ...screenshot(
            "Protected Route — Not Logged In",
            "Log out completely. Try to open https://glucogu.local:3001/dashboard in the browser. Screenshot the redirect back to the login page.",
          ),

          /* ══════════════════════════════════════════════
             SECTION 8 – CODE AUDITING TOOLS
          ══════════════════════════════════════════════ */
          new Paragraph({ children: [new PageBreak()] }),
          heading1("8. Code Auditing Tools"),

          heading2("Tools Used"),
          bullet(
            "ESLint — Scans JavaScript code for syntax errors, insecure patterns, and coding standard violations. Configured with security-focused rules.",
          ),
          bullet(
            "npm audit — Built-in Node.js tool that checks all installed packages against a database of known security vulnerabilities.",
          ),
          bullet(
            "SonarLint (VS Code extension) — Real-time code quality and security scanning inside the code editor.",
          ),
          spacer(),

          heading2("Scan Results Summary"),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              tableRow(["Tool", "Finding", "Action Taken"], true),
              tableRow([
                "npm audit",
                "0 high/critical vulnerabilities found",
                "No action required",
              ]),
              tableRow([
                "ESLint",
                "Unused variable warnings",
                "Variables removed",
              ]),
              tableRow([
                "SonarLint",
                "Minor code smell suggestions",
                "Code cleaned up",
              ]),
              tableRow([
                "Manual Review",
                "Hardcoded credentials",
                "Moved to .env files",
              ]),
            ],
          }),
          spacer(),

          ...screenshot(
            "npm audit Result",
            "Open a terminal in the project folder. Run: npm audit Screenshot the output showing 0 critical vulnerabilities.",
          ),

          ...screenshot(
            "ESLint Output",
            "In VS Code, look at the Problems panel (View > Problems). Screenshot it showing no critical errors, or screenshot the terminal output of running: npx eslint backend/server.js",
          ),

          /* ══════════════════════════════════════════════
             SECTION 9 – TESTING
          ══════════════════════════════════════════════ */
          new Paragraph({ children: [new PageBreak()] }),
          heading1("9. Testing"),

          heading2("Types of Tests Performed"),
          body(
            "The following scenarios were manually tested to verify the system works securely and correctly:",
          ),
          spacer(),

          heading3("Authentication Tests"),
          bullet(
            "Register a new account with valid data — account created successfully.",
          ),
          bullet(
            "Register with an existing email — error message shown, no duplicate account.",
          ),
          bullet("Register with a weak password — validation error shown."),
          bullet("Login with correct credentials — dashboard loaded."),
          bullet("Login with wrong password — error shown, attempt logged."),
          bullet(
            "Login after 5 wrong attempts — account locked message shown.",
          ),
          bullet("Logout — token invalidated, redirect to login page."),
          spacer(),

          heading3("Access Control Tests"),
          bullet(
            "Visit admin pages while logged in as a patient — access denied.",
          ),
          bullet("Visit dashboard while not logged in — redirected to login."),
          bullet(
            "Access API endpoints without a token — 401 Unauthorized returned.",
          ),
          spacer(),

          heading3("Input Validation Tests"),
          bullet("Submit form with empty fields — validation errors shown."),
          bullet(
            "Submit HTML/script tags in text fields — tags stripped, no popup.",
          ),
          bullet("Submit an extremely long input — request rejected."),
          spacer(),

          heading3("Feature Tests"),
          bullet("Health prediction form — submits data, returns risk result."),
          bullet("Appointment booking — creates appointment, visible in list."),
          bullet("Messaging — patient sends message, staff can reply."),
          bullet(
            "Admin: activate / deactivate user — status changes reflected.",
          ),
          bullet("Admin: view system logs — logs load correctly with filters."),
          bullet(
            "Forgot password flow — OTP sent by email, password reset works.",
          ),
          spacer(),

          ...screenshot(
            "Successful Login and Dashboard",
            "Log in as a patient with valid credentials. Screenshot the dashboard page after successful login.",
          ),

          ...screenshot(
            "Health Prediction Result",
            "Fill in the health prediction form and submit it. Screenshot the result page showing the risk prediction output.",
          ),

          ...screenshot(
            "Appointment Booking Confirmation",
            "Book an appointment as a patient. Screenshot the confirmation message or the appointment in the appointments list.",
          ),

          ...screenshot(
            "Messaging — Sent and Received",
            "As a patient, send a message to staff. Screenshot the conversation showing the sent message. Then log in as staff and screenshot the reply.",
          ),

          ...screenshot(
            "Admin — Activate/Deactivate User",
            "Log in as admin, go to Manage Users. Click activate or deactivate on a user. Screenshot the change in status.",
          ),

          ...screenshot(
            "Forgot Password — OTP Email",
            "On the login page, click 'Forgot Password', enter an email. Screenshot the email received with the OTP code (blur sensitive parts if needed).",
          ),

          /* ══════════════════════════════════════════════
             SECTION 10 – SECURITY POLICIES
          ══════════════════════════════════════════════ */
          new Paragraph({ children: [new PageBreak()] }),
          heading1("10. Security Policies"),

          heading2("Password Policy"),
          bullet("Minimum length: 8 characters."),
          bullet(
            "Must contain uppercase letters, numbers, and special characters.",
          ),
          bullet(
            "Passwords are never stored in plain text — always hashed with bcrypt.",
          ),
          bullet(
            "Password reset requires a one-time PIN (OTP) sent to the registered email.",
          ),
          spacer(),

          heading2("Login Attempt Policy"),
          bullet(
            "Maximum of 5 failed login attempts before account is locked.",
          ),
          bullet("Account lockout duration: 30 minutes."),
          bullet(
            "Rate limiting: Maximum 10 login requests per 15 minutes per IP address.",
          ),
          bullet(
            "All failed attempts are logged with the IP address and timestamp.",
          ),
          spacer(),

          heading2("Data Handling Policy"),
          bullet(
            "All sensitive health data is encrypted with AES-256-GCM before database storage.",
          ),
          bullet("Only authorized users can access their own health data."),
          bullet(
            "Administrators can view anonymized statistics but not individual health records.",
          ),
          bullet(
            "Soft-deleted accounts are marked for deletion and purged after a scheduled period.",
          ),
          spacer(),

          heading2("Access Control Policy"),
          bullet(
            "All API routes are protected — unauthenticated requests are rejected.",
          ),
          bullet(
            "Role checks are enforced server-side, not just in the frontend.",
          ),
          bullet(
            "Admin-only routes require both authentication and the 'admin' role.",
          ),
          bullet(
            "All unauthorized access attempts are recorded in the audit log.",
          ),
          spacer(),

          heading2("Logging and Monitoring Policy"),
          bullet(
            "All user actions (login, logout, profile changes, predictions) are logged.",
          ),
          bullet(
            "Logs store: user ID, action type, IP address, description, and timestamp.",
          ),
          bullet("Administrators can review logs from the System Logs page."),
          bullet(
            "Suspicious activity (multiple failed logins, locked accounts) is visible in the Activity Monitor.",
          ),
          spacer(),

          heading2("Backup and Recovery Policy"),
          bullet("Database backups should be performed at least weekly."),
          bullet("Backups should be stored in a secure, separate location."),
          bullet(
            "Environment variable files (.env) must be backed up separately and kept confidential.",
          ),
          bullet(
            "System recovery involves restoring the latest backup and redeploying the application.",
          ),
          spacer(),

          /* ══════════════════════════════════════════════
             SECTION 11 – INCIDENT RESPONSE PLAN
          ══════════════════════════════════════════════ */
          new Paragraph({ children: [new PageBreak()] }),
          heading1("11. Incident Response Plan"),

          body(
            "An incident is any event that threatens the security or availability of the system, such as unauthorized access, data breach, or system failure.",
          ),
          spacer(),

          heading2("Step 1 — Detection"),
          body("Incidents are detected through:"),
          bullet(
            "System logs and audit trails — administrators review the System Logs page for unusual activity.",
          ),
          bullet(
            "Activity Monitor — shows recent actions, failed logins, and locked accounts in real time.",
          ),
          bullet(
            "User reports — users can report suspicious activity through the messaging system.",
          ),
          bullet(
            "Automated rate limiting — repeated unusual requests are automatically blocked and logged.",
          ),
          spacer(),

          heading2("Step 2 — Reporting"),
          body("Once an incident is detected:"),
          bullet(
            "The administrator documents the incident: date, time, type, and affected accounts.",
          ),
          bullet(
            "Affected users are notified if their data may have been compromised.",
          ),
          bullet(
            "The incident is escalated to the system owner or security team.",
          ),
          spacer(),

          heading2("Step 3 — Containment"),
          body("To stop the threat from spreading:"),
          bullet(
            "Affected user accounts are immediately deactivated from the Admin Dashboard.",
          ),
          bullet(
            "Suspicious IP addresses can be blocked at the server or firewall level.",
          ),
          bullet(
            "Active sessions are invalidated by clearing the token blacklist and rotating JWT secrets.",
          ),
          bullet(
            "The compromised feature or route is temporarily disabled if necessary.",
          ),
          spacer(),

          heading2("Step 4 — Recovery"),
          body("To restore normal operation:"),
          bullet("The system is restored from the most recent clean backup."),
          bullet(
            "Security patches are applied to address the vulnerability that was exploited.",
          ),
          bullet(
            "Affected users are required to reset their passwords before logging in again.",
          ),
          bullet(
            "All actions taken during the response are documented for future reference.",
          ),
          spacer(),

          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              tableRow(["Phase", "Action", "Responsible Party"], true),
              tableRow([
                "Detection",
                "Review System Logs and Activity Monitor",
                "Administrator",
              ]),
              tableRow([
                "Reporting",
                "Document and escalate the incident",
                "Administrator / System Owner",
              ]),
              tableRow([
                "Containment",
                "Deactivate accounts, block IPs, invalidate tokens",
                "Administrator",
              ]),
              tableRow([
                "Recovery",
                "Restore from backup, patch, reset affected passwords",
                "Administrator / Developer",
              ]),
            ],
          }),
          spacer(),

          ...screenshot(
            "Activity Monitor in Admin Dashboard",
            "Log in as admin. Navigate to the Activity Monitor page. Screenshot the page showing recent user activities, logins, and any flagged events.",
          ),

          ...screenshot(
            "Locked Account in Admin Dashboard",
            "Log in as admin. Go to Manage Users or the Locked Accounts view. Screenshot showing a locked user account with the unlock button visible.",
          ),

          /* ── End ── */
          spacer(),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 400 },
            children: [
              new TextRun({
                text: "— End of Document —",
                size: 18,
                color: "999999",
                font: "Calibri",
                italics: true,
              }),
            ],
          }),
        ],
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync("HealthPredict_Security_Documentation.docx", buffer);
  console.log(
    "✔  HealthPredict_Security_Documentation.docx created successfully.",
  );
}

buildDoc().catch(console.error);
