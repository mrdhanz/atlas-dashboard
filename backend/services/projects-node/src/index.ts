/* eslint-disable @typescript-eslint/no-explicit-any */
import Fastify from "fastify";
import cors from "@fastify/cors";
import { Pool } from "pg";
import websocketPlugin from "@fastify/websocket";
import dotenv from "dotenv";
import type { WebSocket } from "ws";
import Redis from "ioredis";

if(!process.env.DB_CONNECTION_URI)
  dotenv.config();

const server = Fastify({ logger: true });

// --- WebSocket setup ---
// Keep track of all connected clients
const connections = new Set<WebSocket>();

server.register(websocketPlugin);
server.register(async function (instance) {
  instance.get("/ws", { websocket: true }, (connection /* SocketStream */) => {
    connections.add(connection);
    instance.log.info("Client connected");

    connection.onclose = () => {
      connections.delete(connection);
      instance.log.info("Client disconnected");
    };
  });
});

// Function to broadcast messages to all clients
function broadcast(data: any) {
  const message = JSON.stringify(data);
  for (const connection of connections) {
    connection.send(message);
  }
}
// --- End WebSocket setup ---

// We will store our pool in a variable that can be reassigned.
let pool: Pool;

function createDbPool(): Pool {
  server.log.info("Creating new database connection pool...");

  const newPool = new Pool({
    ...(process.env.DB_CONNECTION_URI
      ? { connectionString: process.env.DB_CONNECTION_URI }
      : {
          user: process.env.DB_USER,
          host: process.env.DB_HOST,
          database: process.env.DB_NAME,
          password: process.env.DB_PASSWORD,
          port: parseInt(process.env.DB_PORT || "5432"),
        }),
    // Optional: Add connection timeout to fail faster if DB is not available
    connectionTimeoutMillis: 5000,
  });

  // CRITICAL: Add an error listener to the pool.
  // This will be called for any idle client that encounters an error.
  newPool.on("error", (err) => {
    server.log.error("Unexpected error on idle client", err);
    // We will handle reconnection logic here.
    // For now, we will simply log. The real magic happens when a query fails.
  });

  return newPool;
}

// Initialize the pool for the first time
pool = createDbPool();

// Function to safely execute a query with reconnection logic
async function query(text: string, params?: any[]) {
  try {
    const client = await pool.connect();
    try {
      const res = await client.query(text, params);
      return res;
    } finally {
      // Make sure to release the client back to the pool
      client.release();
    }
  } catch (err: any) {
    server.log.error("Database query failed:", err.message);

    // If the error is a connection error, it's time to reconnect.
    if (err.message.includes("Connection terminated")) {
      server.log.warn("Database connection lost. Attempting to reconnect...");

      // End the old, broken pool
      await pool
        .end()
        .catch((e) => server.log.error("Error ending old pool:", e));

      // Create a new one
      pool = createDbPool();

      // You might want to retry the query here or throw a specific error
      // to let the caller decide. For simplicity, we'll throw.
      throw new Error("Database reconnected. Please retry the operation.");
    }

    // Re-throw other errors
    throw err;
  }
}
// --- End Resilient Database Connection ---

server.register(cors, {
  origin: process.env.CORS_ORIGIN || "http://localhost:3000",
});

// --- API Routes with Validation ---
interface ProjectBody {
  name: string;
  repository_url: string;
}
// GET route remains the same, as it has no body to validate.
server.get("/api/v1/projects", async (request, reply) => {
  try {
    const result = await query(
      "SELECT * FROM projects ORDER BY created_at DESC"
    );
    return result.rows;
  } catch (err) {
    server.log.error(err);
    reply.status(500).send({ error: "Internal Server Error" });
  }
});

server.post<{ Body: ProjectBody }>(
  "/api/v1/projects",
  async (request, reply) => {
    try {
      // 5. SAFE VALIDATION: Destructure directly from request.body.
      // Fastify (with TypeScript) infers the type from the generic.
      // If the body is malformed, Fastify will handle the error before it reaches here.
      const { name, repository_url } = request.body;

      if (!name || !repository_url) {
        return reply
          .status(400)
          .send({ error: "Missing required fields: name, repository_url" });
      }

      const result = await query(
        "INSERT INTO projects (name, repository_url) VALUES ($1, $2) RETURNING *",
        [name, repository_url]
      );

      const newProject = result.rows[0];

      broadcast({ type: "PROJECT_ADDED", payload: newProject });

      reply.status(201).send(newProject);
    } catch (err) {
      server.log.error(err);
      reply.status(500).send({ error: "Internal Server Error" });
    }
  }
);
// INTERNAL ENDPOINT: For other microservices to trigger a broadcast
server.post("/api/internal/broadcast", async (request, reply) => {
  try {
    // Here you could add a security check, e.g., an internal API key
    // For now, we trust any request from within our Docker network.
    const eventData = request.body;
    broadcast(eventData); // Use the existing broadcast function
    server.log.info({
      msg: "Broadcast triggered by internal service",
      event: eventData,
    });
    reply.status(200).send({ status: "broadcasted" });
  } catch (err) {
    server.log.error(err);
    reply.status(500).send({ error: "Internal Server Error" });
  }
});

// --- Redis and Health Check Setup ---
const redis = new Redis({
  host: "flexible-pug-51108.upstash.io", // Docker service name
  port: 6379,
  password: "AcekAAIjcDE4NjEzY2QxZjRlNjg0N2E3YjNhYWZhYjgxYmRiY2U0MXAxMA",
  tls: {},
});

// Report own health
setInterval(() => {
  // Set key with 30s expiration
  redis.set("health:projects-node", "healthy", "EX", 30);
}, 15000); // every 15 seconds

// NEW ENDPOINT: Provide an aggregated health status
server.get("/api/v1/health", async (request, reply) => {
  try {
    const keys = await redis.keys("health:*"); // Get all health keys
    const services = keys.map((key) => key.replace("health:", ""));

    const healthStatus = await Promise.all(
      keys.map(async (key, index) => {
        const status = await redis.get(key);
        return { name: services[index], status };
      })
    );

    return healthStatus;
  } catch (err) {
    server.log.error(err);
    reply.status(500).send({ error: "Internal Server Error" });
  }
});
// --- End Health Check Setup ---
// --- End API Routes ---

const start = async () => {
  try {
    await server.listen({ port: 8081, host: "0.0.0.0" });
  } catch (err) {
    if (
      err instanceof Error &&
      err.message === "Connection terminated unexpectedly"
    ) {
      pool
        .connect()
        .then(() => {
          server.log.info("Database connected successfully");
        })
        .catch((err) => {
          server.log.error("Database connection failed", err);
          process.exit(1);
        });
      return;
    }
    server.log.error(err);
    process.exit(1);
  }
};

start();
