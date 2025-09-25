import { Prisma } from '@prisma/client';
import prisma from '../../config/db';

interface GetAuditLogsQuery {
  page?: number;
  limit?: number;
  actorId?: string;
  action?: string;
  targetId?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Fetches all audit log entries with dynamic filtering, sorting, and pagination.
 */
export async function getAuditLogs(query: GetAuditLogsQuery) {
  const {
    page = 1,
    limit = 20,
    actorId,
    action,
    targetId,
    sortBy = 'createdAt',
    sortOrder = 'desc',
  } = query;

  const skip = (page - 1) * limit;

  // 1. Dynamically build the WHERE clause for filtering
  const where: Prisma.AuditLogWhereInput = {
    actorId: actorId ? actorId : undefined,
    action: action ? { contains: action, mode: 'insensitive' } : undefined,
    targetId: targetId ? targetId : undefined,
  };
  
  // 2. Dynamically build the ORDER BY clause for sorting
  const orderBy: Prisma.AuditLogOrderByWithRelationInput = {
    [sortBy]: sortOrder,
  };

  // 3. Use a transaction to fetch both the paginated data and the total count
  const [logs, total] = await prisma.$transaction([
    prisma.auditLog.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      include: {
        actor: { select: { email: true } },
      },
    }),
    prisma.auditLog.count({ where }),
  ]);

  return {
    data: logs,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}

/**
 * A central function to record an administrator's action in the audit log.
 * This is a "fire-and-forget" function; it should not interrupt the parent operation if it fails.
 *
 * @param actorId The ID of the admin user performing the action.
 * @param action A machine-readable string for the action (e.g., "user.suspend").
 * @param targetId The ID of the entity that was acted upon (e.g., a user's or job's ID).
 * @param metadata Optional JSON object for additional context (e.g., changed fields).
 */
export async function logAdminAction(
  actorId: string,
  action: string,
  targetId?: string,
  metadata?: Prisma.JsonObject
) {
  try {
    await prisma.auditLog.create({
      data: {
        actorId,
        action,
        targetId,
        metadata,
      },
    });
  } catch (error) {
    console.error(
      `CRITICAL: Failed to log admin action '${action}' for actor ${actorId}.`,
      error
    );
  }
}

/**
 * Fetches ALL audit log entries for a full CSV export.
 * This is an unpaginated, potentially heavy query.
 */
export async function getAllAuditLogsForExport() {
  return prisma.auditLog.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      actor: { select: { email: true } },
    },
  });
}

/**
 * Fetches a single audit log entry by its ID.
 * @param logId The ID of the audit log to fetch.
 */
export async function getAuditLogById(logId: string) {
  const log = await prisma.auditLog.findUnique({
    where: { id: logId },
    include: {
      actor: { select: { email: true } },
    },
  });

  if (!log) {
    throw new Error('Audit log not found.');
  }
  return log;
}