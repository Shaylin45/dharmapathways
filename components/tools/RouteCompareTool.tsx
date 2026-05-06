'use client';

import { FormEvent, useMemo, useRef, useState } from 'react';

type QualType =
  | 'hcert'
  | 'acert'
  | 'diploma'
  | 'adip'
  | 'bachelor'
  | 'hons'
  | 'pgdip'
  | 'masters'
  | 'phd'
  | 'ncv'
  | 'trade'
  | 'learnership';

type FieldKey =
  | 'trades'
  | 'health'
  | 'engineering'
  | 'software'
  | 'teaching'
  | 'finance'
  | 'logistics'
  | 'agriculture'
  | 'marketing'
  | 'hospitality'
  | 'design'
  | 'law'
  | 'psychology'
  | 'general';

type RouteState = {
  name: string;
  qual: QualType;
  field: FieldKey;
  duration: string;
  cost: string;
  support: string;
  fundingCertainty: string;
  admission: string;
  accreditation: string;
  completion: string;
  workIntegrated: string;
  job: string;
  jobEdited: boolean;
  bottleneck: string;
};

type StoredReality = {
  capacity?: number;
  pressureBand?: string;
};

type EmploymentSignal = {
  suggested: number;
  capped: number;
  base: number;
  routeStrength: number;
  modifiers: string[];
  caution: string[];
  explanation: string;
};

type RouteScore = {
  costScore: number;
  durationScore: number;
  affordabilityScore: number;
  exposure: number;
  monthlyExposure: number;
  employment: EmploymentSignal;
  total: number;
  riskFlags: string[];
};

type StoredRoute = {
  name: string;
  qual: QualType;
  field: FieldKey;
  fieldLabel: string;
  duration: number;
  cost: number;
  support: number;
  fundingCertainty: number;
  admission: number;
  accreditation: number;
  completion: number;
  workIntegrated: number;
  job: number;
  suggestedEmploymentSignal: number;
  bottleneck: string;
  employmentBasis: string;
  modifiers: string[];
};

type Result = {
  a: StoredRoute;
  b: StoredRoute;
  sa: RouteScore;
  sb: RouteScore;
  verdict: string;
  verdictBody: string;
  implications: string[];
};

type Template = {
  title: string;
  description: string;
  a: Omit<RouteState, 'jobEdited'>;
  b: Omit<RouteState, 'jobEdited'>;
};

const STORAGE_KEY = 'dharma_compare';

const qualLabels: Record<QualType, string> = {
  hcert: 'Higher Certificate',
  acert: 'Advanced Certificate',
  diploma: 'Diploma',
  adip: 'Advanced Diploma',
  bachelor: "Bachelor's Degree",
  hons: 'Honours',
  pgdip: 'Postgraduate Diploma',
  masters: "Master's",
  phd: 'Doctorate',
  ncv: 'TVET / NCV / NATED',
  trade: 'Trade / apprenticeship',
  learnership: 'Learnership / work-based route',
};

const fieldSignals: Record<FieldKey, { label: string; base: number; basis: string }> = {
  trades: { label: 'Trades / Artisan', base: 78, basis: 'Strong artisan demand and clearer occupational route where trade testing or apprenticeship is completed.' },
  health: { label: 'Nursing / Allied Health', base: 76, basis: 'Health and care fields have stronger demand signals, but accreditation and clinical/practical placement must be verified.' },
  engineering: { label: 'Engineering', base: 75, basis: 'Engineering has strong demand signals, with outcomes depending heavily on maths readiness, completion and practical exposure.' },
  software: { label: 'Software / Data / IT', base: 75, basis: 'Digital skills remain in demand, but employability depends on portfolio, practical skill and current tools.' },
  teaching: { label: 'Teaching - priority subjects', base: 72, basis: 'Teaching demand is stronger in priority subjects and shortage areas than in generic pathways.' },
  finance: { label: 'Finance / Accounting', base: 70, basis: 'Structured professional and clerkship routes can work well when the qualification is recognised.' },
  logistics: { label: 'Logistics / Supply Chain', base: 68, basis: 'A practical operations field with visible demand, especially when paired with workplace experience.' },
  agriculture: { label: 'Agriculture / Environment', base: 62, basis: 'Moderate signal with regional differences; practical exposure and sector links matter.' },
  marketing: { label: 'Marketing / Communications', base: 58, basis: 'Opportunity exists, but entry is portfolio- and network-sensitive with uneven first-job certainty.' },
  hospitality: { label: 'Hospitality / Tourism', base: 55, basis: 'Work exists, but pay, seasonality and progression can vary strongly by employer and region.' },
  design: { label: 'Design / Creative', base: 52, basis: 'Creative routes are portfolio-led and competitive; qualification alone is rarely enough.' },
  law: { label: 'Law', base: 50, basis: 'Law is competitive and has a known post-study bottleneck around articles, admission and practical entry.' },
  psychology: { label: 'Psychology', base: 45, basis: 'Psychology often requires postgraduate selection and supervised registration before stable professional work.' },
  general: { label: 'General degree / unsure', base: 42, basis: 'A generic route without a clear occupational pathway carries weaker employment certainty.' },
};

