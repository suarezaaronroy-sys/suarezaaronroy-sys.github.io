from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]

def parse_css(text):
    text = text.strip()
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


def load_global_rules():
    css = (ROOT / 'assets' / 'css' / 'global.css').read_text(encoding='utf-8')
    css = re.sub(r'/\*.*?\*/', '', css, flags=re.S)
    return {normalize_selector(sel): normalize(body) for sel, body in parse_css(css)}


def get_style_block(path):
    txt = path.read_text(encoding='utf-8')
    m = re.search(r'<style>(.*?)</style>', txt, re.S)
    return m.group(1).strip() if m else ''


import sys

def get_files():
    files = list(ROOT.glob('*.html')) + list(ROOT.glob('articles/*.html'))
    return [p for p in files if 'grimoires' not in str(p)]


def print_page_analysis():
    global_rules = load_global_rules()
    for p in sorted(get_files()):
        block = get_style_block(p)
        if not block:
            print(p.name, 'no style block')
            continue
        rules = parse_css(block)
        identical = []
        unique = []
        for sel, body in rules:
            body_norm = normalize(body)
            gl = global_rules.get(sel)
            if gl and gl == body_norm:
                identical.append(sel)
            else:
                unique.append(sel)
        print(p.name, 'rules', len(rules), 'identical', len(identical), 'unique', len(unique))
        if len(unique) < len(rules):
            print('  unique selectors sample', unique[:10])


def print_frequency():
    freq = {}
    for p in get_files():
        block = get_style_block(p)
        if not block:
            continue
        rules = parse_css(block)
        for sel, _ in rules:
            freq[sel] = freq.get(sel, 0) + 1
    for sel, count in sorted(freq.items(), key=lambda x: (-x[1], x[0]))[:100]:
        print(count, sel)


def print_common_rules(threshold=18):
    selector_map = {}
    for p in get_files():
        block = get_style_block(p)
        if not block:
            continue
        for sel, body in parse_css(block):
            body_norm = normalize(body)
            selector_map.setdefault(sel, {}).setdefault(body_norm, []).append(p.name)
    for sel, bodies in sorted(selector_map.items(), key=lambda x:(-sum(len(v) for v in x[1].values()), x[0])):
        total = sum(len(v) for v in bodies.values())
        if total < threshold:
            continue
        if len(bodies) == 1:
            body = list(bodies.keys())[0]
            print(total, sel)
        else:
            print(total, sel, 'VARIES', len(bodies))


def main():
    if '--freq' in sys.argv:
        print_frequency()
    elif '--common' in sys.argv:
        thresh = 18
        for arg in sys.argv:
            if arg.startswith('--threshold='):
                try:
                    thresh = int(arg.split('=',1)[1])
                except ValueError:
                    pass
        print_common_rules(thresh)
    else:
        print_page_analysis()

if __name__ == '__main__':
    main()
