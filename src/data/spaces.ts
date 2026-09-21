export interface SpaceItem {
  id: string;
  category: "desk" | "meeting_room" | "private_office";
  categoryLabel: string;
  badgeTag: string;
  badgeColor: string;
  capacity: string;
  capacityNumber: number;
  location: string;
  floorZone: string;
  title: string;
  description: string;
  fullDescription: string;
  amenities: string[];
  specs: {
    dimensions: string;
    seating: string;
    internet: string;
    power: string;
    acoustic: string;
    climate: string;
  };
  rate: number;
  image: string;
  secondaryImage1: string;
  secondaryImage2: string;
  allPhotos: string[];
  actionText: string;
  hasWhiteboard: boolean;
}

export const SPACES_DATA: SpaceItem[] = [
  {
    id: "personal-desk-flexi-01",
    category: "desk",
    categoryLabel: "Personal Desk",
    badgeTag: "Instant Book",
    badgeColor: "bg-[#D5F066] text-[#0E0F12]",
    capacity: "👤 1 Person",
    capacityNumber: 1,
    location: "Moklet Hub • Level 2",
    floorZone: "ZONE B (SILENT ATRIUM)",
    title: "Personal Desk - Flexi 01",
    description:
      "Individual acoustic partition booth designed for deep focus and sprint tasks.",
    fullDescription:
      "Individual acoustic partition workstation engineered for intense focus, deep programming sprints, and high-bandwidth creative workflows. Situated in the acoustic-damped North Atrium with filtered natural morning light.",
    amenities: [
      "100Mbps Fiber WiFi",
      "AC Cold",
      "Power Outlet",
      "Free Artisan Coffee",
      "Ergonomic Chair",
      "Privacy Acoustic Shield",
    ],
    specs: {
      dimensions: "160cm × 80cm Electric Sit-Stand Desk (Height 65–125cm)",
      seating: "Herman Miller Aeron (Fully Adjustable Lumbar & Tilt)",
      internet: "100Mbps Dedicated Low-Latency Optical Fiber",
      power: "2× 230V AC Plugs + 65W USB-C PD Fast Charging",
      acoustic: "38dB Acoustic Absorption Partition Felt",
      climate: "Central HEPA Filtration, Continuous 22°C Climate",
    },
    rate: 20000,
    image:
      "https://images.unsplash.com/photo-1527192491265-7e15c55b1ed2?auto=format&fit=crop&w=1200&q=85",
    secondaryImage1:
      "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&q=85",
    secondaryImage2:
      "https://images.unsplash.com/photo-1497215842964-222b430dc094?auto=format&fit=crop&w=800&q=85",
    allPhotos: [
      "https://images.unsplash.com/photo-1527192491265-7e15c55b1ed2?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1497215842964-222b430dc094?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1517502884422-41eaead166d4?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=85",
    ],
    actionText: "Reserve Desk →",
    hasWhiteboard: false,
  },
  {
    id: "meeting-room-alpha",
    category: "meeting_room",
    categoryLabel: "Meeting Room",
    badgeTag: "Popular Slot",
    badgeColor: "bg-[#FEF3C7] text-[#92400E]",
    capacity: "👥 Up to 8 Persons",
    capacityNumber: 8,
    location: "Executive Wing • L3",
    floorZone: "ZONE A (CONFERENCE WING)",
    title: "Meeting Room Alpha",
    description:
      "Sound-insulated glass suite configured for executive strategy sessions and client pitches.",
    fullDescription:
      "Sound-insulated glass meeting suite equipped with high-definition wireless presentation TV, smart conference audio, and interactive magnetic glass whiteboard for seamless agile brainstorming and executive presentations.",
    amenities: [
      "55\" 4K Smart TV",
      "Soundbar Audio",
      "Presentation Board",
      "Conference Cam",
      "Dual Polycom Mic",
      "High-Speed WiFi",
      "AC Cold Climate",
    ],
    specs: {
      dimensions: "350cm × 280cm Acoustic Glass Enclosure",
      seating: "8 Executive Ergonomic Leather Swivel Chairs",
      internet: "200Mbps Ultra-Fast Low-Jitter WiFi 6 + LAN",
      power: "8× In-Desk Pop-Up AC Outlets & HDMI/Type-C Display Hub",
      acoustic: "45dB Sound-Proof Double-Glazed Glass Walls",
      climate: "Independent Smart Thermostat 20°C–24°C",
    },
    rate: 10000,
    image:
      "https://images.unsplash.com/photo-1517502884422-41eaead166d4?auto=format&fit=crop&w=1200&q=85",
    secondaryImage1:
      "https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=800&q=85",
    secondaryImage2:
      "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=85",
    allPhotos: [
      "https://images.unsplash.com/photo-1517502884422-41eaead166d4?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1527192491265-7e15c55b1ed2?auto=format&fit=crop&w=1200&q=85",
    ],
    actionText: "Reserve Room →",
    hasWhiteboard: false,
  },
  {
    id: "executive-private-office-02",
    category: "private_office",
    categoryLabel: "Private Office",
    badgeTag: "Dedicated Lock",
    badgeColor: "bg-[#0E0F12] text-white",
    capacity: "👥 4–6 Persons",
    capacityNumber: 6,
    location: "Studio 05 • North Wing",
    floorZone: "ZONE C (STUDIO SUITES)",
    title: "Executive Private Office 02",
    description:
      "Architectural concrete suite with private lounge space and acoustic floor-to-ceiling glass.",
    fullDescription:
      "Turnkey private office suite engineered for high-performance squads. Includes dedicated smart biometric keycard door lock, modular team desk array, private collaboration area, and lounge corner.",
    amenities: [
      "24/7 Smart Keycard",
      "Herman Miller Chairs",
      "Private Lounge",
      "Acoustic Glass",
      "Dedicated LAN Router",
      "Cold AC Climate",
    ],
    specs: {
      dimensions: "450cm × 360cm Secure Private Lock Suite",
      seating: "6 Adjustable Task Chairs + 3-Seater Leather Lounge",
      internet: "Dedicated 300Mbps Subnet with Custom SSID & LAN",
      power: "12× Surge-Protected Outlets + Dual Display Station",
      acoustic: "50dB Heavyweight Sound-Insulated Privacy Enclosure",
      climate: "Independent Daikin Inverter AC with Remote",
    },
    rate: 150000,
    image:
      "https://images.unsplash.com/photo-1497215842964-222b430dc094?auto=format&fit=crop&w=1200&q=85",
    secondaryImage1:
      "https://images.unsplash.com/photo-1527192491265-7e15c55b1ed2?auto=format&fit=crop&w=800&q=85",
    secondaryImage2:
      "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&q=85",
    allPhotos: [
      "https://images.unsplash.com/photo-1497215842964-222b430dc094?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1527192491265-7e15c55b1ed2?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1517502884422-41eaead166d4?auto=format&fit=crop&w=1200&q=85",
    ],
    actionText: "Reserve Suite →",
    hasWhiteboard: false,
  },
  {
    id: "the-ascent-boardroom",
    category: "meeting_room",
    categoryLabel: "Boardroom Suite",
    badgeTag: "Panoramic View",
    badgeColor: "bg-[#FEF9C3] text-[#854D0E]",
    capacity: "👥 Up to 14 Persons",
    capacityNumber: 14,
    location: "Penthouse Level • Skyview",
    floorZone: "ZONE D (EXECUTIVE PENTHOUSE)",
    title: "The Ascent Boardroom",
    description:
      "High-tier boardroom featuring marble finishes, Italian leather seating, and skyline views.",
    fullDescription:
      "Ultra-luxurious boardroom suite designed for shareholder summits, international conferences, and investor pitches. Fitted with dual 75-inch UHD commercial displays, presentation wall, and 360-degree beamforming microphones.",
    amenities: [
      "Dual 75\" UHD Displays",
      "Polycom Conference",
      "Acoustic Glass Wall",
      "Private Bar",
      "Dedicated Butler",
      "High-Speed Fiber 500Mbps",
    ],
    specs: {
      dimensions: "700cm × 420cm Panoramic Penthouse Hall",
      seating: "14 Italian Leather Ergonomic High-Back Chairs",
      internet: "500Mbps Enterprise Dedicated Leased Line",
      power: "Recessed Central Marble Power Rails with Global Adapters",
      acoustic: "52dB Acoustic Baffle Ceiling & Sound-Dampening Velvet",
      climate: "Dual Zone Precision Air Conditioning & Purifier",
    },
    rate: 250000,
    image:
      "https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1200&q=85",
    secondaryImage1:
      "https://images.unsplash.com/photo-1517502884422-41eaead166d4?auto=format&fit=crop&w=800&q=85",
    secondaryImage2:
      "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=85",
    allPhotos: [
      "https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1517502884422-41eaead166d4?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=85",
    ],
    actionText: "Reserve Boardroom →",
    hasWhiteboard: false,
  },
  {
    id: "focus-station-dusk",
    category: "desk",
    categoryLabel: "Personal Desk",
    badgeTag: "Silent Zone",
    badgeColor: "bg-[#0E0F12] text-white",
    capacity: "👤 1 Person",
    capacityNumber: 1,
    location: "Silent Library Wing",
    floorZone: "ZONE B (SILENT ATRIUM)",
    title: "Focus Station Dusk",
    description:
      "Quiet alcove equipped with warm luminaire and calibrated ergonomics for long sprints.",
    fullDescription:
      "Architectural quiet station with custom walnut finish, warm dimmable OLED task lighting, calibrated Herman Miller seating, and noise-damping felt divider walls.",
    amenities: [
      "Zero-Distraction",
      "Warm Ambient Light",
      "Terrazzo Floor",
      "Monitor Arm",
      "100Mbps WiFi",
      "AC Cold Climate",
    ],
    specs: {
      dimensions: "150cm × 75cm Solid Walnut Ergonomic Worktop",
      seating: "Steelcase Gesture Ergonomic Task Chair",
      internet: "100Mbps Low-Ping WiFi",
      power: "Triple 230V Socket + USB-C 100W PD Power Delivery",
      acoustic: "40dB Acoustic Fluted Wood Baffle System",
      climate: "Silent Constant 22.5°C Air Conditioning",
    },
    rate: 25000,
    image:
      "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=85",
    secondaryImage1:
      "https://images.unsplash.com/photo-1527192491265-7e15c55b1ed2?auto=format&fit=crop&w=800&q=85",
    secondaryImage2:
      "https://images.unsplash.com/photo-1497215842964-222b430dc094?auto=format&fit=crop&w=800&q=85",
    allPhotos: [
      "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1527192491265-7e15c55b1ed2?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1497215842964-222b430dc094?auto=format&fit=crop&w=1200&q=85",
    ],
    actionText: "Reserve Desk →",
    hasWhiteboard: false,
  },
  {
    id: "atrium-open-bench-06",
    category: "desk",
    categoryLabel: "Open Coworking",
    badgeTag: "Community",
    badgeColor: "bg-[#D5F066] text-[#0E0F12]",
    capacity: "👥 Open Seating",
    capacityNumber: 4,
    location: "Central Atrium • Ground Level",
    floorZone: "ZONE E (CENTRAL COMMONS)",
    title: "Atrium Open Bench 06",
    description:
      "Sunlit timber long table suited for energetic team co-working and casual pairing.",
    fullDescription:
      "Spacious communal oak bench situated in the vibrant central atrium under natural atrium daylight. Ideal for casual pair-programming, coffee-fueled creative brainstorms, and community networking.",
    amenities: [
      "Natural Skylight",
      "Lush Greenery",
      "Community Pantry",
      "Sit-Stand Option",
      "Power Strips",
      "Barista Coffee Bar",
    ],
    specs: {
      dimensions: "360cm × 100cm Solid White Oak Shared Bench",
      seating: "4 Ergonomic Mesh Swivel Stools",
      internet: "150Mbps High-Density Mesh WiFi",
      power: "Central Pop-Up Multi-Standard Power Strip",
      acoustic: "Open Energetic Ambient Café Soundscape",
      climate: "Fresh Air Ventilation + 23°C Central Climate",
    },
    rate: 15000,
    image:
      "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=85",
    secondaryImage1:
      "https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=800&q=85",
    secondaryImage2:
      "https://images.unsplash.com/photo-1517502884422-41eaead166d4?auto=format&fit=crop&w=800&q=85",
    allPhotos: [
      "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1517502884422-41eaead166d4?auto=format&fit=crop&w=1200&q=85",
    ],
    actionText: "Reserve Bench →",
    hasWhiteboard: false,
  },
];

