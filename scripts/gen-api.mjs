// SPDX-FileCopyrightText: Euro-Office contributors
// SPDX-License-Identifier: AGPL-3.0-only
//
// Generates the API reference into docs/api/ from the sources pinned in
// api-refs.yml. Run with `make api`.

import { execFileSync, spawnSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { basename, dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import yaml from 'js-yaml'

const require = createRequire(import.meta.url)
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const OUT = join(ROOT, 'docs/api')
const CACHE = join(ROOT, '.api-src')

const BUILDER_FILES = ['word/apiBuilder.js', 'cell/apiBuilder.js', 'slide/apiBuilder.js', 'pdf/apiBuilder.js']
const PLUGIN_FILES = [
  'common/apiBase_plugins.js', 'common/plugins/plugin_base_api.js',
  'word/api_plugins.js', 'cell/api_plugins.js', 'slide/api_plugins.js', 'pdf/api_plugins.js',
  'common/base-plugin-events.js', 'word/plugin-events.js', 'cell/plugin-events.js', 'slide/plugin-events.js',
]
const CONFIG_FILE = 'apps/api/documents/config.d.ts'
const SERVER_DIRS = ['DocService/sources', 'Common/sources']
const SPARSE = { sdkjs: [...BUILDER_FILES, ...PLUGIN_FILES], 'web-apps': [CONFIG_FILE], server: SERVER_DIRS }

const EDITORS = { CDE: 'Text document', CSE: 'Spreadsheet', CPE: 'Presentation', PDFE: 'PDF', CFE: 'Forms' }
const SECTIONS = [
  { dir: 'text-document', title: 'Text document API', editor: 'CDE', home: 'word' },
  { dir: 'spreadsheet', title: 'Spreadsheet API', editor: 'CSE', home: 'cell' },
  { dir: 'presentation', title: 'Presentation API', editor: 'CPE', home: 'slide' },
  { dir: 'pdf', title: 'PDF API', editor: 'PDFE', home: 'pdf' },
]

// Shallow, sparse, blob-filtered checkout of only the files we read
function source(name, ref, repo) {
  const override = process.env[`API_SRC_${name.toUpperCase().replace(/-/g, '_')}`]
  if (override) return override
  const dir = join(CACHE, name)
  const marker = join(dir, '.git/api-ref')
  const want = `${ref} ${SPARSE[name].join(' ')}`
  if (existsSync(marker) && readFileSync(marker, 'utf8') === want) return dir
  rmSync(dir, { recursive: true, force: true })
  const git = (...args) => execFileSync('git', ['-C', dir, ...args], { stdio: ['ignore', 'ignore', 'inherit'] })
  mkdirSync(dir, { recursive: true })
  git('init', '-q')
  git('remote', 'add', 'origin', `https://github.com/${repo}`)
  git('sparse-checkout', 'set', '--no-cone', ...SPARSE[name].map((p) => `/${p}`))
  git('fetch', '-q', '--depth', '1', '--filter=blob:none', 'origin', ref)
  git('checkout', '-q', 'FETCH_HEAD')
  writeFileSync(marker, want)
  return dir
}

// jsdoc exits 1 on unparsable @param types but still prints all doclets: count those errors, show the rest
export function jsdoc(cwd, args) {
  const r = spawnSync(process.execPath, [require.resolve('jsdoc/jsdoc.js'), '-X', ...args], { cwd, maxBuffer: 1 << 30, encoding: 'utf8' })
  const lines = (r.stderr ?? '').split('\n').filter(Boolean)
  const isTypeError = (l) => l.includes("Unable to parse a tag's type expression")
  lines.filter((l) => !isTypeError(l)).forEach((l) => console.error(l))
  const ignored = lines.filter(isTypeError).length
  if (ignored) console.warn(`jsdoc: ignored ${ignored} unparsable tag types in ${args.join(' ')}`)
  if (!r.stdout) throw new Error(`jsdoc failed with status ${r.status} in ${cwd}`)
  return JSON.parse(r.stdout)
}

export function esc(text = '') {
  return text
    .replace(/[\\`*_[\]{}|<>]|&(?!(#\d+|#x[\da-f]+|\w+);)/gi, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' })[c] ?? `\\${c}`)
    .replace(/&lt;(\/?)(b|i|em|strong|code|br)\s*\/?&gt;/g, '<$1$2>')
    .replace(/&lt;note&gt;/g, '<b>Note:</b> ').replace(/&lt;\/note&gt;/g, '')
}

// Array.<T> -> T[], Object.<K,V> -> Record<K, V>, innermost first
export function typeName(name) {
  let prev
  while (prev !== name) {
    prev = name
    name = name.replace(/Array\.<([^<>]*)>/g, '$1[]').replace(/Object\.<([^<>]*)>/g, (_, kv) => `Record<${kv.replace(/\s*,\s*/g, ', ')}>`)
  }
  return name
}

const editorsOf = (d) => d.tags?.find((t) => t.title === 'typeofeditors')?.text.match(/\b(CDE|CSE|CPE|PDFE|CFE)\b/g) ?? []
const anchor = (name) => name.toLowerCase().replace(/[^\w-]/g, '')

export function apiDoclets(doclets) {
  return doclets
    .filter((d) => d.meta && !d.undocumented && d.access !== 'private' && !/^private_/.test(d.name) && d.kind !== 'package')
    .map((d) => ({ ...d, memberof: d.memberof?.replace(/^<anonymous>~/, '') }))
}

// Same name in several files (e.g. ApiRange in word and cell): prefer the section's own file
function pick(list, home) {
  const map = new Map()
  for (const d of list) {
    const key = `${d.memberof}#${d.name}`
    if (!map.has(key) || d.meta.path.endsWith(`/${home}`)) map.set(key, d)
  }
  return [...map.values()]
}

// Returns { 'index.md': ..., 'ApiRange.md': ..., 'types.md': ... } for one section
export function sectionPages(doclets, { title, editor, home }) {
  const docs = apiDoclets(doclets)
  const members = pick(docs.filter((d) => (d.kind === 'function' || d.kind === 'event') && d.memberof
    && (!editor || editorsOf(d).includes(editor))), home)
  const classNames = [...new Set(members.map((d) => d.memberof))].sort()
  const classDoc = Object.fromEntries(pick(docs.filter((d) => d.kind === 'class'), home).map((d) => [d.name, d]))
  const typedefs = pick(docs.filter((d) => d.kind === 'typedef'), home).sort((a, b) => a.name.localeCompare(b.name))
  const typeNames = new Set(typedefs.map((d) => d.name))
  const classSet = new Set(classNames)

  // {@link Class#member label} -> link to the class page anchor, plain label if the target is unknown
  const text = (raw = '') => raw.split(/(\{@link\s[^}]*\})/).map((part) => {
    const m = part.match(/^\{@link\s+([^\s|}]+)[\s|]*([^}]*)\}$/)
    if (!m) return esc(part)
    const [cls, member] = m[1].split('#')
    const label = esc(m[2].trim() || m[1].replace('#', '.'))
    if (classSet.has(cls)) return `[${label}](${cls}.md${member ? `#${anchor(member)}` : ''})`
    const typedef = member ?? cls
    return typeNames.has(typedef) ? `[${label}](types.md#${anchor(typedef)})` : label
  }).join('')
  const cell = (raw = '') => text(raw.replace(/^-\s+/, '')).replace(/\s*\n\s*/g, ' ')
  const summary = (raw = '') => cell(raw.split(/\n|(?<=\.)\s/)[0])

  const type = (t) => cell((t?.names ?? []).map(typeName).join(' | ')).replace(/\b[A-Za-z_]\w*\b/g, (w) =>
    classSet.has(w) ? `[${w}](${w}.md)` : typeNames.has(w) ? `[${w}](types.md#${anchor(w)})` : w)
  const paramsTable = (params) => !params?.length ? '' : [
    '| Name | Type | Description |', '|---|---|---|',
    ...params.map((p) => `| ${cell(p.name)}${p.optional ? ' (optional)' : ''} | ${type(p.type)} | ${cell(p.description)}${p.defaultvalue !== undefined ? ` Default: \`${p.defaultvalue}\`` : ''} |`),
  ].join('\n')

  const memberSection = (d) => [
    `### ${d.name}`,
    text(d.description),
    '```javascript\n' + `${d.kind === 'event' ? 'on: ' : ''}${d.name}(${(d.params ?? []).filter((p) => !p.name.includes('.')).map((p) => p.optional ? `[${p.name}]` : p.name).join(', ')})` + '\n```',
    d.params?.length ? `**Parameters**\n\n${paramsTable(d.params)}` : '',
    d.returns?.length ? `**Returns**: ${d.returns.map((r) => `${type(r.type)} ${cell(r.description)}`).join(', ')}` : '',
    editorsOf(d).length ? `**Editors**: ${editorsOf(d).map((e) => EDITORS[e]).join(', ')}` : '',
  ].filter(Boolean).join('\n\n')

  const pages = {}
  for (const name of classNames) {
    const own = members.filter((d) => d.memberof === name).sort((a, b) => a.name.localeCompare(b.name))
    const table = (list, label) => !list.length ? '' : [
      `## ${label}`,
      ['| Name | Description |', '|---|---|', ...list.map((d) => `| [${d.name}](#${anchor(d.name)}) | ${summary(d.description)} |`)].join('\n'),
      ...list.map(memberSection),
    ].join('\n\n')
    pages[`${name}.md`] = [`# ${name}`, text(classDoc[name]?.description),
      table(own.filter((d) => d.kind === 'function'), 'Methods'),
      table(own.filter((d) => d.kind === 'event'), 'Events')].filter(Boolean).join('\n\n')
  }
  pages['types.md'] = [`# Types`, ...typedefs.map((d) => [
    `### ${d.name}`, text(d.description), `**Type**: ${type(d.type)}`,
    d.properties?.length ? paramsTable(d.properties) : '',
  ].filter(Boolean).join('\n\n'))].join('\n\n')
  pages['index.md'] = [`# ${title}`,
    ['| Class | Description |', '|---|---|', ...classNames.map((n) => `| [${n}](${n}.md) | ${summary(classDoc[n]?.description)} |`)].join('\n'),
    'See also [Types](types.md).'].join('\n\n')
  return pages
}

