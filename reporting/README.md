## Metabase Setup (MVP)

1. Connect Metabase to ClickHouse (HTTP): database `ad_astra`.
2. Run `models.sql` to create views.
3. Create dashboard:
   - Cards from `metrics_by_variant` (CTR, CVR by segment/variant)
   - Time series of conversions (events filter type = convert)
   - Invalid traffic rate once populated


