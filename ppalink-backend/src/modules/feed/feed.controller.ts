import type { NextFunction, Request, Response } from "express";
import type { AuthRequest } from "../../middleware/auth";
import {
  adminCreateFeedItem,
  adminDeleteFeedItem,
  adminGetAllFeedItems,
  adminGetFeedItemById,
  adminUpdateFeedItem,
  createUniversalPost,
  deleteMyPost,
  generateFeed,
  getMyPostById,
  getMyPosts,
  updateMyPost,
} from "./feed.service";
import { logAdminAction } from "../auditing/audit.service";
import { getAgencyByUserId } from "../agencies/agency.service";
import type { FeedCategory, Role } from "@prisma/client";

/**
 * Handler for fetching the personalized feed for the currently logged-in user.
 * Supports both candidates and agencies with role-specific personalization.
 */
export async function getMyFeedHandler(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user) return res.status(401).send();
  try {
    // 1. Get pagination and filter params from the query string
    const { category, cursor, search } = req.query;
    const feed = await generateFeed(
      req.user.id,
      req.user.role as Role,
      category as FeedCategory,
      cursor as string,
      search as string
    );
    res.status(200).json({ success: true, data: feed });
  } catch (error) { next(error); }
}

/**
 * Handler for fetching a single post by ID.
 */
export async function getMyPostByIdHandler(req: AuthRequest, res: Response, next: NextFunction) {
    if (!req.user) return res.status(401).send();
    try {
        const { itemId } = req.params;
        const post = await getMyPostById(itemId, req.user);
        res.status(200).json({ success: true, data: post });
    } catch (error: any) {
        if (error.message.includes('permission')) {
            return res.status(403).json({ success: false, message: error.message });
        }
        if (error.message.includes('not found')) {
            return res.status(404).json({ success: false, message: error.message });
        }
        next(error);
    }
}

/**
 * Handler for fetching all posts created by the currently logged-in user.
 */
export async function getMyPostsHandler(req: AuthRequest, res: Response, next: NextFunction) {
    if (!req.user) return res.status(401).send();
    try {
        const posts = await getMyPosts(req.user.id);
        res.status(200).json({ success: true, data: posts });
    } catch (error) {
        next(error);
    }
}

/**
 * A universal handler for any authenticated user (Candidate or Agency) to create a post.
 */
export async function createUniversalPostHandler(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  if (!req.user) return res.status(401).send();
  try {
    let agencyId: string | undefined = undefined;
    // If the user is an agency, find their agencyId to link the post
    if (req.user.role === "AGENCY" || req.user.role === "SUPER_ADMIN") {
      const agency = await getAgencyByUserId(req.user.id);
      agencyId = agency.id;
    }

    const post = await createUniversalPost(req.body, req.user.id, agencyId);
    res.status(201).json({ success: true, data: post });
  } catch (error: any) {
    if (error.message.includes("not permitted to post")) {
      return res.status(403).json({ success: false, message: error.message });
    }
    next(error);
  }
}

/**
 * A universal handler for any authenticated user to update their own post.
 */
export async function updateMyPostHandler(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  if (!req.user) return res.status(401).send();
  try {
    const { itemId } = req.params;
    const post = await updateMyPost(itemId, req.user.id, req.body);
    res.status(200).json({ success: true, data: post });
  } catch (error: any) {
    if (error.message.includes("not found or you do not have permission")) {
      return res.status(403).json({ success: false, message: error.message });
    }
    next(error);
  }
}

/**
 * A universal handler for any authenticated user to delete their own post.
 */
export async function deleteMyPostHandler(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  if (!req.user) return res.status(401).send();
  try {
    const { itemId } = req.params;
    await deleteMyPost(itemId, req.user.id);
    res.status(204).send();
  } catch (error: any) {
    if (error.message.includes("not found or you do not have permission")) {
      return res.status(403).json({ success: false, message: error.message });
    }
    next(error);
  }
}

// ADMIN CONTROLLER

export async function getAllFeedItemsHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const items = await adminGetAllFeedItems(req.query);
    res.status(200).json({ success: true, data: items });
  } catch (error) {
    next(error);
  }
}

export async function getFeedItemByIdHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { itemId } = req.params;
    const item = await adminGetFeedItemById(itemId);
    if (!item) {
      return res
        .status(404)
        .json({ success: false, message: "Feed item not found." });
    }
    res.status(200).json({ success: true, data: item });
  } catch (error) {
    next(error);
  }
}

export async function createFeedItemHandler(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  if (!req.user) return res.status(401).send();
  try {
    const newItem = await adminCreateFeedItem(req.body);
    // Log the admin action
    await logAdminAction(req.user.id, "feed.create", newItem.id, {
      title: newItem.title,
    });
    res.status(201).json({ success: true, data: newItem });
  } catch (error) {
    next(error);
  }
}

export async function updateFeedItemHandler(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  if (!req.user) return res.status(401).send();
  try {
    const { itemId } = req.params;
    const updatedItem = await adminUpdateFeedItem(itemId, req.body);
    await logAdminAction(req.user.id, "feed.update", updatedItem.id, {
      title: updatedItem.title,
    });
    res.status(200).json({ success: true, data: updatedItem });
  } catch (error) {
    next(error);
  }
}

export async function deleteFeedItemHandler(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  if (!req.user) return res.status(401).send();
  try {
    const { itemId } = req.params;
    const itemToDelete = await adminGetFeedItemById(itemId);
    await adminDeleteFeedItem(itemId);
    await logAdminAction(req.user.id, "feed.delete", itemId, {
      title: itemToDelete?.title,
    });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}