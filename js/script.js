document.addEventListener('DOMContentLoaded', () => {
    const editor = document.getElementById('editor');
    const preview = document.getElementById('preview');
    const toggleThemeBtn = document.getElementById('toggle-theme');
    const fontSizeSelect = document.getElementById('font-size');
    const btnHelp = document.getElementById('btn-help');
    const modal = document.getElementById('help-modal');
    const spanClose = document.getElementsByClassName("close")[0];
    const helpContent = document.getElementById('help-content');

    // Initial Setup
    mermaid.initialize({
        startOnLoad: false,
        theme: document.body.getAttribute('data-theme') === 'dark' ? 'dark' : 'default',
        direction: 'RTL',
        flowchart: {
            htmlLabels: true
        }
    });

    // Theme Toggle
    toggleThemeBtn.addEventListener('click', () => {
        const currentTheme = document.body.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.body.setAttribute('data-theme', newTheme);
        toggleThemeBtn.textContent = newTheme === 'dark' ? '☀️' : '🌙';

        // Re-render mermaid charts with new theme
        renderContent();
    });

    // Font Size
    fontSizeSelect.addEventListener('change', (e) => {
        preview.className = 'preview-pane ' + 'font-' + e.target.value;
        editor.className = 'font-' + e.target.value;
    });

    // Debounce function for rendering
    let timeout = null;
    editor.addEventListener('input', () => {
        clearTimeout(timeout);
        timeout = setTimeout(renderContent, 500);
    });

    // Render Content
    function renderContent() {
        const rawText = editor.value;

        // Configure Marked
        marked.setOptions({
            gfm: true,
            breaks: true
        });

        let html = marked.parse(rawText);

        preview.innerHTML = html;

        // Process MindMap blocks
        // Look for code blocks with language 'mindmap'
        const mindmapBlocks = preview.querySelectorAll('code.language-mindmap');
        mindmapBlocks.forEach((block, index) => {
            const container = document.createElement('div');
            container.id = `mindmap-${index}`;
            container.className = 'custom-mindmap-wrapper';
            block.parentElement.replaceWith(container);

            const mm = new MindMap(container.id);
            mm.render(block.textContent);
        });

        // Post-process: Find mermaid code blocks (Legacy support)
        const codeBlocks = preview.querySelectorAll('code.language-mermaid');
        codeBlocks.forEach((block, index) => {
            const div = document.createElement('div');
            div.className = 'mermaid';
            div.textContent = block.textContent;
            div.id = `mermaid-${index}`;
            block.parentElement.replaceWith(div);
        });

        // Render Mermaid
        mermaid.run().catch(err => console.error('Mermaid error:', err));

        // Render MathJax
        // Since we switched to MathJax 2.x, the API is different (MathJax.Hub.Queue)
        if (window.MathJax) {
            MathJax.Hub.Queue(["Typeset", MathJax.Hub, preview]);
        }
    }

    // Help Modal Logic
    btnHelp.addEventListener('click', () => {
        modal.style.display = "block";
        // Load Guide
        fetch('GUIDE.md')
            .then(response => response.text())
            .then(text => {
                helpContent.innerHTML = marked.parse(text);
                // Render diagrams and math in guide too
                setTimeout(() => {
                     // Process MindMap blocks in guide
                    const mindmapBlocks = helpContent.querySelectorAll('code.language-mindmap');
                    mindmapBlocks.forEach((block, index) => {
                        const container = document.createElement('div');
                        container.id = `mindmap-guide-${index}`;
                        container.className = 'custom-mindmap-wrapper';
                        block.parentElement.replaceWith(container);
                        const mm = new MindMap(container.id);
                        mm.render(block.textContent);
                    });

                    const codeBlocks = helpContent.querySelectorAll('code.language-mermaid');
                    codeBlocks.forEach((block, index) => {
                        const div = document.createElement('div');
                        div.className = 'mermaid';
                        div.textContent = block.textContent;
                        block.parentElement.replaceWith(div);
                    });
                    mermaid.run({nodes: helpContent.querySelectorAll('.mermaid')});
                    if (window.MathJax) {
                        MathJax.Hub.Queue(["Typeset", MathJax.Hub, helpContent]);
                    }
                }, 100);
            })
            .catch(err => helpContent.innerText = "تعذر تحميل التعليمات.");
    });

    spanClose.addEventListener('click', () => {
        modal.style.display = "none";
    });

    window.addEventListener('click', (event) => {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    });

    // Initial render with the 5 requested maps
    editor.value = `# الخرائط الذهنية المطلوبة

استخدم الكود التالي \`\`\`mindmap ... \`\`\` لإنشاء الخرائط.

## 1. قوانين الأسس
\`\`\`mindmap
قوانين الأسس
  الضرب
    $a^m \\times a^n = a^{m+n}$
  القسمة
    $\\frac{a^m}{a^n} = a^{m-n}$
  قوة القوة
    $(a^m)^n = a^{m \\cdot n}$
  الأس الصفري
    $a^0 = 1$
  الأس السالب
    $a^{-n} = \\frac{1}{a^n}$
\`\`\`

## 2. العمليات على الأعداد النسبية
\`\`\`mindmap
العمليات على الأعداد النسبية
  الجمع والطرح
    توحيد المقامات
    الخواص
      الانغلاق
      الإبدال
      الدمج
      المعكوس
      المحايد
  الضرب
    البسط في البسط والمقام في المقام
  القسمة
    الضرب في المقلوب
\`\`\`

## 3. خواص عملية الجمع في ح
\`\`\`mindmap
خواص عملية الجمع في $\\mathbb{R}$
  الانغلاق
    $a+b \\in \\mathbb{R}$
  الإبدال
    $a+b = b+a$
  الدمج
    $(a+b)+c = a+(b+c)$
  المحايد الجمعي
    $a+0 = a$
  المعكوس الجمعي
    $a+(-a) = 0$
\`\`\`

## 4. قانون أوم
\`\`\`mindmap
قانون أوم
  الصيغة الرياضية
    $V = I \\times R$
    $I = \\frac{V}{R}$
    $R = \\frac{V}{I}$
  التعريف
    التيار يتناسب طردياً مع الجهد
    التيار يتناسب عكسياً مع المقاومة
  وحدات القياس
    الجهد (فولت)
    التيار (أمبير)
    المقاومة (أوم)
\`\`\`

## 5. مجموعات الأعداد
\`\`\`mindmap
مجموعات الأعداد
  أعداد العد
    $1, 2, 3, ...$
  الأعداد الطبيعية $\\mathbb{N}$
    $0, 1, 2, ...$
  الأعداد الصحيحة $\\mathbb{Z}$
    $... , -1, 0, 1, ...$
  الأعداد النسبية $\\mathbb{Q}$
    $\\frac{a}{b}, b \\neq 0$
  الأعداد الحقيقية $\\mathbb{R}$
    تضم النسبية وغير النسبية
\`\`\`
`;
    renderContent();
});
