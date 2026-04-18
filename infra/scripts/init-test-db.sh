#!/bin/bash
set -e
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
  CREATE SCHEMA IF NOT EXISTS public;
  GRANT ALL PRIVILEGES ON DATABASE campaign_test TO postgres;
EOSQL
