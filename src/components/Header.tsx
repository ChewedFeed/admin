import { Link } from "@tanstack/react-router";

export default function Header() {
	return (
		<header className="sticky top-0 z-50 border-b border-(--color-border) bg-(--color-surface)/80 backdrop-blur-md">
			<div className="page-wrap flex h-14 items-center justify-between">
				<Link to="/" className="flex items-center gap-2 font-bold text-lg">
					ChewedFeed <span className="text-sm font-normal text-(--color-text-muted)">Admin</span>
				</Link>
				<nav className="flex items-center gap-6 text-sm">
					<Link
						to="/"
						className="text-(--color-text-muted) hover:text-(--color-text) transition-colors"
					>
						Projects
					</Link>
				</nav>
			</div>
		</header>
	);
}
