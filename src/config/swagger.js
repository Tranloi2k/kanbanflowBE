const swaggerJSDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "KanbanFlow API",
      version: "1.0.0",
      description:
        "A comprehensive project management API built with Node.js, Express, and Prisma",
      contact: {
        name: "KanbanFlow Team",
        email: "admin@kanbanflow.com",
      },
      license: {
        name: "MIT",
        url: "https://opensource.org/licenses/MIT",
      },
    },
    servers: [
      {
        url:
          process.env.NODE_ENV === "production"
            ? "https://your-production-domain.com/api/v1"
            : "http://localhost:3000/api/v1",
        description:
          process.env.NODE_ENV === "production"
            ? "Production server"
            : "Development server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Enter JWT token in the format: Bearer <token>",
        },
      },
      schemas: {
        User: {
          type: "object",
          required: ["id", "email", "passwordHash", "fullName"],
          properties: {
            id: {
              type: "string",
              format: "uuid",
              description: "Unique identifier for the user",
            },
            email: {
              type: "string",
              format: "email",
              description: "Email address of the user (unique)",
              maxLength: 255,
            },
            passwordHash: {
              type: "string",
              description: "Hashed password",
              maxLength: 255,
            },
            fullName: {
              type: "string",
              description: "Full name of the user",
              maxLength: 255,
            },
            avatarUrl: {
              type: "string",
              format: "uri",
              description: "URL to user avatar image",
              maxLength: 500,
              nullable: true,
            },
            role: {
              type: "string",
              description: "User role",
              maxLength: 50,
              default: "user",
              nullable: true,
            },
            isActive: {
              type: "boolean",
              description: "Whether the user account is active",
              default: true,
              nullable: true,
            },
            createdAt: {
              type: "string",
              format: "date-time",
              description: "Account creation timestamp",
              nullable: true,
            },
            updatedAt: {
              type: "string",
              format: "date-time",
              description: "Last update timestamp",
              nullable: true,
            },
          },
        },
        Project: {
          type: "object",
          required: ["id", "name", "key", "category", "template"],
          properties: {
            id: {
              type: "string",
              format: "uuid",
              description: "Unique identifier for the project",
            },
            name: {
              type: "string",
              description: "Project name",
              maxLength: 255,
            },
            key: {
              type: "string",
              description: "Unique project key (e.g., PROJ)",
              maxLength: 10,
            },
            description: {
              type: "string",
              description: "Project description",
              nullable: true,
            },
            category: {
              type: "string",
              description: "Project category",
              maxLength: 50,
            },
            template: {
              type: "string",
              description: "Project template type",
              maxLength: 20,
            },
            leadId: {
              type: "string",
              format: "uuid",
              description: "Project lead user ID",
              nullable: true,
            },
            avatarColor: {
              type: "string",
              description: "Project avatar color class",
              maxLength: 20,
              default: "bg-blue-500",
              nullable: true,
            },
            isStarred: {
              type: "boolean",
              description: "Whether project is starred",
              default: false,
              nullable: true,
            },
            isArchived: {
              type: "boolean",
              description: "Whether project is archived",
              default: false,
              nullable: true,
            },
            createdAt: {
              type: "string",
              format: "date-time",
              description: "Project creation timestamp",
              nullable: true,
            },
            updatedAt: {
              type: "string",
              format: "date-time",
              description: "Last update timestamp",
              nullable: true,
            },
          },
        },
        Issue: {
          type: "object",
          required: ["id", "title", "reporterId"],
          properties: {
            id: {
              type: "string",
              format: "uuid",
              description: "Unique identifier for the issue",
            },
            projectId: {
              type: "string",
              format: "uuid",
              description: "Project ID this issue belongs to",
              nullable: true,
            },
            title: {
              type: "string",
              description: "Issue title",
              maxLength: 500,
            },
            description: {
              type: "string",
              description: "Issue description",
              nullable: true,
            },
            issueType: {
              type: "string",
              description: "Type of issue",
              maxLength: 50,
              default: "task",
              nullable: true,
            },
            priority: {
              type: "string",
              description: "Issue priority",
              maxLength: 20,
              default: "medium",
              nullable: true,
            },
            statusId: {
              type: "string",
              format: "uuid",
              description: "Current status ID",
              nullable: true,
            },
            assigneeId: {
              type: "string",
              format: "uuid",
              description: "Assigned user ID",
              nullable: true,
            },
            reporterId: {
              type: "string",
              format: "uuid",
              description: "Reporter user ID (required)",
            },
            storyPoints: {
              type: "integer",
              description: "Story points for estimation",
              nullable: true,
            },
            position: {
              type: "integer",
              description: "Position in the board",
              nullable: true,
            },
            dueDate: {
              type: "string",
              format: "date",
              description: "Due date",
              nullable: true,
            },
            createdAt: {
              type: "string",
              format: "date-time",
              description: "Issue creation timestamp",
              nullable: true,
            },
            updatedAt: {
              type: "string",
              format: "date-time",
              description: "Last update timestamp",
              nullable: true,
            },
          },
        },
        IssueComment: {
          type: "object",
          required: ["id", "authorId", "content"],
          properties: {
            id: {
              type: "string",
              format: "uuid",
              description: "Unique identifier for the comment",
            },
            issueId: {
              type: "string",
              format: "uuid",
              description: "Issue ID this comment belongs to",
              nullable: true,
            },
            authorId: {
              type: "string",
              format: "uuid",
              description: "Author user ID (required)",
            },
            content: {
              type: "string",
              description: "Comment content",
            },
            createdAt: {
              type: "string",
              format: "date-time",
              description: "Comment creation timestamp",
              nullable: true,
            },
            updatedAt: {
              type: "string",
              format: "date-time",
              description: "Last update timestamp",
              nullable: true,
            },
          },
        },
        ProjectMember: {
          type: "object",
          required: ["id"],
          properties: {
            id: {
              type: "string",
              format: "uuid",
              description: "Unique identifier for the project member",
            },
            projectId: {
              type: "string",
              format: "uuid",
              description: "Project ID",
              nullable: true,
            },
            userId: {
              type: "string",
              format: "uuid",
              description: "User ID",
              nullable: true,
            },
            role: {
              type: "string",
              description: "Member role in project",
              maxLength: 50,
              default: "member",
              nullable: true,
            },
            joinedAt: {
              type: "string",
              format: "date-time",
              description: "When user joined the project",
              nullable: true,
            },
          },
        },
        IssueStatus: {
          type: "object",
          required: ["id", "name", "position"],
          properties: {
            id: {
              type: "string",
              format: "uuid",
              description: "Unique identifier for the status",
            },
            projectId: {
              type: "string",
              format: "uuid",
              description: "Project ID this status belongs to",
              nullable: true,
            },
            name: {
              type: "string",
              description: "Status name",
              maxLength: 100,
            },
            position: {
              type: "integer",
              description: "Position order of the status",
            },
            color: {
              type: "string",
              description: "Status color class",
              maxLength: 20,
              default: "bg-gray-500",
              nullable: true,
            },
            createdAt: {
              type: "string",
              format: "date-time",
              description: "Status creation timestamp",
              nullable: true,
            },
          },
        },
        UserRegistration: {
          type: "object",
          required: ["fullName", "email", "password"],
          properties: {
            fullName: {
              type: "string",
              description: "Full name of the user",
              maxLength: 255,
              example: "John Doe",
            },
            email: {
              type: "string",
              format: "email",
              description: "Email address",
              maxLength: 255,
              example: "john@example.com",
            },
            password: {
              type: "string",
              description: "Password (will be hashed)",
              minLength: 6,
              example: "password123",
            },
          },
        },
        UserLogin: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: {
              type: "string",
              format: "email",
              description: "Email address",
              example: "john@example.com",
            },
            password: {
              type: "string",
              description: "Password",
              example: "password123",
            },
          },
        },
        ProjectCreate: {
          type: "object",
          required: ["name", "key", "category", "template"],
          properties: {
            name: {
              type: "string",
              description: "Project name",
              maxLength: 255,
              example: "Website Redesign",
            },
            key: {
              type: "string",
              description: "Unique project key",
              maxLength: 10,
              example: "WR",
            },
            description: {
              type: "string",
              description: "Project description",
              example: "Complete overhaul of company website",
            },
            category: {
              type: "string",
              description: "Project category",
              maxLength: 50,
              example: "web-development",
            },
            template: {
              type: "string",
              description: "Project template",
              maxLength: 20,
              example: "kanban",
            },
            leadId: {
              type: "string",
              format: "uuid",
              description: "Project lead user ID",
            },
          },
        },
        IssueCreate: {
          type: "object",
          required: ["title", "reporterId"],
          properties: {
            title: {
              type: "string",
              description: "Issue title",
              maxLength: 500,
              example: "Fix login bug",
            },
            description: {
              type: "string",
              description: "Issue description",
              example: "Users cannot login with special characters in password",
            },
            issueType: {
              type: "string",
              description: "Type of issue",
              maxLength: 50,
              example: "bug",
            },
            priority: {
              type: "string",
              description: "Issue priority",
              maxLength: 20,
              example: "high",
            },
            projectId: {
              type: "string",
              format: "uuid",
              description: "Project ID",
            },
            assigneeId: {
              type: "string",
              format: "uuid",
              description: "Assigned user ID",
            },
            reporterId: {
              type: "string",
              format: "uuid",
              description: "Reporter user ID",
            },
            storyPoints: {
              type: "number",
              example: 1,
            },
            dueDate: {
              type: "date",
              example: "10/08/2025",
            },
          },
        },
        ApiResponse: {
          type: "object",
          properties: {
            statusCode: {
              type: "integer",
              description: "HTTP status code",
            },
            data: {
              type: "object",
              description: "Response data",
            },
            message: {
              type: "string",
              description: "Response message",
            },
            success: {
              type: "boolean",
              description: "Whether the request was successful",
            },
          },
        },
        ErrorResponse: {
          type: "object",
          properties: {
            success: {
              type: "boolean",
              example: false,
            },
            error: {
              type: "string",
              description: "Error message",
            },
            stack: {
              type: "string",
              description: "Error stack trace (development only)",
            },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: [
    "./src/api/users/*.js",
    "./src/api/projects/*.js",
    "./src/api/issues/*.js",
    "./src/app.js",
  ],
};

const specs = swaggerJSDoc(options);

module.exports = {
  swaggerUi,
  specs,
};
