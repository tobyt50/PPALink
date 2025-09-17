import http from "http";
import { Server } from 'socket.io';
import app from "./app";
import prisma from "./config/db";
import env from "./config/env";
import { configureSocket } from "./config/socket";

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173", // Allow connections from our frontend
    methods: ["GET", "POST"],
  },
});

configureSocket(io)

declare global {
  namespace Express {
    export interface Application {
      io: Server;
    }
  }
}
app.io = io;

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