const defaultRouteA: RouteState = {
  name: 'Public university degree',
  qual: 'bachelor',
  field: 'general',
  duration: '3',
  cost: '360000',
  support: '0',
  fundingCertainty: '25',
  admission: '65',
  accreditation: '85',
  completion: '60',
  workIntegrated: '40',
  job: '50',
  jobEdited: false,
  bottleneck: 'none',
};

const defaultRouteB: RouteState = {
  name: 'TVET diploma / practical route',
  qual: 'ncv',
  field: 'trades',
  duration: '3',
  cost: '90000',
  support: '50',
  fundingCertainty: '50',
  admission: '85',
  accreditation: '75',
  completion: '70',
  workIntegrated: '80',
  job: '74',
  jobEdited: false,
  bottleneck: 'none',
};

const templates: Template[] = [
  {
    title: 'University residence vs living at home',
    description: 'Same public university route, but one carries the accommodation burden.',
    a: { ...defaultRouteA, name: 'Public university with residence', field: 'general', cost: '480000', admission: '75', accreditation: '85', completion: '65', workIntegrated: '40', bottleneck: 'generic' },
    b: { ...defaultRouteA, name: 'Public university living at home', field: 'general', cost: '270000', admission: '75', accreditation: '85', completion: '70', workIntegrated: '40', bottleneck: 'generic' },
  },
  {
    title: 'University degree vs TVET diploma',
    description: 'Traditional degree against a lower-cost technical or vocational option.',
    a: { ...defaultRouteA, name: 'Public university degree', field: 'general', cost: '360000', admission: '65', completion: '60', workIntegrated: '40', bottleneck: 'generic' },
    b: { ...defaultRouteB, name: 'TVET diploma / NATED route', qual: 'ncv', field: 'trades', cost: '90000', support: '50', fundingCertainty: '50', accreditation: '75', completion: '70', workIntegrated: '75' },
  },
  {
    title: 'Private college vs public university',
    description: 'Higher-fee private route against a public alternative.',
    a: { ...defaultRouteA, name: 'Private college route', qual: 'diploma', field: 'marketing', cost: '420000', admission: '85', accreditation: '60', completion: '65', workIntegrated: '55' },
    b: { ...defaultRouteA, name: 'Public university route', field: 'marketing', cost: '330000', admission: '65', accreditation: '85', completion: '60', workIntegrated: '40' },
  },
  {
    title: 'Distance study vs full-time campus',
    description: 'Lower-cost distance route against a fuller campus experience.',
    a: { ...defaultRouteA, name: 'Online / distance study', field: 'general', duration: '4', cost: '150000', admission: '80', accreditation: '80', completion: '50', workIntegrated: '35', bottleneck: 'generic' },
    b: { ...defaultRouteA, name: 'Full-time campus study', field: 'general', duration: '3', cost: '360000', admission: '70', accreditation: '85', completion: '65', workIntegrated: '45', bottleneck: 'generic' },
  },
  {
    title: 'BEng degree vs UoT engineering diploma',
    description: 'Professional engineering route against a practical diploma route.',
    a: { ...defaultRouteA, name: 'BEng degree', qual: 'bachelor', field: 'engineering', duration: '4', cost: '520000', admission: '45', accreditation: '90', completion: '55', workIntegrated: '55' },
    b: { ...defaultRouteA, name: 'UoT engineering diploma', qual: 'diploma', field: 'engineering', duration: '3', cost: '240000', admission: '70', accreditation: '85', completion: '65', workIntegrated: '80' },
  },
  {
    title: 'BCom CA route vs accounting diploma',
    description: 'Long CA-style route against a faster accounting route.',
    a: { ...defaultRouteA, name: 'BCom CA route', qual: 'hons', field: 'finance', duration: '4', cost: '430000', admission: '55', accreditation: '90', completion: '55', workIntegrated: '70', bottleneck: 'professional' },
    b: { ...defaultRouteA, name: 'Accounting diploma / clerk route', qual: 'diploma', field: 'finance', duration: '2', cost: '90000', admission: '85', accreditation: '75', completion: '75', workIntegrated: '70' },
  },
  {
    title: 'Medicine dream vs allied health / nursing',
    description: 'High-barrier health route against a more accessible health route.',
    a: { ...defaultRouteA, name: 'Medicine route', qual: 'bachelor', field: 'health', duration: '6', cost: '750000', admission: '35', accreditation: '90', completion: '55', workIntegrated: '85', bottleneck: 'professional' },
    b: { ...defaultRouteA, name: 'Nursing / allied health route', qual: 'bachelor', field: 'health', duration: '4', cost: '320000', support: '50', fundingCertainty: '50', admission: '65', accreditation: '85', completion: '70', workIntegrated: '80' },
  },
  {
    title: 'Law degree vs legal support route',
    description: 'LLB-style route against a lower-risk legal-adjacent route.',
    a: { ...defaultRouteA, name: 'LLB / law degree route', qual: 'bachelor', field: 'law', duration: '4', cost: '420000', admission: '65', accreditation: '90', completion: '60', workIntegrated: '45', bottleneck: 'professional' },
    b: { ...defaultRouteA, name: 'Paralegal / compliance route', qual: 'diploma', field: 'law', duration: '2', cost: '110000', admission: '85', accreditation: '75', completion: '75', workIntegrated: '65' },
  },
];

