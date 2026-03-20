import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
	server: {
		SERVER_URL: z.string().url().optional(),
		CMS_API_URL: z.string().url().optional(),
	},

	clientPrefix: "VITE_",

	client: {
		VITE_APP_TITLE: z.string().min(1).optional(),
		VITE_CMS_API_URL: z.string().url().optional(),
		VITE_FLAGS_PROJECT_ID: z.string().optional(),
		VITE_FLAGS_AGENT_ID: z.string().optional(),
		VITE_FLAGS_ENVIRONMENT_ID: z.string().optional(),
	},

	runtimeEnv: import.meta.env,
	emptyStringAsUndefined: true,
});
