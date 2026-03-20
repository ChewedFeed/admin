import { join } from "node:path";
import { statSync, readFileSync } from "node:fs";
import { error, info, loadConfigFromEnv, setDefaultConfig } from "bugfixes";

type ServerAppModule = {
	default: {
		fetch(request: Request): Response | Promise<Response>;
	};
};

declare const Bun: {
	serve(options: {
		port: number;
		fetch(request: Request): Response | Promise<Response>;
	}): unknown;
};

const port = Number(process.env.PORT || 8080);
const clientDir = join(import.meta.dirname, "dist", "client");
const serverEntryUrl = new URL("./dist/server/server.js", import.meta.url).href;
const bugfixesConfig = loadConfigFromEnv();

setDefaultConfig(bugfixesConfig);

function formatErrorDetails(input: unknown): string {
	if (input instanceof Error) {
		return input.stack ?? input.message;
	}

	if (typeof input === "string") return input;

	try {
		return JSON.stringify(input);
	} catch {
		return String(input);
	}
}

function reportServerError(context: string, input: unknown): Error {
	const details = formatErrorDetails(input);

	return error(`${context}\n${details}`);
}

function getBugfixesMode() {
	if (bugfixesConfig.localOnly) return "local-only";
	if (bugfixesConfig.agentKey && bugfixesConfig.agentSecret) return "remote";
	return "disabled";
}

let app: ServerAppModule;

try {
	app = (await import(serverEntryUrl)) as ServerAppModule;
} catch (input) {
	throw reportServerError("Failed to load the SSR bundle", input);
}

const mimeTypes: Record<string, string> = {
	".html": "text/html",
	".js": "application/javascript",
	".css": "text/css",
	".json": "application/json",
	".png": "image/png",
	".jpg": "image/jpeg",
	".jpeg": "image/jpeg",
	".gif": "image/gif",
	".svg": "image/svg+xml",
	".ico": "image/x-icon",
	".woff": "font/woff",
	".woff2": "font/woff2",
	".ttf": "font/ttf",
	".otf": "font/otf",
	".webp": "image/webp",
	".avif": "image/avif",
	".map": "application/json",
};

function getMimeType(path: string): string {
	const ext = path.substring(path.lastIndexOf("."));
	return mimeTypes[ext] || "application/octet-stream";
}

function tryServeStatic(pathname: string): Response | null {
	try {
		const filePath = join(clientDir, pathname);
		if (!filePath.startsWith(clientDir)) return null;
		const stat = statSync(filePath);
		if (stat.isFile()) {
			const content = readFileSync(filePath);
			const isAsset = pathname.startsWith("/assets/");
			return new Response(content, {
				headers: {
					"Content-Type": getMimeType(filePath),
					...(isAsset
						? { "Cache-Control": "public, max-age=31536000, immutable" }
						: {}),
				},
			});
		}
	} catch {
		// File doesn't exist, fall through
	}
	return null;
}

Bun.serve({
	port,
	async fetch(request) {
		const url = new URL(request.url);
		try {
			const staticResponse = tryServeStatic(url.pathname);
			if (staticResponse) return staticResponse;

			return await app.default.fetch(request);
		} catch (input) {
			reportServerError(
				`Unhandled request failure for ${request.method} ${url.pathname}`,
				input,
			);

			return new Response("Internal Server Error", { status: 500 });
		}
	},
});

info(
	`Server running on http://localhost:${port} (bugfixes mode: ${getBugfixesMode()})`,
);
