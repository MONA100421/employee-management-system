import { Request, Response } from "express";
import EmployeeProfile from "../models/EmployeeProfile";
import User from "../models/User";

// GET /employees/me
export const getMyEmployee = async (req: Request, res: Response) => {
  const userId = (req as any).user.userId;

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
  const userId = (req as any).user.userId;
  const payload = req.body;

  const user = await User.findById(userId);
  const profile = await EmployeeProfile.findOne({ user: userId });

  if (!user || !profile) {
    return res.status(404).json({ message: "Profile not found" });
  }

  if (
    payload.firstName ||
    payload.lastName ||
    payload.middleName ||
    payload.preferredName ||
    payload.email
  ) {
    user.profile = {
      ...user.profile,
      firstName: payload.firstName ?? user.profile?.firstName,
      lastName: payload.lastName ?? user.profile?.lastName,
      middleName: payload.middleName ?? user.profile?.middleName,
      preferredName: payload.preferredName ?? user.profile?.preferredName,
    };

    if (payload.email) {
      user.email = payload.email;
    }

    await user.save();
  }

  if (payload.address) {
    profile.address = {
      ...profile.address,
      ...payload.address,
    };
  }

  if (payload.phone) {
    profile.phone = payload.phone;
  }

  if (payload.emergency) {
    profile.emergency = {
      ...profile.emergency,
      ...payload.emergency,
    };
  }

  await profile.save();

  return res.json({ ok: true });
};

