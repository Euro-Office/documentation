// SPDX-FileCopyrightText: Euro-Office contributors
// SPDX-License-Identifier: AGPL-3.0-only

/**
 * Health check.
 * @openapi
 * paths:
 *   /healthcheck:
 *     get:
 *       summary: Health check
 *       responses:
 *         '200':
 *           description: OK
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/Health'
 */
function healthcheck() {}

/**
 * @openapi
 * webhooks:
 *   documentStatus:
 *     post:
 *       summary: Document status callback
 *       requestBody:
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Payload'
 *       responses:
 *         '200':
 *           description: Answer with error 0.
 * components:
 *   schemas:
 *     Health:
 *       type: boolean
 *     Payload:
 *       type: object
 *       required: [status]
 *       properties:
 *         status:
 *           type: integer
 *           description: Document state.
 *           oneOf:
 *             - const: 1
 *               description: Being edited.
 *             - const: 2
 *               description: Ready to save.
 *         users:
 *           type: array
 *           items:
 *             type: string
 */
const unused = 1
