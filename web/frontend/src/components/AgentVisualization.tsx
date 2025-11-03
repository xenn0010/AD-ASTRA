import React, { useState, useEffect } from "react";
import {
	Box,
	Paper,
	Typography,
	Chip,
	LinearProgress,
	Grid,
	Avatar,
	Tooltip,
	CircularProgress,
} from "@mui/material";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import AutorenewIcon from "@mui/icons-material/Autorenew";
import ErrorIcon from "@mui/icons-material/Error";
import { AgentAPI } from "../services/api";

type AgentStatus = "initializing" | "generating" | "testing" | "optimizing" | "active" | "error";

type Agent = {
	id: string;
	type: "creative" | "optimizer" | "analyst";
	status: AgentStatus;
	progress: number;
	createdAt: number;
	tasksCompleted: number;
	performance: number;
};

const agentTypeLabels = {
	creative: "Creative Generator",
	optimizer: "Performance Optimizer",
	analyst: "Data Analyst",
};

const statusColors: Record<AgentStatus, string> = {
	initializing: "#94a3b8",
	generating: "#3b82f6",
	testing: "#8b5cf6",
	optimizing: "#f59e0b",
	active: "#22c55e",
	error: "#ef4444",
};

const statusIcons: Record<AgentStatus, React.ReactNode> = {
	initializing: <AutorenewIcon sx={{ fontSize: 16, animation: "spin 2s linear infinite" }} />,
	generating: <AutorenewIcon sx={{ fontSize: 16, animation: "spin 1.5s linear infinite" }} />,
	testing: <AutorenewIcon sx={{ fontSize: 16, animation: "spin 1.5s linear infinite" }} />,
	optimizing: <AutorenewIcon sx={{ fontSize: 16, animation: "spin 1.5s linear infinite" }} />,
	active: <CheckCircleIcon sx={{ fontSize: 16 }} />,
	error: <ErrorIcon sx={{ fontSize: 16 }} />,
};

function AgentCard({ agent }: { agent: Agent }) {
	return (
		<Paper
			elevation={0}
			sx={{
				p: 2,
				background: "rgba(255, 255, 255, 0.7)",
				backdropFilter: "blur(10px)",
				border: "1px solid rgba(255, 255, 255, 0.3)",
				borderRadius: 2,
				transition: "all 0.3s",
				"&:hover": {
					transform: "translateY(-4px)",
					boxShadow: "0 8px 24px rgba(0, 0, 0, 0.12)",
				},
			}}
		>
			<Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5, mb: 2 }}>
				<Avatar
					sx={{
						bgcolor: statusColors[agent.status],
						width: 40,
						height: 40,
					}}
				>
					<SmartToyIcon sx={{ fontSize: 20 }} />
				</Avatar>
				<Box sx={{ flex: 1 }}>
					<Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
						{agentTypeLabels[agent.type]}
					</Typography>
					<Chip
						label={agent.status}
						size="small"
						icon={statusIcons[agent.status] as any}
						sx={{
							mt: 0.5,
							bgcolor: statusColors[agent.status],
							color: "white",
							fontSize: "11px",
							height: 20,
						}}
					/>
				</Box>
			</Box>

			{agent.status !== "active" && agent.status !== "error" && (
				<Box sx={{ mb: 2 }}>
					<Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
						<Typography variant="caption" color="text.secondary">
							Progress
						</Typography>
						<Typography variant="caption" sx={{ fontWeight: 600 }}>
							{agent.progress}%
						</Typography>
					</Box>
					<LinearProgress
						variant="determinate"
						value={agent.progress}
						sx={{
							height: 6,
							borderRadius: 1,
							bgcolor: "rgba(0, 0, 0, 0.05)",
							"& .MuiLinearProgress-bar": {
								bgcolor: statusColors[agent.status],
							},
						}}
					/>
				</Box>
			)}

			<Grid container spacing={1}>
				<Grid item xs={6}>
					<Typography variant="caption" color="text.secondary" display="block">
						Tasks
					</Typography>
					<Typography variant="body2" sx={{ fontWeight: 600 }}>
						{agent.tasksCompleted}
					</Typography>
				</Grid>
				<Grid item xs={6}>
					<Typography variant="caption" color="text.secondary" display="block">
						Performance
					</Typography>
					<Typography variant="body2" sx={{ fontWeight: 600, color: "#1a1a1a" }}>
						{agent.performance}%
					</Typography>
				</Grid>
			</Grid>
		</Paper>
	);
}

export default function AgentVisualization({ campaignId }: { campaignId?: string }) {
	const [agents, setAgents] = useState<Agent[]>([]);
	const [loading, setLoading] = useState(true);

	// Load agents from backend
	useEffect(() => {
		const loadAgents = async () => {
			try {
				setLoading(true);
				const data = await AgentAPI.list(campaignId);
				setAgents(data);
			} catch (error) {
				console.error("Failed to load agents:", error);
			} finally {
				setLoading(false);
			}
		};

		loadAgents();

		// Poll for updates every 5 seconds
		const interval = setInterval(loadAgents, 5000);

		return () => clearInterval(interval);
	}, [campaignId]);

	return (
		<Paper
			elevation={0}
			sx={{
				p: 3,
				background: "rgba(255, 255, 255, 0.6)",
				backdropFilter: "blur(20px)",
				border: "1px solid rgba(255, 255, 255, 0.3)",
				borderRadius: 3,
			}}
		>
			<Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 3 }}>
				<Box>
					<Typography variant="h6" sx={{ fontWeight: 700 }}>
						Active Agents
					</Typography>
					<Typography variant="caption" color="text.secondary">
						{agents.filter((a) => a.status === "active").length} of {agents.length} agents running
					</Typography>
				</Box>
				<Chip
					label={`${agents.length} Total`}
					size="small"
					sx={{ bgcolor: "#1a1a1a", color: "white" }}
				/>
			</Box>

			{loading ? (
				<Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
					<CircularProgress sx={{ color: "#1a1a1a" }} />
				</Box>
			) : agents.length === 0 ? (
				<Box sx={{ textAlign: "center", py: 4 }}>
					<Typography color="text.secondary">No agents currently active</Typography>
				</Box>
			) : (
				<Grid container spacing={2}>
					{agents.map((agent) => (
						<Grid item xs={12} sm={6} md={4} key={agent.id}>
							<AgentCard agent={agent} />
						</Grid>
					))}
				</Grid>
			)}

			<style>
				{`
					@keyframes spin {
						from {
							transform: rotate(0deg);
						}
						to {
							transform: rotate(360deg);
						}
					}
				`}
			</style>
		</Paper>
	);
}
