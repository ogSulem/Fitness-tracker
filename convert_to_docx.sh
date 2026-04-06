#!/usr/bin/env bash
# =============================================================================
# convert_to_docx.sh — конвертация diploma.md → diploma.docx через Pandoc
#
# Требования методических указаний КФУ (КАДиТП, ПИ 2025):
#   • Формат A4, поля: лево 30 мм, право 15 мм, верх 20 мм, низ 20 мм
#   • Шрифт: Times New Roman 14 пт, цвет чёрный
#   • Межстрочный интервал: 1.5
#   • Основной текст: выравнивание по ширине, абзацный отступ 1.25 см
#   • Заголовки: по центру, без жирного/курсива, отступ после 12 пт
#   • Нумерация страниц: внизу по центру, 12 пт TNR (с содержания)
#   • Таблицы: подпись сверху, выравнивание по правому краю
#   • Цитирование: кавычки «»
#   • Буква ё не используется
#
# Использование:
#   chmod +x convert_to_docx.sh
#   ./convert_to_docx.sh
#
# Зависимости:
#   pandoc >= 3.0   (https://pandoc.org/installing.html)
# =============================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
INPUT="$SCRIPT_DIR/diploma.md"
OUTPUT="$SCRIPT_DIR/diploma.docx"
REFERENCE="$SCRIPT_DIR/reference.docx"

# ── 1. Проверка наличия pandoc ────────────────────────────────────────────────
if ! command -v pandoc &>/dev/null; then
    echo "❌  pandoc не найден. Установите: https://pandoc.org/installing.html"
    exit 1
fi

PANDOC_VERSION=$(pandoc --version | head -1 | grep -oP '\d+\.\d+')
echo "✔  pandoc $PANDOC_VERSION"

# ── 2. Генерация эталонного шаблона reference.docx ───────────────────────────
# Создаём базовый шаблон, затем патчим стили через Python-скрипт
echo "⏳  Создание reference.docx..."

pandoc --print-default-data-file reference.docx > "$REFERENCE" 2>/dev/null || \
    pandoc -o "$REFERENCE" /dev/null

python3 << 'PYEOF'
import sys, os

try:
    from docx import Document
    from docx.shared import Pt, Cm, RGBColor
    from docx.enum.text import WD_ALIGN_PARAGRAPH
    from docx.enum.style import WD_STYLE_TYPE
    from docx.oxml.ns import qn
    from docx.oxml import OxmlElement
    import copy
    from lxml import etree
except ImportError:
    print("⚠️  python-docx не установлен. Запустите: pip install python-docx")
    print("   reference.docx будет использован как есть (базовый шаблон pandoc).")
    sys.exit(0)

REFERENCE = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'reference.docx')

doc = Document(REFERENCE)

# ── Параметры страницы ────────────────────────────────────────────────────────
section = doc.sections[0]
section.page_width  = int(21.0 * 914400 / 25.4)   # A4 210 мм
section.page_height = int(29.7 * 914400 / 25.4)   # A4 297 мм
section.left_margin   = Cm(3.0)   # 30 мм
section.right_margin  = Cm(1.5)   # 15 мм
section.top_margin    = Cm(2.0)   # 20 мм
section.bottom_margin = Cm(2.0)   # 20 мм

def set_run_font(run, size_pt=14, bold=False, italic=False, color=None):
    run.bold   = bold
    run.italic = italic
    run.font.name = 'Times New Roman'
    run.font.size = Pt(size_pt)
    if color:
        run.font.color.rgb = RGBColor(*color)
    else:
        run.font.color.rgb = RGBColor(0, 0, 0)
    # Задаём шрифт отдельно для кириллицы (rFonts)
    rFonts = run._r.get_or_add_rPr().get_or_add_rFonts()
    rFonts.set(qn('w:ascii'),    'Times New Roman')
    rFonts.set(qn('w:hAnsi'),    'Times New Roman')
    rFonts.set(qn('w:cs'),       'Times New Roman')
    rFonts.set(qn('w:eastAsia'), 'Times New Roman')

def apply_paragraph_format(para, align=WD_ALIGN_PARAGRAPH.JUSTIFY,
                            first_line_cm=1.25, space_after_pt=0,
                            space_before_pt=0, line_spacing=1.5):
    fmt = para.paragraph_format
    fmt.alignment       = align
    fmt.first_line_indent = Cm(first_line_cm) if first_line_cm else None
    fmt.space_after     = Pt(space_after_pt)
    fmt.space_before    = Pt(space_before_pt)
    fmt.line_spacing    = Pt(line_spacing * 12)  # 1.5 × 12pt

def configure_style(style, align=WD_ALIGN_PARAGRAPH.JUSTIFY,
                    first_line_cm=1.25, space_after_pt=0,
                    space_before_pt=0, font_size=14,
                    bold=False, italic=False, line_spacing=1.5):
    pf = style.paragraph_format
    pf.alignment         = align
    pf.first_line_indent = Cm(first_line_cm) if first_line_cm else None
    pf.space_after       = Pt(space_after_pt)
    pf.space_before      = Pt(space_before_pt)
    pf.line_spacing      = Pt(line_spacing * 12)
    rf = style.font
    rf.name    = 'Times New Roman'
    rf.size    = Pt(font_size)
    rf.bold    = bold
    rf.italic  = italic
    rf.color.rgb = RGBColor(0, 0, 0)

