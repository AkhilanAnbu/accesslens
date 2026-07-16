import "dotenv/config";
import { MongoClient, ObjectId } from "mongodb";
import { hashPassword } from "../src/utils/password.js";
import {
  ACCESSIBILITY_FEATURES,
  PLACE_CATEGORIES,
  REPORT_BARRIER_TYPES,
  REPORT_SEVERITIES,
  REPORT_STATUSES
} from "../src/utils/constants.js";

const uri = process.env.MONGO_URI;
const databaseName = process.env.DATABASE_NAME || "accesslens";
const reset = process.argv.includes("--reset");

if (!uri) {
  console.error("MONGO_URI is required. Copy server/.env.example to server/.env first.");
  process.exit(1);
}

const client = new MongoClient(uri);

function createRandom(seed) {
  let value = seed;
  return () => {
    value |= 0;
    value = (value + 0x6d2b79f5) | 0;
    let result = Math.imul(value ^ (value >>> 15), 1 | value);
    result = (result + Math.imul(result ^ (result >>> 7), 61 | result)) ^ result;
    return ((result ^ (result >>> 14)) >>> 0) / 4294967296;
  };
}

const random = createRandom(20260718);
const pick = (items) => items[Math.floor(random() * items.length)];
const sample = (items, min = 2, max = 6) => {
  const copy = [...items];
  const count = Math.floor(random() * (max - min + 1)) + min;
  const result = [];

  while (copy.length && result.length < count) {
    result.push(copy.splice(Math.floor(random() * copy.length), 1)[0]);
  }
  return result;
};

const cities = [
  ["Boston", "MA", "02115"],
  ["Cambridge", "MA", "02139"],
  ["Somerville", "MA", "02143"],
  ["Brookline", "MA", "02446"],
  ["Quincy", "MA", "02169"],
  ["Medford", "MA", "02155"],
  ["Newton", "MA", "02458"],
  ["Malden", "MA", "02148"]
];
const streetNames = [
  "Beacon Street",
  "Huntington Avenue",
  "Massachusetts Avenue",
  "Tremont Street",
  "Washington Street",
  "Boylston Street",
  "Columbus Avenue",
  "Commonwealth Avenue",
  "Broadway",
  "Harvard Street",
  "Main Street",
  "Centre Street"
];
const placePrefixes = [
  "Cardinal",
  "Beacon",
  "Harbor",
  "Riverside",
  "Maple",
  "Common",
  "North Star",
  "Open Door",
  "Rosewood",
  "Cedar",
  "Union",
  "Fenway"
];
const placeSuffixes = {
  Cafe: ["Cafe", "Coffee House", "Roastery"],
  Restaurant: ["Kitchen", "Table", "Bistro"],
  Library: ["Library", "Reading Room", "Learning Center"],
  "Transit Stop": ["Station", "Transit Hub", "Platform"],
  Park: ["Park", "Green", "Garden"],
  Store: ["Market", "Shop", "Collective"],
  Office: ["Office Center", "Workplace", "Services Building"],
  "Event Venue": ["Hall", "Pavilion", "Events Center"],
  Museum: ["Museum", "Gallery", "Exhibit Hall"],
  "Community Center": ["Community Center", "Neighborhood Hub", "Civic Center"]
};
const descriptions = [
  "A public place with entrance, restroom, parking, and interior accessibility information.",
  "A neighborhood location used by residents, students, commuters, and visitors.",
  "This listing includes useful details about step-free routes and available accessibility features.",
  "A community-facing place with practical information to help visitors plan ahead.",
  "The listing contains accessibility details gathered from recent visits and updates."
];

const reportDescriptions = {
  "Step or stairs": [
    "Two unmarked steps at the main entrance with no ramp alternative nearby.",
    "A single step at the doorway makes wheeled entry difficult without help."
  ],
  "Broken elevator": [
    "The only elevator to the upper floor was out of service during my visit.",
    "Elevator display showed an error and the doors would not open."
  ],
  "Blocked ramp": [
    "The ramp was partially blocked by stored equipment and hard to use.",
    "Delivery boxes were left on the ramp, leaving too little clearance."
  ],
  "Narrow entrance": [
    "The entrance doorway is too narrow for a standard wheelchair to pass comfortably.",
    "A turnstile at the entry point does not leave room for a mobility device."
  ],
  "Inaccessible restroom": [
    "The accessible restroom was locked and no staff member had a key available.",
    "Grab bars in the restroom were loose and the stall was too small to turn in."
  ],
  "Missing signage": [
    "There is no signage directing visitors to the step-free entrance.",
    "Accessible routes are not marked, so first-time visitors get lost."
  ],
  "Parking barrier": [
    "Accessible parking spaces were occupied by vehicles without permits.",
    "The accessible parking bay has no dropped curb connecting it to the entrance."
  ],
  "Seating obstruction": [
    "Movable chairs crowd the aisle and block the wheelchair seating area.",
    "The reserved accessible seating was being used for storage."
  ],
  Other: [
    "Lighting at the entrance is very low, which makes the step-free route hard to find.",
    "Background noise made it difficult to use the space with a hearing device."
  ]
};

