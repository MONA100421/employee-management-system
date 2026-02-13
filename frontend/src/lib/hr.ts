import api from "../lib/api";

export async function getEmployeesFull() {
  const res = await api.get("/hr/employees");
  return res.data.employees;
}
