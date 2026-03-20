import { describe, expect, test } from "vitest";
import { buttonVariants } from "#/components/ui/button";

describe("New project interactions", () => {
	test("buttons use pointer cursor by default", () => {
		expect(buttonVariants()).toContain("cursor-pointer");
		expect(buttonVariants()).toContain("disabled:cursor-not-allowed");
	});

	test("primary button keeps CTA styling", () => {
		expect(buttonVariants({ variant: "default" })).toContain("bg-primary");
	});
});
