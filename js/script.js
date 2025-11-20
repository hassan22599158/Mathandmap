document.addEventListener('DOMContentLoaded', () => {
    const editor = document.getElementById('editor');
    const preview = document.getElementById('preview');
    const toggleThemeBtn = document.getElementById('toggle-theme');
    const fontSizeSelect = document.getElementById('font-size');
    const btnFixMath = document.getElementById('btn-fix-math');
    const btnHelp = document.getElementById('btn-help');
    const modal = document.getElementById('help-modal');
    const spanClose = document.getElementsByClassName("close")[0];
    const helpContent = document.getElementById('help-content');

    // Theme Toggle
    toggleThemeBtn.addEventListener('click', () => {
        const currentTheme = document.body.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.body.setAttribute('data-theme', newTheme);
        toggleThemeBtn.textContent = newTheme === 'dark' ? '☀️' : '🌙';
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

        marked.setOptions({
            gfm: true,
            breaks: true
        });

        let html = marked.parse(rawText);

        preview.innerHTML = html;

        // Process MindMap blocks
        const mindmapBlocks = preview.querySelectorAll('code.language-mindmap');
        mindmapBlocks.forEach((block, index) => {
            const wrapper = document.createElement('div');
            wrapper.className = 'mindmap-container';

            const container = document.createElement('div');
            container.id = `mindmap-${index}`;
            container.style.width = '100%';
            container.style.height = '100%';
            wrapper.appendChild(container);

            block.parentElement.replaceWith(wrapper);

            const mm = new MindMap(container.id);
            mm.render(block.textContent);
        });

        if (window.MathJax) {
            MathJax.Hub.Queue(["Typeset", MathJax.Hub, preview]);
        }
    }

    // Help Modal Logic
    btnHelp.addEventListener('click', () => {
        modal.style.display = "block";
        fetch('GUIDE.md')
            .then(response => response.text())
            .then(text => {
                helpContent.innerHTML = marked.parse(text);
                setTimeout(() => {
                    const mindmapBlocks = helpContent.querySelectorAll('code.language-mindmap');
                    mindmapBlocks.forEach((block, index) => {
                        const wrapper = document.createElement('div');
                        wrapper.className = 'mindmap-container';
                        const container = document.createElement('div');
                        container.id = `mindmap-guide-${index}`;
                        container.style.width = '100%';
                        container.style.height = '100%';
                        wrapper.appendChild(container);
                        block.parentElement.replaceWith(wrapper);
                        const mm = new MindMap(container.id);
                        mm.render(block.textContent);
                    });
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

    btnFixMath.addEventListener('click', () => {
        if (window.MathJax) {
            MathJax.Hub.Queue(["Typeset", MathJax.Hub, preview]);
        }
        renderContent();
    });

    // Initial render with the 5 requested maps - ARABIC MATHJAX MACROS ADDED
    editor.value = `# الخرائط الذهنية المطلوبة

استخدم الكود التالي \`\`\`mindmap ... \`\`\` لإنشاء الخرائط.

## 1. قوانين الأسس
\`\`\`mindmap
قوانين الأسس
: $\\ar{a, b \\in \\mathbb{R}, m, n \\in \\mathbb{Z}}$
  الضرب
  : عند ضرب الأساسات المتشابهة، نجمع الأسس
  : $\\ar{a^m \\times a^n = a^{m+n}}$
  القسمة
  : عند قسمة الأساسات المتشابهة، نطرح الأسس
  : $\\ar{\\frac{a^m}{a^n} = a^{m-n}}$
  قوة القوة
  : عند رفع قوة لقوة أخرى، نضرب الأسس
  : $\\ar{(a^m)^n = a^{m \\cdot n}}$
  الأس الصفري
  : أي عدد غير الصفر مرفوع للأس صفر يساوي 1
  : $\\ar{a^0 = 1}$
  الأس السالب
  : $\\ar{a^{-n} = \\frac{1}{a^n}}$
\`\`\`

## 2. العمليات على الأعداد النسبية
\`\`\`mindmap
العمليات على الأعداد النسبية
  الجمع والطرح
  : يجب توحيد المقامات أولاً
    الخواص
    : الانغلاق: $\\ar{a+b \\in \\mathbb{Q}}$
    : الإبدال: $\\ar{a+b = b+a}$
    : الدمج: $\\ar{(a+b)+c = a+(b+c)}$
    : المعكوس: $\\ar{a+(-a) = 0}$
    : المحايد: $\\ar{a+0 = a}$
  الضرب
  : البسط في البسط والمقام في المقام
  : $\\ar{\\frac{a}{b} \\times \\frac{c}{d} = \\frac{ac}{bd}}$
  القسمة
  : الضرب في المقلوب
  : $\\ar{\\frac{a}{b} \\div \\frac{c}{d} = \\frac{a}{b} \\times \\frac{d}{c}}$
\`\`\`

## 3. مقارنة الأعداد
\`\`\`mindmap
مقارنة الأعداد
  أنواع الأعداد
  : | رمز | المجموعة |
  : |---|---|
  : | $\\ar{\\mathbb{N}}$ | الطبيعية |
  : | $\\ar{\\mathbb{Z}}$ | الصحيحة |
  : | $\\ar{\\mathbb{Q}}$ | النسبية |
  : | $\\ar{\\mathbb{R}}$ | الحقيقية |
  الرموز المستخدمة
  : $\\ar{>}$ أكبر من
  : $\\ar{<}$ أصغر من
  : $\\ar{=}$ يساوي
  : $\\ar{\\leq}$ أصغر من أو يساوي
  : $\\ar{\\geq}$ أكبر من أو يساوي
\`\`\`

## 4. قانون أوم (الفيزياء)
\`\`\`mindmap
قانون أوم
: $\\ar{V = I \\times R}$
  المتغيرات
    الجهد (V)
    : فرق الجهد الكهربائي
    : يقاس بالفولت (Volt)
    التيار (I)
    : شدة التيار المار
    : يقاس بالأمبير (Ampere)
    المقاومة (R)
    : ممانعة الموصل
    : تقاس بالأوم (Ohm)
  التطبيقات
    حساب التيار
    : $\\ar{I = \\frac{V}{R}}$
    حساب المقاومة
    : $\\ar{R = \\frac{V}{I}}$
\`\`\`

## 5. تصنيف الكائنات الحية
\`\`\`mindmap
الكائنات الحية
  بدائيات النوى
    البكتيريا
      كروية
      عصوية
      لولبية
    العتائق
  حقيقيات النوى
    الطلائعيات
      الأوليات
      الطحالب
    الفطريات
      عفن الخبز
      الخميرة
    النباتات
      اللاوعائية
      الوعائية
    اللحميات
      اللافقاريات
      الفقاريات
\`\`\`
`;
    renderContent();
});
