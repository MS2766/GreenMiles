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

app.post("/api/ride", async (req, res) => {
  const rideData = req.body;
  console.log("Ride data:", rideData);

  try {
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
      )
      VALUES (
        ${rideData.clerkID},
        ${rideData.originAddress},
        ${rideData.destinationAddress},
        ${new Date(rideData.departureTime)},
        ${Number(rideData.price)},
        ${rideData.car},
        ${Number(rideData.seats)},
        ${rideData.phone}
      )
      RETURNING id
    `;
    res.status(201).json({
      message: "Ride created successfully",
      rideId: result[0].id,
      data: rideData,
    });
  } catch (error) {
    console.error("Error hosting ride:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.listen(3000, "0.0.0.0", () => {
  console.log("Backend running on port 3000");
});
