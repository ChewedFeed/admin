import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { Check, GripVertical, Trash2 } from "lucide-react";
import { useState } from "react";
import { Button } from "#/components/ui/button";
import { Input } from "#/components/ui/input";
import { Label } from "#/components/ui/label";
import { Textarea } from "#/components/ui/textarea";
import type { Milestone } from "#/lib/api";
import {
	createLink,
	createMilestone,
	deleteLink,
	deleteMilestone,
	deleteProject,
	fetchProject,
	updateMilestone,
	updateProject,
} from "#/lib/api";
import { isLoggedIn } from "#/lib/auth";

const milestoneStatuses = [
	{ value: "planned", label: "Planned" },
	{ value: "in_progress", label: "In Progress" },
	{ value: "completed", label: "Completed" },
	{ value: "cancelled", label: "Cancelled" },
];

const milestoneCategories = [
	{ value: "feature", label: "Feature" },
	{ value: "bugfix", label: "Bugfix" },
	{ value: "infrastructure", label: "Infrastructure" },
	{ value: "release", label: "Release" },
	{ value: "other", label: "Other" },
];

export const Route = createFileRoute("/projects/$projectName")({
	beforeLoad: () => {
		if (typeof window !== "undefined" && !isLoggedIn()) {
			throw redirect({ to: "/login" });
		}
	},
	loader: async ({ params }) => {
		const project = await fetchProject(params.projectName);
		return { project };
	},
	component: EditProjectPage,
});