export function openapiFragments(doclets) {
  return doclets.flatMap((d) => (d.tags ?? []).filter((t) => t.title === 'openapi')
    .map((t) => ({ text: t.text, where: `${d.meta?.filename}:${d.meta?.lineno}` })))
}

export function mergeOpenapi(fragments, info) {
  const spec = { openapi: '3.1.0', info, tags: [], paths: {}, webhooks: {}, components: {} }
  const put = (obj, key, val, what) => {
    if (key in obj) throw new Error(`duplicate ${what}`)
    obj[key] = val
  }
  for (const { text, where } of fragments) {
    for (const [key, val] of Object.entries(yaml.load(text) ?? {})) {
      if (key === 'tags') {
        for (const t of val) {
          if (spec.tags.some((x) => x.name === t.name)) throw new Error(`duplicate tag ${t.name} (${where})`)
          spec.tags.push(t)
        }
      } else if (key === 'paths' || key === 'webhooks') {
        for (const [path, ops] of Object.entries(val)) for (const [method, op] of Object.entries(ops)) {
          put(spec[key][path] ??= {}, method, op, `${key} ${method.toUpperCase()} ${path} (${where})`)
        }
      } else if (key === 'components') {
        for (const [kind, items] of Object.entries(val)) for (const [name, item] of Object.entries(items)) {
          put(spec.components[kind] ??= {}, name, item, `component ${kind}/${name} (${where})`)
        }
      } else throw new Error(`unsupported top-level key "${key}" in @openapi block (${where})`)
    }
  }
  const resolve = (ref) => ref.startsWith('#/') && ref.slice(2).split('/')
    .reduce((o, k) => o?.[k.replace(/~1/g, '/').replace(/~0/g, '~')], spec) !== undefined
  const walk = (o) => {
    if (!o || typeof o !== 'object') return
    if (typeof o.$ref === 'string' && !resolve(o.$ref)) throw new Error(`unresolved $ref ${o.$ref}`)
    Object.values(o).forEach(walk)
  }
  walk(spec)
  if (!Object.keys(spec.paths).length) throw new Error('no @openapi paths found: does the pinned server ref have @openapi blocks?')
  for (const k of ['tags', 'webhooks', 'components']) if (!Object.keys(spec[k]).length) delete spec[k]
  return spec
}

