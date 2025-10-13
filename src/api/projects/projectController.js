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

// @desc    Get project member user IDs
// @route   GET /api/v1/projects/:id/member-ids
// @access  Private
const getProjectMemberUserIds = asyncHandler(async (req, res) => {
  const userIds = await projectService.getProjectMemberUserIds(req.params.id);
  sendResponse(res, 200, { memberIds: userIds }, "Project member user IDs retrieved successfully");
});

// @desc    Invite user to project
// @route   POST /api/v1/projects/:id/invitations
// @access  Private
const inviteUserToProject = asyncHandler(async (req, res) => {
  const invitation = await projectService.inviteUserToProject(
    req.params.id,
    req.user.id,
    req.body
  );
  sendResponse(res, 201, invitation, "Invitation sent successfully");
});

// @desc    Get project invitations
// @route   GET /api/v1/projects/:id/invitations
// @access  Private
const getProjectInvitations = asyncHandler(async (req, res) => {
  const invitations = await projectService.getProjectInvitations(
    req.params.id,
    req.user.id
  );
  sendResponse(res, 200, invitations, "Project invitations retrieved successfully");
});

// @desc    Get user invitations
// @route   GET /api/v1/invitations/me
// @access  Private
const getUserInvitations = asyncHandler(async (req, res) => {
  const invitations = await projectService.getUserInvitations(req.user.id);
  sendResponse(res, 200, invitations, "User invitations retrieved successfully");
});

// @desc    Respond to invitation
// @route   PATCH /api/v1/invitations/:id/respond
// @access  Private
const respondToInvitation = asyncHandler(async (req, res) => {
  const invitation = await projectService.respondToInvitation(
    req.params.id,
    req.user.id,
    req.body
  );
  sendResponse(res, 200, invitation, "Invitation response recorded successfully");
});

// @desc    Cancel invitation
// @route   DELETE /api/v1/invitations/:id
// @access  Private
const cancelInvitation = asyncHandler(async (req, res) => {
  await projectService.cancelInvitation(req.params.id, req.user.id);
  sendResponse(res, 200, null, "Invitation cancelled successfully");
});

// @desc    Update member role
// @route   PATCH /api/v1/projects/:id/members/:memberId/role
// @access  Private
const updateMemberRole = asyncHandler(async (req, res) => {
  const member = await projectService.updateMemberRole(
    req.params.id,
    req.params.memberId,
    req.body.role,
    req.user.id
  );
  sendResponse(res, 200, member, "Member role updated successfully");
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
  getProjectMemberUserIds,
  inviteUserToProject,
  getProjectInvitations,
  getUserInvitations,
  respondToInvitation,
  cancelInvitation,
  updateMemberRole,
};
