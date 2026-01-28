import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import LoginInterface from "../interface/LoginInterface.jsx";
import SignUpInterface from "../interface/SignUpInterface.jsx";
import { apiPost, getStoredAuth, setStoredAuth } from "../lib/api.js";

export default function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState("signup"); // "signup" | "login"
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const auth = getStoredAuth();
    if (auth?.access_token) {
      navigate("/dashboard", { replace: true });
    }
  }, [navigate]);

  const handleLogin = async ({ email, password }) => {
    try {
      setLoading(true);
      setError("");
      const data = await apiPost(
        "/auth/login",
        { email, password },
        { auth: false }
      );
      setStoredAuth(data);
      navigate("/dashboard");
    } catch (err) {
      setError(err?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async ({ name, email, password }) => {
    try {
      setLoading(true);
      setError("");
      const data = await apiPost(
        "/auth/signup",
        { name, email, password },
        { auth: false }
      );
      setStoredAuth(data);
      navigate("/dashboard");
    } catch (err) {
      setError(err?.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  if (mode === "login") {
    return (
      <LoginInterface
        onSubmit={handleLogin}
        onToggleMode={() => setMode("signup")}
        loading={loading}
        error={error}
      />
    );
  }

  return (
    <SignUpInterface
      onSubmit={handleSignup}
      onToggleMode={() => setMode("login")}
      loading={loading}
      error={error}
    />
  );
}
