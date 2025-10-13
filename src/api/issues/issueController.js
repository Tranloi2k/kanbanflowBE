const asyncHandler = require("../../utils/asyncHandler");
const { sendResponse } = require("../../utils/ApiResponse");
const issueService = require("./issueService");

// @desc    Get all issues
// @route   GET /api/v1/issues
// @access  Private
const getAllIssues = asyncHandler(async (req, res) => {
  const issues = await issueService.getAllIssues(req.query);
  sendResponse(res, 200, issues, "Issues retrieved successfully");
});

// @desc    Get issue by ID
// @route   GET /api/v1/issues/:id
// @access  Private
const getIssueById = asyncHandler(async (req, res) => {
  const issue = await issueService.getIssueById(req.params.id);
  sendResponse(res, 200, issue, "Issue retrieved successfully");
});

// @desc    Create new issue
// @route   POST /api/v1/issues
// @access  Private
const createIssue = asyncHandler(async (req, res) => {
  const issueData = {
    ...req.body,
    reporterId: req.user.id,
  };

  const issue = await issueService.createIssue(issueData);
  sendResponse(res, 201, issue, "Issue created successfully");
});

// @desc    Update issue
// @route   PUT /api/v1/issues/:id
// @access  Private
const updateIssue = asyncHandler(async (req, res) => {
  const issue = await issueService.updateIssue(req.params.id, req.body);
  sendResponse(res, 200, issue, "Issue updated successfully");
});

// @desc    Delete issue
// @route   DELETE /api/v1/issues/:id
// @access  Private
const deleteIssue = asyncHandler(async (req, res) => {
  await issueService.deleteIssue(req.params.id);
  sendResponse(res, 200, null, "Issue deleted successfully");
});

// @desc    Get project issues
// @route   GET /api/v1/issues/project/:projectId
// @access  Private
const getProjectIssues = asyncHandler(async (req, res) => {
  const issues = await issueService.getProjectIssues(
    req.params.projectId,
    req.query
  );
  sendResponse(res, 200, issues, "Project issues retrieved successfully");
});

// @desc    Update issue status
// @route   PATCH /api/v1/issues/:id/status
// @access  Private
const updateIssueStatus = asyncHandler(async (req, res) => {
  const issue = await issueService.updateIssueStatus(
    req.params.id,
    req.body.status,
    req.user.id
  );
  sendResponse(res, 200, issue, "Issue status updated successfully");
});

// @desc    Assign issue to user
// @route   PATCH /api/v1/issues/:id/assign
// @access  Private
const assignIssue = asyncHandler(async (req, res) => {
  const issue = await issueService.assignIssue(
    req.params.id,
    req.body.assigneeId,
    req.user.id
  );
  sendResponse(res, 200, issue, "Issue assigned successfully");
});

// @desc    Get issue comments
// @route   GET /api/v1/issues/:id/comments
// @access  Private
const getIssueComments = asyncHandler(async (req, res) => {
  const comments = await issueService.getIssueComments(req.params.id);
  sendResponse(res, 200, comments, "Issue comments retrieved successfully");
});

// @desc    Add issue comment
// @route   POST /api/v1/issues/:id/comments
// @access  Private
const addIssueComment = asyncHandler(async (req, res) => {
  const commentData = {
    ...req.body,
    issueId: req.params.id,
    authorId: req.user.id,
  };

  const comment = await issueService.addIssueComment(commentData);
  sendResponse(res, 201, comment, "Comment added successfully");
});

module.exports = {
  getAllIssues,
  getIssueById,
  createIssue,
  updateIssue,
  deleteIssue,
  getProjectIssues,
  updateIssueStatus,
  assignIssue,
  getIssueComments,
  addIssueComment,
};
