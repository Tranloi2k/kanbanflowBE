const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const prisma = require("../../config/prisma");
const ApiError = require("../../utils/ApiError");
const { USER_ROLES } = require("../../constants/roles");

class UserService {
  async createUser(userData) {
    const { name, email, password } = userData;

    // Check if user already exists
    const existingUser = await this.getUserByEmail(email);
    if (existingUser) {
      throw new ApiError(400, "User already exists with this email");
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user using Prisma
    const user = await prisma.user.create({
      data: {
        fullName: name,
        email,
        passwordHash: hashedPassword,
        role: USER_ROLES.USER,
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    const token = this.generateToken(user.id);

    return {
      user: {
        id: user.id,
        name: user.fullName,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      token,
    };
  }

  async loginUser(email, password) {
    // Get user by email
    const user = await this.getUserByEmail(email);
    if (!user) {
      throw new ApiError(401, "Invalid credentials");
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new ApiError(401, "Invalid credentials");
    }

    const token = this.generateToken(user.id, user.role);

    return {
      user: {
        id: user.id,
        name: user.fullName,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      token,
    };
  }

  async getAllUsers() {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return users.map((user) => ({
      ...user,
      name: user.fullName,
    }));
  }

  async getUserById(id) {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    return {
      ...user,
      name: user.fullName,
    };
  }

  async getUserByEmail(email) {
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        fullName: true,
        email: true,
        passwordHash: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return user;
  }

  async updateUser(id, updateData) {
    const { name, email } = updateData;

    // Check if user exists
    await this.getUserById(id);

    // Check if email is being updated and if it already exists
    if (email) {
      const existingUser = await this.getUserByEmail(email);
      if (existingUser && existingUser.id !== id) {
        throw new ApiError(400, "Email already exists");
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        ...(name && { fullName: name }),
        ...(email && { email }),
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return {
      ...updatedUser,
      name: updatedUser.fullName,
    };
  }

  async deleteUser(id) {
    // Check if user exists
    await this.getUserById(id);

    await prisma.user.delete({
      where: { id },
    });

    return true;
  }

  async searchUsers(query) {
    if (!query || query.length < 2) {
      throw new ApiError(400, "Search query must be at least 2 characters");
    }

    const users = await prisma.user.findMany({
      where: {
        OR: [
          {
            fullName: {
              contains: query,
              mode: "insensitive",
            },
          },
          {
            email: {
              contains: query,
              mode: "insensitive",
            },
          },
        ],
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        createdAt: true,
      },
      take: 20, // Limit results
      orderBy: {
        fullName: "asc",
      },
    });

    return users.map((user) => ({
      ...user,
      name: user.fullName,
    }));
  }

  generateToken(userId, role) {
    return jwt.sign({ id: userId, role }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });
  }
}

module.exports = new UserService();
