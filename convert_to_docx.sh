#!/usr/bin/env bash
# =============================================================================
# convert_to_docx.sh — конвертация diploma.md → diploma.docx через Pandoc
#
# Требования методических указаний КФУ (КАДиТП, ПИ 2025):
#   • Формат A4, поля: лево 30 мм, право 15 мм, верх 20 мм, низ 20 мм
#   • Шрифт: Times New Roman 14 пт, цвет черный
#   • Межстрочный интервал: 1.5 (полуторный, ONE_POINT_FIVE)
#   • Основной текст: выравнивание по ширине, абзацный отступ 1.25 см
#   • Заголовки: по центру, без жирного/курсива, интервал после 12 пт
#   • Нумерация страниц: внизу по центру, 12 пт TNR (с содержания)
#   • Таблицы: подпись сверху («Таблица N. Название»)
#   • Рисунки: подпись снизу по центру («Рисунок N. Название»), без точки
#   • Цитирование: кавычки «»; ссылки в квадратных скобках [N]
#   • Список литературы: алфавитный порядок (русские → иностранные → интернет)
#   • Буква е используется вместо е
#
# Использование:
#   chmod +x convert_to_docx.sh
#   ./convert_to_docx.sh
#
# Зависимости:
#   pandoc >= 3.0   (https://pandoc.org/installing.html)
#   python3 + python-docx + lxml  (pip install python-docx lxml)
# =============================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
INPUT="$SCRIPT_DIR/diploma.md"
OUTPUT="$SCRIPT_DIR/diploma.docx"
REFERENCE="$SCRIPT_DIR/reference.docx"
LUA_FILTER="$(mktemp /tmp/diploma-filter-XXXXXX.lua)"

# Удалить временный lua-фильтр при выходе
trap 'rm -f "$LUA_FILTER"' EXIT

# ── 1. Проверка наличия pandoc ────────────────────────────────────────────────
if ! command -v pandoc &>/dev/null; then
    echo "❌  pandoc не найден. Установите: https://pandoc.org/installing.html"
    exit 1
fi

PANDOC_VERSION=$(pandoc --version | head -1 | grep -oP '\d+\.\d+')
echo "✔  pandoc $PANDOC_VERSION"

# ── 2. Генерация эталонного шаблона reference.docx ───────────────────────────
echo "⏳  Создание reference.docx..."

pandoc --print-default-data-file reference.docx > "$REFERENCE" 2>/dev/null || \
    pandoc -o "$REFERENCE" /dev/null

python3 - "$SCRIPT_DIR" << 'PYEOF'
import sys, os

SCRIPT_DIR = sys.argv[1]
REFERENCE  = os.path.join(SCRIPT_DIR, 'reference.docx')

try:
    from docx import Document
    from docx.shared import Pt, Cm, RGBColor
    from docx.enum.text import WD_ALIGN_PARAGRAPH, WD_LINE_SPACING
    from docx.enum.style import WD_STYLE_TYPE
    from docx.oxml.ns import qn
    from docx.oxml import OxmlElement
except ImportError:
    print("⚠️  python-docx не установлен. Запустите: pip install python-docx lxml")
    print("   reference.docx будет использован как есть (базовый шаблон pandoc).")
    sys.exit(0)

doc = Document(REFERENCE)

# ── Параметры страницы ────────────────────────────────────────────────────────
section = doc.sections[0]
section.page_width    = int(21.0 * 914400 / 25.4)   # A4 210 мм
section.page_height   = int(29.7 * 914400 / 25.4)   # A4 297 мм
section.left_margin   = Cm(3.0)   # 30 мм
section.right_margin  = Cm(1.5)   # 15 мм
section.top_margin    = Cm(2.0)   # 20 мм
section.bottom_margin = Cm(2.0)   # 20 мм


def set_tnr_xml(element):
    """Явно прописать Times New Roman во все диапазоны символов через XML."""
    try:
        rPr = element.get_or_add_rPr()
        rFonts = rPr.get_or_add_rFonts()
        for attr in ('w:ascii', 'w:hAnsi', 'w:cs', 'w:eastAsia'):
            rFonts.set(qn(attr), 'Times New Roman')
    except Exception:
        pass


