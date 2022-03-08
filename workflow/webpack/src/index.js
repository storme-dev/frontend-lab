import Visualizer from './visualizer';
import Editor from './editor';

window.onload = () => {
    Editor.load(document.getElementById('json-editor'));

    document.getElementById('render').addEventListener('click', e => {
        try {
            document.getElementById('json-tree').innerHTML = '';
            const res = JSON.parse(Editor.cm.getValue());
            Visualizer.render(res);
        } catch (e) {
            document.getElementById('json-tree').innerHTML = `<span style="color: red; font-size: 12px; text-align: center">${e.message}</span>`;
        }
    })
}

console.log(window);
