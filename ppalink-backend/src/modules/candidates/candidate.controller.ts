import { NextFunction, Response } from "express";
import { AuthRequest } from "../../middleware/auth";
import {
  getCandidateProfileById,
  getMyApplications,
  updateCandidateProfile,
  getCandidateDashboardData,
  markOnboardingAsComplete,
  updateCandidateSummary,
  setCandidateSkills,
  updateCandidateCv,
  getMyCandidateProfile,
  getRecommendedJobs,
  followAgency,
  unfollowAgency,
  getFollowingFeed,
} from "./candidate.service";
import { UpdateCandidateProfileInput } from "./candidate.types";

/**
 * Handler to get the profile of the currently authenticated user.
 */
export async function getMyProfileHandler(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  if (!req.user) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  try {
    const profile = await getMyCandidateProfile(req.user.id);
    return res.status(200).json({ success: true, data: profile });
  } catch (error) {
    next(error);
  }
}

/**
 * Handler to update the profile of the currently authenticated user.
 */
export async function updateMyProfileHandler(
  req: AuthRequest, // Use AuthRequest here
  res: Response,
  next: NextFunction
) {
  if (!req.user) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  const data: UpdateCandidateProfileInput = req.body;

  try {
    const updatedProfile = await updateCandidateProfile(req.user.id, data);
    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: updatedProfile,
    });
  } catch (error) {
    next(error);
  }
}

export async function getPublicCandidateProfileHandler(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const { candidateId } = req.params;
    if (!candidateId) {
      return res
        .status(400)
        .json({ success: false, message: "Candidate ID is required." });
    }

    const profile = await getCandidateProfileById(candidateId);

    // In a future step, you could add logic here to hide sensitive info if needed

    return res.status(200).json({ success: true, data: profile });
  } catch (error: any) {
    if (error.message.includes("not found")) {
      return res.status(404).json({ success: false, message: error.message });
    }
    next(error);
  }
}

/**
 * Handler for a candidate to get their list of applications.
 */
export async function getMyApplicationsHandler(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  if (!req.user) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  try {
    const applications = await getMyApplications(req.user.id);
    return res.status(200).json({ success: true, data: applications });
  } catch (error: any) {
    if (error.message.includes("not found")) {
      return res.status(404).json({ success: false, message: error.message });
    }
    next(error);
  }
}

export async function getCandidateDashboardDataHandler(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  if (!req.user) return res.status(401).json({ message: "Unauthorized" });
  try {
    const dashboardData = await getCandidateDashboardData(req.user.id);
    res.status(200).json({ success: true, data: dashboardData });
  } catch (error: any) {
    if (error.message.includes("not found")) {
      return res.status(404).json({ success: false, message: error.message });
    }
    next(error);
  }
}

export async function updateSummaryHandler(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  if (!req.user) return res.status(401).send();
  try {
    const { summary } = req.body;
    if (typeof summary !== "string") {
      return res
        .status(400)
        .json({ success: false, message: "Summary must be a string." });
    }
    const profile = await updateCandidateSummary(req.user.id, summary);
    res.status(200).json({ success: true, data: profile });
  } catch (error) {
    next(error);
  }
}

export async function completeOnboardingHandler(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  if (!req.user) return res.status(401).send();
  try {
    await markOnboardingAsComplete(req.user.id);
    res.status(200).json({ success: true, message: "Onboarding completed." });
  } catch (error) {
    next(error);
  }
}

export async function setSkillsHandler(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  if (!req.user) return res.status(401).send();
  try {
    const { skills } = req.body;
    if (!Array.isArray(skills)) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Skills must be an array of strings.",
        });
    }
    const profile = await setCandidateSkills(req.user.id, skills);
    res.status(200).json({ success: true, data: profile });
  } catch (error) {
    next(error);
  }
}

export async function updateCvHandler(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  if (!req.user) return res.status(401).send();
  try {
    const { cvFileKey } = req.body;
    if (!cvFileKey || typeof cvFileKey !== "string") {
      return res
        .status(400)
        .json({
          success: false,
          message: "cvFileKey is required and must be a string.",
        });
    }
    const profile = await updateCandidateCv(req.user.id, cvFileKey);
    res.status(200).json({ success: true, data: profile });
  } catch (error) {
    next(error);
  }
}

export async function getRecommendedJobsHandler(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  if (!req.user) return res.status(401).send();
  try {
    const filters = {
      countryId: req.query.countryId ? Number(req.query.countryId) : undefined,
      regionId: req.query.regionId ? Number(req.query.regionId) : undefined,
      cityId: req.query.cityId ? Number(req.query.cityId) : undefined,
      isRemote: req.query.isRemote === "true" ? true : undefined,
      industryId: req.query.industryId ? Number(req.query.industryId) : undefined,
      q: req.query.q ? String(req.query.q) : undefined,
    };
    const jobs = await getRecommendedJobs(req.user.id, filters);
    res.status(200).json({ success: true, data: jobs });
  } catch (error) {
    next(error);
  }
}

export async function followAgencyHandler(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  if (!req.user) return res.status(401).send();
  try {
    const { agencyId } = req.params;
    await followAgency(req.user.id, agencyId);
    res
      .status(201)
      .json({ success: true, message: "Agency followed successfully." });
  } catch (error) {
    next(error);
  }
}

export async function unfollowAgencyHandler(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  if (!req.user) return res.status(401).send();
  try {
    const { agencyId } = req.params;
    await unfollowAgency(req.user.id, agencyId);
    res
      .status(200)
      .json({ success: true, message: "Agency unfollowed successfully." });
  } catch (error) {
    next(error);
  }
}

export async function getFollowingFeedHandler(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user) return res.status(401).send();
  try {
    const feed = await getFollowingFeed(req.user.id);
    res.status(200).json({ success: true, data: feed });
  } catch (error) {
    next(error);
  }
}