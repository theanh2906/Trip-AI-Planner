/**
 * Script to download GeoNames cities data and generate JSON file for Asia-Pacific region
 * 
 * Usage: npx tsx scripts/generate-places.ts
 * 
 * Data source: https://download.geonames.org/export/dump/
 */

import * as fs from 'fs';
import * as path from 'path';
import * as https from 'https';
import * as http from 'http';
import { createWriteStream, existsSync, mkdirSync, createReadStream, unlinkSync } from 'fs';
import { createUnzip } from 'zlib';
import { createInterface } from 'readline';

// Asia-Pacific country codes
const ASIA_PACIFIC_COUNTRIES = new Set([
  // ASEAN
  'VN', 'TH', 'SG', 'MY', 'ID', 'PH', 'MM', 'KH', 'LA', 'BN', 'TL',
  // East Asia
  'JP', 'KR', 'CN', 'TW', 'HK', 'MO', 'MN',
  // South Asia
  'IN', 'BD', 'LK', 'NP', 'PK', 'BT', 'MV',
  // Oceania
  'AU', 'NZ', 'FJ', 'PG', 'WS', 'TO', 'VU', 'SB', 'NC', 'PF', 'GU'
]);

// Country names mapping
const COUNTRY_NAMES: Record<string, Record<string, string>> = {
  'VN': { en: 'Vietnam', vi: 'Việt Nam' },
  'TH': { en: 'Thailand', vi: 'Thái Lan' },
  'SG': { en: 'Singapore', vi: 'Singapore' },
  'MY': { en: 'Malaysia', vi: 'Malaysia' },
  'ID': { en: 'Indonesia', vi: 'Indonesia' },
  'PH': { en: 'Philippines', vi: 'Philippines' },
  'MM': { en: 'Myanmar', vi: 'Myanmar' },
  'KH': { en: 'Cambodia', vi: 'Campuchia' },
  'LA': { en: 'Laos', vi: 'Lào' },
  'BN': { en: 'Brunei', vi: 'Brunei' },
  'TL': { en: 'Timor-Leste', vi: 'Đông Timor' },
  'JP': { en: 'Japan', vi: 'Nhật Bản' },
  'KR': { en: 'South Korea', vi: 'Hàn Quốc' },
  'CN': { en: 'China', vi: 'Trung Quốc' },
  'TW': { en: 'Taiwan', vi: 'Đài Loan' },
  'HK': { en: 'Hong Kong', vi: 'Hồng Kông' },
  'MO': { en: 'Macau', vi: 'Ma Cao' },
  'MN': { en: 'Mongolia', vi: 'Mông Cổ' },
  'IN': { en: 'India', vi: 'Ấn Độ' },
  'BD': { en: 'Bangladesh', vi: 'Bangladesh' },
  'LK': { en: 'Sri Lanka', vi: 'Sri Lanka' },
  'NP': { en: 'Nepal', vi: 'Nepal' },
  'PK': { en: 'Pakistan', vi: 'Pakistan' },
  'BT': { en: 'Bhutan', vi: 'Bhutan' },
  'MV': { en: 'Maldives', vi: 'Maldives' },
  'AU': { en: 'Australia', vi: 'Úc' },
  'NZ': { en: 'New Zealand', vi: 'New Zealand' },
  'FJ': { en: 'Fiji', vi: 'Fiji' },
  'PG': { en: 'Papua New Guinea', vi: 'Papua New Guinea' },
  'WS': { en: 'Samoa', vi: 'Samoa' },
  'TO': { en: 'Tonga', vi: 'Tonga' },
  'VU': { en: 'Vanuatu', vi: 'Vanuatu' },
  'SB': { en: 'Solomon Islands', vi: 'Quần đảo Solomon' },
  'NC': { en: 'New Caledonia', vi: 'New Caledonia' },
  'PF': { en: 'French Polynesia', vi: 'Polynesia thuộc Pháp' },
  'GU': { en: 'Guam', vi: 'Guam' },
};

interface Place {
  id: number;
  name: string;
  asciiName: string;
  countryCode: string;
  country: { en: string; vi: string };
  admin1: string;
  lat: number;
  lng: number;
  population: number;
  timezone: string;
}

const GEONAMES_URL = 'https://download.geonames.org/export/dump/cities5000.zip';
const TEMP_DIR = path.join(process.cwd(), 'temp');
const OUTPUT_DIR = path.join(process.cwd(), 'public', 'data');
const ZIP_FILE = path.join(TEMP_DIR, 'cities5000.zip');
const TXT_FILE = path.join(TEMP_DIR, 'cities5000.txt');

async function downloadFile(url: string, dest: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!existsSync(path.dirname(dest))) {
      mkdirSync(path.dirname(dest), { recursive: true });
    }

    const file = createWriteStream(dest);
    const protocol = url.startsWith('https') ? https : http;

    protocol.get(url, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        const redirectUrl = response.headers.location;
        if (redirectUrl) {
          downloadFile(redirectUrl, dest).then(resolve).catch(reject);
          return;
        }
      }

      const total = parseInt(response.headers['content-length'] || '0', 10);
      let downloaded = 0;

      response.on('data', (chunk) => {
        downloaded += chunk.length;
        const percent = total ? Math.round((downloaded / total) * 100) : 0;
        process.stdout.write(`\rDownloading: ${percent}%`);
      });

      response.pipe(file);

      file.on('finish', () => {
        file.close();
        console.log('\nDownload complete!');
        resolve();
      });
    }).on('error', (err) => {
      unlinkSync(dest);
      reject(err);
    });
  });
}

