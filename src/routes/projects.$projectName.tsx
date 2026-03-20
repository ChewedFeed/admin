import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { isLoggedIn } from "#/lib/auth";
import {
	fetchProject,
	updateProject,
	deleteProject,
	createLink,
	deleteLink,
	createRoadmapItem,
	updateRoadmapItem,
	deleteRoadmapItem,
	fetchLaunchTasks,
	createLaunchTask,
	updateLaunchTask,
	deleteLaunchTask,
} from "#/lib/api";
import type { Project, ProjectLink, RoadmapItem, LaunchTask } from "#/lib/api";

export const Route = createFileRoute("/projects/$projectName")({
	beforeLoad: () => {
		if (typeof window !== "undefined" && !isLoggedIn()) {
			throw redirect({ to: "/login" });
		}
	},
	loader: async ({ params }) => {
		const project = await fetchProject(params.projectName);
		let tasks: LaunchTask[] = [];
		try {
			tasks = await fetchLaunchTasks(params.projectName);
		} catch {
			// tasks endpoint may not exist yet
		}
		return { project, tasks };
	},
	component: EditProjectPage,
});

function EditProjectPage() {
	const { project: initialProject, tasks: initialTasks } =
		Route.useLoaderData();
	const navigate = useNavigate();
	const [project, setProject] = useState(initialProject);
	const [tasks, setTasks] = useState(initialTasks);
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState<string | null>(null);
	const params = Route.useParams();

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
			setProject(updated);
			setSuccess("Project saved");
		} catch (err) {
			setError(
				err instanceof Error ? err.message : "Failed to save project",
			);
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
			setError(
				err instanceof Error ? err.message : "Failed to delete project",
			);
		}
	}

	async function handleAddLink(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();
		const form = new FormData(e.currentTarget);
		try {
			const link = await createLink(params.projectName, {
				type: form.get("linkType") as string,
				url: form.get("linkUrl") as string,
				label: form.get("linkLabel") as string,
			});
			setProject((p) => ({ ...p, links: [...(p.links ?? []), link] }));
			e.currentTarget.reset();
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
			setError(
				err instanceof Error ? err.message : "Failed to delete link",
			);
		}
	}

	async function handleAddRoadmapItem(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();
		const form = new FormData(e.currentTarget);
		try {
			const item = await createRoadmapItem(params.projectName, {
				name: form.get("itemName") as string,
				targetDate: (form.get("itemTargetDate") as string) || undefined,
				completed: false,
				sortOrder: (project.roadmap?.length ?? 0),
			});
			setProject((p) => ({
				...p,
				roadmap: [...(p.roadmap ?? []), item],
			}));
			e.currentTarget.reset();
		} catch (err) {
			setError(
				err instanceof Error ? err.message : "Failed to add roadmap item",
			);
		}
	}

	async function handleToggleRoadmapItem(item: RoadmapItem) {
		if (!item.id) return;
		try {
			const updated = await updateRoadmapItem(
				params.projectName,
				item.id,
				{ completed: !item.completed },
			);
			setProject((p) => ({
				...p,
				roadmap: p.roadmap?.map((r) =>
					r.id === item.id ? updated : r,
				),
			}));
		} catch (err) {
			setError(
				err instanceof Error ? err.message : "Failed to update roadmap item",
			);
		}
	}

	async function handleDeleteRoadmapItem(itemId: number) {
		try {
			await deleteRoadmapItem(params.projectName, itemId);
			setProject((p) => ({
				...p,
				roadmap: p.roadmap?.filter((r) => r.id !== itemId),
			}));
		} catch (err) {
			setError(
				err instanceof Error
					? err.message
					: "Failed to delete roadmap item",
			);
		}
	}

	async function handleAddTask() {
		try {
			const task = await createLaunchTask(params.projectName, {
				completed: false,
			});
			setTasks((t) => [...t, task]);
		} catch (err) {
			setError(
				err instanceof Error ? err.message : "Failed to add task",
			);
		}
	}

	async function handleToggleTask(task: LaunchTask) {
		if (!task.id) return;
		try {
			const updated = await updateLaunchTask(
				params.projectName,
				task.id,
				{ completed: !task.completed },
			);
			setTasks((t) => t.map((tt) => (tt.id === task.id ? updated : tt)));
		} catch (err) {
			setError(
				err instanceof Error ? err.message : "Failed to update task",
			);
		}
	}

	async function handleDeleteTask(taskId: number) {
		try {
			await deleteLaunchTask(params.projectName, taskId);
			setTasks((t) => t.filter((tt) => tt.id !== taskId));
		} catch (err) {
			setError(
				err instanceof Error ? err.message : "Failed to delete task",
			);
		}
	}

	return (
		<div className="py-8">
			<div className="page-wrap max-w-3xl">
				<div className="flex items-center justify-between mb-6">
					<h1 className="text-2xl font-bold">Edit: {project.name}</h1>
					<button
						type="button"
						onClick={handleDelete}
						className="rounded-lg border border-(--color-danger)/30 px-3 py-1.5 text-sm text-(--color-danger) hover:bg-(--color-danger)/10 transition-colors"
					>
						Delete Project
					</button>
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

				{/* Project Details */}
				<section className="mb-8 rounded-xl border border-(--color-border) bg-(--color-surface) p-6">
					<h2 className="text-lg font-semibold mb-4">Details</h2>
					<form onSubmit={handleSave} className="space-y-4">
						<div className="grid grid-cols-2 gap-4">
							<div>
								<label className="block text-sm font-medium mb-1">Name</label>
								<input
									name="name"
									defaultValue={project.name}
									required
									className="w-full rounded-lg border border-(--color-border) bg-(--color-surface) px-3 py-2 text-sm"
								/>
							</div>
							<div>
								<label className="block text-sm font-medium mb-1">
									Icon
								</label>
								<input
									name="icon"
									defaultValue={project.icon}
									className="w-full rounded-lg border border-(--color-border) bg-(--color-surface) px-3 py-2 text-sm"
								/>
							</div>
						</div>
						<div>
							<label className="block text-sm font-medium mb-1">
								Description
							</label>
							<input
								name="description"
								defaultValue={project.description}
								required
								className="w-full rounded-lg border border-(--color-border) bg-(--color-surface) px-3 py-2 text-sm"
							/>
						</div>
						<div>
							<label className="block text-sm font-medium mb-1">
								Full Description
							</label>
							<textarea
								name="fullDesc"
								defaultValue={project.fullDesc}
								rows={4}
								className="w-full rounded-lg border border-(--color-border) bg-(--color-surface) px-3 py-2 text-sm"
							/>
						</div>
						<div className="grid grid-cols-2 gap-4">
							<div>
								<label className="block text-sm font-medium mb-1">URL</label>
								<input
									name="url"
									defaultValue={project.url}
									className="w-full rounded-lg border border-(--color-border) bg-(--color-surface) px-3 py-2 text-sm"
								/>
							</div>
							<div>
								<label className="block text-sm font-medium mb-1">
									Uptime Slug
								</label>
								<input
									name="uptime"
									defaultValue={project.uptime}
									className="w-full rounded-lg border border-(--color-border) bg-(--color-surface) px-3 py-2 text-sm"
								/>
							</div>
						</div>
						<div className="grid grid-cols-3 gap-4">
							<div>
								<label className="block text-sm font-medium mb-1">Year</label>
								<input
									name="launchYear"
									type="number"
									defaultValue={project.launchDate.year}
									className="w-full rounded-lg border border-(--color-border) bg-(--color-surface) px-3 py-2 text-sm"
								/>
							</div>
							<div>
								<label className="block text-sm font-medium mb-1">
									Month
								</label>
								<input
									name="launchMonth"
									type="number"
									min={1}
									max={12}
									defaultValue={project.launchDate.month}
									className="w-full rounded-lg border border-(--color-border) bg-(--color-surface) px-3 py-2 text-sm"
								/>
							</div>
							<div>
								<label className="block text-sm font-medium mb-1">Day</label>
								<input
									name="launchDay"
									type="number"
									min={1}
									max={31}
									defaultValue={project.launchDate.day}
									className="w-full rounded-lg border border-(--color-border) bg-(--color-surface) px-3 py-2 text-sm"
								/>
							</div>
						</div>
						<button
							type="submit"
							disabled={saving}
							className="rounded-lg bg-brand-600 px-4 py-2 text-sm text-white font-medium hover:bg-brand-700 transition-colors disabled:opacity-50"
						>
							{saving ? "Saving..." : "Save"}
						</button>
					</form>
				</section>

				{/* Links */}
				<section className="mb-8 rounded-xl border border-(--color-border) bg-(--color-surface) p-6">
					<h2 className="text-lg font-semibold mb-4">Links</h2>
					{project.links && project.links.length > 0 && (
						<div className="space-y-2 mb-4">
							{project.links.map((link) => (
								<div
									key={link.id ?? link.url}
									className="flex items-center justify-between rounded-lg border border-(--color-border) p-3"
								>
									<div>
										<span className="text-xs font-medium bg-(--color-surface-alt) px-2 py-0.5 rounded mr-2">
											{link.type}
										</span>
										<span className="text-sm">{link.url}</span>
										{link.label && (
											<span className="text-sm text-(--color-text-muted) ml-2">
												({link.label})
											</span>
										)}
									</div>
									{link.id && (
										<button
											type="button"
											onClick={() => handleDeleteLink(link.id as number)}
											className="text-xs text-(--color-danger) hover:underline"
										>
											Remove
										</button>
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
						<input
							name="linkUrl"
							required
							placeholder="https://..."
							className="flex-1 rounded-lg border border-(--color-border) bg-(--color-surface) px-3 py-2 text-sm"
						/>
						<input
							name="linkLabel"
							placeholder="Label"
							className="w-32 rounded-lg border border-(--color-border) bg-(--color-surface) px-3 py-2 text-sm"
						/>
						<button
							type="submit"
							className="rounded-lg bg-brand-600 px-3 py-2 text-sm text-white font-medium hover:bg-brand-700 transition-colors"
						>
							Add
						</button>
					</form>
				</section>

				{/* Roadmap */}
				<section className="mb-8 rounded-xl border border-(--color-border) bg-(--color-surface) p-6">
					<h2 className="text-lg font-semibold mb-4">Roadmap</h2>
					{project.roadmap && project.roadmap.length > 0 && (
						<div className="space-y-2 mb-4">
							{project.roadmap.map((item) => (
								<div
									key={item.id ?? item.name}
									className="flex items-center gap-3 rounded-lg border border-(--color-border) p-3"
								>
									<button
										type="button"
										onClick={() => handleToggleRoadmapItem(item)}
										className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${
											item.completed
												? "border-brand-500 bg-brand-500"
												: "border-(--color-border)"
										}`}
									>
										{item.completed && (
											<svg
												className="w-3 h-3 text-white"
												fill="none"
												viewBox="0 0 24 24"
												stroke="currentColor"
												strokeWidth={3}
											>
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													d="M5 13l4 4L19 7"
												/>
											</svg>
										)}
									</button>
									<div className="flex-1">
										<span
											className={
												item.completed
													? "line-through text-(--color-text-muted)"
													: ""
											}
										>
											{item.name}
										</span>
										{item.targetDate && (
											<span className="text-xs text-(--color-text-muted) ml-2">
												Target: {item.targetDate}
											</span>
										)}
									</div>
									{item.id && (
										<button
											type="button"
											onClick={() =>
												handleDeleteRoadmapItem(item.id as number)
											}
											className="text-xs text-(--color-danger) hover:underline"
										>
											Remove
										</button>
									)}
								</div>
							))}
						</div>
					)}
					<form onSubmit={handleAddRoadmapItem} className="flex gap-2">
						<input
							name="itemName"
							required
							placeholder="Feature name"
							className="flex-1 rounded-lg border border-(--color-border) bg-(--color-surface) px-3 py-2 text-sm"
						/>
						<input
							name="itemTargetDate"
							type="date"
							className="rounded-lg border border-(--color-border) bg-(--color-surface) px-3 py-2 text-sm"
						/>
						<button
							type="submit"
							className="rounded-lg bg-brand-600 px-3 py-2 text-sm text-white font-medium hover:bg-brand-700 transition-colors"
						>
							Add
						</button>
					</form>
				</section>

				{/* Launch Tasks */}
				<section className="rounded-xl border border-(--color-border) bg-(--color-surface) p-6">
					<div className="flex items-center justify-between mb-4">
						<h2 className="text-lg font-semibold">
							Launch Tasks
							<span className="text-sm font-normal text-(--color-text-muted) ml-2">
								({tasks.filter((t) => t.completed).length}/{tasks.length}{" "}
								complete)
							</span>
						</h2>
						<button
							type="button"
							onClick={handleAddTask}
							className="rounded-lg bg-brand-600 px-3 py-1.5 text-sm text-white font-medium hover:bg-brand-700 transition-colors"
						>
							Add Task
						</button>
					</div>
					{tasks.length > 0 && (
						<div className="space-y-2">
							{tasks.map((task) => (
								<div
									key={task.id}
									className="flex items-center gap-3 rounded-lg border border-(--color-border) p-3"
								>
									<button
										type="button"
										onClick={() => handleToggleTask(task)}
										className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${
											task.completed
												? "border-brand-500 bg-brand-500"
												: "border-(--color-border)"
										}`}
									>
										{task.completed && (
											<svg
												className="w-3 h-3 text-white"
												fill="none"
												viewBox="0 0 24 24"
												stroke="currentColor"
												strokeWidth={3}
											>
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													d="M5 13l4 4L19 7"
												/>
											</svg>
										)}
									</button>
									<span
										className={`flex-1 text-sm ${task.completed ? "line-through text-(--color-text-muted)" : ""}`}
									>
										Task #{task.id}
									</span>
									{task.id && (
										<button
											type="button"
											onClick={() => handleDeleteTask(task.id as number)}
											className="text-xs text-(--color-danger) hover:underline"
										>
											Remove
										</button>
									)}
								</div>
							))}
						</div>
					)}
					{tasks.length === 0 && (
						<p className="text-sm text-(--color-text-muted)">
							No launch tasks yet.
						</p>
					)}
				</section>
			</div>
		</div>
	);
}
