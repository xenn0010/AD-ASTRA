## Runbook (MVP)

Prereqs: Docker, Convex project (env), ClickHouse (optional), Metabase (optional).

1. Configure env
   - `export BANDIT_SERVICE_URL=http://localhost:8000`
   - `export ASSIGNMENT_SIGNING_SECRET=change-me`

2. Start services
   - `docker compose -f ops/docker-compose.yml up --build`

3. Create variants
   - Use `orchestration/crew/main.py` to generate initial variants (placeholder).

4. Serve offers
   - Human: `GET http://localhost:8787/offer/{variantId}`
   - Agent: `GET http://localhost:8787/offer/{variantId}/ai.json`

5. Assign and events
   - Assign: `POST backend Convex /assign` (see backend/convex/http.ts)
   - Event: `POST backend Convex /event`

6. Export to ClickHouse (optional)
   - Use `integrations/sinks/clickhouse_exporter.ts` on a schedule.


