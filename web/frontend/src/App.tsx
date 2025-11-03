import React, { useState } from "react";
import "./App.css";
import Dashboard from "./pages/Dashboard";

function Logo() {
	return (
		<div className="logo">
			<svg
				width="24"
				height="24"
				viewBox="0 0 32 32"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
				className="logo-icon"
			>
				<path
					d="M16 4L6 20L16 16L26 20L16 4Z"
					stroke="#1a1a1a"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
					fill="none"
				/>
				<path
					d="M16 8L10 18L16 15L22 18L16 8Z"
					stroke="#1a1a1a"
					strokeWidth="1.5"
					strokeLinecap="round"
					strokeLinejoin="round"
					fill="none"
				/>
			</svg>
			<span className="logo-text">AD-ASTRA</span>
		</div>
	);
}

function RocketGraphic() {
	return (
		<div className="rocket-graphic">
			<svg
				width="360"
				height="320"
				viewBox="0 0 360 320"
				className="rocket-svg"
			>
				<defs>
					<linearGradient id="rocketBody" x1="0" y1="0" x2="0" y2="1">
						<stop offset="0%" stopColor="#34d399" />
						<stop offset="100%" stopColor="#16a34a" />
					</linearGradient>
					<linearGradient id="rocketWindow" x1="0" y1="0" x2="1" y2="1">
						<stop offset="0%" stopColor="#e0f2fe" />
						<stop offset="100%" stopColor="#bae6fd" />
					</linearGradient>
					<linearGradient id="flameGradient" x1="0" y1="0" x2="0" y2="1">
						<stop offset="0%" stopColor="#fbbf24" />
						<stop offset="100%" stopColor="#f97316" />
					</linearGradient>
				</defs>

				<path
					d="M40 235 Q 120 200, 178 138 Q 236 80, 302 64"
					stroke="#1a1a1a"
					strokeWidth="2"
					fill="none"
					strokeDasharray="8 8"
					opacity="0.25"
					className="trajectory"
				/>

				<g className="stars">
					<circle cx="134" cy="206" r="2.2" fill="#1a1a1a" opacity="0.4" className="star star-1" />
					<circle cx="206" cy="136" r="1.6" fill="#1a1a1a" opacity="0.45" className="star star-2" />
					<circle cx="254" cy="94" r="2" fill="#1a1a1a" opacity="0.35" className="star star-3" />
					<circle cx="296" cy="72" r="1.6" fill="#1a1a1a" opacity="0.4" className="star star-4" />
					<circle cx="102" cy="222" r="1.3" fill="#1a1a1a" opacity="0.3" className="star star-5" />
					<circle cx="230" cy="116" r="1.5" fill="#1a1a1a" opacity="0.4" className="star star-6" />
				</g>

				<g className="rocket" transform="translate(148, 86)">
					<ellipse cx="36" cy="196" rx="42" ry="12" fill="rgba(12, 12, 12, 0.08)" />
					<circle cx="36" cy="92" r="68" fill="rgba(34, 197, 94, 0.08)" opacity="0.35" />

					<path
						d="M36 0C22 28 12 72 12 116C12 160 22 204 36 232C50 204 60 160 60 116C60 72 50 28 36 0Z"
						fill="url(#rocketBody)"
					/>
					<path
						d="M36 0C29 20 24 56 24 116C24 176 29 212 36 232V0Z"
						fill="rgba(255, 255, 255, 0.12)"
					/>

					<circle cx="36" cy="94" r="14" fill="#f8fafc" opacity="0.95" />
					<circle cx="36" cy="94" r="9" fill="url(#rocketWindow)" />
					<circle cx="33" cy="91" r="2" fill="#38bdf8" opacity="0.4" />

					<path
						d="M16 140C-2 156 -2 198 16 222L24 204V140Z"
						fill="#16a34a"
					/>
					<path
						d="M56 140C74 156 74 198 56 222L48 204V140Z"
						fill="#16a34a"
					/>

					<rect x="26" y="204" width="20" height="20" rx="6" fill="#0f172a" opacity="0.85" />

					<g className="exhaust" transform="translate(36, 224)">
						<path d="M0 0C-6 18 -10 30 0 44C10 30 6 18 0 0Z" fill="url(#flameGradient)" />
						<path d="M0 6C-4 18 -6 26 0 36C6 26 4 18 0 6Z" fill="#f97316" opacity="0.6" />
						<path d="M0 10C-2 16 -3 22 0 28C3 22 2 16 0 10Z" fill="#fef08a" opacity="0.7" />
					</g>

					<circle cx="18" cy="60" r="3" fill="rgba(255, 255, 255, 0.6)" />
					<circle cx="52" cy="128" r="2" fill="rgba(255, 255, 255, 0.4)" />
				</g>

				<g className="moon" transform="translate(302, 54)">
					<circle cx="0" cy="0" r="18" fill="#f9fafb" stroke="#1a1a1a" strokeWidth="1.5" opacity="0.9" />
					<circle cx="-8" cy="0" r="18" fill="#ffffff" />
					<circle cx="0" cy="0" r="2" fill="#1a1a1a" opacity="0.6" />
				</g>
			</svg>
		</div>
	);
}

