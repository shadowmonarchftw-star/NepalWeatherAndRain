export interface NepalRiverLine {
  id: string;
  name: string;
  nepaliName: string;
  basin: string;
  basinNepali: string;
  color: string;
  weight: number;
  origin: string;
  description: string;
  coordinates: [number, number][]; // [lat, lon]
}

export const NEPAL_RIVER_SYSTEMS: NepalRiverLine[] = [
  // ==========================================
  // 1. KOSHI BASIN (Eastern Nepal)
  // ==========================================
  {
    id: "sapta-koshi-main",
    name: "Sapta Koshi Main Stem",
    nepaliName: "सप्तकोशी मुख्य नदी",
    basin: "Koshi",
    basinNepali: "कोशी",
    color: "#0284C7",
    weight: 4.5,
    origin: "Confluence of Sun Koshi, Arun, and Tamor at Tribeni",
    description: "Nepal's largest river system discharging over 1,560 m³/s into the Ganges.",
    coordinates: [
      [27.05, 87.05],
      [26.96, 87.12],
      [26.8833, 87.15], // Chatara
      [26.80, 87.12],
      [26.70, 87.05], // Prakashpur
      [26.60, 86.95], // Koshi Tappu
      [26.518, 86.93], // Koshi Barrage
    ],
  },
  {
    id: "sun-koshi",
    name: "Sun Koshi River",
    nepaliName: "सुनकोशी नदी",
    basin: "Koshi",
    basinNepali: "कोशी",
    color: "#0EA5E9",
    weight: 3.5,
    origin: "Tibet Border / Langtang Himal",
    description: "Main trunk river of central-eastern Nepal flowing east towards Tribeni.",
    coordinates: [
      [27.95, 85.95], // Kodari / Tatopani
      [27.85, 85.90],
      [27.78, 85.87], // Barhabise
      [27.70, 85.73], // Balephi
      [27.60, 85.70], // Dolalghat
      [27.52, 85.80],
      [27.42, 86.05], // Khurkot
      [27.35, 86.25],
      [27.28, 86.40],
      [27.18, 86.68], // Okhaldhunga confluence
      [27.12, 86.85],
      [27.05, 87.05], // Tribeni
    ],
  },
  {
    id: "arun-river",
    name: "Arun River",
    nepaliName: "अरुण नदी",
    basin: "Koshi",
    basinNepali: "कोशी",
    color: "#38BDF8",
    weight: 3.5,
    origin: "Tibetan Plateau (Phung Chu) through Makalu Barun",
    description: "Ancient antecedent river carving one of the deepest gorges through the High Himalayas.",
    coordinates: [
      [27.90, 87.45], // Kimathanka
      [27.80, 87.42],
      [27.65, 87.38],
      [27.55, 87.32], // Num
      [27.42, 87.25],
      [27.31, 87.19], // Turkeghat
      [27.22, 87.15],
      [27.12, 87.10],
      [27.05, 87.05], // Tribeni
    ],
  },
  {
    id: "tamor-river",
    name: "Tamor River",
    nepaliName: "तमोर नदी",
    basin: "Koshi",
    basinNepali: "कोशी",
    color: "#0284C7",
    weight: 3.5,
    origin: "Kanchenjunga range (Olangchung Gola)",
    description: "Easternmost tributary of the Koshi draining Taplejung, Panchthar, and Dhankuta.",
    coordinates: [
      [27.75, 87.85], // Olangchung Gola
      [27.62, 87.78],
      [27.52, 87.72], // Taplejung
      [27.40, 87.65],
      [27.28, 87.55],
      [27.18, 87.45], // Mulghat
      [27.10, 87.25],
      [27.05, 87.05], // Tribeni
    ],
  },
  {
    id: "dudh-koshi",
    name: "Dudh Koshi River",
    nepaliName: "दूधकोशी नदी",
    basin: "Koshi",
    basinNepali: "कोशी",
    color: "#38BDF8",
    weight: 3,
    origin: "Everest / Gokyo glacial lakes",
    description: "High-gradient glacial torrent draining the Sagarmatha / Everest massif.",
    coordinates: [
      [27.96, 86.72], // Gokyo
      [27.80, 86.71], // Namche Bazaar
      [27.68, 86.72], // Lukla / Surke
      [27.52, 86.68],
      [27.38, 86.65], // Salleri
      [27.25, 86.62],
      [27.18, 86.68], // Sun Koshi confluence
    ],
  },
  {
    id: "tama-koshi",
    name: "Tama Koshi River",
    nepaliName: "तामाकोशी नदी",
    basin: "Koshi",
    basinNepali: "कोशी",
    color: "#0EA5E9",
    weight: 3,
    origin: "Tibetan Border / Rolwaling Himal",
    description: "Rapid mountain river hosting Upper Tamakoshi Hydroelectric Project.",
    coordinates: [
      [28.05, 86.20], // Lapche
      [27.90, 86.18],
      [27.82, 86.15], // Singati
      [27.65, 86.05], // Charikot
      [27.52, 86.02],
      [27.42, 86.05], // Sun Koshi confluence
    ],
  },
  {
    id: "bhote-koshi-indrawati",
    name: "Indrawati River",
    nepaliName: "इन्द्रावती नदी",
    basin: "Koshi",
    basinNepali: "कोशी",
    color: "#38BDF8",
    weight: 2.5,
    origin: "Langtang / Jugal Himal (Helambu)",
    description: "Vital water source flowing past Melamchi into the Sun Koshi at Dolalghat.",
    coordinates: [
      [27.98, 85.55], // Helambu
      [27.85, 85.58], // Melamchi
      [27.75, 85.65],
      [27.68, 85.68],
      [27.60, 85.70], // Dolalghat
    ],
  },
  {
    id: "kankai-river",
    name: "Kankai River",
    nepaliName: "कन्काई नदी",
    basin: "Kankai",
    basinNepali: "कन्काई",
    color: "#0284C7",
    weight: 3,
    origin: "Mahabharat hills of Ilam",
    description: "Key river of Jhapa and Ilam in Far-Eastern Nepal, sacred pilgrimage river.",
    coordinates: [
      [27.15, 87.95], // Ilam hills
      [26.98, 87.93],
      [26.85, 87.91], // Mainachuli
      [26.685, 87.904], // Surunga
      [26.55, 87.90],
      [26.40, 87.88], // Border
    ],
  },
  {
    id: "mechi-river",
    name: "Mechi River",
    nepaliName: "मेची नदी",
    basin: "Mechi",
    basinNepali: "मेची",
    color: "#0EA5E9",
    weight: 2.8,
    origin: "Singalila Ridge / Kanchenjunga",
    description: "International boundary river demarcating eastern border between Nepal and India.",
    coordinates: [
      [27.25, 88.10], // Pashupatinagar
      [27.05, 88.11],
      [26.85, 88.13],
      [26.65, 88.15], // Kakarbhitta
      [26.50, 88.12],
      [26.35, 88.08], // Bhadrapur border
    ],
  },

  // ==========================================
  // 2. BAGMATI BASIN (Central Nepal)
  // ==========================================
  {
    id: "bagmati-river-main",
    name: "Bagmati River Main Stem",
    nepaliName: "बागमती मुख्य नदी",
    basin: "Bagmati",
    basinNepali: "बागमती",
    color: "#003893",
    weight: 4,
    origin: "Shivapuri Hills (Bagdwar, 2,732m)",
    description: "Culturally and historically sacred river flowing through Kathmandu Valley and Terai to the Ganges.",
    coordinates: [
      [27.80, 85.42], // Bagdwar
      [27.72, 85.35], // Pashupatinath
      [27.68, 85.31], // Thapathali
      [27.65, 85.29], // Chobhar Gorge
      [27.50, 85.28], // Dakshinkali
      [27.35, 85.32],
      [27.22, 85.45], // Pandheradovan
      [27.08, 85.42],
      [26.90, 85.38], // Karmaiya / Rautahat
      [26.78, 85.35],
      [26.68, 85.32], // Bairgania Border
    ],
  },
  {
    id: "bishnumati-river",
    name: "Bishnumati Khola",
    nepaliName: "विष्णुमती खोला",
    basin: "Bagmati",
    basinNepali: "बागमती",
    color: "#2563EB",
    weight: 2.2,
    origin: "Budhanilkantha / Shivapuri",
    description: "Primary urban tributary of the Bagmati flowing through western Kathmandu.",
    coordinates: [
      [27.82, 85.32], // Budhanilkantha
      [27.76, 85.31],
      [27.735, 85.307], // Gongabu Buspark
      [27.71, 85.305], // Shovabhagawati
      [27.695, 85.302], // Teku Dovan (Bagmati confluence)
    ],
  },
  {
    id: "marin-khola",
    name: "Marin River",
    nepaliName: "मरिण खोला",
    basin: "Bagmati",
    basinNepali: "बागमती",
    color: "#3B82F6",
    weight: 2.6,
    origin: "Sindhuli Hills",
    description: "Vital eastern tributary joining the Bagmati at Bagmati Dovan.",
    coordinates: [
      [27.28, 85.85], // Sindhuli Madi
      [27.26, 85.72],
      [27.24, 85.62],
      [27.225, 85.509], // Bagmati Dovan
    ],
  },
  {
    id: "lalbakaiya-river",
    name: "Lalbakaiya River",
    nepaliName: "लालबकैया नदी",
    basin: "Lalbakaiya",
    basinNepali: "लालबकैया",
    color: "#1D4ED8",
    weight: 2.8,
    origin: "Makwanpur Siwalik Range",
    description: "Highly flash-flood prone river through Rautahat that threatens Gaur municipality.",
    coordinates: [
      [27.28, 85.15],
      [27.18, 85.20],
      [27.05, 85.25], // Chandranigahpur
      [26.90, 85.28],
      [26.78, 85.30], // Gaur
      [26.72, 85.31], // Border
    ],
  },
  {
    id: "kamala-river",
    name: "Kamala River",
    nepaliName: "कमला नदी",
    basin: "Kamala",
    basinNepali: "कमला",
    color: "#2563EB",
    weight: 3.2,
    origin: "Mahabharat hills of Sindhuli",
    description: "Major lifeline river of Sindhuli, Dhanusha, and Siraha with extensive irrigation barrage.",
    coordinates: [
      [27.25, 86.05], // Sindhuli
      [27.10, 86.10],
      [26.95, 86.15], // Kamalamai
      [26.82, 86.18],
      [26.75, 86.20], // Chisapani Dhanusha
      [26.62, 86.20],
      [26.50, 86.18], // Siraha border
    ],
  },

  // ==========================================
  // 3. GANDAKI / NARAYANI BASIN (Central-West Nepal)
  // ==========================================
  {
    id: "narayani-main",
    name: "Narayani River Main Stem",
    nepaliName: "नारायणी मुख्य नदी",
    basin: "Narayani",
    basinNepali: "नारायणी / गण्डकी",
    color: "#0284C7",
    weight: 5,
    origin: "Confluence of Kali Gandaki & Trishuli at Devghat",
    description: "One of Nepal's mighty rivers flowing through Chitwan valley into Bihar, India.",
    coordinates: [
      [27.7067, 84.4253], // Devghat
      [27.68, 84.40], // Narayangarh
      [27.62, 84.32],
      [27.58, 84.25], // Meghauli (Chitwan)
      [27.50, 84.15],
      [27.45, 84.05], // Amaltari
      [27.42, 83.90], // Tribeni Barrage
    ],
  },
  {
    id: "kali-gandaki",
    name: "Kali Gandaki River",
    nepaliName: "कालीगण्डकी नदी",
    basin: "Narayani",
    basinNepali: "नारायणी / गण्डकी",
    color: "#0EA5E9",
    weight: 4,
    origin: "Upper Mustang (Tibetan border, 6,268m)",
    description: "Carves the world's deepest gorge between Dhaulagiri (8,167m) and Annapurna I (8,091m).",
    coordinates: [
      [29.15, 83.95], // Lo Manthang
      [28.98, 83.85],
      [28.80, 83.75], // Kagbeni / Jomsom
      [28.60, 83.65], // Marpha / Dana
      [28.40, 83.60], // Tatopani / Beni
      [28.25, 83.62], // Baglung / Kushma
      [28.203, 83.67], // Modi Beni
      [28.05, 83.65],
      [27.95, 83.65], // Ramdi (Palpa)
      [27.85, 83.80],
      [27.75, 84.15],
      [27.7067, 84.4253], // Devghat
    ],
  },
  {
    id: "trishuli-river",
    name: "Trishuli River",
    nepaliName: "त्रिशूली नदी",
    basin: "Narayani",
    basinNepali: "नारायणी / गण्डकी",
    color: "#38BDF8",
    weight: 3.8,
    origin: "Tibet (Kirung) through Rasuwa",
    description: "Crucial economic river powering multiple hydro plants along Prithvi Highway.",
    coordinates: [
      [28.30, 85.35], // Rasuwagadhi
      [28.18, 85.30],
      [28.10, 85.25], // Dhunche
      [27.98, 85.20],
      [27.92, 85.17], // Bidur / Battar
      [27.85, 85.05],
      [27.80, 84.95], // Galchhi
      [27.80, 84.78], // Benighat
      [27.75, 84.70], // Mugling
      [27.72, 84.55],
      [27.7067, 84.4253], // Devghat
    ],
  },
  {
    id: "marsyangdi-river",
    name: "Marsyangdi River",
    nepaliName: "मर्स्याङ्दी नदी",
    basin: "Narayani",
    basinNepali: "नारायणी / गण्डकी",
    color: "#0284C7",
    weight: 3.5,
    origin: "Annapurna / Manang Himal",
    description: "Famous raging river flowing through Manang, Lamjung, and Tanahun to Mugling.",
    coordinates: [
      [28.75, 84.05], // Manang
      [28.65, 84.22],
      [28.55, 84.35], // Chame
      [28.40, 84.38],
      [28.25, 84.40], // Besisahar
      [28.12, 84.42],
      [28.02, 84.45], // Dumre
      [27.85, 84.60],
      [27.75, 84.70], // Mugling
    ],
  },
  {
    id: "budhi-gandaki",
    name: "Budhi Gandaki River",
    nepaliName: "बुढीगण्डकी नदी",
    basin: "Narayani",
    basinNepali: "नारायणी / गण्डकी",
    color: "#0EA5E9",
    weight: 3.2,
    origin: "Manaslu range (Samagaun)",
    description: "Flows along border of Gorkha and Dhading, site of planned mega reservoir project.",
    coordinates: [
      [28.65, 84.90], // Samagaun
      [28.50, 84.88],
      [28.35, 84.85], // Philim
      [28.20, 84.83],
      [28.046, 84.816], // Arughat
      [27.95, 84.80],
      [27.85, 84.78], // Benighat (Trishuli confluence)
    ],
  },
  {
    id: "seti-gandaki",
    name: "Seti Gandaki River",
    nepaliName: "सेती गण्डकी नदी",
    basin: "Narayani",
    basinNepali: "नारायणी / गण्डकी",
    color: "#38BDF8",
    weight: 3.2,
    origin: "Annapurna Base Camp",
    description: "Glacial milky river carving deep underground gorges straight through Pokhara valley.",
    coordinates: [
      [28.55, 83.95], // ABC
      [28.38, 83.96],
      [28.22, 83.98], // Pokhara Gorge
      [28.15, 84.05],
      [28.10, 84.10], // Khairenitar
      [27.95, 84.25],
      [27.85, 84.35], // Damauli
      [27.72, 84.40], // Gaighat
    ],
  },
  {
    id: "madi-river",
    name: "Madi River",
    nepaliName: "मादी नदी",
    basin: "Narayani",
    basinNepali: "नारायणी / गण्डकी",
    color: "#0284C7",
    weight: 2.8,
    origin: "Lamjung Himal",
    description: "High-gradient river cascading through Kaski and Lamjung to Damauli.",
    coordinates: [
      [28.45, 84.15],
      [28.32, 84.18],
      [28.25, 84.20], // Sikles
      [28.10, 84.25],
      [28.00, 84.28],
      [27.85, 84.35], // Damauli (Seti confluence)
    ],
  },
  {
    id: "east-rapti-river",
    name: "East Rapti River (Chitwan)",
    nepaliName: "पूर्वी राप्ती नदी (चितवन)",
    basin: "Narayani",
    basinNepali: "नारायणी / गण्डकी",
    color: "#0EA5E9",
    weight: 2.8,
    origin: "Hetauda Siwalik Hills",
    description: "Flows through Chitwan National Park, critical sanctuary habitat for rhinos and gharials.",
    coordinates: [
      [27.58, 85.02], // Hetauda
      [27.56, 84.85],
      [27.55, 84.70],
      [27.57, 84.50], // Sauraha
      [27.58, 84.35],
      [27.58, 84.25], // Meghauli (Narayani confluence)
    ],
  },

  // ==========================================
  // 4. LUMBINI & WESTERN BASIN
  // ==========================================
  {
    id: "west-rapti-river",
    name: "West Rapti River",
    nepaliName: "पश्चिम राप्ती नदी",
    basin: "West Rapti",
    basinNepali: "पश्चिम राप्ती",
    color: "#0284C7",
    weight: 4,
    origin: "Mahabharat hills of Pyuthan & Rolpa",
    description: "Severely flood-prone lifeline river of Banke, Dang, and Kusum, monitored by Jalkundi gauge.",
    coordinates: [
      [28.30, 82.90], // Pyuthan
      [28.18, 82.75],
      [28.07, 82.80], // Nayagaon
      [28.05, 82.50], // Bhalubang
      [27.947, 82.225], // Jalkundi
      [27.90, 81.85], // Agaiya / Kusum
      [27.95, 81.70],
      [28.02, 81.60], // Banke / Nepalgunj
      [27.88, 81.55], // Border
    ],
  },
  {
    id: "babai-river",
    name: "Babai River",
    nepaliName: "बबई नदी",
    basin: "Babai",
    basinNepali: "बबई",
    color: "#0EA5E9",
    weight: 3.5,
    origin: "Dang Valley Siwalik Hills",
    description: "Flows through inner Terai Dang valley, Chepang, and across Bardiya National Park.",
    coordinates: [
      [28.15, 82.40], // Dang Valley
      [28.22, 82.10], // Tulsipur
      [28.30, 81.90],
      [28.3512, 81.7167], // Chepang
      [28.28, 81.40], // Bardiya NP
      [28.20, 81.25], // Gulariya border
    ],
  },
  {
    id: "tinau-river",
    name: "Tinau River",
    nepaliName: "तिनाउ नदी",
    basin: "Tinau",
    basinNepali: "तिनाउ",
    color: "#38BDF8",
    weight: 3,
    origin: "Palpa Mahabharat Range",
    description: "Dynamic river emerging from Chure hills directly into Butwal city.",
    coordinates: [
      [27.92, 83.58], // Palpa
      [27.80, 83.52],
      [27.70, 83.47], // Butwal Gorge
      [27.60, 83.46],
      [27.52, 83.45], // Bhairahawa
      [27.42, 83.43], // Lumbini border
    ],
  },
  {
    id: "banganga-river",
    name: "Banganga River",
    nepaliName: "बाणगङ्गा नदी",
    basin: "Banganga",
    basinNepali: "बाणगङ्गा",
    color: "#0284C7",
    weight: 2.8,
    origin: "Arghakhanchi Siwaliks",
    description: "Historic river nourishing Kapilvastu and the ancient Shakya kingdom.",
    coordinates: [
      [27.82, 83.15],
      [27.72, 83.12],
      [27.62, 83.10], // Taulihawa
      [27.48, 83.08], // Kapilvastu border
    ],
  },

  // ==========================================
  // 5. KARNALI BASIN (Mid-West & Far-West Nepal)
  // ==========================================
  {
    id: "karnali-main",
    name: "Karnali River Main Stem",
    nepaliName: "कर्णाली मुख्य नदी",
    basin: "Karnali",
    basinNepali: "कर्णाली",
    color: "#003893",
    weight: 5,
    origin: "Mount Kailash / Tibetan border (Humla Karnali)",
    description: "Nepal's longest river (507 km) cutting through gorges to Chisapani and Bardiya.",
    coordinates: [
      [29.25, 81.70], // Lalighat confluence
      [29.15, 81.65], // Manma (Kalikot)
      [29.05, 81.52],
      [28.95, 81.45], // Dullu / Dailekh
      [28.80, 81.35],
      [28.6472, 81.2828], // Chisapani Gorge
      [28.52, 81.22],
      [28.40, 81.18], // Geruwa branch
      [28.30, 81.10], // Tikapur / Border
    ],
  },
  {
    id: "humla-karnali",
    name: "Humla Karnali River",
    nepaliName: "हुम्ला कर्णाली नदी",
    basin: "Karnali",
    basinNepali: "कर्णाली",
    color: "#0EA5E9",
    weight: 3.5,
    origin: "Tibet Border at Hilsa",
    description: "Upper high-altitude artery traversing the pristine remote valleys of Humla.",
    coordinates: [
      [30.30, 81.50], // Hilsa
      [30.12, 81.65],
      [30.00, 81.75], // Simikot
      [29.80, 81.85],
      [29.65, 81.90],
      [29.45, 81.80],
      [29.151, 81.5817], // Lalighat
    ],
  },
  {
    id: "mugu-karnali",
    name: "Mugu Karnali River",
    nepaliName: "मुगु कर्णाली नदी",
    basin: "Karnali",
    basinNepali: "कर्णाली",
    color: "#38BDF8",
    weight: 3.2,
    origin: "Tibetan Border (Mugu)",
    description: "Flows past Gamgadhi and Rara National Park to join Humla Karnali.",
    coordinates: [
      [29.95, 82.55], // Mugu
      [29.75, 82.35],
      [29.60, 82.20], // Gamgadhi / Rara
      [29.40, 81.95],
      [29.25, 81.70], // Lalighat confluence
    ],
  },
  {
    id: "tila-river",
    name: "Tila River",
    nepaliName: "तिला नदी",
    basin: "Karnali",
    basinNepali: "कर्णाली",
    color: "#0284C7",
    weight: 2.8,
    origin: "Jumla Valley Hills",
    description: "Fertile river irrigating the high-altitude red rice terraces of Jumla.",
    coordinates: [
      [29.35, 82.25], // Jumla
      [29.28, 82.05],
      [29.20, 81.85], // Kalikot
      [29.15, 81.65], // Manma (Karnali confluence)
    ],
  },
  {
    id: "bheri-river",
    name: "Bheri River Main Stem",
    nepaliName: "भेरी मुख्य नदी",
    basin: "Karnali",
    basinNepali: "कर्णाली",
    color: "#0EA5E9",
    weight: 4,
    origin: "Dolpa / Dhaulagiri massif",
    description: "Major southern tributary of Karnali, flows past Jajarkot and Birendranagar.",
    coordinates: [
      [29.05, 83.00], // Dunai (Dolpa)
      [28.90, 82.70],
      [28.75, 82.40], // Jajarkot
      [28.68, 82.10],
      [28.60, 81.80], // Surkhet
      [28.55, 81.50],
      [28.55, 81.35], // Karnali confluence
    ],
  },
  {
    id: "sani-bheri",
    name: "Sani Bheri River",
    nepaliName: "सानी भेरी नदी",
    basin: "Karnali",
    basinNepali: "कर्णाली",
    color: "#38BDF8",
    weight: 2.8,
    origin: "Dhorpatan Hunting Reserve",
    description: "Scenic white-water river draining Rukum and joining the Thuli Bheri.",
    coordinates: [
      [28.65, 82.95], // Dhorpatan
      [28.60, 82.65],
      [28.60, 82.50], // Musikot
      [28.65, 82.25], // Bheri confluence
    ],
  },

  // ==========================================
  // 6. MAHAKALI & FAR-WEST BASIN
  // ==========================================
  {
    id: "mahakali-main",
    name: "Mahakali River (Sharda)",
    nepaliName: "महाकाली मुख्य नदी",
    basin: "Mahakali",
    basinNepali: "महाकाली",
    color: "#0D9488",
    weight: 4.5,
    origin: "Kalapani / Lipulekh (Darchula)",
    description: "Major border river delineating Nepal's western boundary with Uttarakhand, India.",
    coordinates: [
      [30.15, 81.05], // Kalapani / Lipulekh
      [29.98, 80.75],
      [29.80, 80.55], // Darchula
      [29.60, 80.45],
      [29.40, 80.40], // Jhulaghat (Baitadi)
      [29.25, 80.32],
      [29.13, 80.25], // Parigaon (Dadeldhura)
      [28.98, 80.18], // Dodhara Chandani
      [28.88, 80.15], // Mahendranagar
      [28.75, 80.12], // Tanakpur / Banbasa
    ],
  },
  {
    id: "west-seti-river",
    name: "West Seti River",
    nepaliName: "पश्चिम सेती नदी",
    basin: "Karnali",
    basinNepali: "कर्णाली",
    color: "#14B8A6",
    weight: 3.5,
    origin: "Saipal Himal (Bajhang)",
    description: "Glacial river cutting across Bajhang, Baitadi, Doti, and Achham to the Karnali.",
    coordinates: [
      [29.90, 81.35], // Saipal
      [29.75, 81.28],
      [29.60, 81.20], // Chainpur (Bajhang)
      [29.45, 81.10],
      [29.30, 81.00], // Dipayal / Silgadhi
      [29.18, 81.12],
      [29.05, 81.25], // Achham (Karnali confluence)
    ],
  },
  {
    id: "chameliya-river",
    name: "Chameliya River",
    nepaliName: "चमेलिया नदी",
    basin: "Mahakali",
    basinNepali: "महाकाली",
    color: "#2DD4BF",
    weight: 2.8,
    origin: "Api Himal massif",
    description: "Rushing river powering the 30 MW Chameliya hydropower plant into the Mahakali.",
    coordinates: [
      [29.85, 80.85], // Api Himal
      [29.75, 80.65],
      [29.65, 80.50], // Gokuleshwor
      [29.60, 80.42], // Mahakali confluence
    ],
  },
  {
    id: "mohana-river",
    name: "Mohana River",
    nepaliName: "मोहना नदी",
    basin: "Mohana",
    basinNepali: "मोहना",
    color: "#0F766E",
    weight: 2.8,
    origin: "Godawari hills of Kailali",
    description: "Border river flowing alongside Dhangadhi municipality into the Karnali system.",
    coordinates: [
      [28.85, 80.60], // Godawari
      [28.78, 80.60],
      [28.70, 80.62], // Dhangadhi
      [28.60, 80.75],
      [28.50, 80.85], // Kailali border
    ],
  },
];
