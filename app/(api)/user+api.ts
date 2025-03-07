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

    const { name, email, clerkID } = await request.json();

    if (!name || !email || !clerkID) {
      return new Response(
        JSON.stringify({ error: "Invalid request: Missing required fields" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    const dbResponse = await sql`
      INSERT INTO users (name, email, clerk_id)
      VALUES (${name}, ${email}, ${clerkID})
      ON CONFLICT (clerk_id) DO UPDATE
      SET name = EXCLUDED.name,
          email = EXCLUDED.email
    `;

    return new Response(
      JSON.stringify({ message: "User added", clerkId: clerkID }),
      {
        status: 201,
        headers: { "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("Error adding user:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
