import React, { useState } from "react";
import { Box, TextField, Button, Alert, Typography } from "@mui/material";
import api from "../../lib/api";
import { AxiosError } from "axios";



const InviteEmployee: React.FC = () => {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const sendInvite = async () => {
    if (loading) return;
    setLoading(true);
    setMsg(null);
    try {
      const res = await api.post("/hr/invite", { email, name });
      if (res.data.ok) {
        setMsg(`Invite sent to ${name} successfully!`);
        setEmail("");
        setName("");
      }
    } catch (err: unknown) {
      if (err instanceof AxiosError) {
        setMsg(err.response?.data?.message ?? "Invite failed");
      } else {
        setMsg("Invite failed");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 400 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Generate Registration Token
      </Typography>
      {msg && <Alert sx={{ mb: 2 }}>{msg}</Alert>}

      <TextField
        fullWidth
        label="Invitee Full Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        sx={{ mb: 2 }}
      />
      <TextField
        fullWidth
        label="Invitee Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        sx={{ mb: 2 }}
      />

      <Button
        variant="contained"
        onClick={sendInvite}
        disabled={loading || !email || !name}
      >
        {loading ? "Sending..." : "Send Invite"}
      </Button>
    </Box>
  );
};

export default InviteEmployee;
