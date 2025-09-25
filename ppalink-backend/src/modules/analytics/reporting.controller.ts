import type { NextFunction, Request, Response } from 'express';
import { generateUserGrowthReport, generateApplicationFunnelReport, generateCandidateInsightsReport, generateAgencyInsightsReport, generateJobMarketInsightsReport } from './reporting.service';
import type { ReportFilters } from './reporting.types';

/**
 * Handler for generating a user growth report.
 */
export async function userGrowthReportHandler(req: Request, res: Response, next: NextFunction) {
  try {
    // The request body is now validated and typed
    const filters: ReportFilters = req.body;
    const reportData = await generateUserGrowthReport(filters);
    res.status(200).json({ success: true, data: reportData });
  } catch (error) {
    next(error);
  }
}

/**
 * Handler for generating an application funnel report.
 */
export async function applicationFunnelReportHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const filters: ReportFilters = req.body;
    const reportData = await generateApplicationFunnelReport(filters);
    res.status(200).json({ success: true, data: reportData });
  } catch (error) {
    next(error);
  }
}

/**
 * Handler for generating a candidate insights report.
 */
export async function candidateInsightsReportHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const filters: ReportFilters = req.body;
    const reportData = await generateCandidateInsightsReport(filters);
    res.status(200).json({ success: true, data: reportData });
  } catch (error) {
    next(error);
  }
}

/**
 * Handler for generating an agency insights report.
 */
export async function agencyInsightsReportHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const filters: ReportFilters = req.body;
    const reportData = await generateAgencyInsightsReport(filters);
    res.status(200).json({ success: true, data: reportData });
  } catch (error) {
    next(error);
  }
}

/**
 * Handler for generating a job market insights report.
 */
export async function jobMarketInsightsReportHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const filters: ReportFilters = req.body;
    const reportData = await generateJobMarketInsightsReport(filters);
    res.status(200).json({ success: true, data: reportData });
  } catch (error) {
    next(error);
  }
}