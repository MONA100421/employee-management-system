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

  const missingToken = !token;

  const [checkingToken, setCheckingToken] = useState<boolean>(!missingToken);
  const [tokenError, setTokenError] = useState<string | null>(
    missingToken ? "Missing registration token." : null,
  );

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>();

  useEffect(() => {
    if (missingToken || !token) {
      return;
    }

    let active = true;

    api
      .get(`/auth/registration/${token}`)
      .then(() => {
        if (active) setTokenError(null);
      })
      .catch((err: unknown) => {
        if (!active) return;

        if (
          typeof err === "object" &&
          err !== null &&
          "response" in err &&
          typeof (err as { response?: { data?: { message?: string } } })
            .response?.data?.message === "string"
        ) {
          const message = (err as { response: { data: { message: string } } })
            .response.data.message;

          if (message === "Invalid token") {
            setTokenError("Invalid invitation link.");
          } else if (message === "Token already used") {
            setTokenError("This invitation link has already been used.");
          } else if (message === "Token expired") {
            setTokenError("This invitation link has expired.");
          } else {
            setTokenError("Unable to validate invitation link.");
          }
        } else {
          setTokenError("Unable to validate invitation link.");
        }
      })
      .finally(() => {
        if (active) setCheckingToken(false);
      });

    return () => {
      active = false;
    };
  }, [token, missingToken]);

  const onSubmit = async (data: RegisterFormValues) => {
    if (!token || !email) return;

    try {
      await api.post("/auth/register", {
        token,
        email,
        username: data.username,
        password: data.password,
      });

      navigate("/login");
    } catch (err: unknown) {
      if (
        typeof err === "object" &&
        err !== null &&
        "response" in err &&
        typeof (err as { response?: { data?: { message?: string } } }).response
          ?.data?.message === "string"
      ) {
        const message = (err as { response: { data: { message: string } } })
          .response.data.message;

        if (message === "Email already registered") {
          setTokenError("This email has already been registered.");
        } else if (message === "Token already used") {
          setTokenError("This invitation link has already been used.");
        } else {
          setTokenError("Registration failed.");
        }
      } else {
        setTokenError("Registration failed.");
      }
    }
  };

  // UI：loading
  if (checkingToken) {
    return (
      <Box sx={{ mt: 10, textAlign: "center" }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>Validating invitation…</Typography>
      </Box>
    );
  }

  // UI：form
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
                minLength: { value: 3, message: "At least 3 characters" },
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
                minLength: { value: 8, message: "At least 8 characters" },
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
                validate: (value) =>
                  value === getValues("password") || "Passwords do not match",
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
