# UK House Price Data Sources Research Report

**Research Date:** February 14, 2026

This document provides a comprehensive overview of available UK house price data sources, including API access, data formats, and limitations.

---

## 1. OpenStreetMap (OSM)

### Overview
OpenStreetMap is a global collaborative mapping project offering maps and map data with an open license. It provides building footprints and property boundaries but **does NOT contain house price data**.

### What Data is Available?
- Building footprints and geometries
- Property boundaries
- Address information (where tagged)
- Building types (residential, commercial, etc.)
- **NOT AVAILABLE:** House prices, transaction data, property valuations

### API Access

#### Overpass API
- **Purpose:** Query and extract OSM data based on custom criteria
- **Free:** Yes
- **Rate Limits:** Recommended to use with moderation; heavy usage may be throttled
- **Endpoint:** https://overpass-api.de/api/interpreter
- **Documentation:** https://wiki.openstreetmap.org/wiki/Overpass_API
- **Use Case:** Extract building data, property boundaries by location/area

#### Nominatim API
- **Purpose:** Geocoding and reverse geocoding (address lookup)
- **Free:** Yes
- **Rate Limits:** 1 request per second for free usage
- **Endpoint:** https://nominatim.openstreetmap.org/
- **Documentation:** https://nominatim.org/release-docs/latest/api/Search/
- **Use Case:** Convert addresses to coordinates and vice versa

### Key Limitations
- No price data whatsoever
- Data quality depends on community contributions
- UK coverage is generally good but variable
- Primarily useful for geospatial/mapping components, not pricing

### Recommended Usage
Use OSM for mapping property locations and boundaries, but combine with other sources (Land Registry) for price data.

---

## 2. Zoopla API

### Current Status (2026)
The **public Zoopla API has been retired**. Zoopla now offers partner APIs only for agents and software providers through commercial agreements.

### Official Zoopla Services (Requires Partnership)
- Client Feed/Export
- Real-Time Listings
- Leads API
- Premium Listing Upgrades
- **Access:** Requires commercial agreement with Zoopla/Hometrack

### What Data Was/Is Available?
- Current property listings (sale and rental)
- Asking prices
- Property descriptions and images
- Agent information
- Zoopla Estimates (valuation estimates)
- Historical sold prices
- Rental valuations
- Market statistics

### Alternative Access Methods

