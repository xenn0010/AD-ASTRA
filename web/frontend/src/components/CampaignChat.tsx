import React, { useState, useRef, useEffect } from "react";
import {
	Box,
	Paper,
	TextField,
	IconButton,
	Typography,
	Avatar,
	Collapse,
	CircularProgress,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import PersonIcon from "@mui/icons-material/Person";
import CloseIcon from "@mui/icons-material/Close";
import ChatIcon from "@mui/icons-material/Chat";

type Message = {
	id: string;
	role: "user" | "assistant";
	content: string;
	timestamp: number;
};

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

export default function CampaignChat({ campaignId }: { campaignId?: string }) {
	const [isOpen, setIsOpen] = useState(false);
	const [messages, setMessages] = useState<Message[]>([
		{
			id: "1",
			role: "assistant",
			content: "Hello! I'm your Ad-Astra campaign assistant powered by GPT-5. I can help you create campaigns, generate ad creatives, optimize performance, and answer questions about your advertising strategy. What would you like to do?",
			timestamp: Date.now(),
		},
	]);
	const [input, setInput] = useState("");
	const [isTyping, setIsTyping] = useState(false);
	const messagesEndRef = useRef<HTMLDivElement>(null);

	const scrollToBottom = () => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	};

	useEffect(() => {
		scrollToBottom();
	}, [messages]);

	const callGPT = async (userMessage: string): Promise<string> => {
		try {
			const response = await fetch("https://api.openai.com/v1/chat/completions", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"Authorization": `Bearer ${OPENAI_API_KEY}`,
				},
				body: JSON.stringify({
					model: "gpt-4",
					messages: [
						{
							role: "system",
							content: `You are an expert advertising campaign assistant for Ad-Astra, an AI-powered advertising platform. You help users:
- Create campaigns with specific goals (conversions, revenue, engagement)
- Generate AI-powered ad creatives (images and videos)
- Optimize campaigns for dual audiences (humans and AI agents)
- Analyze performance metrics and suggest improvements
- Deploy campaigns to multiple platforms (Google Ads, Meta, X, Reddit)

Context: ${campaignId ? `User is working on campaign ${campaignId}` : "General platform assistance"}

Be concise, actionable, and focus on helping users achieve their advertising goals.`,
						},
						...messages.slice(-5).map((m) => ({
							role: m.role,
							content: m.content,
						})),
						{
							role: "user",
							content: userMessage,
						},
					],
					temperature: 0.7,
					max_tokens: 500,
				}),
			});

			if (!response.ok) {
				throw new Error(`OpenAI API error: ${response.statusText}`);
			}

			const data = await response.json();
			return data.choices[0].message.content;
		} catch (error) {
			console.error("GPT API Error:", error);
			throw error;
		}
	};

	const handleSend = async () => {
		if (!input.trim()) return;

		const userMessage: Message = {
			id: Date.now().toString(),
			role: "user",
			content: input,
			timestamp: Date.now(),
		};

		setMessages((prev) => [...prev, userMessage]);
		setInput("");
		setIsTyping(true);

		try {
			const gptResponse = await callGPT(input);
			const assistantMessage: Message = {
				id: (Date.now() + 1).toString(),
				role: "assistant",
				content: gptResponse,
				timestamp: Date.now(),
			};
			setMessages((prev) => [...prev, assistantMessage]);
		} catch (error) {
			const errorMessage: Message = {
				id: (Date.now() + 1).toString(),
				role: "assistant",
				content: "I'm having trouble connecting to the AI service. Please make sure your OpenAI API key is configured in the environment variables.",
				timestamp: Date.now(),
			};
			setMessages((prev) => [...prev, errorMessage]);
		} finally {
			setIsTyping(false);
		}
	};

	return (
		<>
			{/* Floating Chat Button */}
			{!isOpen && (
				<Paper
					elevation={8}
					sx={{
						position: "fixed",
						bottom: 24,
						right: 24,
						borderRadius: "50%",
						width: 64,
						height: 64,
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						cursor: "pointer",
						background: "linear-gradient(135deg, #1a1a1a 0%, #404040 100%)",
						color: "white",
						transition: "all 0.3s",
						zIndex: 1000,
						"&:hover": {
							transform: "scale(1.1)",
							boxShadow: "0 8px 24px rgba(0, 0, 0, 0.4)",
						},
					}}
					onClick={() => setIsOpen(true)}
				>
					<ChatIcon sx={{ fontSize: 32 }} />
				</Paper>
			)}

			{/* Chat Window */}
			<Collapse in={isOpen}>
				<Paper
					elevation={16}
					sx={{
						position: "fixed",
						bottom: 24,
						right: 24,
						width: { xs: "calc(100vw - 48px)", sm: 450 },
						height: 650,
						borderRadius: 3,
						overflow: "hidden",
						zIndex: 1000,
						background: "rgba(255, 255, 255, 0.98)",
						backdropFilter: "blur(20px)",
						border: "1px solid rgba(0, 0, 0, 0.1)",
						display: "flex",
						flexDirection: "column",
					}}
				>
					{/* Header */}
					<Box
						sx={{
							p: 2.5,
							background: "linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)",
							color: "white",
							display: "flex",
							alignItems: "center",
							justifyContent: "space-between",
							borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
						}}
					>
						<Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
							<Avatar sx={{ bgcolor: "#22c55e", width: 36, height: 36 }}>
								<SmartToyIcon sx={{ fontSize: 20 }} />
							</Avatar>
							<Box>
								<Typography variant="subtitle1" sx={{ fontWeight: 700, fontSize: "15px" }}>
									Campaign Assistant
								</Typography>
								<Typography variant="caption" sx={{ opacity: 0.8, fontSize: "11px" }}>
									Powered by GPT-5
								</Typography>
							</Box>
						</Box>
						<IconButton size="small" onClick={() => setIsOpen(false)} sx={{ color: "white" }}>
							<CloseIcon />
						</IconButton>
					</Box>

					{/* Messages */}
					<Box sx={{ flex: 1, overflow: "auto", p: 2.5, bgcolor: "#fafafa" }}>
						{messages.map((message) => (
							<Box
								key={message.id}
								sx={{
									display: "flex",
									mb: 2.5,
									flexDirection: message.role === "user" ? "row-reverse" : "row",
									gap: 1.5,
								}}
							>
								<Avatar
									sx={{
										bgcolor: message.role === "user" ? "#1a1a1a" : "#22c55e",
										width: 36,
										height: 36,
									}}
								>
									{message.role === "user" ? <PersonIcon sx={{ fontSize: 20 }} /> : <SmartToyIcon sx={{ fontSize: 20 }} />}
								</Avatar>
								<Paper
									elevation={0}
									sx={{
										p: 2,
										maxWidth: "75%",
										bgcolor: message.role === "user" ? "#1a1a1a" : "white",
										color: message.role === "user" ? "white" : "#1a1a1a",
										borderRadius: 2.5,
										borderTopLeftRadius: message.role === "assistant" ? 0 : 2.5,
										borderTopRightRadius: message.role === "user" ? 0 : 2.5,
										border: message.role === "assistant" ? "1px solid #e5e5e5" : "none",
									}}
								>
									<Typography variant="body2" sx={{ lineHeight: 1.6, fontSize: "14px", whiteSpace: "pre-wrap" }}>
										{message.content}
									</Typography>
								</Paper>
							</Box>
						))}
						{isTyping && (
							<Box sx={{ display: "flex", gap: 1.5, mb: 2.5 }}>
								<Avatar sx={{ bgcolor: "#22c55e", width: 36, height: 36 }}>
									<SmartToyIcon sx={{ fontSize: 20 }} />
								</Avatar>
								<Paper
									elevation={0}
									sx={{
										p: 2,
										borderRadius: 2.5,
										borderTopLeftRadius: 0,
										bgcolor: "white",
										border: "1px solid #e5e5e5",
										display: "flex",
										alignItems: "center",
										gap: 1,
									}}
								>
									<CircularProgress size={16} sx={{ color: "#22c55e" }} />
									<Typography variant="body2" color="text.secondary" sx={{ fontSize: "14px" }}>
										Thinking...
									</Typography>
								</Paper>
							</Box>
						)}
						<div ref={messagesEndRef} />
					</Box>

					{/* Input */}
					<Box
						sx={{
							p: 2.5,
							bgcolor: "white",
							borderTop: "1px solid #e5e5e5",
						}}
					>
						<Box sx={{ display: "flex", gap: 1.5 }}>
							<TextField
								fullWidth
								size="small"
								placeholder="Ask me anything about campaigns..."
								value={input}
								onChange={(e) => setInput(e.target.value)}
								onKeyPress={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
								disabled={isTyping}
								multiline
								maxRows={3}
								variant="outlined"
								sx={{
									"& .MuiOutlinedInput-root": {
										borderRadius: 2.5,
										bgcolor: "#fafafa",
										fontSize: "14px",
									},
								}}
							/>
							<IconButton
								onClick={handleSend}
								disabled={!input.trim() || isTyping}
								sx={{
									bgcolor: "#1a1a1a",
									color: "white",
									width: 42,
									height: 42,
									"&:hover": {
										bgcolor: "#2d2d2d",
									},
									"&:disabled": {
										bgcolor: "#e5e5e5",
										color: "#999",
									},
								}}
							>
								<SendIcon sx={{ fontSize: 20 }} />
							</IconButton>
						</Box>
					</Box>
				</Paper>
			</Collapse>
		</>
	);
}
