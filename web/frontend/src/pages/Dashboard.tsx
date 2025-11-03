import React, { useState, useEffect } from "react";
import {
	Box,
	Container,
	AppBar,
	Toolbar,
	Typography,
	Button,
	IconButton,
	Paper,
	Grid,
	Chip,
	LinearProgress,
	Card,
	CardContent,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	TextField,
	Select,
	MenuItem,
	FormControl,
	InputLabel,
	Avatar,
	Tooltip,
	Badge,
	CircularProgress,
} from "@mui/material";
import RocketLaunchIcon from "@mui/icons-material/RocketLaunch";
import AddIcon from "@mui/icons-material/Add";
import NotificationsIcon from "@mui/icons-material/Notifications";
import SettingsIcon from "@mui/icons-material/Settings";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import PeopleIcon from "@mui/icons-material/People";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import DeploymentIcon from "@mui/icons-material/Rocket";
import AgentVisualization from "../components/AgentVisualization";
import CampaignChat from "../components/CampaignChat";
import CreativeGallery from "../components/CreativeGallery";
import CampaignAnalytics from "../components/CampaignAnalytics";
import PromptBox from "../components/PromptBox";
import { CampaignAPI, CreativeAPI } from "../services/api";

type Campaign = {
	id: string;
	name: string;
	goal: { type: string; target: number };
	status: "draft" | "running" | "paused" | "completed";
	conversions: number;
	spend: number;
	segments: string[];
	createdAt: number;
	agentsActive: number;
};

const statusColors = {
	draft: "#94a3b8",
	running: "#22c55e",
	paused: "#f59e0b",
	completed: "#3b82f6",
};

function DashboardHeader({ onNewCampaign }: { onNewCampaign: () => void }) {
	return (
		<AppBar
			position="sticky"
			elevation={0}
			sx={{
				background: "rgba(255, 255, 255, 0.85)",
				backdropFilter: "blur(20px) saturate(180%)",
				borderBottom: "1px solid rgba(26, 26, 26, 0.06)",
				color: "text.primary",
				transition: "all 0.3s ease",
				"&:hover": {
					background: "rgba(255, 255, 255, 0.95)",
				},
			}}
		>
			<Toolbar sx={{ justifyContent: "space-between", px: { xs: 3, md: 4 } }}>
				<Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
					<Box
						sx={{
							width: 36,
							height: 36,
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							background: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
							borderRadius: 2,
							transform: "rotate(45deg)",
						}}
					>
						<RocketLaunchIcon
							sx={{
								color: "white",
								fontSize: 20,
								transform: "rotate(-45deg)",
							}}
						/>
					</Box>
					<Typography
						variant="h6"
						sx={{
							fontWeight: 800,
							letterSpacing: "1px",
							background: "linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)",
							WebkitBackgroundClip: "text",
							WebkitTextFillColor: "transparent",
							backgroundClip: "text",
						}}
					>
						AD-ASTRA
					</Typography>
				</Box>

				<Box sx={{ display: "flex", gap: 1.5, alignItems: "center" }}>
					<Button
						variant="contained"
						startIcon={<AddIcon />}
						onClick={onNewCampaign}
						sx={{
							background: "linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)",
							borderRadius: 2,
							px: 3,
							py: 1.2,
							textTransform: "none",
							fontWeight: 600,
							fontSize: "14px",
							"&:hover": {
								background: "linear-gradient(135deg, #000000 0%, #0a0a0a 100%)",
								transform: "translateY(-2px)",
								boxShadow: "0 8px 24px rgba(0, 0, 0, 0.2)",
							},
						}}
					>
						New Campaign
					</Button>

					<IconButton
						sx={{
							bgcolor: "rgba(26, 26, 26, 0.05)",
							"&:hover": {
								bgcolor: "rgba(26, 26, 26, 0.1)",
								transform: "scale(1.05)",
							},
							transition: "all 0.2s ease",
						}}
					>
						<Badge badgeContent={3} color="error">
							<NotificationsIcon sx={{ color: "#1a1a1a" }} />
						</Badge>
					</IconButton>

					<IconButton
						sx={{
							bgcolor: "rgba(26, 26, 26, 0.05)",
							"&:hover": {
								bgcolor: "rgba(26, 26, 26, 0.1)",
								transform: "scale(1.05)",
							},
							transition: "all 0.2s ease",
						}}
					>
						<SettingsIcon sx={{ color: "#1a1a1a" }} />
					</IconButton>

					<Avatar
						sx={{
							bgcolor: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
							background: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
							width: 40,
							height: 40,
							cursor: "pointer",
							transition: "all 0.2s ease",
							"&:hover": {
								transform: "scale(1.1)",
								boxShadow: "0 4px 12px rgba(34, 197, 94, 0.3)",
							},
						}}
					>
						<Typography variant="caption" sx={{ fontWeight: 700, color: "white", fontSize: "16px" }}>
							U
						</Typography>
					</Avatar>
				</Box>
			</Toolbar>
		</AppBar>
	);
}

