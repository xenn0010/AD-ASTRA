import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
	palette: {
		mode: "light",
		primary: {
			main: "#0a0a0a",
			contrastText: "#ffffff",
		},
		secondary: {
			main: "#22c55e",
			contrastText: "#ffffff",
		},
		background: {
			default: "#fafafa",
			paper: "rgba(255, 255, 255, 0.9)",
		},
		text: {
			primary: "#0a0a0a",
			secondary: "rgba(10, 10, 10, 0.6)",
		},
	},
	typography: {
		fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
		h1: {
			fontWeight: 800,
			letterSpacing: "-0.04em",
		},
		h2: {
			fontWeight: 800,
			letterSpacing: "-0.03em",
		},
		h3: {
			fontWeight: 700,
			letterSpacing: "-0.02em",
		},
		h4: {
			fontWeight: 700,
			letterSpacing: "-0.02em",
		},
		h5: {
			fontWeight: 700,
			letterSpacing: "-0.01em",
		},
		h6: {
			fontWeight: 700,
			letterSpacing: "-0.01em",
		},
		button: {
			textTransform: "none",
			fontWeight: 600,
		},
	},
	shape: {
		borderRadius: 12,
	},
	components: {
		MuiButton: {
			styleOverrides: {
				root: {
					borderRadius: 12,
					padding: "12px 24px",
					fontWeight: 600,
					textTransform: "none",
					transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
				},
				contained: {
					boxShadow: "0 4px 16px rgba(0, 0, 0, 0.08)",
					"&:hover": {
						boxShadow: "0 8px 24px rgba(0, 0, 0, 0.12)",
						transform: "translateY(-2px)",
					},
				},
			},
		},
		MuiCard: {
			styleOverrides: {
				root: {
					borderRadius: 20,
					background: "rgba(255, 255, 255, 0.85)",
					backdropFilter: "blur(20px)",
					border: "1px solid rgba(26, 26, 26, 0.08)",
					transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
					"&:hover": {
						transform: "translateY(-4px)",
						boxShadow: "0 12px 32px rgba(0, 0, 0, 0.12)",
					},
				},
			},
		},
		MuiPaper: {
			styleOverrides: {
				root: {
					backgroundImage: "none",
				},
			},
		},
		MuiAppBar: {
			styleOverrides: {
				root: {
					background: "rgba(255, 255, 255, 0.85)",
					backdropFilter: "blur(20px) saturate(180%)",
					boxShadow: "0 1px 0 rgba(0, 0, 0, 0.05)",
				},
			},
		},
		MuiTextField: {
			styleOverrides: {
				root: {
					"& .MuiOutlinedInput-root": {
						borderRadius: 12,
						transition: "all 0.3s ease",
						"&:hover": {
							transform: "translateY(-1px)",
						},
					},
				},
			},
		},
	},
});
