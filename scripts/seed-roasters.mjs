import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "../drizzle/schema.js";

const connection = await mysql.createConnection(process.env.DATABASE_URL);
const db = drizzle(connection, { schema, mode: "default" });

const sampleRoasters = [
  {
    name: "Blue Bottle Coffee",
    description: "Specialty coffee roaster known for meticulous sourcing and roasting techniques. Committed to freshness and quality.",
    address: "315 Linden St",
    city: "San Francisco",
    state: "CA",
    country: "USA",
    zipCode: "94102",
    latitude: "37.7749",
    longitude: "-122.4194",
    phone: "(510) 653-3394",
    email: "info@bluebottlecoffee.com",
    website: "https://bluebottlecoffee.com",
    beanOrigins: JSON.stringify(["Ethiopia", "Colombia", "Guatemala"]),
    roastStyles: JSON.stringify(["Light", "Medium"]),
    specialties: JSON.stringify(["Single Origin", "Pour Over", "Espresso"]),
    hours: JSON.stringify({
      monday: "7:00 AM - 6:00 PM",
      tuesday: "7:00 AM - 6:00 PM",
      wednesday: "7:00 AM - 6:00 PM",
      thursday: "7:00 AM - 6:00 PM",
      friday: "7:00 AM - 6:00 PM",
      saturday: "8:00 AM - 6:00 PM",
      sunday: "8:00 AM - 6:00 PM",
    }),
    averageRating: 5,
    reviewCount: 0,
  },
  {
    name: "Sightglass Coffee",
    description: "San Francisco-based roaster focusing on direct trade relationships and sustainable practices.",
    address: "270 7th St",
    city: "San Francisco",
    state: "CA",
    country: "USA",
    zipCode: "94103",
    latitude: "37.7758",
    longitude: "-122.4128",
    phone: "(415) 861-1313",
    email: "hello@sightglasscoffee.com",
    website: "https://sightglasscoffee.com",
    beanOrigins: JSON.stringify(["Kenya", "Ethiopia", "Brazil"]),
    roastStyles: JSON.stringify(["Light", "Medium", "Medium-Dark"]),
    specialties: JSON.stringify(["Direct Trade", "Organic", "Single Origin"]),
    hours: JSON.stringify({
      monday: "7:00 AM - 7:00 PM",
      tuesday: "7:00 AM - 7:00 PM",
      wednesday: "7:00 AM - 7:00 PM",
      thursday: "7:00 AM - 7:00 PM",
      friday: "7:00 AM - 7:00 PM",
      saturday: "8:00 AM - 7:00 PM",
      sunday: "8:00 AM - 7:00 PM",
    }),
    averageRating: 5,
    reviewCount: 0,
  },
  {
    name: "Ritual Coffee Roasters",
    description: "Pioneering specialty coffee roaster with a commitment to quality, sustainability, and community.",
    address: "1026 Valencia St",
    city: "San Francisco",
    state: "CA",
    country: "USA",
    zipCode: "94110",
    latitude: "37.7566",
    longitude: "-122.4214",
    phone: "(415) 641-1024",
    email: "info@ritualcoffee.com",
    website: "https://ritualcoffee.com",
    beanOrigins: JSON.stringify(["Ethiopia", "Colombia", "Costa Rica"]),
    roastStyles: JSON.stringify(["Light", "Medium"]),
    specialties: JSON.stringify(["Single Origin", "Espresso", "Cold Brew"]),
    hours: JSON.stringify({
      monday: "6:30 AM - 6:00 PM",
      tuesday: "6:30 AM - 6:00 PM",
      wednesday: "6:30 AM - 6:00 PM",
      thursday: "6:30 AM - 6:00 PM",
      friday: "6:30 AM - 6:00 PM",
      saturday: "7:00 AM - 6:00 PM",
      sunday: "7:00 AM - 6:00 PM",
    }),
    averageRating: 4,
    reviewCount: 0,
  },
  {
    name: "Verve Coffee Roasters",
    description: "California-based roaster dedicated to sourcing exceptional coffees and building lasting relationships with farmers.",
    address: "816 Folsom St",
    city: "San Francisco",
    state: "CA",
    country: "USA",
    zipCode: "94107",
    latitude: "37.7806",
    longitude: "-122.4032",
    phone: "(831) 600-7784",
    email: "hello@vervecoffee.com",
    website: "https://vervecoffee.com",
    beanOrigins: JSON.stringify(["Guatemala", "Kenya", "Brazil", "Indonesia"]),
    roastStyles: JSON.stringify(["Light", "Medium", "Dark"]),
    specialties: JSON.stringify(["Organic", "Fair Trade", "Single Origin"]),
    hours: JSON.stringify({
      monday: "7:00 AM - 5:00 PM",
      tuesday: "7:00 AM - 5:00 PM",
      wednesday: "7:00 AM - 5:00 PM",
      thursday: "7:00 AM - 5:00 PM",
      friday: "7:00 AM - 5:00 PM",
      saturday: "8:00 AM - 5:00 PM",
      sunday: "8:00 AM - 5:00 PM",
    }),
    averageRating: 5,
    reviewCount: 0,
  },
  {
    name: "Four Barrel Coffee",
    description: "Small-batch roaster in San Francisco's Mission District, known for quality and consistency.",
    address: "375 Valencia St",
    city: "San Francisco",
    state: "CA",
    country: "USA",
    zipCode: "94103",
    latitude: "37.7673",
    longitude: "-122.4216",
    phone: "(415) 896-4289",
    email: "info@fourbarrelcoffee.com",
    website: "https://fourbarrelcoffee.com",
    beanOrigins: JSON.stringify(["Ethiopia", "Colombia", "Guatemala", "Brazil"]),
    roastStyles: JSON.stringify(["Light", "Medium"]),
    specialties: JSON.stringify(["Small Batch", "Single Origin", "Espresso"]),
    hours: JSON.stringify({
      monday: "7:00 AM - 7:00 PM",
      tuesday: "7:00 AM - 7:00 PM",
      wednesday: "7:00 AM - 7:00 PM",
      thursday: "7:00 AM - 7:00 PM",
      friday: "7:00 AM - 7:00 PM",
      saturday: "7:00 AM - 7:00 PM",
      sunday: "7:00 AM - 7:00 PM",
    }),
    averageRating: 4,
    reviewCount: 0,
  },
];

console.log("Seeding roasters...");

for (const roaster of sampleRoasters) {
  try {
    await db.insert(schema.roasters).values(roaster);
    console.log(`✓ Added ${roaster.name}`);
  } catch (error) {
    console.error(`✗ Failed to add ${roaster.name}:`, error.message);
  }
}

console.log("Seeding complete!");
await connection.end();