function StatsCard({
	title,
	value,
	change,
	icon,
}: {
	title: string;
	value: string;
	change: string;
	icon: React.ReactNode;
}) {
	return (
		<Paper
			elevation={0}
			sx={{
				p: 3.5,
				background: "rgba(255, 255, 255, 0.85)",
				backdropFilter: "blur(20px)",
				border: "1px solid rgba(26, 26, 26, 0.08)",
				borderRadius: 3,
				transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
				position: "relative",
				overflow: "hidden",
				"&::before": {
					content: '""',
					position: "absolute",
					top: 0,
					left: 0,
					right: 0,
					height: "3px",
					background: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
					transform: "scaleX(0)",
					transition: "transform 0.4s ease",
				},
				"&:hover": {
					transform: "translateY(-6px)",
					boxShadow: "0 12px 32px rgba(0, 0, 0, 0.12)",
					borderColor: "rgba(34, 197, 94, 0.2)",
					"&::before": {
						transform: "scaleX(1)",
					},
				},
			}}
		>
			<Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", mb: 2 }}>
				<Box>
					<Typography
						variant="caption"
						color="text.secondary"
						sx={{
							textTransform: "uppercase",
							fontWeight: 700,
							letterSpacing: "0.1em",
							fontSize: "11px",
						}}
					>
						{title}
					</Typography>
					<Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5, letterSpacing: "-0.02em" }}>
						{value}
					</Typography>
				</Box>
				<Avatar
					sx={{
						bgcolor: "rgba(34, 197, 94, 0.1)",
						color: "#22c55e",
						width: 48,
						height: 48,
						transition: "all 0.3s ease",
					}}
				>
					{icon}
				</Avatar>
			</Box>
			<Chip
				label={change}
				size="small"
				icon={<TrendingUpIcon sx={{ fontSize: 14, color: "#22c55e" }} />}
				sx={{
					bgcolor: "rgba(34, 197, 94, 0.1)",
					color: "#16a34a",
					fontWeight: 700,
					fontSize: "11px",
					height: "24px",
					"& .MuiChip-icon": {
						color: "#22c55e",
					},
				}}
			/>
		</Paper>
	);
}

