import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <SignUp
        appearance={{
          variables: {
            colorPrimary: "#ffffff",
            colorBackground: "#0a0a0a",
            colorText: "#ffffff",
            colorTextSecondary: "#a1a1aa",
            colorInputBackground: "#141414",
            colorInputText: "#ffffff",
            borderRadius: "0.75rem",
          },
          elements: {
            card: "bg-[#0a0a0a] border border-white/10 shadow-2xl",
            headerTitle: "text-white font-orbitron tracking-widest uppercase",
            headerSubtitle: "text-zinc-400",
            formButtonPrimary:
              "bg-white text-black hover:bg-zinc-200 font-semibold tracking-widest uppercase text-xs",
            formFieldInput:
              "bg-[#141414] border-white/10 text-white placeholder:text-zinc-600",
            footerActionLink: "text-white hover:text-zinc-300",
            identityPreviewEditButton: "text-white",
            dividerText: "text-zinc-600",
            dividerLine: "bg-white/10",
            socialButtonsBlockButton:
              "border-white/10 text-white hover:bg-white/5",
          },
        }}
        redirectUrl="/dashboard"
        signInUrl="/sign-in"
      />
    </div>
  );
}
