const asyncHandler = require("../../utils/asyncHandler");
const { sendResponse } = require("../../utils/ApiResponse");
const ApiError = require("../../utils/ApiError");
const projectService = require("./projectService");

// @desc    Get all projects
// @route   GET /api/v1/projects
// @access  Private
const getAllProjects = asyncHandler(async (req, res) => {
  const projects = await projectService.getAllProjects();
  sendResponse(res, 200, projects, "Projects retrieved successfully");
});

// @desc    Get project by ID
// @route   GET /api/v1/projects/:id
// @access  Private
const getProjectById = asyncHandler(async (req, res) => {
  const project = await projectService.getProjectById(req.params.id);
  sendResponse(res, 200, project, "Project retrieved successfully");
});

// @desc    Create new project
// @route   POST /api/v1/projects
// @access  Private
const createProject = asyncHandler(async (req, res) => {
  const projectData = {
    ...req.body,
    leadId: req.user.id,
  };

  const project = await projectService.createProject(projectData);
  sendResponse(res, 201, project, "Project created successfully");
});

// @desc    Update project
// @route   PUT /api/v1/projects/:id
// @access  Private
const updateProject = asyncHandler(async (req, res) => {
  const project = await projectService.updateProject(req.params.id, req.body);
  sendResponse(res, 200, project, "Project updated successfully");
});

// @desc    Delete project
// @route   DELETE /api/v1/projects/:id
// @access  Private
const deleteProject = asyncHandler(async (req, res) => {
  await projectService.deleteProject(req.params.id);
  sendResponse(res, 200, null, "Project deleted successfully");
});

// @desc    Get user projects
// @route   GET /api/v1/projects/user/:userId
// @access  Private
const getUserProjects = asyncHandler(async (req, res) => {
  const projects = await projectService.getUserProjects(req.params.userId);
  sendResponse(res, 200, projects, "User projects retrieved successfully");
});

// @desc    Get project members
// @route   GET /api/v1/projects/:id/members
// @access  Private
const getProjectMembers = asyncHandler(async (req, res) => {
  const members = await projectService.getProjectMembers(req.params.id);
  sendResponse(res, 200, members, "Project members retrieved successfully");
});

// @desc    Add project member
// @route   POST /api/v1/projects/:id/members
// @access  Private
const addProjectMember = asyncHandler(async (req, res) => {
  const member = await projectService.addProjectMember(req.params.id, req.body);
  sendResponse(res, 201, member, "Project member added successfully");
});

// @desc    Remove project member
// @route   DELETE /api/v1/projects/:id/members/:userId
// @access  Private
const removeProjectMember = asyncHandler(async (req, res) => {
  await projectService.removeProjectMember(req.params.id, req.params.userId);
  sendResponse(res, 200, null, "Project member removed successfully");
});

module.exports = {
  getAllProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  getUserProjects,
  getProjectMembers,
  addProjectMember,
  removeProjectMember,
};
