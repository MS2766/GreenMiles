/* eslint-disable prettier/prettier */
const express = require("express");
const { neon } = require("@neondatabase/serverless");
require("dotenv").config();
const app = express();

app.use(express.json());

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error("DATABASE_URL not set");
  process.exit(1);
}
const sql = neon(databaseUrl);

// Existing POST endpoint
app.post("/api/ride", async (req, res) => {
  const rideData = req.body;
  console.log("Ride data:", rideData);
  try {
    const result = await sql`
      INSERT INTO rides (
        clerk_id, origin_address, destination_address, departure_time,
        price, car_model, available_seats, phone_number
      ) VALUES (
        ${rideData.clerkID}, ${rideData.originAddress}, ${rideData.destinationAddress},
        ${new Date(rideData.departureTime)}, ${Number(rideData.price)},
        ${rideData.car}, ${Number(rideData.seats)}, ${rideData.phone}
      ) RETURNING id
    `;
    res.status(201).json({ message: "Ride created successfully", rideId: result[0].id, data: rideData });
  } catch (error) {
    console.error("Error hosting ride:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Added GET endpoint
app.get("/api/ride/search", async (req, res) => {
  try {
    const { origin, destination } = req.query;
    console.log("Search params:", { origin, destination }); // Debug log
    const rides = await sql`
      SELECT 
        r.id, r.origin_address, r.destination_address, r.departure_time,
        r.price, r.car_model, r.available_seats, r.phone_number,
        u.name as driver_name
      FROM rides r
      LEFT JOIN users u ON r.clerk_id = u.clerk_id
      WHERE 
        r.origin_address ILIKE ${`%${origin || ""}%`}
        AND r.destination_address ILIKE ${`%${destination || ""}%`}
        AND r.departure_time > NOW()
      ORDER BY r.departure_time ASC
    `;
    console.log("Rides found:", rides); // Debug log
    res.status(200).json(rides);
  } catch (error) {
    console.error("Error fetching rides:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.listen(3000, "0.0.0.0", () => {
  console.log("Backend running on port 3000");
});