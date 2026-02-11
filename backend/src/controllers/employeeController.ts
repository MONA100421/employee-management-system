import { Request, Response } from "express";
import EmployeeProfile from "../models/EmployeeProfile";
import User from "../models/User";

// GET /employees/me
export const getMyEmployee = async (req: Request, res: Response) => {
  const userId = (req as any).user.id;

  const user = await User.findById(userId).lean();
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  let employee = await EmployeeProfile.findOne({ user: userId }).lean();

  if (!employee) {
    employee = await EmployeeProfile.create({ user: userId });
  }

  return res.json({
    user: {
      id: user._id,
      email: user.email,
      role: user.role,
      firstName: user.profile?.firstName ?? "",
      lastName: user.profile?.lastName ?? "",
      preferredName: user.profile?.preferredName ?? "",
    },
    employee,
  });
};

// PATCH /employees/me
export const patchMyEmployee = async (req: Request, res: Response) => {
  const userId = (req as any).user.id;

  const profile = await EmployeeProfile.findOne({ user: userId });
  if (!profile) {
    return res.status(404).json({ message: "Employee profile not found" });
  }

  Object.assign(profile, req.body);
  await profile.save();

  return res.json({ employee: profile });
};
