import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const contacts = [
  // Internal
  { category: "Internal", typeOfService: "Dynasty Club Contact", contactNo: "8287827292" },
  { category: "Internal", typeOfService: "Dynasty Club Booking", contactNo: "7669700974" },
  { category: "Internal", typeOfService: "Club Chef", name: "Vinod Banwal", contactNo: "8826515296" },
  { category: "Internal", typeOfService: "GD Main Gate", contactNo: "9711259778" },
  { category: "Internal", typeOfService: "Help Desk", contactNo: "8826171144", remarks: "For general complaints" },
  { category: "Internal", typeOfService: "Abante Facility Head", name: "Vikas Gupta", contactNo: "9810823938" },
  { category: "Internal", typeOfService: "Facility & General Maintenance", name: "Chetan Sirohi", contactNo: "8505922072" },
  { category: "Internal", typeOfService: "Security", name: "Suraj", contactNo: "9990693456" },
  { category: "Internal", typeOfService: "Security Main Gate", contactNo: "9711259778", remarks: "for any incident - fire etc" },
  { category: "Internal", typeOfService: "Concierge desk", name: "Pallavi", contactNo: "9211295291" },

  // Internal Intercom
  { category: "Internal Intercom", typeOfService: "Facility Manager", contactNo: "40010" },
  { category: "Internal Intercom", typeOfService: "Facility Helpdesk", contactNo: "40000" },
  { category: "Internal Intercom", typeOfService: "Technical", contactNo: "40015" },
  { category: "Internal Intercom", typeOfService: "Accounts Department", contactNo: "40025" },
  { category: "Internal Intercom", typeOfService: "Facility Reception", contactNo: "40035" },
  { category: "Internal Intercom", typeOfService: "Club Reception", contactNo: "50000" },
  { category: "Internal Intercom", typeOfService: "Suite Room 1, 2, 3, 4", contactNo: "50001/50002/50003/50004" },
  { category: "Internal Intercom", typeOfService: "Steam & Sauna Reception", contactNo: "50008" },
  { category: "Internal Intercom", typeOfService: "Business Centre", contactNo: "50009" },
  { category: "Internal Intercom", typeOfService: "CCTV Server Room", contactNo: "7" },
  { category: "Internal Intercom", typeOfService: "L T panel", contactNo: "8" },
  { category: "Internal Intercom", typeOfService: "Security Cabin (Entry Gate)", contactNo: "9" },
  { category: "Internal Intercom", typeOfService: "Security Cabin (Exit Gate)", contactNo: "40002" },
  { category: "Internal Intercom", typeOfService: "Tower A - GF II B1 II B2", contactNo: "40011 / 40022 / 40033" },
  { category: "Internal Intercom", typeOfService: "Tower B - GF II B1 II B2", contactNo: "40044 / 40055 / 40066" },
  { category: "Internal Intercom", typeOfService: "Tower C - GF II B1 II B2", contactNo: "40077 / 40088 / 40099" },

  // Regular services
  { category: "Regular Services", typeOfService: "Newspaper", name: "Ram Kumar Sahu", contactNo: "9899971214" },
  { category: "Regular Services", typeOfService: "Car Cleaning & Presswala", name: "Sher Bahadur", contactNo: "7053266832", remarks: "clothes - 5/- per cloth and 20/- for bedsheet" },
  { category: "Regular Services", typeOfService: "Car Cleaning & Presswala", name: "Parmeshwar", contactNo: "9711191549", remarks: "car cleaning 900/- per month" },
  { category: "Regular Services", typeOfService: "Home & Glass cleaning", name: "Ram Avatar", contactNo: "9717243564" },
  { category: "Regular Services", typeOfService: "Bathroom Cleaning", name: "Satyaveer", contactNo: "6395063804" },
  { category: "Regular Services", typeOfService: "Home deep cleaning", name: "Gaurang Das", contactNo: "9811412190" },
  { category: "Regular Services", typeOfService: "Home deep cleaning", name: "Kapil", contactNo: "9971154065" },

  // Personal Care
  { category: "Personal Care", typeOfService: "Home Parlour service", name: "Pushpa", contactNo: "8377997680" },
  { category: "Personal Care", typeOfService: "Home Hair Dresser", name: "Aman", contactNo: "9871022294" },

  // Drycleaner
  { category: "Drycleaner", typeOfService: "Drycleaner", name: "Lakshay Laundry", contactNo: "9999772254" },
  { category: "Drycleaner", typeOfService: "Drycleaner - 2", name: "Riaz Dryclean", contactNo: "8577010452" },
  { category: "Drycleaner", typeOfService: "Drycleaner - 3", name: "Saroj Whites", contactNo: "8010553452" },

  // Courier
  { category: "Courier", typeOfService: "DTDC Courier", name: "S R International", contactNo: "7717706738" },
  { category: "Courier", typeOfService: "DHL - for overseas delivery", name: "DHL", contactNo: "7982162013" },

  // Gardener
  { category: "Gardener", typeOfService: "Maali", name: "Shivprasad", contactNo: "8860981166", remarks: "2500-3000 per month (4 visits) depending on plants" },
  { category: "Gardener", typeOfService: "Maali 2", name: "Surjeet", contactNo: "7503077797", remarks: "2500 per month - 8 visits" },
  { category: "Gardener", typeOfService: "Sakshi Plants - plants and gardener", contactNo: "9582906916" },

  // Staples
  { category: "Staples", typeOfService: "Milk, Bread, Eggs - farm", name: "Aarya Farms", contactNo: "9355995575" },
  { category: "Staples", typeOfService: "Botnia Vegetable Vendor", name: "Dinesh", contactNo: "9873040023" },
  { category: "Staples", typeOfService: "Every Little Thing - Gheja", contactNo: "9811166849" },
  { category: "Staples", typeOfService: "Vegetable order Gheja", contactNo: "9873040023" },
  { category: "Staples", typeOfService: "Vegetable - Chitranshi - Seedhe Khet se -Organic", contactNo: "8860610600" },
  { category: "Staples", typeOfService: "Gopala - for Paneer", contactNo: "9560181476" },
  { category: "Staples", typeOfService: "Meat & Fish Ikebana", contactNo: "8595160364" },
  { category: "Staples", typeOfService: "Debon - Meat & Gourmet Store", contactNo: "9810607689" },

  // Florist
  { category: "Florist", typeOfService: "Florist - bouquets and Pooja flowers- daily", name: "Mankesh", contactNo: "9355229096" },
  { category: "Florist", typeOfService: "Flower delivery", name: "Shanker", contactNo: "7011200991" },
  { category: "Florist", typeOfService: "Flower delivery-2", contactNo: "9818932764" },

  // Pharmacy
  { category: "Pharmacy", typeOfService: "Botnia Chemist", contactNo: "9999843553" },

  // Caterer
  { category: "Caterer", typeOfService: "Cook for Small Parties", name: "Abhay", contactNo: "8743936180" },
  { category: "Caterer", typeOfService: "Cook for small parties", name: "Atul", contactNo: "9818966017" },
  { category: "Caterer", typeOfService: "Cook for Thai", name: "Arvind", contactNo: "9810145042" },

  // Boutique & Tailor
  { category: "Boutique & Tailor", typeOfService: "Puneet Dynasty", contactNo: "9718258000" },
  { category: "Boutique & Tailor", typeOfService: "Preeti Jain - Dynasty - Shop in Botnia", contactNo: "9971444918" },
  { category: "Boutique & Tailor", typeOfService: "Nupur Fashion - Ikebana", contactNo: "9821888936" },
  { category: "Boutique & Tailor", typeOfService: "Seema Malik - Boutique", name: "B 2001", contactNo: "9891099965", remarks: "D 233, Basement - Sector 47" },
  { category: "Boutique & Tailor", typeOfService: "Shakeel Tailor - Comes Home -for repair work also", contactNo: "9911353441" },
  { category: "Boutique & Tailor", typeOfService: "Lady Master Tailor - for repair work also", contactNo: "9711019249" },
  { category: "Boutique & Tailor", typeOfService: "Mirnalika Dynasty- Sarees and Suits", name: "B-801", contactNo: "9910303307" },

  // White Goods Servicing
  { category: "White Goods Servicing", typeOfService: "IGL Customer Care", contactNo: "18001025109" },
  { category: "White Goods Servicing", typeOfService: "IGL Emergency Noida", contactNo: "8130995008" },
  { category: "White Goods Servicing", typeOfService: "Hafele servicing /cleaning for stove", name: "Pawan Chaubey", contactNo: "9643328232" },
  { category: "White Goods Servicing", typeOfService: "Dorset Technical Team -customer care", contactNo: "1244567889" },
  { category: "White Goods Servicing", typeOfService: "Havells Customer Care", contactNo: "8045771313" },
  { category: "White Goods Servicing", typeOfService: "Dyson India Customer Care", contactNo: "18002586688" },
  { category: "White Goods Servicing", typeOfService: "Samsung Customer Care", contactNo: "18004101010" },
  { category: "White Goods Servicing", typeOfService: "Electrolux Helpline", contactNo: "18002021800" },
  { category: "White Goods Servicing", typeOfService: "Sony Customer Care", contactNo: "18001037799" },

  // Health
  { category: "Health", typeOfService: "General Physician", name: "Dr Sunita Maheshwari (sector 108)", contactNo: "9717082258" },
  { category: "Health", typeOfService: "Doctor ENT", name: "Dr Shubham", contactNo: "9839888221" },
  { category: "Health", typeOfService: "Eye Specialist", name: "Dr Anshu - Neo Hospital", contactNo: "9311801109" },
  { category: "Health", typeOfService: "Skin Specialist", name: "Dr Jyoti Gupta", contactNo: "9717887238" },
  { category: "Health", typeOfService: "Dermatologist", name: "Dr Astha", contactNo: "9811402400" },
  { category: "Health", typeOfService: "Physiotherapist - Botnia", name: "Dr Stuti", contactNo: "9315563065" },
  { category: "Health", typeOfService: "Physiotherapist (Home visit- Alternative Wellness)", name: "Dr Saurabh Gupta", contactNo: "9354183517" },
  { category: "Health", typeOfService: "Orthopaedic (Senior Consultant)- Max Hospital", name: "Dr Pankaj Kumar", contactNo: "8130229178" },
  { category: "Health", typeOfService: "Physiotherapist - Sector 144", name: "Dr Ashray Jain", contactNo: "7524854400" },
  { category: "Health", typeOfService: "Nutritionist", name: "Archana aunty (C-3102)", contactNo: "9910159688" },
  { category: "Health", typeOfService: "Pediatrician", name: "Dr Shishir Bhatnagar", contactNo: "9899188788", remarks: "Online consultation also" },
  { category: "Health", typeOfService: "Pediatrician", name: "Dr Maheshwari", contactNo: "9818783505" },
  { category: "Health", typeOfService: "Pediatrician", name: "Dr Nitin Verma", contactNo: "9810858643", remarks: "New Friends Colony" },

  // Interior hardware
  { category: "Interior Hardware", typeOfService: "Pankaj - Glass works", name: "Pankaj", contactNo: "9319080127" },
  { category: "Interior Hardware", typeOfService: "Ceiling clothes rack", name: "Rana", contactNo: "9818805071" },
  { category: "Interior Hardware", typeOfService: "Invisible steel mesh", name: "Ankur Jain - Varsa", contactNo: "9819934694" },
  { category: "Interior Hardware", typeOfService: "Glass film", name: "Shree Krishna Interiors", contactNo: "9718259152" },
  { category: "Interior Hardware", typeOfService: "Mesh", name: "Krishna Nettings", contactNo: "9870389958" },
  { category: "Interior Hardware", typeOfService: "Curtains", name: "Aone Curtains Sector 18", contactNo: "9873730811" },

  // Sports
  { category: "Sports", typeOfService: "Lawn tennis", name: "Rajiv", contactNo: "9289384327" },
];

async function main() {
  console.log("Seeding important contacts...");

  const existingCount = await prisma.importantContact.count();
  if (existingCount > 0) {
    console.log(`Already ${existingCount} contacts seeded. Skipping.`);
    return;
  }

  for (const contact of contacts) {
    await prisma.importantContact.create({
      data: contact,
    });
  }

  console.log(`Seeded ${contacts.length} important contacts.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