// neoteroi does not render OpenAPI 3.1 webhooks: list them with their payload fields
export function webhooksMd(spec) {
  const deref = (o) => o?.$ref ? deref(o.$ref.slice(2).split('/').reduce((x, k) => x[k], spec)) : o
  const md = (t = '') => t.replace(/\|/g, '\\|').replace(/\s*\n\s*/g, ' ')
  const values = (p) => (p.oneOf ?? []).filter((v) => 'const' in v).map((v) => `<br>\`${v.const}\` ${md(v.description)}`)
    .concat(p.enum ? [`<br>Values: ${p.enum.map((v) => `\`${v}\``).join(', ')}`] : []).join('')
  const out = []
  for (const [name, ops] of Object.entries(spec.webhooks ?? {})) {
    for (const [method, op] of Object.entries(ops)) {
      out.push(...[`### ${name}`, `\`${method.toUpperCase()}\` ${op.summary ?? ''}`, op.description].filter(Boolean))
      const schema = deref(op.requestBody?.content?.['application/json']?.schema)
      if (schema?.properties) {
        out.push('**Payload**', ['| Field | Type | Required | Description |', '|---|---|---|---|',
          ...Object.entries(schema.properties).map(([field, p]) => `| ${field} | ${p.$ref ? p.$ref.split('/').pop() : p.type === 'array' ? `${p.items?.$ref?.split('/').pop() ?? p.items?.type}[]` : p.type ?? 'any'} | ${schema.required?.includes(field) ? 'yes' : ''} | ${md(p.description)}${values(p)} |`)].join('\n'))
      }
      for (const [code, r] of Object.entries(op.responses ?? {})) out.push(`**Response ${code}**: ${md(deref(r).description)}`)
    }
  }
  return out.length ? ['## Webhooks', ...out].join('\n\n') : ''
}

