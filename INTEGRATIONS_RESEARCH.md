# Integration Research Document

## Research Status

Before implementing, we need to research how each integration actually works.

---

## 1. Metorial (MCP Runtime Platform) ✅ RESEARCHED

**What we now know:**
- It's like "Vercel for MCP" - serverless runtime for Model Context Protocol servers
- Sub-second cold starts with per-user isolation
- Built-in security, monitoring, and scaling
- Helps connect AI agents to 600+ integrations via MCP

**✅ Platform Overview:**
- **Purpose**: Abstracts away MCP complexity, provides unified interface
- **Features**:
  - One-liner SDKs for AI model connections
  - Detailed monitoring and logging
  - Highly customizable platform
  - Open-source and self-hostable
- **Supported Languages**: JavaScript/TypeScript and Python SDKs

**✅ Access Methods:**
1. **Hosted Platform**: metorial.com (managed service)
2. **Self-Hosted**: Open-source platform via GitHub
3. **API Access**: Full API for custom integrations

**✅ GitHub Resources:**
- Main platform: https://github.com/metorial/mcp-containers
- MCP server index: https://github.com/metorial/mcp-index
- 600+ integrations available via MCP protocol

**✅ Integration Approach:**
- Connect AI model with single function call
- MCP servers handle API connections, data sources, tools
- Metorial manages deployment, scaling, security
- Access via SDK or direct API calls

**⚠️ Documentation Status:**
- Official docs available at metorial.com
- API reference available but requires account
- GitHub repos have implementation examples
- Y Combinator backed (legitimate company)

**Implementation Notes for Ad-Astra:**
- ✅ Can use to connect agents to external data/APIs
- ✅ Simplifies integration complexity
- ⚠️ Requires Metorial account/API key
- ⚠️ May be overkill for MVP - consider direct API calls first
- 💡 Best use case: When agents need dynamic tool access
- 💡 Possible later addition after core platform works

**Recommendation:**
- Skip Metorial for MVP (adds complexity)
- Focus on direct Google AI stack integration first
- Add Metorial later when agents need diverse tool access
- Keep in .env as optional feature flag

---

## 2. Google Gemini API ✅ RESEARCHED

**What we now know:**
- Google's LLM (Gemini 2.5 Pro and Gemini 2.0 models available)
- Full API access through two platforms: Gemini Developer API and Vertex AI
- Model: gemini-1.5-pro (and newer models)

**✅ Authentication:**
- **Gemini Developer API**: Simple API key authentication
  - Get key from: https://aistudio.google.com/apikey
  - Use: `client = genai.Client(api_key='YOUR_KEY')`
  - Or set `GOOGLE_API_KEY` env var (SDK auto-detects)
- **Vertex AI**: OAuth 2.0 with Google Cloud
  - `client = genai.Client(vertexai=True, project='project-id', location='us-central1')`

**✅ Python SDK:**
- **Package**: `google-genai` (NEW unified SDK as of May 2025)
- **Install**: `pip install google-genai`
- **GitHub**: https://github.com/googleapis/python-genai
- **Status**: General Availability (GA) - production-ready
- **Legacy SDK**: `google-generativeai` deprecated Nov 30, 2025

**✅ Request/Response:**
```python
from google import genai
client = genai.Client()
response = client.models.generate_content(
    model='gemini-1.5-pro',
    contents='Your prompt here'
)
```

**Implementation Notes:**
- ✅ Same API key works for Gemini, Imagen 3, and potentially Veo 2
- ✅ Unified SDK simplifies integration
- ✅ Can use as drop-in replacement for OpenAI in agent orchestrator

---

## 3. Imagen 3 (Google's Image Generation) ✅ RESEARCHED

**IMPORTANT CLARIFICATION:**
- ✅ Official name is **Imagen 3**, NOT "NanoBanana"
- NanoBanana may have been an internal codename or misunderstanding
- The .env should reference **GOOGLE_IMAGEN** not GOOGLE_NANOBANANA

**What we now know:**
- **Part of Google's Gemini ecosystem** - uses same API key
- State-of-the-art image generation model
- Available through Gemini API AND Vertex AI

**✅ Authentication:**
- Same as Gemini: API key authentication
- Get key from: https://aistudio.google.com/apikey
- Use `x-goog-api-key` header or SDK authentication

**✅ Access Methods:**
1. **Gemini API** (Recommended for simplicity)
   - Endpoint: `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict`
   - Model ID: `imagen-3.0-generate-002`
   - Pricing: $0.03 per image

2. **Vertex AI** (For Google Cloud users)
   - More configuration options
   - Enterprise features

