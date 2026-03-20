import { FlagsProvider } from "@flags-gg/react-library";
import { createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import { error as logError } from "bugfixes";
import { useEffect } from "react";
import Header from "../components/Header";

import appCss from "../styles.css?url";

function RouteErrorComponent({ error: err }: { error: unknown }) {
	useEffect(() => {
		logError("unhandled route error", err);
	}, [err]);
	return <div className="p-8 text-center text-(--color-danger)">Something went wrong</div>;
}

export const Route = createRootRoute({
	errorComponent: RouteErrorComponent,
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{ name: "viewport", content: "width=device-width, initial-scale=1" },
			{ title: "ChewedFeed Admin" },
		],
		links: [
			{ rel: "stylesheet", href: appCss },
		],
	}),
	shellComponent: RootDocument,
});

function RootDocument({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en">
			<head>
				<HeadContent />
			</head>
			<body className="font-sans antialiased">
				<FlagsProvider
					options={{
						projectId: import.meta.env.VITE_FLAGS_PROJECT_ID,
						agentId: import.meta.env.VITE_FLAGS_AGENT_ID,
						environmentId: import.meta.env.VITE_FLAGS_ENVIRONMENT_ID,
					}}
				>
					<Header />
					<main className="min-h-screen">{children}</main>
				</FlagsProvider>
				<Scripts />
			</body>
		</html>
	);
}
