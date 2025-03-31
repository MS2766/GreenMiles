// app/(api)/ride+api.ts
import { neon } from "@neondatabase/serverless";

export async function POST(request: Request) {
  try {
    const databaseUrl = process.env.DATABASE_URL;

    if (!databaseUrl) {
      return new Response(
        JSON.stringify({ error: "Database connection URL is not defined" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    const sql = neon(databaseUrl);
    const {
      originAddress,
      destinationAddress,
      departureTime,
      price,
      car,
      seats,
      phone,
      clerkID,
    } = await request.json();

    // Validate required fields
    if (
      !originAddress ||
      !destinationAddress ||
      !departureTime ||
      !price ||
      !car ||
      !seats ||
      !phone ||
      !clerkID
    ) {
      return new Response(
        JSON.stringify({ error: "Invalid request: Missing required fields" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

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
        ${clerkID},
        ${originAddress},
        ${destinationAddress},
        ${new Date(departureTime)},
        ${Number(price)},
        ${car},
        ${Number(seats)},
        ${phone}
      )
      RETURNING id
    `;

    return new Response(
      JSON.stringify({
        message: "Ride hosted successfully",
        rideId: result[0].id,
      }),
      {
        status: 201,
        headers: { "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("Error hosting ride:", error);
    return new Response(
      JSON.stringify({
        error: "Internal Server Error",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
}
