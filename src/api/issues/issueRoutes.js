const express = require("express");
const {
  getAllIssues,
  getIssueById,
  createIssue,
  updateIssue,
  deleteIssue,
  getProjectIssues,
  updateIssueStatus,
  assignIssue,
  addIssueComment,
  getIssueComments,
} = require("./issueController");
const { protect } = require("../../middlewares/auth");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Issues
 *   description: Issue management
 */

// All routes are protected
router.use(protect);

/**
 * @swagger
 * /issues:
 *   get:
 *     summary: Get all issues
 *     tags: [Issues]
 *     responses:
 *       200:
 *         description: Issues retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Issue'
 */
router.get("/", getAllIssues);

/**
 * @swagger
 * /issues:
 *   post:
 *     summary: Create a new issue
 *     tags: [Issues]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/IssueCreate'
 *     responses:
 *       201:
 *         description: Issue created successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Issue'
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post("/", createIssue);

/**
 * @swagger
 * /issues/project/{projectId}:
 *   get:
 *     summary: Get issues by project
 *     tags: [Issues]
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Project ID
 *     responses:
 *       200:
 *         description: Project issues retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Issue'
 *       404:
 *         description: Project not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get("/project/:projectId", getProjectIssues);

/**
 * @swagger
 * /issues/{id}:
 *   get:
 *     summary: Get issue by ID
 *     tags: [Issues]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Issue ID
 *     responses:
 *       200:
 *         description: Issue retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Issue'
 *       404:
 *         description: Issue not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get("/:id", getIssueById);

/**
 * @swagger
 * /issues/{id}:
 *   put:
 *     summary: Update issue
 *     tags: [Issues]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Issue ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Updated issue title"
 *               description:
 *                 type: string
 *                 example: "Updated description"
 *               priority:
 *                 type: string
 *                 enum: [LOW, MEDIUM, HIGH, URGENT]
 *                 example: "MEDIUM"
 *               status:
 *                 type: string
 *                 enum: [TODO, IN_PROGRESS, DONE, CANCELED]
 *                 example: "IN_PROGRESS"
 *     responses:
 *       200:
 *         description: Issue updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Issue'
 *       404:
 *         description: Issue not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.put("/:id", updateIssue);

/**
 * @swagger
 * /issues/{id}:
 *   delete:
 *     summary: Delete issue
 *     tags: [Issues]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Issue ID
 *     responses:
 *       200:
 *         description: Issue deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: null
 *       404:
 *         description: Issue not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.delete("/:id", deleteIssue);

/**
 * @swagger
 * /issues/{id}/status:
 *   patch:
 *     summary: Update issue status
 *     tags: [Issues]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Issue ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [TODO, IN_PROGRESS, DONE, CANCELED]
 *                 example: "DONE"
 *     responses:
 *       200:
 *         description: Issue status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Issue'
 *       404:
 *         description: Issue not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.patch("/:id/status", updateIssueStatus);

/**
 * @swagger
 * /issues/{id}/assign:
 *   patch:
 *     summary: Assign issue to user
 *     tags: [Issues]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Issue ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               assigneeId:
 *                 type: string
 *                 format: uuid
 *                 nullable: true
 *                 example: "550e8400-e29b-41d4-a716-446655440001"
 *                 description: User ID to assign, or null to unassign
 *     responses:
 *       200:
 *         description: Issue assignment updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Issue'
 *       404:
 *         description: Issue not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.patch("/:id/assign", assignIssue);

/**
 * @swagger
 * /issues/{id}/comments:
 *   get:
 *     summary: Get issue comments
 *     tags: [Issues]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Issue ID
 *     responses:
 *       200:
 *         description: Issue comments retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             format: uuid
 *                           content:
 *                             type: string
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                           author:
 *                             $ref: '#/components/schemas/User'
 */
router.get("/:id/comments", getIssueComments);

/**
 * @swagger
 * /issues/{id}/comments:
 *   post:
 *     summary: Add comment to issue
 *     tags: [Issues]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Issue ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *                 example: "This issue has been resolved"
 *     responses:
 *       201:
 *         description: Comment added successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           format: uuid
 *                         content:
 *                           type: string
 *                         createdAt:
 *                           type: string
 *                           format: date-time
 *                         author:
 *                           $ref: '#/components/schemas/User'
 *       404:
 *         description: Issue not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post("/:id/comments", addIssueComment);

module.exports = router;
