// ─── UTILITIES ───────────────────────────────────────────────────────────────
    function formatR(n) {
      if (isNaN(n) || n === null) return 'R 0';
      return 'R ' + Math.round(n).toLocaleString('en-ZA');
    }

    const dharmaStore = {
      get(key) { try { return JSON.parse(localStorage.getItem('dharma_' + key)); } catch { return null; } },
      set(key, val) { try { localStorage.setItem('dharma_' + key, JSON.stringify(val)); } catch {} }
    };

    const qs = (root, sel) => root.querySelector(sel);
    const qsa = (root, sel) => Array.from(root.querySelectorAll(sel));
    const moneyInput = (id, label, ph = 'e.g. 0') =>
      `<div class="form-group"><label for="${id}">${label}</label><div class="prefix-input"><input type="number" id="${id}" min="0" step="100" placeholder="${ph}" /></div></div>`;

    function renderList(ul, items) { ul.innerHTML = items.map(i => `<li>${i}</li>`).join(''); }
    function titleCase(t) { return t ? t.charAt(0).toUpperCase() + t.slice(1) : ''; }


    // ─── NEXT.JS PAGE INITIALISER ────────────────────────────────────────────────
    const PAGE_INIT = {
      'reality-check': initRealityCheck,
      'cost-calculator': initCostCalculator,
      'route-compare': initRouteCompare,
      'fit-check': initFitCheck,
      'next-steps': initNextSteps
    };

    const PAGE_PATHS = {
      '/': 'home',
      '/tools': 'tools',
      '/about': 'about',
      '/research': 'research',
      '/privacy': 'privacy',
      '/terms': 'terms',
      '/contact': 'contact',
      '/tools/reality-check': 'reality-check',
      '/tools/cost-calculator': 'cost-calculator',
      '/tools/route-compare': 'route-compare',
      '/tools/fit-check': 'fit-check',
      '/tools/next-steps': 'next-steps'
    };

    function currentDharmaPageKey() {
      const path = window.location.pathname.replace(/\/$/, '') || '/';
      if (PAGE_PATHS[path]) return PAGE_PATHS[path];
      const page = document.querySelector('.page-section');
      return page?.dataset?.page || 'home';
    }

    function initCurrentDharmaPage() {
      const key = currentDharmaPageKey();
      let page = document.querySelector(`[data-page="${key}"]`);

      // During client-side navigation, Next can update the URL before the new
      // page DOM is mounted. Wait for the mutation observer to retry instead of
      // initialising the previous page with the new route's handlers.
      if (!page && (PAGE_INIT[key] || key === 'tools')) return;
      if (!page) page = document.querySelector('.page-section') || document;

      document.querySelectorAll('.nav-links a').forEach(a => {
        const href = a.getAttribute('href') || '';
        const path = window.location.pathname.replace(/\/$/, '') || '/';
        const normalHref = href.replace(/\/$/, '') || '/';
        a.classList.toggle('active', normalHref === path || (key === 'home' && href === '/'));
      });

      const pageInitKey = page.dataset ? page.dataset.dharmaPageInit : "";
      if (PAGE_INIT[key] && pageInitKey !== key) {
        try {
          const didInit = PAGE_INIT[key](page);
          if (didInit === false) return;
          page.dataset.dharmaPageInit = key;
        } catch (error) {
          if (page.dataset) delete page.dataset.dharmaPageInit;
          console.error('Dharma tool initialization failed:', key, error);
          return;
        }
      }
      if (key === 'tools') renderPathwaySnapshot(page);
      if (key === 'next-steps' && pageInitKey === key) renderNextSteps(page);

      if (window._revealIO) qsa(page, '.reveal').forEach(el => { if (!el.classList.contains('in')) window._revealIO.observe(el); });
      else qsa(page, '.reveal').forEach(el => el.classList.add('in'));
    }

    function bootDharmaTools() {
      if (window.__dharmaToolsBooted) return;
      window.__dharmaToolsBooted = true;

      const toggle = document.querySelector('.nav-toggle');
      const links = document.querySelector('.nav-links');
      let initTimer;
      const schedulePageInit = (delay = 80) => {
        clearTimeout(initTimer);
        initTimer = setTimeout(initCurrentDharmaPage, delay);
      };
      if (toggle && links) toggle.addEventListener('click', () => links.classList.toggle('open'));

      document.addEventListener('click', e => {
        const target = e.target instanceof Element ? e.target : null;
        if (!target) return;

        const internalLink = target.closest('a[href^="/tools"], a[href="/"], a[href^="/about"], a[href^="/research"], a[href^="/contact"], a[href^="/privacy"], a[href^="/terms"]');
        if (internalLink) {
          schedulePageInit(120);
          setTimeout(initCurrentDharmaPage, 360);
        }
        const openQuestions = e.target.closest('[data-open-questions]');
        if (openQuestions) {
          const section = openQuestions.closest('.result-panel') || openQuestions.closest('.page-section') || document;
          const generator = section.querySelector('[data-question-generator]');
          if (generator) { generator.classList.toggle('hidden'); generator.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
        }

        const generateQuestions = e.target.closest('[data-generate-questions]');
        if (generateQuestions) renderInstitutionQuestions(generateQuestions.closest('[data-question-generator]'));

        const copyQuestions = e.target.closest('[data-copy-questions]');
        if (copyQuestions) {
          const generator = copyQuestions.closest('[data-question-generator]');
          const output = generator ? generator.querySelector('[data-question-output]') : null;
          if (!output || !output.textContent.trim()) renderInstitutionQuestions(generator);
          const freshOutput = generator ? generator.querySelector('[data-question-output]') : null;
          if (freshOutput && freshOutput.textContent.trim() && navigator.clipboard) {
            navigator.clipboard.writeText(freshOutput.textContent).then(() => {
              copyQuestions.textContent = 'Copied';
              setTimeout(() => copyQuestions.textContent = 'Copy questions', 1600);
            }).catch(() => {
              copyQuestions.textContent = 'Copy failed';
              setTimeout(() => copyQuestions.textContent = 'Copy questions', 1600);
            });
          }
        }

        const adjust = e.target.closest('[data-adjust]');
        if (adjust) {
          const form = document.getElementById(adjust.dataset.adjust);
          const result = document.getElementById(adjust.dataset.result);
          if (result) result.classList.add('hidden');
          if (form) form.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }

        if (links && e.target.closest('.nav-links a')) links.classList.remove('open');
      });

      document.addEventListener('submit', e => {
        const form = e.target instanceof HTMLFormElement ? e.target : null;
        if (!form || (form.id !== 'routeForm' && form.id !== 'fitForm')) return;

        e.preventDefault();
        e.stopPropagation();
        if (!form.checkValidity()) {
          form.reportValidity();
          return;
        }

        const page = form.closest('.page-section') || document;
        if (form.id === 'routeForm') submitRouteCompareForm(page);
        if (form.id === 'fitForm') submitFitCheckForm(page);
      }, true);

      if ('IntersectionObserver' in window) {
        window._revealIO = new IntersectionObserver(entries => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              entry.target.classList.add('in');
              window._revealIO.unobserve(entry.target);
            }
          });
        }, { threshold: 0.08 });
      }

      initCurrentDharmaPage();
      ['pushState', 'replaceState'].forEach(method => {
        const original = history[method];
        history[method] = function(...args) {
          const result = original.apply(this, args);
          schedulePageInit();
          return result;
        };
      });
      window.addEventListener('popstate', schedulePageInit);
      const main = document.querySelector('main') || document.body;
      if (main && 'MutationObserver' in window) {
        new MutationObserver(schedulePageInit).observe(main, { childList: true, subtree: true });
      }
    }


    function buildInstitutionQuestions(institutionName = '', programmeName = '') {
      const institution = institutionName.trim() || '[Institution / provider name]';
      const programme = programmeName.trim() || '[Programme / qualification name]';
      return `EMAIL TEMPLATE\n\nSubject: Questions before applying for ${programme}\n\nGood day,\n\nI am considering applying for ${programme} at ${institution}. Before making a decision, I would appreciate your assistance with the questions below.\n\n1. Is this qualification currently accredited, registered and recognised by the relevant authority or professional body?\n2. What is the full annual cost, including registration, tuition, compulsory materials, devices, practical fees, examination fees and any other required costs?\n3. Are there any hidden or once-off costs that students commonly miss before registering?\n4. What funding options, bursaries, payment plans or loan arrangements are available for this programme?\n5. What is the refund, cancellation or deregistration policy if funding is not approved or the student cannot continue?\n6. What percentage of students completed this programme on time in the most recent year available?\n7. What percentage of graduates found relevant work, workplace placement, articles, internship or further study within 12 months?\n8. Does the programme include workplace learning, internship, articles, clinical placement, apprenticeship, practical training or work-integrated learning? If yes, is placement guaranteed or must the student find it independently?\n9. Does this qualification lead to professional registration, licensing, board examination, trade test, articles or any other post-study requirement?\n10. What happens financially and academically if funding falls through after registration or if the student repeats a subject or year?\n\nIf this is a private provider, please also confirm:\n- current DHET registration status;\n- accreditation status for this specific programme;\n- whether the qualification appears on SAQA/NQF records where applicable;\n- whether the qualification leads to the professional or employment outcome advertised.\n\nKind regards,\n[Name]\n\nCHECKLIST VERSION\n\nBefore applying or paying deposits, confirm:\n□ Accreditation / registration\n□ Full cost breakdown\n□ Hidden or once-off costs\n□ Funding / payment plans\n□ Refund or cancellation policy\n□ Graduate employment outcomes\n□ Completion / pass rates\n□ Workplace learning / internship / articles\n□ Professional registration requirements\n□ What happens if funding falls through\n□ Private provider checks: DHET, SAQA/NQF and programme-specific accreditation`;
    }

    function renderInstitutionQuestions(generator) {
      if (!generator) return;
      const institution = generator.querySelector('[data-institution-name]')?.value || '';
      const programme = generator.querySelector('[data-programme-name]')?.value || '';
      const output = generator.querySelector('[data-question-output]');
      if (!output) return;
      output.textContent = buildInstitutionQuestions(institution, programme);
      output.classList.remove('hidden');
    }

    function renderPathwaySnapshot(page) {
      const grid = qs(page, '#snapshotGrid');
      const action = qs(page, '#snapshotAction');
      if (!grid || !action) return;
      const reality = dharmaStore.get('reality');
      const cost = dharmaStore.get('cost');
      const fit = dharmaStore.get('fit');
      const items = [
        ['Affordability pressure', reality ? titleCase(reality.pressure) : 'Not completed yet', !!reality],
        ['Funding bracket', reality ? reality.bracket : 'Not completed yet', !!reality],
        ['Monthly study capacity', reality ? formatR(reality.capacity) + '/mo' : 'Not completed yet', !!reality],
        ['Last costed route / scenario', cost ? inferLastCostedRoute(cost) : 'Not completed yet', !!cost],
        ['Monthly burden', cost ? formatR(cost.netMonthly) + '/mo' : 'Not completed yet', !!cost],
        ['Top career fit', fit && fit.top && fit.top[0] ? fit.top[0] : 'Not completed yet', !!fit],
        ['Recommended next action', getSnapshotNextAction(reality, cost, fit).short, true]
      ];
      grid.innerHTML = items.map(([label, value, done]) => `<div class="snapshot-item"><div class="snapshot-label">${label}</div><div class="snapshot-value ${done ? '' : 'muted'}">${value}</div></div>`).join('');
      action.innerHTML = `<strong>Recommended next action:</strong> ${getSnapshotNextAction(reality, cost, fit).long}`;
    }

    function inferLastCostedRoute(cost) {
      if (!cost || !cost.breakdown) return 'Custom route';
      const b = cost.breakdown;
      if ((b.accom || 0) > 0 && (b.tuition || 0) >= 50000) return 'Campus route with accommodation';
      if ((b.accom || 0) === 0 && (b.tuition || 0) >= 50000) return 'Campus route living at home';
      if ((b.tuition || 0) <= 25000 && (b.accom || 0) === 0) return 'Lower-cost / TVET-style route';
      if ((b.data || 0) > 0 && (b.transport || 0) === 0 && (b.accom || 0) === 0) return 'Online / distance-style route';
      return 'Custom costed route';
    }

    function getSnapshotNextAction(reality, cost, fit) {
      if (!reality) return { short: 'Start with Reality Check', long: 'Start with Reality Check to understand your household affordability pressure.' };
      if (!cost) return { short: 'Run True Cost Calculator', long: 'Run True Cost Calculator next so your household can see the annual cost, monthly burden and first-month cash need.' };
      if (reality.capacity > 0 && cost.netMonthly > reality.capacity) return { short: 'Compare a cheaper route', long: 'The last costed route appears to exceed your household capacity. Compare a cheaper, funded, living-at-home, TVET or distance route before committing.' };
      if (!fit) return { short: 'Run Career Fit Check', long: 'Run Career Fit Check next to test whether the student’s interests, working style and marks support the route being considered.' };
      return { short: 'Open the final report', long: 'Open What Comes Next to review the family report, warning flags and three-pathway recommendations.' };
    }

    // ─── TOOL 1: REALITY CHECK ────────────────────────────────────────────────────
    function initRealityCheck(page) {
      const form = qs(page, '#rcForm');
      const result = qs(page, '#rcResult');
      if (!form || !result) return false;

      const saved = dharmaStore.get('reality');
      if (saved) {
        ['income','dependents','earners','expenses','debts','emergencyMonths'].forEach(id => {
          const el = qs(page, '#' + id); if (el && saved[id] != null) el.value = saved[id];
        });
        ['living','siblings','incomeStability','studentWork','creditPressure'].forEach(name => {
          if (saved[name] != null) { const el = qs(page, `input[name="${name}"][value="${saved[name]}"]`); if (el) el.checked = true; }
        });
      }

      form.addEventListener('reset', () => result.classList.add('hidden'));
      form.addEventListener('submit', e => {
        e.preventDefault();
        const income = +qs(page,'#income').value || 0;
        const dependents = +qs(page,'#dependents').value || 1;
        const earners = +qs(page,'#earners').value || 1;
        const expenses = +qs(page,'#expenses').value || 0;
        const debts = +qs(page,'#debts').value || 0;
        const living = qs(page,'input[name="living"]:checked').value;
        const siblings = +qs(page,'input[name="siblings"]:checked').value;
        const incomeStability = qs(page,'input[name="incomeStability"]:checked').value;
        const studentWork = qs(page,'input[name="studentWork"]:checked').value;
        const emergencyMonths = +qs(page,'#emergencyMonths').value || 0;
        const creditPressure = qs(page,'input[name="creditPressure"]:checked').value;

        const annual = income * 12;
        const surplus = income - expenses - debts;
        const perCapita = income / dependents;

        let bracket = 'Comfortable';
        if (annual < 350000) bracket = 'NSFAS-eligible';
        else if (annual <= 600000) bracket = 'Missing middle';
        else if (annual <= 1200000) bracket = 'Self-funding';

        let capacity = Math.max(0, surplus * 0.75);
        if (living === 'away') capacity = Math.max(0, capacity - 2000);
        if (living === 'unsure') capacity = Math.max(0, capacity - 1000);
        if (siblings >= 1) capacity *= 0.7;
        if (siblings >= 2) capacity *= 0.85;
        if (incomeStability === 'variable') capacity *= 0.85;
        if (incomeStability === 'uncertain') capacity *= 0.65;
        if (creditPressure === 'medium') capacity *= 0.9;
        if (creditPressure === 'high') capacity *= 0.7;
        if (studentWork === 'yes') capacity += 1200;
        if (studentWork === 'maybe') capacity += 500;

        const surplusRatio = income > 0 ? surplus / income : 0;
        let riskPoints = 0;
        if (surplus < 0) riskPoints += 5;
        if (surplusRatio < 0.10) riskPoints += 4;
        else if (surplusRatio < 0.25) riskPoints += 2;
        else if (surplusRatio < 0.40) riskPoints += 1;
        if (perCapita < 4000) riskPoints += 3;
        else if (perCapita < 8000) riskPoints += 1;
        if (incomeStability === 'variable') riskPoints += 1;
        if (incomeStability === 'uncertain') riskPoints += 3;
        if (earners === 1) riskPoints += 1;
        if (living === 'away') riskPoints += 2;
        if (living === 'unsure') riskPoints += 1;
        if (siblings >= 1) riskPoints += 1;
        if (siblings >= 2) riskPoints += 1;
        if (emergencyMonths < 1) riskPoints += 2;
        else if (emergencyMonths < 3) riskPoints += 1;
        if (creditPressure === 'medium') riskPoints += 1;
        if (creditPressure === 'high') riskPoints += 3;

        let pressure = 'low';
        if (riskPoints >= 10) pressure = 'severe';
        else if (riskPoints >= 7) pressure = 'high';
        else if (riskPoints >= 4) pressure = 'moderate';
        else if (riskPoints >= 2) pressure = 'manageable';

        const verdicts = {
          severe: { label: 'Your household is already under severe pressure.', cls: 'red' },
          high:   { label: 'Your household is under real pressure right now.', cls: 'red' },
          moderate: { label: 'You have some breathing room — but not much.', cls: 'amber' },
          manageable: { label: 'Your situation is manageable, with care.', cls: 'amber' },
          low:    { label: 'You have meaningful capacity to invest in study.', cls: 'green' }
        };
        const v = verdicts[pressure];
        qs(page,'#rcVerdict').textContent = v.label;
        qs(page,'#rcVerdict').className = 'verdict ' + v.cls;
        qs(page,'#rcAnnualIncome').textContent = formatR(annual);
        qs(page,'#rcBracket').textContent = bracket;
        qs(page,'#rcSurplus').textContent = formatR(surplus);
        qs(page,'#rcCapacity').textContent = formatR(capacity) + '/mo';

        const body = {
          severe: `Your essential expenses and debt already exceed or nearly consume your income. A monthly surplus of ${formatR(surplus)} cannot safely absorb study costs without restructuring existing pressure first.`,
          high: `Your monthly surplus is roughly ${formatR(surplus)}, which is a thin margin given a household of ${dependents}. Full-time university with residence is likely to stretch this severely.`,
          moderate: `You have a workable surplus of ${formatR(surplus)} a month, but it is not generous given ${dependents} dependents. Careful institution choice and funding strategy matter significantly.`,
          manageable: `A surplus of ${formatR(surplus)} a month gives you options, but the True Cost Calculator will show how quickly that margin can disappear once all study costs are included.`,
          low: `Your household has meaningful capacity. The question is less about affordability and more about whether the chosen path is the right fit.`
        }[pressure];
        qs(page,'#rcVerdictBody').textContent = body;

        const implications = [];
        if (bracket === 'NSFAS-eligible') implications.push('You appear to fall under the NSFAS household income threshold. Apply early and verify the current threshold and requirements directly at nsfas.org.za.');
        if (bracket === 'Missing middle') implications.push('You are in the missing-middle band. Focus on merit funding, sector bursaries, lower-cost routes and careful debt exposure.');
        if (debts > income * 0.25) implications.push(`Your debt repayments are over 25% of monthly income (${formatR(debts)}). Adding a study loan on top carries significant risk.`);
        if (earners === 1 && incomeStability !== 'stable') implications.push('A single, unstable income source makes long study commitments riskier. Prioritise flexible or lower-cost routes unless funding is secured.');
        if (incomeStability === 'uncertain') implications.push('Your income is uncertain. Treat any long-term loan or residence commitment as high risk until income is more predictable.');
        if (emergencyMonths < 1) implications.push('You have less than one month of emergency savings. Build a small buffer before committing to upfront fees, deposits or accommodation contracts.');
        if (creditPressure === 'high') implications.push('You selected high credit pressure. Avoid assuming private student loans will solve the gap — they may deepen household strain.');
        if (studentWork === 'yes') implications.push('Part-time work may improve affordability, but only if the programme timetable and transport reality allow it. Do not overestimate this contribution.');
        if (living === 'away' && pressure !== 'low') implications.push('Living away from home adds a significant monthly cost. At-home, distance, or TVET options deserve serious comparison.');
        if (siblings >= 1) implications.push('Sibling overlap could change affordability later. Plan as a family pipeline, not a one-off decision.');
        if (capacity < 3000 && capacity > 0) implications.push(`Your realistic study capacity (${formatR(capacity)}/mo) is below many full-time degree commitments.`);

        renderList(qs(page,'#rcImplications'), implications);
        dharmaStore.set('reality', { income, dependents, earners, expenses, debts, living, siblings, incomeStability, studentWork, emergencyMonths, creditPressure, annual, surplus, capacity, bracket, pressure, riskPoints });
        result.classList.remove('hidden');
        result.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    }

    // ─── TOOL 2: TRUE COST CALCULATOR ─────────────────────────────────────────────
    function initCostCalculator(page) {
      const form = qs(page, '#costForm');
      const result = qs(page, '#costResult');
      const inputs = qs(page, '#costInputs');
      if (!form || !result || !inputs) return false;
      const costFields = [
        ['tuition','Tuition fees','e.g. 65000'],['reg','Registration & admin fees','e.g. 6000'],
        ['accom','Accommodation','e.g. 60000'],['food','Food & groceries','e.g. 36000'],
        ['transport','Transport','e.g. 14000'],['books','Books and materials','e.g. 6000'],
        ['devices','Devices','e.g. 5000'],['data','Data & internet','e.g. 6000'],
        ['personal','Personal & social','e.g. 6000'],['other','Other','e.g. 4000']
      ];
      qs(page,'#costInputs').innerHTML = costFields.map(([id,label,ph]) => moneyInput(id,label,ph)).join('');

      const presets = {
        'uni-public-home':{ tuition:65000,reg:6000,accom:0,food:18000,transport:18000,books:6500,devices:9000,data:7200,personal:6000,other:3000 },
        'uni-public-res': { tuition:65000,reg:6000,accom:65000,food:42000,transport:16000,books:6500,devices:9000,data:7200,personal:8000,other:4000 },
        'uni-honours':    { tuition:55000,reg:5000,accom:60000,food:42000,transport:16000,books:5500,devices:6000,data:7200,personal:8000,other:4000 },
        'uni-private':    { tuition:120000,reg:9000,accom:60000,food:42000,transport:16000,books:7500,devices:9000,data:7200,personal:8000,other:5000 },
        'tvet-home':      { tuition:18000,reg:2500,accom:0,food:14000,transport:12000,books:3500,devices:6000,data:4800,personal:4500,other:2000 },
        'tvet-away':      { tuition:18000,reg:2500,accom:38000,food:30000,transport:12000,books:3500,devices:6000,data:4800,personal:5000,other:2500 },
        online:           { tuition:35000,reg:3000,accom:0,food:0,transport:0,books:4000,devices:9000,data:8400,personal:0,other:2000 },
        trade:            { tuition:25000,reg:2500,accom:24000,food:24000,transport:10000,books:3000,devices:4000,data:4800,personal:4500,other:2500 },
        bridging:         { tuition:45000,reg:5000,accom:45000,food:32000,transport:14000,books:4500,devices:8000,data:6000,personal:6000,other:3000 }
      };

      qs(page,'#pathwayType').addEventListener('change', e => {
        const p = presets[e.target.value]; if (!p) return;
        Object.entries(p).forEach(([id,val]) => { const el = qs(page,'#'+id); if (el) el.value = val; });
      });

      form.addEventListener('reset', () => { result.classList.add('hidden'); setTimeout(() => { const p = qs(page,'#pathwayType'); if (p) p.value=''; }, 0); });
      form.addEventListener('submit', e => {
        e.preventDefault();
        const get = id => +qs(page,'#'+id).value || 0;
        const values = Object.fromEntries(costFields.map(([id]) => [id, get(id)]));
        const totalAnnual = Object.values(values).reduce((a,b)=>a+b,0);
        const programmeYears = +qs(page,'#programmeYears').value || 1;
        const repeatRisk = +qs(page,'#repeatRisk').value || 0;
        const registrationAndSetup = values.reg + values.devices + Math.round(values.accom/12) + Math.round(values.food/12) + Math.round(values.transport/12) + Math.round(values.data/12);
        const programmeTotalBeforeFunding = totalAnnual * (programmeYears + repeatRisk);
        const bursary = get('bursary'), nsfasVal = get('nsfas'), studentInc = get('studentInc'), external = get('external');
        const annualFunding = bursary + nsfasVal + studentInc*12 + external*12;
        const netAnnual = Math.max(0, totalAnnual - annualFunding);
        const netMonthly = netAnnual / 12;
        const tuitionShare = totalAnnual > 0 ? Math.round((values.tuition / totalAnnual) * 100) : 0;
        const programmeFunding = annualFunding * programmeYears;
        const programmeTotal = Math.max(0, programmeTotalBeforeFunding - programmeFunding);
        const reality = dharmaStore.get('reality');

        let verdict = 'Here is the real number.', cls = '', body;
        body = `The full annual cost is ${formatR(totalAnnual)}. After funding, the household needs to find ${formatR(netMonthly)} every month.`;
        if (reality && reality.capacity > 0) {
          const ratio = netMonthly / reality.capacity;
          if (ratio <= 0.6)      { verdict = 'This pathway fits comfortably within your capacity.'; cls = 'green'; }
          else if (ratio <= 1.0) { verdict = 'This pathway is workable — but uses most of your margin.'; cls = 'amber'; }
          else if (ratio <= 1.4) { verdict = 'This pathway exceeds your honest capacity.'; cls = 'red'; }
          else                   { verdict = 'This pathway is well beyond what your household can carry.'; cls = 'red'; }
          body = `The household needs ${formatR(netMonthly)} a month after funding. Your Reality Check capacity is ${formatR(reality.capacity)}/month.`;
        }

        qs(page,'#costVerdict').textContent = verdict;
        qs(page,'#costVerdict').className = 'verdict ' + cls;
        qs(page,'#costVerdictBody').textContent = body;
        qs(page,'#totalAnnual').textContent = formatR(totalAnnual);
        qs(page,'#netAnnual').textContent = formatR(netAnnual);
        qs(page,'#netMonthly').textContent = formatR(netMonthly);
        qs(page,'#tuitionShare').textContent = tuitionShare + '%';
        qs(page,'#firstMonthCost').textContent = formatR(registrationAndSetup);
        qs(page,'#programmeTotal').textContent = formatR(programmeTotal);

        const impls = [];
        if (tuitionShare > 0 && tuitionShare < 50) impls.push(`Tuition is only ${tuitionShare}% of the true cost. Living costs are carrying most of the burden.`);
        if (values.accom > 0) impls.push(`Accommodation is adding ${formatR(values.accom)} per year. Compare this against a living-at-home version before committing.`);
        if (registrationAndSetup > netMonthly * 1.8 && totalAnnual > 0) impls.push(`The first-month cash need (${formatR(registrationAndSetup)}) is much higher than the average monthly cost. Registration, deposits, devices and first-month living costs often arrive together.`);
        if (repeatRisk >= 0.5) impls.push(`Your repeat/delay risk setting adds a buffer. A ${programmeYears}-year qualification could financially behave closer to ${programmeYears + repeatRisk} years.`);
        if (values.devices === 0 && values.tuition > 0) impls.push('You have not budgeted for a device. Most study paths require a working laptop.');
        if (values.data === 0 && values.tuition > 0) impls.push('You have not budgeted for data or internet. This is a core study cost.');
        if (annualFunding === 0 && totalAnnual > 100000) impls.push('No funding has been entered. Apply for every bursary, loan or sector support option before committing.');
        if (programmeTotal > 300000) impls.push(`Full-programme exposure is estimated at ${formatR(programmeTotal)}. Treat this as a family-level commitment, not a one-year fee decision.`);
        if (!impls.length) impls.push('Numbers look reasonable. Move to Route Compare to test this against another pathway.');

        renderList(qs(page,'#costImplications'), impls);
        dharmaStore.set('cost', { totalAnnual, netAnnual, netMonthly, tuitionShare, firstMonthCost: registrationAndSetup, programmeYears, repeatRisk, programmeTotal, breakdown: values });
        renderResidenceRisk(qs(page, '#costResidenceRisk'), dharmaStore.get('reality'), dharmaStore.get('cost'));
        renderFundingGuidance(qs(page, '#costFundingGuidance'), dharmaStore.get('reality'), dharmaStore.get('cost'), dharmaStore.get('fit'));
        result.classList.remove('hidden');
        result.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    }

    // ─── TOOL 3: ROUTE COMPARE ────────────────────────────────────────────────────
    function routeInputs(k) {
      return `
        <div class="form-group"><label for="${k}Name">Short label</label><input type="text" id="${k}Name" placeholder="e.g. BCom at UJ" required /></div>
        <div class="form-group"><label for="${k}Qual">Qualification type</label><select id="${k}Qual" required><option value="">Select…</option><option value="hcert">Higher Certificate</option><option value="acert">Advanced Certificate</option><option value="diploma">Diploma</option><option value="adip">Advanced Diploma</option><option value="bachelor">Bachelor’s Degree</option><option value="hons">Honours</option><option value="pgdip">Postgraduate Diploma</option><option value="masters">Master’s</option><option value="phd">Doctorate</option><option value="ncv">TVET</option><option value="trade">Trade / apprenticeship</option></select></div>
        <div class="form-group"><label for="${k}Duration">Duration in years</label><select id="${k}Duration" required><option value="">Select…</option><option value="1">1</option><option value="2">2</option><option value="3">3</option><option value="4">4</option><option value="5">5</option><option value="6">6</option></select></div>
        ${moneyInput(k+'Cost','Total cost across all years','e.g. 480000')}
        <div class="form-group"><label>Funding &amp; support secured</label><div class="segmented"><input type="radio" id="${k}SupNone" name="${k}Sup" value="0" checked /><label for="${k}SupNone">None</label><input type="radio" id="${k}SupSome" name="${k}Sup" value="50" /><label for="${k}SupSome">Some</label><input type="radio" id="${k}SupFull" name="${k}Sup" value="100" /><label for="${k}SupFull">Full</label></div></div>
        <div class="form-group"><label for="${k}FundingCertainty">Funding certainty</label><select id="${k}FundingCertainty"><option value="25">Not applied / uncertain</option><option value="50">Applied, outcome pending</option><option value="75">Likely / partially confirmed</option><option value="100">Confirmed in writing</option></select></div>
        <div class="form-group"><label for="${k}Admission">Admission realism</label><select id="${k}Admission"><option value="25">Stretch — may not meet entry requirements</option><option value="50">Possible — borderline or competitive</option><option value="75">Likely — requirements mostly met</option><option value="100">Confirmed / already accepted</option></select></div>
        <div class="form-group"><label for="${k}Accreditation">Accreditation confidence</label><select id="${k}Accreditation"><option value="30">Unverified / not sure</option><option value="60">Looks legitimate, but not checked</option><option value="85">Checked on official source</option><option value="100">Checked + leads to required registration</option></select></div>
        <div class="form-group"><label for="${k}Completion">Completion confidence</label><select id="${k}Completion"><option value="35">High dropout/repeat risk</option><option value="55">Moderate risk</option><option value="75">Reasonable confidence</option><option value="90">Strong support + strong fit</option></select></div>
        <div class="form-group"><label for="${k}WorkIntegrated">Workplace learning / practical exposure</label><select id="${k}WorkIntegrated"><option value="40">None built in</option><option value="60">Optional / student must find it</option><option value="80">Required but not guaranteed</option><option value="100">Built-in or employer-linked</option></select></div>
        <div class="slider-group"><div class="slider-header"><span class="slider-label">Job certainty after completion</span><span class="slider-value" id="${k}JobOut">50%</span></div><input type="range" id="${k}Job" min="0" max="100" value="50" /><div class="slider-helper">Honest read: how confident are you of work in this field?</div></div>
      `;
    }



    const routeTemplates = [
      { title:'University residence vs living at home', description:'Compares the same public university path with and without accommodation costs.', a:{name:'Public university with residence',qual:'bachelor',duration:3,cost:480000,support:0,fundingCertainty:25,admission:75,accreditation:85,completion:65,workIntegrated:40,job:55}, b:{name:'Public university living at home',qual:'bachelor',duration:3,cost:270000,support:0,fundingCertainty:25,admission:75,accreditation:85,completion:70,workIntegrated:40,job:55} },
      { title:'University degree vs TVET diploma', description:'Tests a traditional degree against a lower-cost technical or vocational route.', a:{name:'Public university degree',qual:'bachelor',duration:3,cost:360000,support:0,fundingCertainty:25,admission:65,accreditation:85,completion:60,workIntegrated:40,job:55}, b:{name:'TVET diploma / NATED route',qual:'ncv',duration:3,cost:90000,support:50,fundingCertainty:50,admission:85,accreditation:75,completion:70,workIntegrated:75,job:60} },
      { title:'Private college vs public university', description:'Compares a higher-fee private route against a public university alternative.', a:{name:'Private college route',qual:'diploma',duration:3,cost:420000,support:0,fundingCertainty:25,admission:85,accreditation:60,completion:65,workIntegrated:55,job:55}, b:{name:'Public university route',qual:'bachelor',duration:3,cost:330000,support:0,fundingCertainty:25,admission:65,accreditation:85,completion:60,workIntegrated:40,job:55} },
      { title:'Distance study vs full-time campus', description:'Compares lower-cost distance learning with a full-time campus route.', a:{name:'Online / distance study',qual:'bachelor',duration:4,cost:150000,support:0,fundingCertainty:25,admission:80,accreditation:80,completion:50,workIntegrated:35,job:50}, b:{name:'Full-time campus study',qual:'bachelor',duration:3,cost:360000,support:0,fundingCertainty:25,admission:70,accreditation:85,completion:65,workIntegrated:45,job:55} },
      { title:'BEng degree vs UoT engineering diploma', description:'Compares a direct professional engineering route with a practical diploma route.', a:{name:'BEng degree',qual:'bachelor',duration:4,cost:520000,support:0,fundingCertainty:25,admission:45,accreditation:90,completion:55,workIntegrated:55,job:75}, b:{name:'UoT engineering diploma',qual:'diploma',duration:3,cost:240000,support:0,fundingCertainty:25,admission:70,accreditation:85,completion:65,workIntegrated:80,job:70} },
      { title:'BCom CA route vs accounting diploma', description:'Compares the long CA route with a faster accounting clerk or diploma route.', a:{name:'BCom CA route',qual:'hons',duration:4,cost:430000,support:0,fundingCertainty:25,admission:55,accreditation:90,completion:55,workIntegrated:70,job:75}, b:{name:'Accounting diploma / clerk route',qual:'diploma',duration:2,cost:90000,support:0,fundingCertainty:25,admission:85,accreditation:75,completion:75,workIntegrated:70,job:60} },
      { title:'Medicine dream vs allied health / nursing', description:'Compares a high-barrier medicine route with a more accessible health route.', a:{name:'Medicine route',qual:'bachelor',duration:6,cost:750000,support:0,fundingCertainty:25,admission:35,accreditation:90,completion:55,workIntegrated:85,job:85}, b:{name:'Nursing / allied health route',qual:'bachelor',duration:4,cost:320000,support:50,fundingCertainty:50,admission:65,accreditation:85,completion:70,workIntegrated:80,job:75} },
      { title:'Degree first vs work-and-study route', description:'Compares a full-time degree with an earn-while-learning pathway.', a:{name:'Full-time degree first',qual:'bachelor',duration:3,cost:360000,support:0,fundingCertainty:25,admission:70,accreditation:85,completion:65,workIntegrated:40,job:55}, b:{name:'Work-and-study route',qual:'diploma',duration:4,cost:120000,support:0,fundingCertainty:50,admission:85,accreditation:75,completion:70,workIntegrated:85,job:65} }
    ];

    function applyRouteTemplate(page, template) {
      fillRouteOption(page, 'a', template.a);
      fillRouteOption(page, 'b', template.b);
      const result = qs(page, '#routeResult');
      if (result) result.classList.add('hidden');
      const form = qs(page, '#routeForm');
      if (form) form.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    function fillRouteOption(page, prefix, route) {
      const setValue = (suffix, value) => { const el = qs(page, '#' + prefix + suffix); if (el) el.value = value; };
      setValue('Name', route.name); setValue('Qual', route.qual); setValue('Duration', route.duration); setValue('Cost', route.cost);
      setValue('FundingCertainty', route.fundingCertainty); setValue('Admission', route.admission); setValue('Accreditation', route.accreditation); setValue('Completion', route.completion); setValue('WorkIntegrated', route.workIntegrated); setValue('Job', route.job);
      const supportRadio = qs(page, `input[name="${prefix}Sup"][value="${route.support}"]`);
      if (supportRadio) supportRadio.checked = true;
      const jobOut = qs(page, '#' + prefix + 'JobOut');
      if (jobOut) jobOut.textContent = route.job + '%';
    }

    function readRoute(page, prefix) {
      return {
        name: qs(page,'#'+prefix+'Name').value || prefix.toUpperCase(),
        qual: qs(page,'#'+prefix+'Qual').value,
        duration: +qs(page,'#'+prefix+'Duration').value,
        cost: +qs(page,'#'+prefix+'Cost').value,
        support: +qs(page,`input[name="${prefix}Sup"]:checked`).value,
        fundingCertainty: +qs(page,'#'+prefix+'FundingCertainty').value,
        admission: +qs(page,'#'+prefix+'Admission').value,
        accreditation: +qs(page,'#'+prefix+'Accreditation').value,
        completion: +qs(page,'#'+prefix+'Completion').value,
        workIntegrated: +qs(page,'#'+prefix+'WorkIntegrated').value,
        job: +qs(page,'#'+prefix+'Job').value
      };
    }

    function scoreRoute(r) {
      const costScore = Math.max(0, 100 - (r.cost / 8000));
      const durationScore = Math.max(0, 100 - r.duration * 12);
      const exposure = r.cost * (1 - r.support / 100);
      const total = costScore*0.18 + durationScore*0.08 + r.support*0.10 + r.fundingCertainty*0.10 +
                    r.admission*0.10 + r.accreditation*0.12 + r.completion*0.12 + r.workIntegrated*0.08 + r.job*0.12;
      return { costScore, durationScore, exposure, total };
    }

    function edge(aName, bName, aVal, bVal, mode) {
      if (aVal === bVal) return 'Tied';
      return mode === 'lower' ? (aVal < bVal ? aName : bName) : (aVal > bVal ? aName : bName);
    }


    function submitRouteCompareForm(page) {
      const result = qs(page,'#routeResult');
      if (!result) return false;

      const qualLabels = { hcert:'Higher Certificate', acert:'Advanced Certificate', diploma:'Diploma', adip:'Advanced Diploma', bachelor:"Bachelor’s", hons:'Honours', pgdip:'PG Diploma', masters:"Master’s", phd:'Doctorate', ncv:'TVET', trade:'Trade' };
      const a = readRoute(page,'a'), b = readRoute(page,'b');
      const sa = scoreRoute(a), sb = scoreRoute(b);
      qs(page,'#thA').textContent = a.name;
      qs(page,'#thB').textContent = b.name;

      const rows = [
        ['Qualification level', qualLabels[a.qual]||'—', qualLabels[b.qual]||'—', '—'],
        ['Total cost', formatR(a.cost), formatR(b.cost), edge(a.name,b.name,a.cost,b.cost,'lower')],
        ['Time invested', a.duration+' years', b.duration+' years', edge(a.name,b.name,a.duration,b.duration,'lower')],
        ['Funding secured', a.support+'%', b.support+'%', edge(a.name,b.name,a.support,b.support,'higher')],
        ['Funding certainty', a.fundingCertainty+'/100', b.fundingCertainty+'/100', edge(a.name,b.name,a.fundingCertainty,b.fundingCertainty,'higher')],
        ['Admission realism', a.admission+'/100', b.admission+'/100', edge(a.name,b.name,a.admission,b.admission,'higher')],
        ['Accreditation confidence', a.accreditation+'/100', b.accreditation+'/100', edge(a.name,b.name,a.accreditation,b.accreditation,'higher')],
        ['Completion confidence', a.completion+'/100', b.completion+'/100', edge(a.name,b.name,a.completion,b.completion,'higher')],
        ['Workplace exposure', a.workIntegrated+'/100', b.workIntegrated+'/100', edge(a.name,b.name,a.workIntegrated,b.workIntegrated,'higher')],
        ['Job certainty', a.job+'%', b.job+'%', edge(a.name,b.name,a.job,b.job,'higher')],
        ['Out-of-pocket exposure', formatR(sa.exposure), formatR(sb.exposure), edge(a.name,b.name,sa.exposure,sb.exposure,'lower')],
        ['Overall safety score', Math.round(sa.total)+'/100', Math.round(sb.total)+'/100', Math.abs(sa.total-sb.total)<5?'Tied':(sa.total>sb.total?a.name:b.name)]
      ];

      qs(page,'#compareTbody').innerHTML = rows.map(r =>
        `<tr><td>${r[0]}</td><td class="${r[3]===a.name?'winner':''}">${r[1]}</td><td class="${r[3]===b.name?'winner':''}">${r[2]}</td><td>${r[3]}</td></tr>`
      ).join('');

      const diff = sa.total - sb.total;
      let verdict, body;
      if (Math.abs(diff) < 5) { verdict = `${a.name} and ${b.name} are roughly equivalent.`; body = 'Neither is meaningfully safer. Fit and household preference should decide.'; }
      else if (diff > 0) { verdict = `${a.name} is the safer route on these inputs.`; body = `${a.name} scores ${Math.round(sa.total)}/100 vs ${Math.round(sb.total)}/100 for ${b.name}.`; }
      else { verdict = `${b.name} is the safer route on these inputs.`; body = `${b.name} scores ${Math.round(sb.total)}/100 vs ${Math.round(sa.total)}/100 for ${a.name}.`; }
      qs(page,'#routeVerdict').textContent = verdict;
      qs(page,'#routeVerdict').className = 'verdict ' + (Math.abs(diff)<5?'amber':'green');
      qs(page,'#routeVerdictBody').textContent = body;

      const impls = [];
      const reality = dharmaStore.get('reality');
      if (reality && reality.capacity > 0) {
        const aM = sa.exposure/(a.duration*12), bM = sb.exposure/(b.duration*12);
        if (aM>reality.capacity||bM>reality.capacity) impls.push(`Monthly check: ${a.name} needs ~${formatR(aM)}/mo, ${b.name} needs ~${formatR(bM)}/mo, against your capacity of ${formatR(reality.capacity)}/mo.`);
      }
      if (a.duration>4||b.duration>4) impls.push('Programmes longer than four years carry greater dropout and cost-overrun risk.');
      if (a.job<50||b.job<50) impls.push('One route has below-50% job certainty. Treat that as high-risk unless you have specific evidence.');
      if (a.accreditation<60||b.accreditation<60) impls.push('One route has unverified accreditation. Do not pay deposits until official accreditation is confirmed.');
      if (a.admission<50||b.admission<50) impls.push('One route is a stretch for admission. Have a backup route ready before relying on it.');
      if (a.fundingCertainty<50||b.fundingCertainty<50) impls.push('One route depends on uncertain funding. Treat it as provisional until confirmed in writing.');
      if (a.completion<55||b.completion<55) impls.push('One route has high completion risk. Ask about support structures, repeat-year costs and pass rates.');
      if (a.workIntegrated<60||b.workIntegrated<60) impls.push('One route has weak workplace exposure. This can make first-job entry harder even with the qualification.');
      if (sa.exposure>300000||sb.exposure>300000) impls.push('One or both options carry over R300,000 of exposure. Make sure earning potential justifies the debt.');
      if (!impls.length) impls.push('Both routes look broadly reasonable. Career Fit is now the deciding factor.');

      renderList(qs(page,'#routeImplications'), impls);
      dharmaStore.set('compare', { a, b, sa, sb });
      result.classList.remove('hidden');
      result.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return true;
    }

    function initRouteCompare(page) {
      const routeA = qs(page,'#routeA');
      const routeB = qs(page,'#routeB');
      const form = qs(page,'#routeForm');
      const result = qs(page,'#routeResult');
      if (!routeA || !routeB || !form || !result) return false;

      routeA.innerHTML = routeInputs('a');
      routeB.innerHTML = routeInputs('b');
      const templateGrid = qs(page, '#routeTemplateGrid');
      if (templateGrid) {
        templateGrid.innerHTML = routeTemplates.map((template, index) => `<button type="button" class="template-card" data-template-index="${index}"><strong>${template.title}</strong><span>${template.description}</span></button>`).join('');
        templateGrid.addEventListener('click', (e) => {
          const card = e.target.closest('[data-template-index]');
          if (!card) return;
          applyRouteTemplate(page, routeTemplates[+card.dataset.templateIndex]);
        });
      }

      ['a','b'].forEach(k => {
        const slider = qs(page,'#'+k+'Job'), out = qs(page,'#'+k+'JobOut');
        slider.addEventListener('input', () => out.textContent = slider.value + '%');
      });

      const qualLabels = { hcert:'Higher Certificate', acert:'Advanced Certificate', diploma:'Diploma', adip:'Advanced Diploma', bachelor:"Bachelor’s", hons:'Honours', pgdip:'PG Diploma', masters:"Master’s", phd:'Doctorate', ncv:'TVET', trade:'Trade' };
      form.addEventListener('reset', () => { result.classList.add('hidden'); qs(page,'#aJobOut').textContent='50%'; qs(page,'#bJobOut').textContent='50%'; });
      form.addEventListener('submit', e => {
        e.preventDefault();
        const a = readRoute(page,'a'), b = readRoute(page,'b');
        const sa = scoreRoute(a), sb = scoreRoute(b);
        qs(page,'#thA').textContent = a.name;
        qs(page,'#thB').textContent = b.name;

        const rows = [
          ['Qualification level', qualLabels[a.qual]||'—', qualLabels[b.qual]||'—', '—'],
          ['Total cost', formatR(a.cost), formatR(b.cost), edge(a.name,b.name,a.cost,b.cost,'lower')],
          ['Time invested', a.duration+' years', b.duration+' years', edge(a.name,b.name,a.duration,b.duration,'lower')],
          ['Funding secured', a.support+'%', b.support+'%', edge(a.name,b.name,a.support,b.support,'higher')],
          ['Funding certainty', a.fundingCertainty+'/100', b.fundingCertainty+'/100', edge(a.name,b.name,a.fundingCertainty,b.fundingCertainty,'higher')],
          ['Admission realism', a.admission+'/100', b.admission+'/100', edge(a.name,b.name,a.admission,b.admission,'higher')],
          ['Accreditation confidence', a.accreditation+'/100', b.accreditation+'/100', edge(a.name,b.name,a.accreditation,b.accreditation,'higher')],
          ['Completion confidence', a.completion+'/100', b.completion+'/100', edge(a.name,b.name,a.completion,b.completion,'higher')],
          ['Workplace exposure', a.workIntegrated+'/100', b.workIntegrated+'/100', edge(a.name,b.name,a.workIntegrated,b.workIntegrated,'higher')],
          ['Job certainty', a.job+'%', b.job+'%', edge(a.name,b.name,a.job,b.job,'higher')],
          ['Out-of-pocket exposure', formatR(sa.exposure), formatR(sb.exposure), edge(a.name,b.name,sa.exposure,sb.exposure,'lower')],
          ['Overall safety score', Math.round(sa.total)+'/100', Math.round(sb.total)+'/100', Math.abs(sa.total-sb.total)<5?'Tied':(sa.total>sb.total?a.name:b.name)]
        ];

        qs(page,'#compareTbody').innerHTML = rows.map(r =>
          `<tr><td>${r[0]}</td><td class="${r[3]===a.name?'winner':''}">${r[1]}</td><td class="${r[3]===b.name?'winner':''}">${r[2]}</td><td>${r[3]}</td></tr>`
        ).join('');

        const diff = sa.total - sb.total;
        let verdict, body;
        if (Math.abs(diff) < 5) { verdict = `${a.name} and ${b.name} are roughly equivalent.`; body = 'Neither is meaningfully safer. Fit and household preference should decide.'; }
        else if (diff > 0) { verdict = `${a.name} is the safer route on these inputs.`; body = `${a.name} scores ${Math.round(sa.total)}/100 vs ${Math.round(sb.total)}/100 for ${b.name}.`; }
        else { verdict = `${b.name} is the safer route on these inputs.`; body = `${b.name} scores ${Math.round(sb.total)}/100 vs ${Math.round(sa.total)}/100 for ${a.name}.`; }
        qs(page,'#routeVerdict').textContent = verdict;
        qs(page,'#routeVerdict').className = 'verdict ' + (Math.abs(diff)<5?'amber':'green');
        qs(page,'#routeVerdictBody').textContent = body;

        const impls = [];
        const reality = dharmaStore.get('reality');
        if (reality && reality.capacity > 0) {
          const aM = sa.exposure/(a.duration*12), bM = sb.exposure/(b.duration*12);
          if (aM>reality.capacity||bM>reality.capacity) impls.push(`Monthly check: ${a.name} needs ~${formatR(aM)}/mo, ${b.name} needs ~${formatR(bM)}/mo, against your capacity of ${formatR(reality.capacity)}/mo.`);
        }
        if (a.duration>4||b.duration>4) impls.push('Programmes longer than four years carry greater dropout and cost-overrun risk.');
        if (a.job<50||b.job<50) impls.push('One route has below-50% job certainty. Treat that as high-risk unless you have specific evidence.');
        if (a.accreditation<60||b.accreditation<60) impls.push('One route has unverified accreditation. Do not pay deposits until official accreditation is confirmed.');
        if (a.admission<50||b.admission<50) impls.push('One route is a stretch for admission. Have a backup route ready before relying on it.');
        if (a.fundingCertainty<50||b.fundingCertainty<50) impls.push('One route depends on uncertain funding. Treat it as provisional until confirmed in writing.');
        if (a.completion<55||b.completion<55) impls.push('One route has high completion risk. Ask about support structures, repeat-year costs and pass rates.');
        if (a.workIntegrated<60||b.workIntegrated<60) impls.push('One route has weak workplace exposure. This can make first-job entry harder even with the qualification.');
        if (sa.exposure>300000||sb.exposure>300000) impls.push('One or both options carry over R300,000 of exposure. Make sure earning potential justifies the debt.');
        if (!impls.length) impls.push('Both routes look broadly reasonable. Career Fit is now the deciding factor.');

        renderList(qs(page,'#routeImplications'), impls);
        dharmaStore.set('compare', { a, b, sa, sb });
        result.classList.remove('hidden');
        result.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    }

    // ─── TOOL 4: CAREER FIT CHECK ─────────────────────────────────────────────────
    const sliderDefs = [
      ['iAna','Analytical & problem-solving','data, logic, numbers, debugging'],
      ['iCre','Creative & expressive','design, writing, music, storytelling'],
      ['iPeo','People & communication','teaching, persuasion, coaching'],
      ['iHan','Hands-on & practical','building, fixing, physical work'],
      ['iCar','Care & service','health, social work, helping'],
      ['iEnt','Entrepreneurial & risk-taking','starting things, selling, deals'],
      ['wFlex','Structure ←→ Flexibility','0 = predictable; 100 = open-ended'],
      ['wTeam','Solo ←→ Team','0 = alone; 100 = team-driven'],
      ['wOut','Indoor ←→ Outdoor','0 = desk; 100 = field/site'],
      ['wRisk','Stable salary ←→ Variable upside','0 = security; 100 = upside']
    ];

    const careers = [
      { title:'Software development & data', blurb:'Building apps, sites, systems, and analysing data.', scores:{iAna:9,iCre:6,iPeo:3,iHan:4,iCar:2,iEnt:6,wFlex:7,wTeam:6,wOut:1,wRisk:6}, readiness:{math:60,english:50,overall:55}, routes:'BSc/BCom IT, Diploma in IT, self-taught + portfolio, online bootcamps (e.g. WeThinkCode_, CodeSpace Academy, HyperionDev).' },
      { title:'Engineering', blurb:'Designing and building physical systems. Strong demand in several SA sectors.', scores:{iAna:9,iCre:5,iPeo:4,iHan:8,iCar:3,iEnt:4,wFlex:4,wTeam:7,wOut:6,wRisk:4}, readiness:{math:70,science:65,overall:65}, routes:'BEng, BSc Eng, or Diploma route via a University of Technology.' },
      { title:'Trades', blurb:'Electrical, plumbing, mechanical, welding and artisan routes.', scores:{iAna:5,iCre:3,iPeo:3,iHan:10,iCar:3,iEnt:7,wFlex:6,wTeam:5,wOut:7,wRisk:6}, readiness:{math:40,overall:40}, routes:'TVET NCV/NATED + apprenticeship leading to QCTO trade test.' },
      { title:'Health professions', blurb:'Doctors, nurses, allied health and care-related professions.', scores:{iAna:7,iCre:3,iPeo:8,iHan:6,iCar:10,iEnt:2,wFlex:3,wTeam:7,wOut:3,wRisk:2}, readiness:{math:60,science:60,english:55,lifeScience:60,overall:65}, routes:'MBChB, BNursing, allied health degrees, support-role certificates. Note: NSFAS does not fund some private nursing programmes — verify before applying.' },
      { title:'Teaching & education', blurb:'School teaching, ECD, training and education support.', scores:{iAna:5,iCre:6,iPeo:9,iHan:3,iCar:9,iEnt:2,wFlex:4,wTeam:6,wOut:3,wRisk:1}, readiness:{english:50,overall:50}, routes:'BEd, Diploma in Education, PGCE routes.' },
      { title:'Finance, accounting & actuarial', blurb:'Stable, structured and well-defined professional routes.', scores:{iAna:9,iCre:2,iPeo:5,iHan:1,iCar:3,iEnt:5,wFlex:3,wTeam:6,wOut:1,wRisk:4}, readiness:{math:55,accounting:55,english:50,overall:55}, routes:'BCom, CA(SA) stream, SAIPA, CIMA, diploma and bookkeeping routes. Note: ICB last NQF enrolment is 30 June 2026.' },
      { title:'Marketing, brand & communications', blurb:'Brand, advertising, PR, content and social.', scores:{iAna:5,iCre:8,iPeo:8,iHan:2,iCar:3,iEnt:7,wFlex:7,wTeam:7,wOut:2,wRisk:6}, readiness:{english:55,overall:50}, routes:'BCom Marketing, BA Communication, IMM Diploma or portfolio route.' },
      { title:'Design & creative production', blurb:'Graphic, UX, fashion, film and content production.', scores:{iAna:4,iCre:10,iPeo:5,iHan:5,iCar:2,iEnt:7,wFlex:9,wTeam:5,wOut:3,wRisk:8}, readiness:{english:45,overall:45}, routes:'BA/Diploma in Design, specialist schools or portfolio route.' },
      { title:'Law & legal services', blurb:'Attorney, advocate, compliance and corporate legal.', scores:{iAna:8,iCre:4,iPeo:7,iHan:1,iCar:4,iEnt:4,wFlex:3,wTeam:5,wOut:1,wRisk:5}, readiness:{english:65,overall:60}, routes:'LLB, BA Law into LLB, articles and admission.' },
      { title:'Entrepreneurship & small business', blurb:'Building your own thing, usually best paired with a marketable skill.', scores:{iAna:6,iCre:7,iPeo:7,iHan:6,iCar:4,iEnt:10,wFlex:9,wTeam:5,wOut:5,wRisk:9}, readiness:{english:45,overall:45}, routes:'Practical exposure, skills training, mentorship and low-overhead tests.' },
      { title:'Hospitality, tourism & events', blurb:'Hotels, lodges, restaurants and events.', scores:{iAna:3,iCre:6,iPeo:9,iHan:6,iCar:6,iEnt:6,wFlex:6,wTeam:8,wOut:5,wRisk:5}, readiness:{english:45,overall:40}, routes:'Hospitality Diploma, TVET, or work-up-from-the-floor.' },
      { title:'Public service, NGO & social work', blurb:'Government, civil society and social impact.', scores:{iAna:6,iCre:4,iPeo:8,iHan:3,iCar:9,iEnt:3,wFlex:4,wTeam:7,wOut:4,wRisk:1}, readiness:{english:55,overall:50}, routes:'BSocSci, BSW, Public Admin diplomas.' },
      { title:'Agriculture, environment & natural sciences', blurb:'Farming, agri-business, conservation and environmental management.', scores:{iAna:7,iCre:3,iPeo:4,iHan:7,iCar:5,iEnt:5,wFlex:5,wTeam:5,wOut:9,wRisk:4}, readiness:{math:50,science:50,lifeScience:55,overall:50}, routes:'BSc Agric, Environmental Science, agricultural college diplomas.' },
      { title:'Logistics, supply chain & operations', blurb:'Moving things and managing systems.', scores:{iAna:7,iCre:3,iPeo:6,iHan:5,iCar:2,iEnt:5,wFlex:4,wTeam:7,wOut:4,wRisk:3}, readiness:{math:45,english:45,overall:45}, routes:'BCom Logistics, Diploma in Logistics, sector-specific certificates.' }
    ];

    function sliderHTML([id,label,helper]) {
      return `<div class="slider-group"><div class="slider-header"><span class="slider-label">${label} <span class="label-helper">${helper}</span></span><span class="slider-value" id="${id}Out">50%</span></div><input type="range" id="${id}" min="0" max="100" value="50" /></div>`;
    }

    function careerScore(career, profile) {
      let total=0, max=0;
      Object.keys(career.scores).forEach(k => { const w=career.scores[k]; total+=w*profile[k]; max+=w*100; });
      return Math.round((total/max)*100);
    }



    function renderReadinessPlan(page, top) {
      const plan = qs(page, '#readinessPlan');
      if (!plan) return;
      const focus = top.find(c => c.readinessScore < 75) || top[0];
      if (!focus) return;
      const steps = buildReadinessSteps(focus);
      plan.innerHTML = `<span class="plan-tag">Readiness improvement plan</span><h4>${focus.title}: how to make this route safer</h4><p>Your fit result should not only warn you about subject or mark gaps. Use this plan to find a safer entry route before committing to a high-cost option.</p><ul>${steps.map(step => `<li>${step}</li>`).join('')}</ul>`;
      plan.classList.remove('hidden');
    }

    function buildReadinessSteps(career) {
      const title = career.title || '';
      const steps = [];
      if (career.readinessNotes && career.readinessNotes.length) steps.push(...career.readinessNotes.slice(0, 3));
      if (title.includes('Engineering')) {
        steps.push('Compare a direct BEng route against a UoT engineering diploma and a TVET NATED technical route.');
        steps.push('Check extended curriculum programme requirements if Maths or Physical Sciences are close but not strong enough for direct entry.');
        steps.push('Speak to both an engineer and an artisan/technician so the student understands the difference between professional engineering and technical engineering work.');
      } else if (title.includes('Health')) {
        steps.push('Compare medicine, nursing, clinical associate, radiography, pharmacy, occupational therapy and emergency medical care before assuming only MBChB is valid.');
        steps.push('Check provincial health bursaries and whether the route includes community service, clinical placement or professional registration.');
      } else if (title.includes('Software') || title.includes('data')) {
        steps.push('Compare BSc Computer Science, BCom Information Systems, Diploma in IT, learnerships and portfolio-based bootcamp routes.');
        steps.push('Build a small portfolio project before committing to an expensive IT route; this tests genuine interest and improves employability.');
      } else if (title.includes('Finance') || title.includes('accounting')) {
        steps.push('Compare the CA route against accounting diploma, SAIPA, CIMA, bookkeeping and clerk routes.');
        steps.push('Ask whether the route requires articles, board exams, CTA/PGDA or professional membership after the qualification.');
      } else if (title.includes('Law')) {
        steps.push('Compare LLB against BA Law, paralegal, compliance, public administration and legal assistant routes.');
        steps.push('Ask about articles availability and graduate placement before assuming the qualification leads directly to legal work.');
      } else if (title.includes('Teaching')) {
        steps.push('Check whether Funza Lushaka or provincial bursary routes apply, especially for maths, science, foundation phase or language teaching.');
        steps.push('Spend time in a classroom or tutoring environment before committing; fit matters as much as marks in education.');
      } else if (title.includes('Trades')) {
        steps.push('Compare TVET NCV, NATED, apprenticeship and trade-test routes before assuming a university degree is needed.');
        steps.push('Ask whether workplace placement is guaranteed or whether the student must find an employer independently.');
      } else {
        steps.push('Compare a degree route against a diploma, certificate, work-and-study or portfolio route.');
        steps.push('Use Route Compare to test the dream route against at least one cheaper and one faster-to-earning alternative.');
      }
      steps.push('Before paying deposits, generate the institution questions and ask about accreditation, full costs, completion rates, employment outcomes and refund policy.');
      return [...new Set(steps)].slice(0, 7);
    }

    function readinessScore(career, marks) {
      if (!career.readiness) return { score:70, notes:[] };
      const checks = career.readiness, keys = Object.keys(checks), notes = [];
      let total=0;
      keys.forEach(key => {
        const required=checks[key], actual=marks[key]||0;
        const component = Math.max(0, Math.min(100, Math.round((actual/required)*100)));
        total += component;
        if (actual===0 && required>=50) notes.push(`${labelForMark(key)} is missing or unknown; this may close some direct-entry routes.`);
        else if (actual<required) notes.push(`${labelForMark(key)} may be below the common readiness level for direct entry. Consider a diploma, bridging, TVET or extended programme route.`);
      });
      const score = keys.length ? Math.round(total/keys.length) : 70;
      if (score>=90) notes.push('Marks entered appear to support direct-entry investigation, but requirements vary by institution.');
      return { score, notes };
    }

    function labelForMark(key) {
      return { math:'Maths', science:'Physical Sciences', english:'English', accounting:'Accounting/Business', lifeScience:'Life Sciences', overall:'Overall average' }[key] || key;
    }


    function submitFitCheckForm(page) {
      const result = qs(page,'#fitResult');
      if (!result) return false;

      const profile={};
      sliderDefs.forEach(([id])=>profile[id]=+qs(page,'#'+id).value);
      const marks={
        math:+qs(page,'#mathMark').value||0, science:+qs(page,'#scienceMark').value||0,
        english:+qs(page,'#englishMark').value||0, accounting:+qs(page,'#accountingMark').value||0,
        lifeScience:+qs(page,'#lifeScienceMark').value||0, overall:+qs(page,'#overallMark').value||0
      };
      const ranked = careers.map(c => {
        const fitScore=careerScore(c,profile), readiness=readinessScore(c,marks);
        const combined=Math.round(fitScore*0.7+readiness.score*0.3);
        return {...c, match:combined, fitScore, readinessScore:readiness.score, readinessNotes:readiness.notes};
      }).sort((a,b)=>b.match-a.match);
      const top=ranked.slice(0,4), topMatch=top[0].match;
      let verdict, cls='green', body;
      if (topMatch>=75) { verdict=`Strong fit signal — your top match is ${top[0].title}.`; body='Your interest and style profile points clearly toward this field. The next few are also worth exploring.'; }
      else if (topMatch>=60) { verdict='Reasonable fit signals across several fields.'; cls='amber'; body='No single field jumps out, but several match meaningfully. Pick the top 2–3 and investigate real day-to-day work.'; }
      else { verdict='Mixed signal — slow down before choosing.'; cls='amber'; body='Your profile did not strongly match any mapped field. Try again with more conviction or seek more career exposure before committing.'; }
      qs(page,'#fitVerdict').textContent=verdict;
      qs(page,'#fitVerdict').className='verdict '+cls;
      qs(page,'#fitVerdictBody').textContent=body;
      qs(page,'#careerList').innerHTML=top.map(c=>`<div class="career-item"><div class="match">${c.match}% overall match · ${c.fitScore}% fit · ${c.readinessScore}% readiness</div><h4>${c.title}</h4><p>${c.blurb}</p><p style="margin-top:0.75rem;font-size:0.85rem;color:rgba(250,247,242,0.65);"><strong>Typical routes in SA:</strong> ${c.routes}</p>${c.readinessNotes.length?`<ul style="margin-top:0.75rem;padding-left:1.2rem;">${c.readinessNotes.map(n=>`<li style="font-size:0.85rem;color:rgba(250,247,242,0.78);">${n}</li>`).join('')}</ul>`:''}</div>`).join('');
      const impls=['This is a sense-check, not a verdict. Job-shadowing, vacation work and conversations with people in the field matter.','The readiness score is not a formal APS calculation. It flags whether your marks support common routes.','Take your top 1–2 matches to Route Compare and test a university route against a TVET/diploma or bridging alternative.'];
      if (profile.iPeo>75&&profile.iCar>70) impls.push('Strong people-and-care signal. Health, education and social work are worth investigating.');
      if (profile.iHan>70&&profile.wOut>60) impls.push('Hands-on plus outdoor preference favours trades, engineering site work, agriculture or skilled construction.');
      renderList(qs(page,'#fitImplications'),impls);
      dharmaStore.set('fit',{profile,marks,top:top.map(c=>c.title),detailedTop:top.map(c=>({title:c.title,match:c.match,fitScore:c.fitScore,readinessScore:c.readinessScore,readinessNotes:c.readinessNotes}))});
      renderReadinessPlan(page, top);
      renderAlternativeFinder(qs(page, '#careerAlternativeFinder'), top[0]?.title || '', true);
      result.classList.remove('hidden');
      result.scrollIntoView({behavior:'smooth',block:'start'});
      return true;
    }

    function initFitCheck(page) {
      const interestWrap = qs(page,'#interestSliders');
      const styleWrap = qs(page,'#styleSliders');
      const form = qs(page,'#fitForm');
      const result = qs(page,'#fitResult');
      if (!interestWrap || !styleWrap || !form || !result) return false;

      const interestIds = ['iAna','iCre','iPeo','iHan','iCar','iEnt'];
      interestWrap.innerHTML = sliderDefs.filter(s=>interestIds.includes(s[0])).map(sliderHTML).join('');
      styleWrap.innerHTML = sliderDefs.filter(s=>!interestIds.includes(s[0])).map(sliderHTML).join('');
      sliderDefs.forEach(([id]) => {
        const s=qs(page,'#'+id), o=qs(page,'#'+id+'Out');
        s.addEventListener('input', ()=>o.textContent=s.value+'%');
      });
      form.addEventListener('reset', ()=>{ result.classList.add('hidden'); sliderDefs.forEach(([id])=>qs(page,'#'+id+'Out').textContent='50%'); });
      form.addEventListener('submit', e => {
        e.preventDefault();
        const profile={};
        sliderDefs.forEach(([id])=>profile[id]=+qs(page,'#'+id).value);
        const marks={
          math:+qs(page,'#mathMark').value||0, science:+qs(page,'#scienceMark').value||0,
          english:+qs(page,'#englishMark').value||0, accounting:+qs(page,'#accountingMark').value||0,
          lifeScience:+qs(page,'#lifeScienceMark').value||0, overall:+qs(page,'#overallMark').value||0
        };
        const ranked = careers.map(c => {
          const fitScore=careerScore(c,profile), readiness=readinessScore(c,marks);
          const combined=Math.round(fitScore*0.7+readiness.score*0.3);
          return {...c, match:combined, fitScore, readinessScore:readiness.score, readinessNotes:readiness.notes};
        }).sort((a,b)=>b.match-a.match);
        const top=ranked.slice(0,4), topMatch=top[0].match;
        let verdict, cls='green', body;
        if (topMatch>=75) { verdict=`Strong fit signal — your top match is ${top[0].title}.`; body='Your interest and style profile points clearly toward this field. The next few are also worth exploring.'; }
        else if (topMatch>=60) { verdict='Reasonable fit signals across several fields.'; cls='amber'; body='No single field jumps out, but several match meaningfully. Pick the top 2–3 and investigate real day-to-day work.'; }
        else { verdict='Mixed signal — slow down before choosing.'; cls='amber'; body='Your profile did not strongly match any mapped field. Try again with more conviction or seek more career exposure before committing.'; }
        qs(page,'#fitVerdict').textContent=verdict;
        qs(page,'#fitVerdict').className='verdict '+cls;
        qs(page,'#fitVerdictBody').textContent=body;
        qs(page,'#careerList').innerHTML=top.map(c=>`<div class="career-item"><div class="match">${c.match}% overall match · ${c.fitScore}% fit · ${c.readinessScore}% readiness</div><h4>${c.title}</h4><p>${c.blurb}</p><p style="margin-top:0.75rem;font-size:0.85rem;color:rgba(250,247,242,0.65);"><strong>Typical routes in SA:</strong> ${c.routes}</p>${c.readinessNotes.length?`<ul style="margin-top:0.75rem;padding-left:1.2rem;">${c.readinessNotes.map(n=>`<li style="font-size:0.85rem;color:rgba(250,247,242,0.78);">${n}</li>`).join('')}</ul>`:''}</div>`).join('');
        const impls=['This is a sense-check, not a verdict. Job-shadowing, vacation work and conversations with people in the field matter.','The readiness score is not a formal APS calculation. It flags whether your marks support common routes.','Take your top 1–2 matches to Route Compare and test a university route against a TVET/diploma or bridging alternative.'];
        if (profile.iPeo>75&&profile.iCar>70) impls.push('Strong people-and-care signal. Health, education and social work are worth investigating.');
        if (profile.iHan>70&&profile.wOut>60) impls.push('Hands-on plus outdoor preference favours trades, engineering site work, agriculture or skilled construction.');
        renderList(qs(page,'#fitImplications'),impls);
        dharmaStore.set('fit',{profile,marks,top:top.map(c=>c.title),detailedTop:top.map(c=>({title:c.title,match:c.match,fitScore:c.fitScore,readinessScore:c.readinessScore,readinessNotes:c.readinessNotes}))});
        renderReadinessPlan(page, top);
        renderAlternativeFinder(qs(page, '#careerAlternativeFinder'), top[0]?.title || '', true);
        result.classList.remove('hidden');
        result.scrollIntoView({behavior:'smooth',block:'start'});
      });
    }

    // ─── TOOL 5: WHAT COMES NEXT ──────────────────────────────────────────────────
    const pathways = {
      'Software development & data': {
        field:'Software & data',
        oihd:'Software development, data engineering and cloud roles appear on multiple South African high-demand and scarce-skills lists. Verify the current DHET OIHD publication before citing this.',
        cheapest: { title:'Self-taught + portfolio (bootcamp or WeThinkCode_)', summary:'WeThinkCode_ offers a free, employer-linked software engineering programme with campuses in Johannesburg, Cape Town and Durban. Bootcamps like HyperionDev and CodeSpace Academy offer shorter paid routes. A strong GitHub portfolio can substitute for a formal degree in many tech roles.', cost:'R 0 (WeThinkCode_) to ~R 30,000 (bootcamp)', duration:'1–2 years', qualification:'Non-SAQA portfolio / industry certificates (verify employer recognition)', tradeoffs:'No NQF qualification. Requires self-discipline. Employer recognition varies.', thisWeek:'Apply to WeThinkCode_ (intakes in September and February). Contact HyperionDev and CodeSpace Academy for current fees and intake dates.' },
        employable: { title:'BSc/BCom IT + cloud certifications', summary:'A three-year degree at a public university combined with cloud certifications (AWS, Azure or Google) is the most credible long-term route for senior developer and data roles. Consider UJ, UNISA, Wits, TUT or CPUT.', cost:'R 150,000–R 350,000 total', duration:'3 years + certifications', qualification:"NQF 7 Bachelor’s degree", tradeoffs:'Higher cost and longer duration than a bootcamp. NSFAS may fund if you qualify.', thisWeek:'Request official fee schedules from at least two public universities. Check NSFAS eligibility. Compare a home-study vs residence cost using the True Cost Calculator.' },
        fastest: { title:'Higher Certificate in IT + learnership', summary:'A one-year Higher Certificate (NQF 5) at a TVET or college followed by an ICT or software learnership gets you into employed, structured learning quickly. CTU Training Solutions and Boston City Campus offer several options.', cost:'R 30,000–R 60,000', duration:'1 year + learnership', qualification:'NQF 5 Higher Certificate + learnerships lead to NQF credits', tradeoffs:'Lower immediate ceiling than a degree. But often leads to full-time employment faster.', thisWeek:'Contact CTU Training Solutions and Boston City Campus for fees, accreditation and intake dates. Confirm NQF registration of the specific programme before enrolling.' }
      },
      'Engineering': {
        field:'Engineering',
        oihd:'Civil, electrical, mechanical and chemical engineering appear consistently on DHET high-demand and scarce-skills lists. Professional registration with ECSA is required to sign off engineering work independently.',
        cheapest: { title:'Engineering Diploma at a University of Technology (UoT)', summary:'A three-year National Diploma at institutions like TUT, CPUT, DUT, MUT or VUT typically costs less than a BEng at a research university, while still leading to ECSA registration via the professional technician route.', cost:'R 80,000–R 180,000 total', duration:'3 years + in-service training', qualification:'NQF 6 Diploma / Technician registration', tradeoffs:'Slower path to Professional Engineer status. But often faster to employment.', thisWeek:'Check ECSA’s website for the specific pathways to professional registration from diploma routes. Compare fees at two UoTs using the True Cost Calculator.' },
        employable: { title:'BEng at a research university', summary:'The most credible route to Professional Engineer (Pr Eng) status via ECSA. Wits, UCT, UP, SU and UKZN are the most recognised. Admission is competitive and typically requires strong Maths and Physical Sciences.', cost:'R 250,000–R 500,000 total', duration:'4 years', qualification:'NQF 8 Bachelor of Engineering', tradeoffs:'High entry requirements. High cost. But the qualification ceiling is highest.', thisWeek:'Check admission requirements directly on the university website. Model the full four-year cost using the True Cost Calculator before applying.' },
        fastest: { title:'TVET NATED N1–N6 + apprenticeship + trade test', summary:'The NATED route at a public TVET college followed by a QCTO-recognised apprenticeship and trade test is the fastest route to qualified, employed status in trades-adjacent engineering fields (electrical, mechanical, plumbing).', cost:'R 20,000–R 60,000', duration:'2–3 years NATED + apprenticeship time', qualification:'NATED N6 + trade test certificate', tradeoffs:'Not a degree route. But qualified artisans in SA are in genuine short supply.', thisWeek:'Contact your nearest public TVET college for N1 intake dates. Check INDLELA and the QCTO for trade test booking procedures.' }
      },
      'Trades': {
        field:'Trades',
        oihd:'Electricians, plumbers, welders, millwrights and boilermakers appear on DHET high-demand lists. Qualified artisans are among the most consistently in-demand workers in South Africa.',
        cheapest: { title:'TVET NCV + apprenticeship', summary:'A two-year NCV (National Certificate Vocational) at a public TVET college followed by a formal apprenticeship is the lowest-cost structured entry into a recognised trade.', cost:'R 10,000–R 30,000 for NCV', duration:'2 years NCV + 2–4 years apprenticeship', qualification:'NQF 4 NCV + trade test', tradeoffs:'Takes time. But the qualification is durable and portable.', thisWeek:'Identify your nearest public TVET college. Confirm which trades they offer NCV for. Ask about bursary or SETA funding for the apprenticeship phase.' },
        employable: { title:'NATED diploma + trade test', summary:'The N1–N6 NATED route followed by a QCTO trade test is the most widely recognised route for employers and leads directly to qualified artisan status.', cost:'R 20,000–R 60,000', duration:'3 years NATED + apprenticeship', qualification:'NATED N6 + trade test', tradeoffs:'NATED without a trade test is incomplete. The trade test is the credential that matters.', thisWeek:'Ask your TVET college about which SETA covers your intended trade and how to register an apprenticeship. Check QCTO for trade test schedules and centres.' },
        fastest: { title:'RPL (Recognition of Prior Learning) trade test', summary:'If you already have significant practical experience in a trade, INDLELA and accredited assessment centres offer RPL assessment leading directly to a trade test — bypassing the full NATED route.', cost:'Assessment fees only', duration:'Weeks to months (assessment preparation)', qualification:'Trade test certificate (same as NATED + apprenticeship route)', tradeoffs:'Only available to people with genuine prior experience. Requires evidence portfolio.', thisWeek:'Contact INDLELA (DHET) or your sector SETA to enquire about RPL assessment eligibility for your specific trade.' }
      },
      'Health professions': {
        field:'Health professions',
        oihd:'Doctors, pharmacists, physiotherapists, occupational therapists and nursing specialists appear on DHET high-demand lists. Note: South Africa’s public health system has a limited capacity to absorb community service graduates — verify the labour market for your specific profession before committing.',
        cheapest: { title:'Diploma in Nursing + bursary from the Department of Health', summary:'A three-year nursing diploma at a public nursing college, ideally with a full Department of Health bursary, is the lowest-cost route into the health professions with strong employment prospects in the public sector. SANC is transitioning qualification frameworks — verify current registration requirements.', cost:'R 0 (if funded) to ~R 60,000', duration:'3 years', qualification:'Diploma in Nursing / SANC registration', tradeoffs:'Public sector salary. Community service and rural posting requirements. SANC framework in transition — check current requirements directly.', thisWeek:'Contact your provincial Department of Health bursary office. Check the SANC website for the current qualification registration requirements.' },
        employable: { title:'BNursing or allied health degree', summary:'A four-year BNursing or allied health degree (physiotherapy, occupational therapy, radiography, dietetics) leads to professional registration and broader scope of practice. NSFAS does not fund all private providers — verify before applying.', cost:'R 120,000–R 300,000 total', duration:'4 years', qualification:'NQF 8 degree + professional body registration', tradeoffs:'High cost. Competitive admission. Labour market varies significantly by profession.', thisWeek:'Confirm admission requirements and total fees directly with public universities offering your chosen profession. Check HPCSA for professional registration requirements.' },
        fastest: { title:'Auxiliary nurse or pharmacy assistant entry route', summary:'A shorter auxiliary nursing or pharmacy assistant qualification allows entry into employed roles in the health sector faster, with a pathway to upgrade later.', cost:'R 15,000–R 40,000', duration:'1 year', qualification:'SAQA-registered auxiliary certificate', tradeoffs:'Lower scope of practice. But a genuine and fundable starting point.', thisWeek:'Verify the SAQA NQF status of any auxiliary programme before paying fees. Confirm the professional body that registers the qualification.' }
      },
      'Finance, accounting & actuarial': {
        field:'Finance',
        oihd:'Chartered Accountants, actuaries, financial managers and tax specialists appear consistently on DHET high-demand lists. The CA(SA) route is among the most structured and employment-certain professional pathways in South Africa.',
        cheapest: { title:'BCom + SAIPA / CIMA route', summary:'A BCom Accounting at a public university followed by SAIPA professional technician articles or CIMA certification is a lower-cost alternative to the full CA(SA) route with solid employment prospects.', cost:'R 150,000–R 280,000 total', duration:'3 years BCom + articles', qualification:'NQF 7 BCom + SAIPA / CIMA professional status', tradeoffs:'Not CA(SA). But SAIPA and CIMA are widely recognised and often faster to income.', thisWeek:'Compare BCom Accounting fees at two public universities. Request the SAIPA and CIMA route requirements from their websites.' },
        employable: { title:'BCom CA(SA) stream + SAICA articles', summary:'The most credible and highest-ceiling route. Complete a CA(SA)-accredited BCom, pass ITC and APC, and complete SAICA training contract (articles) at an accredited firm. Keian Padayachee (Dharma Pathways CFO) took this route.', cost:'R 200,000–R 400,000 total', duration:'3 years + articles (typically 3 years)', qualification:'CA(SA) designation', tradeoffs:'Long route. High cost. But one of the most durable professional qualifications in SA.', thisWeek:'Check which universities are SAICA-accredited. Compare total costs over the full six-year path using the True Cost Calculator.' },
        fastest: { title:'Diploma + bookkeeping certification', summary:'A two-year finance or accounting diploma followed by an ICB (Institute of Certified Bookkeepers) bookkeeping certification gets you into employed roles fastest. Important: ICB last NQF enrolment is 30 June 2026 — enrolments after that date are under the IQB international framework.', cost:'R 30,000–R 80,000', duration:'1–2 years', qualification:'Diploma + ICB certificate (verify current NQF status)', tradeoffs:'Lower ceiling than BCom or CA. But useful and employable for SME accounting roles.', thisWeek:'Confirm with ICB directly whether NQF-registered enrolment is still available for your chosen qualification. Verify the IQB framework status if enrolling after June 2026.' }
      },
      'Teaching & education': {
        field:'Teaching & education',
        oihd:'Teachers in priority subjects (Mathematics, Physical Sciences, Accounting, languages) and foundation phase are on DHET high-demand lists. The Funza Lushaka bursary funds qualifying students in exchange for teaching service.',
        cheapest: { title:'Funza Lushaka bursary + BEd at a public university', summary:'The Funza Lushaka bursary fully funds a BEd at a DHET-approved university in exchange for a teaching service obligation. Priority subjects and foundation phase attract the strongest funding. Check the DHET website for the current list of approved universities and subjects.', cost:'R 0 if funded (service obligation applies)', duration:'4 years', qualification:'NQF 7 Bachelor of Education', tradeoffs:'Service obligation ties you to a public school posting. But it removes the cost barrier entirely for qualifying students.', thisWeek:'Check dhet.gov.za for the current Funza Lushaka application window, priority subjects, approved institutions and service conditions.' },
        employable: { title:'BEd at a public university (self-funded or bursary)', summary:'A four-year BEd covering a specific phase (Foundation, Intermediate, Senior or FET) and subject specialisation is the standard route to SACE registration and permanent employment. Wits, UP, UCT, UJ, UKZN and UNISA all offer accredited programmes.', cost:'R 120,000–R 250,000 total', duration:'4 years', qualification:'NQF 7 BEd + SACE registration', tradeoffs:'Requires four years and SACE registration before you can teach independently. Public school salaries are structured but not high.', thisWeek:'Check admission requirements for BEd at two public universities. Confirm SACE registration requirements at sace.org.za.' },
        fastest: { title:'PGCE after a relevant bachelor\'s degree', summary:'If a student already has or is completing a bachelor\'s degree in a relevant subject, a one-year Postgraduate Certificate in Education (PGCE) is the fastest route to SACE registration and employment. Particularly useful for graduates who decide on teaching later.', cost:'R 20,000–R 60,000 for PGCE year', duration:'1 year (after a 3-year degree)', qualification:'NQF 7 PGCE + SACE registration', tradeoffs:'Requires a prior degree. But PGCE graduates are in demand and can enter the classroom quickly.', thisWeek:'Confirm SACE subject/phase requirements for your degree at sace.org.za. Check PGCE intake dates and fees at UNISA, Wits, UP or your nearest public university.' }
      },
      'Marketing, brand & communications': {
        field:'Marketing & communications',
        oihd:'Digital marketing, brand management, public relations and content specialists appear on sector demand lists. The field rewards portfolio and experience alongside formal qualifications.',
        cheapest: { title:'IMM Graduate School Diploma or portfolio-based route', summary:'The IMM Graduate School offers accredited marketing diplomas at lower cost than a full BCom. A strong digital portfolio — social media, content, campaigns — can substitute for or supplement a formal qualification with many employers.', cost:'R 30,000–R 80,000 (IMM diploma)', duration:'2 years', qualification:'NQF 6 Diploma (verify current IMM accreditation)', tradeoffs:'Less recognised than a BCom at large corporates. But often sufficient for agency, SME and digital roles.', thisWeek:'Request a fee schedule and accreditation confirmation from the IMM Graduate School. Ask specifically about NQF level and SAQA registration.' },
        employable: { title:'BCom Marketing or BA Communication at a public university', summary:'A three-year BCom Marketing or BA Communication from a recognised public university (UJ, UNISA, UP, Wits, UKZN) provides the broadest employer recognition and access to graduate programmes at large corporates.', cost:'R 150,000–R 280,000 total', duration:'3 years', qualification:'NQF 7 Bachelor\'s degree', tradeoffs:'Higher cost and longer. But opens doors to corporate graduate programmes, large agencies and structured career paths.', thisWeek:'Compare BCom Marketing and BA Communication fees at two public universities. Check whether the programme includes practical agency or media exposure.' },
        fastest: { title:'Short course stack + freelance portfolio', summary:'Google Digital Marketing certification, Meta Blueprint, Canva design courses and a measurable portfolio of social media, content or email campaigns can lead to employment or freelance income within months — without a formal qualification.', cost:'R 0–R 15,000 (mostly free or low cost)', duration:'3–6 months', qualification:'Industry certifications (no NQF registration)', tradeoffs:'No formal NQF qualification. Ceiling is lower at large employers without a degree. But highly viable for agency, startup and freelance work.', thisWeek:'Enrol in Google Digital Marketing & E-commerce Certificate (free via Coursera). Build a portfolio of three real or practice campaigns before applying.' }
      },
      'Design & creative production': {
        field:'Design & creative production',
        oihd:'UX/UI design, motion graphics, digital content production and game design appear on sector demand lists. Portfolio quality matters more than institution name in most hiring decisions.',
        cheapest: { title:'Diploma in Graphic Design or Digital Arts at a public institution', summary:'Tshwane University of Technology (TUT), Cape Peninsula University of Technology (CPUT) and Durban University of Technology (DUT) offer accredited design diplomas at public university fees. Strong portfolio work from these programmes is well regarded by employers.', cost:'R 60,000–R 150,000 total', duration:'3 years', qualification:'NQF 6 Diploma in Design', tradeoffs:'Less prestige than private design schools but significantly lower cost. Portfolio quality is more important than institution.', thisWeek:'Check admission requirements and portfolio submission requirements at TUT, CPUT or DUT design faculties.' },
        employable: { title:'BA/BCom Design at a specialist or public institution', summary:'A three to four year design degree from Vega, STADIO, AAA School of Advertising or a public university provides the most structured route to senior design, UX or creative direction roles. Verify accreditation carefully for private providers.', cost:'R 150,000–R 350,000 total', duration:'3–4 years', qualification:'NQF 7 degree (verify per institution)', tradeoffs:'Private schools can be expensive and vary in employer recognition. Always check SAQA accreditation before enrolling.', thisWeek:'Compare at least one public university option against a private school. Check SAQA qualification registration for any private provider you consider.' },
        fastest: { title:'Portfolio route via online courses + freelance', summary:'Adobe suite mastery, Figma for UX, and a portfolio of real work — websites, brand identities, app mockups — is sufficient for agency junior roles and freelance clients within 6–12 months of focused self-study.', cost:'R 5,000–R 20,000 (software subscriptions and courses)', duration:'6–12 months', qualification:'Portfolio + industry certifications', tradeoffs:'No formal qualification. Ceiling is lower for senior in-house roles at large corporates. But viable for agencies, studios, startups and freelance.', thisWeek:'Build three portfolio pieces in your chosen design area. Set up a Behance or personal portfolio site before approaching employers or freelance clients.' }
      },
      'Law & legal services': {
        field:'Law & legal services',
        oihd:'Attorneys, advocates, compliance officers and legal advisors appear on professional and corporate demand lists. The LLB route requires articles and admission — verify the full timeline before committing.',
        cheapest: { title:'LLB at a public university (4-year direct entry)', summary:'A four-year LLB at a public university (UNISA, UWC, NMU, UL, UKZN) is the lowest-cost route to attorney admission. UNISA offers a distance-learning LLB that allows students to work while studying, significantly reducing the financial burden.', cost:'R 80,000–R 200,000 total', duration:'4 years + articles (1–2 years)', qualification:'NQF 8 LLB + Law Society admission', tradeoffs:'Articles are competitive and unpaid or low-paid. The full route from first year to admitted attorney is typically 6–7 years.', thisWeek:'Check UNISA distance LLB fees and admission requirements. Compare against a contact-learning LLB at UWC or NMU. Ask about article placement rates before choosing.' },
        employable: { title:'LLB at a recognised contact university + articles at a commercial firm', summary:'An LLB at UCT, Wits, UP or Stellenbosch followed by articles at a commercial law firm provides the most direct route to high-ceiling legal careers in corporate, tax, property or litigation law. Admission is competitive and the full route is long.', cost:'R 200,000–R 400,000 total', duration:'4 years + articles', qualification:'NQF 8 LLB + admission as attorney', tradeoffs:'High cost, long route, competitive articles market. But the ceiling is highest and employer recognition is strongest.', thisWeek:'Check admission requirements for LLB at two contact universities. Research which firms recruit from each university and what article conditions they offer.' },
        fastest: { title:'Paralegal certificate + legal office experience', summary:'A one-year paralegal certificate (NQF 5 or 6) allows entry into legal support roles — conveyancing, litigation support, compliance, contracts administration — without the full LLB timeline. Can be a stepping stone to part-time LLB study later.', cost:'R 15,000–R 50,000', duration:'1 year', qualification:'NQF 5/6 Paralegal certificate', tradeoffs:'Not an admitted attorney route. But a genuine and employable entry into the legal sector, and many paralegals upgrade via part-time LLB later.', thisWeek:'Check UNISA and accredited private providers for paralegal certificate fees and NQF status. Ask employers what paralegal roles lead to in their firms.' }
      },
      'Psychology': {
        field:'Psychology and people-helping pathways',
        oihd:'Psychology is meaningful but professional practice usually requires competitive Honours/Masters selection, supervised practice and registration. Treat the undergraduate route as a broad people-helping foundation unless postgraduate access is realistic.',
        cheapest: { title:'BA Psychology / BSocSci at a public university while building exposure', summary:'A public-university psychology or social-science degree is usually the lowest-cost credible academic entry. Because professional psychology is postgraduate-gated, the safer version includes volunteering, research exposure, counselling-adjacent experience and parallel options from year one.', cost:'R 90,000-R 220,000 total', duration:'3 years + possible postgraduate study', qualification:'NQF 7 bachelor degree; professional registration requires further study', tradeoffs:'A psychology major alone does not make someone a psychologist. Postgraduate selection is competitive and not guaranteed.', thisWeek:'Compare BA Psychology fees at two public universities. Ask each department about Honours/Masters selection rates, fieldwork exposure and realistic non-clinical career paths.' },
        employable: { title:'Social work or registered people-helping route', summary:'If the learner wants direct helping work, a Bachelor of Social Work has a clearer professional route than psychology alone. It includes fieldwork and links to SACSSP registration, though salaries and public-sector hiring cycles still need checking.', cost:'R 100,000-R 240,000 total', duration:'4 years', qualification:'Bachelor of Social Work + SACSSP registration', tradeoffs:'Emotionally demanding work and not a high-income path. But the route to practice is clearer than psychology without postgraduate selection.', thisWeek:'Check BSW options at public universities and ask about fieldwork placement, bursaries and SACSSP registration requirements.' },
        fastest: { title:'HR, counselling-support or community-work entry route', summary:'Students drawn to human behaviour can test the field through HR, youth work, community development, counselling-support short courses or NGO volunteering before committing to a long postgraduate psychology pathway.', cost:'R 0-R 40,000 depending on short course or certificate', duration:'Immediate to 1 year', qualification:'Short-course/certificate recognition varies; verify accreditation and scope of practice', tradeoffs:'These routes do not make someone a psychologist. They are safer exposure routes that clarify whether people-helping work fits.', thisWeek:'Arrange one NGO, school, HR or community-service conversation. Ask what entry-level roles require and what work feels like on difficult days.' }
      },
      'Entrepreneurship & small business': {
        field:'Entrepreneurship',
        oihd:'Entrepreneurship is not a single occupation on the OIHD, but skills in business management, digital commerce, financial management and operations underpin sustainable self-employment across all sectors.',
        cheapest: { title:'Skills-first: trade, service or digital skill + business basics', summary:'The most viable entrepreneurship route starts with a marketable skill (a trade, a digital capability, a service) and adds basic business knowledge — bookkeeping, tax registration, pricing, client management. SEDA (Small Enterprise Development Agency) offers free business development support and mentorship.', cost:'R 0–R 30,000 (skill training cost)', duration:'Skill-dependent', qualification:'Varies by underlying skill (NQF-registered options available)', tradeoffs:'No qualification without the underlying skill. But lower risk and faster to income than studying business theory first.', thisWeek:'Identify the marketable skill first. Contact SEDA (seda.org.za) for free business planning support. Register on the CIPC portal for basic company registration information.' },
        employable: { title:'BCom Entrepreneurship or Business Management at a public university', summary:'A three-year BCom provides business theory, networks and employer recognition that self-taught routes lack. It is particularly useful if the goal is to build a business that requires investor funding, formal contracts or corporate clients.', cost:'R 150,000–R 280,000 total', duration:'3 years', qualification:'NQF 7 BCom', tradeoffs:'Theory-heavy. The credential matters less than execution in entrepreneurship. But useful for funding applications and corporate credibility.', thisWeek:'Compare BCom Entrepreneurship and BCom Business Management fees at two public universities. Ask whether the programme includes incubation or startup support.' },
        fastest: { title:'SETA short course + immediate low-overhead test', summary:'A short business management or entrepreneurship course from a SETA-accredited provider, combined with an immediate low-overhead business test (a service, a product, an online shop), is the fastest route to testing viability before committing larger resources.', cost:'R 0–R 10,000', duration:'3–6 months', qualification:'SETA certificate (verify NQF level)', tradeoffs:'No degree. But entrepreneurship is validated by revenue, not qualifications.', thisWeek:'Identify a low-overhead business idea you can test within 30 days. Contact SEDA for a free business plan workshop. Register your business on CIPC.' }
      },
      'Hospitality, tourism & events': {
        field:'Hospitality & tourism',
        oihd:'Hospitality management, tourism operations and events coordination appear on sector demand lists, particularly for roles linked to South Africa\'s tourism economy. Practical experience carries significant weight alongside formal qualifications.',
        cheapest: { title:'TVET National Certificate in Hospitality', summary:'A two-year TVET National Certificate in Hospitality Studies (NQF 2–4) at a public TVET college is the lowest-cost structured entry into hotel, lodge, restaurant and catering roles. Practical placement is built into the programme.', cost:'R 5,000–R 20,000', duration:'2 years', qualification:'NQF 2–4 National Certificate', tradeoffs:'Lower ceiling than a diploma for management roles. But a genuine, low-cost route into employed hospitality work.', thisWeek:'Contact your nearest public TVET college for Hospitality Studies intake dates and fees. Ask about practical placement arrangements with local hotels or restaurants.' },
        employable: { title:'Diploma in Hospitality Management at a public university or accredited college', summary:'A three-year Diploma in Hospitality Management at institutions like TUT, DUT, CPUT or VUT provides the most credible route to management-track roles in hotels, lodges, game reserves and events companies. Work-integrated learning is a core component.', cost:'R 80,000–R 180,000 total', duration:'3 years', qualification:'NQF 6 Diploma', tradeoffs:'Hospitality salaries at entry level are not high. Management roles take time. But the sector has genuine and broad demand.', thisWeek:'Check Hospitality Management diploma fees and work-integrated learning requirements at TUT, DUT or CPUT. Ask whether the programme has employer partnerships for placement.' },
        fastest: { title:'Work your way up from an entry-level role', summary:'Many senior hospitality professionals started as waiters, housekeepers or kitchen assistants and moved up through demonstrated competence. Starting work in the sector immediately — while studying part-time or completing learnerships — is often faster to income than full-time study.', cost:'R 0 (earn while you learn)', duration:'Immediate start', qualification:'Build via RPL, learnerships and short courses over time', tradeoffs:'No formal qualification at the start. Ceiling without a diploma or degree is limited to supervisory roles at most establishments.', thisWeek:'Apply for any entry-level role at a hotel, lodge or restaurant. Ask the employer about in-house training programmes, learnership partnerships or study support.' }
      },
      'Public service, NGO & social work': {
        field:'Public service & social work',
        oihd:'Social workers, community development workers and public administrators appear on DHET high-demand lists. Social work in particular has a specific NQF requirement for registration with the South African Council for Social Service Professions (SACSSP).',
        cheapest: { title:'Diploma in Public Administration or Community Development', summary:'A three-year diploma at a public university (UNISA, UWC, NMU or a UoT) provides the most accessible entry into public service and NGO work. UNISA\'s distance offering allows students to work while studying.', cost:'R 40,000–R 100,000 total', duration:'3 years', qualification:'NQF 6 Diploma', tradeoffs:'Government hiring sometimes favours degrees over diplomas for senior posts. But diplomas are sufficient for many NGO and community-facing roles.', thisWeek:'Check UNISA Diploma in Public Administration fees and intake dates. Ask about recognition of the qualification for government employment at the relevant municipality or department.' },
        employable: { title:'BSocSci or Bachelor of Social Work at a public university', summary:'A four-year BSW is the only route to SACSSP registration as a social worker, which is required for formal social work employment. BSocSci degrees open broader public service, NGO management and policy roles.', cost:'R 100,000–R 220,000 total', duration:'4 years (BSW) / 3 years (BSocSci)', qualification:'NQF 7 degree + SACSSP registration (BSW)', tradeoffs:'Social work salaries in the public sector are structured but not high. NGO roles are often contract-based. But the social need and demand are genuine and sustained.', thisWeek:'Check BSW and BSocSci fees at UNISA, UWC, Wits or UKZN. Confirm SACSSP registration requirements at sacssp.org.za if social work specifically is the goal.' },
        fastest: { title:'Volunteer + short course route into NGO work', summary:'Many NGO entry roles are accessible with a matric certificate, volunteer experience, a relevant short course (counselling skills, project management, community health) and demonstrated commitment. This is the fastest route to employment in civil society.', cost:'R 0–R 10,000', duration:'Immediate', qualification:'Short course certificates (NQF varies)', tradeoffs:'Career ceiling without a degree in NGO management or policy roles. But a genuine starting point for people committed to the sector.', thisWeek:'Identify two NGOs in your area. Contact them about volunteer roles or internships. Ask which short courses they recommend for entry-level staff.' }
      },
      'Agriculture, environment & natural sciences': {
        field:'Agriculture & environment',
        oihd:'Agricultural scientists, environmental managers, food technologists and conservation officers appear on DHET high-demand and scarce-skills lists. The sector includes both formal academic routes and practical agricultural college programmes.',
        cheapest: { title:'Diploma at an agricultural college', summary:'Agricultural colleges like Grootfontein, Elsenburg, Cedara and ORT JET offer practical, accredited diplomas at lower cost than university programmes. These are well regarded by commercial farming operations, agribusiness and government extension services.', cost:'R 30,000–R 90,000 total', duration:'2–3 years', qualification:'NQF 6 Diploma (verify per college)', tradeoffs:'Less recognised for research or policy roles than a university degree. But highly practical and directly employable in the agricultural sector.', thisWeek:'Contact Grootfontein Agricultural Development Institute or Elsenburg College for their current programme list, fees and admission requirements.' },
        employable: { title:'BSc Agriculture or Environmental Science at a public university', summary:'A three-year BSc at UP, UKZN, UFS, SU or Fort Hare provides the most credible route to professional agricultural, conservation and environmental management roles. Many programmes include work-integrated components and field work.', cost:'R 120,000–R 260,000 total', duration:'3 years', qualification:'NQF 7 BSc', tradeoffs:'Higher cost. Rural placement often required. But the ceiling for research, policy and corporate agribusiness roles is significantly higher.', thisWeek:'Compare BSc Agriculture fees at UP, UKZN and UFS. Check whether the programme includes work-integrated learning and what subjects are required for admission.' },
        fastest: { title:'AgriBEE learnership or conservation volunteer programme', summary:'Learnerships through AgriSETA and conservation volunteer programmes (SANParks, private game reserves, WWF-SA) offer paid or subsidised practical entry into the sector without a formal qualification upfront.', cost:'Stipend-based (minimal cost)', duration:'1 year', qualification:'NQF-registered learnership certificate', tradeoffs:'Not a degree route. But practical experience in agriculture and conservation is highly valued and can open full-time employment.', thisWeek:'Check AgriSETA (agriseta.co.za) for current learnership opportunities. Contact SANParks or a private game reserve for volunteer and conservation field programme options.' }
      },
      'Logistics, supply chain & operations': {
        field:'Logistics & supply chain',
        oihd:'Supply chain managers, logistics coordinators, warehouse managers and procurement officers appear on DHET high-demand lists. The sector is large, stable and spans retail, manufacturing, mining and government.',
        cheapest: { title:'Diploma in Logistics or Supply Chain Management at a UoT', summary:'A three-year diploma at TUT, CPUT, DUT, MUT or VUT provides an accredited, cost-effective entry into logistics, warehousing and supply chain roles. Work-integrated learning is built into most programmes.', cost:'R 60,000–R 140,000 total', duration:'3 years', qualification:'NQF 6 Diploma', tradeoffs:'Lower ceiling than a BCom for senior management roles. But direct employment in the sector is strong from diploma level.', thisWeek:'Check Logistics or Supply Chain diploma fees at TUT, CPUT or DUT. Ask about work-integrated learning placement and which companies recruit from the programme.' },
        employable: { title:'BCom Logistics or Supply Chain Management', summary:'A three-year BCom at UJ, UNISA, UP or NMU provides the most credible route to procurement, supply chain management, operations and demand planning roles at large corporates, retailers and mining companies.', cost:'R 130,000–R 260,000 total', duration:'3 years', qualification:'NQF 7 BCom', tradeoffs:'Higher cost. But the corporate graduate programme market is stronger from BCom level.', thisWeek:'Compare BCom Logistics fees at UJ and UNISA. Check whether the programme is APICS or CIPS aligned — these are internationally recognised supply chain professional bodies.' },
        fastest: { title:'TETA or FIETA learnership + warehouse/operations entry role', summary:'Transport Education and Training Authority (TETA) and Freight, Logistics and Agri SETA (FIETA) offer learnerships in logistics, freight handling and supply chain that pay a stipend and lead to NQF-registered qualifications. Starting in a warehouse, driver or freight coordination role while completing a learnership is common in the sector.', cost:'Stipend-based', duration:'1 year', qualification:'NQF 3–5 learnership certificate', tradeoffs:'Entry-level ceiling without a diploma or degree. But the sector promotes from within strongly, and many logistics managers started in operations.', thisWeek:'Check TETA (teta.org.za) and FIETA for current learnership opportunities. Apply for entry-level warehouse, freight or operations roles with large retailers or logistics firms.' }
      }
    };

    function makePlaceholderPath(career) {
      return {
        field: career,
        oihd: `${career} may include occupations on South African high-demand or scarce-skills lists. Verify the current DHET OIHD publication for your specific role before applying.`,
        cheapest: { title:'Use the four tools to evaluate specific routes', summary:'Detailed curated pathways for this field are still being expanded. Use Reality Check, True Cost, Route Compare and Career Fit to evaluate any specific qualification you find.', cost:'Verify directly', duration:'Verify directly', qualification:'Verify NQF / professional registration status', tradeoffs:'Pathway detail coming in a future update.', thisWeek:'Shortlist two public options and one lower-cost alternative. Email each provider for fees, accreditation and graduate outcomes.' },
        employable: { title:'Research via official sources first', summary:'Use the SAQA qualification database, DHET OIHD, and relevant professional body websites to identify the most credible route.', cost:'Verify directly', duration:'Verify directly', qualification:'Verify', tradeoffs:'', thisWeek:'Search the SAQA qualifications search at saqa.org.za for qualifications in this field.' },
        fastest: { title:'Check TVET and learnership options', summary:'Many fields have faster TVET or learnership entry points that are not widely advertised. Contact the relevant SETA for your sector.', cost:'Verify directly', duration:'Verify directly', qualification:'Verify', tradeoffs:'', thisWeek:'Find your sector SETA at qcto.org.za and ask about available learnerships.' }
      };
    }



    function initCommitChecklist(page) {
      const checklist = qs(page, '#commitChecklist');
      if (!checklist) return;
      const boxes = Array.from(checklist.querySelectorAll('[data-checklist-item]'));
      const progress = qs(page, '#commitChecklistProgress');
      const saved = dharmaStore.get('commitChecklist') || {};
      boxes.forEach(box => { box.checked = !!saved[box.dataset.checklistItem]; });
      function updateProgress() {
        const state = {}; let done = 0;
        boxes.forEach(box => { state[box.dataset.checklistItem] = box.checked; if (box.checked) done += 1; });
        dharmaStore.set('commitChecklist', state);
        if (progress) progress.textContent = `${done} of ${boxes.length} completed.`;
      }
      boxes.forEach(box => box.addEventListener('change', updateProgress));
      updateProgress();
    }

    function buildFamilyShareSummary() {
      const reality = dharmaStore.get('reality');
      const cost = dharmaStore.get('cost');
      const fit = dharmaStore.get('fit');
      const pressure = reality ? titleCase(reality.pressure) : 'Not completed';
      const bracket = reality ? reality.bracket : 'Not completed';
      const capacity = reality ? formatR(reality.capacity) + '/month' : 'Not completed';
      const route = cost ? inferLastCostedRoute(cost) : 'Not completed';
      const monthlyBurden = cost ? formatR(cost.netMonthly) + '/month' : 'Not completed';
      const topFit = fit && fit.detailedTop && fit.detailedTop[0] ? `${fit.detailedTop[0].title} (${fit.detailedTop[0].match}% overall match)` : (fit && fit.top && fit.top[0] ? fit.top[0] : 'Not completed');
      let mainWarning = 'No major automated warning was triggered yet, but all figures must still be verified directly.';
      if (!reality || !cost || !fit) mainWarning = 'The report is incomplete because one or more tools have not been completed yet.';
      if (reality && cost && reality.capacity > 0 && cost.netMonthly > reality.capacity) mainWarning = 'The costed route appears to exceed the household’s realistic monthly study capacity.';
      if (reality && ['severe', 'high'].includes(reality.pressure)) mainWarning = 'The household pressure signal is high. Lower-cost, funded, living-at-home, TVET, distance or work-and-study routes should be considered before high-debt options.';
      let nextStep = 'Complete all four Dharma Pathways tools and review the final family report.';
      if (reality && !cost) nextStep = 'Run the True Cost Calculator to check annual cost, monthly burden and first-month cash need.';
      else if (reality && cost && cost.netMonthly > reality.capacity) nextStep = 'Compare a cheaper, funded, living-at-home, TVET or distance route before committing.';
      else if (reality && cost && !fit) nextStep = 'Run Career Fit Check to test whether the student’s interests, working style and marks support the route.';
      else if (reality && cost && fit) nextStep = 'Use the final report to compare at least two realistic routes and verify fees, funding and accreditation directly.';
      return `Dharma Pathways family summary:\n\nHousehold affordability pressure: ${pressure}\nFunding bracket: ${bracket}\nMonthly study capacity: ${capacity}\nLast costed route: ${route}\nEstimated monthly burden: ${monthlyBurden}\nTop career fit: ${topFit}\n\nMain warning:\n${mainWarning}\n\nSuggested next step:\n${nextStep}\n\nGenerated using Dharma Pathways — public beta.\nhttps://www.dharmapathways.org.za/\n\nPlease verify all fees, funding rules, admission requirements and accreditation directly before applying, borrowing, enrolling or paying deposits.`;
    }


    function initNextSteps(page) { renderNextSteps(page); initCommitChecklist(page); setupFinalShareButtons(page); }

    function setupFinalShareButtons(page) {
      if (page.dataset.shareReady) return;
      page.dataset.shareReady = 'true';
      page.addEventListener('click', async (e) => {
        if (e.target && e.target.id === 'copyFamilySummary') {
          const summary = buildFamilyShareSummary();
          const status = qs(page, '#shareStatus');
          try { await navigator.clipboard.writeText(summary); if (status) status.textContent = 'Family summary copied. You can now paste it into WhatsApp, email or a document.'; }
          catch { if (status) status.textContent = 'Copy failed. Select the report text manually, or try again in a secure browser window.'; }
        }
        if (e.target && e.target.id === 'shareWhatsAppSummary') {
          window.open('https://wa.me/?text=' + encodeURIComponent(buildFamilyShareSummary()), '_blank', 'noopener');
        }
      });
    }

    function renderNextSteps(page) {
      const fit=dharmaStore.get('fit'), reality=dharmaStore.get('reality'), cost=dharmaStore.get('cost');
      const empty=qs(page,'#emptyState'), result=qs(page,'#resultState'), recs=qs(page,'#recommendations');
      if (!fit||!fit.top||!fit.top.length) { empty.classList.remove('hidden'); result.classList.add('hidden'); return; }
      empty.classList.add('hidden'); result.classList.remove('hidden');

      const ctx=[];
      if (reality) ctx.push(`<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:var(--space-4);"><div><div class="pathway-fact-label">Affordability pressure</div><div class="pathway-fact-value">${titleCase(reality.pressure)}</div></div><div><div class="pathway-fact-label">Funding bracket</div><div class="pathway-fact-value">${reality.bracket}</div></div><div><div class="pathway-fact-label">Monthly study capacity</div><div class="pathway-fact-value">${formatR(reality.capacity)}</div></div><div><div class="pathway-fact-label">Monthly surplus before study</div><div class="pathway-fact-value">${formatR(reality.surplus)}</div></div></div>`);
      if (cost) ctx.push(`<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:var(--space-4);margin-top:var(--space-6);padding-top:var(--space-6);border-top:1px solid var(--line);"><div><div class="pathway-fact-label">Annual true cost</div><div class="pathway-fact-value">${formatR(cost.totalAnnual)}</div></div><div><div class="pathway-fact-label">Monthly burden</div><div class="pathway-fact-value">${formatR(cost.netMonthly)}</div></div><div><div class="pathway-fact-label">First-month cash need</div><div class="pathway-fact-value">${formatR(cost.firstMonthCost||0)}</div></div><div><div class="pathway-fact-label">Full-programme exposure</div><div class="pathway-fact-value">${formatR(cost.programmeTotal||0)}</div></div></div>`);
      const fitDetails=fit.detailedTop&&fit.detailedTop.length?fit.detailedTop.slice(0,3).map(c=>`${c.title} (${c.match}% overall, ${c.readinessScore}% readiness)`).join('; '):fit.top.slice(0,3).join('; ');
      ctx.push(`<p style="margin-top:var(--space-6);"><strong>Top career fits:</strong> ${fitDetails}.</p>`);
      qs(page,'#contextSummary').innerHTML=ctx.join('');
      qs(page,'#reportWarnings').innerHTML=renderReportWarnings(reality,cost,fit);

      recs.innerHTML=`<div class="form-section" style="margin-bottom:var(--space-12);"><span class="eyebrow">Recommended discussion order</span><h3>Use this order with your family</h3><ol style="padding-left:1.5rem;color:var(--ink-soft);line-height:1.8;margin-top:var(--space-4);"><li><strong>Can we carry the monthly cost?</strong> Compare the required monthly burden to your Reality Check capacity.</li><li><strong>Can we survive the first month?</strong> Registration, deposits, devices and transport often arrive together before the family has settled into a rhythm.</li><li><strong>Is the route accredited and realistic?</strong> Confirm admission, accreditation, funding and workplace exposure before paying deposits.</li><li><strong>Does the student fit the field?</strong> Use the fit and readiness scores to decide whether direct entry, diploma, TVET, bridging or work-and-study is safer.</li></ol></div>`+fit.top.slice(0,3).map((career,idx)=>renderCareerRecommendation(career,idx,fit)).join('');
      renderAlternativeFinder(qs(page, '#finalAlternativeFinder'), fit.top && fit.top[0] ? fit.top[0] : '', false);
      renderResidenceRisk(qs(page, '#finalResidenceRisk'), reality, cost);
      renderFundingGuidance(qs(page, '#finalFundingGuidance'), reality, cost, fit);
    }




    const saferAlternativeLibrary = {
      medicine: { label:'Medicine', match:['medicine','health professions'], note:'Medicine is a valid dream, but it is high-barrier, long, expensive and highly competitive. Investigate adjacent health routes before committing only to MBChB.', alternatives:[
        { title:'Nursing', tag:'Fundable health route', why:'Often more accessible than medicine, still patient-facing, and linked to strong public-sector demand.', route:'Diploma or Bachelor of Nursing, SANC registration, possible provincial bursary.', next:'Compare nursing against medicine in Route Compare and ask about clinical placement and service obligations.' },
        { title:'Clinical Associate', tag:'Closest practical alternative', why:'Clinical associates work in medical teams and can be a strong fit for students drawn to diagnosis and patient care.', route:'Bachelor of Clinical Medical Practice where available; check current programme availability and recognition.', next:'Ask institutions directly about current accreditation, placement and career outcomes.' },
        { title:'Radiography', tag:'Allied health option', why:'Healthcare-facing route with technical skills, shorter path than medicine, and professional registration.', route:'Radiography degree/diploma plus HPCSA registration.', next:'Ask about clinical training sites, registration and provincial bursaries.' }
      ]},
      engineering: { label:'Engineering', match:['engineering'], note:'Engineering has strong demand, but direct BEng entry is not the only credible route. Technical and diploma pathways can be safer for many families.', alternatives:[
        { title:'UoT Engineering Diploma', tag:'Practical route', why:'Lower cost and more practical than direct BEng while still leading to technical engineering work.', route:'Diploma at a University of Technology with work-integrated learning.', next:'Compare BEng vs UoT diploma in Route Compare.' },
        { title:'TVET NATED Technical Route', tag:'Lower-cost entry', why:'Can lead into technician/artisan routes and may be more realistic when Maths/Science marks are moderate.', route:'N1–N6 electrical/mechanical/civil route plus workplace experience.', next:'Ask whether workplace placement is supported or must be found independently.' },
        { title:'Trade / Artisan Pathway', tag:'Earn sooner', why:'Hands-on technical route with demand in electricity, plumbing, fitting, welding and mechanics.', route:'TVET + apprenticeship + trade test.', next:'Compare against the degree path for cost, time and earning speed.' }
      ]},
      law: { label:'Law', match:['law'], note:'Law is writing-heavy, competitive and does not automatically lead to articles. Investigate adjacent routes if direct legal practice is uncertain.', alternatives:[
        { title:'Paralegal / Legal Assistant', tag:'Lower-risk entry', why:'Allows exposure to legal work before committing to the full LLB route.', route:'Paralegal certificate/diploma, legal office experience.', next:'Ask firms what entry-level legal support roles require.' },
        { title:'Compliance', tag:'Corporate legal-adjacent', why:'Uses legal reasoning in business, finance, privacy, risk and governance contexts.', route:'Diploma/degree in law, compliance, risk or business with certifications.', next:'Compare LLB vs compliance route for cost and employment prospects.' },
        { title:'Public Administration / Policy', tag:'Civic pathway', why:'Good for students drawn to justice, public systems and advocacy without necessarily practising law.', route:'BA/BSocSci/Public Administration route.', next:'Ask about internship and public-sector placement opportunities.' }
      ]},
      accounting: { label:'Chartered Accounting / CA route', match:['finance','accounting','actuarial'], note:'The CA route has strong long-term value, but it is long, expensive and academically demanding. There are credible finance routes with earlier earning.', alternatives:[
        { title:'Accounting Diploma / Clerk Route', tag:'Earn sooner', why:'Gets the student into junior accounting work faster while leaving room to study further.', route:'Diploma or bookkeeping qualification plus clerk role.', next:'Compare BCom CA vs diploma/clerk route.' },
        { title:'SAIPA / CIMA Pathway', tag:'Professional alternative', why:'Still professional, often more commerce-focused or SME-friendly than the CA route.', route:'BCom/diploma plus SAIPA or CIMA progression.', next:'Ask about workplace training, fees and designation requirements.' },
        { title:'Financial Operations / Payroll', tag:'Practical entry', why:'Lower barrier and useful for students who want finance exposure before committing to a long route.', route:'Certificate/diploma plus workplace experience.', next:'Ask employers what qualifications they accept for junior roles.' }
      ]},
      software: { label:'Computer Science / Software', match:['software','data','computer'], note:'Software can be high-opportunity, but a degree is not the only route. Portfolio, learnership and diploma paths can be safer depending on marks and finances.', alternatives:[
        { title:'Diploma in IT', tag:'Structured alternative', why:'Often more accessible than BSc Computer Science while still building employable technical skills.', route:'Diploma in IT / Software Development / Systems Development.', next:'Compare BSc vs IT diploma and ask about graduate placement.' },
        { title:'Learnership / Systems Support', tag:'Earn while learning', why:'Can reduce family financial pressure and provide workplace exposure earlier.', route:'MICT SETA or employer-linked learnership.', next:'Check stipend, qualification level and employer placement.' },
        { title:'Portfolio + Short Courses', tag:'Proof-of-skill route', why:'Useful for self-driven students who can build and show real projects before paying for a costly route.', route:'Bootcamp/free courses + GitHub portfolio + internships.', next:'Build one small project before committing to expensive study.' }
      ]},
      psychology: { label:'Psychology', match:['psychology'], note:'Psychology is meaningful but often requires postgraduate selection before professional registration. Related people-helping routes may be safer.', alternatives:[
        { title:'Social Work', tag:'Professional helping route', why:'More direct public-service pathway with clearer professional registration.', route:'Bachelor of Social Work plus registration.', next:'Ask about bursaries, fieldwork and placement.' },
        { title:'Counselling / Community Work', tag:'Adjacent support route', why:'Can allow earlier exposure to support work while testing fit for long-term postgraduate study.', route:'Accredited counselling/community development route where recognised.', next:'Verify accreditation and scope of practice carefully.' },
        { title:'Human Resources / Organisational Psychology Pathway', tag:'Workplace people route', why:'Uses psychology interest in workplace settings with broader employment options.', route:'BA/BCom HR, Industrial Psychology or related route.', next:'Ask about registration and internship requirements.' }
      ]},
      teaching: { label:'Teaching', match:['teaching','education'], note:'Teaching can be stable and meaningful, but phase/subject choice and bursary obligations matter.', alternatives:[
        { title:'Priority-subject Teaching', tag:'Bursary-aligned', why:'Maths, science and language teaching may align better with funding and demand.', route:'BEd with priority subject focus or PGCE route.', next:'Check Funza Lushaka rules and service obligations.' },
        { title:'ECD / Foundation Phase', tag:'Early learning route', why:'Good for students drawn to younger learners and care-oriented education.', route:'BEd Foundation Phase or ECD qualifications.', next:'Ask about recognition and employment settings.' },
        { title:'Training / Facilitation', tag:'Non-school option', why:'Education skills can be used in NGOs, corporate training and community programmes.', route:'Education/training certificates plus facilitation experience.', next:'Compare school teaching vs training route.' }
      ]},
      design: { label:'Design / Creative', match:['design','creative'], note:'Creative careers depend heavily on portfolio and market access. Avoid overpaying for prestige without employability evidence.', alternatives:[
        { title:'UX / Digital Product Design', tag:'Employability bridge', why:'Combines creativity with tech and problem-solving, often with stronger job-market signals than pure art routes.', route:'Design diploma/short courses + portfolio.', next:'Build a portfolio case study before enrolling.' },
        { title:'Marketing Content / Brand', tag:'Commercial creative route', why:'Uses writing, design and storytelling in business contexts.', route:'Marketing/communications/design route plus portfolio.', next:'Compare design degree vs marketing/content route.' },
        { title:'Freelance Skill Stack', tag:'Low-cost test', why:'Lets the student test real demand before committing to expensive creative study.', route:'Short courses + portfolio + small paid projects.', next:'Complete three sample projects and ask for feedback from working creatives.' }
      ]},
      business: { label:'Business / Entrepreneurship', match:['entrepreneurship','business'], note:'Entrepreneurship is not a qualification by itself. Pair the interest with a concrete, marketable skill.', alternatives:[
        { title:'Practical Skill + Business', tag:'Stronger foundation', why:'A trade, design, accounting, coding or sales skill gives the business something real to sell.', route:'Marketable skill route plus business basics.', next:'Choose the skill first, then compare business study options.' },
        { title:'Sales / Digital Marketing', tag:'Fast exposure', why:'Builds commercial confidence and employability while testing entrepreneurial appetite.', route:'Short course/diploma plus entry-level work.', next:'Ask employers what entry-level roles require.' },
        { title:'Accounting / Operations', tag:'Business backbone', why:'Useful for students who want to run things but need practical financial and operational literacy.', route:'Accounting/logistics/operations route.', next:'Compare BCom vs diploma/work route.' }
      ]},
      unsure: { label:'General university degree unsure', match:['general','unsure'], note:'If the student is unsure, avoid expensive commitments until they have tested interests and realistic routes.', alternatives:[
        { title:'Gap year with structure', tag:'Clarity route', why:'A structured year can be safer than entering the wrong expensive degree.', route:'Work, volunteer, short courses, job-shadowing and applications plan.', next:'Set monthly goals and re-run Career Fit after exposure.' },
        { title:'Higher Certificate / Bridging Route', tag:'Lower-risk entry', why:'Can test readiness and direction without the full cost of a degree.', route:'Higher Certificate linked to possible articulation.', next:'Ask whether credits articulate into a diploma or degree.' },
        { title:'Work-and-study', tag:'Earn while deciding', why:'Keeps the household stable while the student builds exposure and maturity.', route:'Part-time/distance study plus entry-level work.', next:'Compare against full-time campus study.' }
      ]}
    };

    function renderAlternativeFinder(container, currentTitle = '') {
      if (!container) return;
      const selectedKey = inferAlternativeKey(currentTitle);
      const options = Object.keys(saferAlternativeLibrary).map(key => `<option value="${key}" ${key === selectedKey ? 'selected' : ''}>${saferAlternativeLibrary[key].label}</option>`).join('');
      container.innerHTML = `<span class="eyebrow">Safer routes to compare</span><h3>Safer routes to compare</h3><p>Plan A may still be valid. This section simply gives the household related routes to investigate before committing money, debt or accommodation.</p><div class="alternative-controls"><div class="form-group" style="margin-bottom:0;"><label>Dream route / first choice</label><select data-alt-select>${options}</select></div><a href="/tools/route-compare" class="btn btn-secondary">Compare in Route Compare</a></div><div data-alt-note class="template-note"></div><div class="alternative-grid" data-alt-grid></div>`;
      const select = container.querySelector('[data-alt-select]');
      const render = () => renderAlternativeCards(container, select.value);
      select.addEventListener('change', render);
      render();
    }

    function inferAlternativeKey(title = '') {
      const lower = title.toLowerCase();
      for (const [key, value] of Object.entries(saferAlternativeLibrary)) {
        if (value.match.some(term => lower.includes(term))) return key;
      }
      return 'unsure';
    }

    function renderAlternativeCards(container, key) {
      const data = saferAlternativeLibrary[key] || saferAlternativeLibrary.unsure;
      const note = container.querySelector('[data-alt-note]');
      const grid = container.querySelector('[data-alt-grid]');
      if (note) note.textContent = data.note;
      if (grid) grid.innerHTML = data.alternatives.slice(0, 3).map(alt => `<div class="alternative-card"><div class="alt-tag">${alt.tag}</div><h4>${alt.title}</h4><p><strong>Why it may be safer:</strong> ${alt.why}</p><p><strong>Typical route:</strong> ${alt.route}</p><p><strong>What to ask next:</strong> ${alt.next}</p></div>`).join('');
    }

    function renderResidenceRisk(container, reality, cost) {
      if (!container) return;
      if (!cost || !cost.breakdown) {
        container.innerHTML = `<span class="eyebrow">Can we afford residence?</span><h3>Can we afford residence?</h3><p>Run the True Cost Calculator first so this section can read accommodation, food, transport and first-month setup costs.</p>`;
        return;
      }
      const b = cost.breakdown || {};
      const accom = b.accom || 0;
      const food = b.food || 0;
      const transport = b.transport || 0;
      const data = b.data || 0;
      const livingAnnual = accom + food + transport + data;
      const livingMonthly = livingAnnual / 12;
      const capacity = reality && reality.capacity ? reality.capacity : 0;
      const firstMonth = cost.firstMonthCost || 0;
      let risk = 'Avoided', cls = 'green', explanation = 'You have not added accommodation costs. This route appears to avoid the living-away cost shock, which may be a strategic affordability advantage.';
      if (accom > 0) {
        const ratio = capacity > 0 ? livingMonthly / capacity : Infinity;
        if (!isFinite(ratio) || capacity <= 0 || ratio > 1.10) { risk = 'Severe risk'; cls = 'red'; explanation = 'Living-away costs appear to exceed or overwhelm the household study capacity. Compare living-at-home, distance, TVET or closer-campus routes before signing accommodation agreements.'; }
        else if (ratio > 0.75) { risk = 'High risk'; cls = 'red'; explanation = 'Living-away costs use most of the household study capacity. Get funding confirmation and compare a living-at-home route before committing.'; }
        else if (ratio > 0.40) { risk = 'Moderate risk'; cls = 'amber'; explanation = 'Living away may be possible, but it uses a meaningful part of the household capacity. Check deposits, food, transport-home costs and refund rules.'; }
        else { risk = 'Low risk'; cls = 'green'; explanation = 'Living-away costs appear to fit within the current study capacity, but deposits and first-month cash needs still need to be confirmed.'; }
      }
      container.innerHTML = `<span class="eyebrow">Can we afford residence?</span><h3>Can we afford residence?</h3><p>${explanation}</p><div class="residence-risk-grid"><div class="residence-risk-item"><div class="residence-risk-label">Living-away monthly burden</div><div class="residence-risk-value">${formatR(livingMonthly)}/mo</div></div><div class="residence-risk-item"><div class="residence-risk-label">First-month cash need</div><div class="residence-risk-value">${formatR(firstMonth)}</div></div><div class="residence-risk-item"><div class="residence-risk-label">Residence risk</div><div class="residence-risk-value ${cls}">${risk}</div></div></div><ul><li>Compare a living-at-home route.</li><li>Compare a closer institution.</li><li>Compare a distance / online route.</li><li>Compare a TVET route where relevant.</li><li>Ask the institution about residence deposits, refund rules and cancellation deadlines.</li><li>Do not sign accommodation contracts until funding is confirmed in writing.</li></ul>`;
    }

    function renderFundingGuidance(container, reality, cost, fit) {
      if (!container) return;
      const routes = buildFundingRoutes(reality, cost, fit);
      container.innerHTML = `<span class="eyebrow">Funding routes to investigate</span><h2 style="font-size: clamp(1.6rem, 3vw, 2.25rem);">Funding routes to investigate</h2><p>This is not a bursary search or funding guarantee. It is a careful shortlist of funding routes worth investigating based on the information currently saved in your browser.</p><div class="funding-grid">${routes.map(route => renderFundingCard(route)).join('')}</div><p class="funding-warning"><strong>Funding warning:</strong> Do not pay non-refundable deposits, sign accommodation contracts or take private loans while assuming funding will be approved. Get funding outcomes, payment-plan terms and refund rules in writing.</p>`;
    }

    function buildFundingRoutes(reality, cost, fit) {
      const topTitles = fit && fit.top ? fit.top.join(' ').toLowerCase() : '';
      const highPressure = reality && ['severe','high'].includes(reality.pressure);
      const missingMiddle = reality && reality.bracket === 'Missing middle';
      const overCapacity = reality && cost && reality.capacity > 0 && cost.netMonthly > reality.capacity;
      const highCost = cost && (cost.programmeTotal > 250000 || cost.totalAnnual > 100000);
      return [
        { title:'Funza Lushaka teaching bursary', relevance: topTitles.includes('teaching')||topTitles.includes('education')?'High relevance':'Possible', level: topTitles.includes('teaching')||topTitles.includes('education')?'high':'possible', who:'Students seriously considering teaching, especially priority subjects and phases.', check:'Check current eligibility, priority subjects, service obligations, application dates and whether the chosen qualification/provider qualifies.', warning:'This is field-specific. Do not rely on it for non-teaching routes.' },
        { title:'Provincial health bursaries', relevance: topTitles.includes('health')||topTitles.includes('nursing')?'High relevance':'Possible', level: topTitles.includes('health')||topTitles.includes('nursing')?'high':'possible', who:'Students considering nursing, allied health, medicine, emergency care or health support roles.', check:'Check provincial Department of Health bursaries, professional-registration obligations, community service and clinical-placement requirements.', warning:'Health bursaries may come with service obligations and strict programme/provider rules.' },
        { title:'SETA learnerships', relevance: topTitles.includes('software')||topTitles.includes('trades')||topTitles.includes('logistics')?'High relevance':'Possible', level: topTitles.includes('software')||topTitles.includes('trades')||topTitles.includes('logistics')?'high':'possible', who:'Students open to occupational certificates, paid workplace learning, trades, ICT, logistics, business services or practical entry routes.', check:'Check the relevant SETA, employer partner, stipend, qualification level, contract length and whether placement is guaranteed.', warning:'A learnership is not the same as a degree. Compare long-term ceiling and immediate employability.' },
        { title:'Bank / corporate bursaries', relevance: highCost||missingMiddle||overCapacity?'High relevance':'Possible', level: highCost||missingMiddle||overCapacity?'high':'possible', who:'Students in fields corporates often fund, including accounting, engineering, ICT, data, actuarial, law, mining and scarce skills.', check:'Check academic requirements, service-back obligations, annual renewal rules and whether accommodation/devices/books are included.', warning:'A bursary can reduce cost, but losing it later can leave the family exposed.' },
        { title:'Institution merit awards', relevance:'Possible', level:'possible', who:'Students with stronger marks or specific talent, even when household income is above NSFAS thresholds.', check:'Ask the institution about automatic merit awards, faculty awards, sports/cultural awards and whether awards renew after first year.', warning:'Some awards are once-off. Confirm renewal conditions before relying on them.' },
        { title:'Payment plans', relevance: overCapacity||highPressure?'Possible but risky':'Possible', level: overCapacity||highPressure?'possible':'low', who:'Families who can pay monthly but cannot cover the full annual amount upfront.', check:'Ask for instalment schedules, admin fees, interest, consequences of missed payments and whether registration blocks apply.', warning:'A payment plan is not funding. It can still overload the household monthly budget.' },
        { title:'Employer-sponsored study / work-and-study', relevance: highPressure||overCapacity?'High relevance':'Possible', level: highPressure||overCapacity?'high':'possible', who:'Students who need to earn while building a qualification, or families that cannot carry full-time study costs safely.', check:'Check employer study support, learnerships, internships, apprenticeships, part-time study policies and distance-learning compatibility.', warning:'Work-and-study is slower and demanding, but it can reduce debt and keep the household stable.' }
      ];
    }

    function renderFundingCard(route) {
      return `<div class="funding-card ${route.level}"><div class="funding-tag">${route.relevance}</div><h4>${route.title}</h4><p><strong>Who this may fit:</strong> ${route.who}</p><p><strong>What to check:</strong> ${route.check}</p><p><strong>Risk warning:</strong> ${route.warning}</p></div>`;
    }

    function renderCareerRecommendation(career, idx, fitData) {
      const path = pathways[career] || makePlaceholderPath(career);
      const detail=fitData&&fitData.detailedTop?fitData.detailedTop.find(i=>i.title===career):null;
      const detailBlock=detail?`<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:var(--space-4);margin-bottom:var(--space-6);"><div><div class="pathway-fact-label">Overall match</div><div class="pathway-fact-value">${detail.match}%</div></div><div><div class="pathway-fact-label">Interest fit</div><div class="pathway-fact-value">${detail.fitScore}%</div></div><div><div class="pathway-fact-label">Readiness</div><div class="pathway-fact-value">${detail.readinessScore}%</div></div></div>`:'';
      const readinessNotes=detail&&detail.readinessNotes&&detail.readinessNotes.length?`<div style="background:var(--paper-deep);border-left:3px solid var(--amber);padding:var(--space-4) var(--space-6);margin-bottom:var(--space-6);font-size:0.9rem;color:var(--ink-soft);"><strong>Readiness notes:</strong><ul style="padding-left:1.2rem;margin-top:0.5rem;">${detail.readinessNotes.map(n=>`<li>${n}</li>`).join('')}</ul></div>`:'';
      return `<section style="padding:0;margin-bottom:var(--space-16);"><span class="eyebrow">Match #${idx+1}</span><h2 style="margin-bottom:var(--space-4);">${career}</h2>${detailBlock}${readinessNotes}<div style="background:var(--paper-deep);border-left:3px solid var(--terracotta);padding:var(--space-4) var(--space-6);margin-bottom:var(--space-6);font-size:0.9rem;color:var(--ink-soft);"><strong>Labour-market signal:</strong> ${path.oihd}</div>${renderPathwayCard('— Cheapest viable',path.cheapest,'')}${renderPathwayCard('— Highest employability',path.employable,'ink')}${renderPathwayCard('— Fastest to earning',path.fastest,'amber')}<div class="form-section" style="margin-top:var(--space-6);"><h3>Questions to ask before choosing this field</h3><ul style="padding-left:1.5rem;color:var(--ink-soft);line-height:1.8;"><li>What is the lowest-cost credible route into this field?</li><li>Which qualification level is enough to start earning?</li><li>Does this route require professional registration, workplace learning or articles?</li><li>Can the student test this field through job-shadowing, volunteering, vacation work or a short course first?</li></ul></div></section>`;
    }

    function renderReportWarnings(reality, cost, fit) {
      const warnings=[];
      if (!reality) warnings.push('Reality Check was not completed. The affordability section of this report is incomplete.');
      if (!cost) warnings.push('True Cost Calculator was not completed. The report does not yet show annual, monthly or full-programme exposure.');
      if (reality&&cost&&reality.capacity>0&&cost.netMonthly>reality.capacity) warnings.push(`The last costed route appears to exceed monthly capacity by about ${formatR(cost.netMonthly-reality.capacity)} per month.`);
      if (cost&&cost.firstMonthCost&&cost.netMonthly&&cost.firstMonthCost>cost.netMonthly*1.8) warnings.push('The first-month cash need is materially higher than the average monthly burden. This may require planning before registration.');
      if (reality&&['severe','high'].includes(reality.pressure)) warnings.push('Household pressure is high. Prioritise funded, lower-cost, living-at-home, TVET, distance or work-and-study routes before high-debt routes.');
      if (fit&&fit.detailedTop&&fit.detailedTop.some(c=>c.readinessScore<65)) warnings.push('At least one high-interest career fit has a readiness warning. Consider bridging, diploma, TVET or extended-curriculum options rather than assuming direct degree entry.');
      if (!warnings.length) warnings.push('No major automated warning was triggered. All fees, admission rules, accreditation and funding must still be verified directly before any commitment.');
      return `<span class="eyebrow">Warning flags</span><h3>Before anyone commits money</h3><ul style="padding-left:1.5rem;color:var(--ink-soft);line-height:1.8;margin-top:var(--space-4);">${warnings.map(w=>`<li>${w}</li>`).join('')}</ul><p style="margin-top:var(--space-6);color:var(--ink-mute);font-size:0.92rem;">This section is automated decision support. It does not replace direct verification with institutions, funders or professional bodies.</p>`;
    }

    function renderPathwayCard(label, p, cls) {
      return `<div class="pathway-card ${cls}"><div class="pathway-label">${label}</div><h3>${p.title}</h3><p>${p.summary}</p><div class="pathway-facts"><div><div class="pathway-fact-label">Cost</div><div class="pathway-fact-value">${p.cost}</div></div><div><div class="pathway-fact-label">Duration</div><div class="pathway-fact-value">${p.duration}</div></div><div><div class="pathway-fact-label">Qualification</div><div class="pathway-fact-value">${p.qualification}</div></div></div>${p.tradeoffs?`<p><strong>Trade-offs:</strong> ${p.tradeoffs}</p>`:''}<p style="margin:0;"><strong style="color:var(--terracotta);">This week:</strong> ${p.thisWeek}</p></div>`;
    }


    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', bootDharmaTools);
    } else {
      setTimeout(bootDharmaTools, 0);
    }