async function unzipFile(zipPath: string, outputDir: string): Promise<string> {
  try {
    // Dynamic import for ES modules compatibility
    const AdmZip = (await import('adm-zip')).default;
    const zip = new AdmZip(zipPath);
    zip.extractAllTo(outputDir, true);
    console.log('Unzip complete!');
    return path.join(outputDir, 'cities5000.txt');
  } catch (error) {
    throw error;
  }
}

async function parseGeoNamesFile(filePath: string): Promise<Place[]> {
  const places: Place[] = [];

  const fileStream = createReadStream(filePath);
  const rl = createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  console.log('Parsing GeoNames data...');
  let lineCount = 0;

  for await (const line of rl) {
    lineCount++;
    if (lineCount % 10000 === 0) {
      process.stdout.write(`\rProcessed ${lineCount} lines...`);
    }

    const fields = line.split('\t');
    if (fields.length < 19) continue;

    const [
      geonameId,      // 0
      name,           // 1
      asciiName,      // 2
      alternateNames, // 3
      latitude,       // 4
      longitude,      // 5
      featureClass,   // 6
      featureCode,    // 7
      countryCode,    // 8
      cc2,            // 9
      admin1Code,     // 10
      admin2Code,     // 11
      admin3Code,     // 12
      admin4Code,     // 13
      population,     // 14
      elevation,      // 15
      dem,            // 16
      timezone,       // 17
      modificationDate // 18
    ] = fields;

    // Filter only Asia-Pacific countries
    if (!ASIA_PACIFIC_COUNTRIES.has(countryCode)) continue;

    // Only include populated places
    if (featureClass !== 'P') continue;

    const countryName = COUNTRY_NAMES[countryCode] || { en: countryCode, vi: countryCode };

    places.push({
      id: parseInt(geonameId),
      name: name,
      asciiName: asciiName,
      countryCode: countryCode,
      country: countryName,
      admin1: admin1Code,
      lat: parseFloat(latitude),
      lng: parseFloat(longitude),
      population: parseInt(population) || 0,
      timezone: timezone
    });
  }

  console.log(`\nParsed ${places.length} places in Asia-Pacific region`);
  return places;
}

function sortAndFilterPlaces(places: Place[]): Place[] {
  // Sort by population (descending) to prioritize larger cities
  return places
    .sort((a, b) => b.population - a.population)
    .map(({ id, name, asciiName, countryCode, country, lat, lng, population }) => ({
      id,
      name,
      asciiName,
      countryCode,
      country,
      admin1: '', // Remove to reduce file size
      lat: Math.round(lat * 10000) / 10000, // Round to 4 decimal places
      lng: Math.round(lng * 10000) / 10000,
      population,
      timezone: '' // Remove to reduce file size
    }));
}

async function main() {
  console.log('=== GeoNames Asia-Pacific Places Generator ===\n');

  // Create directories
  if (!existsSync(TEMP_DIR)) mkdirSync(TEMP_DIR, { recursive: true });
  if (!existsSync(OUTPUT_DIR)) mkdirSync(OUTPUT_DIR, { recursive: true });

  // Step 1: Download
  if (!existsSync(ZIP_FILE)) {
    console.log('Step 1: Downloading cities5000.zip...');
    await downloadFile(GEONAMES_URL, ZIP_FILE);
  } else {
    console.log('Step 1: Using cached cities5000.zip');
  }

  // Step 2: Unzip
  if (!existsSync(TXT_FILE)) {
    console.log('\nStep 2: Extracting zip file...');
    await unzipFile(ZIP_FILE, TEMP_DIR);
  } else {
    console.log('\nStep 2: Using cached cities5000.txt');
  }

  // Step 3: Parse and filter
  console.log('\nStep 3: Parsing and filtering Asia-Pacific cities...');
  const places = await parseGeoNamesFile(TXT_FILE);

  // Step 4: Sort and optimize
  console.log('\nStep 4: Sorting and optimizing data...');
  const optimizedPlaces = sortAndFilterPlaces(places);

  // Step 5: Generate JSON files
  console.log('\nStep 5: Generating JSON files...');

  // Full file
  const fullOutputPath = path.join(OUTPUT_DIR, 'places-asia-pacific.json');
  fs.writeFileSync(fullOutputPath, JSON.stringify(optimizedPlaces, null, 0));
  const fullSize = fs.statSync(fullOutputPath).size;
  console.log(`  - Full: ${fullOutputPath} (${(fullSize / 1024 / 1024).toFixed(2)} MB, ${optimizedPlaces.length} places)`);

  // Popular cities (top 1000 by population)
  const popularPlaces = optimizedPlaces.slice(0, 1000);
  const popularOutputPath = path.join(OUTPUT_DIR, 'places-popular.json');
  fs.writeFileSync(popularOutputPath, JSON.stringify(popularPlaces, null, 0));
  const popularSize = fs.statSync(popularOutputPath).size;
  console.log(`  - Popular: ${popularOutputPath} (${(popularSize / 1024).toFixed(2)} KB, ${popularPlaces.length} places)`);

  // Stats by country
  console.log('\n=== Statistics by Country ===');
  const countryStats: Record<string, number> = {};
  for (const place of optimizedPlaces) {
    countryStats[place.countryCode] = (countryStats[place.countryCode] || 0) + 1;
  }
  
  Object.entries(countryStats)
    .sort((a, b) => b[1] - a[1])
    .forEach(([code, count]) => {
      const name = COUNTRY_NAMES[code]?.en || code;
      console.log(`  ${code}: ${count} cities (${name})`);
    });

  console.log('\n=== Done! ===');
  console.log('Generated files in public/data/');
  console.log('You can now delete the temp/ folder');
}

main().catch(console.error);
