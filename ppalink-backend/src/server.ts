import http from "http";
import app from "./app";
import prisma from "./config/db";
import env from "./config/env";

const server = http.createServer(app);

async function start() {
  try {
    await prisma.$connect();
    console.log("✅ Database connected");

    server.listen(env.PORT, () => {
      console.log(`🚀 Server running on http://localhost:${env.PORT}`);
    });
  } catch (err) {
    console.error("❌ Failed to start server", err);
    process.exit(1);
  }
}

start();
