export type DHMAlertLevel = "Normal" | "Watch" | "Warning" | "Danger";

export interface CurrentWeather {
  temperature: number;
  relativeHumidity: number;
  precipitation: number; // mm in current hour
  rain: number;
  weatherCode: number;
  cloudCover: number;
  surfacePressure: number;
  windSpeed: number; // km/h
  windDirection: number;
  windGusts: number;
  time: string;
}

export interface HourlyForecast {
  time: string[];
  temperature: number[];
  precipitation: number[]; // mm/hr
  precipitationProbability: number[]; // %
  cloudCover: number[];
  surfacePressure: number[];
  windSpeed: number[];
  windGusts: number[];
}

export interface DailyForecast {
  time: string[];
  weatherCode: number[];
  temperatureMax: number[];
  temperatureMin: number[];
  precipitationSum: number[]; // mm/day
  precipitationProbabilityMax: number[];
  windSpeedMax: number[];
}

export interface DistrictWeatherSummary {
  districtId: string;
  districtName: string;
  nepaliName: string;
  provinceId: number;
  provinceName: string;
  lat: number;
  lon: number;
  elevation: number;
  basin: string;
  current: CurrentWeather;
  hourly: HourlyForecast;
  daily: DailyForecast;
  total24hRain: number; // mm
  total48hRain: number; // mm
  total72hRain: number; // mm
  alertLevel: DHMAlertLevel;
  flashFloodRiskScore: number; // 0-100
  landslideRiskScore: number; // 0-100
  primaryThreat: string;
}

export interface RadarFrame {
  time: number;
  path: string;
}

export interface RainViewerData {
  host: string;
  radarPast: RadarFrame[];
  radarNowcast: RadarFrame[];
  satellite: RadarFrame[];
}

export interface NDRRMAAlert {
  id: number;
  title: string;
  titleNe: string;
  source: string;
  referenceType: string;
  startedOn: string;
  expireOn?: string;
  lat: number;
  lon: number;
  description?: string;
  householdCount?: number;
}
