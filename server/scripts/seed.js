import "dotenv/config";
import { MongoClient, ObjectId } from "mongodb";
import { hashPassword } from "../src/utils/password.js";
import { ACCESSIBILITY_FEATURES, PLACE_CATEGORIES } from "../src/utils/constants.js";

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

async function run() {
  await client.connect();
  const db = client.db(databaseName);
  const usersCollection = db.collection("users");
  const placesCollection = db.collection("places");

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

  await Promise.all([
    usersCollection.createIndex({ email: 1 }, { unique: true }),
    placesCollection.createIndex({ name: "text", "address.city": "text" }),
    placesCollection.createIndex({ category: 1, verificationStatus: 1 }),
    placesCollection.createIndex({ createdBy: 1, updatedAt: -1 })
  ]);

  console.log("AccessLens Akhilan seed complete.");
  console.log(`Users: ${demoUsers.length}`);
  console.log(`Places: ${places.length}`);
  console.log("Accessibility reports: 0 (reserved for Santhosh)");
  console.log("Demo password for every seeded account: Access123!");
  await client.close();
}

run().catch(async (error) => {
  console.error(error);
  await client.close();
  process.exit(1);
});
