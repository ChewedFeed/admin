import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { createProject } from "#/lib/api";
import { isLoggedIn } from "#/lib/auth";

export const Route = createFileRoute("/projects/new")({
	beforeLoad: () => {
		if (typeof window !== "undefined" && !isLoggedIn()) {
			throw redirect({ to: "/login" });
		}
	},
	component: NewProjectPage,
});

function NewProjectPage() {
	const navigate = useNavigate();
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);

	async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();
		setSaving(true);
		setError(null);

		const form = new FormData(e.currentTarget);

		try {
			await createProject({
				name: form.get("name") as string,
				description: form.get("description") as string,
				fullDesc: form.get("fullDesc") as string,
				icon: form.get("icon") as string,
				url: form.get("url") as string,
				uptime: form.get("uptime") as string,
				launchDate: {
					year: Number(form.get("launchYear")),
					month: Number(form.get("launchMonth")),
					day: Number(form.get("launchDay")),
				},
			});
			navigate({ to: "/" });
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to create project");
		} finally {
			setSaving(false);
		}
	}

	return (
		<div className="py-8">
			<div className="page-wrap max-w-2xl">
				<h1 className="text-2xl font-bold mb-6">New Project</h1>

				{error && (
					<div className="mb-4 rounded-lg border border-(--color-danger)/30 bg-(--color-danger)/10 p-3 text-sm text-(--color-danger)">
						{error}
					</div>
				)}

				<form onSubmit={handleSubmit} className="space-y-4">
					<div>
						<label className="block text-sm font-medium mb-1">Name</label>
						<input
							name="name"
							required
							className="w-full rounded-lg border border-(--color-border) bg-(--color-surface) px-3 py-2 text-sm"
						/>
					</div>
					<div>
						<label className="block text-sm font-medium mb-1">
							Description
						</label>
						<input
							name="description"
							required
							className="w-full rounded-lg border border-(--color-border) bg-(--color-surface) px-3 py-2 text-sm"
						/>
					</div>
					<div>
						<label className="block text-sm font-medium mb-1">
							Full Description (Markdown)
						</label>
						<textarea
							name="fullDesc"
							rows={4}
							className="w-full rounded-lg border border-(--color-border) bg-(--color-surface) px-3 py-2 text-sm"
						/>
					</div>
					<div className="grid grid-cols-2 gap-4">
						<div>
							<label className="block text-sm font-medium mb-1">
								Icon (FontAwesome)
							</label>
							<input
								name="icon"
								placeholder="solid fa-flag"
								className="w-full rounded-lg border border-(--color-border) bg-(--color-surface) px-3 py-2 text-sm"
							/>
						</div>
						<div>
							<label className="block text-sm font-medium mb-1">URL</label>
							<input
								name="url"
								placeholder="https://example.com"
								className="w-full rounded-lg border border-(--color-border) bg-(--color-surface) px-3 py-2 text-sm"
							/>
						</div>
					</div>
					<div>
						<label className="block text-sm font-medium mb-1">
							Uptime Slug
						</label>
						<input
							name="uptime"
							className="w-full rounded-lg border border-(--color-border) bg-(--color-surface) px-3 py-2 text-sm"
						/>
					</div>
					<div className="grid grid-cols-3 gap-4">
						<div>
							<label className="block text-sm font-medium mb-1">
								Launch Year
							</label>
							<input
								name="launchYear"
								type="number"
								defaultValue={new Date().getFullYear()}
								className="w-full rounded-lg border border-(--color-border) bg-(--color-surface) px-3 py-2 text-sm"
							/>
						</div>
						<div>
							<label className="block text-sm font-medium mb-1">
								Launch Month
							</label>
							<input
								name="launchMonth"
								type="number"
								min={1}
								max={12}
								defaultValue={1}
								className="w-full rounded-lg border border-(--color-border) bg-(--color-surface) px-3 py-2 text-sm"
							/>
						</div>
						<div>
							<label className="block text-sm font-medium mb-1">
								Launch Day
							</label>
							<input
								name="launchDay"
								type="number"
								min={1}
								max={31}
								defaultValue={1}
								className="w-full rounded-lg border border-(--color-border) bg-(--color-surface) px-3 py-2 text-sm"
							/>
						</div>
					</div>

					<div className="flex gap-3 pt-4">
						<button
							type="submit"
							disabled={saving}
							className="rounded-lg bg-brand-600 px-4 py-2 text-sm text-white font-medium hover:bg-brand-700 transition-colors disabled:opacity-50"
						>
							{saving ? "Creating..." : "Create Project"}
						</button>
						<button
							type="button"
							onClick={() => navigate({ to: "/" })}
							className="rounded-lg border border-(--color-border) px-4 py-2 text-sm font-medium hover:bg-(--color-surface-alt) transition-colors"
						>
							Cancel
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}
