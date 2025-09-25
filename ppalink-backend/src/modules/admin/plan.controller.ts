import type { NextFunction, Request, Response } from 'express';
import type { AuthRequest } from '../../middleware/auth';
import { getAllPlans, createPlan, updatePlan, deletePlan } from './plan.service';

export async function getAllPlansHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const plans = await getAllPlans();
    res.status(200).json({ success: true, data: plans });
  } catch (error) { next(error); }
}

export async function createPlanHandler(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const newPlan = await createPlan(req.body, req.user.id);
    res.status(201).json({ success: true, data: newPlan });
  } catch (error) { next(error); }
}

export async function updatePlanHandler(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { planId } = req.params;
    const updatedPlan = await updatePlan(planId, req.body, req.user.id);
    res.status(200).json({ success: true, data: updatedPlan });
  } catch (error) { next(error); }
}

export async function deletePlanHandler(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { planId } = req.params;
    await deletePlan(planId, req.user.id);
    res.status(204).send();
  } catch (error) { next(error); }
}