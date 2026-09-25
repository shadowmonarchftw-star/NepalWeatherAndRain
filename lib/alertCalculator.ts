import { ForecastRainBand } from "./types";

/**
 * Plain rain-amount bands for Open-Meteo model forecasts (today's total, Nepal time).
 * These are NOT DHM warning levels; they only describe how much rain the model forecasts.
 * Same bands as the map legend.
 */
export function forecastRainBand(rainTodayMm: number): ForecastRainBand {
  if (rainTodayMm >= 100) return "veryHeavy";
  if (rainTodayMm >= 50) return "heavy";
  if (rainTodayMm >= 25) return "moderate";
  return "light";
}

export const RAIN_BAND_LABEL: Record<ForecastRainBand, { en: string; np: string; range: string }> = {
  veryHeavy: { en: "Very heavy rain", np: "धेरै भारी वर्षा", range: "100+ mm" },
  heavy: { en: "Heavy rain", np: "भारी वर्षा", range: "50–100 mm" },
  moderate: { en: "Moderate rain", np: "मध्यम वर्षा", range: "25–50 mm" },
  light: { en: "Light / no rain", np: "हल्का / वर्षा छैन", range: "< 25 mm" },
};

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
