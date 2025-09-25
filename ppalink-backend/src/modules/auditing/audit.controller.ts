import type { NextFunction, Request, Response } from 'express';
import { getAuditLogs, getAllAuditLogsForExport, getAuditLogById } from './audit.service';

export async function getAuditLogsHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const query = {
      page: req.query.page ? parseInt(req.query.page as string, 10) : 1,
      limit: req.query.limit ? parseInt(req.query.limit as string, 10) : 20,
      actorId: req.query.actorId as string | undefined,
      action: req.query.action as string | undefined,
      targetId: req.query.targetId as string | undefined,
      sortBy: req.query.sortBy as string | undefined,
      sortOrder: req.query.sortOrder as 'asc' | 'desc' | undefined,
    };

    const result = await getAuditLogs(query);
    
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
}

export async function exportAuditLogsHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const allLogs = await getAllAuditLogsForExport();
    res.status(200).json({ success: true, data: allLogs });
  } catch (error) {
    next(error);
  }
}

export async function getAuditLogByIdHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { logId } = req.params;
    const log = await getAuditLogById(logId);
    res.status(200).json({ success: true, data: log });
  } catch (error: any) {
    if (error.message.includes('not found')) {
      return res.status(404).json({ success: false, message: error.message });
    }
    next(error);
  }
}