#### Third-Party Scraping Services (Paid)
1. **PropAPIS** (https://propapis.com/)
   - 99.9% uptime SLA
   - Comprehensive Zoopla data extraction
   - Pricing: Commercial/paid

2. **Apify** (https://apify.com/)
   - Zoopla Search Properties API
   - Extract listings by location and filters
   - Pricing: Pay-per-use

3. **ScrapingBee** (https://www.scrapingbee.com/)
   - Zoopla Scraper API
   - Free credits on signup
   - Pricing: Subscription-based

4. **ScraperAPI** (https://www.scraperapi.com/)
   - Handles anti-bot measures
   - Pricing: Subscription-based

### Rate Limits
Varies by third-party service provider. Official API terms unavailable publicly.

### Data Freshness
- Third-party scrapers: Real-time or near real-time (depends on scraping frequency)
- Historical data: Varies by provider

### Legal Considerations
Web scraping may violate Zoopla's Terms of Service. Commercial use requires legal review.

### Recommendation
**Not recommended** for free/open projects. Consider alternatives (Land Registry, ONS) for historical price data.

---

## 3. Rightmove

### Current Status (2026)
**No public API available.** Rightmove does not provide official API access for data extraction.

### What Data Exists?
- Current property listings (sale and rental)
- Asking prices
- Property details (bedrooms, bathrooms, type, etc.)
- Agent information
- Property images and descriptions
- Location data

### Access Methods

#### Internal/Hidden APIs
Rightmove uses internal REST endpoints (e.g., `/api/_search`) for its own website functionality. These are:
- **Not officially documented**
- **Not supported for third-party use**
- Subject to change without notice
- May violate Terms of Service

#### Web Scraping
- Rightmove uses JavaScript to render data
- Data stored in JavaScript variables within HTML
- Scraping requires handling dynamic content

### Third-Party Scraping Services (Paid)
1. **ScraperAPI** (https://www.scraperapi.com/solutions/rightmove-scraper/)
2. **ScrapingBee** (https://www.scrapingbee.com/scrapers/rightmove-api/)
3. **Apify** (https://apify.com/epctex/rightmove-scraper/)
4. **ZenRows** (https://www.zenrows.com/products/scraper-api/realestate/rightmove)
5. **Bright Data** (https://brightdata.com/products/web-scraper/rightmove)

### Open-Source Tools
- **rightmove_webscraper.py** (GitHub: toby-p/rightmove_webscraper.py)
  - Python class for scraping Rightmove
  - Returns data as pandas DataFrame
  - Free but requires technical expertise

### Legal Considerations
- **Terms of Service:** Scraping may violate Rightmove's ToS
- **Legal Risk:** Especially for commercial use
- **Recommendation:** Consult legal counsel before scraping

### Rate Limits
No official limits (no official API). Third-party services handle rate limiting internally.

### Data Freshness
Real-time (current listings only). No official historical price data.

### Recommendation
**Not recommended** for legitimate open projects due to legal risks. Use Land Registry for historical sold prices instead.

---

## 4. HM Land Registry Price Paid Data

### Overview
**The gold standard for UK house price data.** Official government source for actual transaction prices in England and Wales.

### Free/Open Access
**YES - Completely free** under the Open Government Licence v3.0 (OGL)

### What Data is Available?
- **Transaction prices** (actual sale prices, not asking prices)
- **Property addresses** (including postcode)
- **Transaction dates**
- **Property type** (Detached, Semi-detached, Terraced, Flat/Maisonette)
- **New build flag** (Y/N)
- **Estate type** (Freehold/Leasehold)
- **PAON** (Primary Addressable Object Name - house number/name)
- **SAON** (Secondary Addressable Object Name - flat number)
- **Street, locality, town, district, county**

### Data Coverage
- **Geographic:** England and Wales only
- **Time Period:** January 1995 to present
- **Volume:** 24+ million records
- **Updates:** Monthly (data typically 2-3 months behind)

### Access Methods

#### 1. Bulk Download (CSV)
- **URL:** https://www.gov.uk/government/statistical-data-sets/price-paid-data-downloads
- **Format:** CSV files
- **Size:** 115 MB - 230 MB per file
- **Options:**
  - Single CSV (complete dataset)
  - Yearly CSV files
  - Monthly updates
- **Last Update:** January 29, 2026 (includes December 2025 data)

#### 2. SPARQL API (Linked Data)
- **Endpoint:** https://landregistry.data.gov.uk/landregistry/sparql
- **Query Language:** SPARQL
- **Console:** https://landregistry.data.gov.uk/qonsole
- **Response Formats:** JSON, XML, Turtle, plain text
- **Rate Limits:** Not officially documented (use responsibly)
- **Documentation:** https://landregistry.data.gov.uk/

#### 3. UK House Price Index (UKHPI) API
- **Purpose:** Query aggregated house price statistics
- **Endpoint:** https://landregistry.data.gov.uk/app/ukhpi/
- **Format:** JSON, CSV, Turtle
- **Rate Limits:** Not officially documented
- **Use Case:** Regional trends, average prices, index values

#### 4. Interactive Query Builder
- **URL:** https://landregistry.data.gov.uk/app/ppd/
- **Features:** Build custom reports by location, property type, price range, date range
- **Export:** CSV download

### Data Fields (CSV Format)
```csv
Transaction unique identifier, Price, Date of Transfer, Postcode, Property Type,
Old/New, Duration, PAON, SAON, Street, Locality, Town/City, District, County,
PPD Category Type, Record Status
```

### Property Types
- `D` - Detached
- `S` - Semi-detached
- `T` - Terraced
- `F` - Flat/Maisonette
- `O` - Other

### Estate Types
- `F` - Freehold
- `L` - Leasehold

### Rate Limits
- **Bulk Downloads:** No limits (files hosted on GOV.UK)
- **SPARQL API:** No official rate limits published; recommended to use responsibly
- **Best Practice:** Download bulk data for large-scale analysis rather than making many API calls

### Data Freshness
- **Update Frequency:** Monthly
- **Lag Time:** Approximately 2-3 months behind current date
- **Latest Available (as of Feb 2026):** December 2025 transactions

### Key Limitations
- **Geographic:** England and Wales only (excludes Scotland and Northern Ireland)
- **Delay:** 2-3 month lag in data publication
- **Excluded Transactions:**
  - Commercial properties
  - Properties sold for less than £100 (to exclude non-market transfers)
  - Transfers under power of sale/repossessions
  - Buy-to-let sales (may be included but not flagged)
- **No Property Details:** Square footage, number of bedrooms, condition, etc. not included

### Recommendation
**HIGHLY RECOMMENDED.** This should be your primary data source for UK house prices. It's free, comprehensive, official, and legally unambiguous.

---

## 5. Other Free/Open Data Sources

### A. Office for National Statistics (ONS) - House Price Index

**URL:** https://www.ons.gov.uk/economy/inflationandpriceindices/datasets/housepriceindexmonthlyquarterlytables1to19

**Free:** Yes

**What Data:**
- Quarterly house price statistics
- Average prices by region
- House price indices
- Year-on-year changes

**Format:** XLSX (Excel)

**Update Frequency:** Quarterly

**Latest:** March 2026 data available

**Coverage:** UK-wide (includes Scotland and Northern Ireland, unlike Land Registry)

**Use Case:** Aggregate statistics, regional trends, economic analysis

**Limitations:**
- No individual transaction data
- Aggregate/statistical data only
- Less granular than Land Registry

---

### B. UK House Price Index (UKHPI)

**URL:** https://landregistry.data.gov.uk/app/ukhpi/

**Free:** Yes (Open Government Licence)

**What Data:**
- House price index values
- Average prices by region/area
- Sales volumes
- Monthly and annual changes
- Available from January 2005

**API Access:** Yes
- Query via SPARQL or direct API
- JSON, CSV, XML formats

**Coverage:** UK-wide (England, Wales, Scotland, Northern Ireland)

**Update Frequency:** Monthly

**Latest (as of Feb 2026):** January 2026 data
- UK average house price: £269,800 (up 1.2% year-on-year)

**Use Case:** Regional price trends, market analysis, price indices

**Limitations:**
- Aggregated data (not individual transactions)
- Less detailed than Price Paid Data

---

### C. Energy Performance Certificate (EPC) Data

**URL:** https://epc.opendatacommunities.org/

**Free:** Yes (Open Government Licence)

**What Data:**
- Energy efficiency ratings (A-G bands)
- Property characteristics (walls, roof, heating, windows)
- Floor area (in square meters)
- Property type
- Address and postcode
- Certificate issue date
- **Does NOT include sale prices**

**API Access:** Yes
1. **Domestic Certificates API:** Retrieve full EPC details by LMK key
2. **Search API:** Search and filter EPCs by attributes

**API Documentation:** https://www.api.gov.uk/mhclg/energy-performance-certificates-domestic-buildings-search-api/

**Coverage:** England and Wales

**Update Frequency:** Monthly (last updated January 30, 2026; includes certificates up to December 31, 2025)

**Data History:** Certificates dating back to 1990

**Use Case:**
- Supplement Land Registry data with property characteristics
- Calculate price per square meter
- Energy efficiency analysis

**How to Link with Price Data:**
Join EPC data with Land Registry Price Paid Data using address/postcode matching. This gives you:
- Sale price + floor area = price per square meter
- Sale price + property characteristics (bedrooms, energy rating, etc.)

**Rate Limits:** Not officially documented; use responsibly

**Recommendation:** **HIGHLY RECOMMENDED** as a supplement to Land Registry data. Provides property characteristics that Land Registry doesn't include.

---

### D. Property Data API Providers (Commercial)

While not free, these services aggregate multiple data sources and provide convenient APIs:

1. **PropertyData** (https://propertydata.co.uk/api)
   - Real-time property analytics
   - Historical prices, rental yields, demographics
   - Pricing: Paid plans from £29/month

2. **Property Checker** (https://propertychecker.co.uk/property-data-api/)
   - JSON API
   - Sold prices, tenure data
   - Sources: HM Land Registry + third-party data

3. **PaTMa** (https://www.patma.co.uk/property-data-api/)
   - Current and historical prices
   - Price per floor area
   - Custom area searches

4. **Street Data** (https://data.street.co.uk/)
   - 150+ data points
   - 29 million addresses (England & Wales)
   - Pricing: Commercial

---

## Summary Table: Quick Comparison

| Source | Free? | API Access | Price Data | Data Freshness | Best For |
|--------|-------|------------|------------|----------------|----------|
| **OpenStreetMap** | Yes | Yes (Overpass, Nominatim) | No | Real-time | Mapping, geolocation |
| **Zoopla** | No | Unofficial (scraping) | Yes (asking prices) | Real-time | Current listings (risk) |
| **Rightmove** | No | Unofficial (scraping) | Yes (asking prices) | Real-time | Current listings (risk) |
| **Land Registry PPD** | Yes | Yes (SPARQL, CSV) | Yes (sold prices) | 2-3 months lag | **Primary price data** |
| **UKHPI** | Yes | Yes | Yes (aggregated) | Monthly | Regional trends |
| **ONS** | Yes | No (XLSX download) | Yes (aggregated) | Quarterly | UK-wide statistics |
| **EPC Data** | Yes | Yes | No | Monthly | Property characteristics |

---

## Recommended Approach for a House Price Application

### For Maximum Value with Free/Open Data:

1. **Core Price Data:** HM Land Registry Price Paid Data
   - Download monthly CSV files or use SPARQL API
   - Provides actual transaction prices

2. **Property Characteristics:** EPC Data API
   - Link by address/postcode to PPD
   - Adds floor area, energy rating, property features

3. **Geolocation:** OpenStreetMap
   - Nominatim for geocoding addresses to coordinates
   - Overpass API for building boundaries
   - Free mapping tiles for visualization

4. **Regional Trends:** UK House Price Index API
   - Add context with regional averages and indices

5. **Supplementary Statistics:** ONS House Price Data
   - UK-wide coverage (includes Scotland, NI)
   - Quarterly aggregate trends

### What You Get:
- **Sold prices** (not just asking prices)
- **Property characteristics** (size, energy rating, type)
- **Geographic data** (coordinates, boundaries)
- **Regional trends** (market context)
- **Completely free and legal**

### What You Don't Get (Without Paid Services):
- Current listings (properties for sale now)
- Asking prices for active listings
- Estate agent information
- Property photos
- Real-time market data

---

## Legal and Ethical Considerations

### Recommended (Legal and Safe):
- HM Land Registry Price Paid Data (OGL license)
- UK House Price Index (OGL license)
- ONS Data (OGL license)
- EPC Data (OGL license)
- OpenStreetMap (ODbL license)

### Not Recommended (Legal Risk):
- Scraping Zoopla (violates ToS)
- Scraping Rightmove (violates ToS)
- Using unofficial APIs without permission

### If You Must Use Commercial Sources:
- Use official partner APIs (Zoopla partnership)
- Use licensed third-party data providers (PropertyData, etc.)
- Consult legal counsel for commercial use
- Review Terms of Service carefully

---

## Rate Limits Summary

| Source | Rate Limit | Notes |
|--------|------------|-------|
| Land Registry (CSV) | None | Bulk downloads |
| Land Registry (SPARQL) | Not documented | Use responsibly |
| UKHPI API | Not documented | Use responsibly |
| EPC API | Not documented | Use responsibly |
| Nominatim | 1 req/sec | For free usage |
| Overpass API | Not strict | Throttled if excessive |
| ONS | None | Static file downloads |

**Best Practice:** For large-scale analysis, use bulk downloads rather than hammering APIs with thousands of requests.

---

## Data Update Frequencies

| Source | Update Frequency | Typical Lag |
|--------|------------------|-------------|
| Land Registry PPD | Monthly | 2-3 months |
| UKHPI | Monthly | ~1 month |
| ONS | Quarterly | ~1-2 months |
| EPC Data | Monthly | ~1 month |
| OpenStreetMap | Real-time | None (community-driven) |

---

## Geographic Coverage

| Source | England | Wales | Scotland | N. Ireland |
|--------|---------|-------|----------|------------|
| Land Registry PPD | Yes | Yes | No | No |
| UKHPI | Yes | Yes | Yes | Yes |
| ONS | Yes | Yes | Yes | Yes |
| EPC Data | Yes | Yes | No | No |
| OpenStreetMap | Yes | Yes | Yes | Yes |

**Note:** For Scotland, use Registers of Scotland (RoS). For Northern Ireland, use Land & Property Services (LPS).

---

## Additional Resources

### Official UK Government Links:
- HM Land Registry Open Data: https://landregistry.data.gov.uk/
- GOV.UK Price Paid Data: https://www.gov.uk/government/statistical-data-sets/price-paid-data-downloads
- UK House Price Index: https://landregistry.data.gov.uk/app/ukhpi/
- EPC Open Data: https://epc.opendatacommunities.org/
- ONS Housing Data: https://www.ons.gov.uk/economy/inflationandpriceindices

### OpenStreetMap:
- Overpass API: https://wiki.openstreetmap.org/wiki/Overpass_API
- Nominatim: https://nominatim.org/
- Overpass Turbo (Interactive): https://overpass-turbo.eu/

### API Documentation:
- HM Land Registry SPARQL: https://landregistry.data.gov.uk/landregistry/sparql
- EPC Search API: https://www.api.gov.uk/mhclg/energy-performance-certificates-domestic-buildings-search-api/
- UK Government API Catalogue: https://www.api.gov.uk/

---

## Current Market Context (February 2026)

From recent data:
- **UK Average House Price:** £269,800 (January 2026)
- **Annual Change:** +1.2% (year-on-year)
- **Regional Star Performer:** North West England
  - 6 of top 10 growth postcodes
  - Wigan and Liverpool leading
  - Average sale times: 32-33 days
  - Prices below UK average (affordability factor)

Source: Zoopla House Price Index (January 2026)

---

## Conclusion

For a UK house price mapping/analysis project:

**Best Free Stack:**
1. **HM Land Registry Price Paid Data** (core price data)
2. **EPC Data** (property characteristics)
3. **OpenStreetMap** (geolocation and mapping)
4. **UKHPI API** (regional context)

This combination provides:
- Comprehensive historical price data
- Property details and characteristics
- Geographic visualization capabilities
- Legal, free, and unlimited access
- No rate limiting concerns for reasonable use

**Avoid:**
- Scraping Zoopla or Rightmove (legal risks)
- Unofficial APIs (unreliable, may violate ToS)

**Consider Paid Services If:**
- You need current listings (properties for sale now)
- You need asking prices (not just sold prices)
- You need photos and agent information
- Budget allows commercial API subscriptions

---

**Report Compiled:** February 14, 2026
**Next Review:** Recommended quarterly to check for API changes
