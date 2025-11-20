class MindMap {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
    }

    render(markdown) {
        if (!markdown) return;
        this.container.innerHTML = '';
        const tree = this.parseMarkdown(markdown);
        const html = this.buildHtml(tree);
        const wrapper = document.createElement('div');
        wrapper.className = 'mindmap-container';

        const treeDiv = document.createElement('div');
        treeDiv.className = 'mm-tree';
        treeDiv.innerHTML = html;

        wrapper.appendChild(treeDiv);
        this.container.appendChild(wrapper);

        // Trigger MathJax if available
        if (window.MathJax) {
             // MathJax 2.x
             if (MathJax.Hub) {
                MathJax.Hub.Queue(["Typeset", MathJax.Hub, this.container]);
             }
             // MathJax 3.x
             else if (MathJax.typesetPromise) {
                 MathJax.typesetPromise([this.container]);
             }
        }
    }

    parseMarkdown(markdown) {
        const lines = markdown.split('\n').filter(line => line.trim() !== '');
        const root = { children: [] };
        const stack = [{ node: root, level: -1 }];

        lines.forEach(line => {
            // Determine level by counting leading spaces (2 spaces = 1 level)
            const indentMatch = line.match(/^(\s*)/);
            const spaces = indentMatch ? indentMatch[1].length : 0;
            const level = Math.floor(spaces / 2); // Assuming 2 spaces per indent

            const content = line.trim().replace(/^- /, '').trim(); // Remove optional dash

            const newNode = {
                content: content,
                children: []
            };

            // Find parent
            while (stack.length > 0 && stack[stack.length - 1].level >= level) {
                stack.pop();
            }

            if (stack.length > 0) {
                stack[stack.length - 1].node.children.push(newNode);
            }

            stack.push({ node: newNode, level: level });
        });

        return root.children.length > 0 ? root.children[0] : null;
    }

    buildHtml(node) {
        if (!node) return '';

        let html = '<ul><li>';

        // Process content (simple markdown bold/italic support if needed, but marked handles inner HTML usually.
        // Here we are raw. We can use marked.parseInline if available, but let's stick to raw + MathJax for now)
        // Update: script.js has 'marked' available.
        let contentHtml = node.content;
        if (typeof marked !== 'undefined') {
             // marked.parse returns <p>...</p>, we might want inline.
             // marked.parseInline is available in newer marked versions.
             if (marked.parseInline) {
                 contentHtml = marked.parseInline(node.content);
             } else {
                 contentHtml = node.content; // Fallback
             }
        }

        html += `<div class="mm-content">${contentHtml}</div>`;

        if (node.children && node.children.length > 0) {
            // Recursively build children
            // But wait, the CSS structure requires nested <ul> inside the <li>

            // Actually, my CSS structure is:
            // <ul> <li> <content> <ul> <li>...</li> </ul> </li> </ul>

            // So children should be in a new <ul> inside this <li>
            html += '<ul>';
            node.children.forEach(child => {
                // We need to strip the outer <ul> from the recursive call because we are already inside one?
                // No, the recursive call generates <ul><li>...</li></ul>
                // My recursive function `buildHtml` generates the whole tree for a node.
                // It wraps it in <ul><li>...</li></ul>.

                // Refactoring for recursion:
                // `buildTreeHtml` will return just the <li> structure.
                html += this.buildNodeHtml(child);
            });
            html += '</ul>';
        }

        html += '</li></ul>';
        return html;
    }

    buildNodeHtml(node) {
        if (!node) return '';

        let html = '<li>';

        let contentHtml = node.content;
        if (typeof marked !== 'undefined' && marked.parseInline) {
             contentHtml = marked.parseInline(node.content);
        }

        html += `<div class="mm-content">${contentHtml}</div>`;

        if (node.children && node.children.length > 0) {
            html += '<ul>';
            node.children.forEach(child => {
                html += this.buildNodeHtml(child);
            });
            html += '</ul>';
        }

        html += '</li>';
        return html;
    }

    // Override buildHtml to start cleanly
    buildHtml(rootNode) {
        if (!rootNode) return '';
        return '<ul>' + this.buildNodeHtml(rootNode) + '</ul>';
    }
}

// Export for module usage if needed, or attach to window
window.MindMap = MindMap;