const suggestedFixes = [
  "Install a compliant ramp beside the existing steps.",
  "Add clear signage pointing to the step-free entrance.",
  "Schedule regular maintenance so the elevator stays in service.",
  "Keep the ramp and accessible routes clear of stored items.",
  "Repair the grab bars and confirm the accessible restroom stays unlocked.",
  "Reserve and enforce the accessible parking spaces.",
  "Widen the entry path or provide an alternative accessible door.",
  "Keep the designated accessible seating clear during busy hours.",
  ""
];

async function run() {
  await client.connect();
  const db = client.db(databaseName);
  const usersCollection = db.collection("users");
  const placesCollection = db.collection("places");
  const reportsCollection = db.collection("reports");

  if (reset) {
    await Promise.all([
      usersCollection.deleteMany({}),
      placesCollection.deleteMany({}),
      db.collection("reports").deleteMany({})
    ]);
    console.log("Existing AccessLens data removed.");
  } else {
    const existingPlaces = await placesCollection.countDocuments();
    if (existingPlaces > 0) {
      console.log(
        `Seed skipped because ${existingPlaces} places already exist. Use --reset to reseed.`
      );
      await client.close();
      return;
    }
  }

  const passwordHash = await hashPassword("Access123!");
  const now = new Date();
  const demoUsers = [
    ["Akhilan Anbu", "akhilan@accesslens.demo"],
    ["Santhosh Malarvannan", "santhosh@accesslens.demo"],
    ["Maya Chen", "maya@accesslens.demo"],
    ["Jordan Lee", "jordan@accesslens.demo"]
  ].map(([name, email]) => ({
    _id: new ObjectId(),
    name,
    email,
    passwordHash,
    createdAt: now,
    updatedAt: now
  }));
  await usersCollection.insertMany(demoUsers);

  const places = Array.from({ length: 1005 }, (_, index) => {
    const category = pick(PLACE_CATEGORIES);
    const [city, state, postalCode] = pick(cities);
    const prefix = pick(placePrefixes);
    const suffix = pick(placeSuffixes[category]);
    const createdAt = new Date(Date.now() - Math.floor(random() * 365) * 86400000);
    const updatedAt = new Date(createdAt.getTime() + Math.floor(random() * 90) * 86400000);

    return {
      _id: new ObjectId(),
      name: `${prefix} ${suffix} ${index + 1}`,
      category,
      address: {
        street: `${Math.floor(random() * 900) + 10} ${pick(streetNames)}`,
        city,
        state,
        postalCode
      },
      accessibilityFeatures: sample(ACCESSIBILITY_FEATURES, 2, 7),
      description: pick(descriptions),
      contact: {
        phone: `(617) 555-${String(1000 + (index % 9000)).padStart(4, "0")}`,
        website: `https://example.org/accesslens-place-${index + 1}`
      },
      verificationStatus: random() > 0.32 ? "Verified" : "Pending",
      createdBy: pick(demoUsers)._id,
      createdAt,
      updatedAt
    };
  });
  await placesCollection.insertMany(places);

  const statusWeights = [
    ["Open", 0.55],
    ["In Review", 0.2],
    ["Fixed", 0.18],
    ["Not Applicable", 0.07]
  ];
  function pickStatus() {
    const roll = random();
    let cumulative = 0;
    for (const [value, weight] of statusWeights) {
      cumulative += weight;
      if (roll <= cumulative) {
        return value;
      }
    }
    return REPORT_STATUSES[0];
  }

  const reports = Array.from({ length: 1600 }, () => {
    const place = pick(places);
    const barrierType = pick(REPORT_BARRIER_TYPES);
    const createdAt = new Date(Date.now() - Math.floor(random() * 200) * 86400000);
    const updatedAt = new Date(createdAt.getTime() + Math.floor(random() * 30) * 86400000);

    return {
      _id: new ObjectId(),
      placeId: place._id,
      barrierType,
      severity: pick(REPORT_SEVERITIES),
      description: pick(reportDescriptions[barrierType]),
      suggestedFix: pick(suggestedFixes),
      status: pickStatus(),
      createdBy: pick(demoUsers)._id,
      createdAt,
      updatedAt
    };
  });
  await reportsCollection.insertMany(reports);

  await Promise.all([
    usersCollection.createIndex({ email: 1 }, { unique: true }),
    placesCollection.createIndex({ name: "text", "address.city": "text" }),
    placesCollection.createIndex({ category: 1, verificationStatus: 1 }),
    placesCollection.createIndex({ createdBy: 1, updatedAt: -1 }),
    reportsCollection.createIndex({ placeId: 1, createdAt: -1 }),
    reportsCollection.createIndex({ status: 1, severity: 1 }),
    reportsCollection.createIndex({ createdBy: 1, createdAt: -1 })
  ]);

  console.log("AccessLens seed complete.");
  console.log(`Users: ${demoUsers.length}`);
  console.log(`Places: ${places.length}`);
  console.log(`Accessibility reports: ${reports.length}`);
  console.log("Demo password for every seeded account: Access123!");
  await client.close();
}

run().catch(async (error) => {
  console.error(error);
  await client.close();
  process.exit(1);
});