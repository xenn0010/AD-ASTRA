import React, { useState, useEffect } from "react";
import {
	Box,
	Paper,
	Typography,
	Grid,
	Card,
	CardContent,
	LinearProgress,
	Chip,
	Avatar,
	CircularProgress,
} from "@mui/material";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import VisibilityIcon from "@mui/icons-material/Visibility";
import MouseIcon from "@mui/icons-material/Mouse";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import PeopleIcon from "@mui/icons-material/People";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import { CampaignAPI } from "../services/api";

type AnalyticsData = {
	impressions: number;
	clicks: number;
	conversions: number;
	spend: number;
	revenue: number;
	ctr: number;
	cpc: number;
	conversionRate: number;
	roas: number;
	segmentBreakdown: {
		human: { impressions: number; conversions: number; spend: number };
		agent: { impressions: number; conversions: number; spend: number };
	};
	dailyMetrics: Array<{
		date: string;
		impressions: number;
		clicks: number;
		conversions: number;
		spend: number;
	}>;
};

const mockData: AnalyticsData = {
	impressions: 125430,
	clicks: 8921,
	conversions: 234,
	spend: 1543.67,
	revenue: 12850.0,
	ctr: 7.11,
	cpc: 0.17,
	conversionRate: 2.62,
	roas: 8.32,
	segmentBreakdown: {
		human: { impressions: 75258, conversions: 145, spend: 892.43 },
		agent: { impressions: 50172, conversions: 89, spend: 651.24 },
	},
	dailyMetrics: [
		{ date: "2025-10-28", impressions: 18234, clicks: 1289, conversions: 34, spend: 218.52 },
		{ date: "2025-10-29", impressions: 21456, clicks: 1523, conversions: 41, spend: 258.91 },
		{ date: "2025-10-30", impressions: 19832, clicks: 1411, conversions: 37, spend: 239.87 },
		{ date: "2025-10-31", impressions: 23012, clicks: 1634, conversions: 43, spend: 277.78 },
		{ date: "2025-11-01", impressions: 22145, clicks: 1573, conversions: 39, spend: 267.41 },
		{ date: "2025-11-02", impressions: 20751, clicks: 1491, conversions: 40, spend: 281.18 },
	],
};

function MetricCard({
	title,
	value,
	change,
	trend,
	icon,
	prefix = "",
	suffix = "",
}: {
	title: string;
	value: string | number;
	change: number;
	trend: "up" | "down";
	icon: React.ReactNode;
	prefix?: string;
	suffix?: string;
}) {
	const isPositive = (trend === "up" && change > 0) || (trend === "down" && change < 0);

	return (
		<Card
			elevation={0}
			sx={{
				background: "rgba(255, 255, 255, 0.7)",
				backdropFilter: "blur(10px)",
				border: "1px solid rgba(255, 255, 255, 0.3)",
				borderRadius: 2,
			}}
		>
			<CardContent>
				<Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", mb: 1 }}>
					<Typography variant="caption" color="text.secondary" sx={{ textTransform: "uppercase", fontWeight: 600 }}>
						{title}
					</Typography>
					<Avatar sx={{ bgcolor: "rgba(26, 26, 26, 0.1)", color: "#1a1a1a", width: 32, height: 32 }}>{icon}</Avatar>
				</Box>

				<Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
					{prefix}
					{value}
					{suffix}
				</Typography>

				<Chip
					label={`${change > 0 ? "+" : ""}${change.toFixed(1)}%`}
					size="small"
					icon={isPositive ? <TrendingUpIcon sx={{ fontSize: 14 }} /> : <TrendingDownIcon sx={{ fontSize: 14 }} />}
					sx={{
						bgcolor: isPositive ? "rgba(34, 197, 94, 0.1)" : "rgba(239, 68, 68, 0.1)",
						color: isPositive ? "secondary.main" : "error.main",
						fontWeight: 600,
						fontSize: "11px",
						height: 20,
					}}
				/>
			</CardContent>
		</Card>
	);
}