def configure_style(style, align=WD_ALIGN_PARAGRAPH.JUSTIFY,
                    first_line_cm=1.25, space_after_pt=0,
                    space_before_pt=0, font_size=14,
                    bold=False, italic=False):
    """Настроить стиль: полуторный интервал ONE_POINT_FIVE, TNR 14pt, отступы."""
    pf = style.paragraph_format
    pf.alignment          = align
    pf.first_line_indent  = Cm(first_line_cm) if first_line_cm else None
    pf.space_after        = Pt(space_after_pt)
    pf.space_before       = Pt(space_before_pt)
    # Полуторный интервал — стандарт методических указаний КФУ
    pf.line_spacing_rule  = WD_LINE_SPACING.ONE_POINT_FIVE

    rf = style.font
    rf.name      = 'Times New Roman'
    rf.size      = Pt(font_size)
    rf.bold      = bold
    rf.italic    = italic
    rf.color.rgb = RGBColor(0, 0, 0)

    set_tnr_xml(style.element)


# ── Normal (основной текст) ───────────────────────────────────────────────────
styles = doc.styles
configure_style(styles['Normal'], align=WD_ALIGN_PARAGRAPH.JUSTIFY,
                first_line_cm=1.25, font_size=14)

# ── Заголовки Heading 1–4 ─────────────────────────────────────────────────────
for name, cfg in {
    'Heading 1': dict(space_after_pt=12, space_before_pt=0),
    'Heading 2': dict(space_after_pt=12, space_before_pt=12),
    'Heading 3': dict(space_after_pt=12, space_before_pt=12),
    'Heading 4': dict(space_after_pt=12, space_before_pt=12),
}.items():
    try:
        st = styles[name]
    except KeyError:
        st = styles.add_style(name, WD_STYLE_TYPE.PARAGRAPH)
    configure_style(st, align=WD_ALIGN_PARAGRAPH.CENTER,
                    first_line_cm=0, font_size=14, bold=False, **cfg)

# ── Caption (подписи рисунков/таблиц) ────────────────────────────────────────
try:
    cap = styles['Caption']
except KeyError:
    cap = styles.add_style('Caption', WD_STYLE_TYPE.PARAGRAPH)
configure_style(cap, align=WD_ALIGN_PARAGRAPH.CENTER,
                first_line_cm=0, space_after_pt=6, font_size=14)

# ── Verbatim / Code (листинги кода: Courier New 12 пт) ───────────────────────
for name in ('Verbatim Char', 'Source Code', 'Code'):
    try:
        cs = styles[name]
        cs.font.name = 'Courier New'
        cs.font.size = Pt(12)
    except KeyError:
        pass

try:
    vs = styles['Verbatim']
except KeyError:
    vs = styles.add_style('Verbatim', WD_STYLE_TYPE.PARAGRAPH)
pf_v = vs.paragraph_format
pf_v.alignment           = WD_ALIGN_PARAGRAPH.LEFT
pf_v.first_line_indent   = None
pf_v.space_after         = Pt(0)
pf_v.space_before        = Pt(0)
pf_v.line_spacing_rule   = WD_LINE_SPACING.ONE_POINT_FIVE
vs.font.name   = 'Courier New'
vs.font.size   = Pt(12)
vs.font.bold   = False
vs.font.italic = False

