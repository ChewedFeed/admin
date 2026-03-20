const CMS_API_URL =
	typeof window !== "undefined"
		? (import.meta.env.VITE_CMS_API_URL ?? "https://cms.chewedfeed.com")
		: (process.env.CMS_API_URL ?? "https://cms.chewedfeed.com");

export type ProjectLink = {
	id?: number;
	type: string;
	url: string;
	label?: string;
};

export type Milestone = {
	id?: number;
	serviceId?: number;
	title: string;
	description?: string;
	category: string;
	status: string;
	targetDate?: string;
	completedDate?: string;
	sortOrder: number;
};

export type LaunchDate = {
	year: number;
	month: number;
	day: number;
};

export type Project = {
	id?: number;
	name: string;
	searchName?: string;
	description: string;
	url: string;
	launchDate: LaunchDate;
	progress: number;
	progress2: number;
	icon: string;
	fullDesc: string;
	uptime: string;
	launched: boolean;
	links?: ProjectLink[];
	milestones?: Milestone[];
};

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
	const headers: Record<string, string> = {
		"Content-Type": "application/json",
	};

	if (typeof window !== "undefined") {
		const token = localStorage.getItem("chewedfeed_admin_token");
		if (token) {
			headers.Authorization = `Bearer ${token}`;
		}
	}

	const res = await fetch(`${CMS_API_URL}${path}`, {
		headers: {
			...headers,
			...options?.headers,
		},
		...options,
	});

	if (res.status === 401 && typeof window !== "undefined") {
		localStorage.removeItem("chewedfeed_admin_token");
		window.location.href = "/login";
		throw new Error("Unauthorized");
	}

	if (!res.ok) {
		throw new Error(`API error ${res.status}: ${res.statusText}`);
	}
	return res.json();
}

// Projects
export function fetchProjects(): Promise<Project[]> {
	return apiFetch("/services");
}

export function fetchProject(name: string): Promise<Project> {
	return apiFetch(`/service/${name}`);
}

export function createProject(project: Partial<Project>): Promise<Project> {
	return apiFetch("/service", {
		method: "POST",
		body: JSON.stringify(project),
	});
}

export function updateProject(
	name: string,
	project: Partial<Project>,
): Promise<Project> {
	return apiFetch(`/service/${name}`, {
		method: "PUT",
		body: JSON.stringify(project),
	});
}

export function deleteProject(name: string): Promise<void> {
	return apiFetch(`/service/${name}`, { method: "DELETE" });
}

// Links
export function createLink(
	serviceName: string,
	link: Partial<ProjectLink>,
): Promise<ProjectLink> {
	return apiFetch(`/service/${serviceName}/links`, {
		method: "POST",
		body: JSON.stringify(link),
	});
}

export function deleteLink(serviceName: string, linkId: number): Promise<void> {
	return apiFetch(`/service/${serviceName}/links/${linkId}`, {
		method: "DELETE",
	});
}

// Milestones
export function fetchMilestones(serviceName: string): Promise<Milestone[]> {
	return apiFetch(`/service/${serviceName}/milestones`);
}

export function createMilestone(
	serviceName: string,
	item: Partial<Milestone>,
): Promise<Milestone> {
	return apiFetch(`/service/${serviceName}/milestones`, {
		method: "POST",
		body: JSON.stringify(item),
	});
}

export function updateMilestone(
	serviceName: string,
	itemId: number,
	item: Partial<Milestone>,
): Promise<Milestone> {
	return apiFetch(`/service/${serviceName}/milestones/${itemId}`, {
		method: "PUT",
		body: JSON.stringify(item),
	});
}

export function deleteMilestone(
	serviceName: string,
	itemId: number,
): Promise<void> {
	return apiFetch(`/service/${serviceName}/milestones/${itemId}`, {
		method: "DELETE",
	});
}
