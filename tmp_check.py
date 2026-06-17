import re
from pathlib import Path
root = Path(r"c:\Users\Baokeng Khoali\easygo-platform-web\easygo-webapp")
html_files = list(root.glob('**/*.html'))
missing = []
for path in html_files:
    text = path.read_text(encoding='utf-8', errors='ignore')
    refs = re.findall(r'(?:href|src)=["\']([^"\']+)["\']', text)
    for ref in refs:
        if ref.startswith(('http://','https://','//','data:','#','mailto:','tel:')):
            continue
        ref_path = (path.parent / ref).resolve()
        if not ref_path.exists():
            if ref.startswith('/'):
                ref_path = (root / ref.lstrip('/')).resolve()
            if not ref_path.exists():
                missing.append((str(path.relative_to(root)), ref))
print('html_count', len(html_files))
print('missing_count', len(missing))
for p,r in missing[:100]:
    print(f'{p} -> {r}')
