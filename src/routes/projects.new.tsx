import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "#/components/ui/button";
import { Input } from "#/components/ui/input";
import { Label } from "#/components/ui/label";
import { Textarea } from "#/components/ui/textarea";
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
	const [status, setStatus] = useState<string | null>(null);

	async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();
		setSaving(true);
		setError(null);
		setStatus("Creating site. This can take a few seconds locally.");

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
			setStatus("Site created. Redirecting...");
			navigate({ to: "/" });
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to create project");
			setStatus(null);
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
				{status && (
					<div className="mb-4 rounded-lg border border-brand-300 bg-brand-50 p-3 text-sm text-brand-700">
						{status}
					</div>
				)}

				<form onSubmit={handleSubmit} className="space-y-4">
					<fieldset disabled={saving} className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="name">Name</Label>
							<Input id="name" name="name" required />
						</div>
						<div className="space-y-2">
							<Label htmlFor="description">Description</Label>
							<Input id="description" name="description" required />
						</div>
						<div className="space-y-2">
							<Label htmlFor="fullDesc">Full Description (Markdown)</Label>
							<Textarea id="fullDesc" name="fullDesc" rows={4} />
						</div>
						<div className="grid grid-cols-2 gap-4">
							<div className="space-y-2">
								<Label htmlFor="icon">Icon (FontAwesome)</Label>
								<Input id="icon" name="icon" placeholder="solid fa-flag" />
							</div>
							<div className="space-y-2">
								<Label htmlFor="url">URL</Label>
								<Input id="url" name="url" placeholder="https://example.com" />
							</div>
						</div>
						<div className="space-y-2">
							<Label htmlFor="uptime">Uptime Slug</Label>
							<Input id="uptime" name="uptime" />
						</div>
						<div className="grid grid-cols-3 gap-4">
							<div className="space-y-2">
								<Label htmlFor="launchYear">Launch Year</Label>
								<Input
									id="launchYear"
									name="launchYear"
									type="number"
									defaultValue={new Date().getFullYear()}
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="launchMonth">Launch Month</Label>
								<Input
									id="launchMonth"
									name="launchMonth"
									type="number"
									min={1}
									max={12}
									defaultValue={1}
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="launchDay">Launch Day</Label>
								<Input
									id="launchDay"
									name="launchDay"
									type="number"
									min={1}
									max={31}
									defaultValue={1}
								/>
							</div>
						</div>

						<div className="flex gap-3 pt-4">
							<Button type="submit" disabled={saving}>
								{saving ? "Creating Site..." : "Create Project"}
							</Button>
							<Button
								type="button"
								variant="outline"
								disabled={saving}
								onClick={() => navigate({ to: "/" })}
							>
								Cancel
							</Button>
						</div>
					</fieldset>
				</form>
			</div>
		</div>
	);
}
