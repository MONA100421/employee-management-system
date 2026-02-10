import { useEffect, useState } from "react";
import {
  IconButton,
  Badge,
  Menu,
  MenuItem,
  Typography,
  Box,
} from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import {
  fetchNotifications,
  fetchUnreadCount,
  markNotificationRead,
} from "../lib/notifications";
import type { Notification } from "../types/notification";

export default function HeaderNotifications() {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [count, setCount] = useState(0);
  const [items, setItems] = useState<Notification[]>([]);

  useEffect(() => {
    fetchUnreadCount()
      .then(setCount)
      .catch(() => {
        /* ignore */
      });
  }, []);

  const openMenu = async (e: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(e.currentTarget);
    const list = await fetchNotifications();
    setItems(list);
  };

  const closeMenu = () => setAnchorEl(null);

  const handleItemClick = async (n: Notification) => {
    if (!n.readAt && n.id) {
      await markNotificationRead(n.id);
      const c = await fetchUnreadCount();
      setCount(c);
    }
    closeMenu();
  };

  return (
    <>
      <IconButton onClick={openMenu}>
        <Badge badgeContent={count} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>

      <Menu anchorEl={anchorEl} open={!!anchorEl} onClose={closeMenu}>
        {items.length === 0 ? (
          <MenuItem>No notifications</MenuItem>
        ) : (
          items.map((n) => (
            <MenuItem key={n.id} onClick={() => handleItemClick(n)}>
              <Box>
                <Typography variant="body2" fontWeight={600}>
                  {n.title}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {n.message}
                </Typography>
              </Box>
            </MenuItem>
          ))
        )}
      </Menu>
    </>
  );
}
