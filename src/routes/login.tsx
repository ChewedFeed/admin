import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "#/components/ui/button";
import { Input } from "#/components/ui/input";
import { Label } from "#/components/ui/label";
import { login } from "#/lib/auth";

export const Route = createFileRoute("/login")({
	component: LoginPage,
});

function LoginPage() {
	const navigate = useNavigate();
	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);

	async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();
		setLoading(true);
		setError(null);

		const form = new FormData(e.currentTarget);
		const username = form.get("username") as string;
		const password = form.get("password") as string;

		try {
			await login(username, password);
			navigate({ to: "/" });
		} catch {
			setError("Invalid credentials");
		} finally {
			setLoading(false);
		}
	}

	return (
		<div className="flex min-h-[80vh] items-center justify-center">
			<div className="w-full max-w-sm rounded-xl border border-(--color-border) bg-(--color-surface) p-8">
				<h1 className="text-2xl font-bold mb-6 text-center">Admin Login</h1>

				{error && (
					<div className="mb-4 rounded-lg border border-(--color-danger)/30 bg-(--color-danger)/10 p-3 text-sm text-(--color-danger) text-center">
						{error}
					</div>
				)}

				<form onSubmit={handleSubmit} className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="username">Username</Label>
						<Input
							id="username"
							name="username"
							required
							autoComplete="username"
						/>
					</div>
					<div className="space-y-2">
						<Label htmlFor="password">Password</Label>
						<Input
							id="password"
							name="password"
							type="password"
							required
							autoComplete="current-password"
						/>
					</div>
					<Button type="submit" disabled={loading} className="w-full">
						{loading ? "Signing in..." : "Sign in"}
					</Button>
				</form>
			</div>
		</div>
	);
}
