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

export type RoadmapItem = {
	id?: number;
	name: string;
	targetDate?: string;
	releaseDate?: string;
	completed: boolean;
	sortOrder: number;
};

export type LaunchDate = {
	year: number;
	month: number;
	day: number;
};

export type LaunchTask = {
	id?: number;
	serviceId: number;
	completed: boolean;
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
	roadmap?: RoadmapItem[];
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

// Roadmap
export function createRoadmapItem(
	serviceName: string,
	item: Partial<RoadmapItem>,
): Promise<RoadmapItem> {
	return apiFetch(`/service/${serviceName}/roadmap`, {
		method: "POST",
		body: JSON.stringify(item),
	});
}

export function updateRoadmapItem(
	serviceName: string,
	itemId: number,
	item: Partial<RoadmapItem>,
): Promise<RoadmapItem> {
	return apiFetch(`/service/${serviceName}/roadmap/${itemId}`, {
		method: "PUT",
		body: JSON.stringify(item),
	});
}

export function deleteRoadmapItem(
	serviceName: string,
	itemId: number,
): Promise<void> {
	return apiFetch(`/service/${serviceName}/roadmap/${itemId}`, {
		method: "DELETE",
	});
}

// Launch Tasks
export function fetchLaunchTasks(serviceName: string): Promise<LaunchTask[]> {
	return apiFetch(`/service/${serviceName}/tasks`);
}

export function createLaunchTask(
	serviceName: string,
	task: Partial<LaunchTask>,
): Promise<LaunchTask> {
	return apiFetch(`/service/${serviceName}/tasks`, {
		method: "POST",
		body: JSON.stringify(task),
	});
}

export function updateLaunchTask(
	serviceName: string,
	taskId: number,
	task: Partial<LaunchTask>,
): Promise<LaunchTask> {
	return apiFetch(`/service/${serviceName}/tasks/${taskId}`, {
		method: "PUT",
		body: JSON.stringify(task),
	});
}

export function deleteLaunchTask(
	serviceName: string,
	taskId: number,
): Promise<void> {
	return apiFetch(`/service/${serviceName}/tasks/${taskId}`, {
		method: "DELETE",
	});
}