export function mapBackendSpaceToSpaceItem(s: any): SpaceItem {
  const tipe = s.tipe || "desk";
  let defaultImg = "https://images.unsplash.com/photo-1527192491265-7e15c55b1ed2?auto=format&fit=crop&w=1200&q=85";
  let categoryLabel = "Personal Desk";
  let badgeColor = "bg-[#D5F066] text-[#0E0F12]";
  let actionText = "Book Desk →";

  if (tipe === "meeting_room") {
    defaultImg = "https://images.unsplash.com/photo-1517502884422-41eaead166d4?auto=format&fit=crop&w=1200&q=85";
    categoryLabel = "Meeting Room";
    badgeColor = "bg-[#111111] text-white";
    actionText = "Book Room →";
  } else if (tipe === "private_office") {
    defaultImg = "https://images.unsplash.com/photo-1497215842964-222b430dc094?auto=format&fit=crop&w=1200&q=85";
    categoryLabel = "Private Office";
    badgeColor = "bg-[#F3F4F6] text-[#111111] border border-[#E5E7EB]";
    actionText = "Book Suite →";
  }

  const foto = s.foto && s.foto.startsWith("http") ? s.foto : defaultImg;

  return {
    id: String(s.id),
    category: tipe,
    categoryLabel,
    badgeTag: "Live Available",
    badgeColor,
    capacity: `👤 ${s.kapasitas || 1} Pax`,
    capacityNumber: Number(s.kapasitas || 1),
    location: s.nama_coworking || "Moklet Hub Coworking Space",
    floorZone: "ZONE A (MAIN SUITE)",
    title: s.nama_space || "Coworking Space",
    description: s.deskripsi || "Fasilitas workstation modern dan konektivitas tinggi.",
    fullDescription: s.deskripsi || "Fasilitas workstation modern dengan colokan listrik, WiFi kencang, dan air mineral gratis.",
    amenities: [
      "100Mbps Fiber WiFi",
      "Full AC Cold",
      "Power Outlet Strip",
      "Free Artisan Coffee",
      "Ergonomic Chair",
    ],
    specs: {
      dimensions: "Modern Ergonomic Layout",
      seating: `${s.kapasitas || 1} Ergonomic Seating`,
      internet: "100Mbps Fiber Optic Low Latency",
      power: "230V AC Plugs + USB-C PD",
      acoustic: "Sound Dampened Partition",
      climate: "Continuous 22°C Air Conditioned",
    },
    rate: Number(s.harga_per_jam || 20000),
    image: foto,
    secondaryImage1: foto,
    secondaryImage2: foto,
    allPhotos: [foto],
    actionText,
    hasWhiteboard: tipe === "meeting_room",
  };
}

export function getSpaceById(id: string | number, extraSpaces: SpaceItem[] = []): SpaceItem {
  const strId = String(id).toLowerCase();
  
  // Try match in extraSpaces (live backend spaces)
  const foundExtra = extraSpaces.find((s) => s.id.toLowerCase() === strId || s.title.toLowerCase().includes(strId));
  if (foundExtra) return foundExtra;

  // Try exact match on string slug in static fallback
  const found = SPACES_DATA.find((s) => s.id.toLowerCase() === strId);
  if (found) return found;

  // Try numeric ID mapping (1 -> index 0, 2 -> index 1, 3 -> index 2)
  const num = parseInt(strId, 10);
  if (!isNaN(num) && num >= 1 && num <= SPACES_DATA.length) {
    return SPACES_DATA[num - 1];
  }

  return SPACES_DATA[0];
}
