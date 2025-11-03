import React, { useState, useEffect } from "react";
import {
	Box,
	Paper,
	Typography,
	Grid,
	Card,
	CardMedia,
	CardContent,
	Chip,
	IconButton,
	Dialog,
	DialogContent,
	DialogTitle,
	DialogActions,
	Tabs,
	Tab,
	LinearProgress,
	Tooltip,
	TextField,
	Button,
	CircularProgress,
	ToggleButtonGroup,
	ToggleButton,
} from "@mui/material";
import ImageIcon from "@mui/icons-material/Image";
import VideoLibraryIcon from "@mui/icons-material/VideoLibrary";
import CloseIcon from "@mui/icons-material/Close";
import DownloadIcon from "@mui/icons-material/Download";
import VisibilityIcon from "@mui/icons-material/Visibility";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import AddIcon from "@mui/icons-material/Add";
import { CreativeAPI } from "../services/api";

type Creative = {
	id: string;
	type: "image" | "video";
	url: string;
	thumbnail?: string;
	title: string;
	variant: string;
	status: "generating" | "ready" | "deployed";
	performance?: {
		views: number;
		clicks: number;
		ctr: number;
	};
	generatedBy: string;
	createdAt: number;
	segment: "human" | "agent";
};

function CreativeCard({ creative, onClick }: { creative: Creative; onClick: () => void }) {
	const statusColors = {
		generating: "#f59e0b",
		ready: "#3b82f6",
		deployed: "#1a1a1a",
	};

	return (
		<Card
			elevation={0}
			sx={{
				background: "rgba(255, 255, 255, 0.7)",
				backdropFilter: "blur(10px)",
				border: "1px solid rgba(255, 255, 255, 0.3)",
				borderRadius: 2,
				transition: "all 0.3s",
				cursor: "pointer",
				"&:hover": {
					transform: "translateY(-4px)",
					boxShadow: "0 8px 24px rgba(0, 0, 0, 0.12)",
				},
			}}
			onClick={onClick}
		>
			<Box sx={{ position: "relative" }}>
				<CardMedia
					component="img"
					height="200"
					image={creative.thumbnail || creative.url}
					alt={creative.title}
					sx={{ objectFit: "cover" }}
				/>
				{creative.status === "generating" && (
					<Box
						sx={{
							position: "absolute",
							top: 0,
							left: 0,
							right: 0,
							bottom: 0,
							bgcolor: "rgba(0, 0, 0, 0.5)",
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							flexDirection: "column",
							gap: 2,
						}}
					>
						<AutoAwesomeIcon sx={{ fontSize: 40, color: "white", animation: "pulse 2s ease-in-out infinite" }} />
						<Typography variant="body2" sx={{ color: "white", fontWeight: 600 }}>
							Generating...
						</Typography>
						<LinearProgress
							sx={{
								width: "80%",
								bgcolor: "rgba(255, 255, 255, 0.2)",
								"& .MuiLinearProgress-bar": {
									bgcolor: "white",
								},
							}}
						/>
					</Box>
				)}
				<Box
					sx={{
						position: "absolute",
						top: 8,
						right: 8,
						display: "flex",
						gap: 0.5,
					}}
				>
					{creative.type === "video" && (
						<Chip
							icon={<VideoLibraryIcon sx={{ fontSize: 14 }} />}
							label="Video"
							size="small"
							sx={{
								bgcolor: "rgba(0, 0, 0, 0.7)",
								color: "white",
								fontSize: "11px",
								backdropFilter: "blur(10px)",
							}}
						/>
					)}
				</Box>
			</Box>

			<CardContent>
				<Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", mb: 1 }}>
					<Typography variant="subtitle2" sx={{ fontWeight: 600, flex: 1 }}>
						{creative.title}
					</Typography>
					<Chip
						label={creative.status}
						size="small"
						sx={{
							bgcolor: statusColors[creative.status],
							color: "white",
							fontSize: "10px",
							height: 20,
							textTransform: "capitalize",
						}}
					/>
				</Box>

				<Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
					{creative.variant}
				</Typography>

				<Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
					<Chip label={creative.segment} size="small" sx={{ fontSize: "10px", height: 18 }} />
					<Typography variant="caption" color="text.secondary">
						by {creative.generatedBy}
					</Typography>
				</Box>

				{creative.performance && (
					<Grid container spacing={1}>
						<Grid item xs={4}>
							<Typography variant="caption" color="text.secondary" display="block">
								Views
							</Typography>
							<Typography variant="body2" sx={{ fontWeight: 600 }}>
								{creative.performance.views.toLocaleString()}
							</Typography>
						</Grid>
						<Grid item xs={4}>
							<Typography variant="caption" color="text.secondary" display="block">
								Clicks
							</Typography>
							<Typography variant="body2" sx={{ fontWeight: 600 }}>
								{creative.performance.clicks.toLocaleString()}
							</Typography>
						</Grid>
						<Grid item xs={4}>
							<Typography variant="caption" color="text.secondary" display="block">
								CTR
							</Typography>
							<Typography variant="body2" sx={{ fontWeight: 600, color: "#1a1a1a" }}>
								{creative.performance.ctr.toFixed(2)}%
							</Typography>
						</Grid>
					</Grid>
				)}
			</CardContent>
		</Card>
	);
}