function CampaignCard({
	campaign,
	onDeploy,
	onPause,
	onResume
}: {
	campaign: Campaign;
	onDeploy: (id: string) => void;
	onPause: (id: string) => void;
	onResume: (id: string) => void;
}) {
	const progress = (campaign.conversions / campaign.goal.target) * 100;

	const handleToggle = () => {
		if (campaign.status === "running") {
			onPause(campaign.id);
		} else if (campaign.status === "paused") {
			onResume(campaign.id);
		}
	};

	return (
		<Card
			elevation={0}
			sx={{
				background: "rgba(255, 255, 255, 0.85)",
				backdropFilter: "blur(20px)",
				border: "1px solid rgba(26, 26, 26, 0.08)",
				borderRadius: 3,
				transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
				position: "relative",
				overflow: "hidden",
				"&::before": {
					content: '""',
					position: "absolute",
					top: 0,
					left: 0,
					right: 0,
					height: "3px",
					background: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
					transform: "scaleX(0)",
					transition: "transform 0.4s ease",
				},
				"&:hover": {
					transform: "translateY(-6px)",
					boxShadow: "0 12px 32px rgba(0, 0, 0, 0.12)",
					borderColor: "rgba(34, 197, 94, 0.2)",
					"&::before": {
						transform: "scaleX(1)",
					},
				},
			}}
		>
			<CardContent>
				<Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", mb: 2 }}>
					<Box>
						<Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
							{campaign.name}
						</Typography>
						<Chip
							label={campaign.status}
							size="small"
							sx={{
								bgcolor: statusColors[campaign.status],
								color: "white",
								fontWeight: 600,
								fontSize: "11px",
								textTransform: "capitalize",
							}}
						/>
					</Box>
					<Box sx={{ display: "flex", gap: 1 }}>
						<Tooltip title={campaign.status === "running" ? "Pause" : "Resume"}>
							<IconButton
								size="small"
								onClick={handleToggle}
								disabled={campaign.status === "draft"}
								sx={{
									bgcolor: campaign.status === "running" ? "rgba(245, 158, 11, 0.2)" : "rgba(26, 26, 26, 0.1)",
									color: "#1a1a1a",
									"&:hover": {
										bgcolor: campaign.status === "running" ? "rgba(245, 158, 11, 0.3)" : "rgba(26, 26, 26, 0.2)",
									},
								}}
							>
								{campaign.status === "running" ? <PauseIcon sx={{ fontSize: 18 }} /> : <PlayArrowIcon sx={{ fontSize: 18 }} />}
							</IconButton>
						</Tooltip>
					</Box>
				</Box>

				<Grid container spacing={2} sx={{ mb: 2 }}>
					<Grid item xs={6}>
						<Typography variant="caption" color="text.secondary" display="block">
							Conversions
						</Typography>
						<Typography variant="h6" sx={{ fontWeight: 700 }}>
							{campaign.conversions} / {campaign.goal.target}
						</Typography>
					</Grid>
					<Grid item xs={6}>
						<Typography variant="caption" color="text.secondary" display="block">
							Spend
						</Typography>
						<Typography variant="h6" sx={{ fontWeight: 700, color: "secondary.main" }}>
							${campaign.spend.toFixed(2)}
						</Typography>
					</Grid>
				</Grid>

				<Box sx={{ mb: 2 }}>
					<Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
						<Typography variant="caption" color="text.secondary">
							Progress to Goal
						</Typography>
						<Typography variant="caption" sx={{ fontWeight: 600 }}>
							{Math.round(progress)}%
						</Typography>
					</Box>
					<LinearProgress
						variant="determinate"
						value={Math.min(progress, 100)}
						sx={{
							height: 8,
							borderRadius: 1,
							bgcolor: "rgba(0, 0, 0, 0.05)",
							"& .MuiLinearProgress-bar": {
								bgcolor: "#1a1a1a",
								borderRadius: 1,
							},
						}}
					/>
				</Box>

				<Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1 }}>
					<Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
						{campaign.segments.map((seg) => (
							<Chip key={seg} label={seg} size="small" sx={{ fontSize: "10px", height: 20 }} />
						))}
					</Box>
					<Chip
						icon={<SmartToyIcon sx={{ fontSize: 14 }} />}
						label={`${campaign.agentsActive} agents`}
						size="small"
						sx={{
							bgcolor: "rgba(26, 26, 26, 0.1)",
							color: "#1a1a1a",
							fontSize: "11px",
							fontWeight: 600,
						}}
					/>
				</Box>

				<Button
					fullWidth
					variant="contained"
					startIcon={<DeploymentIcon />}
					onClick={() => onDeploy(campaign.id)}
					disabled={campaign.status === "running"}
					sx={{
						mt: 2,
						background: campaign.status === "running"
							? "grey.300"
							: "linear-gradient(135deg, #1a1a1a 0%, #404040 100%)",
						color: "white",
						borderRadius: 2,
						textTransform: "none",
						fontWeight: 600,
						"&:hover": {
							background: "linear-gradient(135deg, #000000 0%, #1a1a1a 100%)",
						},
						"&:disabled": {
							background: "grey.300",
							color: "grey.600",
						},
					}}
				>
					{campaign.status === "running" ? "Deployed" : "Deploy Campaign"}
				</Button>
			</CardContent>
		</Card>
	);
}

