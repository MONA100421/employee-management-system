import { Request, Response } from "express";
import Document from "../models/Document";
import mongoose from "mongoose";

export const getDocsMetrics = async (req: Request, res: Response) => {
  // require HR role already in route
  try {
    // pending count
    const pendingCount = await Document.countDocuments({ status: "pending" });

    // rejected rate (last 30 days): (# rejected last 30d) / (# reviewed last 30d)
    const since = new Date();
    since.setDate(since.getDate() - 30);

    const agg = await Document.aggregate([
      { $match: { reviewedAt: { $gte: since } } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    const reviewedLast30 = agg.reduce((s: number, a: any) => s + a.count, 0);
    const rejected = agg.find((a: any) => a._id === "rejected")?.count || 0;
    const rejectedRate = reviewedLast30 ? rejected / reviewedLast30 : 0;

    // avg review time (submitted/uploaded -> reviewed) for approved/rejected last 30d
    const timesAgg = await Document.aggregate([
      {
        $match: { reviewedAt: { $gte: since }, uploadedAt: { $exists: true } },
      },
      { $project: { diffMs: { $subtract: ["$reviewedAt", "$uploadedAt"] } } },
      { $group: { _id: null, avgMs: { $avg: "$diffMs" } } },
    ]);
    const avgMs = timesAgg[0]?.avgMs || null;

    return res.json({
      ok: true,
      pendingCount,
      rejectedRate,
      avgReviewTimeMs: avgMs,
      reviewedLast30,
      rejectedLast30: rejected,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false });
  }
};
