import { SignIn } from "@clerk/nextjs";
import { dark } from "@clerk/themes";

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <SignIn
        appearance={{
          baseTheme: dark,
          variables: {
            colorPrimary: "#ffffff",
          },
          elements: {
            card: "bg-[#0a0a0a] border border-white/10 shadow-2xl",
            headerTitle: "font-orbitron tracking-widest uppercase",
            formButtonPrimary:
              "bg-white text-black hover:bg-zinc-200 font-semibold tracking-widest uppercase text-xs",
          },
        }}
        redirectUrl="/dashboard"
        signUpUrl="/sign-up"
      />
    </div>
  );
}
