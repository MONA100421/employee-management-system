import React, { useState } from "react";
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
import type { DashboardNotification } from "../types/notification";
import { useNavigate } from "react-router-dom";
import { handleNotificationNavigate } from "../utils/notificationNavigator";

export default function HeaderNotifications() {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [count, setCount] = useState<number>(0);
  const [items, setItems] = useState<DashboardNotification[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const navigate = useNavigate();
  const open = Boolean(anchorEl);

  const handleOpen = async (e: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(e.currentTarget);
    setLoading(true);

    try {
      const list = await fetchNotifications();
      setItems(list);

      const unread = await fetchUnreadCount();
      setCount(unread);
    } catch (err) {
      console.error("Failed to fetch notifications", err);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => setAnchorEl(null);

  const handleItemClick = async (n: DashboardNotification) => {
    handleClose();

    try {
      if (!n.readAt && n.id) {
        await markNotificationRead(n.id);

        const unread = await fetchUnreadCount();
        setCount(unread);

        setItems((prev) =>
          prev.map((it) =>
            it.id === n.id ? { ...it, readAt: new Date().toISOString() } : it,
          ),
        );
      }
    } catch (err) {
      console.error("Failed to mark notification read", err);
    }

    handleNotificationNavigate(n, navigate);
  };

  return (
    <>
      <IconButton onClick={handleOpen} size="large" aria-label="notifications">
        <Badge badgeContent={count} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{ sx: { mt: 1, boxShadow: 3 } }}
      >
        {loading && (
          <MenuItem>
            <Typography variant="body2">Loading…</Typography>
          </MenuItem>
        )}

        {!loading && items.length === 0 && (
          <MenuItem>
            <Typography variant="body2">No notifications</Typography>
          </MenuItem>
        )}

        {!loading &&
          items.map((n) => (
            <MenuItem
              key={n.id}
              onClick={() => handleItemClick(n)}
              sx={{
                py: 1.5,
                px: 2,
                minWidth: 280,
                backgroundColor: n.readAt
                  ? "transparent"
                  : "rgba(25, 118, 210, 0.08)",
              }}
            >
              <Box>
                <Typography variant="body2" fontWeight={n.readAt ? 400 : 600}>
                  {n.title}
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  display="block"
                >
                  {n.message}
                </Typography>
                {n.createdAt && (
                  <Typography
                    variant="caption"
                    color="grey.500"
                    sx={{ fontSize: "0.7rem" }}
                  >
                    {new Date(n.createdAt).toLocaleString()}
                  </Typography>
                )}
              </Box>
            </MenuItem>
          ))}
      </Menu>
    </>
  );
}
