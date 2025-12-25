// Auth feature public API
// Only exports from this file should be imported by other features or app routes

// Domain types
export type { AuthResult, SendOtpInput, VerifyOtpInput } from "./domain/auth.types";

// Hooks
export { useSendOtp } from "./actions/useSendOtp";
export { useVerifyOtp } from "./actions/useVerifyOtp";
export { useLogout } from "./actions/useLogout";

// UI Components
export { PhoneLoginForm } from "./ui/PhoneLoginForm";
export { OtpVerificationForm } from "./ui/OtpVerificationForm";
export { LogoutButton } from "./ui/LogoutButton";


