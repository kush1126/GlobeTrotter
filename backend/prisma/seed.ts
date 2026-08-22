import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { ensureDatabase } from "../src/lib/ensureDb.js";

const prisma = new PrismaClient();

const catalog = [
  // --- INDIA ---
  {
    city: "Jaipur",
    country: "India",
    name: "Amber Fort & Palace Sunrise Expedition",
    category: "sightseeing",
    avgCost: 15,
    rating: 4.9,
    description: "Witness golden morning light over the grand ramparts, Maota Lake, and Sheesh Mahal mirror palace.",
    imageUrl: "https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=800&q=80",
  },
  {
    city: "Jaipur",
    country: "India",
    name: "Hawa Mahal & Old Pink City Heritage Walk",
    category: "sightseeing",
    avgCost: 10,
    rating: 4.8,
    description: "Explore the 953 honeycombed windows of the Palace of Winds, local bazaars, and traditional chai stops.",
    imageUrl: "https://images.unsplash.com/photo-1609946850389-8b896944e432?auto=format&fit=crop&w=800&q=80",
  },
  {
    city: "Jaipur",
    country: "India",
    name: "Royal Rajasthani Culinary Feast & Thali",
    category: "food",
    avgCost: 25,
    rating: 4.9,
    description: "Authentic Dal Baati Churma, Ker Sangri, and royal Mughal delicacies in a heritage courtyard.",
    imageUrl: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80",
  },
  {
    city: "Varanasi",
    country: "India",
    name: "Ganga Aarti Evening Sacred Boat Ceremony",
    category: "sightseeing",
    avgCost: 14,
    rating: 5.0,
    description: "Row along Dashashwamedh Ghat at twilight surrounded by chanting, floating oil lamps, and divine fire rituals.",
    imageUrl: "https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=800&q=80",
  },
  {
    city: "Varanasi",
    country: "India",
    name: "Ancient Alleyways & Kashi Street Food Crawl",
    category: "food",
    avgCost: 12,
    rating: 4.8,
    description: "Sample world-famous Banarasi paan, malaiyo froth, kachori sabzi, and creamy kulhad lassi.",
    imageUrl: "https://images.unsplash.com/photo-1571536802807-30451e3955d8?auto=format&fit=crop&w=800&q=80",
  },
  {
    city: "Agra",
    country: "India",
    name: "Taj Mahal Sunrise Guided Exploration",
    category: "sightseeing",
    avgCost: 22,
    rating: 4.9,
    description: "Skip-the-line early access to the world wonder marble mausoleum before crowds arrive.",
    imageUrl: "https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=800&q=80",
  },
  {
    city: "Agra",
    country: "India",
    name: "Agra Fort & Mughal Kitchen Tour",
    category: "sightseeing",
    avgCost: 18,
    rating: 4.7,
    description: "Walk the red sandstone bastion of Mughal emperors and taste Mughlai kababs and petha sweets.",
    imageUrl: "https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=800&q=80",
  },
  {
    city: "Goa",
    country: "India",
    name: "Sunset Catamaran Cruise & Dolphin Spotting",
    category: "sightseeing",
    avgCost: 35,
    rating: 4.7,
    description: "Sail along Mandovi river into the Arabian Sea with chilled beverages and coastal views.",
    imageUrl: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=800&q=80",
  },
  {
    city: "Goa",
    country: "India",
    name: "Fontainhas Latin Quarter Walk & Goan Seafood",
    category: "food",
    avgCost: 28,
    rating: 4.8,
    description: "Stroll vibrant Portuguese villas in Panjim and savor authentic fish curry rice and poee bread.",
    imageUrl: "https://images.unsplash.com/photo-1587974928442-77dc3e0dba72?auto=format&fit=crop&w=800&q=80",
  },
  {
    city: "Kerala",
    country: "India",
    name: "Alleppey Backwaters Luxury Houseboat Cruise",
    category: "sightseeing",
    avgCost: 50,
    rating: 4.9,
    description: "Glide through palm-fringed canals, paddy fields, and serene lagoons with fresh onboard meals.",
    imageUrl: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=800&q=80",
  },
  {
    city: "Kerala",
    country: "India",
    name: "Munnar Tea Plantation Trek & Cardamom Hills",
    category: "sightseeing",
    avgCost: 20,
    rating: 4.8,
    description: "Hike misty rolling hills of world-famous green tea estates and organic spice gardens.",
    imageUrl: "https://images.unsplash.com/photo-1593693397690-362cb9666fc2?auto=format&fit=crop&w=800&q=80",
  },
  {
    city: "Delhi",
    country: "India",
    name: "Old Delhi Chandni Chowk Rickshaw & Street Food",
    category: "food",
    avgCost: 18,
    rating: 4.8,
    description: "Navigate bustling spices lanes, Paranthe Wali Gali, jalebis, and historical Jama Masjid.",
    imageUrl: "https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=800&q=80",
  },
  {
    city: "Ladakh",
    country: "India",
    name: "Pangong Tso Crystal Blue Lake High Pass Safari",
    category: "sightseeing",
    avgCost: 75,
    rating: 5.0,
    description: "Cross Chang La pass into the dramatic turquoise salt lake bordered by barren Himalayan peaks.",
    imageUrl: "https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?auto=format&fit=crop&w=800&q=80",
  },
  {
    city: "Udaipur",
    country: "India",
    name: "Lake Pichola Sunset Boat Ride & City Palace",
    category: "sightseeing",
    avgCost: 25,
    rating: 4.9,
    description: "View the romantic floating lake palaces and opulent royal chambers in the Venice of the East.",
    imageUrl: "https://images.unsplash.com/photo-1615836245337-f5b9b2303f10?auto=format&fit=crop&w=800&q=80",
  },

  // --- JAPAN ---
  {
    city: "Tokyo",
    country: "Japan",
    name: "teamLab Planets Immersive Digital Art",
    category: "sightseeing",
    avgCost: 38,
    rating: 4.9,
    description: "Walk barefoot through glowing water installations and crystalline mirror infinite rooms.",
    imageUrl: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=800&q=80",
  },
  {
    city: "Tokyo",
    country: "Japan",
    name: "Tsukiji Outer Market Food & Sushi Tasting",
    category: "food",
    avgCost: 45,
    rating: 4.8,
    description: "Guided morning tasting of freshly torched wagyu, tamagoyaki, oysters, and sashimi.",
    imageUrl: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=800&q=80",
  },
  {
    city: "Tokyo",
    country: "Japan",
    name: "Shinjuku Gyoen Garden & Shibuya Crossing Sky",
    category: "sightseeing",
    avgCost: 20,
    rating: 4.7,
    description: "Tranquil traditional bonsai garden oasis followed by panoramic glass deck sunset over Shibuya.",
    imageUrl: "https://images.unsplash.com/photo-1542051841857-5f90071e7989?auto=format&fit=crop&w=800&q=80",
  },
  {
    city: "Kyoto",
    country: "Japan",
    name: "Fushimi Inari Torii Shrine & Bamboo Grove",
    category: "sightseeing",
    avgCost: 28,
    rating: 4.9,
    description: "Walk thousands of vermilion shrine gates and the towering ethereal bamboo forest of Arashiyama.",
    imageUrl: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=80",
  },
  {
    city: "Kyoto",
    country: "Japan",
    name: "Traditional Zen Tea Ceremony in Gion",
    category: "food",
    avgCost: 42,
    rating: 4.9,
    description: "Learn the mindful ritual of whisking ceremonial Uji matcha with handmade seasonal wagashi sweets.",
    imageUrl: "https://images.unsplash.com/photo-1545048702-79360700129e?auto=format&fit=crop&w=800&q=80",
  },
  {
    city: "Osaka",
    country: "Japan",
    name: "Dotonbori Street Food & Takoyaki Night Safari",
    category: "food",
    avgCost: 35,
    rating: 4.8,
    description: "Taste freshly fried kushikatsu, octopus balls, and okonomiyaki under the famous neon Glico sign.",
    imageUrl: "https://images.unsplash.com/photo-1590559899731-a382839e5549?auto=format&fit=crop&w=800&q=80",
  },

  // --- FRANCE ---
  {
    city: "Paris",
    country: "France",
    name: "Louvre Museum Masterpieces & Mona Lisa",
    category: "sightseeing",
    avgCost: 30,
    rating: 4.8,
    description: "World-famous royal palace museum showcasing classical sculpture, Winged Victory, and Renaissance masterworks.",
    imageUrl: "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=800&q=80",
  },
  {
    city: "Paris",
    country: "France",
    name: "Le Marais Gourmet Patisserie & Wine Tour",
    category: "food",
    avgCost: 75,
    rating: 4.9,
    description: "Taste artisanal croissants, macarons, aged cheeses, and curated French wines in cobblestone courtyards.",
    imageUrl: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80",
  },
  {
    city: "Paris",
    country: "France",
    name: "Seine River Sunset Cruise with Champagne",
    category: "sightseeing",
    avgCost: 28,
    rating: 4.7,
    description: "Evening open-air cruise past Notre-Dame Cathedral, Musée d'Orsay, and the sparkling Eiffel Tower.",
    imageUrl: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=800&q=80",
  },
  {
    city: "Nice",
    country: "France",
    name: "French Riviera Promenade & Old Town Market",
    category: "sightseeing",
    avgCost: 32,
    rating: 4.7,
    description: "Promenade des Anglais seaside stroll, Cours Saleya flower market, and local socca chickpea crepes.",
    imageUrl: "https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=800&q=80",
  },

  // --- ITALY ---
  {
    city: "Rome",
    country: "Italy",
    name: "Colosseum Underground & Ancient Forum VIP",
    category: "sightseeing",
    avgCost: 65,
    rating: 4.9,
    description: "Walk the arena floor and subterranean gladiator staging grounds of the Roman Empire.",
    imageUrl: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=800&q=80",
  },
  {
    city: "Rome",
    country: "Italy",
    name: "Trastevere Pasta & Gelato Masterclass",
    category: "food",
    avgCost: 75,
    rating: 5.0,
    description: "Handcraft fresh fettuccine, carbonara, and creamy gelato in a cozy Roman kitchen.",
    imageUrl: "https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=800&q=80",
  },
  {
    city: "Florence",
    country: "Italy",
    name: "Uffizi Gallery & Brunelleschi Dome Climb",
    category: "sightseeing",
    avgCost: 48,
    rating: 4.8,
    description: "See Botticelli's Birth of Venus and climb to the pinnacle of Santa Maria del Fiore cathedral.",
    imageUrl: "https://images.unsplash.com/photo-1543429776-2782fc8e1acd?auto=format&fit=crop&w=800&q=80",
  },
  {
    city: "Venice",
    country: "Italy",
    name: "Grand Canal Gondola Serenade & St. Mark's",
    category: "sightseeing",
    avgCost: 85,
    rating: 4.8,
    description: "Romantic glide along Venetian historic waterways, passing beneath the Bridge of Sighs.",
    imageUrl: "https://images.unsplash.com/photo-1514890547357-a9ee288728e0?auto=format&fit=crop&w=800&q=80",
  },

  // --- INDONESIA ---
  {
    city: "Bali",
    country: "Indonesia",
    name: "Ubud Tegallalang Rice Terraces & Jungle Swing",
    category: "sightseeing",
    avgCost: 20,
    rating: 4.8,
    description: "Trek layered emerald green hills, explore water temples, and experience iconic canopy views.",
    imageUrl: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=800&q=80",
  },
  {
    city: "Bali",
    country: "Indonesia",
    name: "Balinese Farm-to-Table Cooking Experience",
    category: "food",
    avgCost: 35,
    rating: 4.9,
    description: "Morning market harvest followed by grinding authentic bumbu spices and preparing satay lilit.",
    imageUrl: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80",
  },
  {
    city: "Bali",
    country: "Indonesia",
    name: "Nusa Penida Manta Ray Snorkeling Safari",
    category: "sightseeing",
    avgCost: 55,
    rating: 4.8,
    description: "Boat excursion to Kelingking T-Rex cliff and swim with giant oceanic manta rays in crystal bays.",
    imageUrl: "https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?auto=format&fit=crop&w=800&q=80",
  },

  // --- USA ---
  {
    city: "New York",
    country: "USA",
    name: "Broadway Evening Production & Backstage Pass",
    category: "sightseeing",
    avgCost: 125,
    rating: 4.8,
    description: "Premium orchestra seating for an acclaimed Broadway musical in the heart of Times Square.",
    imageUrl: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=800&q=80",
  },
  {
    city: "New York",
    country: "USA",
    name: "Central Park Bike Tour & West Village Treats",
    category: "sightseeing",
    avgCost: 45,
    rating: 4.6,
    description: "Cycle past Bow Bridge and Bethesda Terrace followed by artisan NY bagels and pizza.",
    imageUrl: "https://images.unsplash.com/photo-1534430480872-3498386e7856?auto=format&fit=crop&w=800&q=80",
  },
  {
    city: "San Francisco",
    country: "USA",
    name: "Golden Gate Bay Cruise & Alcatraz Island",
    category: "sightseeing",
    avgCost: 75,
    rating: 4.7,
    description: "Sail underneath the iconic Golden Gate suspension bridge and tour the infamous island penitentiary.",
    imageUrl: "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?auto=format&fit=crop&w=800&q=80",
  },

  // --- SPAIN ---
  {
    city: "Barcelona",
    country: "Spain",
    name: "Sagrada Família & Park Güell Gaudí Highlights",
    category: "sightseeing",
    avgCost: 52,
    rating: 4.9,
    description: "Marvel at Antoni Gaudí's monumental stained-glass basilica towers and mosaic wonderland.",
    imageUrl: "https://images.unsplash.com/photo-1583422409516-2895a77efded?auto=format&fit=crop&w=800&q=80",
  },
  {
    city: "Barcelona",
    country: "Spain",
    name: "El Born Tapas Crawl & Authentic Flamenco",
    category: "food",
    avgCost: 65,
    rating: 4.8,
    description: "Savor patatas bravas, jamón ibérico, and cava wine alongside a passionate live flamenco dance show.",
    imageUrl: "https://images.unsplash.com/photo-1515443961218-a51367888e4b?auto=format&fit=crop&w=800&q=80",
  },

  // --- SWITZERLAND ---
  {
    city: "Interlaken",
    country: "Switzerland",
    name: "Jungfraujoch - Top of Europe Alpine Railway",
    category: "sightseeing",
    avgCost: 160,
    rating: 4.9,
    description: "Ascend to 3,454m altitude inside the Great Aletsch Glacier with 360-degree snowcapped Alpine vistas.",
    imageUrl: "https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=800&q=80",
  },
  {
    city: "Interlaken",
    country: "Switzerland",
    name: "Lake Brienz Turquoise Kayak & Swiss Fondue",
    category: "food",
    avgCost: 85,
    rating: 4.8,
    description: "Paddle mirror-like glacial waters beneath towering waterfalls, followed by bubbling Gruyère cheese fondue.",
    imageUrl: "https://images.unsplash.com/photo-1527668752968-14dc70a27c95?auto=format&fit=crop&w=800&q=80",
  },

  // --- THAILAND ---
  {
    city: "Bangkok",
    country: "Thailand",
    name: "Grand Palace & Wat Arun Longtail Boat Safari",
    category: "sightseeing",
    avgCost: 28,
    rating: 4.8,
    description: "Explore golden spires, the Emerald Buddha temple, and cruise the historic Chao Phraya river.",
    imageUrl: "https://images.unsplash.com/photo-1508009603885-50cf7c579365?auto=format&fit=crop&w=800&q=80",
  },
  {
    city: "Bangkok",
    country: "Thailand",
    name: "Yaowarat Chinatown Michelin Street Food Safari",
    category: "food",
    avgCost: 30,
    rating: 4.9,
    description: "Feast on sizzling pad thai, crab fried rice, mango sticky rice, and guay tiew noodles.",
    imageUrl: "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?auto=format&fit=crop&w=800&q=80",
  },

  // --- EGYPT ---
  {
    city: "Cairo",
    country: "Egypt",
    name: "Giza Pyramids & Great Sphinx Private Camel Trek",
    category: "sightseeing",
    avgCost: 45,
    rating: 4.9,
    description: "Stand before the 4,500-year-old wonders of Khufu and Khafre with an Egyptologist guide.",
    imageUrl: "https://images.unsplash.com/photo-1503177119275-0aa32b3a9368?auto=format&fit=crop&w=800&q=80",
  },

  // --- UNITED KINGDOM ---
  {
    city: "London",
    country: "United Kingdom",
    name: "Tower of London & Thames Historic Walk",
    category: "sightseeing",
    avgCost: 42,
    rating: 4.7,
    description: "View the Crown Jewels, medieval White Tower, and cross the iconic Tower Bridge.",
    imageUrl: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=800&q=80",
  },
  {
    city: "London",
    country: "United Kingdom",
    name: "Borough Market Gourmet Food & British Tea",
    category: "food",
    avgCost: 50,
    rating: 4.8,
    description: "Taste warm Scotch eggs, British farmhouse cheeses, salt beef bagels, and traditional clotted cream scones.",
    imageUrl: "https://images.unsplash.com/photo-1533929736458-ca588d08c8be?auto=format&fit=crop&w=800&q=80",
  },
];