function ScrollIndicator() {
	return (
		<div className="scroll-indicator">
			<svg
				width="16"
				height="16"
				viewBox="0 0 16 16"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
			>
				<path
					d="M8 12L4 8M8 12L12 8"
					stroke="#1a1a1a"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
				/>
			</svg>
			<span>scroll</span>
		</div>
	);
}

export default function App() {
	const [currentPage, setCurrentPage] = useState<"landing" | "dashboard">("landing");

	if (currentPage === "dashboard") {
		return <Dashboard />;
	}

	return (
		<div className="app">
			<header className="header">
				<Logo />
				<nav className="nav">
					<a href="#about">About us</a>
					<a href="#features">Features</a>
					<div className="nav-dropdown">
						<a href="#company">
							Company
							<svg width="12" height="12" viewBox="0 0 12 12" fill="none">
								<path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
							</svg>
						</a>
					</div>
					<a href="#resources">Resources</a>
				</nav>
			</header>

			<main className="hero">
				<div className="hero-content">
					<div className="hero-copy">
						<span className="hero-kicker">Autonomous agent platform</span>
						<h1 className="hero-headline">
							create agent campaigns<br />
							<span className="hero-headline-indent">that soar</span>
						</h1>
						<p className="hero-subheadline">
							Launch and manage intelligent agent swarms that adapt copy, creative, and placements in real time.
						</p>

						<div className="hero-actions">
							<button className="btn-primary" onClick={() => setCurrentPage("dashboard")}>Get started</button>
							<a href="#features" className="btn-ghost">Watch demo</a>
						</div>

						<div className="hero-highlights">
							<div className="highlight-chip">
								<span className="chip-dot" />
								Evolution every 48 hours
							</div>
							<div className="highlight-chip">
								<span className="chip-dot" />
								Multi-channel orchestration
							</div>
							<div className="highlight-chip">
								<span className="chip-dot" />
								Bandit-powered optimization
							</div>
						</div>
					</div>

					<div className="hero-visual">
						<span className="hero-learn-label">Learn more</span>
						<div className="hero-visual-inner">
							<RocketGraphic />
							<div className="hero-card">
								<header className="hero-card__header">
									<span className="card-dot" />
									Live campaign pulse
								</header>
								<div className="hero-card__metric">
									<strong>+182%</strong>
									<span>Conversion lift vs. control</span>
								</div>
								<ul className="hero-card__list">
									<li>Adaptive copy & visuals</li>
									<li>Genetic agent evolution</li>
									<li>Convex-backed observability</li>
								</ul>
							</div>
						</div>
					</div>
				</div>
			</main>

			<ScrollIndicator />

			{/* What We Do Section */}
			<section className="what-we-do" id="features">
				<div className="container">
					<h2 className="section-title">What We Do</h2>
					<p className="section-subtitle">
						Transform your advertising with autonomous campaign agents that optimize for any audience
					</p>
					
					<div className="features-grid">
						<div className="feature-card">
							<div className="feature-icon">
								<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
									<path d="M12 2L2 7l10 5 10-5-10-5z" />
									<path d="M2 17l10 5 10-5" />
									<path d="M2 12l10 5 10-5" />
								</svg>
							</div>
							<h3>Dual Optimization</h3>
							<p>Create ads optimized for both human emotions and AI agent parsing. One campaign, two audiences.</p>
						</div>
						
						<div className="feature-card">
							<div className="feature-icon">
								<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
									<path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
									<polyline points="3.27 6.96 12 12.01 20.73 6.96" />
									<line x1="12" y1="22.08" x2="12" y2="12" />
								</svg>
							</div>
							<h3>Autonomous Agents</h3>
							<p>Deploy campaign agents that generate variants, monitor performance, and evolve until goals are met.</p>
						</div>
						
						<div className="feature-card">
							<div className="feature-icon">
								<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
									<polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
								</svg>
							</div>
							<h3>Real-time Learning</h3>
							<p>Multi-armed bandit algorithms continuously optimize creative selection based on actual conversion data.</p>
						</div>
						
						<div className="feature-card">
							<div className="feature-icon">
								<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
									<path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
									<circle cx="12" cy="12" r="4" />
								</svg>
							</div>
							<h3>Multi-Platform</h3>
							<p>Deploy across Google Ads, Meta, X, Reddit, and more. One system, all channels.</p>
						</div>
					</div>
				</div>
			</section>

			{/* How It Works */}
			<section className="how-it-works">
				<div className="container">
					<h2 className="section-title">How It Works</h2>
					<div className="steps">
						<div className="step">
							<div className="step-number">1</div>
							<h3>Set Your Goal</h3>
							<p>Define your objective: "50 conversions", revenue target, or engagement metrics. Our agent takes it from there.</p>
						</div>
						<div className="step">
							<div className="step-number">2</div>
							<h3>Generate Variants</h3>
							<p>Autonomous agents create optimized variants for human and AI audiences, with structured data and emotional hooks.</p>
						</div>
						<div className="step">
							<div className="step-number">3</div>
							<h3>Learn & Evolve</h3>
							<p>Real-time optimization learns what converts for each segment and automatically evolves creatives until goals are met.</p>
						</div>
					</div>
				</div>
			</section>
		</div>
	);
}
