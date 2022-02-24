let cm = CodeMirror(document.getElementById('json-editor'), {
    value: '{\n\t"prop": "value"\n}',
    mode:  "application/json",
    lineNumbers: true,
    lineWrapping: true,
    tabs: true,
    tabSize: 4,
    indentUnit: 4,
    autoCloseBrackets: true,
    matchBrackets: true,
    foldGutter: true,
    gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"],
    foldOptions: {
        widget: (from, to) => {
            let count = undefined;

            // Get open / close token
            let startToken = '{', endToken = '}';
            let prevLine = cm.getLine(from.line);
            if (prevLine.lastIndexOf('[') > prevLine.lastIndexOf('{')) {
                startToken = '[';
                endToken = ']';
            }

            // Get json content
            let internal = cm.getRange(from, to);
            let toParse = startToken + internal + endToken;

            // Get key count
            try {
                let parsed = JSON.parse(toParse);
                count = Object.keys(parsed).length;
            } catch(e) { }

            return count ? `\u21A4${count}\u21A6` : '\u2194';
        }
    }
});