async function main() {
  await ensureDatabase();

  // 1. Seed Activities
  await prisma.activityCatalog.deleteMany();
  await prisma.activityCatalog.createMany({ data: catalog });
  console.log(`Successfully seeded ${catalog.length} catalog activities.`);

  // 2. Seed / Upsert Demo User
  const passwordHash = await bcrypt.hash("password123", 10);
  const demoUser = await prisma.user.upsert({
    where: { email: "explorer@globaltrotter.com" },
    update: {
      name: "Alex Mercer",
      passwordHash,
      currency: "USD",
      language: "en",
    },
    create: {
      name: "Alex Mercer",
      email: "explorer@globaltrotter.com",
      passwordHash,
      currency: "USD",
      language: "en",
    },
  });

  // 3. Seed Demo Trips if none exist for user
  const existingTrips = await prisma.trip.findMany({ where: { userId: demoUser.id } });
  if (existingTrips.length === 0) {
    console.log("Seeding sample trips for demo user...");
    const trip1 = await prisma.trip.create({
      data: {
        userId: demoUser.id,
        title: "Golden Triangle Heritage Expedition",
        description: "Exploring royal forts, vibrant bazaars, the Taj Mahal, and sacred rivers across Northern India.",
        startDate: new Date("2026-10-22T00:00:00Z"),
        endDate: new Date("2026-10-29T00:00:00Z"),
        isPublic: true,
        stops: {
          create: [
            {
              city: "Jaipur",
              country: "India",
              arrivalDate: new Date("2026-10-22T00:00:00Z"),
              departureDate: new Date("2026-10-25T00:00:00Z"),
              orderIndex: 0,
              plannedBudget: 250,
              notes: "Stay at Heritage Haveli near Johri Bazaar.",
              activities: {
                create: [
                  {
                    name: "Amber Fort & Palace Sunrise Expedition",
                    category: "sightseeing",
                    date: new Date("2026-10-22T08:00:00Z"),
                    estimatedCost: 15,
                    currency: "USD",
                  },
                  {
                    name: "Hawa Mahal & Old Pink City Heritage Walk",
                    category: "sightseeing",
                    date: new Date("2026-10-23T10:00:00Z"),
                    estimatedCost: 10,
                    currency: "USD",
                  },
                  {
                    name: "Royal Rajasthani Culinary Feast & Thali",
                    category: "food",
                    date: new Date("2026-10-24T19:00:00Z"),
                    estimatedCost: 25,
                    currency: "USD",
                  },
                ],
              },
            },
            {
              city: "Agra",
              country: "India",
              arrivalDate: new Date("2026-10-25T00:00:00Z"),
              departureDate: new Date("2026-10-27T00:00:00Z"),
              orderIndex: 1,
              plannedBudget: 180,
              notes: "Early morning sunrise visit to Taj Mahal.",
              activities: {
                create: [
                  {
                    name: "Taj Mahal Sunrise Guided Exploration",
                    category: "sightseeing",
                    date: new Date("2026-10-26T06:00:00Z"),
                    estimatedCost: 22,
                    currency: "USD",
                  },
                ],
              },
            },
            {
              city: "Varanasi",
              country: "India",
              arrivalDate: new Date("2026-10-27T00:00:00Z"),
              departureDate: new Date("2026-10-29T00:00:00Z"),
              orderIndex: 2,
              plannedBudget: 200,
              notes: "Evening Ganga Aarti ceremony.",
              activities: {
                create: [
                  {
                    name: "Ganga Aarti Evening Sacred Boat Ceremony",
                    category: "sightseeing",
                    date: new Date("2026-10-28T18:00:00Z"),
                    estimatedCost: 14,
                    currency: "USD",
                  },
                ],
              },
            },
          ],
        },
        budgets: {
          create: [
            { category: "activities", plannedAmount: 150 },
            { category: "food", plannedAmount: 200 },
            { category: "stay", plannedAmount: 300 },
          ],
        },
      },
    });

    console.log(`Created sample trip: ${trip1.title}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