function EditProjectPage() {
	const { project: initialProject } = Route.useLoaderData();
	const navigate = useNavigate();
	const [project, setProject] = useState(initialProject);
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState<string | null>(null);
	const params = Route.useParams();

	const milestones = [...(project.milestones ?? [])].sort(
		(a, b) => a.sortOrder - b.sortOrder || (a.id ?? 0) - (b.id ?? 0),
	);
	const activeMilestones = milestones.filter(
		(item) => item.status !== "cancelled",
	);
	const completedMilestones = activeMilestones.filter(
		(item) => item.status === "completed",
	);

	async function handleSave(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();
		setSaving(true);
		setError(null);
		setSuccess(null);

		const form = new FormData(e.currentTarget);

		try {
			const updated = await updateProject(params.projectName, {
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
			setProject((current) => ({
				...updated,
				links: current.links,
				milestones: current.milestones,
			}));
			setSuccess("Project saved");
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to save project");
		} finally {
			setSaving(false);
		}
	}

	async function handleDelete() {
		if (!confirm("Delete this project?")) return;
		try {
			await deleteProject(params.projectName);
			navigate({ to: "/" });
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to delete project");
		}
	}

	async function handleAddLink(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();
		const formElement = e.currentTarget;
		const form = new FormData(formElement);
		try {
			const link = await createLink(params.projectName, {
				type: form.get("linkType") as string,
				url: form.get("linkUrl") as string,
				label: form.get("linkLabel") as string,
			});
			setProject((p) => ({ ...p, links: [...(p.links ?? []), link] }));
			formElement.reset();
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to add link");
		}
	}

	async function handleDeleteLink(linkId: number) {
		try {
			await deleteLink(params.projectName, linkId);
			setProject((p) => ({
				...p,
				links: p.links?.filter((l) => l.id !== linkId),
			}));
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to delete link");
		}
	}

	async function handleAddMilestone(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();
		const formElement = e.currentTarget;
		const form = new FormData(formElement);
		const status = (form.get("status") as string) || "planned";

		try {
			const item = await createMilestone(params.projectName, {
				title: form.get("title") as string,
				description: (form.get("description") as string) || "",
				category: (form.get("category") as string) || "feature",
				status,
				targetDate: (form.get("targetDate") as string) || undefined,
				completedDate:
					status === "completed"
						? (form.get("completedDate") as string) || undefined
						: undefined,
				sortOrder: milestones.length,
			});
			setProject((p) => ({
				...p,
				milestones: [...(p.milestones ?? []), item],
			}));
			formElement.reset();
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to add milestone");
		}
	}

	async function handleUpdateMilestone(item: Milestone) {
		if (!item.id) return;
		try {
			const updated = await updateMilestone(params.projectName, item.id, {
				title: item.title,
				description: item.description ?? "",
				category: item.category,
				status: item.status,
				targetDate: item.targetDate,
				completedDate:
					item.status === "completed" ? item.completedDate : undefined,
				sortOrder: item.sortOrder,
			});
			setProject((p) => ({
				...p,
				milestones: p.milestones?.map((m) => (m.id === item.id ? updated : m)),
			}));
			setSuccess(`Saved "${updated.title}"`);
		} catch (err) {
			setError(
				err instanceof Error ? err.message : "Failed to update milestone",
			);
		}
	}

	async function handleDeleteMilestone(itemId: number) {
		try {
			await deleteMilestone(params.projectName, itemId);
			setProject((p) => ({
				...p,
				milestones: p.milestones?.filter((m) => m.id !== itemId),
			}));
		} catch (err) {
			setError(
				err instanceof Error ? err.message : "Failed to delete milestone",
			);
		}
	}

	function updateMilestoneDraft(
		itemId: number,
		updater: (current: Milestone) => Milestone,
	) {
		setProject((current) => ({
			...current,
			milestones: current.milestones?.map((item) =>
				item.id === itemId ? updater(item) : item,
			),
		}));
	}

	function CheckIcon() {
		return <Check className="h-3 w-3 text-white" aria-label="Completed" />;
	}

	return (
		<div className="py-8">
			<div className="page-wrap max-w-5xl">
				<div className="mb-6 flex items-center justify-between">
					<h1 className="text-2xl font-bold">Edit: {project.name}</h1>
					<Button variant="destructive" size="sm" onClick={handleDelete}>
						Delete Project
					</Button>
				</div>

				{error && (
					<div className="mb-4 rounded-lg border border-(--color-danger)/30 bg-(--color-danger)/10 p-3 text-sm text-(--color-danger)">
						{error}
					</div>
				)}
				{success && (
					<div className="mb-4 rounded-lg border border-brand-300 bg-brand-50 p-3 text-sm text-brand-700">
						{success}
					</div>
				)}

				<section className="mb-8 rounded-xl border border-(--color-border) bg-(--color-surface) p-6">
					<h2 className="mb-4 text-lg font-semibold">Details</h2>
					<form onSubmit={handleSave} className="space-y-4">
						<div className="grid grid-cols-2 gap-4">
							<div className="space-y-2">
								<Label htmlFor="name">Name</Label>
								<Input
									id="name"
									name="name"
									defaultValue={project.name}
									required
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="icon">Icon</Label>
								<Input id="icon" name="icon" defaultValue={project.icon} />
							</div>
						</div>
						<div className="space-y-2">
							<Label htmlFor="description">Description</Label>
							<Input
								id="description"
								name="description"
								defaultValue={project.description}
								required
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="fullDesc">Full Description</Label>
							<Textarea
								id="fullDesc"
								name="fullDesc"
								defaultValue={project.fullDesc}
								rows={4}
							/>
						</div>
						<div className="grid grid-cols-2 gap-4">
							<div className="space-y-2">
								<Label htmlFor="url">URL</Label>
								<Input id="url" name="url" defaultValue={project.url} />
							</div>
							<div className="space-y-2">
								<Label htmlFor="uptime">Uptime Slug</Label>
								<Input
									id="uptime"
									name="uptime"
									defaultValue={project.uptime}
								/>
							</div>
						</div>
						<div className="grid grid-cols-3 gap-4">
							<div className="space-y-2">
								<Label htmlFor="launchYear">Year</Label>
								<Input
									id="launchYear"
									name="launchYear"
									type="number"
									defaultValue={project.launchDate.year}
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="launchMonth">Month</Label>
								<Input
									id="launchMonth"
									name="launchMonth"
									type="number"
									min={1}
									max={12}
									defaultValue={project.launchDate.month}
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="launchDay">Day</Label>
								<Input
									id="launchDay"
									name="launchDay"
									type="number"
									min={1}
									max={31}
									defaultValue={project.launchDate.day}
								/>
							</div>
						</div>
						<Button type="submit" disabled={saving}>
							{saving ? "Saving..." : "Save"}
						</Button>
					</form>
				</section>

				<section className="mb-8 rounded-xl border border-(--color-border) bg-(--color-surface) p-6">
					<h2 className="mb-4 text-lg font-semibold">Links</h2>
					{project.links && project.links.length > 0 && (
						<div className="mb-4 space-y-2">
							{project.links.map((link) => (
								<div
									key={link.id ?? link.url}
									className="flex items-center justify-between rounded-lg border border-(--color-border) p-3"
								>
									<div>
										<span className="mr-2 rounded bg-(--color-surface-alt) px-2 py-0.5 text-xs font-medium">
											{link.type}
										</span>
										<span className="text-sm">{link.url}</span>
										{link.label && (
											<span className="ml-2 text-sm text-(--color-text-muted)">
												({link.label})
											</span>
										)}
									</div>
									{link.id && (
										<Button
											variant="ghost"
											size="sm"
											className="text-(--color-danger)"
											onClick={() => handleDeleteLink(link.id)}
										>
											Remove
										</Button>
									)}
								</div>
							))}
						</div>
					)}
					<form onSubmit={handleAddLink} className="flex gap-2">
						<select
							name="linkType"
							required
							className="rounded-lg border border-(--color-border) bg-(--color-surface) px-3 py-2 text-sm"
						>
							<option value="main">Main</option>
							<option value="dashboard">Dashboard</option>
							<option value="landing">Landing</option>
							<option value="docs">Docs</option>
						</select>
						<Input name="linkUrl" required placeholder="https://..." />
						<Input name="linkLabel" placeholder="Label" className="w-32" />
						<Button type="submit">Add</Button>
					</form>
				</section>

				<section className="rounded-xl border border-(--color-border) bg-(--color-surface) p-6">
					<div className="mb-4 flex items-center justify-between">
						<div>
							<h2 className="text-lg font-semibold">Milestones</h2>
							<p className="text-sm text-(--color-text-muted)">
								{completedMilestones.length}/{activeMilestones.length} active
								milestones completed
							</p>
						</div>
					</div>

					<form
						onSubmit={handleAddMilestone}
						className="mb-6 grid gap-3 rounded-xl border border-dashed border-(--color-border) bg-(--color-surface-alt) p-4 md:grid-cols-6"
					>
						<div className="md:col-span-2">
							<Input name="title" required placeholder="Milestone title" />
						</div>
						<div className="md:col-span-1">
							<select
								name="category"
								defaultValue="feature"
								className="w-full rounded-lg border border-(--color-border) bg-(--color-surface) px-3 py-2 text-sm"
							>
								{milestoneCategories.map((category) => (
									<option key={category.value} value={category.value}>
										{category.label}
									</option>
								))}
							</select>
						</div>
						<div className="md:col-span-1">
							<select
								name="status"
								defaultValue="planned"
								className="w-full rounded-lg border border-(--color-border) bg-(--color-surface) px-3 py-2 text-sm"
							>
								{milestoneStatuses.map((status) => (
									<option key={status.value} value={status.value}>
										{status.label}
									</option>
								))}
							</select>
						</div>
						<div className="md:col-span-1">
							<Input name="targetDate" type="date" />
						</div>
						<div className="md:col-span-1">
							<Input name="completedDate" type="date" />
						</div>
						<div className="md:col-span-5">
							<Textarea
								name="description"
								rows={2}
								placeholder="Context, release notes, or delivery detail"
							/>
						</div>
						<div className="md:col-span-1 flex items-end">
							<Button type="submit" className="w-full">
								Add Milestone
							</Button>
						</div>
					</form>

					<div className="space-y-3">
						{milestones.map((item, index) => (
							<div
								key={item.id ?? `${item.title}-${index}`}
								className="rounded-xl border border-(--color-border) p-4"
							>
								<div className="mb-3 flex items-start gap-3">
									<div className="pt-2 text-(--color-text-muted)">
										<GripVertical className="h-4 w-4" />
									</div>
									<div
										className={`mt-1 flex h-5 w-5 items-center justify-center rounded-full border-2 ${
											item.status === "completed"
												? "border-brand-500 bg-brand-500"
												: "border-(--color-border)"
										}`}
									>
										{item.status === "completed" && <CheckIcon />}
									</div>
									<div className="flex-1">
										<div className="grid gap-3 md:grid-cols-6">
											<div className="md:col-span-2">
												<Label className="mb-2 block text-xs">Title</Label>
												<Input
													value={item.title}
													onChange={(e) =>
														updateMilestoneDraft(item.id ?? -1, (current) => ({
															...current,
															title: e.target.value,
														}))
													}
												/>
											</div>
											<div>
												<Label className="mb-2 block text-xs">Category</Label>
												<select
													value={item.category}
													onChange={(e) =>
														updateMilestoneDraft(item.id ?? -1, (current) => ({
															...current,
															category: e.target.value,
														}))
													}
													className="w-full rounded-lg border border-(--color-border) bg-(--color-surface) px-3 py-2 text-sm"
												>
													{milestoneCategories.map((category) => (
														<option key={category.value} value={category.value}>
															{category.label}
														</option>
													))}
												</select>
											</div>
											<div>
												<Label className="mb-2 block text-xs">Status</Label>
												<select
													value={item.status}
													onChange={(e) =>
														updateMilestoneDraft(item.id ?? -1, (current) => ({
															...current,
															status: e.target.value,
															completedDate:
																e.target.value === "completed"
																	? current.completedDate
																	: undefined,
														}))
													}
													className="w-full rounded-lg border border-(--color-border) bg-(--color-surface) px-3 py-2 text-sm"
												>
													{milestoneStatuses.map((status) => (
														<option key={status.value} value={status.value}>
															{status.label}
														</option>
													))}
												</select>
											</div>
											<div>
												<Label className="mb-2 block text-xs">Target</Label>
												<Input
													type="date"
													value={item.targetDate ?? ""}
													onChange={(e) =>
														updateMilestoneDraft(item.id ?? -1, (current) => ({
															...current,
															targetDate: e.target.value || undefined,
														}))
													}
												/>
											</div>
											<div>
												<Label className="mb-2 block text-xs">Completed</Label>
												<Input
													type="date"
													value={item.completedDate ?? ""}
													onChange={(e) =>
														updateMilestoneDraft(item.id ?? -1, (current) => ({
															...current,
															completedDate: e.target.value || undefined,
														}))
													}
												/>
											</div>
										</div>
										<div className="mt-3">
											<Label className="mb-2 block text-xs">Description</Label>
											<Textarea
												rows={3}
												value={item.description ?? ""}
												onChange={(e) =>
													updateMilestoneDraft(item.id ?? -1, (current) => ({
														...current,
														description: e.target.value,
													}))
												}
											/>
										</div>
									</div>
								</div>
								<div className="flex items-center justify-between">
									<p className="text-xs text-(--color-text-muted)">
										Sort order: {item.sortOrder}
									</p>
									<div className="flex gap-2">
										<Button
											size="sm"
											onClick={() => handleUpdateMilestone(item)}
										>
											Save
										</Button>
										{item.id && (
											<Button
												variant="ghost"
												size="sm"
												className="text-(--color-danger)"
												onClick={() => handleDeleteMilestone(item.id)}
											>
												<Trash2 className="mr-1 h-4 w-4" />
												Remove
											</Button>
										)}
									</div>
								</div>
							</div>
						))}
					</div>

					{milestones.length === 0 && (
						<p className="text-sm text-(--color-text-muted)">
							No milestones yet.
						</p>
					)}
				</section>
			</div>
		</div>
	);
}
