// W-Trek itinerary data — distances, elevations, times based on standard W-Trek references
// Coordinates are schematic (0-100 grid) representing the "W" shape of the trail
window.WTREK_DATA = {
  trip: {
    title: "W-Trek · Torres del Paine",
    dates: "Dec 29, 2026 — Jan 2, 2027",
    totalMiles: 41,
    nights: 4,
    direction: "East → West"
  },

  // Schematic node layout — forms the "W" shape across the canvas
  // x: 0 (west, Grey) → 100 (east, Welcome Center)
  // y: 0 (top, mountains) → 100 (bottom, lakes)
  // Positions/curves visually match the W-Trek reference map (relative spacing > strict accuracy)
  nodes: [
    // East — Las Torres trailhead
    { id: "welcome-center",   label: "Las Torres / Central", type: "trailhead", lngLat: [-72.85892, -50.97118], sub: "Park entry · trip start", busLabel: "From Puerto Natales: bus to Laguna Amarga + shuttle (~3hrs total)" },
    { id: "chileno",          label: "Refugio Chileno", type: "camp",     lngLat: [-72.92725, -50.94740], sub: "Night 1", elev: 1115, nights: [1] },
    { id: "base-torres",      label: "Base de las Torres", type: "viewpoint", lngLat: [-72.95883, -50.92035], sub: "Sunrise mirador", elev: 2950 },

    // Middle — lakeside refugios on Lago Nordenskjöld
    { id: "cuernos",          label: "Refugio Cuernos", type: "camp",     lngLat: [-72.98664, -51.02131], sub: "Night 2", elev: 820, nights: [2] },
    { id: "italiano",         label: "Camp Italiano", type: "junction",   lngLat: [-73.03968, -51.01753], sub: "Daypack drop", elev: 720 },

    // French Valley
    { id: "britanico",        label: "Mirador Británico", type: "viewpoint", lngLat: [-73.04741, -50.97270], sub: "French Valley head", elev: 2460 },

    // West — Paine Grande / Grey / Glacier Mirador
    { id: "paine-grande",     label: "Refugio Paine Grande", type: "camp", lngLat: [-73.08861, -51.07080], sub: "Night 3 (NYE)", elev: 148, nights: [3] },
    { id: "grey",             label: "Refugio Grey", type: "camp",        lngLat: [-73.14766, -51.02542], sub: "Night 4", elev: 820, nights: [4] },
    { id: "mirador-grey",     label: "Mirador Glaciar Grey", type: "viewpoint", lngLat: [-73.17400, -50.99300], sub: "Glacier face · Day 4 out-and-back", elev: 950 },

    // Catamaran landing
    { id: "pudeto",           label: "Pudeto", type: "transit",           lngLat: [-73.00278, -51.07560], sub: "Catamaran landing · trip end", busLabel: "From Pudeto: bus back to Puerto Natales (~2.5hrs)" }
  ],

  // Trail polylines — smooth curves connecting the camp positions
  trails: {
    "welcome-chileno": [
      [-72.85892, -50.97118], [-72.87100, -50.96780], [-72.88300, -50.96400],
      [-72.89500, -50.95960], [-72.90600, -50.95500], [-72.91700, -50.95100],
      [-72.92725, -50.94740]
    ],
    "chileno-base": [
      [-72.92725, -50.94740], [-72.93300, -50.94250], [-72.93950, -50.93700],
      [-72.94600, -50.93100], [-72.95200, -50.92580], [-72.95600, -50.92250],
      [-72.95883, -50.92035]
    ],
    "chileno-cuernos": [
      [-72.92725, -50.94740], [-72.92100, -50.95400], [-72.91500, -50.96200],
      [-72.91200, -50.97100], [-72.91500, -50.98000], [-72.92200, -50.98800],
      [-72.93200, -50.99500], [-72.94400, -51.00200], [-72.95700, -51.00800],
      [-72.97000, -51.01400], [-72.98000, -51.01800], [-72.98664, -51.02131]
    ],
    "cuernos-italiano": [
      [-72.98664, -51.02131], [-72.99500, -51.02100], [-73.00400, -51.02050],
      [-73.01100, -51.02000], [-73.01800, -51.01950], [-73.02500, -51.01890],
      [-73.03200, -51.01830], [-73.03968, -51.01753]
    ],
    "italiano-britanico": [
      [-73.03968, -51.01753], [-73.04050, -51.01100], [-73.04200, -51.00400],
      [-73.04350, -50.99700], [-73.04450, -50.99000], [-73.04550, -50.98400],
      [-73.04680, -50.97700], [-73.04741, -50.97270]
    ],
    "italiano-painegrande": [
      [-73.03968, -51.01753], [-73.04400, -51.02400], [-73.04900, -51.03200],
      [-73.05500, -51.04000], [-73.06200, -51.04800], [-73.07000, -51.05600],
      [-73.07800, -51.06200], [-73.08400, -51.06700], [-73.08861, -51.07080]
    ],
    "painegrande-grey": [
      [-73.08861, -51.07080], [-73.09600, -51.06500], [-73.10500, -51.05900],
      [-73.11500, -51.05300], [-73.12500, -51.04600], [-73.13400, -51.03900],
      [-73.14100, -51.03300], [-73.14500, -51.02900], [-73.14766, -51.02542]
    ],
    "grey-mirador": [
      [-73.14766, -51.02542], [-73.15300, -51.01900], [-73.15900, -51.01200],
      [-73.16400, -51.00600], [-73.16900, -51.00000], [-73.17200, -50.99600],
      [-73.17400, -50.99300]
    ],
    // Catamaran: U-shape dipping south into Lago Pehoé before turning east to Pudeto
    "painegrande-pudeto": [
      [-73.08861, -51.07080], [-73.08700, -51.08100], [-73.08200, -51.09000],
      [-73.07400, -51.09700], [-73.06200, -51.10200], [-73.04800, -51.10400],
      [-73.03400, -51.10200], [-73.02200, -51.09700], [-73.01300, -51.09000],
      [-73.00800, -51.08200], [-73.00400, -51.07900], [-73.00278, -51.07560]
    ]
  },

  // Trail segments connect nodes in walking order
  // Each segment carries day, distance, elevation gain/loss, difficulty, time window
  segments: [
    { id: "s1b", from: "welcome-center", to: "chileno", day: 1, mode: "hike",
      distance: 3.4, gain: 1115, loss: 60, hours: 2.0, difficulty: "moderate",
      depart: "1:00 pm", arrive: "3:00 pm", trail: "welcome-chileno",
      label: "Welcome Center → Chileno" },

    { id: "s2a", from: "chileno", to: "base-torres", day: 2, mode: "hike",
      distance: 2.0, gain: 1835, loss: 0, hours: 1.75, difficulty: "hard",
      depart: "4:30 am", arrive: "6:15 am", trail: "chileno-base",
      label: "Pre-dawn climb to towers", hero: "Base Torres sunrise" },
    { id: "s2b", from: "base-torres", to: "chileno", day: 2, mode: "hike",
      distance: 2.0, gain: 0, loss: 1835, hours: 1.5, difficulty: "moderate",
      depart: "7:30 am", arrive: "9:00 am", trail: "chileno-base", reverse: true,
      label: "Descend to Chileno" },
    { id: "s2c", from: "chileno", to: "cuernos", day: 2, mode: "hike",
      distance: 6.8, gain: 980, loss: 1275, hours: 5.0, difficulty: "moderate",
      depart: "10:00 am", arrive: "3:00 pm", trail: "chileno-cuernos",
      label: "Lakeside traverse to Cuernos" },

    { id: "s3a", from: "cuernos", to: "italiano", day: 3, mode: "hike",
      distance: 3.4, gain: 320, loss: 420, hours: 2.0, difficulty: "moderate",
      depart: "7:30 am", arrive: "9:30 am", trail: "cuernos-italiano",
      label: "Cuernos → Italiano · drop pack" },
    { id: "s3b", from: "italiano", to: "britanico", day: 3, mode: "hike",
      distance: 3.4, gain: 1740, loss: 0, hours: 2.5, difficulty: "hard",
      depart: "9:45 am", arrive: "12:15 pm", trail: "italiano-britanico",
      label: "French Valley climb (daypack)" },
    { id: "s3c", from: "britanico", to: "italiano", day: 3, mode: "hike",
      distance: 3.4, gain: 0, loss: 1740, hours: 2.0, difficulty: "moderate",
      depart: "12:45 pm", arrive: "2:45 pm", trail: "italiano-britanico", reverse: true,
      label: "Descend valley · pick up pack" },
    { id: "s3d", from: "italiano", to: "paine-grande", day: 3, mode: "hike",
      distance: 4.7, gain: 350, loss: 920, hours: 2.5, difficulty: "moderate",
      depart: "3:00 pm", arrive: "5:30 pm", trail: "italiano-painegrande",
      label: "To Paine Grande · NYE bar" },

    { id: "s4a", from: "paine-grande", to: "grey", day: 4, mode: "hike",
      distance: 6.8, gain: 1380, loss: 700, hours: 4.0, difficulty: "moderate",
      depart: "9:00 am", arrive: "1:00 pm", trail: "painegrande-grey",
      label: "Glacier Grey approach", hero: "Glacier views, hanging bridges" },
    { id: "s4b", from: "grey", to: "mirador-grey", day: 4, mode: "hike",
      distance: 1.9, gain: 320, loss: 180, hours: 1.25, difficulty: "moderate",
      depart: "2:30 pm", arrive: "3:45 pm", trail: "grey-mirador",
      label: "Out to Mirador Glaciar Grey", hero: "Glacier face panorama" },
    { id: "s4c", from: "mirador-grey", to: "grey", day: 4, mode: "hike",
      distance: 1.9, gain: 180, loss: 320, hours: 1.0, difficulty: "moderate",
      depart: "4:00 pm", arrive: "5:00 pm", trail: "grey-mirador", reverse: true,
      label: "Return to Refugio Grey" },

    { id: "s5a", from: "grey", to: "paine-grande", day: 5, mode: "hike",
      distance: 6.8, gain: 700, loss: 1380, hours: 3.75, difficulty: "moderate",
      depart: "8:00 am", arrive: "11:45 am", trail: "painegrande-grey", reverse: true,
      label: "Return to Paine Grande" },
    { id: "s5b", from: "paine-grande", to: "pudeto", day: 5, mode: "ferry",
      distance: 0, gain: 0, loss: 0, hours: 0.5, difficulty: "transit",
      depart: "12:30 pm", arrive: "1:00 pm", trail: "painegrande-pudeto",
      label: "Catamaran across Lago Pehoé · $26pp cash" }
  ],

  days: [
    { day: 1, date: "Tue · Dec 29", title: "Arrival",       miles: 3.2,  difficulty: "Easy",
      blurb: "Shuttle to the Welcome Center, then a short uphill push to Chileno. Eat early. Sleep early — you're up at 4am.",
      weather: { high: 62, low: 45, wind: 18, conditions: "Partly cloudy", icon: "partly",
        dress: "Light layers — hiking shirt + light wind shell. Bring a warm midlayer for the valley as you climb.",
        sunrise: "5:42 am", sunset: "9:58 pm" },
      gear: ["Headlamp staged for 4am", "Layers laid out", "Trail snacks portioned", "Water bottles filled", "Camera battery charged"] },
    { day: 2, date: "Wed · Dec 30", title: "Towers Sunrise", miles: 12.5, difficulty: "Hard",
      blurb: "The big one. Pre-dawn climb up the moraine for sunrise on the granite towers, back to Chileno for breakfast, then a long lakeside push to Cuernos.",
      weather: { high: 58, low: 32, wind: 35, conditions: "Cold & windy at base, sunny after", icon: "sun-wind",
        dress: "Full warm kit at the base — down jacket, beanie, gloves, wind shell. Strip layers fast once the sun's up; it gets hot on the traverse.",
        sunrise: "5:43 am", sunset: "9:58 pm" },
      gear: ["Headlamp + spare batteries", "Warm hat & gloves (summit cold)", "Wind shell", "1L hot tea in thermos", "Trekking poles", "Sunscreen & sunglasses"] },
    { day: 3, date: "Thu · Dec 31", title: "French Valley · NYE", miles: 12.5, difficulty: "Hard",
      blurb: "Drop the big pack at Italiano, daypack the French Valley to Mirador Británico, descend, re-shoulder, push to Paine Grande. NYE at the bar.",
      weather: { high: 60, low: 42, wind: 45, conditions: "Very windy, sun & cloud", icon: "wind",
        dress: "Wind shell mandatory — the valley funnels gusts up to 50mph. Sunglasses for the glacial light. T-shirt under the shell.",
        sunrise: "5:44 am", sunset: "9:58 pm" },
      gear: ["Daypack stuffsack", "Wind shell (valley gusts)", "Champagne $$$ for NYE", "Lighter layer for the climb", "Snacks for valley summit"] },
    { day: 4, date: "Fri · Jan 1", title: "Glacier Grey", miles: 10.6, difficulty: "Moderate",
      blurb: "New Year's Day. Hike up to Refugio Grey along the lake's east shore, drop pack, then a quick out-and-back to Mirador Glaciar Grey for the full glacier face panorama.",
      weather: { high: 55, low: 40, wind: 28, conditions: "Cool, breeze off the ice", icon: "cloud",
        dress: "Midlayer + wind shell. Mirador exposed and chilly — add a beanie for the viewpoint.",
        sunrise: "5:45 am", sunset: "9:58 pm" },
      gear: ["Camera (the glacier)", "Mid layer for breeze off ice", "Lunch from Paine Grande", "Whisky flask (glacier ice optional)", "Headlamp for late return from mirador"] },
    { day: 5, date: "Sat · Jan 2", title: "Finale", miles: 6.8, difficulty: "Easy",
      blurb: "Retrace to Paine Grande, $26 cash for the catamaran across Lago Pehoé. Trip ends at Pudeto.",
      weather: { high: 64, low: 46, wind: 22, conditions: "Mild, partly sunny", icon: "partly",
        dress: "Hiking shirt, light wind layer in pack. Sunny on the ferry deck — sunglasses & sunscreen.",
        sunrise: "5:46 am", sunset: "9:57 pm" },
      gear: ["$26 USD/CLP cash per person", "Passport", "Dry shirt for the bus", "Snacks for the ride"] }
  ]
};
