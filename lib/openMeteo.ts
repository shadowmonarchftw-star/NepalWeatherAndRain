import { District, NEPAL_DISTRICTS } from "@/data/nepalDistricts";
import { DistrictWeatherSummary } from "./types";
import { calculateDHMAlertLevel } from "./alertCalculator";

/**
 * Fetch all 77 districts of Nepal in a single batch API call from Open-Meteo
 * Open-Meteo supports comma-separated lat/lons and returns an array of 77 forecast objects.
 */
export async function fetchAll77DistrictsLive(): Promise<DistrictWeatherSummary[]> {
  const latStr = NEPAL_DISTRICTS.map((d) => d.lat).join(",");
  const lonStr = NEPAL_DISTRICTS.map((d) => d.lon).join(",");

  const url = `https://api.open-meteo.com/v1/forecast?latitude=${latStr}&longitude=${lonStr}&current=temperature_2m,relative_humidity_2m,precipitation,rain,weather_code,cloud_cover,surface_pressure,wind_speed_10m,wind_direction_10m,wind_gusts_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,wind_speed_10m_max&timezone=Asia%2FKathmandu&forecast_days=3`;

  try {
    const res = await fetch(url, {
      cache: "no-store",
      headers: {
        "User-Agent": "NepalWeatherTracker/1.0",
      },
    });

    if (!res.ok) {
      throw new Error(`Open-Meteo batch API returned ${res.status}`);
    }

    const dataList = await res.json();

    if (!Array.isArray(dataList) || dataList.length !== NEPAL_DISTRICTS.length) {
      throw new Error("Batch data length mismatch");
    }

    return NEPAL_DISTRICTS.map((district, idx) => {
      const data = dataList[idx];
      if (!data?.current || !data?.daily) throw new Error(`Open-Meteo returned no data for ${district.name}`);
      const dailyPrecip: number[] = data.daily?.precipitation_sum || [];
      const rain24h = Math.round((dailyPrecip[0] ?? 0) * 10) / 10;
      const rain48h = Math.round((rain24h + (dailyPrecip[1] ?? 0)) * 10) / 10;
      const rain72h = Math.round((rain48h + (dailyPrecip[2] ?? 0)) * 10) / 10;

      const currentPrecip = data.current.precipitation;
      const alertInfo = calculateDHMAlertLevel(rain24h, currentPrecip, district.riskVulnerability);

      return {
        districtId: district.id,
        districtName: district.name,
        nepaliName: district.nepaliName,
        provinceId: district.provinceId,
        provinceName: district.provinceName,
        lat: district.lat,
        lon: district.lon,
        elevation: district.elevation,
        basin: district.basin,
        current: {
          temperature: Math.round(data.current.temperature_2m * 10) / 10,
          relativeHumidity: data.current.relative_humidity_2m,
          precipitation: currentPrecip,
          rain: data.current.rain ?? currentPrecip,
          weatherCode: data.current.weather_code,
          cloudCover: data.current.cloud_cover,
          surfacePressure: Math.round(data.current.surface_pressure),
          windSpeed: Math.round(data.current.wind_speed_10m),
          windDirection: data.current.wind_direction_10m,
          windGusts: Math.round(data.current.wind_gusts_10m),
          time: data.current.time,
        },
        hourly: {
          time: [],
          temperature: [],
          precipitation: [],
          precipitationProbability: [],
          cloudCover: [],
          surfacePressure: [],
          windSpeed: [],
          windGusts: [],
        },
        daily: {
          time: data.daily?.time || [],
          weatherCode: data.daily?.weather_code || [],
          temperatureMax: data.daily?.temperature_2m_max || [],
          temperatureMin: data.daily?.temperature_2m_min || [],
          precipitationSum: dailyPrecip,
          precipitationProbabilityMax: data.daily?.precipitation_probability_max || [],
          windSpeedMax: data.daily?.wind_speed_10m_max || [],
        },
        total24hRain: rain24h,
        total48hRain: rain48h,
        total72hRain: rain72h,
        alertLevel: alertInfo.level,
        flashFloodRiskScore: alertInfo.flashFloodScore,
        landslideRiskScore: alertInfo.landslideScore,
        primaryThreat: alertInfo.primaryThreat,
      };
    });
  } catch (err) {
    console.error("Open-Meteo batch forecast unavailable", err);
    throw err;
  }
}

