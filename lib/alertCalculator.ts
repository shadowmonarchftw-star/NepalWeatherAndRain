import { DHMAlertLevel } from "./types";

/**
 * Department of Hydrology & Meteorology (DHM) Nepal rainfall criteria:
 * < 25mm / 24h  => Normal (Green)
 * 25-50mm / 24h => Watch (Yellow)
 * 50-100mm / 24h => Warning (Orange)
 * > 100mm / 24h => Danger (Crimson / Red)
 */
export function calculateDHMAlertLevel(
  rain24hMm: number,
  maxHourlyMm: number = 0,
  vulnerability: "Very High" | "High" | "Medium" | "Moderate" = "High"
): {
  level: DHMAlertLevel;
  flashFloodScore: number;
  landslideScore: number;
  primaryThreat: string;
  badgeColor: string;
  borderColor: string;
  textColor: string;
} {
  // Base scores derived from 24h accumulation
  let floodScore = Math.min(100, Math.round((rain24hMm / 120) * 100));
  let slideScore = Math.min(100, Math.round((rain24hMm / 130) * 100));

  // Convective cloudburst amplification (>20mm in a single hour)
  if (maxHourlyMm >= 25) {
    floodScore = Math.min(100, floodScore + 25);
    slideScore = Math.min(100, slideScore + 30);
  } else if (maxHourlyMm >= 15) {
    floodScore = Math.min(100, floodScore + 15);
    slideScore = Math.min(100, slideScore + 15);
  }

  // Terrain vulnerability factor
  const vulnWeight = vulnerability === "Very High" ? 1.25 : vulnerability === "High" ? 1.1 : 0.9;
  floodScore = Math.min(100, Math.round(floodScore * vulnWeight));
  slideScore = Math.min(100, Math.round(slideScore * vulnWeight));

  let level: DHMAlertLevel = "Normal";
  let primaryThreat = "Minor surface runoff";
  let badgeColor = "bg-emerald-500/20 text-emerald-400 border-emerald-500/40";
  let borderColor = "border-emerald-600";
  let textColor = "text-emerald-400";

  if (rain24hMm >= 100 || maxHourlyMm >= 25 || floodScore >= 80) {
    level = "Danger";
    primaryThreat = "Severe Flash Flooding & Torrential Mudslides";
    badgeColor = "bg-crimson text-white border-red-500 shadow-lg shadow-crimson/30 animate-pulse";
    borderColor = "border-crimson";
    textColor = "text-crimson";
  } else if (rain24hMm >= 50 || maxHourlyMm >= 15 || floodScore >= 60) {
    level = "Warning";
    primaryThreat = "High River Inundation & Slope Landslides";
    badgeColor = "bg-amber-500/20 text-amber-300 border-amber-500/40";
    borderColor = "border-amber-500";
    textColor = "text-amber-400";
  } else if (rain24hMm >= 25 || floodScore >= 40) {
    level = "Watch";
    primaryThreat = "Waterlogging in lowlands & roadside erosion";
    badgeColor = "bg-yellow-500/20 text-yellow-300 border-yellow-500/40";
    borderColor = "border-yellow-500";
    textColor = "text-yellow-400";
  }

  return {
    level,
    flashFloodScore: floodScore,
    landslideScore: slideScore,
    primaryThreat,
    badgeColor,
    borderColor,
    textColor,
  };
}

/**
 * Translate WMO Weather Interpretation Codes to friendly text & icons
 */
export function interpretWmoCode(code: number): {
  description: string;
  nepaliDescription: string;
  iconName: string;
  isRaining: boolean;
} {
  switch (code) {
    case 0:
      return { description: "Clear Sky", nepaliDescription: "सफा आकाश", iconName: "Sun", isRaining: false };
    case 1:
      return { description: "Mainly Clear", nepaliDescription: "मुख्यतया सफा", iconName: "SunCloud", isRaining: false };
    case 2:
      return { description: "Partly Cloudy", nepaliDescription: "आंशिक बदली", iconName: "CloudSun", isRaining: false };
    case 3:
      return { description: "Overcast / Cloud Deck", nepaliDescription: "पूर्ण बदली", iconName: "Cloud", isRaining: false };
    case 45:
    case 48:
      return { description: "Dense Fog / Mist", nepaliDescription: "बाक्लो हुस्सु / कुहिरो", iconName: "CloudFog", isRaining: false };
    case 51:
    case 53:
    case 55:
      return { description: "Drizzle / Light Sprinkles", nepaliDescription: "हल्का सिमसिम पानी", iconName: "CloudDrizzle", isRaining: true };
    case 61:
      return { description: "Slight Rain", nepaliDescription: "हल्का वर्षा", iconName: "CloudRain", isRaining: true };
    case 63:
      return { description: "Moderate Rain", nepaliDescription: "मध्यम वर्षा", iconName: "CloudRain", isRaining: true };
    case 65:
      return { description: "Heavy Downpour", nepaliDescription: "भारी वर्षा", iconName: "CloudRain", isRaining: true };
    case 80:
    case 81:
    case 82:
      return { description: "Torrential Rain Showers", nepaliDescription: "मुसलधारे वर्षा", iconName: "CloudRain", isRaining: true };
    case 95:
      return { description: "Thunderstorm", nepaliDescription: "चट्याङसहित वर्षा", iconName: "CloudLightning", isRaining: true };
    case 96:
    case 99:
      return { description: "Severe Thunderstorm with Hail", nepaliDescription: "असिनासहितको भीषण चट्याङ", iconName: "CloudLightning", isRaining: true };
    default:
      return { description: "Rain Cloud Activity", nepaliDescription: "बादल र वर्षा", iconName: "CloudRain", isRaining: true };
  }
}
