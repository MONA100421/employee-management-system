import React, { useEffect, useState, useRef } from "react";
import {
  IconButton,
  Badge,
  Menu,
  MenuItem,
  Typography,
  Box,
  ListItemText,
} from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import {
  fetchNotifications,
  fetchUnreadCount,
  markNotificationRead,
} from "../lib/notifications";
import type { Notification } from "../types/notification";
import { useNavigate } from "react-router-dom";

export default function HeaderNotifications() {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [count, setCount] = useState<number>(0);
  const [items, setItems] = useState<Notification[]>([]);
  const navigate = useNavigate();
  const pollRef = useRef<number | null>(null);

  // load unread count initially and start short polling
  useEffect(() => {
    let mounted = true;
    const loadCount = async () => {
      try {
        const c = await fetchUnreadCount();
        if (mounted) setCount(c);
      } catch {
        // ignore errors
      }
    };
    loadCount();

    // polling every 30s
    pollRef.current = window.setInterval(loadCount, 30_000);

    return () => {
      mounted = false;
      if (pollRef.current) window.clearInterval(pollRef.current);
    };
  }, []);

  const openMenu = async (e: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(e.currentTarget);
    try {
      const list = await fetchNotifications();
      setItems(list);
      // optional: you could mark all read here, but we'll mark per-item on click
    } catch (err) {
      console.error("Failed to fetch notifications", err);
      setItems([]);
    }
  };

  const closeMenu = () => setAnchorEl(null);

  const handleItemClick = async (n: Notification) => {
    try {
      if (!n.readAt && n.id) {
        await markNotificationRead(n.id);
        const c = await fetchUnreadCount();
        setCount(c);
        // update local item state quickly
        setItems((prev) =>
          prev.map((it) =>
            it.id === n.id ? { ...it, readAt: new Date().toISOString() } : it,
          ),
        );
      }
    } catch (err) {
      console.error("Failed to mark notification read", err);
    }

    // navigate: use n.data to find target
    // convention: data.documentId and data.documentType
    if (n.data?.documentId && n.data?.documentType) {
      // choose route depending on type. Example:
      if (n.data.documentType === "onboarding") {
        navigate(`/employee/onboarding`); // adjust to specific doc view if exists
      } else {
        // visa / generic: go to employee profile or visa page
        navigate(`/employee/visa-status`);
      }
    }

    closeMenu();
  };

  return (
    <>
      <IconButton onClick={openMenu} size="small" aria-label="notifications">
        <Badge badgeContent={count} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>

      <Menu anchorEl={anchorEl} open={!!anchorEl} onClose={closeMenu}>
        {items.length === 0 ? (
          <MenuItem>
            <ListItemText primary="No notifications" />
          </MenuItem>
        ) : (
          items.map((n) => (
            <MenuItem
              key={n.id}
              onClick={() => handleItemClick(n)}
              sx={{
                backgroundColor: n.readAt ? "transparent" : "action.selected",
              }}
            >
              <Box>
                <Typography variant="body2" fontWeight={n.readAt ? 400 : 700}>
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
