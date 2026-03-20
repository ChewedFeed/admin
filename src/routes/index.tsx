import { createFileRoute, Link } from "@tanstack/react-router";
import { fetchProjects } from "#/lib/api";

export const Route = createFileRoute("/")({
	loader: async () => {
		const projects = await fetchProjects();
		return { projects };
	},
	component: ProjectsListPage,
});

function ProjectsListPage() {
	const { projects } = Route.useLoaderData();

	return (
		<div className="py-8">
			<div className="page-wrap">
				<div className="flex items-center justify-between mb-6">
					<h1 className="text-2xl font-bold">Projects</h1>
					<Link
						to="/projects/new"
						className="rounded-lg bg-brand-600 px-4 py-2 text-sm text-white font-medium hover:bg-brand-700 transition-colors"
					>
						New Project
					</Link>
				</div>

				<div className="rounded-xl border border-(--color-border) bg-(--color-surface) overflow-hidden">
					<table className="w-full text-sm">
						<thead>
							<tr className="border-b border-(--color-border) bg-(--color-surface-alt)">
								<th className="text-left px-4 py-3 font-medium">Name</th>
								<th className="text-left px-4 py-3 font-medium">Description</th>
								<th className="text-left px-4 py-3 font-medium">Status</th>
								<th className="text-left px-4 py-3 font-medium">Progress</th>
								<th className="text-left px-4 py-3 font-medium">Links</th>
								<th className="text-right px-4 py-3 font-medium">Actions</th>
							</tr>
						</thead>
						<tbody>
							{projects.map((project) => {
								const searchName = project.name
									.toLowerCase()
									.replace(/\s+/g, "-");
								return (
									<tr
										key={project.name}
										className="border-b border-(--color-border) last:border-0"
									>
										<td className="px-4 py-3 font-medium">{project.name}</td>
										<td className="px-4 py-3 text-(--color-text-muted) max-w-xs truncate">
											{project.description}
										</td>
										<td className="px-4 py-3">
											{project.launched ? (
												<span className="text-xs font-medium text-brand-600 bg-brand-100 px-2 py-0.5 rounded-full">
													Live
												</span>
											) : (
												<span className="text-xs font-medium text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full">
													In Progress
												</span>
											)}
										</td>
										<td className="px-4 py-3">{project.progress}%</td>
										<td className="px-4 py-3 text-(--color-text-muted)">
											{project.links?.length ?? 0}
										</td>
										<td className="px-4 py-3 text-right">
											<Link
												to="/projects/$projectName"
												params={{ projectName: searchName }}
												className="text-brand-600 hover:text-brand-700 font-medium"
											>
												Edit
											</Link>
										</td>
									</tr>
								);
							})}
							{projects.length === 0 && (
								<tr>
									<td
										colSpan={6}
										className="px-4 py-8 text-center text-(--color-text-muted)"
									>
										No projects yet.
									</td>
								</tr>
							)}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	);
}
