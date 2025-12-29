// src/interface/SignUpInterface.jsx
import ContinueButton from "../buttons/ContinueButton.jsx";
import GoogleButton from "../buttons/GoogleButton.jsx";
import AppleButton from "../buttons/AppleButton.jsx";
import FacebookButton from "../buttons/FacebookButton.jsx";
import SimpleHeaderInterface from "./SimpleHeaderInterface.jsx";
import SimpleFooterInterface from "./SimpleFooterInterface.jsx";

const SignUpPage = ({ onNext }) => {
  return (
    <div className="w-full min-h-screen flex flex-col bg-white">
      {/* Top logo bar */}
      <SimpleHeaderInterface />

      {/* Center content (compact so header+form+footer fit on one screen) */}
      <main className="flex-1 flex items-center justify-center">
        {/* Main card */}
        <section className="flex flex-col items-center">
          {/* Title */}
          <h1 className="text-[30px] leading-[36px] font-bold text-[#323743] mb-1">
            Join us!!!
          </h1>
          <p className="text-[13px] leading-[18px] text-[#9CA3AF] mb-3 text-center">
            Enter your details to create new account
          </p>

          {/* Form area */}
          <div className="w-[460px] flex flex-col gap-2.5">
            {/* Full name */}
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
              />
            </div>

            {/* Email */}
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
              />
            </div>

            {/* Password */}
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
                placeholder="••••••••••••••••"
              />
            </div>

            {/* Confirm Password */}
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
                placeholder="••••••••••••••••"
              />
            </div>

            {/* Continue button */}
            <div className="mt-2 w-[">
              <ContinueButton onClick={onNext} />
            </div>

            {/* Divider: Or sign in with */}
            <div className="flex items-center gap-3 mt-2 mb-1">
              <span className="flex-1 h-px bg-[#E5E7EB]" />
              <span className="text-[12px] text-[#6B7280]">
                Or Sign in with
              </span>
              <span className="flex-1 h-px bg-[#E5E7EB]" />
            </div>

            {/* Social buttons row */}
            <div className="flex items-center justify-between gap-3 mt-1">
              <GoogleButton />
              <AppleButton />
              <FacebookButton />
            </div>

            {/* Already have account */}
            <p className="mt-2 text-center text-[12px] text-[#6B7280]">
              Already have an account?{" "}
              <button
                type="button"
                onClick={onNext} // signup -> login (next step)
                className="text-[#4443E4] font-medium hover:underline"
              >
                Sign in
              </button>
            </p>
          </div>
        </section>
      </main>

      {/* Bottom footer (same height & left padding as header) */}
      <SimpleFooterInterface />
    </div>
  );
};

export default SignUpPage;