**✅ Python SDK Usage:**
```python
from google import genai
from google.genai import types

client = genai.Client()  # Uses GOOGLE_API_KEY env var

response = client.models.generate_images(
    model='imagen-3.0-generate-002',
    prompt='Robot holding a red skateboard',
    config=types.GenerateImagesConfig(
        number_of_images=4,  # Max 4 per request
        aspect_ratio='1:1',   # Default square
    )
)

for generated_image in response.generated_images:
    generated_image.image.show()  # PIL Image object
```

**✅ Key Features:**
- Maximum 4 images per request
- Input limit: 480 tokens
- English-language prompts only
- Default aspect ratio: 1:1 (square)
- All images include SynthID watermark (non-visible)
- Latest update: February 2025

**✅ Response Format:**
- Returns PIL Image objects
- Can save to file, upload to storage, or serve directly

**Implementation Notes:**
- ✅ Uses same `google-genai` SDK as Gemini text
- ✅ Same API key for both services
- ✅ Simple integration for visual agents

---

## 4. Veo 2 (Google's Video Generation) ✅ RESEARCHED

**What we now know:**
- **Part of Google's Gemini ecosystem**
- Google's state-of-the-art video generation model
- Generally available via Vertex AI (as of 2025)
- Also available through Gemini API

**✅ Authentication:**
- **Vertex AI**: OAuth 2.0 bearer token via Google Cloud
  - Requires: `gcloud auth print-access-token`
  - More complex setup than Gemini API key
- **Gemini API**: Simpler API key approach (check availability)

**✅ Model IDs:**
- `veo-2.0-generate-001` (production stable)
- `veo-2.0-generate-exp` (experimental features)
- `veo-2.0-generate-preview` (preview version)

**✅ API Endpoint (Vertex AI):**
```
POST https://us-central1-aiplatform.googleapis.com/v1/projects/PROJECT_ID/locations/us-central1/publishers/google/models/MODEL_ID:predictLongRunning
```

**✅ Request Format:**
```json
{
  "instances": [{
    "prompt": "A robot skateboarding in a park",
    "image": "base64_or_cloud_storage_uri",  // Optional
    "video": "existing_video_uri",  // Optional for extension
    "lastFrame": "image_uri"  // Optional final frame
  }],
  "parameters": {
    "durationSeconds": 8,  // 5-8 seconds
    "sampleCount": 4,  // 1-4 videos
    "aspectRatio": "16:9",  // or "9:16"
    "seed": 12345,  // Optional for reproducibility
    "enhancePrompt": true,  // Auto-enhance prompts
    "negativePrompt": "blurry, low quality"  // What to avoid
  }
}
```

**✅ Key Features:**
- **Video Length**: 5-8 seconds (default: 8)
- **Resolution**: 720p at 24fps
- **Generation Modes**:
  - Text-to-video
  - Image-to-video
  - Video extension
  - Last-frame control
- **Batch Generation**: 1-4 videos per request
- **Storage**: Videos stored for 2 days, then deleted

**✅ Response Format:**
- Returns operation ID for long-running operation
- Poll operation to get video URLs when ready
- Videos returned as Cloud Storage URLs or base64

**⚠️ Important Limitations:**
- Videos are auto-deleted after 2 days - must download promptly
- Requires Google Cloud project setup for Vertex AI
- More complex authentication than Gemini/Imagen
- Generation is asynchronous (not instant)

**Implementation Notes:**
- ⚠️ More complex than Gemini/Imagen due to OAuth + async operations
- ✅ Can use Vertex AI Python SDK: `pip install google-cloud-aiplatform`
- ⚠️ May need different API key/auth from simple Gemini API key
- ✅ Best for video ads where production quality matters
- Consider starting with Imagen 3 first, add Veo 2 later

---

## 5. Meta Ads API (Facebook/Instagram)

**What we know:**
- Facebook Marketing API
- Graph API v18.0
- Need: Access Token, Ad Account ID, App ID, App Secret

**What we need to research:**
- [ ] Official Meta Marketing API docs?
- [ ] Authentication flow (OAuth)?
- [ ] How to create campaigns programmatically?
- [ ] How to create ad creatives?
- [ ] How to fetch insights/metrics?
- [ ] Rate limits?
- [ ] Python SDK available?

**Research links:**
- [ ] https://developers.facebook.com/docs/marketing-api/
- [ ] Meta Business SDK for Python

---

## 6. MCP (Model Context Protocol)

**What we need to understand:**
- [ ] What is MCP exactly?
- [ ] Protocol specification?
- [ ] How do MCP servers work?
- [ ] How do MCP clients connect?
- [ ] Standard MCP server examples?
- [ ] How does Metorial fit into this?

**Research links:**
- [ ] MCP protocol GitHub
- [ ] Anthropic MCP documentation
- [ ] Example implementations

---

## Research Action Items - ✅ COMPLETED