function GenerateCreativeDialog({
	open,
	onClose,
	onGenerate,
	campaignId,
}: {
	open: boolean;
	onClose: () => void;
	onGenerate: (data: any) => void;
	campaignId?: string;
}) {
	const [prompt, setPrompt] = useState("");
	const [type, setType] = useState<"image" | "video">("image");
	const [segment, setSegment] = useState<"human" | "agent">("human");
	const [generating, setGenerating] = useState(false);

	const handleGenerate = async () => {
		if (!prompt.trim()) return;
		if (!campaignId) {
			alert("Please select a campaign first");
			return;
		}

		try {
			setGenerating(true);
			await onGenerate({
				campaignId,
				type,
				prompt,
				segment,
			});
			setPrompt("");
			onClose();
		} catch (error) {
			console.error("Failed to generate creative:", error);
		} finally {
			setGenerating(false);
		}
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
			<DialogTitle sx={{ fontWeight: 700 }}>
				<Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
					<AutoAwesomeIcon sx={{ color: "#1a1a1a" }} />
					Generate AI Creative
				</Box>
			</DialogTitle>
			<DialogContent>
				<Box sx={{ display: "flex", flexDirection: "column", gap: 3, pt: 2 }}>
					<Box>
						<Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
							Type
						</Typography>
						<ToggleButtonGroup
							value={type}
							exclusive
							onChange={(_, v) => v && setType(v)}
							fullWidth
							sx={{ bgcolor: "rgba(26, 26, 26, 0.05)" }}
						>
							<ToggleButton value="image" sx={{ textTransform: "none" }}>
								<ImageIcon sx={{ mr: 1, fontSize: 20 }} />
								Image
							</ToggleButton>
							<ToggleButton value="video" sx={{ textTransform: "none" }}>
								<VideoLibraryIcon sx={{ mr: 1, fontSize: 20 }} />
								Video
							</ToggleButton>
						</ToggleButtonGroup>
					</Box>

					<Box>
						<Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
							Target Audience
						</Typography>
						<ToggleButtonGroup
							value={segment}
							exclusive
							onChange={(_, v) => v && setSegment(v)}
							fullWidth
							sx={{ bgcolor: "rgba(26, 26, 26, 0.05)" }}
						>
							<ToggleButton value="human" sx={{ textTransform: "none" }}>
								Human
							</ToggleButton>
							<ToggleButton value="agent" sx={{ textTransform: "none" }}>
								AI Agent
							</ToggleButton>
						</ToggleButtonGroup>
					</Box>

					<TextField
						fullWidth
						multiline
						rows={4}
						label="Creative Prompt"
						placeholder="Describe the creative you want to generate... Be specific about style, colors, message, and target audience."
						value={prompt}
						onChange={(e) => setPrompt(e.target.value)}
						variant="outlined"
						helperText="The more detailed your prompt, the better the results"
					/>
				</Box>
			</DialogContent>
			<DialogActions sx={{ p: 3, pt: 0 }}>
				<Button onClick={onClose} sx={{ textTransform: "none" }} disabled={generating}>
					Cancel
				</Button>
				<Button
					onClick={handleGenerate}
					variant="contained"
					disabled={!prompt.trim() || generating}
					startIcon={generating ? <CircularProgress size={16} sx={{ color: "white" }} /> : <AutoAwesomeIcon />}
					sx={{
						background: "linear-gradient(135deg, #1a1a1a 0%, #404040 100%)",
						textTransform: "none",
						fontWeight: 600,
					}}
				>
					{generating ? "Generating..." : "Generate"}
				</Button>
			</DialogActions>
		</Dialog>
	);
}