function SegmentComparisonCard({ data }: { data: AnalyticsData }) {
	const humanPercentage = (data.segmentBreakdown.human.conversions / data.conversions) * 100;
	const agentPercentage = (data.segmentBreakdown.agent.conversions / data.conversions) * 100;

	return (
		<Paper
			elevation={0}
			sx={{
				p: 3,
				background: "rgba(255, 255, 255, 0.7)",
				backdropFilter: "blur(10px)",
				border: "1px solid rgba(255, 255, 255, 0.3)",
				borderRadius: 2,
			}}
		>
			<Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
				Segment Performance
			</Typography>

			<Grid container spacing={3}>
				<Grid item xs={12} md={6}>
					<Box
						sx={{
							p: 2,
							borderRadius: 2,
							background: "linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(37, 99, 235, 0.05) 100%)",
							border: "1px solid rgba(59, 130, 246, 0.2)",
						}}
					>
						<Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
							<PeopleIcon sx={{ color: "primary.main" }} />
							<Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
								Human Audience
							</Typography>
						</Box>

						<Grid container spacing={2}>
							<Grid item xs={6}>
								<Typography variant="caption" color="text.secondary">
									Impressions
								</Typography>
								<Typography variant="h6" sx={{ fontWeight: 700 }}>
									{data.segmentBreakdown.human.impressions.toLocaleString()}
								</Typography>
							</Grid>
							<Grid item xs={6}>
								<Typography variant="caption" color="text.secondary">
									Conversions
								</Typography>
								<Typography variant="h6" sx={{ fontWeight: 700 }}>
									{data.segmentBreakdown.human.conversions}
								</Typography>
							</Grid>
							<Grid item xs={6}>
								<Typography variant="caption" color="text.secondary">
									Spend
								</Typography>
								<Typography variant="h6" sx={{ fontWeight: 700, color: "primary.main" }}>
									${data.segmentBreakdown.human.spend.toFixed(2)}
								</Typography>
							</Grid>
							<Grid item xs={6}>
								<Typography variant="caption" color="text.secondary">
									Conv. Share
								</Typography>
								<Typography variant="h6" sx={{ fontWeight: 700, color: "primary.main" }}>
									{humanPercentage.toFixed(1)}%
								</Typography>
							</Grid>
						</Grid>

						<Box sx={{ mt: 2 }}>
							<LinearProgress
								variant="determinate"
								value={humanPercentage}
								sx={{
									height: 8,
									borderRadius: 1,
									bgcolor: "rgba(59, 130, 246, 0.1)",
									"& .MuiLinearProgress-bar": {
										bgcolor: "primary.main",
									},
								}}
							/>
						</Box>
					</Box>
				</Grid>

				<Grid item xs={12} md={6}>
					<Box
						sx={{
							p: 2,
							borderRadius: 2,
							background: "linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(22, 163, 74, 0.05) 100%)",
							border: "1px solid rgba(34, 197, 94, 0.2)",
						}}
					>
						<Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
							<SmartToyIcon sx={{ color: "secondary.main" }} />
							<Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
								AI Agent Audience
							</Typography>
						</Box>

						<Grid container spacing={2}>
							<Grid item xs={6}>
								<Typography variant="caption" color="text.secondary">
									Impressions
								</Typography>
								<Typography variant="h6" sx={{ fontWeight: 700 }}>
									{data.segmentBreakdown.agent.impressions.toLocaleString()}
								</Typography>
							</Grid>
							<Grid item xs={6}>
								<Typography variant="caption" color="text.secondary">
									Conversions
								</Typography>
								<Typography variant="h6" sx={{ fontWeight: 700 }}>
									{data.segmentBreakdown.agent.conversions}
								</Typography>
							</Grid>
							<Grid item xs={6}>
								<Typography variant="caption" color="text.secondary">
									Spend
								</Typography>
								<Typography variant="h6" sx={{ fontWeight: 700, color: "secondary.main" }}>
									${data.segmentBreakdown.agent.spend.toFixed(2)}
								</Typography>
							</Grid>
							<Grid item xs={6}>
								<Typography variant="caption" color="text.secondary">
									Conv. Share
								</Typography>
								<Typography variant="h6" sx={{ fontWeight: 700, color: "secondary.main" }}>
									{agentPercentage.toFixed(1)}%
								</Typography>
							</Grid>
						</Grid>

						<Box sx={{ mt: 2 }}>
							<LinearProgress
								variant="determinate"
								value={agentPercentage}
								sx={{
									height: 8,
									borderRadius: 1,
									bgcolor: "rgba(34, 197, 94, 0.1)",
									"& .MuiLinearProgress-bar": {
										bgcolor: "secondary.main",
									},
								}}
							/>
						</Box>
					</Box>
				</Grid>
			</Grid>
		</Paper>
	);
}

