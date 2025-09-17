import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../../middleware/validate';
import { deleteInvitationHandler, sendInvitationHandler } from './invitation.controller';

const router = Router();

const sendInviteSchema = z.object({
  email: z.string().email('Please provide a valid email address.'),
});

// POST /api/agencies/invitations
router.post('/', validate(sendInviteSchema), sendInvitationHandler);

// DELETE /api/agencies/invitations/:invitationId
router.delete('/:invitationId', deleteInvitationHandler);

export default router;