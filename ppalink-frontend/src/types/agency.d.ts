// This type should mirror the Agency model in your Prisma schema.
export interface Agency {
    id: string;
    ownerUserId: string;
    name: string;
    rcNumber: string | null;
    industryId: number | null;
    website: string | null;
    sizeRange: string | null;
    domainVerified: boolean;
    cacVerified: boolean;
    logoKey: string | null;
    headquartersStateId: number | null;
    lgaId: number | null;
    createdAt: string;
  }