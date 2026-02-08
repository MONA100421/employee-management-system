import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
} from "@mui/material";
import { useForm } from "react-hook-form";
import api from "../../lib/api";

type RegisterFormValues = {
  username: string;
  password: string;
  confirmPassword: string;
};

const Register = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const token = searchParams.get("token");
  const email = searchParams.get("email");

  const [checkingToken, setCheckingToken] = useState(true);
  const [tokenError, setTokenError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>();

  const password = watch("password");

  useEffect(() => {
    if (!token) {
      setTokenError("Missing registration token");
      setCheckingToken(false);
      return;
    }

    api
      .get(`/auth/registration/${token}`)
      .then(() => {
        setTokenError(null);
      })
      .catch((err) => {
        setTokenError(
          err.response?.data?.message ?? "Invalid or expired registration link",
        );
      })
      .finally(() => {
        setCheckingToken(false);
      });
  }, [token]);

  const onSubmit = async (data: RegisterFormValues) => {
    if (!token || !email) return;

    await api.post("/auth/register", {
      token,
      email,
      username: data.username,
      password: data.password,
    });

    navigate("/login");
  };

  if (checkingToken) {
    return (
      <Box sx={{ mt: 10, textAlign: "center" }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>Validating invitation…</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ mt: 10, display: "flex", justifyContent: "center" }}>
      <Card sx={{ width: 420 }}>
        <CardContent>
          <Typography variant="h5" sx={{ mb: 2 }}>
            Create Account
          </Typography>

          {tokenError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {tokenError}
            </Alert>
          )}

          <form onSubmit={handleSubmit(onSubmit)}>
            <TextField
              label="Email"
              value={email ?? ""}
              fullWidth
              margin="normal"
              disabled
            />

            <TextField
              label="Username"
              fullWidth
              margin="normal"
              disabled={!!tokenError}
              {...register("username", {
                required: "Username is required",
                minLength: {
                  value: 3,
                  message: "At least 3 characters",
                },
              })}
              error={!!errors.username}
              helperText={errors.username?.message}
            />

            <TextField
              label="Password"
              type="password"
              fullWidth
              margin="normal"
              disabled={!!tokenError}
              {...register("password", {
                required: "Password is required",
                minLength: {
                  value: 8,
                  message: "At least 8 characters",
                },
              })}
              error={!!errors.password}
              helperText={errors.password?.message}
            />

            <TextField
              label="Confirm Password"
              type="password"
              fullWidth
              margin="normal"
              disabled={!!tokenError}
              {...register("confirmPassword", {
                validate: (value: string) =>
                  value === password || "Passwords do not match",
              })}
              error={!!errors.confirmPassword}
              helperText={errors.confirmPassword?.message}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3 }}
              disabled={!!tokenError || isSubmitting}
            >
              Create Account
            </Button>
          </form>

          <Box sx={{ textAlign: "center", mt: 2 }}>
            <Typography variant="body2">
              Already have an account?{" "}
              <Button href="/login" sx={{ p: 0 }}>
                Sign in
              </Button>
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Register;
