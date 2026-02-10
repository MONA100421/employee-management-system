import api from "./api";
export async function fetchDocsMetrics() {
  const res = await api.get("/metrics/hr/docs");
  return res.data;
}
