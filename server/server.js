/* eslint-disable prettier/prettier */
const express = require("express");
const { neon } = require("@neondatabase/serverless");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error("DATABASE_URL not set");
  process.exit(1);
}
const sql = neon(databaseUrl);

// POST endpoint for creating/updating user (based on email)
app.post("/api/user", async (req, res) => {
  const userData = req.body;
  console.log("Received user data for /api/user:", userData);

  try {
    if (!userData.email || !userData.name) {
      return res.status(400).json({
        error: "Missing required fields: email and name are required",
      });
    }

    // Check if the email already exists in the database
    const existingUser = await sql`
      SELECT id, clerk_id, name, email FROM users WHERE email = ${userData.email}
    `;

    if (existingUser.length > 0) {
      // Update existing user if clerk_id differs or name needs updating
      const currentClerkId = existingUser[0].clerk_id;
      if (currentClerkId !== userData.clerkID || existingUser[0].name !== userData.name) {
        await sql`
          UPDATE users 
          SET name = ${userData.name}, clerk_id = ${userData.clerkID || currentClerkId}
          WHERE email = ${userData.email}
        `;
        console.log("Existing user updated with email:", userData.email);
      } else {
        console.log("No changes needed for user with email:", userData.email);
      }
    } else {
      // Insert new user if email doesn't exist in database
      const result = await sql`
        INSERT INTO users (clerk_id, name, email)
        VALUES (${userData.clerkID || null}, ${userData.name}, ${userData.email})
        RETURNING id
      `;
      console.log("New user created with email:", userData.email);
    }

    res.status(200).json({ message: "User synced successfully" });
  } catch (error) {
    console.error("Error syncing user:", error.stack || error);
    if (error.message.includes("duplicate key value violates unique constraint")) {
      console.warn("Clerk rejected email not in database:", userData.email);
      return res.status(409).json({
        error: "Email conflict detected (Clerk issue)",
        details: "This email is taken in Clerk but not in the database. Check Clerk dashboard or use a different email.",
      });
    }
    res.status(500).json({
      error: "Failed to sync user",
      details: error.message || "Unknown error",
    });
  }
});

// POST endpoint for hosting a ride (verify by email)
app.post("/api/ride", async (req, res) => {
  const rideData = req.body;
  console.log("Received ride data:", rideData);

  try {
    // Verify user exists by email
    const user = await sql`
      SELECT clerk_id FROM users WHERE email = ${rideData.email}
    `;

    if (user.length === 0) {
      return res.status(400).json({
        error: "User not found. Please ensure you're registered with this email.",
      });
    }

    // Use the first clerk_id if multiple exist
    const clerkID = user[0].clerk_id || rideData.clerkID;

    // Validate required fields
    const requiredFields = [
      "email",
      "originAddress",
      "destinationAddress",
      "departureTime",
      "price",
      "car",
      "seats",
      "phone",
    ];

    const missingFields = requiredFields.filter((field) => !rideData[field]);
    if (missingFields.length > 0) {
      return res
        .status(400)
        .json({ error: `Missing required fields: ${missingFields.join(", ")}` });
    }

    // Insert ride into database with the verified clerk_id
    const result = await sql`
      INSERT INTO rides (
        clerk_id,
        origin_address,
        destination_address,
        departure_time,
        price,
        car_model,
        available_seats,
        phone_number
      ) VALUES (
        ${clerkID},
        ${rideData.originAddress},
        ${rideData.destinationAddress},
        ${new Date(rideData.departureTime)},
        ${Number(rideData.price)},
        ${rideData.car},
        ${Number(rideData.seats)},
        ${rideData.phone}
      ) RETURNING id
    `;

    console.log("Database insert result:", result);
    res.status(201).json({
      message: "Ride created successfully",
      rideId: result[0].id,
      data: rideData,
    });
  } catch (error) {
    console.error("Database error:", error.stack || error);
    res.status(500).json({
      error: "Failed to host ride. Please try again later.",
      details: error.message,
    });
  }
});

// GET endpoint for searching rides
app.get("/api/ride/search", async (req, res) => {
  try {
    const { origin, destination } = req.query;
    console.log("Search params:", { origin, destination });
    const rides = await sql`
      SELECT 
        r.id, r.origin_address, r.destination_address, r.departure_time,
        r.price, r.car_model, r.available_seats, r.phone_number,
        u.name AS driver_name
      FROM rides r
      LEFT JOIN users u ON r.clerk_id = u.clerk_id
      WHERE 
        r.origin_address ILIKE ${`%${origin || ""}%`}
        AND r.destination_address ILIKE ${`%${destination || ""}%`}
        AND r.departure_time > NOW()
      ORDER BY r.departure_time ASC
    `;
    console.log("Rides found:", rides);
    res.status(200).json(rides);
  } catch (error) {
    console.error("Error fetching rides:", error);
    res.status(500).json({ error: "Failed to fetch rides. Please try again later." });
  }
});

// GET endpoint for a specific ride by ID
app.get("/api/ride/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const rideId = parseInt(id, 10);
    if (isNaN(rideId)) {
      return res.status(400).json({ error: "Invalid ride ID" });
    }

    const rides = await sql`
      SELECT 
        r.id, r.origin_address, r.destination_address, r.departure_time,
        r.price, r.car_model, r.available_seats, r.phone_number,
        u.name AS driver_name
      FROM rides r
      LEFT JOIN users u ON r.clerk_id = u.clerk_id
      WHERE r.id = ${rideId} LIMIT 1
    `;
    if (rides.length > 0) {
      res.status(200).json(rides[0]);
    } else {
      res.status(404).json({ error: "Ride not found" });
    }
  } catch (error) {
    console.error("Error fetching ride:", error);
    res.status(500).json({ error: "Failed to fetch ride details. Please try again later." });
  }
});

app.listen(3000, "0.0.0.0", () => {
  console.log("Backend running on port 3000");
});