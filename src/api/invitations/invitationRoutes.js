const express = require("express");
const {
  getUserInvitations,
  respondToInvitation,
  cancelInvitation,
} = require("../projects/projectController");
const { protect } = require("../../middlewares/auth");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Invitations
 *   description: Project invitation management
 */

// All routes are protected
router.use(protect);

/**
 * @swagger
 * /invitations/me:
 *   get:
 *     summary: Get current user's invitations
 *     tags: [Invitations]
 *     responses:
 *       200:
 *         description: User invitations retrieved successfully
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
 *                         $ref: '#/components/schemas/ProjectInvitation'
 */
router.get("/me", getUserInvitations);

/**
 * @swagger
 * /invitations/{id}/respond:
 *   patch:
 *     summary: Respond to invitation (accept/reject)
 *     tags: [Invitations]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Invitation ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - action
 *             properties:
 *               action:
 *                 type: string
 *                 enum: [accept, reject]
 *                 example: "accept"
 *     responses:
 *       200:
 *         description: Invitation response recorded successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/ProjectInvitation'
 *       400:
 *         description: Invalid response or invitation already responded to
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Invitation not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.patch("/:id/respond", respondToInvitation);

/**
 * @swagger
 * /invitations/{id}:
 *   delete:
 *     summary: Cancel invitation (admin only)
 *     tags: [Invitations]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Invitation ID
 *     responses:
 *       200:
 *         description: Invitation cancelled successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: null
 *       403:
 *         description: No permission to cancel invitation
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Invitation not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.delete("/:id", cancelInvitation);

module.exports = router;