function toNumber(value: string | number, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function clamp(value: number, min = 0, max = 100) {
  return Math.min(max, Math.max(min, value));
}

function formatR(value: number) {
  return 'R ' + Math.round(value || 0).toLocaleString('en-ZA');
}

function supportText(value: number) {
  if (value >= 100) return 'Full';
  if (value >= 50) return 'Some';
  return 'None';
}

function getStoredReality(): StoredReality | null {
  try {
    const raw = window.localStorage.getItem('dharma_reality');
    return raw ? (JSON.parse(raw) as StoredReality) : null;
  } catch {
    return null;
  }
}

function routeStrength(route: RouteState) {
  const qualStrength: Record<QualType, number> = {
    hcert: 56,
    acert: 60,
    diploma: 72,
    adip: 74,
    bachelor: 74,
    hons: 78,
    pgdip: 78,
    masters: 80,
    phd: 76,
    ncv: 70,
    trade: 86,
    learnership: 82,
  };

  let strength = qualStrength[route.qual] ?? 60;
  if (route.field === 'general') strength -= 10;
  if (route.qual === 'trade' || route.qual === 'learnership') strength += 4;
  if (route.field === 'law' && route.qual === 'bachelor') strength -= 6;
  if (route.field === 'psychology' && !['masters', 'hons'].includes(route.qual)) strength -= 12;
  return clamp(strength, 25, 95);
}

function suggestEmploymentSignal(route: RouteState): EmploymentSignal {
  const base = fieldSignals[route.field].base;
  const routeStrengthScore = routeStrength(route);
  const work = toNumber(route.workIntegrated, 50);
  const accreditation = toNumber(route.accreditation, 60);
  const completion = toNumber(route.completion, 60);
  const modifiers: string[] = [];
  const caution: string[] = [];

  let score = base * 0.45 + routeStrengthScore * 0.2 + work * 0.15 + accreditation * 0.1 + completion * 0.1;

  if (work >= 90) {
    score += 8;
    modifiers.push('Built-in or employer-linked workplace exposure added a strong positive adjustment.');
  } else if (work >= 75) {
    score += 5;
    modifiers.push('Required practical exposure added a positive adjustment.');
  } else if (work < 50) {
    score -= 8;
    caution.push('Weak workplace exposure reduces the first-job signal.');
  }

  if (accreditation < 60) {
    score -= 15;
    caution.push('Accreditation is not verified strongly enough; do not pay deposits before checking official sources.');
  } else if (accreditation >= 90) {
    score += 5;
    modifiers.push('Accreditation and registration confidence improved the signal.');
  }

  if (completion < 55) {
    score -= 10;
    caution.push('Completion confidence is low, so the route is penalised for repeat/dropout risk.');
  }

  if (route.bottleneck === 'professional' || route.field === 'law' || route.field === 'psychology') {
    score -= 8;
    caution.push('This field has a known bottleneck after study, such as articles, postgraduate selection, supervised registration or limited placements.');
  }

  if (route.bottleneck === 'generic' || route.field === 'general') {
    score -= 10;
    caution.push('This route is generic or unclear, so it needs a stronger occupational pathway before committing.');
  }

  if (base >= 70 && accreditation >= 75 && routeStrengthScore >= 72) {
    score += 5;
    modifiers.push('High-demand field plus a recognised route added a modest positive adjustment.');
  }

  const suggested = Math.round(clamp(score, 25, 88));

  return {
    suggested,
    capped: suggested,
    base,
    routeStrength: routeStrengthScore,
    modifiers,
    caution,
    explanation: `${fieldSignals[route.field].basis} This is a decision-support employment signal, not a promise of work.`,
  };
}

function routeToStored(route: RouteState): StoredRoute {
  const employment = suggestEmploymentSignal(route);
  return {
    name: route.name.trim() || 'Route option',
    qual: route.qual,
    field: route.field,
    fieldLabel: fieldSignals[route.field].label,
    duration: toNumber(route.duration, 1),
    cost: toNumber(route.cost),
    support: toNumber(route.support),
    fundingCertainty: toNumber(route.fundingCertainty),
    admission: toNumber(route.admission),
    accreditation: toNumber(route.accreditation),
    completion: toNumber(route.completion),
    workIntegrated: toNumber(route.workIntegrated),
    job: toNumber(route.job, employment.suggested),
    suggestedEmploymentSignal: employment.suggested,
    bottleneck: route.bottleneck,
    employmentBasis: employment.explanation,
    modifiers: [...employment.modifiers, ...employment.caution],
  };
}

function scoreRoute(route: RouteState, reality: StoredReality | null): RouteScore {
  const employment = suggestEmploymentSignal(route);
  const cost = toNumber(route.cost);
  const support = toNumber(route.support);
  const duration = Math.max(1, toNumber(route.duration, 1));
  const exposure = cost * (1 - support / 100);
  const monthlyExposure = exposure / (duration * 12);
  const capacity = reality?.capacity && reality.capacity > 0 ? reality.capacity : null;
  const costScore = clamp(100 - exposure / 8000);
  const durationScore = clamp(100 - duration * 10);
  const affordabilityScore = capacity ? clamp(100 - (monthlyExposure / capacity) * 55) : costScore;
  const finalEmploymentSignal = toNumber(route.job, employment.suggested);

  const total =
    affordabilityScore * 0.18 +
    costScore * 0.12 +
    durationScore * 0.08 +
    support * 0.08 +
    toNumber(route.fundingCertainty) * 0.1 +
    toNumber(route.admission) * 0.1 +
    toNumber(route.accreditation) * 0.1 +
    toNumber(route.completion) * 0.1 +
    toNumber(route.workIntegrated) * 0.08 +
    finalEmploymentSignal * 0.16;

  const riskFlags: string[] = [];
  if (capacity && monthlyExposure > capacity) riskFlags.push(`Monthly exposure is above your saved household study capacity of ${formatR(capacity)}.`);
  if (toNumber(route.accreditation) < 60) riskFlags.push('Accreditation confidence is too weak for a deposit decision.');
  if (toNumber(route.completion) < 55) riskFlags.push('Completion risk is high; repeat-year costs must be planned.');
  if (toNumber(route.workIntegrated) < 60) riskFlags.push('Workplace exposure is weak; ask about placements and graduate outcomes.');
  if (finalEmploymentSignal < 50) riskFlags.push('Employment signal is below 50; treat this as high-risk unless you have stronger evidence.');
  if (duration > 4) riskFlags.push('Long route: more years increases funding, burnout and repeat risk.');
  if (exposure > 300000) riskFlags.push('Large out-of-pocket exposure: check debt and fallback plans before committing.');

  return {
    costScore,
    durationScore,
    affordabilityScore,
    exposure,
    monthlyExposure,
    employment,
    total,
    riskFlags,
  };
}

function edge(aName: string, bName: string, aValue: number, bValue: number, mode: 'higher' | 'lower') {
  if (Math.abs(aValue - bValue) < 0.01) return 'Tied';
  return mode === 'lower' ? (aValue < bValue ? aName : bName) : aValue > bValue ? aName : bName;
}

function updateEmployment(route: RouteState, patch: Partial<RouteState>): RouteState {
  const next = { ...route, ...patch };
  if (!next.jobEdited) {
    next.job = String(suggestEmploymentSignal(next).suggested);
  }
  return next;
}

function buildImplications(a: StoredRoute, b: StoredRoute, sa: RouteScore, sb: RouteScore, reality: StoredReality | null) {
  const implications = new Set<string>();
  if (reality?.capacity && reality.capacity > 0) {
    implications.add(`Monthly check: ${a.name} needs about ${formatR(sa.monthlyExposure)}/month and ${b.name} needs about ${formatR(sb.monthlyExposure)}/month, against your saved capacity of ${formatR(reality.capacity)}/month.`);
  } else {
    implications.add('Run Tool 1 first if you want this comparison to judge monthly affordability against household study capacity.');
  }

  [...sa.riskFlags, ...sb.riskFlags].forEach((flag) => implications.add(flag));
  if (Math.abs(sa.total - sb.total) < 5) implications.add('These routes are close. Choose based on fit, verified funding, and whether the household can carry the route to completion.');
  if (a.suggestedEmploymentSignal !== a.job || b.suggestedEmploymentSignal !== b.job) implications.add('One employment signal was manually adjusted. Keep notes on the evidence for that adjustment: employer link, placement data, graduate outcomes or registration route.');
  implications.add('Before committing, ask each provider for graduate employment outcomes, placement support, accreditation/registration proof, repeat-year costs and refund rules.');
  return Array.from(implications);
}

function calculateResult(routeA: RouteState, routeB: RouteState, reality: StoredReality | null): Result {
  const a = routeToStored(routeA);
  const b = routeToStored(routeB);
  const sa = scoreRoute(routeA, reality);
  const sb = scoreRoute(routeB, reality);
  const diff = sa.total - sb.total;
  let verdict = `${a.name} and ${b.name} are roughly equivalent.`;
  let verdictBody = 'Neither is meaningfully safer on these inputs. Fit, verified funding and household preference should decide.';

  if (Math.abs(diff) >= 5 && diff > 0) {
    verdict = `${a.name} is the safer route on these inputs.`;
    verdictBody = `${a.name} scores ${Math.round(sa.total)}/100 vs ${Math.round(sb.total)}/100 for ${b.name}.`;
  }

  if (Math.abs(diff) >= 5 && diff < 0) {
    verdict = `${b.name} is the safer route on these inputs.`;
    verdictBody = `${b.name} scores ${Math.round(sb.total)}/100 vs ${Math.round(sa.total)}/100 for ${a.name}.`;
  }

  return {
    a,
    b,
    sa,
    sb,
    verdict,
    verdictBody,
    implications: buildImplications(a, b, sa, sb, reality),
  };
}

function saveResult(result: Result) {
  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        a: result.a,
        b: result.b,
        sa: result.sa,
        sb: result.sb,
        employmentModel: 'Route Compare V2 - employment signal',
        lastReviewed: 'May 2026',
      })
    );
  } catch {
    // Local storage can be unavailable in private contexts; the visible result still works.
  }
}