function CreateCampaignDialog({ open, onClose, onCreate }: { open: boolean; onClose: () => void; onCreate: (data: any) => void }) {
	const [name, setName] = useState("");
	const [goalTarget, setGoalTarget] = useState(50);
	const [segments, setSegments] = useState<string[]>(["human"]);

	const handleCreate = () => {
		onCreate({
			name,
			goal: { type: "conversions", target: goalTarget },
			segments,
		});
		setName("");
		setGoalTarget(50);
		setSegments(["human"]);
		onClose();
	};

	return (
		<Dialog
			open={open}
			onClose={onClose}
			maxWidth="sm"
			fullWidth
			PaperProps={{
				sx: {
					background: "rgba(255, 255, 255, 0.95)",
					backdropFilter: "blur(20px)",
					borderRadius: 3,
				},
			}}
		>
			<DialogTitle sx={{ fontWeight: 700 }}>Create New Campaign</DialogTitle>
			<DialogContent>
				<Box sx={{ display: "flex", flexDirection: "column", gap: 3, pt: 2 }}>
					<TextField
						fullWidth
						label="Campaign Name"
						placeholder="e.g., Q1 Product Launch"
						value={name}
						onChange={(e) => setName(e.target.value)}
						variant="outlined"
					/>

					<TextField
						fullWidth
						type="number"
						label="Goal (Conversions)"
						value={goalTarget}
						onChange={(e) => setGoalTarget(Number(e.target.value))}
						variant="outlined"
					/>

					<FormControl fullWidth>
						<InputLabel>Target Segments</InputLabel>
						<Select
							multiple
							value={segments}
							onChange={(e) => setSegments(e.target.value as string[])}
							renderValue={(selected) => (
								<Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
									{selected.map((value) => (
										<Chip key={value} label={value} size="small" />
									))}
								</Box>
							)}
						>
							<MenuItem value="human">Human</MenuItem>
							<MenuItem value="agent">AI Agent</MenuItem>
						</Select>
					</FormControl>
				</Box>
			</DialogContent>
			<DialogActions sx={{ p: 3, pt: 0 }}>
				<Button onClick={onClose} sx={{ textTransform: "none" }}>
					Cancel
				</Button>
				<Button
					onClick={handleCreate}
					variant="contained"
					disabled={!name || segments.length === 0}
					sx={{
						background: "linear-gradient(135deg, #1a1a1a 0%, #404040 100%)",
						textTransform: "none",
						fontWeight: 600,
					}}
				>
					Create Campaign
				</Button>
			</DialogActions>
		</Dialog>
	);
}

