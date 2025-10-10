const asyncHandler = require("../../utils/asyncHandler");
const { sendResponse } = require("../../utils/ApiResponse");
const ApiError = require("../../utils/ApiError");
const userService = require("./userService");

// @desc    Register new user
// @route   POST /api/v1/users/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    throw new ApiError(400, "Please provide name, email and password");
  }

  const user = await userService.createUser({ name, email, password });

  sendResponse(res, 201, user, "User registered successfully");
});

// @desc    Login user
// @route   POST /api/v1/users/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, "Please provide email and password");
  }

  const result = await userService.loginUser(email, password);

  sendResponse(res, 200, result, "Login successful");
});

// @desc    Get user profile
// @route   GET /api/v1/users/profile
// @access  Private
const getProfile = asyncHandler(async (req, res) => {
  const user = await userService.getUserById(req.user.id);

  sendResponse(res, 200, user, "Profile retrieved successfully");
});

// @desc    Get all users
// @route   GET /api/v1/users
// @access  Private/Admin
const getAllUsers = asyncHandler(async (req, res) => {
  const users = await userService.getAllUsers();

  sendResponse(res, 200, users, "Users retrieved successfully");
});

// @desc    Get user by ID
// @route   GET /api/v1/users/:id
// @access  Private
const getUserById = asyncHandler(async (req, res) => {
  const user = await userService.getUserById(req.params.id);

  sendResponse(res, 200, user, "User retrieved successfully");
});

// @desc    Update user
// @route   PUT /api/v1/users/:id
// @access  Private
const updateUser = asyncHandler(async (req, res) => {
  const user = await userService.updateUser(req.params.id, req.body);

  sendResponse(res, 200, user, "User updated successfully");
});

// @desc    Delete user
// @route   DELETE /api/v1/users/:id
// @access  Private/Admin
const deleteUser = asyncHandler(async (req, res) => {
  await userService.deleteUser(req.params.id);

  sendResponse(res, 200, null, "User deleted successfully");
});

module.exports = {
  getAllUsers,
  getUserById,
  createUser: registerUser,
  updateUser,
  deleteUser,
  loginUser,
  registerUser,
  getProfile,
};
