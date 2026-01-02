import { useState } from "react";
import GoogleButton from "../buttons/GoogleButton.jsx";
import AppleButton from "../buttons/AppleButton.jsx";
import FacebookButton from "../buttons/FacebookButton.jsx";
import SimpleHeaderInterface from "./SimpleHeaderInterface.jsx";
import SimpleFooterInterface from "./SimpleFooterInterface.jsx";
import ContinueButton from "../buttons/ContinueButton.jsx";

const LoginPage = ({ onSubmit, onToggleMode, loading = false, error = "" }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const canSubmit = email.trim().length > 0 && password.trim().length > 0 && !loading;

  const handleSubmit = () => {
    if (!canSubmit) return;
    onSubmit?.({ email: email.trim(), password });
  };

  return (
    <div className="w-full min-h-screen flex flex-col bg-white">
      <SimpleHeaderInterface />

      <main className="flex-1 flex items-center justify-center">
        <section className="flex flex-col items-center">
          <h1 className="text-[30px] leading-[36px] font-bold text-[#171A1F] mb-1">
            Welcome back
          </h1>
          <p className="text-[13px] leading-[18px] text-[#9CA3AF] mb-4 text-center">
            Enter your details to get sign in to your account.
          </p>

          <div className="w-[515px] flex flex-col gap-3">
            <div className="flex flex-col">
              <label className="mb-1 text-[13px] leading-[22px] text-[#424856]">
                Email
              </label>
              <input
                type="email"
                className="
                  w-full h-[48px]
                  rounded-[26px]
                  border border-[#D3D8E3]
                  px-5
                  text-[14px] leading-[24px]
                  text-[#171A1F]
                  placeholder:text-[#9CA3AF]
                  outline-none
                "
                placeholder="test@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="flex flex-col">
              <label className="mb-1 text-[13px] leading-[22px] text-[#424856]">
                Password
              </label>
              <input
                type="password"
                className="
                  w-full h-[48px]
                  rounded-[26px]
                  border border-[#D3D8E3]
                  px-5
                  text-[14px] leading-[24px]
                  text-[#171A1F]
                  placeholder:text-[#9CA3AF]
                  outline-none
                "
                placeholder="********"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="mt-1">
              <button
                type="button"
                className="text-[12px] text-[#424856] hover:underline"
              >
                Forgot Password?
              </button>
            </div>

            <div className="mt-2 w-full">
              <ContinueButton
                onClick={handleSubmit}
                disabled={!canSubmit}
                label={loading ? "Signing in..." : "Sign in"}
              />
            </div>

            {error ? (
              <div className="mt-2 text-[12px] text-[#DC2626] text-center">
                {error}
              </div>
            ) : null}

            <div className="flex items-center gap-3 mt-3 mb-1">
              <span className="flex-1 h-px bg-[#E5E7EB]" />
              <span className="text-[12px] text-[#6B7280]">
                Or Sign in with
              </span>
              <span className="flex-1 h-px bg-[#E5E7EB]" />
            </div>

            <div className="flex items-center justify-between gap-3 mt-1">
              <GoogleButton />
              <AppleButton />
              <FacebookButton />
            </div>

            <p className="mt-3 text-center text-[12px] text-[#6B7280]">
              Don&apos;t have an account?{" "}
              <button
                type="button"
                onClick={onToggleMode}
                className="text-[#4443E4] font-medium hover:underline"
              >
                Register Now
              </button>
            </p>
          </div>
        </section>
      </main>

      <SimpleFooterInterface />
    </div>
  );
};

export default LoginPage;
