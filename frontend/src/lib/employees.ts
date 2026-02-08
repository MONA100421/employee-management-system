import api from "./api";
import type { EmployeeProfile } from "../types/user";

export const getMyEmployee = async () => {
  const res = await api.get("/employees/me");
  return res.data;
};

export const patchMyEmployee = async (payload: Partial<EmployeeProfile>) => {
  const res = await api.patch("/employees/me", payload);
  return res.data;
};
