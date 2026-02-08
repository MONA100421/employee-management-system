import { Request, Response } from "express";
import EmployeeProfile from "../models/EmployeeProfile";
import User from "../models/User";

export const getMyEmployee = async (req: Request, res: Response) => {
  const userId = (req as any).user.id;

  const user = await User.findById(userId).lean();
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const employee =
    (await EmployeeProfile.findOne({ user: userId }).lean()) ??
    (await EmployeeProfile.create({ user: userId }));

  return res.json({
    user: {
      id: user._id,
      email: user.email,
      role: user.role,
      firstName: user.profile?.firstName ?? "",
      lastName: user.profile?.lastName ?? "",
    },
    employee,
  });
};

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
