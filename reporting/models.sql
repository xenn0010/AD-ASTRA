-- ClickHouse views for Ad-Astra reporting

CREATE OR REPLACE VIEW ad_astra.events_enriched AS
SELECT
  id,
  type,
  campaign_id,
  variant_id,
  segment,
  assignment_id,
  ts,
  value
FROM ad_astra.events;

CREATE OR REPLACE VIEW ad_astra.metrics_by_variant AS
SELECT
  campaign_id,
  variant_id,
  segment,
  countIf(type = 'impression') AS impressions,
  countIf(type = 'click') AS clicks,
  countIf(type = 'convert') AS conversions,
  if(impressions = 0, 0, clicks / impressions) AS ctr,
  if(clicks = 0, 0, conversions / clicks) AS cvr
FROM ad_astra.events
GROUP BY campaign_id, variant_id, segment;


