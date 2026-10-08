/* Keystone Academy: static prototype. Reads window.KA_COURSES (built from the handbooks).
   No account, payment or server calls. Progress is kept in localStorage (per viewer, optional). */
(function () {
  'use strict';
  const COURSES = (window.KA_COURSES && window.KA_COURSES.courses) || [];
  const BY_NO = Object.fromEntries(COURSES.map(c => [c.no, c]));
  const DOMAINS = [...new Set(COURSES.map(c => c.domain))].sort();
  const FEATURED = ['02', '07', '01', '10', '13', '17'];
  const CERT_REQ = [
    'Complete the 36-hour course',
    'Complete the required practical activities (module exercises, mini projects and capstone)',
    'Attempt the final examination: 50 multiple-choice questions',
    'Exam duration: 60 minutes; passing score: 60%',
    'Certificate issued after successful completion'
  ];
  const CERT_STEPS = ['Request submitted', 'Review', 'Exam slot', 'Exam', 'Result', 'Certificate'];
  const JOURNEY = ['Discover', 'Explore', 'Start learning', 'Practise', 'Build', 'Complete', 'Enrol for certification', 'Schedule exam', 'Take exam', 'Get result', 'Get certificate', 'Verify certificate'];

  /* ---------- helpers ---------- */
  function el(tag, attrs, ...kids) {
    const n = document.createElement(tag);
    if (attrs) for (const [k, v] of Object.entries(attrs)) {
      if (v === false || v == null) continue;
      if (k === 'class') n.className = v;
      else if (k === 'text') n.textContent = v;
      else if (k.startsWith('on') && typeof v === 'function') n.addEventListener(k.slice(2), v);
      else n.setAttribute(k, v === true ? '' : v);
    }
    for (const kid of kids.flat(Infinity)) {
      if (kid == null || kid === false) continue;
      n.append(kid instanceof Node ? kid : document.createTextNode(String(kid)));
    }
    return n;
  }
  const $ = (s, r = document) => r.querySelector(s);
  const hrs = c => `${c.hours} hours`;
  function store(key, val) { try { if (val === undefined) return JSON.parse(localStorage.getItem(key) || 'null'); localStorage.setItem(key, JSON.stringify(val)); } catch (e) { return val === undefined ? null : undefined; } }
  function progress() { return store('ka_progress') || {}; }
  function setDone(no, m, done) {
    const p = progress(); const list = new Set(p[no] || []);
    done ? list.add(m) : list.delete(m); p[no] = [...list].sort((a, b) => a - b); store('ka_progress', p);
  }
  function doneSet(no) { return new Set(progress()[no] || []); }
  function shortList(arr, n) { return (arr || []).slice(0, n); }
  function tags(items, cls) { return el('div', { class: 'tagrow' }, items.map(t => el('span', { class: 'tag ' + (cls || '') , text: t }))); }
  function courseCard(c) {
    return el('a', { class: 'card link course-card', href: `#/course/${c.no}` },
      el('div', { class: 'domain-no', text: `COURSE ${c.no} · ${c.domain.toUpperCase()}` }),
      el('h3', { text: c.title }),
      el('div', { class: 'meta', text: `${hrs(c)} · ${c.modules.length} modules · ${c.level}` }),
      el('div', null, shortList(c.catalog.keySkills, 3).map(s => el('span', { class: 'tag', text: s }))),
      c.regulated ? el('div', { style: 'margin-top:8px' }, el('span', { class: 'tag reg', text: 'Regulated topic: educational' })) : null,
      el('div', { class: 'foot', text: 'Explore course →' })
    );
  }

  /* search haystack per course: includes real course content (skills, tools, modules, glossary, interview) */
  COURSES.forEach(c => {
    c._hay = [c.title, c.subtitle, c.domain, c.catalog.description, ...c.catalog.keySkills, ...c.catalog.tools,
      ...c.modules.map(m => m.title), ...c.projects, ...c.catalog.careerOutcomes,
      ...c.glossary.map(g => g[0] + ' ' + g[1]), ...c.interview.map(q => q.question), ...c.toolsMatrix].join(' ').toLowerCase();
  });

  /* ---------- views ---------- */
  function home() {
    const frag = document.createDocumentFragment();
    frag.append(
      el('section', { class: 'hero' }, el('div', { class: 'wrap hero-grid' },
        el('div', null,
          el('span', { class: 'eyebrow', text: 'Keystone Academy · Professional learning' }),
          el('h1', { text: 'Learn Skills. Build Confidence. Get Industry Ready.' }),
          el('p', { class: 'lead', text: 'Practical, AI-enabled, industry-focused professional learning and certification, built from 20 courses of 36 hours each.' }),
          el('div', { class: 'btn-row' },
            el('a', { class: 'btn', href: '#/explore', text: 'Explore courses' }),
            el('a', { class: 'btn btn-ghost', href: '#/how-it-works', text: 'How certification works' })),
          el('p', { class: 'small muted', style: 'margin-top:18px', text: 'Learning is free. Certification is optional.' })
        ),
        el('div', { class: 'journey', 'aria-label': 'Learning path' },
          [['LEARN', 'Modules, concepts and industry cases'], ['APPLY', 'Exercises, Excel and tool practice'], ['ANALYZE', 'Scenarios and decision-making'], ['BUILD', 'Mini projects and a capstone'], ['CERTIFY', 'Optional 50-question exam and certificate']]
            .map((s, i) => el('div', { class: 'journey-step' }, el('div', { class: 'n', text: String(i + 1) }), el('div', null, el('b', { text: s[0] }), el('span', { text: s[1] }))))
        )
      )),
    );
    frag.append(el('section', { class: 'tight alt' }, el('div', { class: 'wrap grid g4' },
      [['What it is', '20 professional courses. Each is 36 hours, in 12 modules of 3 hours.'],
       ['Who it is for', 'MBA and BBA students, graduates, early-career professionals and career switchers.'],
       ['Why it is different', 'Practice in every module, AI used with human verification, and interview questions with model answers.'],
       ['What you can do', 'Study for free, practise, build projects, and optionally earn a Certificate of Professional Completion.']]
        .map(([h, t]) => el('div', { class: 'card' }, el('h3', { text: h, style: 'font-size:1.05rem' }), el('p', { class: 'muted small', style: 'margin:0', text: t }))))));

    frag.append(el('section', null, el('div', { class: 'wrap' },
      el('div', { class: 'section-head' }, el('span', { class: 'eyebrow', text: 'Learning philosophy' }), el('h2', { text: 'Learn by doing, check the work, then explain it' }), el('p', { text: 'Every course follows the same discipline so that learning transfers to the job.' })),
      el('div', { class: 'grid g3' },
        [['Practice in every module', 'Each module ends with an exercise, a case or scenario, and a key takeaway. Theory is kept short so most time is spent on practice.'],
         ['AI with verification', 'AI is taught as a tool with limits. You learn to write useful prompts, check outputs against source data, protect private information, and keep the final judgement with a person.'],
         ['Interview ready', 'Each course includes interview questions with model answers, plus guidance on how to explain your work in 60 seconds.']]
          .map(([h, t]) => el('div', { class: 'card' }, el('h3', { text: h }), el('p', { class: 'muted', text: t })))))));

    frag.append(el('section', { class: 'alt' }, el('div', { class: 'wrap' },
      el('div', { class: 'section-head' }, el('span', { class: 'eyebrow', text: 'Course explorer' }), el('h2', { text: 'Start with a course' }), el('p', { text: 'Search across skills, tools, modules and interview questions on the Explore page.' })),
      el('div', { class: 'grid g3' }, FEATURED.map(n => courseCard(BY_NO[n]))),
      el('div', { class: 'btn-row' }, el('a', { class: 'btn btn-ghost', href: '#/explore', text: 'View all 20 courses' })))));

    frag.append(el('section', null, el('div', { class: 'wrap' },
      el('div', { class: 'section-head' }, el('span', { class: 'eyebrow', text: 'Career domains' }), el('h2', { text: 'Choose your field' })),
      el('div', { class: 'grid g4' }, DOMAINS.map(d => {
        const count = COURSES.filter(c => c.domain === d).length;
        return el('a', { class: 'card link', href: '#/explore?domain=' + encodeURIComponent(d) },
          el('h3', { text: d, style: 'font-size:1.05rem' }),
          el('p', { class: 'muted small', style: 'margin:0', text: count + (count === 1 ? ' course' : ' courses') }));
      })))));

    const projectsPick = ['02', '07', '13'].map(n => BY_NO[n]);
    frag.append(el('section', { class: 'alt' }, el('div', { class: 'wrap' },
      el('div', { class: 'section-head' }, el('span', { class: 'eyebrow', text: 'What learners build' }), el('h2', { text: 'Projects, not just certificates' }), el('p', { text: 'Every course ends with mini projects and a capstone that you can explain in an interview. Examples:' })),
      el('div', { class: 'grid g3' }, projectsPick.map(c => el('div', { class: 'card' },
        el('div', { class: 'domain-no', text: 'COURSE ' + c.no }),
        el('h3', { text: c.projects[0], style: 'font-size:1.05rem' }),
        el('p', { class: 'muted small', text: c.title }),
        el('a', { href: '#/course/' + c.no, text: 'See the project list →', class: 'small' })))))));

    frag.append(el('section', null, el('div', { class: 'wrap grid g2', style: 'align-items:start;gap:48px' },
      el('div', null,
        el('span', { class: 'eyebrow', text: 'AI-enabled learning' }),
        el('h2', { text: 'AI is a tool you must be able to check' }),
        el('p', { class: 'muted', text: 'AI appears where the course topic uses it. Each AI application shows the same structure:' }),
        el('ul', { class: 'clean muted' }, ['Use case', 'Workflow', 'Prompt', 'Expected output', 'Human verification', 'Risks', 'Responsible use'].map(x => el('li', { text: x })))),
      el('div', { class: 'card' },
        el('h3', { text: 'Principles we teach' }),
        el('ul', { class: 'clean' },
          ['AI output is never treated as automatically correct.',
           'Check numbers, sources and claims before you use them.',
           'Do not paste private or client data into tools unless your organisation allows it.',
           'Judgement and accountability stay with the person.'].map(x => el('li', { text: x })))))));

    frag.append(el('section', { class: 'alt' }, el('div', { class: 'wrap' },
      el('div', { class: 'section-head' }, el('span', { class: 'eyebrow', text: 'Learning journey' }), el('h2', { text: 'From first module to certificate' })),
      el('ol', { class: 'steps six' }, JOURNEY.map(s => el('li', { text: s }))))));

    frag.append(el('section', null, el('div', { class: 'wrap' },
      el('div', { class: 'section-head' }, el('span', { class: 'eyebrow', text: 'Certification pathway' }), el('h2', { text: 'Certification is optional and earned' }), el('p', { text: 'You can study every module without paying. To get a certificate you must meet these requirements:' })),
      el('div', { class: 'grid g4' }, [['1', 'Complete the course', '36 hours across 12 modules'], ['2', 'Practical work', 'Exercises, mini projects and capstone'], ['3', 'Final exam', '50 MCQs · 60 minutes · 60% to pass'], ['4', 'Certificate', 'Certificate of Professional Completion']]
        .map(([n, h, t]) => el('div', { class: 'card' }, el('div', { class: 'domain-no', text: 'STEP ' + n }), el('h3', { text: h, style: 'font-size:1.05rem' }), el('p', { class: 'muted small', style: 'margin:0', text: t })))),
      el('p', { class: 'small muted', style: 'margin-top:16px', text: 'Certification fees are shown only when Keystone Academy has configured them. No fee is shown in this prototype.' }),
      el('div', { class: 'btn-row' }, el('a', { class: 'btn', href: '#/how-it-works', text: 'Read the full certification flow' })))));

    const roles = [...new Set(COURSES.flatMap(c => c.catalog.careerOutcomes))].slice(0, 16);
    frag.append(el('section', { class: 'alt' }, el('div', { class: 'wrap' },
      el('div', { class: 'section-head' }, el('span', { class: 'eyebrow', text: 'Career relevance' }), el('h2', { text: 'Roles our courses prepare you for' }), el('p', { text: 'Entry-level and early-career titles. Outcomes depend on your effort and the job market; no placement is guaranteed.' })),
      tags(roles, 'gold'))));

    frag.append(el('section', null, el('div', { class: 'wrap', style: 'max-width:860px' },
      el('div', { class: 'section-head' }, el('span', { class: 'eyebrow', text: 'FAQ' }), el('h2', { text: 'Common questions' })),
      el('div', { class: 'faq' }, [
        ['Is learning free?', 'Yes. You can study course content without paying. Certification is optional.'],
        ['Is the certificate government accredited?', 'No. It is a Certificate of Professional Completion. It is not a government accreditation, a licence, a registration or a regulatory certification.'],
        ['How long is a course?', 'Each course is 36 hours, split into 12 modules of 3 hours each.'],
        ['What does the final exam look like?', '50 multiple-choice questions in 60 minutes. The passing score is 60%.'],
        ['Do the regulated courses qualify me to sell financial products?', 'No. Courses on banking, insurance and mutual funds are educational. Check the current licensing or registration requirements with the relevant regulator, such as IRDAI, SEBI, NISM or AMFI, before you sell any product.'],
        ['Do I need work experience?', 'No. The courses are designed for students, graduates and career switchers.'],
        ['What is the fee?', 'Certification fees are shown when Keystone Academy configures them. None is shown in this prototype.']
      ].map(([q, a]) => el('details', null, el('summary', { text: q }), el('p', { text: a })))))));

    frag.append(el('section', { class: 'tight' }, el('div', { class: 'wrap card', style: 'text-align:center;padding:44px 24px' },
      el('h2', { text: 'Start with one module today' }),
      el('p', { class: 'muted', style: 'max-width:560px;margin:0 auto', text: 'Pick a field, open the first module, and work through one exercise. You can decide on certification later.' }),
      el('div', { class: 'btn-row', style: 'justify-content:center' }, el('a', { class: 'btn', href: '#/explore', text: 'Explore courses' }), el('a', { class: 'btn btn-ghost', href: '#/learn/02/1', text: 'Open a sample module' })))));
    return frag;
  }

  function explore(params) {
    const state = { q: '', domain: params.get('domain') || '', regulated: false, sort: 'no' };
    const frag = document.createDocumentFragment();
    frag.append(el('section', { class: 'page-hero' }, el('div', { class: 'wrap' },
      el('span', { class: 'eyebrow', text: 'Explore courses' }),
      el('h1', { text: 'Explore courses' }),
      el('p', { class: 'lead', text: 'Search across skills, tools, modules, glossary terms and interview questions. All 20 courses are 36 hours.' }))));
    const resultsBox = el('div', null);
    const countBox = el('div', { class: 'result-count', 'aria-live': 'polite' });
    const q = el('input', { type: 'search', id: 'q', placeholder: 'Try Finance, Excel, Power BI, AI, HR analytics, banking', autocomplete: 'off' });
    const sort = el('select', { id: 'sort' }, el('option', { value: 'no', text: 'Course number' }), el('option', { value: 'title', text: 'Title (A to Z)' }), el('option', { value: 'domain', text: 'Domain' }));
    const chipBox = el('div', { class: 'chips', role: 'group', 'aria-label': 'Domain' });
    const regBtn = el('button', { class: 'chip', type: 'button', 'aria-pressed': 'false', text: 'Regulated topics only' });
    function drawChips() {
      chipBox.replaceChildren(
        el('button', { class: 'chip', type: 'button', 'aria-pressed': String(!state.domain), text: 'All domains', onclick: () => { state.domain = ''; drawChips(); draw(); } }),
        ...DOMAINS.map(d => el('button', { class: 'chip', type: 'button', 'aria-pressed': String(state.domain === d), text: d, onclick: () => { state.domain = state.domain === d ? '' : d; drawChips(); draw(); } })));
    }
    regBtn.addEventListener('click', () => { state.regulated = !state.regulated; regBtn.setAttribute('aria-pressed', String(state.regulated)); draw(); });
    q.addEventListener('input', () => { state.q = q.value.trim().toLowerCase(); draw(); });
    sort.addEventListener('change', () => { state.sort = sort.value; draw(); });
    function draw() {
      let list = COURSES.filter(c => (!state.domain || c.domain === state.domain) && (!state.regulated || c.regulated));
      if (state.q) list = list.filter(c => state.q.split(/\s+/).every(w => c._hay.includes(w)));
      list = [...list].sort((a, b) => state.sort === 'title' ? a.title.localeCompare(b.title) : state.sort === 'domain' ? (a.domain.localeCompare(b.domain) || a.no.localeCompare(b.no)) : a.no.localeCompare(b.no));
      countBox.textContent = `${list.length} of ${COURSES.length} courses`;
      resultsBox.replaceChildren(list.length
        ? el('div', { class: 'grid g3' }, list.map(courseCard))
        : el('div', { class: 'card' }, el('h3', { text: 'No courses match yet' }), el('p', { class: 'muted', text: 'Try a broader word such as Finance, Excel, AI or Marketing, or clear the filters.' })));
    }
    frag.append(el('section', { class: 'tight' }, el('div', { class: 'wrap' },
      el('div', { class: 'toolbar' },
        el('div', { class: 'field' }, el('label', { for: 'q', text: 'Search' }), q),
        el('div', { class: 'field' }, el('label', { for: 'sort', text: 'Sort by' }), sort),
        el('div', { class: 'field' }, el('label', { text: 'Topic' }), regBtn),
        el('div', null)),
      chipBox, countBox, resultsBox)));
    drawChips(); draw();
    return frag;
  }

  function courseDetail(no) {
    const c = BY_NO[no];
    if (!c) return notFound();
    const frag = document.createDocumentFragment();
    frag.append(el('section', { class: 'page-hero' }, el('div', { class: 'wrap' },
      el('div', { class: 'crumbs' }, el('a', { href: '#/' , text: 'Home' }), ' / ', el('a', { href: '#/explore', text: 'Explore' }), ' / ', el('span', { text: 'Course ' + c.no })),
      el('span', { class: 'eyebrow', text: c.domain }),
      el('h1', { text: c.title }),
      el('p', { class: 'lead', text: c.subtitle }),
      el('div', { class: 'btn-row' },
        el('a', { class: 'btn', href: `#/learn/${c.no}/1`, text: 'Start learning (free)' }),
        el('a', { class: 'btn btn-ghost', href: `#/certify/${c.no}`, text: 'Enrol for certification' })),
      c.regulated ? el('p', { class: 'small', style: 'margin-top:14px' }, el('span', { class: 'tag reg', text: 'Regulated topic: educational only' })) : null)));

    const main = el('div', null);
    const sec = (title, ...kids) => main.append(el('div', { class: 'card', style: 'margin-bottom:20px' }, el('h2', { text: title, style: 'font-size:1.35rem' }), ...kids));
    sec('Overview', el('p', { text: c.catalog.description }),
      el('p', { class: 'muted', text: `Built for ${c.domain.toLowerCase()} work. The course moves from "${c.modules[0].title}" to "${c.modules[c.modules.length - 1].title}" through practice, cases, tools and AI.` }));
    sec('Who should take it', el('p', { text: c.audience + '.' }));
    sec('Learning outcomes', el('ul', { class: 'clean' }, c.catalog.keySkills.map(s => el('li', { text: s }))));
    sec('Module roadmap', el('ol', { class: 'clean' }, c.modules.map(m => el('li', null, el('a', { href: `#/learn/${c.no}/${m.no}`, text: m.title })))));
    sec('Tools', tags(c.toolsMatrix));
    sec('AI applications', el('ul', { class: 'clean' }, c.catalog.aiHighlights.map(s => el('li', { text: s }))));
    sec('Case studies', el('ul', { class: 'clean' }, c.cases.map(s => el('li', { text: s }))),
      el('p', { class: 'small muted', text: 'Each case lists the industry, business problem, available information and the decision required. Full case text is in the handbook.' }));
    sec('Projects and capstone', el('ul', { class: 'clean' }, c.projects.map((p, i) => el('li', null, p, i === c.projects.length - 1 ? el('span', { class: 'tag gold', style: 'margin-left:8px', text: 'Capstone' }) : null))));
    sec('Interview preparation', el('p', { class: 'muted', text: `${c.interview.length} questions with model answers and how-to-answer guidance.` }),
      c.interview.map((q, i) => el('details', { class: 'acc' }, el('summary', { text: `Q${i + 1}. ${q.question}` }),
        el('div', { class: 'body' },
          el('div', { class: 'qa-label', text: 'Model answer' }), el('p', { text: q.answer }),
          q.howToAnswer ? el('div', null, el('div', { class: 'qa-label', text: 'How to answer' }), el('p', { text: q.howToAnswer })) : null))));
    sec('Scenario bank', el('p', { class: 'muted', text: `${c.scenarios.length} scenarios. Think it through first, then open the model answer.` }),
      c.scenarios.map((s, i) => {
        const get = l => (s.fields.find(f => f.label === l) || {}).text;
        const sit = s.fields.find(f => f.label === 'Situation'), ques = s.fields.find(f => f.label === 'Question');
        const rest = s.fields.filter(f => f !== sit && f !== ques);
        return el('details', { class: 'acc' }, el('summary', { text: `Scenario ${i + 1}: ${(sit ? sit.text : '').slice(0, 90)}${sit && sit.text.length > 90 ? '…' : ''}` }),
          el('div', { class: 'body' },
            sit ? el('p', null, el('b', { text: 'Situation. ' }), sit.text) : null,
            ques ? el('p', null, el('b', { text: 'Question. ' }), ques.text) : null,
            el('details', { class: 'acc', style: 'box-shadow:none;margin:10px 0 0' }, el('summary', { text: 'Show analysis' }),
              el('div', { class: 'body' }, rest.map(f => el('p', null, el('b', { text: f.label + '. ' }), f.text))))));
      }));
    sec('Glossary', glossarySearch(c.glossary));
    sec('Career relevance', tags(c.catalog.careerOutcomes, 'gold'));
    sec('Certification pathway', el('ol', { class: 'clean' }, CERT_REQ.map(x => el('li', { text: x }))),
      el('div', { class: 'btn-row' }, el('a', { class: 'btn', href: `#/certify/${c.no}`, text: 'Enrol for certification' })));

    const side = el('aside', { class: 'card side-card' }, el('h3', { text: 'At a glance' }),
      el('dl', { class: 'kv' },
        el('dt', { text: 'Duration' }), el('dd', { text: hrs(c) }),
        el('dt', { text: 'Modules' }), el('dd', { text: `12 × 3 hours` }),
        el('dt', { text: 'Level' }), el('dd', { text: c.level }),
        el('dt', { text: 'Projects' }), el('dd', { text: String(c.projects.length) + ' (incl. capstone)' }),
        el('dt', { text: 'Interview Q' }), el('dd', { text: String(c.interview.length) }),
        el('dt', { text: 'Exam' }), el('dd', { text: '50 MCQs · 60 min · 60% to pass' })),
      el('div', { class: 'btn-row' }, el('a', { class: 'btn', href: `#/learn/${c.no}/1`, text: 'Start learning (free)' })));

    frag.append(el('section', { class: 'tight' }, el('div', { class: 'wrap two-col' }, main, side)));
    return frag;
  }

  function glossarySearch(terms) {
    const input = el('input', { type: 'search', placeholder: 'Search terms, e.g. working capital', 'aria-label': 'Search glossary', autocomplete: 'off' });
    const list = el('dl', { style: 'margin:0' });
    const draw = () => {
      const q = input.value.trim().toLowerCase();
      const hits = terms.filter(([t, m]) => !q || (t + ' ' + m).toLowerCase().includes(q));
      list.replaceChildren(...(hits.length ? hits : [[ '', 'No matching term.' ]]).map(([t, m]) => t
        ? el('div', { style: 'padding:10px 0;border-bottom:1px solid var(--line)' }, el('dt', { style: 'font-weight:600;color:var(--navy)', text: t }), el('dd', { style: 'margin:4px 0 0;color:var(--muted)', text: m }))
        : el('p', { class: 'muted', text: m })));
    };
    input.addEventListener('input', draw); draw();
    return el('div', null, el('p', { class: 'small muted', text: `${terms.length} terms` }), input, el('div', { style: 'margin-top:12px' }, list));
  }

  /* ---------- learn: module reader ---------- */
  const HEAD_EXACT = ['What you will be able to do', 'Industry Case Studies', 'Practical exercise', 'Practical exercises', 'Key takeaways', 'Common mistakes'];
  function renderBlocks(blocks) {
    const out = [];
    let listBuf = null;
    const flushList = () => { if (listBuf) { out.push(el('ul', null, listBuf.map(t => el('li', { text: t })))); listBuf = null; } };
    blocks.forEach((b, i) => {
      if (b.type === 'p') {
        const t = b.text;
        const numbered = t.match(/^\d+\.\d+\s+(.+)$/);
        if (numbered) { flushList(); out.push(el('h4', { text: numbered[1] })); return; }
        if (HEAD_EXACT.includes(t)) { flushList(); out.push(el('h4', { text: t })); listBuf = (t === 'What you will be able to do') ? [] : null; return; }
        if (listBuf) { listBuf.push(t); return; }
        flushList(); out.push(el('p', { text: t }));
      } else {
        flushList();
        const rows = b.rows.filter(r => r.some(x => x));
        if (rows.length === 1 && rows[0].length === 1) {
          const txt = rows[0][0]; const nl = txt.indexOf('\n');
          const label = nl > -1 ? txt.slice(0, nl).trim() : '';
          const body = nl > -1 ? txt.slice(nl + 1).trim() : txt;
          out.push(el('div', { class: 'callout' }, label ? el('b', { text: label }) : null, body));
        } else if (rows.length) {
          const [head, ...body] = rows;
          out.push(el('table', null,
            el('thead', null, el('tr', null, head.map(h => el('th', { text: h })))),
            el('tbody', null, body.map(r => el('tr', null, r.map(x => el('td', { text: x })))))));
        }
      }
    });
    flushList();
    return out;
  }

  function learn(no, mNo) {
    const c = BY_NO[no];
    if (!c) return notFound();
    const m = c.modules.find(x => x.no === mNo);
    if (!m) return notFound();
    const done = doneSet(no);
    const total = c.modules.length;
    const pct = Math.round((done.size / total) * 100);
    const next = c.modules.find(x => x.no === mNo + 1);
    const nav = el('nav', { class: 'learn-nav', 'aria-label': 'Modules' },
      el('h2', { text: c.title }),
      el('p', { class: 'small muted', style: 'margin:0 0 10px', text: `${done.size} of ${total} modules complete` }),
      el('ol', null, c.modules.map(x => {
        const state = done.has(x.no) ? 'done' : x.no === mNo ? 'cur' : '';
        const label = done.has(x.no) ? 'Completed' : x.no === mNo ? 'Current' : 'Upcoming';
        return el('li', null, el('a', { href: `#/learn/${no}/${x.no}`, 'aria-current': x.no === mNo ? 'step' : false },
          el('span', { class: 'st ' + state, 'aria-hidden': 'true', text: done.has(x.no) ? '✓' : '' }),
          el('span', null, el('span', { class: 'small muted', style: 'display:block', text: `Module ${String(x.no).padStart(2, '0')} · ${label}` }), x.title)));
      })));

    const isDone = done.has(mNo);
    const toggle = el('button', { class: isDone ? 'btn btn-ghost' : 'btn', type: 'button', text: isDone ? 'Mark as not complete' : 'Mark module complete' });
    toggle.addEventListener('click', () => { setDone(no, mNo, !isDone); render(); });
    const main = el('article', { class: 'learn-main' },
      el('div', { class: 'crumbs' }, el('a', { href: `#/course/${no}`, text: '← ' + c.title })),
      el('span', { class: 'eyebrow', text: `Module ${mNo} of ${total} · 3 hours` }),
      el('h1', { text: m.title, style: 'font-size:clamp(1.7rem,3.2vw,2.4rem)' }),
      el('div', { class: 'small muted' }, `Course progress: ${pct}%`),
      el('div', { class: 'progress', role: 'progressbar', 'aria-valuenow': String(pct), 'aria-valuemin': '0', 'aria-valuemax': '100', 'aria-label': 'Course progress' }, el('div', { style: `width:${pct}%` })),
      el('div', { class: 'doc', style: 'margin-top:28px' }, renderBlocks(m.blocks)),
      el('div', { class: 'module-actions' },
        toggle,
        next ? el('a', { class: 'btn btn-ghost', href: `#/learn/${no}/${next.no}`, text: 'Continue to next module →' })
             : el('a', { class: 'btn', href: `#/certify/${no}`, text: 'Course complete: enrol for certification' })),
      el('p', { class: 'small muted', style: 'margin-top:22px', text: 'Module text is taken from the course handbook. Exercises use synthetic or fictional data. Verify current regulations and vendor features before you rely on them.' })
    );
    return el('div', { class: 'learn-wrap' }, nav, main);
  }

  function certify(no) {
    const c = BY_NO[no];
    if (!c) return notFound();
    const frag = document.createDocumentFragment();
    frag.append(el('section', { class: 'page-hero' }, el('div', { class: 'wrap' },
      el('div', { class: 'crumbs' }, el('a', { href: '#/', text: 'Home' }), ' / ', el('a', { href: `#/course/${no}`, text: 'Course ' + no }), ' / ', el('span', { text: 'Certification' })),
      el('span', { class: 'eyebrow', text: 'Optional certification' }),
      el('h1', { text: 'Enrol for certification' }),
      el('p', { class: 'lead', text: c.title }))));
    const body = el('div', { class: 'two-col' });
    const left = el('div', null,
      el('div', { class: 'card', style: 'margin-bottom:20px' }, el('h2', { text: 'Requirements', style: 'font-size:1.3rem' }), el('ol', { class: 'clean' }, CERT_REQ.map(x => el('li', { text: x })))),
      el('div', { class: 'card' }, el('h2', { text: 'Apply', style: 'font-size:1.3rem' }), applicationForm(c)));
    const right = el('aside', { class: 'card side-card' }, el('h3', { text: 'Summary' }),
      el('dl', { class: 'kv' },
        el('dt', { text: 'Course' }), el('dd', { text: c.title }),
        el('dt', { text: 'Program' }), el('dd', { text: '36-hour Industry Skill Development Program' }),
        el('dt', { text: 'Exam' }), el('dd', { text: '50 MCQs, 60 min' }),
        el('dt', { text: 'Pass' }), el('dd', { text: '60%' }),
        el('dt', { text: 'Fee' }), el('dd', { text: 'Shown when configured' })),
      el('p', { class: 'small muted', style: 'margin-top:14px', text: 'Certificate type: Certificate of Professional Completion. It is not a government accreditation or licence.' }));
    body.append(left, right);
    frag.append(el('section', { class: 'tight' }, el('div', { class: 'wrap' }, body)));
    return frag;
  }

  function applicationForm(c) {
    const f = el('form', { novalidate: true, class: 'form-grid', style: 'margin-top:14px' });
    const field = (id, label, input, full) => el('div', { class: 'field' + (full ? ' full' : '') }, el('label', { for: id, text: label }), input, el('div', { class: 'err', id: id + '-err', role: 'alert' }));
    const inp = (id, type, extra) => el('input', Object.assign({ id, type, name: id }, extra || {}));
    const name = inp('name', 'text', { autocomplete: 'name', required: true });
    const email = inp('email', 'email', { autocomplete: 'email', required: true });
    const mobile = inp('mobile', 'tel', { autocomplete: 'tel', inputmode: 'numeric', placeholder: '10-digit mobile number', required: true });
    const org = inp('org', 'text', { placeholder: 'College or organisation' });
    const status = el('select', { id: 'status', name: 'status' }, el('option', { value: '', text: 'Select' }), ['Student', 'Recent graduate', 'Working professional', 'Career switcher', 'Other'].map(v => el('option', { value: v, text: v })));
    const mode = el('select', { id: 'mode', name: 'mode' }, el('option', { value: '', text: 'Select' }), ['Online', 'In person (where available)'].map(v => el('option', { value: v, text: v })));
    const slot = el('select', { id: 'slot', name: 'slot' }, el('option', { value: '', text: 'Select' }), el('option', { value: 'configured', text: 'Slots are configured by Keystone Academy' }));
    const decl = el('input', { type: 'checkbox', id: 'decl', name: 'decl' });
    const decl2 = el('input', { type: 'checkbox', id: 'decl2', name: 'decl2' });
    const submitBtn = el('button', { class: 'btn', type: 'submit', text: 'Apply for certification' });
    const result = el('div', { 'aria-live': 'polite' });
    f.append(
      field('name', 'Full name', name), field('email', 'Email', email), field('mobile', 'Mobile', mobile),
      field('org', 'College or organisation', org, true),
      field('status', 'Academic or professional status', status), field('mode', 'Preferred exam mode', mode),
      field('slot', 'Preferred slot', slot, true),
      el('div', { class: 'full' },
        el('label', { class: 'checkbox' }, decl, el('span', { text: 'I confirm the details above are correct and I have completed, or will complete, the required course work.' })),
        el('div', { class: 'err', id: 'decl-err', role: 'alert' }),
        el('label', { class: 'checkbox' }, decl2, el('span', { text: 'I understand the certificate is a Certificate of Professional Completion and is not a government accreditation, licence or regulatory certification.' })),
        el('div', { class: 'err', id: 'decl2-err', role: 'alert' })),
      el('div', { class: 'full' }, el('div', { class: 'alert', text: 'Prototype only: this form checks your input but does not send, store or verify the request. The reference number below is an example.' })),
      el('div', { class: 'full btn-row', style: 'margin-top:4px' }, submitBtn), result);
    f.addEventListener('submit', e => {
      e.preventDefault();
      const errs = {};
      if (name.value.trim().length < 2) errs.name = 'Enter your full name.';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.value.trim())) errs.email = 'Enter a valid email address.';
      if (!/^[6-9]\d{9}$/.test(mobile.value.replace(/[\s-]/g, ''))) errs.mobile = 'Enter a 10-digit Indian mobile number.';
      if (!status.value) errs.status = 'Select your status.';
      if (!mode.value) errs.mode = 'Select an exam mode.';
      if (!slot.value) errs.slot = 'Select a preferred slot.';
      if (!decl.checked) errs['decl'] = 'Please confirm the declaration.';
      if (!decl2.checked) errs['decl2'] = 'Please confirm the certificate statement.';
      ['name', 'email', 'mobile', 'status', 'mode', 'slot', 'decl', 'decl2'].forEach(k => { const node = $('#' + k + '-err'); if (node) node.textContent = errs[k] || ''; });
      if (Object.keys(errs).length) { const first = f.querySelector('[aria-invalid], .err:not(:empty)'); const k = Object.keys(errs)[0]; const target = $('#' + k) || $('#' + k.replace(/2$/, '2')); if (target) target.focus(); return; }
      const ref = 'KA-2026-' + String(Math.floor(100000 + Math.random() * 899999));
      result.replaceChildren(el('div', { class: 'card', style: 'margin-top:24px;border-color:var(--gold)' },
        el('div', { class: 'eyebrow', text: 'Certification request received' }),
        el('p', { class: 'receipt', text: 'Reference: ' + ref }),
        el('p', { class: 'muted small', text: 'Example reference for the prototype. A live system would send a confirmation to your email.' }),
        el('ol', { class: 'steps six' }, CERT_STEPS.map((s, i) => el('li', { class: i === 0 ? 'done' : i === 1 ? 'on' : '', text: s })))));
      submitBtn.disabled = true;
    });
    return f;
  }

  function howItWorks() {
    const frag = document.createDocumentFragment();
    frag.append(el('section', { class: 'page-hero' }, el('div', { class: 'wrap' },
      el('span', { class: 'eyebrow', text: 'How certification works' }),
      el('h1', { text: 'Learning is free. Certification is optional.' }),
      el('p', { class: 'lead', text: 'You can study every module before you decide. When you are ready, the steps below show what happens next.' }))));
    frag.append(el('section', null, el('div', { class: 'wrap' }, el('div', { class: 'grid g2' },
      el('div', { class: 'card' }, el('h2', { text: 'The path', style: 'font-size:1.3rem' }), el('ol', { class: 'clean' }, JOURNEY.map(s => el('li', { text: s })))),
      el('div', { class: 'card' }, el('h2', { text: 'What you need', style: 'font-size:1.3rem' }), el('ul', { class: 'clean' }, CERT_REQ.map(s => el('li', { text: s }))),
        el('p', { class: 'small muted', style: 'margin-top:14px', text: 'Certificate verification by ID is planned for the full platform and is not available in this prototype.' }))))));
    frag.append(el('section', { class: 'tight alt' }, el('div', { class: 'wrap' }, el('h2', { text: 'Choose a course to begin', style: 'font-size:1.4rem' }), el('div', { class: 'btn-row' }, el('a', { class: 'btn', href: '#/explore', text: 'Explore courses' })))));
    return frag;
  }

  function notFound() {
    return el('section', { class: 'hero' }, el('div', { class: 'wrap' }, el('h1', { text: 'Page not found' }), el('p', { class: 'lead', text: 'The page you are looking for does not exist in this prototype.' }), el('a', { class: 'btn', href: '#/', text: 'Back to home' })));
  }

  /* ---------- router ---------- */
  function route() {
    const raw = location.hash.replace(/^#/, '') || '/';
    const [path, query] = raw.split('?');
    const params = new URLSearchParams(query || '');
    const parts = path.split('/').filter(Boolean);
    const head = parts[0] || '';
    if (!head) return { view: home(), nav: null };
    if (head === 'explore') return { view: explore(params), nav: 'explore' };
    if (head === 'course') return { view: courseDetail(parts[1]), nav: 'explore' };
    if (head === 'learn') return { view: learn(parts[1], parseInt(parts[2], 10)), nav: 'explore' };
    if (head === 'certify') return { view: certify(parts[1]), nav: 'explore' };
    if (head === 'how-it-works') return { view: howItWorks(), nav: 'how' };
    return { view: notFound(), nav: null };
  }

  function render() {
    const { view, nav } = route();
    const main = $('#app');
    main.replaceChildren(view);
    document.querySelectorAll('.site-nav a[data-nav]').forEach(a => {
      a.getAttribute('data-nav') === nav ? a.setAttribute('aria-current', 'page') : a.removeAttribute('aria-current');
    });
    const title = document.title.split(' | ')[0];
    const h1 = main.querySelector('h1');
    document.title = (h1 ? h1.textContent + ' | ' : '') + 'Keystone Academy';
    window.scrollTo({ top: 0, behavior: 'auto' });
    main.focus({ preventScroll: true });
  }
  window.addEventListener('hashchange', render);
  if (!COURSES.length) { $('#app').textContent = 'Course data did not load.'; }
  else render();
})();
