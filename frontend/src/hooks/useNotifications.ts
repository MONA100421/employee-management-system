import { useEffect, useState } from "react";
import { fetchNotifications } from "../lib/notifications";
import type { DashboardNotification } from "../types/notification";

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<DashboardNotification[]>(
    [],
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const data = await fetchNotifications();
        setNotifications(data);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return { notifications, loading };
};
