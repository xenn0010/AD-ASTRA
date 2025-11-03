import React, { useState } from "react";
import {
	Box,
	Paper,
	TextField,
	IconButton,
	Button,
	Typography,
	Chip,
	Select,
	MenuItem,
	FormControl,
	InputLabel,
	Avatar,
} from "@mui/material";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import MicIcon from "@mui/icons-material/Mic";
import RefreshIcon from "@mui/icons-material/Refresh";
import PersonIcon from "@mui/icons-material/Person";
import SendIcon from "@mui/icons-material/Send";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";

interface PromptBoxProps {
	onGenerate?: (prompt: string, style?: string, ratio?: string) => void;
}

export default function PromptBox({ onGenerate }: PromptBoxProps) {
	const [prompt, setPrompt] = useState("");
	const [style, setStyle] = useState("professional");
	const [ratio, setRatio] = useState("1:1");
	const [suggestedPrompts] = useState([
		"Make a fantasy-style background with the mountains",
		"Make a photo like Pixar movie",
	]);

	const handleGenerate = () => {
		if (prompt.trim() && onGenerate) {
			onGenerate(prompt, style, ratio);
			setPrompt("");
		}
	};

	const handleSuggestedPrompt = (suggested: string) => {
		setPrompt(suggested);
	};

	return (
		<Box sx={{ mb: 4 }}>
			{/* Stats Banner */}
			<Paper
				elevation={0}
				sx={{
					background: "linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(16, 185, 129, 0.08) 100%)",
					borderRadius: "12px 12px 0 0",
					p: 2.5,
					display: "flex",
					alignItems: "center",
					justifyContent: "space-between",
					borderBottom: "1px solid rgba(26, 26, 26, 0.08)",
				}}
			>
				<Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
					<Box
						sx={{
							width: 24,
							height: 24,
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							background: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
							borderRadius: 1,
							transform: "rotate(45deg)",
						}}
					>
						<AutoAwesomeIcon
							sx={{
								color: "white",
								fontSize: 14,
								transform: "rotate(-45deg)",
							}}
						/>
					</Box>
					<Typography variant="body2" sx={{ fontWeight: 600, color: "#1a1a1a", fontSize: "14px" }}>
						Daily more than 10,000+ Creatives Generated
					</Typography>
				</Box>
				<Typography variant="body2" sx={{ color: "rgba(26, 26, 26, 0.7)", fontWeight: 500, fontSize: "14px" }}>
					Powered by Ad-Astra AI
				</Typography>
			</Paper>

			{/* Main Prompt Box */}
			<Paper
				elevation={0}
				sx={{
					background: "rgba(255, 255, 255, 0.95)",
					backdropFilter: "blur(20px)",
					border: "1px solid rgba(26, 26, 26, 0.08)",
					borderRadius: "0 0 12px 12px",
					borderTop: "none",
					p: 3,
					boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
				}}
			>
				{/* Prompt Input */}
				<TextField
					fullWidth
					multiline
					rows={4}
					placeholder="Type a prompt and let AI turn it into an ad creative..."
					value={prompt}
					onChange={(e) => setPrompt(e.target.value)}
					onKeyDown={(e) => {
						if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
							handleGenerate();
						}
					}}
					variant="standard"
					InputProps={{
						disableUnderline: true,
					}}
					sx={{
						mb: 2.5,
						"& .MuiInputBase-root": {
							background: "transparent",
							fontSize: "16px",
							lineHeight: 1.6,
							color: "#1a1a1a",
							"&::placeholder": {
								color: "rgba(26, 26, 26, 0.4)",
								opacity: 1,
							},
						},
					}}
				/>

				{/* Controls Row */}
				<Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2.5 }}>
					<Box sx={{ display: "flex", gap: 1.5, alignItems: "center" }}>
						{/* Styles Dropdown */}
						<FormControl size="small" sx={{ minWidth: 130 }}>
							<Select
								value={style}
								onChange={(e) => setStyle(e.target.value)}
								displayEmpty
								sx={{
									background: "rgba(26, 26, 26, 0.04)",
									borderRadius: 2,
									border: "1px solid rgba(26, 26, 26, 0.1)",
									fontSize: "14px",
									fontWeight: 500,
									height: 36,
									"& .MuiOutlinedInput-notchedOutline": {
										border: "none",
									},
									"&:hover": {
										background: "rgba(26, 26, 26, 0.08)",
									},
								}}
							>
								<MenuItem value="professional">Styles</MenuItem>
								<MenuItem value="professional">Professional</MenuItem>
								<MenuItem value="casual">Casual</MenuItem>
								<MenuItem value="bold">Bold</MenuItem>
								<MenuItem value="minimal">Minimal</MenuItem>
								<MenuItem value="playful">Playful</MenuItem>
							</Select>
						</FormControl>

						{/* Avatar/Profile */}
						<IconButton
							size="small"
							sx={{
								bgcolor: "rgba(26, 26, 26, 0.05)",
								border: "1px solid rgba(26, 26, 26, 0.1)",
								width: 36,
								height: 36,
								"&:hover": {
									bgcolor: "rgba(26, 26, 26, 0.1)",
								},
							}}
						>
							<PersonIcon sx={{ fontSize: 18, color: "#1a1a1a" }} />
						</IconButton>

						{/* Aspect Ratio */}
						<Button
							variant="outlined"
							size="small"
							sx={{
								borderColor: "rgba(26, 26, 26, 0.15)",
								color: "#1a1a1a",
								borderRadius: 2,
								minWidth: 50,
								height: 36,
								fontWeight: 600,
								fontSize: "13px",
								"&:hover": {
									borderColor: "#1a1a1a",
									background: "rgba(26, 26, 26, 0.05)",
								},
							}}
						>
							{ratio}
						</Button>
					</Box>

					<Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
						{/* Microphone */}
						<IconButton
							size="small"
							sx={{
								bgcolor: "rgba(26, 26, 26, 0.05)",
								border: "1px solid rgba(26, 26, 26, 0.1)",
								width: 36,
								height: 36,
								"&:hover": {
									bgcolor: "rgba(26, 26, 26, 0.1)",
								},
							}}
						>
							<MicIcon sx={{ fontSize: 18, color: "#1a1a1a" }} />
						</IconButton>

						{/* Generate Button */}
						<Button
							variant="contained"
							onClick={handleGenerate}
							disabled={!prompt.trim()}
							startIcon={
								<Box
									sx={{
										width: 18,
										height: 18,
										display: "flex",
										alignItems: "center",
										justifyContent: "center",
										background: "rgba(255, 255, 255, 0.2)",
										borderRadius: "50%",
										transform: "rotate(45deg)",
									}}
								>
									<AutoAwesomeIcon
										sx={{
											color: "white",
											fontSize: 12,
											transform: "rotate(-45deg)",
										}}
									/>
								</Box>
							}
							sx={{
								background: "linear-gradient(135deg, #1a1a1a 0%, #404040 100%)",
								color: "white",
								borderRadius: 2,
								px: 3,
								py: 1.2,
								fontWeight: 600,
								textTransform: "none",
								fontSize: "15px",
								minWidth: 130,
								height: 42,
								"&:hover": {
									background: "linear-gradient(135deg, #000000 0%, #1a1a1a 100%)",
									transform: "translateY(-1px)",
									boxShadow: "0 6px 16px rgba(26, 26, 26, 0.25)",
								},
								"&:disabled": {
									background: "rgba(26, 26, 26, 0.1)",
									color: "rgba(26, 26, 26, 0.3)",
								},
							}}
						>
							Generate
						</Button>
					</Box>
				</Box>

				{/* Suggested Prompts */}
				<Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap" }}>
					{suggestedPrompts.map((suggested, idx) => (
						<Button
							key={idx}
							onClick={() => handleSuggestedPrompt(suggested)}
							endIcon={<ArrowUpwardIcon sx={{ fontSize: 14 }} />}
							sx={{
								bgcolor: "rgba(26, 26, 26, 0.05)",
								color: "#1a1a1a",
								border: "1px solid rgba(26, 26, 26, 0.1)",
								borderRadius: 2,
								px: 2,
								py: 0.75,
								fontSize: "13px",
								fontWeight: 500,
								textTransform: "none",
								"&:hover": {
									bgcolor: "rgba(26, 26, 26, 0.1)",
									borderColor: "rgba(26, 26, 26, 0.2)",
									transform: "translateY(-1px)",
								},
								"& .MuiButton-endIcon": {
									marginLeft: 0.5,
									color: "#22c55e",
								},
							}}
						>
							{suggested}
						</Button>
					))}
					<IconButton
						size="small"
						sx={{
							bgcolor: "rgba(26, 26, 26, 0.05)",
							border: "1px solid rgba(26, 26, 26, 0.1)",
							width: 32,
							height: 32,
							"&:hover": {
								bgcolor: "rgba(26, 26, 26, 0.1)",
							},
						}}
					>
						<RefreshIcon sx={{ fontSize: 16, color: "#1a1a1a" }} />
					</IconButton>
				</Box>
			</Paper>
		</Box>
	);
}