function RouteCard({
  title,
  route,
  onChange,
}: {
  title: string;
  route: RouteState;
  onChange: (patch: Partial<RouteState>) => void;
}) {
  const employment = suggestEmploymentSignal(route);

  return (
    <div className="compare-col form-section route-react-card">
      <h3>{title}</h3>
      <div className="form-group">
        <label htmlFor={`${title}-name`}>Short label</label>
        <input id={`${title}-name`} type="text" value={route.name} onChange={(event) => onChange({ name: event.target.value })} placeholder="e.g. BCom at UJ" required />
      </div>

      <div className="form-grid">
        <div className="form-group">
          <label htmlFor={`${title}-field`}>Field / route direction</label>
          <select id={`${title}-field`} value={route.field} onChange={(event) => onChange(updatePatch(route, { field: event.target.value as FieldKey }))}>
            {Object.entries(fieldSignals).map(([key, value]) => (
              <option key={key} value={key}>{value.label}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label htmlFor={`${title}-qual`}>Qualification type</label>
          <select id={`${title}-qual`} value={route.qual} onChange={(event) => onChange(updatePatch(route, { qual: event.target.value as QualType }))}>
            {Object.entries(qualLabels).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="form-grid">
        <div className="form-group">
          <label htmlFor={`${title}-duration`}>Duration in years</label>
          <select id={`${title}-duration`} value={route.duration} onChange={(event) => onChange({ duration: event.target.value })}>
            {[1, 2, 3, 4, 5, 6].map((year) => <option key={year} value={year}>{year}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label htmlFor={`${title}-cost`}>Total cost across all years</label>
          <div className="prefix-input"><input id={`${title}-cost`} type="number" min="0" step="1000" value={route.cost} onChange={(event) => onChange({ cost: event.target.value })} /></div>
        </div>
      </div>

      <div className="form-group">
        <label>Funding & support secured</label>
        <div className="segmented">
          {[
            ['0', 'None'],
            ['50', 'Some'],
            ['100', 'Full'],
          ].map(([value, label]) => (
            <span className="route-segment" key={value}>
              <input id={`${title}-support-${value}`} name={`${title}-support`} type="radio" value={value} checked={route.support === value} onChange={() => onChange({ support: value })} />
              <label htmlFor={`${title}-support-${value}`}>{label}</label>
            </span>
          ))}
        </div>
      </div>

      <div className="form-grid">
        <SelectField title={title} label="Funding certainty" value={route.fundingCertainty} onChange={(value) => onChange({ fundingCertainty: value })} options={[
          ['25', 'Not applied / uncertain'],
          ['50', 'Applied, outcome pending'],
          ['75', 'Likely / partially confirmed'],
          ['100', 'Confirmed in writing'],
        ]} />
        <SelectField title={title} label="Admission realism" value={route.admission} onChange={(value) => onChange({ admission: value })} options={[
          ['25', 'Stretch - may not meet entry requirements'],
          ['50', 'Possible - borderline or competitive'],
          ['75', 'Likely - requirements mostly met'],
          ['100', 'Confirmed / already accepted'],
        ]} />
        <SelectField title={title} label="Accreditation confidence" value={route.accreditation} onChange={(value) => onChange(updatePatch(route, { accreditation: value }))} options={[
          ['30', 'Unverified / not sure'],
          ['60', 'Looks legitimate, but not checked'],
          ['85', 'Checked on official source'],
          ['100', 'Checked + leads to required registration'],
        ]} />
        <SelectField title={title} label="Completion confidence" value={route.completion} onChange={(value) => onChange(updatePatch(route, { completion: value }))} options={[
          ['35', 'High dropout/repeat risk'],
          ['55', 'Moderate risk'],
          ['75', 'Reasonable confidence'],
          ['90', 'Strong support + strong fit'],
        ]} />
        <SelectField title={title} label="Workplace learning / practical exposure" value={route.workIntegrated} onChange={(value) => onChange(updatePatch(route, { workIntegrated: value }))} options={[
          ['40', 'None built in'],
          ['60', 'Optional / student must find it'],
          ['80', 'Required but not guaranteed'],
          ['100', 'Built-in or employer-linked'],
        ]} />
        <SelectField title={title} label="Known bottleneck after study" value={route.bottleneck} onChange={(value) => onChange(updatePatch(route, { bottleneck: value }))} options={[
          ['none', 'No obvious bottleneck'],
          ['generic', 'Generic route / unclear occupational path'],
          ['professional', 'Professional registration / articles / placement bottleneck'],
        ]} />
      </div>

      <div className="employment-signal-box">
        <div>
          <span className="eyebrow">Suggested employment signal</span>
          <h4>{employment.suggested}%</h4>
          <p>{employment.explanation}</p>
        </div>
        <div className="slider-group">
          <div className="slider-header">
            <span className="slider-label">Employment signal after completion</span>
            <span className="slider-value">{route.job}%</span>
          </div>
          <input type="range" min="25" max="88" value={route.job} onChange={(event) => onChange({ job: event.target.value, jobEdited: true })} />
          <div className="slider-helper">Adjust only if you have stronger evidence: placement data, employer link, registration route or graduate outcomes.</div>
        </div>
        <ul>
          {[...employment.modifiers, ...employment.caution].slice(0, 3).map((item) => <li key={item}>{item}</li>)}
        </ul>
      </div>
    </div>
  );
}

function updatePatch(route: RouteState, patch: Partial<RouteState>) {
  return updateEmployment(route, patch);
}

function SelectField({ title, label, value, options, onChange }: { title: string; label: string; value: string; options: [string, string][]; onChange: (value: string) => void }) {
  const id = `${title}-${label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
  return (
    <div className="form-group">
      <label htmlFor={id}>{label}</label>
      <select id={id} value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map(([optionValue, optionLabel]) => <option key={optionValue} value={optionValue}>{optionLabel}</option>)}
      </select>
    </div>
  );
}

function ResultTable({ result }: { result: Result }) {
  const { a, b, sa, sb } = result;
  const rows: [string, string, string, string][] = [
    ['Field / route direction', a.fieldLabel, b.fieldLabel, '—'],
    ['Qualification level', qualLabels[a.qual], qualLabels[b.qual], '—'],
    ['Total cost', formatR(a.cost), formatR(b.cost), edge(a.name, b.name, a.cost, b.cost, 'lower')],
    ['Out-of-pocket exposure', formatR(sa.exposure), formatR(sb.exposure), edge(a.name, b.name, sa.exposure, sb.exposure, 'lower')],
    ['Monthly exposure', formatR(sa.monthlyExposure), formatR(sb.monthlyExposure), edge(a.name, b.name, sa.monthlyExposure, sb.monthlyExposure, 'lower')],
    ['Time invested', `${a.duration} years`, `${b.duration} years`, edge(a.name, b.name, a.duration, b.duration, 'lower')],
    ['Funding secured', supportText(a.support), supportText(b.support), edge(a.name, b.name, a.support, b.support, 'higher')],
    ['Funding certainty', `${a.fundingCertainty}/100`, `${b.fundingCertainty}/100`, edge(a.name, b.name, a.fundingCertainty, b.fundingCertainty, 'higher')],
    ['Admission realism', `${a.admission}/100`, `${b.admission}/100`, edge(a.name, b.name, a.admission, b.admission, 'higher')],
    ['Accreditation confidence', `${a.accreditation}/100`, `${b.accreditation}/100`, edge(a.name, b.name, a.accreditation, b.accreditation, 'higher')],
    ['Completion confidence', `${a.completion}/100`, `${b.completion}/100`, edge(a.name, b.name, a.completion, b.completion, 'higher')],
    ['Workplace exposure', `${a.workIntegrated}/100`, `${b.workIntegrated}/100`, edge(a.name, b.name, a.workIntegrated, b.workIntegrated, 'higher')],
    ['Suggested employment signal', `${a.suggestedEmploymentSignal}%`, `${b.suggestedEmploymentSignal}%`, edge(a.name, b.name, a.suggestedEmploymentSignal, b.suggestedEmploymentSignal, 'higher')],
    ['Final employment signal', `${a.job}%`, `${b.job}%`, edge(a.name, b.name, a.job, b.job, 'higher')],
    ['Overall safety score', `${Math.round(sa.total)}/100`, `${Math.round(sb.total)}/100`, Math.abs(sa.total - sb.total) < 5 ? 'Tied' : sa.total > sb.total ? a.name : b.name],
  ];

  return (
    <table className="compare-result-table">
      <thead>
        <tr><th>Dimension</th><th>{a.name}</th><th>{b.name}</th><th>Edge</th></tr>
      </thead>
      <tbody>
        {rows.map(([dimension, aValue, bValue, winner]) => (
          <tr key={dimension}>
            <td>{dimension}</td>
            <td className={winner === a.name ? 'winner' : ''}>{aValue}</td>
            <td className={winner === b.name ? 'winner' : ''}>{bValue}</td>
            <td>{winner}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function RouteCompareTool() {
  const [routeA, setRouteA] = useState<RouteState>(() => updateEmployment(defaultRouteA, {}));
  const [routeB, setRouteB] = useState<RouteState>(() => updateEmployment(defaultRouteB, {}));
  const [result, setResult] = useState<Result | null>(null);
  const [reality] = useState<StoredReality | null>(() => (typeof window === 'undefined' ? null : getStoredReality()));
  const resultRef = useRef<HTMLDivElement | null>(null);

  const liveScores = useMemo(() => ({
    a: scoreRoute(routeA, reality),
    b: scoreRoute(routeB, reality),
  }), [routeA, routeB, reality]);

  function applyTemplate(template: Template) {
    setRouteA(updateEmployment({ ...template.a, jobEdited: false }, {}));
    setRouteB(updateEmployment({ ...template.b, jobEdited: false }, {}));
    setResult(null);
  }

  function resetRoutes() {
    setRouteA(updateEmployment(defaultRouteA, {}));
    setRouteB(updateEmployment(defaultRouteB, {}));
    setResult(null);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextResult = calculateResult(routeA, routeB, reality);
    saveResult(nextResult);
    setResult(nextResult);
    window.setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 0);
  }

  return (
    <div className="page-section active route-react-tool" data-page="route-compare-react">
      <section className="tool-header">
        <div className="container">
          <div className="progress">Step 03 of 04 · <span>Route Compare</span></div>
          <h1>Two paths, side-by-side. Which one is actually safer for you?</h1>
          <p className="lead">Now using the V2 employment signal model: field demand, route strength, workplace exposure, accreditation and completion risk.</p>
        </div>
      </section>

      <section className="tool-body">
        <div className="container">
          <div className="form-section route-template-section">
            <span className="eyebrow">Route templates</span>
            <h2 className="route-template-title">Not sure what to compare? Start here.</h2>
            <p className="helper">Choose a common South African study comparison to pre-fill the form. The estimates are conservative starting points, not recommendations.</p>
            <div className="template-grid">
              {templates.map((template) => (
                <button className="template-card" key={template.title} type="button" onClick={() => applyTemplate(template)}>
                  <strong>{template.title}</strong>
                  <span>{template.description}</span>
                </button>
              ))}
            </div>
            <p className="template-note">Employment signals use starter labour-market assumptions from the V2 model. Verify against current DHET, Stats SA, job-market and institution outcome data before committing.</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="compare-grid">
              <RouteCard title="Option A" route={routeA} onChange={(patch) => { setRouteA((current) => ({ ...current, ...patch })); setResult(null); }} />
              <RouteCard title="Option B" route={routeB} onChange={(patch) => { setRouteB((current) => ({ ...current, ...patch })); setResult(null); }} />
            </div>

            <div className="route-live-summary" aria-live="polite">
              <div>
                <span>Live safety score</span>
                <strong>{routeA.name || 'Option A'}: {Math.round(liveScores.a.total)}/100</strong>
              </div>
              <div>
                <span>Live safety score</span>
                <strong>{routeB.name || 'Option B'}: {Math.round(liveScores.b.total)}/100</strong>
              </div>
              <div>
                <span>Method basis</span>
                <strong>Last reviewed: May 2026</strong>
              </div>
            </div>

            <div className="method-note">
              <strong>Employment signal is not a promise.</strong> We suggest a starting score using South African labour-market signals and route characteristics. Adjust only when you have stronger evidence about the provider, employer link, placement rate, registration path or graduate outcomes.
            </div>

            <div className="form-actions form-actions-center">
              <button className="btn btn-primary" type="submit">Compare these routes →</button>
              <button className="btn btn-ghost" type="button" onClick={resetRoutes}>Reset</button>
            </div>
          </form>

          {result && (
            <div className="result-panel" ref={resultRef}>
              <span className="eyebrow eyebrow-soft">Comparison verdict</span>
              <div className={`verdict ${Math.abs(result.sa.total - result.sb.total) < 5 ? 'amber' : 'green'}`}>{result.verdict}</div>
              <p>{result.verdictBody}</p>
              <ResultTable result={result} />

              <div className="employment-why-grid">
                {[['Option A', result.a, result.sa], ['Option B', result.b, result.sb]].map(([label, route, score]) => {
                  const storedRoute = route as StoredRoute;
                  const routeScore = score as RouteScore;
                  return (
                    <div className="employment-why-card" key={storedRoute.name}>
                      <span className="eyebrow">Why this score? {label as string}</span>
                      <h4>{storedRoute.name}</h4>
                      <p>{routeScore.employment.explanation}</p>
                      <ul>
                        {[...routeScore.employment.modifiers, ...routeScore.employment.caution].map((item) => <li key={item}>{item}</li>)}
                        {!routeScore.employment.modifiers.length && !routeScore.employment.caution.length ? <li>No major positive or negative modifier was triggered.</li> : null}
                      </ul>
                    </div>
                  );
                })}
              </div>

              <h4 className="result-subheading">Things worth thinking about</h4>
              <ul>{result.implications.map((item) => <li key={item}>{item}</li>)}</ul>

              <div className="next-steps">
                <a className="btn btn-primary" href="/tools/fit-check">Next: Career Fit Check →</a>
                <button className="btn btn-secondary" type="button" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>Adjust answers</button>
                <button className="btn btn-print" type="button" onClick={() => window.print()}>Print / save as PDF</button>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
