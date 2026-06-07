import { HostingPlan } from '../models/HostingPlan';
import { Plan } from '../models/Plan';
import { Website } from '../models/Website';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

export class HostingService {
  static async getAvailablePlans(type?: string) {
    const filter: any = { active: true };
    if (type) filter.type = type;
    return Plan.find(filter).sort({ position: 1 });
  }

  static async createPlan(userId: string, planId: string, interval: 'monthly' | 'yearly') {
    const planTemplate = await Plan.findById(planId);
    if (!planTemplate) {
      throw new AppError('Plan no encontrado', 404, 'PLAN_NOT_FOUND');
    }

    const hostingPlan = await HostingPlan.create({
      userId,
      type: planTemplate.type,
      name: planTemplate.name,
      resources: { ...planTemplate.resources },
      resourceUsage: { cpu: 0, ram: 0, storage: 0, bandwidth: 0 },
      price: 0,
      currency: 'USD',
      interval,
      status: 'active',
    });

    logger.info(`Free hosting plan created: ${planTemplate.name} for user ${userId}`);
    return hostingPlan;
  }

  static async getUserPlans(userId: string) {
    return HostingPlan.find({ userId }).sort({ createdAt: -1 });
  }

  static async getPlanById(userId: string, planId: string) {
    const plan = await HostingPlan.findOne({ _id: planId, userId })
      .populate('databases')
      .populate('emails')
      .populate('deployments');
    if (!plan) {
      throw new AppError('Plan de hosting no encontrado', 404, 'HOSTING_NOT_FOUND');
    }
    return plan;
  }

  static async updateResources(planId: string, usage: { cpu?: number; ram?: number; storage?: number; bandwidth?: number }) {
    const plan = await HostingPlan.findById(planId);
    if (!plan) return;

    if (usage.cpu !== undefined) plan.resourceUsage.cpu = usage.cpu;
    if (usage.ram !== undefined) plan.resourceUsage.ram = usage.ram;
    if (usage.storage !== undefined) plan.resourceUsage.storage = usage.storage;
    if (usage.bandwidth !== undefined) plan.resourceUsage.bandwidth = usage.bandwidth;

    await plan.save();
  }

  static async suspendPlan(planId: string) {
    const plan = await HostingPlan.findByIdAndUpdate(planId, { status: 'suspended' }, { new: true });
    if (!plan) {
      throw new AppError('Plan no encontrado', 404, 'HOSTING_NOT_FOUND');
    }
    return plan;
  }

  static async cancelPlan(userId: string, planId: string) {
    const plan = await HostingPlan.findOneAndUpdate(
      { _id: planId, userId },
      { status: 'cancelled' },
      { new: true }
    );
    if (!plan) {
      throw new AppError('Plan no encontrado', 404, 'HOSTING_NOT_FOUND');
    }
    return plan;
  }

  static async getWebsites(userId: string) {
    return Website.find({ userId }).sort({ createdAt: -1 });
  }

  static async createWebsite(userId: string, data: {
    hostingPlanId: string;
    name: string;
    domain?: string;
    type?: string;
    template?: string;
  }) {
    const website = await Website.create({ userId, ...data });
    return website;
  }
}
