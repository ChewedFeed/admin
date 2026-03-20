import { describe, expect, test } from "vitest";
import type { Milestone, Project, ProjectLink } from "./api";

describe("Admin API types", () => {
	test("Project with all fields", () => {
		const project: Project = {
			id: 1,
			name: "Flags.gg",
			searchName: "flags-gg",
			description: "Feature flags",
			url: "https://flags.gg",
			launchDate: { year: 2025, month: 6, day: 15 },
			progress: 85,
			progress2: 87.5,
			icon: "solid fa-flag",
			fullDesc: "Full description",
			uptime: "flags",
			launched: true,
			links: [
				{ id: 1, type: "main", url: "https://flags.gg", label: "Flags.gg" },
				{ id: 2, type: "dashboard", url: "https://dashboard.flags.gg" },
				{ id: 3, type: "docs", url: "https://docs.flags.gg" },
			],
			milestones: [
				{
					id: 1,
					title: "Alpha",
					category: "feature",
					status: "completed",
					sortOrder: 0,
				},
				{
					id: 2,
					title: "Beta",
					category: "release",
					status: "planned",
					sortOrder: 1,
				},
			],
		};

		expect(project.id).toBe(1);
		expect(project.links).toHaveLength(3);
		expect(project.milestones).toHaveLength(2);
	});

	test("ProjectLink optional id for new links", () => {
		const newLink: ProjectLink = {
			type: "docs",
			url: "https://docs.example.com",
		};
		expect(newLink.id).toBeUndefined();

		const existingLink: ProjectLink = {
			id: 5,
			type: "main",
			url: "https://example.com",
			label: "Example",
		};
		expect(existingLink.id).toBe(5);
	});

	test("Milestone optional dates", () => {
		const item: Milestone = {
			title: "Launch",
			category: "release",
			status: "planned",
			sortOrder: 0,
		};
		expect(item.targetDate).toBeUndefined();
		expect(item.completedDate).toBeUndefined();
	});
});
