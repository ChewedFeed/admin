import { Link, useNavigate } from "@tanstack/react-router";
import { isLoggedIn, logout } from "#/lib/auth";

export default function Header() {
	const navigate = useNavigate();
	const loggedIn = typeof window !== "undefined" && isLoggedIn();

	function handleLogout() {
		logout();
		navigate({ to: "/login" });
	}

	return (
		<header className="sticky top-0 z-50 border-b border-(--color-border) bg-(--color-surface)/80 backdrop-blur-md">
			<div className="page-wrap flex h-14 items-center justify-between">
				<Link to="/" className="flex items-center gap-2 font-bold text-lg">
					<img src="/logo.png" alt="ChewedFeed" className="h-7 w-7" />
					ChewedFeed{" "}
					<span className="text-sm font-normal text-(--color-text-muted)">
						Admin
					</span>
				</Link>
				<nav className="flex items-center gap-6 text-sm">
					{loggedIn ? (
						<>
							<Link
								to="/"
								className="text-(--color-text-muted) hover:text-(--color-text) transition-colors"
							>
								Projects
							</Link>
							<button
								type="button"
								onClick={handleLogout}
								className="text-(--color-text-muted) hover:text-(--color-text) transition-colors"
							>
								Logout
							</button>
						</>
					) : (
						<Link
							to="/login"
							className="text-(--color-text-muted) hover:text-(--color-text) transition-colors"
						>
							Login
						</Link>
					)}
				</nav>
			</div>
		</header>
	);
}
