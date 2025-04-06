// app/(api)/ride+api.ts
import { neon } from "@neondatabase/serverless";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const origin = url.searchParams.get("origin");
    const destination = url.searchParams.get("destination");
    const fromLat = url.searchParams.get("fromLat");
    const fromLng = url.searchParams.get("fromLng");
    const toLat = url.searchParams.get("toLat");
    const toLng = url.searchParams.get("toLng");

    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      return new Response(
        JSON.stringify({ error: "Database connection URL is not defined" }),
        { status: 500 }
      );
    }

    const sql = neon(databaseUrl);

    const rides = await sql`
      SELECT 
        r.id,
        r.origin_address,
        r.destination_address,
        r.departure_time,
        r.price,
        r.car_model,
        r.available_seats,
        r.phone_number,
        u.name as driver_name
      FROM rides r
      JOIN users u ON r.clerk_id = u.clerk_id
      WHERE 
        r.origin_address ILIKE ${`%${origin}%`}
        AND r.destination_address ILIKE ${`%${destination}%`}
        AND r.departure_time > NOW()
      ORDER BY r.departure_time ASC
    `;

    return new Response(JSON.stringify(rides), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching rides:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
    });
  }
}