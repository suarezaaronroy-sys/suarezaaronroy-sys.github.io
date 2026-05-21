from pathlib import Path
import re
import argparse

ROOT = Path(__file__).resolve().parents[1]
PAGE_GLOBS = ['*.html', 'articles/*.html']
EXCLUDE = {'fix-my-systems.html'}


def parse_css(text):
    rules = []
    i = 0
    n = len(text)
    while i < n:
        while i < n and text[i].isspace():
            i += 1
        if i >= n:
            break
        start = i
        while i < n and text[i] != '{':
            i += 1
        if i >= n:
            break
        selector = normalize_selector(text[start:i].strip())
        i += 1
        depth = 1
        body_start = i
        while i < n and depth > 0:
            if text[i] == '{':
                depth += 1
            elif text[i] == '}':
                depth -= 1
            i += 1
        body = text[body_start:i-1].strip()
        rules.append((selector, normalize(body)))
    return rules


def normalize(text):
    text = re.sub(r"/\*.*?\*/", "", text, flags=re.S)
    text = re.sub(r"\s+", " ", text).strip()
    text = re.sub(r"\s*([:;,{}])\s*", r"\1", text)
    text = re.sub(r";\}", "}", text)
    return text


def normalize_selector(selector):
    selector = re.sub(r"\s+", " ", selector).strip()
    selector = re.sub(r"\s*,\s*", ",", selector)
    selector = re.sub(r"\s*>\s*", ">", selector)
    selector = re.sub(r"\s*\+\s*", "+", selector)
    selector = re.sub(r"\s*~\s*", "~", selector)
    return selector


def find_style_block(text):
    m = re.search(r"<style>(.*?)</style>", text, re.S)
    return m


def load_global_rules():
    css = (ROOT / 'assets' / 'css' / 'global.css').read_text(encoding='utf-8')
    css = re.sub(r'/\*.*?\*/', '', css, flags=re.S)
    return {normalize_selector(sel): body for sel, body in parse_css(css)}


def get_pages():
    pages = []
    for glob in PAGE_GLOBS:
        pages.extend(ROOT.glob(glob))
    return sorted([p for p in pages if p.name not in EXCLUDE])


def remove_duplicate_rules(text, global_rules):
    m = find_style_block(text)
    if not m:
        return text, 0
    style_content = m.group(1)
    rules = parse_css(style_content)
    keep = []
    removed = 0
    for selector, body in rules:
        global_body = global_rules.get(selector)
        if global_body and body == global_body:
            removed += 1
            continue
        keep.append((selector, body))
    if removed == 0:
        return text, 0
    if not keep:
        new_text = text[:m.start()] + text[m.end():]
    else:
        formatted = '\n'.join(f'{sel} {{{body}}}' for sel, body in keep)
        new_text = text[:m.start()] + '<style>\n' + formatted + '\n</style>' + text[m.end():]
    return new_text, removed


def main():
    parser = argparse.ArgumentParser(description='Remove duplicate inline CSS selectors already defined in assets/css/global.css')
    parser.add_argument('--apply', action='store_true', help='Rewrite pages in place')
    parser.add_argument('--report', action='store_true', help='Show a summary only')
    args = parser.parse_args()

    global_rules = load_global_rules()
    pages = get_pages()
    total_removed = 0
    report = []

    for page in pages:
        text = page.read_text(encoding='utf-8')
        new_text, removed = remove_duplicate_rules(text, global_rules)
        if removed:
            report.append((page, removed))
            total_removed += removed
            if args.apply:
                page.write_text(new_text, encoding='utf-8')

    for page, removed in report:
        print(f'{page.name}: removed {removed} duplicate selectors')
    print(f'Pages changed: {len(report)}, total selectors removed: {total_removed}')

if __name__ == '__main__':
    main()
