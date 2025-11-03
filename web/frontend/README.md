# Ad-Astra Frontend

Production-ready React + TypeScript frontend for the Ad-Astra AI-powered advertising platform.

## Features

### Glassmorphic Dashboard
- Modern, sleek glassmorphic UI design with backdrop blur effects
- Fully responsive layout for mobile, tablet, and desktop
- Real-time campaign metrics and statistics
- Built with Material-UI (MUI) v7 components

### Campaign Management
- Create and manage multiple ad campaigns
- Set campaign goals (conversions, revenue, engagement)
- Target human and AI agent audiences
- Track progress with visual indicators
- Pause, resume, and deploy campaigns

### Agent Visualization
- Real-time view of active autonomous agents
- See agent status: initializing, generating, testing, optimizing, active
- Track agent performance and task completion
- Visual progress indicators with animations
- 3 types of agents:
  - **Creative Generator**: Creates ad variants
  - **Performance Optimizer**: Optimizes campaigns
  - **Data Analyst**: Analyzes performance data

### Campaign Chat Assistant
- Floating chat interface at bottom-right
- AI-powered campaign assistance
- Ask about campaign strategies, performance, and optimization
- Context-aware responses based on selected campaign
- Glassmorphic chat window design

### Deploy Functionality
- One-click campaign deployment
- Integration with backend orchestrator
- Automatic agent spawning on deployment
- Real-time status updates
- Error handling with user feedback

## Tech Stack

- **React 18.3** - Modern React with hooks
- **TypeScript 5.6** - Type-safe development
- **Vite 5.4** - Lightning-fast build tool
- **Material-UI v7** - Google's Material Design components
- **Emotion** - CSS-in-JS styling
- **Convex** - Real-time database (optional)

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Backend services running (optional for demo mode)

### Installation

```bash
cd web/frontend
npm install
```

### Environment Variables

Create a `.env` file:

```env
# Backend Services
VITE_BANDIT_SERVICE_URL=http://localhost:8000
VITE_AGENT_ORCHESTRATOR_URL=http://localhost:8001
VITE_EVOLUTION_SERVICE_URL=http://localhost:8002
VITE_OFFER_PAGES_URL=http://localhost:8787

# Convex
VITE_CONVEX_URL=https://spotted-coyote-595.convex.cloud

# Feature Flags
VITE_ENABLE_REAL_TIME=true
VITE_ENABLE_CHAT=true
```

### Development

```bash
npm run dev
```

The app will be available at `http://localhost:5173` (or next available port).

### Build

```bash
npm run build
```

## Project Structure

```
src/
├── components/
│   ├── AgentVisualization.tsx  # Agent status cards
│   └── CampaignChat.tsx         # Floating chat interface
├── pages/
│   └── Dashboard.tsx            # Main dashboard page
├── services/
│   └── api.ts                   # Backend API integration
├── theme.ts                     # MUI theme configuration
├── App.tsx                      # Landing page & routing
├── main.tsx                     # App entry point
└── index.css                    # Global styles
```

## Features in Detail

### Glassmorphic Design

All components use the glassmorphic design pattern:
- Semi-transparent backgrounds
- Backdrop blur effects
- Subtle borders and shadows
- Gradient accents (green theme)

Example styling:
```tsx
sx={{
  background: "rgba(255, 255, 255, 0.7)",
  backdropFilter: "blur(20px)",
  border: "1px solid rgba(255, 255, 255, 0.3)",
  borderRadius: 3,
}}
```

### Backend Integration

The app integrates with these backend services:

1. **Bandit Service** (port 8000)
   - Multi-armed bandit algorithm
   - A/B testing and optimization

2. **Agent Orchestrator** (port 8001)
   - Campaign management
   - Agent lifecycle management
   - Deploy/pause/resume operations

3. **Evolution Service** (port 8002)
   - Campaign evolution
   - Variant generation

4. **Offer Pages** (port 8787)
   - Landing page generation
   - Creative hosting

### API Service

See `src/services/api.ts` for all backend integration methods:

```typescript
import { CampaignAPI, AgentAPI, ChatAPI } from './services/api';

// Create campaign
await CampaignAPI.create({ name, goal, segments });

// Deploy campaign
await CampaignAPI.deploy(campaignId);

// Send chat message
const response = await ChatAPI.sendMessage(message, campaignId);
```

## Demo Mode

The app works without backend services in demo mode:
- Mock data for campaigns and agents
- Simulated chat responses
- UI-only interactions

Perfect for frontend development and testing.

## Deployment

### Production Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

### Deploy to Vercel/Netlify

1. Build the app: `npm run build`
2. Deploy the `dist/` folder
3. Set environment variables in hosting platform
4. Configure backend service URLs

## Customization

### Theme

Edit `src/theme.ts` to customize:
- Color palette
- Typography
- Component styles
- Border radius
- Spacing

### Layout

The main dashboard layout uses CSS Grid:
- Stats cards in a 4-column grid
- Campaign cards in a responsive grid (1-3 columns)
- Agent visualization full-width

### Components

All components are standalone and reusable:
- Import them anywhere in your app
- Pass props to customize behavior
- Fully typed with TypeScript

## Troubleshooting

### Port Already in Use

Vite automatically tries the next available port if 5173 is taken.

### Backend Connection Issues

Check that:
1. Backend services are running
2. URLs in `.env` are correct
3. No CORS issues (should be configured in backend)
4. Services are healthy: visit `/health` endpoint

### Build Errors

Clear cache and reinstall:
```bash
rm -rf node_modules dist
npm install
npm run build
```

## Contributing

1. Create feature branch
2. Make changes
3. Test thoroughly
4. Submit PR with description

## License

Proprietary - Ad-Astra Platform

## Support

For issues or questions:
- Check console for errors
- Verify backend services are running
- Review environment variables
- Check network tab in DevTools