// Generated text may contain "{{": keep it away from mkdocs-macros, but keep the footer branded
const footer = (repo, ref) => `\n\n---\n\n<small>Generated from [source code]({{ brand.repo }}/${basename(repo)}/tree/${ref}) by Ascensio System SIA, modified by {{ brand.company }} contributors. Code AGPL-3.0-only, documentation text [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/).</small>\n`
const wrap = (md, repo, ref) => `{% raw %}\n${md}\n{% endraw %}${footer(repo, ref)}`

function write(file, text) {
  mkdirSync(dirname(file), { recursive: true })
  writeFileSync(file, text)
}

function walkMd(dir) {
  return readdirSync(dir, { withFileTypes: true, recursive: true })
    .filter((e) => e.isFile() && e.name.endsWith('.md')).map((e) => join(e.parentPath, e.name))
}

function main() {
  const t0 = Date.now()
  const refs = yaml.load(readFileSync(join(ROOT, 'api-refs.yml'), 'utf8'))
  rmSync(OUT, { recursive: true, force: true })

  const s = refs.sdkjs
  const sdkjs = source('sdkjs', s.ref, s.repo)
  const builder = jsdoc(sdkjs, BUILDER_FILES)
  for (const sec of SECTIONS) {
    for (const [file, md] of Object.entries(sectionPages(builder, sec))) write(join(OUT, sec.dir, file), wrap(md, s.repo, s.ref))
  }
  const plugins = jsdoc(sdkjs, PLUGIN_FILES.filter((f) => existsSync(join(sdkjs, f))))
  for (const [file, md] of Object.entries(sectionPages(plugins, { title: 'Plugin API', home: 'common' }))) {
    write(join(OUT, 'plugins', file), wrap(md, s.repo, s.ref))
  }

  const w = refs['web-apps']
  const config = join(CACHE, 'editor-config/config.d.ts')
  // ponytail: exports every top-level type so TypeDoc documents them; drop once config.d.ts exports them itself
  write(config, readFileSync(join(source('web-apps', w.ref, w.repo), CONFIG_FILE), 'utf8').replace(/^(type|interface) /gm, 'export $1 '))
  execFileSync(join(ROOT, 'node_modules/.bin/typedoc'), [config,
    '--plugin', 'typedoc-plugin-markdown', '--out', join(OUT, 'editor-config'), '--readme', 'none',
    '--entryFileName', 'index.md', '--disableSources', '--hidePageHeader', '--hideBreadcrumbs',
    '--skipErrorChecking', '--name', 'Editor configuration', '--logLevel', 'Warn'], { stdio: 'inherit', cwd: dirname(config) })
  for (const f of walkMd(join(OUT, 'editor-config'))) writeFileSync(f, wrap(readFileSync(f, 'utf8'), w.repo, w.ref))

  const sv = refs.server
  const server = source('server', sv.ref, sv.repo)
  const spec = mergeOpenapi(openapiFragments(jsdoc(server, ['-r', ...SERVER_DIRS])), { title: 'Server HTTP API', version: sv.ref.slice(0, 12) })
  write(join(OUT, 'server/openapi.json'), JSON.stringify(spec, null, 2))
  write(join(OUT, 'server/index.md'), `[OAD(./docs/api/server/openapi.json)]\n\n{% raw %}\n${webhooksMd(spec)}\n{% endraw %}${footer(sv.repo, sv.ref)}`)

  write(join(OUT, 'index.md'), `# API reference

Reference for the {{ brand.name }} APIs, generated from source code.

!!! note "Attribution"

    Generated from source code by Ascensio System SIA, modified by {{ brand.company }} contributors. Code AGPL-3.0-only, documentation text [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/).
    Sources: [sdkjs]({{ brand.repo }}/sdkjs/tree/${s.ref}), [web-apps]({{ brand.repo }}/web-apps/tree/${w.ref}), [server]({{ brand.repo }}/server/tree/${sv.ref}).

- [Text document API](text-document/index.md)
- [Spreadsheet API](spreadsheet/index.md)
- [Presentation API](presentation/index.md)
- [PDF API](pdf/index.md)
- [Plugin API](plugins/index.md)
- [Editor configuration](editor-config/index.md)
- [Server HTTP API](server/index.md)
`)
  write(join(OUT, 'SUMMARY.md'), `- [API reference](index.md)
- [Text document API](text-document/)
- [Spreadsheet API](spreadsheet/)
- [Presentation API](presentation/)
- [PDF API](pdf/)
- [Plugin API](plugins/)
- [Editor configuration](editor-config/)
- [Server HTTP API](server/index.md)
`)
  console.log(`api: ${walkMd(OUT).length} pages in ${((Date.now() - t0) / 1000).toFixed(1)} s`)
}

if (process.argv[1] === fileURLToPath(import.meta.url)) main()
