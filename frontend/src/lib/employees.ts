import api from "./api";
import type { EmployeeProfile } from "../types/user";

export const getMyEmployee = async () => {
  const res = await api.get("/employee/me");
  return res.data;
};

export const patchMyEmployee = async (payload: Partial<EmployeeProfile>) => {
  const res = await api.patch("/employee/me", payload);
  return res.data;
};

