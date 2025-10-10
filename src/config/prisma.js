const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient({
  log:
    process.env.NODE_ENV === "development"
      ? ["query", "info", "warn", "error"]
      : ["warn", "error"],
  errorFormat: "pretty",
});

// Test database connection
prisma
  .$connect()
  .then(() => {
    console.log("✅ Connected to Supabase PostgreSQL database via Prisma");
  })
  .catch((error) => {
    console.error("❌ Database connection error:", error);
    process.exit(1);
  });

// Graceful shutdown
process.on("beforeExit", async () => {
  await prisma.$disconnect();
});

module.exports = prisma;
