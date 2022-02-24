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

/**
 *
 * @param type {'number' | 'string' | 'boolean'}
 * @param content {number | string | boolean}
 */
function JSONTreePrimitive(type, content) {
    if(type === 'number') return `<span style="color: #6897bb">${content}</span>`;
    else if(type === 'string') return `<span style="color: #698652">"${content}"</span>`;
    else if(type === 'boolean') return `<span style="color: #ffc66d">${content ? 'true' : 'false'}</span>`;
    else return `<span style="color: #698652">${content}</span>`;
}

class JSONTreeItem {
    static pool = [];
    static paddingSize = 20;

    /**
     *
     * @param type {'normal'|'expandable'}
     * @param name {string}
     * @param text {string}
     * @param parent {JSONTreeItem|null}
     */
    constructor(type, name, text, parent = null) {

        const elem = document.createElement('div');
        elem.classList.add('json-item');
        document.getElementById('json-tree').appendChild(elem);

        const icon = type === 'expandable' ? '<i class="fas fa-caret-down"></i>' : '';

        elem.innerHTML = `
        <div class="json-item__icon">
            ${icon}
        </div>
        <div class="json-item__name">${name}</div>
        <div class="json-item__type">: ${text}</div>
        `;

        elem.firstElementChild.addEventListener('click', e => {
            if(this.collapsed) this.expand();
            else this.collapse();
        })

        this.collapsed = false;
        this.type = type;
        this.elem = elem;
        this.level = parent ? parent.level+1 : 0;
        this.parent = parent;
        this.elem.style.paddingLeft = (this.level * JSONTreeItem.paddingSize) + 'px';
        JSONTreeItem.pool.push(this);
    }

    hide() {
        this.elem.style.display = 'none';
    }

    show() {
        this.elem.style.display = 'flex';
    }

    collapse() {
        if(this.type === 'normal') return;
        this.collapsed = true;
        this.elem.firstElementChild.innerHTML = '<i class="fas fa-caret-right"></i>';
        for(let jsonItem of JSONTreeItem.pool) {
            if(jsonItem.parent === this) {
                jsonItem.hide();
                jsonItem.collapse();
            }
        }
    }

    expand() {
        if(this.type === 'normal') return;
        this.collapsed = false;
        this.elem.firstElementChild.innerHTML = '<i class="fas fa-caret-down"></i>';
        for(let jsonItem of JSONTreeItem.pool) {
            if(jsonItem.parent === this) {
                jsonItem.show();
            }
        }
    }
}

function isPrimitiveArray(array) {
    for(let item of array) {
        if(typeof item === 'object') return false;
    }

    return JSON.stringify(array).length < 80;
}

function isPrimitive(value) {
    return typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean';
}

function renderItem(any, name = null, parent = null) {
    if(Array.isArray(any)) {
        if(isPrimitiveArray(any)) {
            let primitives = [];
            for(let item of any) {
                primitives.push(JSONTreePrimitive(typeof item, item));
            }

            const arrayItem = new JSONTreeItem('expandable', name || 'Array', '['+primitives.join(',')+']', parent);
            let i = -1;
            for(let item of any) {
                i ++;
                new JSONTreeItem('normal', i.toString(), JSONTreePrimitive(typeof item, item), arrayItem);
            }
        } else {
            const arrayItem = new JSONTreeItem('expandable', name || 'Array', '[]', parent);
            let i = -1;
            for(let item of any) {
                i ++;
                if(isPrimitive(item)) {
                    new JSONTreeItem('normal', i.toString(), JSONTreePrimitive(typeof item, item), arrayItem);
                } else {
                    renderItem(item, i.toString(), arrayItem);
                }
            }
        }
    } else {
        const objectItem = new JSONTreeItem('expandable', name || 'Object', '{}', parent);
        for(let key in any) {
            const item = any[key];
            if(isPrimitive(item)) {
                new JSONTreeItem('normal', key, JSONTreePrimitive(typeof item, item), objectItem);
            } else {
                renderItem(item, key, objectItem);
            }
        }
    }
}

document.getElementById('render').addEventListener('click', e => {
    try {
        document.getElementById('json-tree').innerHTML = '';
        const res = JSON.parse(cm.getValue());
        renderItem(res);
    } catch (e) {
        document.getElementById('json-tree').innerHTML = `<span style="color: red; font-size: 12px; text-align: center">${e.message}</span>`;
    }
})
