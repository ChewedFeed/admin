const CMS_API_URL =
	typeof window !== "undefined"
		? (import.meta.env.VITE_CMS_API_URL ?? "https://cms.chewedfeed.com")
		: (process.env.CMS_API_URL ?? "https://cms.chewedfeed.com");

const TOKEN_KEY = "chewedfeed_admin_token";

export type Session = {
	token: string;
	expiresAt: string;
};

export async function login(
	username: string,
	password: string,
): Promise<Session> {
	const res = await fetch(`${CMS_API_URL}/auth/login`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ username, password }),
	});

	if (!res.ok) {
		throw new Error("Invalid credentials");
	}

	const session: Session = await res.json();
	if (typeof window !== "undefined") {
		localStorage.setItem(TOKEN_KEY, session.token);
	}
	return session;
}

export function getToken(): string | null {
	if (typeof window === "undefined") return null;
	return localStorage.getItem(TOKEN_KEY);
}

export function logout(): void {
	if (typeof window !== "undefined") {
		localStorage.removeItem(TOKEN_KEY);
	}
}

export function isLoggedIn(): boolean {
	return getToken() !== null;
}
