import React from "react";
import { useNavigate } from "react-router-dom";
import {
  ClerkProvider,
  Show as ClerkShow,
  UserButton as ClerkUserButton,
  useAuth as useClerkAuth,
  useUser as useClerkUser,
  useSignIn as useClerkSignIn,
  useSignUp as useClerkSignUp,
  useClerk as useClerkCore,
  AuthenticateWithRedirectCallback as ClerkAuthenticateWithRedirectCallback,
} from "@clerk/react";

// Read Publishable key
const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || "";

console.log("Clerk Publishable Key Loaded:", publishableKey ? `Yes (${publishableKey.substring(0, 15)}...)` : "No");

if (!publishableKey) {
  console.warn("Clerk Publishable Key is missing. Please add VITE_CLERK_PUBLISHABLE_KEY to your environment variables.");
}

export const ClerkProviderWrapper = ({ children }) => {
  const navigate = useNavigate();

  return (
    <ClerkProvider 
      publishableKey={publishableKey}
      navigate={(to) => navigate(to)}
    >
      {children}
    </ClerkProvider>
  );
};

// Direct export of Clerk hooks
export const useAuth = useClerkAuth;
export const useUser = useClerkUser;
export const useSignIn = useClerkSignIn;
export const useSignUp = useClerkSignUp;
export const useClerk = useClerkCore;

// Re-implement SignedIn and SignedOut using Clerk's <Show> component
export const SignedIn = ({ children }) => {
  return <ClerkShow when="signed-in">{children}</ClerkShow>;
};

export const SignedOut = ({ children }) => {
  return <ClerkShow when="signed-out">{children}</ClerkShow>;
};

// Wrapper components to preserve any custom prop signatures if needed
export const UserButton = (props) => {
  return <ClerkUserButton {...props} />;
};

export const AuthenticateWithRedirectCallback = (props) => {
  return <ClerkAuthenticateWithRedirectCallback {...props} />;
};
