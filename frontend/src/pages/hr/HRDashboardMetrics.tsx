import { useEffect, useState } from "react";
import { Card, CardContent, Typography, Box } from "@mui/material";
import { fetchDocsMetrics } from "../../lib/metrics";

type DocsMetrics = {
  pendingCount: number;
  rejectedRate: number;
  avgReviewTimeMs: number | null;
};

export default function HRDashboardMetrics() {
  const [metrics, setMetrics] = useState<DocsMetrics | null>(null);

  useEffect(() => {
    fetchDocsMetrics().then(setMetrics);
  }, []);

  if (!metrics) return <div>Loading...</div>;

  return (
    <Box sx={{ display: "flex", gap: 2 }}>
      <Card>
        <CardContent>
          <Typography variant="h6">Pending Documents</Typography>
          <Typography variant="h4">{metrics.pendingCount}</Typography>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="h6">Rejected Rate (30d)</Typography>
          <Typography variant="h4">
            {(metrics.rejectedRate * 100).toFixed(1)}%
          </Typography>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="h6">Avg Review Time</Typography>
          <Typography variant="h4">
            {metrics.avgReviewTimeMs
              ? `${Math.round(metrics.avgReviewTimeMs / 3600000)}h`
              : "-"}
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
