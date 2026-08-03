"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Link as MuiLink,
  Alert,
} from "@mui/material";
import Link from "next/link";

/**
 * Login Page
 *
 * Uses NextAuth's `signIn("credentials", ...)` to authenticate.
 * - `redirect: false` prevents NextAuth from redirecting on its own,
 *   so we can handle errors and redirect manually.
 * - On success, redirects to the home page (the Kanban board).
 * - On failure, shows an error message.
 */
export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false, // we handle redirect ourselves
      });

      if (result?.error) {
        setError("Invalid email or password");
      } else {
        router.push("/"); // go to Kanban board
        router.refresh(); // refresh server components to pick up the session
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "background.default",
      }}
    >
      <Paper
        elevation={3}
        sx={{
          p: 4,
          width: "100%",
          maxWidth: 420,
          borderRadius: 2,
        }}
      >
        <Typography variant="h4" fontWeight={700} mb={1} textAlign="center">
          Kanban
        </Typography>
        <Typography
          variant="h6"
          mb={3}
          textAlign="center"
          color="text.secondary"
        >
          Sign in to your account
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            sx={{ mb: 3 }}
          />
          <Button
            type="submit"
            variant="contained"
            fullWidth
            size="large"
            disabled={loading}
            sx={{ borderRadius: "20px", mb: 2 }}
          >
            {loading ? "Signing in..." : "Sign In"}
          </Button>
        </Box>

        <Typography textAlign="center" color="text.secondary">
          Don&apos;t have an account?{" "}
          <MuiLink component={Link} href="/signup" underline="hover">
            Sign up
          </MuiLink>
        </Typography>
      </Paper>
    </Box>
  );
}
