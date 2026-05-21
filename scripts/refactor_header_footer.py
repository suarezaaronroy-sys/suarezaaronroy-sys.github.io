import json
import re
from pathlib import Path

root = Path('.')
html_files = sorted([
    p for p in root.rglob('*.html')
    if '_includes' not in p.parts and '_layouts' not in p.parts and p.parent != Path('scripts')
])

IGNORE = {'fix-my-systems.html'}

HEAD_REMOVE_PATTERNS = [
    r'<title>.*?</title>\s*',
    r'<meta\s+charset="?[^"]+"?\s*/?>\s*',
    r'<meta\s+name="viewport"[^>]*>\s*',
    r'<meta\s+name="author"[^>]*>\s*',
    r'<meta\s+name="description"[^>]*>\s*',
    r'<meta\s+name="keywords"[^>]*>\s*',
    r'<link\s+rel="apple-touch-icon"[^>]*>\s*',
    r'<link\s+rel="icon"[^>]*>\s*',
    r'<link\s+rel="canonical"[^>]*>\s*',
    r'<link\s+rel="preconnect"[^>]*>\s*',
    r'<link\s+href="https://fonts\.googleapis\.com[^"]*"[^>]*>\s*',
    r'<script\s+async\s+src="https://www\.googletagmanager\.com/gtag/js\?id=[^"]*">\s*</script>\s*',
    r'<script>\s*window\.dataLayer=.*?gtag\([^<]*?</script>\s*',
    r'<script>\s*window\.dataLayer=.*?</script>\s*',
    r'<meta\s+name="robots"\s+content="index, follow"\s*/?>\s*',
]


def yaml_str(value: str) -> str:
    return json.dumps(value, ensure_ascii=False)


def extract_meta(head_text: str, name: str) -> str | None:
    pattern = re.compile(rf'<meta\s+name="{re.escape(name)}"\s+content="([^"]*)"\s*/?>', re.I)
    match = pattern.search(head_text)
    return match.group(1).strip() if match else None


def extract_title(head_text: str) -> str | None:
    match = re.search(r'<title>(.*?)</title>', head_text, re.S | re.I)
    return match.group(1).strip() if match else None


def extract_canonical(head_text: str) -> str | None:
    match = re.search(r'<link\s+rel="canonical"\s+href="([^"]*)"\s*/?>', head_text, re.I)
    return match.group(1).strip() if match else None


def extract_robots(head_text: str) -> str | None:
    match = re.search(r'<meta\s+name="robots"\s+content="([^"]*)"\s*/?>', head_text, re.I)
    return match.group(1).strip() if match else None


def clean_head_extra(head_text: str) -> str:
    cleaned = head_text
    for pattern in HEAD_REMOVE_PATTERNS:
        cleaned = re.sub(pattern, '', cleaned, flags=re.S | re.I)
    return cleaned.strip()


candidates = []
for path in html_files:
    if path.name in IGNORE:
        continue
    text = path.read_text(encoding='utf-8')
    if not re.search(r'<head>(.*?)</head>', text, re.S):
        continue
    if not re.search(r'<body[^>]*>(.*?)</body>', text, re.S):
        continue
    if not re.search(r'<footer class="footer shell">', text):
        continue
    if not re.search(r'<main[^>]*>', text) and not re.search(r'<div class="topbar-wrap">', text):
        continue
    candidates.append(path)

print('CONVERTING', len(candidates), 'pages')
for path in candidates:
    text = path.read_text(encoding='utf-8')
    head = re.search(r'<head>(.*?)</head>', text, re.S).group(1)
    body = re.search(r'<body[^>]*>(.*?)</body>', text, re.S).group(1)
    title = extract_title(head)
    description = extract_meta(head, 'description')
    keywords = extract_meta(head, 'keywords')
    canonical = extract_canonical(head)
    robots = extract_robots(head)
    head_extra = clean_head_extra(head)

    footer_match = re.search(r'<footer class="footer shell">', body)
    footer_start = footer_match.start()
    main_match = re.search(r'(<main[^>]*>)', body)
    if main_match:
        page_body = body[main_match.start():footer_start].rstrip() + '\n'
    else:
        topbar_match = re.search(r'<div class="topbar-wrap">.*?</div>\s*', body, re.S)
        content_start = topbar_match.end() if topbar_match else 0
        page_body_content = body[content_start:footer_start].strip()
        page_body = '<main id="main-content">\n' + page_body_content + '\n</main>\n'

    front_matter = ['---', 'layout: default']
    if title:
        front_matter.append(f'title: {yaml_str(title)}')
    if description:
        front_matter.append(f'description: {yaml_str(description)}')
    if keywords:
        front_matter.append(f'keywords: {yaml_str(keywords)}')
    if canonical:
        front_matter.append(f'canonical: {yaml_str(canonical)}')
    if robots and robots.lower() != 'index, follow':
        front_matter.append(f'robots: {yaml_str(robots)}')
    if head_extra:
        fm_lines = ['head_extra: |']
        for line in head_extra.splitlines():
            fm_lines.append('  ' + line.rstrip())
        front_matter.extend(fm_lines)
    front_matter.append('---')

    new_text = '\n'.join(front_matter) + '\n' + page_body
    path.write_text(new_text, encoding='utf-8')
    print('Updated:', path)
