import { useEffect, useState } from "react";
import { getMyNotifications, type UINotification } from "../lib/notifications";

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<UINotification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const data = await getMyNotifications();
        setNotifications(data);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return { notifications, loading };
};
