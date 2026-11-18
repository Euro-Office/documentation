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
 * components:
 *   schemas:
 *     Health:
 *       type: boolean
 */
const unused = 1
