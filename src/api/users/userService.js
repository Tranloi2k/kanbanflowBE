const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const prisma = require("../../config/prisma");
const ApiError = require("../../utils/ApiError");

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
        role: "user",
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

  generateToken(userId) {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });
  }
}

module.exports = new UserService();
