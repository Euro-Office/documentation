// SPDX-FileCopyrightText: Euro-Office contributors
// SPDX-License-Identifier: AGPL-3.0-only

/**
 * Class representing a <b>widget</b>.
 * @constructor
 */
function ApiWidget() {}

/**
 * Sets the size | in *points* {{ not a macro }}.
 * Second line, see {@link ApiWidget#CellOnly} and {@link Unknown#Thing the thing}, kind {@link WidgetKind}.
 * Keeps &gt; entities & escapes the rest.
 * @memberof ApiWidget
 * @typeofeditors ["CDE", "CSE"]
 * @param {number} nSize - The size.
 * @param {WidgetKind} [sKind="big"] - The kind.
 * @param {Array.<Array.<string>>} aRows - The rows.
 * @param {Object.<string,number>} oMap - The map.
 * @returns {ApiWidget | null} - this widget.
 * @see office-js-api/Examples/{Editor}/ApiWidget/Methods/SetSize.js
 * @example
 * secretExample();
 */
ApiWidget.prototype.SetSize = function (nSize, sKind, aRows, oMap) {};

/**
 * Only in spreadsheets.
 * @memberof ApiWidget
 * @typeofeditors ["CSE"]
 */
ApiWidget.prototype.CellOnly = function () {};

/**
 * Hidden.
 * @memberof ApiWidget
 * @typeofeditors ["CDE"]
 * @private
 */
ApiWidget.prototype.Hidden = function () {};

/**
 * Hidden by name.
 * @memberof ApiWidget
 * @typeofeditors ["CDE"]
 */
ApiWidget.prototype.private_Helper = function () {};

/**
 * The widget kind.
 * @typedef {("big" | "small")} WidgetKind
 */