# ── Нижний колонтитул: номер страницы по центру, 12 пт TNR ───────────────────
def add_page_number_footer(section, doc):
    """Создать footer с полем PAGE по центру (12 пт, Times New Roman)."""
    try:
        footer_part = doc.part.add_footer_part()
        footer = footer_part.footer

        # Очистить дефолтные параграфы footer
        for p in list(footer.paragraphs):
            p._element.getparent().remove(p._element)

        # Параграф с полем PAGE
        new_p = OxmlElement('w:p')

        pPr = OxmlElement('w:pPr')
        jc = OxmlElement('w:jc')
        jc.set(qn('w:val'), 'center')
        pPr.append(jc)
        sp = OxmlElement('w:spacing')
        sp.set(qn('w:line'), '240')
        sp.set(qn('w:lineRule'), 'auto')
        pPr.append(sp)
        new_p.append(pPr)

        def make_rPr_12pt():
            rPr = OxmlElement('w:rPr')
            sz = OxmlElement('w:sz')
            sz.set(qn('w:val'), '24')   # 24 half-points = 12 pt
            szCs = OxmlElement('w:szCs')
            szCs.set(qn('w:val'), '24')
            rf = OxmlElement('w:rFonts')
            for a in ('w:ascii', 'w:hAnsi', 'w:cs'):
                rf.set(qn(a), 'Times New Roman')
            rPr.extend([rf, sz, szCs])
            return rPr

        r1 = OxmlElement('w:r')
        r1.append(make_rPr_12pt())
        fc_begin = OxmlElement('w:fldChar')
        fc_begin.set(qn('w:fldCharType'), 'begin')
        r1.append(fc_begin)
        new_p.append(r1)

        r2 = OxmlElement('w:r')
        r2.append(make_rPr_12pt())
        instr = OxmlElement('w:instrText')
        instr.set(qn('xml:space'), 'preserve')
        instr.text = ' PAGE '
        r2.append(instr)
        new_p.append(r2)

        r3 = OxmlElement('w:r')
        r3.append(make_rPr_12pt())
        fc_end = OxmlElement('w:fldChar')
        fc_end.set(qn('w:fldCharType'), 'end')
        r3.append(fc_end)
        new_p.append(r3)

        footer._element.append(new_p)

        # Привязать footer к разделу
        rId = doc.part.relate_to(
            footer_part,
            'http://schemas.openxmlformats.org/officeDocument/2006/relationships/footer'
        )
        sectPr = section._sectPr
        footerRef = OxmlElement('w:footerReference')
        footerRef.set(qn('w:type'), 'default')
        footerRef.set(qn('r:id'), rId)
        sectPr.append(footerRef)
        print('✔  Footer с нумерацией страниц настроен (12 пт, TNR, центр)')
    except Exception as e:
        print(f'⚠️  Footer не настроен автоматически: {e}')
        print('   Добавьте нумерацию вручную в Word: Вставка → Нижний колонтитул.')

add_page_number_footer(section, doc)

# ── Сохраняем ─────────────────────────────────────────────────────────────────
doc.save(REFERENCE)
print('✔  reference.docx настроен')
PYEOF

# ── 3. Lua-фильтр (временный файл, совместимый со всеми оболочками) ──────────
cat > "$LUA_FILTER" << 'LUAEOF'
-- Lua-фильтр для pandoc:
-- Блоки кода → стиль Verbatim (Courier New 12 пт, выравнивание по левому краю)
function CodeBlock(el)
    el.classes = {'Verbatim'}
    return el
end
LUAEOF

# ── 4. Основная конвертация ───────────────────────────────────────────────────
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
    --lua-filter="$LUA_FILTER" \
    2>&1 | grep -v "^$" || true

if [[ -f "$OUTPUT" ]]; then
    SIZE=$(du -h "$OUTPUT" | cut -f1)
    echo "✅  Готово: diploma.docx ($SIZE)"
    echo ""
    echo "📋  Что нужно сделать вручную в Word после открытия файла:"
    echo "   1. Раздел «СОДЕРЖАНИЕ» (ручной список) заменить автооглавлением:"
    echo "      Ссылки → Оглавление → Автособираемое оглавление 1"
    echo "   2. Обновить поле оглавления: ПКМ → «Обновить поле» → «Обновить всё»"
    echo "   3. Нумерация страниц: начинается с «Содержания» (не с титула)."
    echo "      Для этого: разрывы разделов перед «Содержанием» и после титула,"
    echo "      отключить «Как в предыдущем разделе» в footer titula."
    echo "   4. Блоки mermaid-кода заменить скриншотами — маркер 📷 в каждом блоке"
    echo "   5. Проверить переносы строк в таблицах"
    echo "   6. Формулы (3.1)–(3.3) выровнять по центру, нумерацию — по правому краю"
else
    echo "❌  Ошибка: файл diploma.docx не создан. Проверьте вывод pandoc выше."
    exit 1
fi
