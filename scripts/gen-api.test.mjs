// SPDX-FileCopyrightText: Euro-Office contributors
// SPDX-License-Identifier: AGPL-3.0-only

import assert from 'node:assert/strict'
import { join } from 'node:path'
import { test } from 'node:test'
import { fileURLToPath } from 'node:url'
import { esc, jsdoc, mergeOpenapi, openapiFragments, sectionPages, typeName, webhooksMd } from './gen-api.mjs'

const fixtures = join(fileURLToPath(import.meta.url), '../fixtures')
const info = { title: 'Test', version: '1' }

test('builder doclets render one page per class', () => {
  const pages = sectionPages(jsdoc(fixtures, ['builder.js']), { title: 'Text document API', editor: 'CDE', home: 'fixtures' })
  assert.deepEqual(Object.keys(pages).sort(), ['ApiWidget.md', 'index.md', 'types.md'])
  const page = pages['ApiWidget.md']
  assert.match(page, /^# ApiWidget/)
  assert.match(page, /\| \[SetSize\]\(#setsize\) \| Sets the size \\\| in \\\*points\\\* \\\{\\\{ not a macro \\\}\\\}\. \|/)
  assert.match(page, /\| sKind \(optional\) \| \[WidgetKind\]\(types\.md#widgetkind\) \| The kind\. Default: `"big"` \|/)
  assert.match(page, /\*\*Returns\*\*: \[ApiWidget\]\(ApiWidget\.md\) \\\| null this widget\./)
  assert.match(page, /\*\*Editors\*\*: Text document, Spreadsheet/)
  assert.match(page, /Class representing a <b>widget<\/b>\./)
  for (const absent of ['### CellOnly', 'Hidden', 'private_Helper', 'office-js-api', 'secretExample']) {
    assert.ok(!page.includes(absent), `${absent} must not be rendered`)
  }
  assert.match(pages['types.md'], /### WidgetKind[\s\S]*"big" \\\| "small"/)
  assert.ok(page.includes('see [ApiWidget.CellOnly](ApiWidget.md#cellonly) and the thing, kind [WidgetKind](types.md#widgetkind).'))
  assert.ok(!page.includes('{@link'))
  assert.ok(page.includes('Keeps &gt; entities &amp; escapes the rest.'))
  assert.ok(page.includes('| aRows | string\\[\\]\\[\\] |'))
  assert.match(page, /\| oMap \| Record&lt;string, number&gt; \|/)
})

test('esc keeps valid entities and escapes markup', () => {
  assert.equal(esc('a &amp;gt; &#39; & <x> *y*'), 'a &amp;gt; &#39; &amp; &lt;x&gt; \\*y\\*')
})

test('typeName rewrites nested jsdoc generics', () => {
  assert.equal(typeName('Array.<Array.<ApiRange>>'), 'ApiRange[][]')
  assert.equal(typeName('Object.<string,Array.<number>>'), 'Record<string, number[]>')
})

test('spreadsheet section only lists spreadsheet methods', () => {
  const page = sectionPages(jsdoc(fixtures, ['builder.js']), { title: 'Spreadsheet API', editor: 'CSE', home: 'fixtures' })['ApiWidget.md']
  assert.match(page, /### CellOnly/)
  assert.match(page, /### SetSize/)
})

test('@openapi blocks merge into one spec', () => {
  const spec = mergeOpenapi(openapiFragments(jsdoc(fixtures, ['server.js'])), info)
  assert.equal(spec.openapi, '3.1.0')
  assert.equal(spec.paths['/healthcheck'].get.summary, 'Health check')
  assert.deepEqual(spec.components.schemas.Health, { type: 'boolean' })
  const md = webhooksMd(spec)
  assert.match(md, /## Webhooks\n\n### documentStatus\n\n`POST` Document status callback/)
  assert.match(md, /\| status \| integer \| yes \| Document state\.<br>`1` Being edited\.<br>`2` Ready to save\. \|/)
  assert.match(md, /\| users \| string\[\] \|  \|  \|/)
  assert.match(md, /\*\*Response 200\*\*: Answer with error 0\./)
})

test('spec without paths fails', () => {
  const block = { text: 'components:\n  schemas:\n    A:\n      type: string', where: 'x' }
  assert.throws(() => mergeOpenapi([block], info), /no @openapi paths found/)
})

test('duplicate path and method fails', () => {
  const block = { text: 'paths:\n  /a:\n    get:\n      responses: {}', where: 'x' }
  assert.throws(() => mergeOpenapi([block, block], info), /duplicate paths GET \/a/)
  const post = { text: 'paths:\n  /a:\n    post:\n      responses: {}', where: 'y' }
  assert.deepEqual(Object.keys(mergeOpenapi([block, post], info).paths['/a']), ['get', 'post'])
})

test('duplicate component fails', () => {
  const block = { text: 'components:\n  schemas:\n    A:\n      type: string', where: 'x' }
  assert.throws(() => mergeOpenapi([block, block], info), /duplicate component schemas\/A/)
})

test('dangling $ref fails', () => {
  const block = { text: "paths:\n  /a:\n    get:\n      responses:\n        '200':\n          $ref: '#/components/responses/Missing'", where: 'x' }
  assert.throws(() => mergeOpenapi([block], info), /unresolved \$ref #\/components\/responses\/Missing/)
})
