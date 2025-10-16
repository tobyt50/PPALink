import { Router } from 'express';
import { authenticate } from '../../middleware/auth';
import {
  createUniversalPostHandler,
  deleteMyPostHandler,
  getMyFeedHandler,
  getMyPostByIdHandler,
  updateMyPostHandler,
  getMyPostsHandler, // Existing
} from './feed.controller';

const router = Router();

// All routes in this file require a user to be logged in.
router.use(authenticate);

// GET /api/feed -> Fetches the personalized feed for the user.
router.get('/', getMyFeedHandler);

// GET /api/feed/my-posts -> Fetches user's own posts.
router.get('/my-posts', getMyPostsHandler);

// GET /api/feed/:itemId -> Fetches a single post for editing by its owner.
router.get('/:itemId', getMyPostByIdHandler);

// POST /api/feed -> Universal Create for any logged-in user
router.post('/', createUniversalPostHandler);

// PATCH /api/feed/:itemId -> Universal Update for the post owner
router.patch('/:itemId', updateMyPostHandler);

// DELETE /api/feed/:itemId -> Universal Delete for the post owner
router.delete('/:itemId', deleteMyPostHandler);

export default router;