### ✅ PRIORITY 1: Verify Services Exist
1. **NanoBanana** - ✅ CLARIFIED: Imagen 3 is the official name, NOT NanoBanana
2. **Veo2** - ✅ CONFIRMED: Public API access available via Vertex AI
3. **Metorial** - ✅ CONFIRMED: Real service with open-source platform

### ✅ PRIORITY 2: API Documentation
All services have official documentation:
- ✅ Google Gemini - ai.google.dev
- ✅ Google Imagen 3 - ai.google.dev/gemini-api/docs/imagen
- ✅ Google Veo 2 - cloud.google.com/vertex-ai
- ✅ Metorial - metorial.com + GitHub

### ✅ PRIORITY 3: SDK Availability
- ✅ Google Gemini: `google-genai` (pip install google-genai)
- ✅ Imagen 3: Uses same `google-genai` SDK
- ✅ Veo 2: Vertex AI SDK + REST API
- ✅ Metorial: JavaScript/TypeScript and Python SDKs available

---

## Alternative Services (If Research Shows Issues)

### If NanoBanana doesn't exist:
- **Replicate** - Stable Diffusion, Midjourney-style models
- **DALL-E 3** - OpenAI's image generation
- **Stability AI** - Official Stable Diffusion API
- **Leonardo.ai** - AI image generation

### If Veo2 isn't accessible:
- **RunwayML Gen-2** - Video generation
- **Pika Labs** - Video from text
- **Stable Video Diffusion** - Via Replicate
- **D-ID** - Talking head videos

### For MCP/Metorial:
- Direct API integrations without MCP layer
- Custom middleware services
- Use LangChain tools instead

---

## Next Steps

1. **User provides**:
   - Access to Metorial account/docs
   - Confirmation on which services they have access to
   - API keys they want to use

2. **We research**:
   - Each service's actual API
   - Working examples
   - Integration patterns

3. **We implement**:
   - Based on real documentation
   - With proper error handling
   - With fallbacks to alternatives

---

## ✅ RESEARCH COMPLETE - Key Findings Summary

### What Actually Exists:
1. ✅ **Google Gemini API** - Production ready, simple API key auth
2. ✅ **Google Imagen 3** - Production ready, same API key as Gemini
3. ✅ **Google Veo 2** - Production ready, but more complex (Vertex AI)
4. ✅ **Metorial** - Real service, but optional for MVP

### What Doesn't Exist:
1. ❌ **NanoBanana** - Not a real API name, should be "Imagen 3"

### Implementation Complexity:
| Service | Complexity | Auth Method | SDK | MVP Priority |
|---------|-----------|-------------|-----|--------------|
| Google Gemini | ⭐ Easy | API Key | `google-genai` | 🔥 HIGH |
| Google Imagen 3 | ⭐ Easy | Same API Key | `google-genai` | 🔥 HIGH |
| Google Veo 2 | ⭐⭐⭐ Complex | OAuth 2.0 | `google-cloud-aiplatform` | 💡 LATER |
| Metorial | ⭐⭐ Medium | API Key | Custom SDK | 💡 OPTIONAL |

### Recommended Implementation Order:

**Phase 1: Core Google AI Stack (Start Here)**
1. Add Google Gemini text generation to agent orchestrator
2. Add Google Imagen 3 image generation for visual agents
3. Test with single Google API key (`GOOGLE_API_KEY`)

**Phase 2: Advanced Features (Later)**
4. Add Google Veo 2 video generation (requires GCP setup)
5. Add Metorial MCP for dynamic tool access (optional)

### Required API Keys:
- ✅ `OPENAI_API_KEY` - For GPT-4 agents
- ✅ `GOOGLE_API_KEY` - For Gemini + Imagen 3 (same key!)
- ⏸️ `GOOGLE_CLOUD_PROJECT` + OAuth - For Veo 2 (later)
- ⏸️ `MCP_METORIAL_API_KEY` - Optional, not needed for MVP

### Critical .env Updates Needed:
```bash
# Change this:
GOOGLE_NANOBANANA_API_KEY=...
GOOGLE_NANOBANANA_MODEL=...

# To this:
GOOGLE_IMAGEN_API_KEY=${GOOGLE_API_KEY}  # Uses same Gemini key
GOOGLE_IMAGEN_MODEL=imagen-3.0-generate-002
```

### Next Steps - Ready to Code:

**✅ Research Phase: COMPLETE**
**➡️ Implementation Phase: READY TO START**

Focus on:
1. Fix .env.example (rename NanoBanana → Imagen)
2. Add `google-genai` SDK to agent orchestrator
3. Implement Gemini text generation
4. Implement Imagen 3 image generation
5. Skip Veo 2 and Metorial for MVP (add later)

**Status**: RESEARCH COMPLETE - Ready to implement Google AI stack integration.
