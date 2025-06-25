// app/login/_components/login-form.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signIn } from "next-auth/react"; // Use the client-side hook
import { useRouter } from "next/navigation";

export function LoginForm() {
    const router = useRouter();

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const email = formData.get("email") as string;
        const password = formData.get("password") as string;

        const result = await signIn("credentials", {
            redirect: false, // Do not redirect automatically, handle it manually
            email,
            password,
        });

        if (result?.ok) {
            // On success, redirect to the dashboard
            router.push("/");
        } else {
            // Handle error, e.g., show a toast message
            alert(result?.error || "Invalid credentials");
        }
    }

    return (
        <form onSubmit={handleSubmit}>
            <Card>
                <CardContent className="space-y-4 pt-6">
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" name="email" type="email" placeholder="dandi@atlas.dev" required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input id="password" name="password" type="password" required />
                    </div>
                </CardContent>
                <CardFooter>
                    <Button type="submit" className="w-full">Sign In</Button>
                </CardFooter>
            </Card>
        </form>
    )
}