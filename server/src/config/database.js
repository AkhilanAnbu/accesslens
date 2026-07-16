import { MongoClient } from "mongodb";

let client;
let database;

export async function connectToDatabase() {
  const uri = process.env.MONGO_URI;
  const databaseName = process.env.DATABASE_NAME || "accesslens";

  if (!uri) {
    throw new Error("MONGO_URI is required. Copy server/.env.example to server/.env.");
  }

  client = new MongoClient(uri);
  await client.connect();
  database = client.db(databaseName);
  await createIndexes(database);
  return database;
}

async function createIndexes(db) {
  await Promise.all([
    db.collection("users").createIndex({ email: 1 }, { unique: true }),
    db.collection("places").createIndex({ name: "text", "address.city": "text" }),
    db.collection("places").createIndex({ category: 1, verificationStatus: 1 }),
    db.collection("places").createIndex({ createdBy: 1, updatedAt: -1 })
  ]);
}

export function getDatabase() {
  if (!database) {
    throw new Error("Database has not been connected yet.");
  }
  return database;
}

export async function closeDatabase() {
  await client?.close();
}
