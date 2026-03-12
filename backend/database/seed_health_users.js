/**
 * Seed script: insert 100 health_user accounts + health profiles.
 *
 * Usage:  cd backend && node database/seed_health_users.js
 *
 * All users get password: Test@1234
 */

require("dotenv").config();
const bcrypt = require("bcryptjs");
const db = require("./db");
const { encrypt } = require("../middleware/encryption");

const PASSWORD = "Test@1234";
const SALT_ROUNDS = 12;
const TOTAL = 100;

/* ---- helpers ---- */
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randFloat = (min, max, decimals = 1) =>
  +(min + Math.random() * (max - min)).toFixed(decimals);
const randDate = (startYear, endYear) => {
  const y = startYear + Math.floor(Math.random() * (endYear - startYear + 1));
  const m = String(Math.floor(Math.random() * 12) + 1).padStart(2, "0");
  const d = String(Math.floor(Math.random() * 28) + 1).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const firstNames = [
  "Juan",
  "Maria",
  "Jose",
  "Ana",
  "Pedro",
  "Rosa",
  "Carlos",
  "Elena",
  "Miguel",
  "Sofia",
  "Antonio",
  "Isabella",
  "Rafael",
  "Carmen",
  "Luis",
  "Patricia",
  "Fernando",
  "Angela",
  "Ricardo",
  "Teresa",
  "Eduardo",
  "Gloria",
  "Ramon",
  "Linda",
  "Francisco",
  "Diana",
  "Roberto",
  "Marta",
  "Gabriel",
  "Lucia",
  "Andres",
  "Claudia",
  "Javier",
  "Monica",
  "Diego",
  "Sandra",
  "Felipe",
  "Cristina",
  "Alberto",
  "Paula",
  "Daniel",
  "Laura",
  "Victor",
  "Irene",
  "Oscar",
  "Adriana",
  "Manuel",
  "Julia",
  "Sergio",
  "Beatriz",
];

const lastNames = [
  "Dela Cruz",
  "Santos",
  "Reyes",
  "Garcia",
  "Fernandez",
  "Lopez",
  "Martinez",
  "Gonzales",
  "Ramos",
  "Aquino",
  "Torres",
  "Flores",
  "Rivera",
  "Castro",
  "Morales",
  "Bautista",
  "Villanueva",
  "Navarro",
  "Mendoza",
  "Pascual",
];

const genders = ["male", "female"];
const smokingStatuses = ["non-smoker", "former", "current"];
const countryCodes = ["+63", "+1", "+44", "+61", "+65"];

async function seed() {
  const hash = await bcrypt.hash(PASSWORD, SALT_ROUNDS);

  let inserted = 0;

  for (let i = 1; i <= TOTAL; i++) {
    const first = pick(firstNames);
    const last = pick(lastNames);
    const fullName = `${first} ${last}`;
    const email = `user${String(i).padStart(3, "0")}@healthpredict.test`;
    const phone = `+639${String(Math.floor(Math.random() * 900000000 + 100000000))}`;

    // Insert user
    const [userResult] = await db.query(
      `INSERT INTO users (full_name, email, password_hash, role, phone, is_active)
       VALUES (?, ?, ?, 'health_user', ?, 1)`,
      [fullName, email, hash, phone],
    );

    const userId = userResult.insertId;

    // Generate profile data
    const gender = pick(genders);
    const dob = randDate(1950, 2005);
    const heightCm = randFloat(145, 195);
    const weightKg = randFloat(40, 130);
    const bmi = +(weightKg / (heightCm / 100) ** 2).toFixed(1);
    const smoking = pick(smokingStatuses);
    const contactPhone = `${pick(countryCodes)}${Math.floor(Math.random() * 9000000000 + 1000000000)}`;

    // Encrypt contact_phone
    const encryptedPhone = JSON.stringify(encrypt(contactPhone));

    // Insert health profile
    await db.query(
      `INSERT INTO health_profiles (user_id, date_of_birth, gender, height_cm, weight_kg, bmi, smoking_status, contact_phone)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [userId, dob, gender, heightCm, weightKg, bmi, smoking, encryptedPhone],
    );

    inserted++;
    if (inserted % 25 === 0) console.log(`  ${inserted}/${TOTAL} inserted...`);
  }

  console.log(`\nDone — ${inserted} health_user accounts + profiles seeded.`);
  console.log(`Password for all: ${PASSWORD}`);
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed error:", err.message);
  process.exit(1);
});
