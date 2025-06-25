// app/login/page.tsx
import { BotMessageSquare } from "lucide-react";
import { LoginForm } from "./_components/login-form";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center">
          <BotMessageSquare className="mb-4 h-12 w-12 text-primary" />
          <h1 className="text-3xl font-bold">Welcome to Atlas</h1>
          <p className="text-muted-foreground">Sign in to your command center</p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}