// SPDX-FileCopyrightText: Euro-Office contributors
// SPDX-License-Identifier: AGPL-3.0-only

/**
 * Class representing a <b>widget</b>.
 * @constructor
 */
function ApiWidget() {}

/**
 * Sets the size | in *points* {{ not a macro }}.
 * Second line.
 * @memberof ApiWidget
 * @typeofeditors ["CDE", "CSE"]
 * @param {number} nSize - The size.
 * @param {WidgetKind} [sKind="big"] - The kind.
 * @returns {ApiWidget | null} - this widget.
 * @see office-js-api/Examples/{Editor}/ApiWidget/Methods/SetSize.js
 * @example
 * secretExample();
 */
ApiWidget.prototype.SetSize = function (nSize, sKind) {};

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
