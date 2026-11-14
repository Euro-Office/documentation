# Macros

A macro is a small JavaScript program that changes the open document: it can
add or format text, fill cells, add slides and so on. Macros use the same
Office JavaScript API (`Api`) as plugins, and run inside the editor.

Macros are available in the document, spreadsheet and presentation editors.

## Where to find them

Open the **View** tab and click **Macros**. The button is only there when the
file is open for editing. The macros dialog lists the macros of the current
file on the left and shows the selected macro's code on the right.

Macros are stored in the file, so whoever opens the file gets them too.

## The macros dialog

| Button | What it does |
|---|---|
| **+** (next to *Macros*) | Adds a new, empty macro. |
| **Run** | Runs the selected macro on the open document. |
| **Debug** | Runs the macro with a breakpoint at its first line, so you can step through it in the developer tools (see [Debugging](#debugging)). |
| **Copy** | Duplicates the selected macro. |
| **Rename** | Renames the selected macro. |
| **Delete** | Removes the selected macro. |
| **Autostart** | Runs the macro each time the file is opened (see [Running macros when a file opens](#running-macros-when-a-file-opens)). |
| **Undo** / **Redo** | Undo or redo changes in the code. |

The AI menu (the wand icon) offers **Create from description** and **Convert
from VBA**. Both need the AI plugin; without it, the menu entries are
disabled.

Click **Save** to keep your changes. **Cancel** discards them.

## Your first macro

A new macro starts with an empty function:

```javascript
(function()
{

})();
```

Write your code between the braces and click **Run**. Every macro gets the
editor's API through the `Api` object.

### Document editor

Add a bold paragraph at the end of the document:

```javascript
(function()
{
    var oDocument = Api.GetDocument();
    var oParagraph = Api.CreateParagraph();
    oParagraph.AddText("Checked by a macro");
    oParagraph.SetBold(true);
    oDocument.Push(oParagraph);
})();
```

Replace a word everywhere in the document:

```javascript
(function()
{
    var oDocument = Api.GetDocument();
    oDocument.SearchAndReplace({searchString: "colour", replaceString: "color"});
})();
```

### Spreadsheet editor

Write today's date in A1 and highlight the cell:

```javascript
(function()
{
    var oSheet = Api.GetActiveSheet();
    var oRange = oSheet.GetRange("A1");
    oRange.SetValue("Updated " + new Date().toISOString().slice(0, 10));
    oRange.SetBold(true);
    oRange.SetFillColor(Api.CreateColorFromRGB(255, 255, 153));
})();
```

### Presentation editor

Add a slide with a text box:

```javascript
(function()
{
    var oPresentation = Api.GetPresentation();
    var oSlide = Api.CreateSlide();
    var oFill = Api.CreateSolidFill(Api.CreateRGBColor(68, 105, 149));
    var oStroke = Api.CreateStroke(0, Api.CreateNoFill());
    var oShape = Api.CreateShape("rect", 6000000, 1000000, oFill, oStroke);
    oShape.SetPosition(1500000, 2500000);
    oShape.GetDocContent().GetElement(0).AddText("Added by a macro");
    oSlide.AddObject(oShape);
    oPresentation.AddSlide(oSlide);
})();
```

Sizes and positions are in English Metric Units (EMU): 360,000 EMU is one
centimetre.

## Custom functions (spreadsheets)

In the spreadsheet editor, the macros dialog has a second list, **Custom
functions**. A custom function becomes a formula you can use in cells, like
the built-in ones.

Click **+** next to *Custom functions*. Describe the function in a comment
with `@customfunction`, its parameters and its return value, and register it
with `Api.AddCustomFunction`:

```javascript
(function()
{
    /**
     * Adds 25 % VAT to an amount.
     * @customfunction
     * @param {number} amount The amount without VAT.
     * @returns {number} The amount with VAT.
     */
    function WITHVAT(amount) {
        return amount * 1.25;
    }
    Api.AddCustomFunction(WITHVAT);
})();
```

Click **Save**. The function is stored in the workbook, and `=WITHVAT(100)`
returns 125.

## Recording a macro

Instead of writing code, you can record your actions. In the document,
spreadsheet and presentation editors, open the **View** tab and click **Record
macro**. Work in the file as usual, then click the button again to stop. While
recording, **Pause recording** suspends and resumes it.

The recording is added to the macros dialog as a new macro (*Macro 1*, *Macro
2* and so on), where you can run, edit or rename it.

## Running macros when a file opens

A macro with **Autostart** runs when the file is opened. What happens depends
on **File → Advanced Settings → Macros settings**:

- **Disable All**: autostart macros never run.
- **Show notification**: the editor asks whether to run them. This is the
  default. If you tick the option not to ask again, your answer is remembered.
- **Enable all**: they run without asking.

Integrators can set the default with `editorConfig.customization.macrosMode`
(`"warn"`, `"enable"` or `"disable"`), or remove macros from the editors with
`editorConfig.customization.macros: false`.

## What macros can and can't do

Macros work on the open file through `Api`. They have no access to the rest of
the computer: `window`, `document` and `alert` are not available inside a
macro, and `import` is blocked.

Macros from other office suites can't be run. VBA code in a file shows up in
the macros dialog as a comment. You can use it as a starting point for a
JavaScript version, or let **Convert from VBA** suggest one if the AI plugin
is installed.

## Debugging

**Debug** runs the macro with a `debugger;` statement in front of it. The
breakpoint only stops when the developer tools are open:

- **In a browser**, open the developer tools (usually F12), then click
  **Debug**.
- **In the desktop editors**, start the app with
  `--ascdesktop-support-debug-info`, click in the editor and press **F1** to
  open the developer tools, then click **Debug**.

You can also add `debugger;` anywhere in your own code.

## API reference

The objects and methods available to macros are documented in the JSDoc
comments of the editors' API (`word/apiBuilder.js`, `cell/apiBuilder.js` and
`slide/apiBuilder.js` in [sdkjs](https://github.com/Euro-Office/sdkjs)).
