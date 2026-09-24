export interface Province {
  id: number;
  name: string;
  nepaliName: string;
  capital: string;
  center: [number, number]; // lat, lon
  bounds: [[number, number], [number, number]]; // [[south, west], [north, east]]
  majorRivers: string[];
  vulnerabilityToBayOfBengal: "Critical / Immediate" | "High / Secondary" | "Moderate / Delayed" | "Low / Distant";
}

export const NEPAL_PROVINCES: Province[] = [
  {
    id: 1,
    name: "Koshi Province",
    nepaliName: "कोशी प्रदेश",
    capital: "Biratnagar",
    center: [27.0, 87.3],
    bounds: [[26.3, 86.4], [28.0, 88.2]],
    majorRivers: ["Saptakoshi", "Tamor", "Arun", "Dudhkoshi", "Kankai", "Mechi"],
    vulnerabilityToBayOfBengal: "Critical / Immediate",
  },
  {
    id: 2,
    name: "Madhesh Province",
    nepaliName: "मधेश प्रदेश",
    capital: "Janakpur",
    center: [26.8, 85.6],
    bounds: [[26.4, 84.8], [27.2, 87.0]],
    majorRivers: ["Bagmati (Lower)", "Kamala", "Ratuwa", "Lalbakaiya", "Sirsiya"],
    vulnerabilityToBayOfBengal: "Critical / Immediate",
  },
  {
    id: 3,
    name: "Bagmati Province",
    nepaliName: "बागमती प्रदेश",
    capital: "Hetauda",
    center: [27.7, 85.3],
    bounds: [[27.0, 84.3], [28.4, 86.4]],
    majorRivers: ["Bagmati", "Trishuli", "Sunkoshi", "Bhotekoshi", "Melamchi", "Kulekhani"],
    vulnerabilityToBayOfBengal: "High / Secondary",
  },
  {
    id: 4,
    name: "Gandaki Province",
    nepaliName: "गण्डकी प्रदेश",
    capital: "Pokhara",
    center: [28.3, 84.0],
    bounds: [[27.5, 83.2], [29.3, 85.1]],
    majorRivers: ["Kali Gandaki", "Seti", "Marshyangdi", "Madi", "Budhi Gandaki"],
    vulnerabilityToBayOfBengal: "High / Secondary",
  },
  {
    id: 5,
    name: "Lumbini Province",
    nepaliName: "लुम्बिनी प्रदेश",
    capital: "Deukhuri (Dang)",
    center: [27.9, 82.8],
    bounds: [[27.3, 81.2], [28.8, 84.0]],
    majorRivers: ["West Rapti", "Babai", "Tinau", "Rohini", "Badhaiya"],
    vulnerabilityToBayOfBengal: "Moderate / Delayed",
  },
  {
    id: 6,
    name: "Karnali Province",
    nepaliName: "कर्णाली प्रदेश",
    capital: "Birendranagar",
    center: [29.1, 82.2],
    bounds: [[28.2, 80.9], [30.5, 83.5]],
    majorRivers: ["Karnali", "Bheri", "Tila", "Thuli Bheri", "Sani Bheri"],
    vulnerabilityToBayOfBengal: "Moderate / Delayed",
  },
  {
    id: 7,
    name: "Sudurpashchim Province",
    nepaliName: "सुदूरपश्चिम प्रदेश",
    capital: "Godawari / Dhangadhi",
    center: [29.3, 80.9],
    bounds: [[28.5, 80.0], [30.2, 81.8]],
    majorRivers: ["Mahakali", "Seti (Far-West)", "Karnali (Lower)", "Mohana"],
    vulnerabilityToBayOfBengal: "Low / Distant",
  }
];