/**
 * Detailed 72-hour hourly forecast for a single selected district
 */
export async function fetchDistrictWeather(district: District): Promise<DistrictWeatherSummary> {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${district.lat}&longitude=${district.lon}&current=temperature_2m,relative_humidity_2m,precipitation,rain,weather_code,cloud_cover,surface_pressure,wind_speed_10m,wind_direction_10m,wind_gusts_10m&hourly=temperature_2m,precipitation_probability,precipitation,weather_code,surface_pressure,cloud_cover,wind_speed_10m,wind_gusts_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,wind_speed_10m_max&timezone=Asia%2FKathmandu&forecast_days=7`;

  try {
    const res = await fetch(url, {
      cache: "no-store",
      headers: {
        "User-Agent": "NepalWeatherTracker/1.0",
      },
    });
    if (!res.ok) {
      throw new Error(`Open-Meteo API returned status ${res.status}`);
    }
    const data = await res.json();
    if (!data?.current || !data?.hourly) throw new Error(`Open-Meteo returned no data for ${district.name}`);

    const hourlyPrecip: number[] = data.hourly?.precipitation || [];
    const rain24h = Math.round(hourlyPrecip.slice(0, 24).reduce((a, b) => a + b, 0) * 10) / 10;
    const rain48h = Math.round(hourlyPrecip.slice(0, 48).reduce((a, b) => a + b, 0) * 10) / 10;
    const rain72h = Math.round(hourlyPrecip.slice(0, 72).reduce((a, b) => a + b, 0) * 10) / 10;

    const maxHourly = Math.max(...hourlyPrecip.slice(0, 24), 0);
    const alertInfo = calculateDHMAlertLevel(rain24h, maxHourly, district.riskVulnerability);

    return {
      districtId: district.id,
      districtName: district.name,
      nepaliName: district.nepaliName,
      provinceId: district.provinceId,
      provinceName: district.provinceName,
      lat: district.lat,
      lon: district.lon,
      elevation: district.elevation,
      basin: district.basin,
      current: {
        temperature: Math.round(data.current.temperature_2m * 10) / 10,
        relativeHumidity: data.current.relative_humidity_2m,
        precipitation: data.current.precipitation,
        rain: data.current.rain,
        weatherCode: data.current.weather_code,
        cloudCover: data.current.cloud_cover,
        surfacePressure: Math.round(data.current.surface_pressure),
        windSpeed: Math.round(data.current.wind_speed_10m),
        windDirection: data.current.wind_direction_10m,
        windGusts: Math.round(data.current.wind_gusts_10m),
        time: data.current.time,
      },
      hourly: {
        time: (data.hourly?.time || []).slice(0, 72),
        temperature: (data.hourly?.temperature_2m || []).slice(0, 72),
        precipitation: hourlyPrecip.slice(0, 72),
        precipitationProbability: (data.hourly?.precipitation_probability || []).slice(0, 72),
        cloudCover: (data.hourly?.cloud_cover || []).slice(0, 72),
        surfacePressure: (data.hourly?.surface_pressure || []).slice(0, 72),
        windSpeed: (data.hourly?.wind_speed_10m || []).slice(0, 72),
        windGusts: (data.hourly?.wind_gusts_10m || []).slice(0, 72),
      },
      daily: {
        time: data.daily?.time || [],
        weatherCode: data.daily?.weather_code || [],
        temperatureMax: data.daily?.temperature_2m_max || [],
        temperatureMin: data.daily?.temperature_2m_min || [],
        precipitationSum: data.daily?.precipitation_sum || [],
        precipitationProbabilityMax: data.daily?.precipitation_probability_max || [],
        windSpeedMax: data.daily?.wind_speed_10m_max || [],
      },
      total24hRain: rain24h,
      total48hRain: rain48h,
      total72hRain: rain72h,
      alertLevel: alertInfo.level,
      flashFloodRiskScore: alertInfo.flashFloodScore,
      landslideRiskScore: alertInfo.landslideScore,
      primaryThreat: alertInfo.primaryThreat,
    };
  } catch (error) {
    console.error(`Open-Meteo forecast unavailable for ${district.name}`, error);
    throw error;
  }
}
