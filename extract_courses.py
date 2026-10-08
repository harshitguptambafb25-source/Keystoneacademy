"""Extract structured course data from the 20 Keystone handbook DOCX files.
Output: website/data/courses.json  (consumed by the static site)."""
import json, glob, os, re, sys
import docx
from docx.oxml.ns import qn

ROOT = '/home/claude/keystone'
OUT = os.path.join(ROOT, 'website/data/courses.json')

BACK_HEADINGS = ('Scenario Bank', 'Interview Preparation', 'Mini Projects', 'Capstone Project',
                 'Glossary', 'Case Study ', 'Mistakes', 'Checklist', 'Revision', 'Career Application',
                 'Module 12, capstone')

def cell_text(c):
    return '\n'.join(p.text.strip() for p in c.paragraphs if p.text.strip())

def iter_blocks(doc):
    """Yield ('p', text) or ('t', rows) in body order."""
    body = doc.element.body
    for el in body.iterchildren():
        if el.tag == qn('w:p'):
            txt = ''.join(t.text or '' for t in el.iter(qn('w:t'))).strip()
            if txt:
                yield ('p', txt)
        elif el.tag == qn('w:tbl'):
            t = docx.table.Table(el, doc)
            rows = []
            for r in t.rows:
                cells = []
                seen = set()
                for c in r.cells:
                    if id(c._tc) in seen:  # merged cell repeat
                        continue
                    seen.add(id(c._tc))
                    cells.append(cell_text(c))
                rows.append(cells)
            yield ('t', rows)

def extract_handbook(path):
    doc = docx.Document(path)
    blocks = list(iter_blocks(doc))

    # ---- modules: last valid occurrence per module number wins (TOC comes first)
    modules = {}
    current = None
    for kind, val in blocks:
        if kind == 'p':
            m = re.match(r'^Module (\d{1,2}): (.+)$', val)
            if m:
                k = int(m.group(1))
                title = m.group(2).strip()
                if k <= 12:
                    modules[k] = {'no': k, 'title': title, 'blocks': []}
                    current = k
                    continue
            if val.startswith(BACK_HEADINGS):
                current = None
                continue
        if current is not None:
            modules[current]['blocks'].append({'type': 'p', 'text': val} if kind == 'p'
                                              else {'type': 't', 'rows': val})

    # ---- interview questions: 'Question n | Interview preparation' tables
    interview = []
    for kind, val in blocks:
        if kind != 't' or not val or not val[0]:
            continue
        head = val[0]
        if len(head) == 2 and head[0].startswith('Question') and head[1].startswith('Interview'):
            qa = {}
            for r in val[1:]:
                if len(r) >= 2 and r[0]:
                    qa[r[0]] = r[1]
            interview.append({'id': head[0], 'question': qa.get('Question', ''),
                              'answer': qa.get('Model answer', ''),
                              'howToAnswer': qa.get('How to answer', ''),
                              'extra': {k: v for k, v in qa.items()
                                        if k not in ('Question', 'Model answer', 'How to answer')}})

    # ---- scenarios: 'Scenario n | Think it through' tables
    scenarios = []
    for kind, val in blocks:
        if kind != 't' or not val or not val[0]:
            continue
        head = val[0]
        if len(head) == 2 and head[0].startswith('Scenario ') and 'Think' in head[1]:
            fields = [{'label': r[0], 'text': r[1]} for r in val[1:] if len(r) >= 2 and r[0]]
            scenarios.append({'id': head[0], 'fields': fields})

    # ---- glossary: largest 'Term | Meaning' table
    glossary = []
    for kind, val in blocks:
        if kind == 't' and val and len(val[0]) == 2 and val[0][0] == 'Term' and val[0][1] == 'Meaning':
            if len(val) - 1 > len(glossary):
                glossary = [[r[0], r[1]] for r in val[1:] if len(r) >= 2 and r[0]]

    # ---- case studies: paragraph titles starting 'Case Study n:'
    cases = [v for k, v in blocks if k == 'p' and re.match(r'^Case Study \d+:', v)]
    cases = list(dict.fromkeys(cases))

    return {'modules': [modules[k] for k in sorted(modules)],
            'interview': interview, 'scenarios': scenarios,
            'glossary': glossary, 'cases': cases}

def main():
    courses = []
    for meta_path in sorted(glob.glob(os.path.join(ROOT, 'out/meta/*.json'))):
        meta = json.load(open(meta_path))
        hb = os.path.join(ROOT, 'out', meta['file'])
        if not os.path.exists(hb):
            print('missing handbook for', meta['no'], hb); sys.exit(1)
        data = extract_handbook(hb)
        n = len(data['modules'])
        print(meta['no'], 'modules', n, 'blocks', [len(m['blocks']) for m in data['modules']][:12],
              'interview', len(data['interview']), 'scen', len(data['scenarios']),
              'gloss', len(data['glossary']), 'cases', len(data['cases']))
        courses.append({**meta, **data, 'handbook': meta['file'], 'examFile': meta['exam'],
                        'answerKeyFile': meta['exam'].replace('Final_Exam_50_MCQ', 'Exam_Answer_Key')
                        .replace('Exam_Answer_Key.docx', 'Exam_Answer_Key.docx')})
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    json.dump({'courses': courses}, open(OUT, 'w'), ensure_ascii=False)
    print('wrote', OUT, os.path.getsize(OUT) // 1024, 'KB')

if __name__ == '__main__':
    main()