export default function CreativeGallery({ campaignId }: { campaignId?: string }) {
	const [selectedCreative, setSelectedCreative] = useState<Creative | null>(null);
	const [currentTab, setCurrentTab] = useState(0);
	const [creatives, setCreatives] = useState<Creative[]>([]);
	const [loading, setLoading] = useState(true);
	const [showGenerateDialog, setShowGenerateDialog] = useState(false);

	// Load creatives from backend
	useEffect(() => {
		const loadCreatives = async () => {
			try {
				setLoading(true);
				const data = await CreativeAPI.list(campaignId);
				setCreatives(data);
			} catch (error) {
				console.error("Failed to load creatives:", error);
			} finally {
				setLoading(false);
			}
		};

		loadCreatives();

		// Poll for updates every 5 seconds
		const interval = setInterval(loadCreatives, 5000);

		return () => clearInterval(interval);
	}, [campaignId]);

	const handleGenerate = async (data: any) => {
		try {
			const creative = await CreativeAPI.generate(data);
			setCreatives((prev) => [creative, ...prev]);
		} catch (error) {
			console.error("Failed to generate creative:", error);
			alert("Failed to generate creative. Please ensure backend services are running.");
			throw error;
		}
	};

	const filteredCreatives =
		currentTab === 0 ? creatives : currentTab === 1 ? creatives.filter((c) => c.type === "image") : creatives.filter((c) => c.type === "video");

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
						AI-Generated Creatives
					</Typography>
					<Typography variant="caption" color="text.secondary">
						{creatives.length} total creatives • {creatives.filter((c) => c.status === "deployed").length} deployed
					</Typography>
				</Box>

				<Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
					<Tabs value={currentTab} onChange={(_, v) => setCurrentTab(v)} sx={{ minHeight: 36 }}>
						<Tab label="All" sx={{ minHeight: 36, textTransform: "none" }} />
						<Tab
							icon={<ImageIcon sx={{ fontSize: 16, color: "#1a1a1a" }} />}
							iconPosition="start"
							label="Images"
							sx={{ minHeight: 36, textTransform: "none" }}
						/>
						<Tab
							icon={<VideoLibraryIcon sx={{ fontSize: 16, color: "#1a1a1a" }} />}
							iconPosition="start"
							label="Videos"
							sx={{ minHeight: 36, textTransform: "none" }}
						/>
					</Tabs>

					<Button
						variant="contained"
						startIcon={<AddIcon />}
						onClick={() => setShowGenerateDialog(true)}
						sx={{
							background: "linear-gradient(135deg, #1a1a1a 0%, #404040 100%)",
							textTransform: "none",
							fontWeight: 600,
							borderRadius: 2,
						}}
					>
						Generate
					</Button>
				</Box>
			</Box>

			{loading ? (
				<Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
					<CircularProgress sx={{ color: "#1a1a1a" }} />
				</Box>
			) : filteredCreatives.length === 0 ? (
				<Box sx={{ textAlign: "center", py: 6 }}>
					<AutoAwesomeIcon sx={{ fontSize: 60, color: "text.secondary", mb: 2 }} />
					<Typography variant="h6" sx={{ mb: 1 }}>
						No creatives yet
					</Typography>
					<Typography color="text.secondary" sx={{ mb: 3 }}>
						Generate your first AI creative to get started
					</Typography>
					<Button
						variant="contained"
						startIcon={<AddIcon />}
						onClick={() => setShowGenerateDialog(true)}
						sx={{
							background: "linear-gradient(135deg, #1a1a1a 0%, #404040 100%)",
							textTransform: "none",
							fontWeight: 600,
						}}
					>
						Generate Creative
					</Button>
				</Box>
			) : (
				<Grid container spacing={2}>
					{filteredCreatives.map((creative) => (
						<Grid item xs={12} sm={6} md={4} lg={3} key={creative.id}>
							<CreativeCard creative={creative} onClick={() => setSelectedCreative(creative)} />
						</Grid>
					))}
				</Grid>
			)}

			{/* Creative Detail Dialog */}
			<Dialog
				open={!!selectedCreative}
				onClose={() => setSelectedCreative(null)}
				maxWidth="md"
				fullWidth
				PaperProps={{
					sx: {
						background: "rgba(255, 255, 255, 0.95)",
						backdropFilter: "blur(20px)",
						borderRadius: 3,
					},
				}}
			>
				{selectedCreative && (
					<>
						<Box sx={{ p: 2, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
							<Typography variant="h6" sx={{ fontWeight: 700 }}>
								{selectedCreative.title}
							</Typography>
							<IconButton onClick={() => setSelectedCreative(null)}>
								<CloseIcon sx={{ color: "#1a1a1a" }} />
							</IconButton>
						</Box>

						<DialogContent>
							<Box sx={{ mb: 3 }}>
								{selectedCreative.type === "video" ? (
									<Box
										sx={{
											width: "100%",
											height: 400,
											bgcolor: "grey.900",
											borderRadius: 2,
											display: "flex",
											alignItems: "center",
											justifyContent: "center",
										}}
									>
										<VideoLibraryIcon sx={{ fontSize: 80, color: "grey.600" }} />
										<Typography variant="body2" color="grey.500" sx={{ ml: 2 }}>
											Video Player
										</Typography>
									</Box>
								) : (
									<img
										src={selectedCreative.url}
										alt={selectedCreative.title}
										style={{
											width: "100%",
											borderRadius: 8,
											maxHeight: 500,
											objectFit: "contain",
										}}
									/>
								)}
							</Box>

							<Box sx={{ display: "flex", gap: 1, mb: 3 }}>
								<Chip label={selectedCreative.variant} />
								<Chip label={selectedCreative.segment} />
								<Chip label={`Generated by ${selectedCreative.generatedBy}`} />
							</Box>

							{selectedCreative.performance && (
								<Grid container spacing={3}>
									<Grid item xs={4}>
										<Paper sx={{ p: 2, textAlign: "center" }}>
											<VisibilityIcon sx={{ fontSize: 32, color: "#1a1a1a", mb: 1 }} />
											<Typography variant="h5" sx={{ fontWeight: 700 }}>
												{selectedCreative.performance.views.toLocaleString()}
											</Typography>
											<Typography variant="caption" color="text.secondary">
												Views
											</Typography>
										</Paper>
									</Grid>
									<Grid item xs={4}>
										<Paper sx={{ p: 2, textAlign: "center" }}>
											<ThumbUpIcon sx={{ fontSize: 32, color: "#1a1a1a", mb: 1 }} />
											<Typography variant="h5" sx={{ fontWeight: 700 }}>
												{selectedCreative.performance.clicks.toLocaleString()}
											</Typography>
											<Typography variant="caption" color="text.secondary">
												Clicks
											</Typography>
										</Paper>
									</Grid>
									<Grid item xs={4}>
										<Paper sx={{ p: 2, textAlign: "center" }}>
											<Typography variant="h5" sx={{ fontWeight: 700, color: "#1a1a1a" }}>
												{selectedCreative.performance.ctr.toFixed(2)}%
											</Typography>
											<Typography variant="caption" color="text.secondary">
												Click-through Rate
											</Typography>
										</Paper>
									</Grid>
								</Grid>
							)}

							<Box sx={{ mt: 3, display: "flex", gap: 2 }}>
								<Tooltip title="Download">
									<IconButton sx={{ bgcolor: "#1a1a1a", color: "white", "&:hover": { bgcolor: "#404040" } }}>
										<DownloadIcon />
									</IconButton>
								</Tooltip>
							</Box>
						</DialogContent>
					</>
				)}
			</Dialog>

			{/* Generate Creative Dialog */}
			<GenerateCreativeDialog
				open={showGenerateDialog}
				onClose={() => setShowGenerateDialog(false)}
				onGenerate={handleGenerate}
				campaignId={campaignId}
			/>

			<style>
				{`
					@keyframes pulse {
						0%, 100% {
							opacity: 1;
							transform: scale(1);
						}
						50% {
							opacity: 0.8;
							transform: scale(1.1);
						}
					}
				`}
			</style>
		</Paper>
	);
}
