// Seeds default login accounts with properly bcrypt-hashed passwords.
// Run with: npm run seed
const bcrypt = require("bcryptjs");
const pool = require("./config/db");

async function seed() {
  const client = await pool.connect();
  try {
    const password = await bcrypt.hash("password123", 10);

    const users = [
      { username: "admin", name: "Administrator", role: "administrator" },
      { username: "drbudi", name: "dr. Budi Santoso", role: "dokter" },
      {
        username: "petugas1",
        name: "Siti Petugas",
        role: "petugas_pendaftaran",
      },
    ];

    for (const u of users) {
      const existing = await client.query(
        "SELECT id FROM users WHERE username = $1",
        [u.username],
      );
      if (existing.rows.length === 0) {
        await client.query(
          "INSERT INTO users (username, password, name, role) VALUES ($1,$2,$3,$4)",
          [u.username, password, u.name, u.role],
        );
        console.log(`Created user: ${u.username} / password123 (${u.role})`);
      } else {
        console.log(`User already exists, skipped: ${u.username}`);
      }
    }

    // Link dr. Budi Santoso's user account to the doctors master table
    const doctorUser = await client.query(
      "SELECT id FROM users WHERE username = $1",
      ["drbudi"],
    );
    const existingDoctor = await client.query(
      "SELECT id FROM doctors WHERE user_id = $1",
      [doctorUser.rows[0].id],
    );
    if (existingDoctor.rows.length === 0) {
      await client.query(
        `INSERT INTO doctors (user_id, poli_id, name, sip_number) VALUES ($1, 1, 'dr. Budi Santoso', 'SIP.001/2024')`,
        [doctorUser.rows[0].id],
      );
      console.log("Created doctor record for dr. Budi Santoso");
    }

    console.log("Seeding complete.");
  } catch (err) {
    console.error("Seeding failed:", err);
  } finally {
    client.release();
    await pool.end();
  }
}

seed();
