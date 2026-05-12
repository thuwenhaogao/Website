window.SITE_CONFIG = {
  // Deploy worker/ to Cloudflare Workers, then paste its public URL here.
  // Example: "https://wenhao-visits.your-subdomain.workers.dev"
  VISITOR_API_BASE_URL: "",
  SHOW_DEMO_VISITS: true,
  DEMO_VISITOR_POINTS: [
    { label: "Beijing", city: "Beijing", region: "Beijing", countryCode: "CN", latitude: 39.9042, longitude: 116.4074, count: 2 },
    { label: "Hong Kong", city: "Hong Kong", region: "Hong Kong", countryCode: "HK", latitude: 22.3193, longitude: 114.1694, count: 2 },
    { label: "Guangdong / Guangzhou", city: "Guangzhou", region: "Guangdong", countryCode: "CN", latitude: 23.1291, longitude: 113.2644, count: 1 },
    { label: "Guangdong / Shenzhen", city: "Shenzhen", region: "Guangdong", countryCode: "CN", latitude: 22.5431, longitude: 114.0579, count: 1 }
  ]
};
