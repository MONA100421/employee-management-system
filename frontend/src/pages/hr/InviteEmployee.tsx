import React, { useState } from "react";
import { Box, TextField, Button, Alert } from "@mui/material";
import api from "../../lib/api";
import { AxiosError } from "axios";



const InviteEmployee: React.FC = () => {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState<string | null>(null);

  const sendInvite = async () => {
    try {
      const res = await api.post("/hr/invite", { email });
      if (res.data.ok) {
        setMsg("Invite sent");
      }
    } catch (err: unknown) {
      if (err instanceof AxiosError) {
        setMsg(err.response?.data?.message ?? "Invite failed");
      } else {
        setMsg("Invite failed");
      }
    }
  };

  return (
    <Box>
      {msg && <Alert>{msg}</Alert>}
      <TextField
        label="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <Button onClick={sendInvite}>Send Invite</Button>
    </Box>
  );
};

export default InviteEmployee;