export default function Dashboard() {
	const [showCreateModal, setShowCreateModal] = useState(false);
	const [campaigns, setCampaigns] = useState<Campaign[]>([]);
	const [loading, setLoading] = useState(true);

	// Load campaigns from backend on mount
	useEffect(() => {
		const loadCampaigns = async () => {
			try {
				setLoading(true);
				const data = await CampaignAPI.list();
				setCampaigns(data);
			} catch (error) {
				console.error("Failed to load campaigns:", error);
			} finally {
				setLoading(false);
			}
		};

		loadCampaigns();
	}, []);

	const handleCreateCampaign = async (data: any) => {
		try {
			// Create campaign on backend
			const newCampaign = await CampaignAPI.create(data);
			setCampaigns((prev) => [newCampaign, ...prev]);
		} catch (error) {
			console.error("Failed to create campaign:", error);
			alert("Failed to create campaign. Please ensure backend services are running.");
		}
	};

	const handleDeploy = async (campaignId: string) => {
		try {
			// Update UI optimistically
			setCampaigns((prev) =>
				prev.map((c) =>
					c.id === campaignId ? { ...c, status: "running" as const, agentsActive: 3 } : c
				)
			);

			// Deploy to backend
			const result = await CampaignAPI.deploy(campaignId);
			console.log("Campaign deployed successfully:", result);
		} catch (error) {
			console.error("Failed to deploy campaign:", error);
			// Revert on error
			setCampaigns((prev) =>
				prev.map((c) =>
					c.id === campaignId ? { ...c, status: "draft" as const, agentsActive: 0 } : c
				)
			);
			alert("Failed to deploy campaign. Please ensure backend services are running.");
		}
	};

	const handlePause = async (campaignId: string) => {
		try {
			setCampaigns((prev) =>
				prev.map((c) =>
					c.id === campaignId ? { ...c, status: "paused" as const } : c
				)
			);

			await CampaignAPI.pause(campaignId);
			console.log("Campaign paused successfully");
		} catch (error) {
			console.error("Failed to pause campaign:", error);
			setCampaigns((prev) =>
				prev.map((c) =>
					c.id === campaignId ? { ...c, status: "running" as const } : c
				)
			);
			alert("Failed to pause campaign. Please ensure backend services are running.");
		}
	};

	const handleResume = async (campaignId: string) => {
		try {
			setCampaigns((prev) =>
				prev.map((c) =>
					c.id === campaignId ? { ...c, status: "running" as const } : c
				)
			);

			await CampaignAPI.resume(campaignId);
			console.log("Campaign resumed successfully");
		} catch (error) {
			console.error("Failed to resume campaign:", error);
			setCampaigns((prev) =>
				prev.map((c) =>
					c.id === campaignId ? { ...c, status: "paused" as const } : c
				)
			);
			alert("Failed to resume campaign. Please ensure backend services are running.");
		}
	};

	const totalSpend = campaigns.reduce((sum, c) => sum + c.spend, 0);
	const totalConversions = campaigns.reduce((sum, c) => sum + c.conversions, 0);
	const activeAgents = campaigns.reduce((sum, c) => sum + c.agentsActive, 0);

	return (
		<Box
			sx={{
				minHeight: "100vh",
				background: "linear-gradient(135deg, #fafafa 0%, #ffffff 30%, #f0fdf4 100%)",
				position: "relative",
				overflowX: "hidden",
			}}
		>
			<DashboardHeader onNewCampaign={() => setShowCreateModal(true)} />

			<Container maxWidth="xl" sx={{ py: 5 }}>
				{/* Stats Overview */}
				<Grid container spacing={3} sx={{ mb: 4 }}>
					<Grid item xs={12} sm={6} md={3}>
						<StatsCard
							title="Total Spend"
							value={`$${totalSpend.toFixed(2)}`}
							change="+12.5%"
							icon={<AttachMoneyIcon />}
						/>
					</Grid>
					<Grid item xs={12} sm={6} md={3}>
						<StatsCard
							title="Conversions"
							value={totalConversions.toString()}
							change="+8.2%"
							icon={<TrendingUpIcon />}
						/>
					</Grid>
					<Grid item xs={12} sm={6} md={3}>
						<StatsCard
							title="Active Campaigns"
							value={campaigns.filter((c) => c.status === "running").length.toString()}
							change="+2"
							icon={<RocketLaunchIcon />}
						/>
					</Grid>
					<Grid item xs={12} sm={6} md={3}>
						<StatsCard
							title="Active Agents"
							value={activeAgents.toString()}
							change="+3"
							icon={<SmartToyIcon />}
						/>
					</Grid>
				</Grid>

				{/* Agent Visualization */}
				<Box sx={{ mb: 4 }}>
					<AgentVisualization />
				</Box>

				{/* AI-Generated Creatives Gallery */}
				<Box sx={{ mb: 4 }}>
					<CreativeGallery />
				</Box>

				{/* Campaign Analytics */}
				<Box sx={{ mb: 4 }}>
					<CampaignAnalytics />
				</Box>

				{/* Campaigns */}
				<Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
					Your Campaigns
				</Typography>
				<Grid container spacing={3}>
					{loading ? (
						<Grid item xs={12}>
							<Paper sx={{ p: 4, textAlign: "center", background: "rgba(255, 255, 255, 0.7)", backdropFilter: "blur(20px)" }}>
								<CircularProgress sx={{ color: "#1a1a1a" }} />
								<Typography sx={{ mt: 2 }}>Loading campaigns...</Typography>
							</Paper>
						</Grid>
					) : campaigns.length === 0 ? (
						<Grid item xs={12}>
							<Paper sx={{ p: 4, textAlign: "center", background: "rgba(255, 255, 255, 0.7)", backdropFilter: "blur(20px)" }}>
								<Typography variant="h6" sx={{ mb: 1 }}>No campaigns yet</Typography>
								<Typography color="text.secondary">Create your first campaign to get started</Typography>
							</Paper>
						</Grid>
					) : (
						campaigns.map((campaign) => (
							<Grid item xs={12} md={6} lg={4} key={campaign.id}>
								<CampaignCard
									campaign={campaign}
									onDeploy={handleDeploy}
									onPause={handlePause}
									onResume={handleResume}
								/>
							</Grid>
						))
					)}
				</Grid>

				<Box sx={{ mt: 6 }}>
					<PromptBox
						onGenerate={async (prompt, style, ratio) => {
							try {
								console.log("Generating creative:", { prompt, style, ratio });
								const creative = await CreativeAPI.generate({
									campaignId: campaigns[0]?.id || "demo",
									type: "image",
									prompt: prompt,
									segment: "human"
								});
								console.log("Generated creative:", creative);
								alert(`Image generated successfully! Check browser console for URL`);
							} catch (error) {
								console.error("Failed to generate creative:", error);
								alert("Failed to generate image. Make sure backend is running on port 8001.");
							}
						}}
					/>
				</Box>
			</Container>

			{/* Chat Interface */}
			<CampaignChat />

			{/* Create Campaign Dialog */}
			<CreateCampaignDialog
				open={showCreateModal}
				onClose={() => setShowCreateModal(false)}
				onCreate={handleCreateCampaign}
			/>
			</Box>
		);
	}
