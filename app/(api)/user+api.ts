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

    await sql`
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

export async function DELETE(request: Request) {
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
    const { clerkID } = await request.json();

    if (!clerkID) {
      return new Response(
        JSON.stringify({ error: "Invalid request: Missing clerkID" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    await sql`
      DELETE FROM users
      WHERE clerk_id = ${clerkID}
    `;

    return new Response(
      JSON.stringify({ message: "User deleted", clerkId: clerkID }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("Error deleting user:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
