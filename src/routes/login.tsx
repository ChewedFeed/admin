import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
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
					<div>
						<label className="block text-sm font-medium mb-1">Username</label>
						<input
							name="username"
							required
							autoComplete="username"
							className="w-full rounded-lg border border-(--color-border) bg-(--color-surface) px-3 py-2 text-sm"
						/>
					</div>
					<div>
						<label className="block text-sm font-medium mb-1">Password</label>
						<input
							name="password"
							type="password"
							required
							autoComplete="current-password"
							className="w-full rounded-lg border border-(--color-border) bg-(--color-surface) px-3 py-2 text-sm"
						/>
					</div>
					<button
						type="submit"
						disabled={loading}
						className="w-full rounded-lg bg-brand-600 px-4 py-2 text-sm text-white font-medium hover:bg-brand-700 transition-colors disabled:opacity-50"
					>
						{loading ? "Signing in..." : "Sign in"}
					</button>
				</form>
			</div>
		</div>
	);
}
