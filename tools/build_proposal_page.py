#!/usr/bin/env python3
"""Build docs/proposal-page/index.html from template.html + docs/questionnaire.md + mockup/data/games.json.
Usage: python3 tools/build_proposal_page.py [MOCKUP_URL]"""
import json, re, sys, pathlib
R = pathlib.Path(__file__).resolve().parent.parent
md = (R/'docs/questionnaire.md').read_text()
qs, group = [], ''
blocks = re.split(r'\n(?=\*\*\d+\.|## )', md)
for b in blocks:
    b = b.strip()
    if b.startswith('## '):
        group = re.sub(r'^## [A-Z]\.\s*', '', b.splitlines()[0]); continue
    m = re.match(r'\*\*(\d+)\.\s*(.+?)\*\*\s*(.*)', b, re.S)
    if not m: continue
    n, text, rest = int(m.group(1)), m.group(2).strip(), ' '.join(m.group(3).split())
    qtype = 'single'
    for tag in ('(pick any):', '(pick any)', '(write it in)'):
        if rest.startswith(tag):
            text += ' ' + tag; rest = rest[len(tag):].strip()
    if '(write it in)' in text:
        qtype, opts = 'free', []
        text = text.replace('(write it in)', '').strip()
    elif '(pick any)' in text or text.endswith('(pick any):'):
        qtype = 'multi'
        text = re.sub(r'\s*\(pick any\):?', '', text).rstrip(':').strip()
        opts = [o.strip() for o in rest.split('·') if o.strip()]
    else:
        opts = [o.strip() for o in re.split(r'(?:^|\s)[a-d]\)\s', rest) if o.strip()]
    out = []
    for o in opts:
        mock = bool(re.search(r'\(mock-up[^)]*\)', o))
        out.append({'text': re.sub(r'\s*\(mock-up[^)]*\)', '', o).strip(), 'mock': mock})
    qs.append({'n': n, 'group': group, 'text': text, 'type': qtype, 'options': out})
games = json.loads((R/'mockup/data/games.json').read_text())
keep = ['slug','title','url','year','status','browser_playable','screen']
games = [{k: g.get(k) for k in keep} for g in games]
url = sys.argv[1] if len(sys.argv) > 1 else '#'
t = (R/'docs/proposal-page/template.html').read_text()
t = t.replace('/*GAMES*/', json.dumps(games, ensure_ascii=False)).replace('/*QUESTIONS*/', json.dumps(qs, ensure_ascii=False)).replace('__MOCKUP_URL__', url)
(R/'docs/proposal-page/index.html').write_text(t)
print(len(qs), 'questions;', sum(len(q['options']) for q in qs), 'options;', len(games), 'games')
for q in qs:
    if q['type']=='single' and not (2 <= len(q['options']) <= 4): print('CHECK', q['n'], len(q['options']))