function DailyTrendsChart({ data }: { data: AnalyticsData }) {
	const maxConversions = Math.max(...data.dailyMetrics.map((d) => d.conversions));

	return (
		<Paper
			elevation={0}
			sx={{
				p: 3,
				background: "rgba(255, 255, 255, 0.7)",
				backdropFilter: "blur(10px)",
				border: "1px solid rgba(255, 255, 255, 0.3)",
				borderRadius: 2,
			}}
		>
			<Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
				Daily Performance Trends
			</Typography>

			<Box sx={{ display: "flex", gap: 2, height: 200 }}>
				{data.dailyMetrics.map((day, idx) => {
					const height = (day.conversions / maxConversions) * 100;
					return (
						<Box key={idx} sx={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
							<Typography variant="caption" sx={{ fontWeight: 600, color: "secondary.main" }}>
								{day.conversions}
							</Typography>
							<Box
								sx={{
									flex: 1,
									width: "100%",
									display: "flex",
									alignItems: "flex-end",
								}}
							>
								<Box
									sx={{
										width: "100%",
										height: `${height}%`,
										background: "linear-gradient(180deg, #22c55e 0%, #16a34a 100%)",
										borderRadius: "4px 4px 0 0",
										transition: "all 0.3s",
										"&:hover": {
											opacity: 0.8,
										},
									}}
								/>
							</Box>
							<Typography variant="caption" color="text.secondary" sx={{ fontSize: "10px" }}>
								{new Date(day.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
							</Typography>
						</Box>
					);
				})}
			</Box>
		</Paper>
	);
}

export default function CampaignAnalytics({ campaignId }: { campaignId?: string }) {
	const data = mockData;

	return (
		<Box>
			<Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
				Campaign Analytics
			</Typography>

			<Grid container spacing={3}>
				{/* Key Metrics */}
				<Grid item xs={12} sm={6} md={3}>
					<MetricCard
						title="Impressions"
						value={data.impressions.toLocaleString()}
						change={12.5}
						trend="up"
						icon={<VisibilityIcon sx={{ fontSize: 16 }} />}
					/>
				</Grid>
				<Grid item xs={12} sm={6} md={3}>
					<MetricCard title="Clicks" value={data.clicks.toLocaleString()} change={8.3} trend="up" icon={<MouseIcon sx={{ fontSize: 16 }} />} />
				</Grid>
				<Grid item xs={12} sm={6} md={3}>
					<MetricCard
						title="Conversions"
						value={data.conversions}
						change={15.7}
						trend="up"
						icon={<ShoppingCartIcon sx={{ fontSize: 16 }} />}
					/>
				</Grid>
				<Grid item xs={12} sm={6} md={3}>
					<MetricCard
						title="Revenue"
						value={data.revenue.toLocaleString()}
						change={22.4}
						trend="up"
						icon={<AttachMoneyIcon sx={{ fontSize: 16 }} />}
						prefix="$"
					/>
				</Grid>

				{/* Performance Metrics */}
				<Grid item xs={12} sm={6} md={3}>
					<MetricCard title="CTR" value={data.ctr.toFixed(2)} change={5.2} trend="up" icon={<TrendingUpIcon sx={{ fontSize: 16 }} />} suffix="%" />
				</Grid>
				<Grid item xs={12} sm={6} md={3}>
					<MetricCard title="CPC" value={data.cpc.toFixed(2)} change={-3.1} trend="down" icon={<AttachMoneyIcon sx={{ fontSize: 16 }} />} prefix="$" />
				</Grid>
				<Grid item xs={12} sm={6} md={3}>
					<MetricCard
						title="Conv. Rate"
						value={data.conversionRate.toFixed(2)}
						change={9.8}
						trend="up"
						icon={<TrendingUpIcon sx={{ fontSize: 16 }} />}
						suffix="%"
					/>
				</Grid>
				<Grid item xs={12} sm={6} md={3}>
					<MetricCard title="ROAS" value={data.roas.toFixed(2)} change={18.6} trend="up" icon={<TrendingUpIcon sx={{ fontSize: 16 }} />} suffix="x" />
				</Grid>

				{/* Daily Trends */}
				<Grid item xs={12} md={7}>
					<DailyTrendsChart data={data} />
				</Grid>

				{/* Segment Comparison */}
				<Grid item xs={12} md={5}>
					<SegmentComparisonCard data={data} />
				</Grid>
			</Grid>
		</Box>
	);
}
