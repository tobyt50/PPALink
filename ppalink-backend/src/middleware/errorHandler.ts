import { NextFunction, Request, Response } from "express";

export function errorHandler(err: any, req: Request, res: Response, _next: NextFunction) {
  console.error("❌ Error:", err);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
}
