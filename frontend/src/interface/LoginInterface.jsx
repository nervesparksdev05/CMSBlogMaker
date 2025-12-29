// src/interface/LoginInterface.jsx
import GoogleButton from "../buttons/GoogleButton.jsx";
import AppleButton from "../buttons/AppleButton.jsx";
import FacebookButton from "../buttons/FaceBookButton.jsx";
import SimpleHeaderInterface from "./SimpleHeaderInterface.jsx";
import SimpleFooterInterface from "./SimpleFooterInterface.jsx";
import NextButton from "../buttons/NextButton.jsx";

const LoginPage = ({ onNext, onPrevious }) => {
  return (
    <div className="w-full min-h-screen flex flex-col bg-white">
      {/* Top logo bar */}
      <SimpleHeaderInterface />

      {/* Center content (slightly compact to match signup and avoid scroll) */}
      <main className="flex-1 flex items-center justify-center">
        <section className="flex flex-col items-center">
          {/* Title */}
          <h1 className="text-[30px] leading-[36px] font-bold text-[#171A1F] mb-1">
            Welcome back
          </h1>
          <p className="text-[13px] leading-[18px] text-[#9CA3AF] mb-4 text-center">
            Enter your details to get sign in to your account.
          </p>

          {/* Form area */}
          <div className="w-[515px] flex flex-col gap-3">
            {/* Email */}
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
              />
            </div>

            {/* Password */}
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
                placeholder="••••••••••••••••"
              />
            </div>

            {/* Forgot password */}
            <div className="mt-1">
              <button
                type="button"
                className="text-[12px] text-[#424856] hover:underline"
              >
                Forgot Password?
              </button>
            </div>

            {/* Next button – goes to Home1 via onNext from DashBoard2 */}
            <div className="mt-2 w-full flex justify-end">
              <NextButton onClick={onNext} />
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3 mt-3 mb-1">
              <span className="flex-1 h-px bg-[#E5E7EB]" />
              <span className="text-[12px] text-[#6B7280]">
                Or Sign in with
              </span>
              <span className="flex-1 h-px bg-[#E5E7EB]" />
            </div>

            {/* Social buttons */}
            <div className="flex items-center justify-between gap-3 mt-1">
              <GoogleButton />
              <AppleButton />
              <FacebookButton />
            </div>

            {/* Bottom link */}
            <p className="mt-3 text-center text-[12px] text-[#6B7280]">
              Don&apos;t have an account?{" "}
              <button
                type="button"
                onClick={onPrevious} // back to signup
                className="text-[#4443E4] font-medium hover:underline"
              >
                Register Now
              </button>
            </p>
          </div>
        </section>
      </main>

      {/* Bottom footer */}
      <SimpleFooterInterface />
    </div>
  );
};

export default LoginPage;
