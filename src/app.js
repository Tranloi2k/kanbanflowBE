require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");

// Import Prisma for database connection
const prisma = require("./config/prisma");

// Import Swagger configuration
const { swaggerUi, specs } = require("./config/swagger");

// Import middlewares
const errorHandler = require("./middlewares/errorHandler");
const notFound = require("./middlewares/notFound");

// Import routes
const userRoutes = require("./api/users/userRoutes");
const projectRoutes = require("./api/projects/projectRoutes");
const issueRoutes = require("./api/issues/issueRoutes");

const app = express();
const PORT = process.env.PORT || 3000;

// Security middlewares
app.use(helmet());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    credentials: true,
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
});
app.use(limiter);

// Body parsing middlewares
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Logging
app.use(morgan("combined"));

// Swagger Documentation
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(specs, {
    explorer: true,
    customCss: ".swagger-ui .topbar { display: none }",
    customSiteTitle: "KanbanFlow API Documentation",
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
    },
  })
);

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString(),
    service: "KanbanFlow API",
  });
});

// API routes
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/projects", projectRoutes);
app.use("/api/v1/issues", issueRoutes);

// 404 handler
app.use(notFound);

// Error handler
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 KanbanFlow server is running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || "development"}`);
});

module.exports = app;
