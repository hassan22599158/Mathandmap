class MindMap {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.zoom = d3.zoom().scaleExtent([0.1, 2]).on("zoom", (e) => {
            if (this.g) {
                this.g.attr("transform", e.transform);
            }
        });
    }

    render(markdown) {
        if (!markdown) return;
        this.container.innerHTML = '';

        const data = this.parseMarkdown(markdown);
        if (!data) return;

        const width = this.container.clientWidth;
        const height = this.container.clientHeight || 600;

        // Create SVG
        const svg = d3.select(this.container).append("svg")
            .attr("width", "100%")
            .attr("height", "100%")
            .call(this.zoom)
            .on("dblclick.zoom", null);

        this.g = svg.append("g");

        const root = d3.hierarchy(data);

        // Layout settings
        // Vertical Layout
        // nodeSize([width, height])
        const nodeWidth = 280;
        const nodeHeight = 200;
        const xSpacing = 320; // Horizontal space between nodes
        const ySpacing = 300; // Vertical space between levels

        const tree = d3.tree().nodeSize([xSpacing, ySpacing]);

        tree(root);

        // Links
        this.g.selectAll(".link")
            .data(root.links())
            .enter().append("path")
            .attr("class", "link")
            .attr("fill", "none")
            .attr("stroke", "#999")
            .attr("stroke-width", 2)
            .attr("d", d3.linkVertical()
                .x(d => d.x)
                .y(d => d.y));

        // Nodes
        const nodes = this.g.selectAll(".node")
            .data(root.descendants())
            .enter().append("g")
            .attr("class", d => "node depth-" + d.depth)
            .attr("transform", d => `translate(${d.x},${d.y})`);

        // ForeignObject for HTML content
        // In vertical layout, the point (d.x, d.y) is the top-center of where the node hangs?
        // Usually (d.x, d.y) is the point where the link connects.
        // For parent->child, link goes from bottom of parent to top of child.
        // d3.tree puts nodes at specific points.
        // We want the card to be centered on (d.x, d.y) or below it?
        // Ideally, the node content is centered at the point, or starts there.
        // Let's center the card horizontally at d.x, and start it at d.y.

        nodes.append("foreignObject")
            .attr("width", nodeWidth)
            .attr("height", 400) // Allow tall content
            .attr("x", -nodeWidth / 2) // Center horizontally
            .attr("y", -20) // Start slightly above to cover the link end?
                            // Or start at 0. Let's start at -10 to give some overlap or padding feel.
            .append("xhtml:div")
            .attr("class", "mm-node-content")
            .html(d => `<div class="mm-card">${this.renderContent(d.data.content)}</div>`);

        // Initial Zoom/Pan
        // Center root at top center
        const initialX = width / 2;
        const initialY = 50;

        svg.call(this.zoom.transform, d3.zoomIdentity.translate(initialX, initialY).scale(0.8));

        if (window.MathJax) {
            MathJax.Hub.Queue(["Typeset", MathJax.Hub, this.container]);
        }
    }

    parseMarkdown(markdown) {
        const lines = markdown.split('\n');
        const root = { children: [] };
        const stack = [{ node: root, level: -1 }];
        let lastNode = null;

        lines.forEach(line => {
            if (line.trim() === '') return;

            // Check for Rich Content (line starting with :)
            if (lastNode && line.trim().startsWith(':')) {
                const contentLine = line.trim().substring(1).trim();
                lastNode.content += '\n' + contentLine;
                return;
            }

            const indentMatch = line.match(/^(\s*)/);
            const spaces = indentMatch ? indentMatch[1].length : 0;
            const level = Math.floor(spaces / 2);

            const content = line.trim().replace(/^- /, '').trim();

            const newNode = {
                content: content,
                children: []
            };

            while (stack.length > 0 && stack[stack.length - 1].level >= level) {
                stack.pop();
            }

            if (stack.length > 0) {
                stack[stack.length - 1].node.children.push(newNode);
            }

            stack.push({ node: newNode, level: level });
            lastNode = newNode;
        });

        return root.children.length > 0 ? root.children[0] : null;
    }

    renderContent(text) {
        if (typeof marked !== 'undefined') {
             return marked.parse(text);
        }
        return text;
    }
}

window.MindMap = MindMap;
