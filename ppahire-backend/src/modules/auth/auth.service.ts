import { Role } from '@prisma/client';
import prisma from '../../config/db';
import { hashPassword, signToken, verifyPassword } from '../utils/crypto';
import { LoginInput, RegisterAgencyInput, RegisterCandidateInput } from './auth.types';

// --- Candidate Registration Service ---
export async function registerCandidate(input: RegisterCandidateInput) {
  const { email, password, firstName, lastName, phone } = input;

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    throw new Error('User with this email already exists');
  }

  const passwordHash = await hashPassword(password);

  // Use a transaction to create both User and CandidateProfile
  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      phone,
      role: Role.CANDIDATE,
      candidateProfile: {
        create: {
          firstName,
          lastName,
          phone,
        },
      },
    },
    include: {
      candidateProfile: true, // Include the profile in the return
    },
  });

  // Exclude password hash from the returned user object
  const { passwordHash: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
}


// --- Agency Registration Service ---
export async function registerAgency(input: RegisterAgencyInput) {
  const { email, password, agencyName, phone } = input;

  // Check if user (agency owner) already exists
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    throw new Error('User with this email already exists');
  }

  const passwordHash = await hashPassword(password);

  // Use a transaction to ensure all related records are created successfully
  const result = await prisma.$transaction(async (tx) => {
    // 1. Create the User (owner)
    const owner = await tx.user.create({
      data: {
        email,
        passwordHash,
        phone,
        role: Role.AGENCY,
      },
    });

    // 2. Create the Agency, linking the owner
    const agency = await tx.agency.create({
      data: {
        name: agencyName,
        ownerUserId: owner.id,
      },
    });

    // 3. Create the AgencyMember record to officially add the owner to the agency
    await tx.agencyMember.create({
      data: {
        agencyId: agency.id,
        userId: owner.id,
        role: 'OWNER',
      },
    });

    return { owner, agency };
  });

  const { passwordHash: _, ...ownerWithoutPassword } = result.owner;
  return { owner: ownerWithoutPassword, agency: result.agency };
}

// --- Login Service ---
export async function login(input: LoginInput) {
    const { email, password } = input;
    
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
        throw new Error('Invalid email or password');
    }

    const isPasswordValid = await verifyPassword(user.passwordHash, password);
    if (!isPasswordValid) {
        throw new Error('Invalid email or password');
    }

    // Generate JWT
    const token = signToken({
        id: user.id,
        email: user.email,
        role: user.role,
    });
    
    const { passwordHash: _, ...userWithoutPassword } = user;

    return { user: userWithoutPassword, token };
}