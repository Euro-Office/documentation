# Available plugins

Plugins extend the {{ brand.name }} editors with additional panels, tools, and
integrations. The plugins below are known to work with {{ brand.name }}. For
how to install, autostart, or hide them, see
[Plugins](../configuration/plugins.md). To build your own, see
[Plugin development](../development/plugins.md).

{{ brand.name }} has no plugin marketplace. Plugins are installed by the
administrator of the document server.

## {{ brand.name }} plugins

These plugins are maintained in the
[{{ brand.name }} plugins repository]({{ brand.repo }}/plugins), a snapshot of
the ONLYOFFICE plugins. Bundled plugins ship with the server image; the others
are published as `.plugin` files on the
[releases page]({{ brand.repo }}/plugins/releases).

!!! note "Work in progress"

    Bundling and the `.plugin` releases are not released yet. See
    [Bundled plugins](../configuration/plugins.md#bundled-plugins) for the
    current state.

| Plugin | What it does | Bundled | External services contacted | License |
|---|---|---|---|---|
| Highlight code | Insert source code with syntax highlighting | Yes | Google Fonts (icon font) | Apache-2.0 |
| Photo editor | Crop, resize, and apply effects to images | Yes | None | Apache-2.0 |
| Zotero | Insert citations and bibliographies from a Zotero library | Yes | Zotero API (`api.zotero.org`), citation styles from `zotero.org` | AGPL-3.0 |
| Mendeley | Insert citations and bibliographies from a Mendeley library | Yes | Mendeley API (`api.mendeley.com`), citation styles from `zotero.org` and `raw.githubusercontent.com` | Apache-2.0 |
| OCR | Recognize text in images and insert it | No | OCR engine and language data from `cdn.jsdelivr.net`. Images are processed in the browser | Apache-2.0 |
| DeepL | Translate the selected text with DeepL | No | DeepL API, through the ONLYOFFICE proxy `plugins-services.onlyoffice.com` | Apache-2.0 |
| Translator | Translate the selected text with Google Translate | No | Google Translate | Apache-2.0 |
| Thesaurus | Find synonyms and antonyms | No | Big Huge Thesaurus (`words.bighugelabs.com`) | Apache-2.0 |
| LanguageTool | Check spelling, grammar, and style | No | LanguageTool API (`api.languagetoolplus.com`) | Apache-2.0 |
| AI | Chat with and run tasks through a language model | No | The AI providers the user configures (for example OpenAI, Anthropic, Mistral, or a local Ollama) | AGPL-3.0 |

The license column refers to the plugin's own code. Third-party libraries
included in a plugin keep their own licenses, listed in the plugin's
`licenses/` folder. The AI plugin is a background plugin: when installed on
the server it starts for every user (see
[Starting plugins automatically](../configuration/plugins.md#starting-plugins-automatically)).

Further plugins from the repository, such as Word counter or Draw.io, are also
available as `.plugin` files but have not been reviewed for {{ brand.name }}.

## Community plugins

| Plugin | Maintainer | License | Description |
|---|---|---|---|
| [MetaVox editor plugin](https://github.com/Rikdekker/metavox-editor-plugin) | Rik Dekker (community) | AGPL-3.0 | Displays and edits [MetaVox](https://github.com/Rikdekker/metavox-editor-plugin) document metadata in a right-side panel while editing documents. Requires the Nextcloud MetaVox app and the Nextcloud connector. |

!!! tip "Community plugins welcome"

    We're happy to list further plugins that are maintained by the community.
    If you maintain one, open an issue or pull request on the
    [documentation repository]({{ brand.repo }}/documentation).
