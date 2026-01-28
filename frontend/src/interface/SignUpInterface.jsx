import { useState } from "react";
import ContinueButton from "../buttons/ContinueButton.jsx";
import GoogleButton from "../buttons/GoogleButton.jsx";
import AppleButton from "../buttons/AppleButton.jsx";
import FacebookButton from "../buttons/FacebookButton.jsx";
import SimpleHeaderInterface from "./SimpleHeaderInterface.jsx";
import SimpleFooterInterface from "./SimpleFooterInterface.jsx";

const SignUpPage = ({ onSubmit, onToggleMode, loading = false, error = "" }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [localError, setLocalError] = useState("");

  const canSubmit =
    name.trim().length > 0 &&
    email.trim().length > 0 &&
    password.trim().length > 0 &&
    confirm.trim().length > 0 &&
    !loading;

  const handleSubmit = () => {
    if (!canSubmit) return;
    if (password !== confirm) {
      setLocalError("Passwords do not match.");
      return;
    }
    setLocalError("");
    onSubmit?.({ name: name.trim(), email: email.trim(), password });
  };

  const errorText = localError || error;

  return (
    <div className="w-full min-h-screen flex flex-col bg-white">
      <SimpleHeaderInterface />

      <main className="flex-1 flex items-center justify-center">
        <section className="flex flex-col items-center">
          <h1 className="text-[30px] leading-[36px] font-bold text-[#323743] mb-1">
            Join us!!!
          </h1>
          <p className="text-[13px] leading-[18px] text-[#9CA3AF] mb-3 text-center">
            Enter your details to create new account
          </p>

          <div className="w-[460px] flex flex-col gap-2.5">
            <div className="flex flex-col">
              <label className="mb-1 text-[13px] leading-[20px] text-[#424856]">
                Full name
              </label>
              <input
                type="text"
                className="
                  w-full h-[44px]
                  rounded-[26px]
                  border border-[#D3D8E3]
                  px-5
                  text-[14px] leading-[22px]
                  text-[#171A1F]
                  placeholder:text-[#9CA3AF]
                  outline-none
                "
                placeholder="Tester"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="flex flex-col">
              <label className="mb-1 text-[13px] leading-[20px] text-[#424856]">
                Email
              </label>
              <input
                type="email"
                className="
                  w-full h-[44px]
                  rounded-[26px]
                  border border-[#D3D8E3]
                  px-5
                  text-[14px] leading-[22px]
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
              <label className="mb-1 text-[13px] leading-[20px] text-[#424856]">
                Password
              </label>
              <input
                type="password"
                className="
                  w-full h-[44px]
                  rounded-[26px]
                  border border-[#D3D8E3]
                  px-5
                  text-[14px] leading-[22px]
                  text-[#171A1F]
                  placeholder:text-[#9CA3AF]
                  outline-none
                "
                placeholder="********"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="flex flex-col">
              <label className="mb-1 text-[13px] leading-[20px] text-[#424856]">
                Confirm Password
              </label>
              <input
                type="password"
                className="
                  w-full h-[44px]
                  rounded-[26px]
                  border border-[#D3D8E3]
                  px-5
                  text-[14px] leading-[22px]
                  text-[#171A1F]
                  placeholder:text-[#9CA3AF]
                  outline-none
                "
                placeholder="********"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
              />
            </div>

            <div className="mt-2">
              <ContinueButton
                onClick={handleSubmit}
                disabled={!canSubmit}
                label={loading ? "Creating account..." : "Create account"}
              />
            </div>

            {errorText ? (
              <div className="mt-1 text-[12px] text-[#DC2626] text-center">
                {errorText}
              </div>
            ) : null}

            <div className="flex items-center gap-3 mt-2 mb-1">
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

            <p className="mt-2 text-center text-[12px] text-[#6B7280]">
              Already have an account?{" "}
              <button
                type="button"
                onClick={onToggleMode}
                className="text-[#4443E4] font-medium hover:underline"
              >
                Sign in
              </button>
            </p>
          </div>
        </section>
      </main>

      <SimpleFooterInterface />
    </div>
  );
};

export default SignUpPage;
