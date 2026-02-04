/**
 * Database Service - PostgreSQL connection (basic setup for future use)
 * 
 * NOTE: This service is prepared for future backend integration.
 * Currently, the app uses static JSON files for places data.
 * 
 * When you're ready to integrate PostgreSQL:
 * 1. Install: npm install pg @types/pg
 * 2. Set environment variables: DATABASE_URL
 * 3. Uncomment the Pool initialization below
 */

// Future PostgreSQL configuration
export interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
  ssl?: boolean;
  max?: number; // Max pool connections
}

// Default configuration (for reference)
export const DEFAULT_DB_CONFIG: DatabaseConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'tripai',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
  ssl: process.env.DB_SSL === 'true',
  max: 20
};

/**
 * SQL Schema for places table (for future reference)
 */
export const PLACES_TABLE_SCHEMA = `
CREATE TABLE IF NOT EXISTS places (
  id SERIAL PRIMARY KEY,
  geoname_id INTEGER UNIQUE NOT NULL,
  name VARCHAR(200) NOT NULL,
  ascii_name VARCHAR(200) NOT NULL,
  country_code CHAR(2) NOT NULL,
  country_name_en VARCHAR(100) NOT NULL,
  country_name_vi VARCHAR(100) NOT NULL,
  latitude DECIMAL(10, 7) NOT NULL,
  longitude DECIMAL(10, 7) NOT NULL,
  population INTEGER DEFAULT 0,
  timezone VARCHAR(50),
  
  -- Full-text search vector
  search_vector TSVECTOR GENERATED ALWAYS AS (
    setweight(to_tsvector('simple', coalesce(name, '')), 'A') ||
    setweight(to_tsvector('simple', coalesce(ascii_name, '')), 'B')
  ) STORED,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for fast autocomplete
CREATE INDEX IF NOT EXISTS idx_places_search ON places USING GIN(search_vector);
CREATE INDEX IF NOT EXISTS idx_places_name ON places(ascii_name);
CREATE INDEX IF NOT EXISTS idx_places_country ON places(country_code);
CREATE INDEX IF NOT EXISTS idx_places_population ON places(population DESC);
`;

/**
 * Example query for autocomplete (PostgreSQL)
 */
export const AUTOCOMPLETE_QUERY = `
SELECT 
  geoname_id as id,
  name,
  ascii_name,
  country_code,
  country_name_en,
  country_name_vi,
  latitude as lat,
  longitude as lng,
  population
FROM places
WHERE 
  search_vector @@ plainto_tsquery('simple', $1)
  OR ascii_name ILIKE $2
ORDER BY 
  CASE WHEN ascii_name ILIKE $3 THEN 0 ELSE 1 END,
  population DESC
LIMIT $4;
`;

// ============================================================
// Uncomment below when ready to use PostgreSQL
// ============================================================

/*
import { Pool, PoolClient, QueryResult } from 'pg';

let pool: Pool | null = null;

export function initDatabase(config: DatabaseConfig = DEFAULT_DB_CONFIG): Pool {
  if (pool) return pool;

  pool = new Pool({
    host: config.host,
    port: config.port,
    database: config.database,
    user: config.user,
    password: config.password,
    ssl: config.ssl ? { rejectUnauthorized: false } : false,
    max: config.max
  });

  pool.on('error', (err) => {
    console.error('Unexpected database error:', err);
  });

  console.log('Database pool initialized');
  return pool;
}

export async function query<T = unknown>(
  text: string, 
  params?: unknown[]
): Promise<QueryResult<T>> {
  if (!pool) {
    throw new Error('Database not initialized. Call initDatabase() first.');
  }
  return pool.query<T>(text, params);
}

export async function getClient(): Promise<PoolClient> {
  if (!pool) {
    throw new Error('Database not initialized. Call initDatabase() first.');
  }
  return pool.connect();
}

export async function closeDatabase(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
    console.log('Database pool closed');
  }
}

// Health check
export async function checkConnection(): Promise<boolean> {
  try {
    const result = await query('SELECT NOW()');
    return result.rows.length > 0;
  } catch (error) {
    console.error('Database connection check failed:', error);
    return false;
  }
}

// Search places with full-text search
export async function searchPlacesDB(
  searchTerm: string,
  options: { limit?: number; countryCode?: string } = {}
): Promise<Place[]> {
  const { limit = 10, countryCode } = options;
  
  let queryText = AUTOCOMPLETE_QUERY;
  const params = [
    searchTerm,
    `%${searchTerm}%`,
    `${searchTerm}%`,
    limit
  ];

  if (countryCode) {
    queryText = queryText.replace('LIMIT $4', 'AND country_code = $5 LIMIT $4');
    params.splice(4, 0, countryCode);
  }

  const result = await query(queryText, params);
  return result.rows.map(row => ({
    id: row.id,
    name: row.name,
    asciiName: row.ascii_name,
    countryCode: row.country_code,
    country: {
      en: row.country_name_en,
      vi: row.country_name_vi
    },
    lat: parseFloat(row.lat),
    lng: parseFloat(row.lng),
    population: row.population
  }));
}
*/

// Placeholder exports for type checking
export const DATABASE_READY = false;
export const DATABASE_PLACEHOLDER = 'PostgreSQL integration prepared. See comments in this file for setup instructions.';
