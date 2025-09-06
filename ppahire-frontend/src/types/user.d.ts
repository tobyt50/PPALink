// This type should mirror the `User` model in your Prisma schema,
// excluding sensitive fields like passwordHash.
export interface User {
    id: string;
    email: string;
    phone: string | null;
    role: 'ADMIN' | 'CANDIDATE' | 'AGENCY';
    status: 'ACTIVE' | 'SUSPENDED' | 'DELETED';
    createdAt: string; // Dates are often strings in JSON
    updatedAt: string;
  }