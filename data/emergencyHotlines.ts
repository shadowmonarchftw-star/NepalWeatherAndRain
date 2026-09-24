export interface Hotline {
  service: string;
  nepaliService: string;
  number: string;
  description: string;
  color: string;
  isTollFree?: boolean;
}

export const EMERGENCY_HOTLINES: Hotline[] = [
  {
    service: "DHM Flood Alert (जल तथा मौसम विज्ञान विभाग)",
    nepaliService: "बाढी पूर्वानुमान टोल-फ्री",
    number: "1155",
    description: "24/7 Department of Hydrology & Meteorology river level warning and flood advisories.",
    color: "bg-blue-600 text-white",
    isTollFree: true,
  },
  {
    service: "Nepal Police Emergency",
    nepaliService: "नेपाल प्रहरी आपत्कालीन",
    number: "100",
    description: "National emergency police dispatch for rapid rescue and incident reporting.",
    color: "bg-crimson text-white",
    isTollFree: true,
  },
  {
    service: "Armed Police Force (APF) Disaster Helpline",
    nepaliService: "सशस्त्र प्रहरी विपद् व्यवस्थापन",
    number: "1114",
    description: "Specialized water rescue, landslide extraction, and emergency evacuation units.",
    color: "bg-red-700 text-white",
    isTollFree: true,
  },
  {
    service: "Highway Traffic Advisory & Road Blockage",
    nepaliService: "ट्राफिक प्रहरी राजमार्ग सहायता",
    number: "103",
    description: "Real-time road status for Prithvi Highway, BP Highway, Narayanghat-Mugling, and Tribhuvan Highway.",
    color: "bg-amber-600 text-white",
    isTollFree: true,
  },
  {
    service: "Nepal Red Cross Society (NRCS) Ambulance",
    nepaliService: "रेडक्रस एम्बुलेन्स सेवा",
    number: "1130",
    description: "Emergency medical transport, blood bank, and first aid dispatch nationwide.",
    color: "bg-rose-600 text-white",
    isTollFree: false,
  }
];

export interface HighwayVulnerability {
  highwayName: string;
  nepaliName: string;
  keyChokepoints: string[];
}

export const HIGHWAY_ADVISORIES: HighwayVulnerability[] = [
  {
    highwayName: "Prithvi Highway (Kathmandu - Pokhara)",
    nepaliName: "पृथ्वी राजमार्ग",
    keyChokepoints: ["Malekhu", "Jogimara", "Mugling", "Kurintar", "Dumre"],
  },
  {
    highwayName: "Narayanghat - Mugling Highway",
    nepaliName: "नारायणगढ - मुग्लिन सडक खण्ड",
    keyChokepoints: ["Simaltal", "17 Kilo", "Topekhola", "Jalbire"],
  },
  {
    highwayName: "BP Highway (Dhulikhel - Sindhuli - Bardibas)",
    nepaliName: "बीपी राजमार्ग",
    keyChokepoints: ["Roshi River Corridor", "Nepalthok", "Khurkot", "Bhimeshwar"],
  },
  {
    highwayName: "Tribhuvan Highway (Naubise - Daman - Hetauda)",
    nepaliName: "त्रिभुवन राजपथ",
    keyChokepoints: ["Tistung", "Palung", "Daman Pass"],
  }
];