# ── Стиль Normal (основной текст) ────────────────────────────────────────────
styles = doc.styles
normal = styles['Normal']
configure_style(normal, align=WD_ALIGN_PARAGRAPH.JUSTIFY,
                first_line_cm=1.25, space_after_pt=0,
                space_before_pt=0, font_size=14)

# ── Заголовки Heading 1–4 ────────────────────────────────────────────────────
heading_cfg = {
    'Heading 1': dict(align=WD_ALIGN_PARAGRAPH.CENTER, first_line_cm=0,
                      space_after_pt=12, space_before_pt=0,
                      font_size=14, bold=False),
    'Heading 2': dict(align=WD_ALIGN_PARAGRAPH.CENTER, first_line_cm=0,
                      space_after_pt=12, space_before_pt=12,
                      font_size=14, bold=False),
    'Heading 3': dict(align=WD_ALIGN_PARAGRAPH.CENTER, first_line_cm=0,
                      space_after_pt=12, space_before_pt=12,
                      font_size=14, bold=False),
    'Heading 4': dict(align=WD_ALIGN_PARAGRAPH.CENTER, first_line_cm=0,
                      space_after_pt=12, space_before_pt=12,
                      font_size=14, bold=False),
}

for name, cfg in heading_cfg.items():
    try:
        st = styles[name]
    except KeyError:
        st = styles.add_style(name, WD_STYLE_TYPE.PARAGRAPH)
    configure_style(st, **cfg)

# ── Caption (подписи рисунков/таблиц) ────────────────────────────────────────
try:
    cap = styles['Caption']
except KeyError:
    cap = styles.add_style('Caption', WD_STYLE_TYPE.PARAGRAPH)
configure_style(cap, align=WD_ALIGN_PARAGRAPH.CENTER,
                first_line_cm=0, space_after_pt=6, font_size=14)

# ── Code / Verbatim (листинги кода) ─────────────────────────────────────────
for code_style_name in ('Verbatim Char', 'Source Code', 'Code'):
    try:
        cs = styles[code_style_name]
        cs.font.name = 'Courier New'
        cs.font.size = Pt(12)
    except KeyError:
        pass

try:
    vs = styles['Verbatim']
except KeyError:
    vs = styles.add_style('Verbatim', WD_STYLE_TYPE.PARAGRAPH)
configure_style(vs, align=WD_ALIGN_PARAGRAPH.LEFT,
                first_line_cm=0, font_size=12)
vs.font.name = 'Courier New'

# ── Сохраняем ────────────────────────────────────────────────────────────────
doc.save(REFERENCE)
print('✔  reference.docx настроен')
PYEOF

# ── 3. Основная конвертация ───────────────────────────────────────────────────
echo "⏳  Конвертация diploma.md → diploma.docx..."

pandoc "$INPUT" \
    --output="$OUTPUT" \
    --reference-doc="$REFERENCE" \
    --from=markdown+smart+pipe_tables+multiline_tables+grid_tables \
    --to=docx \
    --standalone \
    --wrap=none \
    --metadata title="Разработка веб-приложения для отслеживания физической активности и питания «FitTrack»" \
    --metadata lang=ru-RU \
    --lua-filter=<(cat << 'LUAEOF'
-- Lua-фильтр: код-блоки оборачиваем в стиль Verbatim,
-- mermaid-блоки отмечаем как рисунки (placeholder)
function CodeBlock(el)
    el.classes = {'Verbatim'}
    return el
end

-- Убираем лишние пустые параграфы между заголовком и текстом
function Para(el)
    return el
end
LUAEOF
) \
    2>&1 | grep -v "^$" || true

if [[ -f "$OUTPUT" ]]; then
    SIZE=$(du -h "$OUTPUT" | cut -f1)
    echo "✅  Готово: diploma.docx ($SIZE)"
    echo ""
    echo "📋  Что нужно сделать вручную в Word после открытия файла:"
    echo "   1. Удалить раздел «СОДЕРЖАНИЕ» с маркированным списком (он ручной, без стр.)"
    echo "      → вставить авто-оглавление: Ссылки → Оглавление → Автособираемое оглавление 1"
    echo "   2. Обновить поле оглавления (ПКМ → «Обновить поле» → «Обновить всё»)"
    echo "   3. Нумерацию страниц проверить — должна начинаться с «Содержания», не с титула"
    echo "   4. Блоки mermaid-кода заменить скриншотами — маркер 📷 внутри каждого блока"
    echo "   5. Проверить переносы строк в таблицах"
    echo "   6. Формулы (3.1)–(3.4) проверить — при необходимости выровнять по центру вручную"
else
    echo "❌  Ошибка: файл diploma.docx не создан. Проверьте вывод pandoc выше."
    exit 1
fi
