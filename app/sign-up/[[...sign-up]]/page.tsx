import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center pt-20">
      <SignUp
        redirectUrl="/dashboard"
        signInUrl="/sign-in"
      />
    </div>
  );
}
