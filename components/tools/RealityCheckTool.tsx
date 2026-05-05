'use client';

import { FormEvent, Fragment, useEffect, useMemo, useRef, useState } from 'react';

type IncomeStability = 'stable' | 'variable' | 'uncertain';
type Living = 'home' | 'away' | 'unsure';
type CreditPressure = 'low' | 'medium' | 'high';
type RouteType = 'publicUniversity' | 'uot' | 'tvet' | 'distance' | 'private' | 'trade' | 'learnership' | 'unsure';
type SupportLevel = 'strong' | 'some' | 'weak' | 'none';
type SetupNeed = 'low' | 'medium' | 'high' | 'unknown';
type StudentWork = 'no' | 'maybe' | 'yes';

type FormState = {
  income: string;
  dependents: string;
  earners: string;
  locationBand: 'metro' | 'town' | 'rural';
  expenses: string;
  debts: string;
  incomeStability: IncomeStability;
  emergencyMonths: string;
  routeType: RouteType;
  living: Living;
  setupNeed: SetupNeed;
  programmeYears: string;
  siblings: string;
  bursaryProspect: SupportLevel;
  familySupport: SupportLevel;
  employerSupport: SupportLevel;
  paymentPlanCertainty: SupportLevel;
  studentWork: StudentWork;
  creditPressure: CreditPressure;
};

type Dimension = {
  key: string;
  label: string;
  weight: number;
  raw: number;
  weighted: number;
  explanation: string;
};

type Result = {
  income: number;
  dependents: number;
  earners: number;
  expenses: number;
  debts: number;
  living: Living;
  siblings: number;
  incomeStability: IncomeStability;
  studentWork: StudentWork;
  emergencyMonths: number;
  creditPressure: CreditPressure;
  annual: number;
  surplus: number;
  capacity: number;
  bracket: string;
  pressure: 'low' | 'manageable' | 'moderate' | 'high' | 'severe';
  pressureBand: string;
  pressureScore: number;
  riskPoints: number;
  dimensions: Dimension[];
  drivers: string[];
  nextActions: string[];
  routeSafety: string;
  routeType: RouteType;
  locationBand: FormState['locationBand'];
  setupNeed: SetupNeed;
  programmeYears: number;
  bursaryProspect: SupportLevel;
  familySupport: SupportLevel;
  employerSupport: SupportLevel;
  paymentPlanCertainty: SupportLevel;
};

const STORAGE_KEY = 'dharma_reality';

const defaultForm: FormState = {
  income: '',
  dependents: '4',
  earners: '1',
  locationBand: 'metro',
  expenses: '',
  debts: '0',
  incomeStability: 'stable',
  emergencyMonths: '0',
  routeType: 'publicUniversity',
  living: 'unsure',
  setupNeed: 'unknown',
  programmeYears: '3',
  siblings: '0',
  bursaryProspect: 'some',
  familySupport: 'some',
  employerSupport: 'none',
  paymentPlanCertainty: 'weak',
  studentWork: 'no',
  creditPressure: 'low',
};

const routeLabels: Record<RouteType, string> = {
  publicUniversity: 'Public university degree',
  uot: 'University of Technology diploma/degree',
  tvet: 'TVET college route',
  distance: 'Distance / online study',
  private: 'Private college / private provider',
  trade: 'Trade / apprenticeship',
  learnership: 'Learnership / work-based route',
  unsure: 'Not sure yet',
};

const pressureMeta: Record<Result['pressure'], { band: string; cls: string; verdict: string; meaning: string; action: string }> = {
  low: {
    band: 'More Stable',
    cls: 'green',
    verdict: 'Your household appears to have meaningful planning capacity.',
    meaning: 'The household is not pressure-free, but the numbers suggest there is room to compare study routes without panic.',
    action: 'Move to True Cost and Route Compare. Do not overpay for prestige without checking safer alternatives.',
  },
  manageable: {
    band: 'Vulnerable',
    cls: 'amber',
    verdict: 'There is some capacity, but hidden costs could knock the plan off course.',
    meaning: 'This is the classic on-paper-versus-real-life gap: a route may look possible until deposits, residence, devices and transport arrive together.',
    action: 'Check residence costs, first-month cash shock and funding timing before committing.',
  },
  moderate: {
    band: 'Pressured',
    cls: 'amber',
    verdict: 'The household likely needs a cheaper, funded or staged route.',
    meaning: 'A high-cost route may still work, but only if the family changes the cost profile or secures reliable support.',
    action: 'Compare living-at-home, TVET, distance, bursary and work-study routes.',
  },
  high: {
    band: 'Highly Pressured',
    cls: 'red',
    verdict: 'Avoid high upfront commitments without confirmed support.',
    meaning: 'The numbers point to a household that could be stretched by loans, residence contracts or non-refundable deposits.',
    action: 'Do not sign accommodation or loan agreements before funding and fallback plans are clear.',
  },
  severe: {
    band: 'Severely Pressured',
    cls: 'red',
    verdict: 'A high-cost route may be unsafe unless major support is secured.',
    meaning: 'The household is already under strain. This does not mean the learner has no path, but the path needs to be funded, staged, local, work-linked, or lower cost.',
    action: 'Prioritise funded routes, TVET, work-and-study, or postponement with a clear plan.',
  },
};

function toNumber(value: string, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function clamp(n: number, min = 0, max = 100) {
  return Math.min(max, Math.max(min, n));
}

function formatR(n: number) {
  return 'R ' + Math.round(n || 0).toLocaleString('en-ZA');
}

function scoreBand(score: number): Result['pressure'] {
  if (score >= 85) return 'severe';
  if (score >= 65) return 'high';
  if (score >= 45) return 'moderate';
  if (score >= 25) return 'manageable';
  return 'low';
}

function fundingBracket(annual: number) {
  if (annual <= 350000) return 'NSFAS-eligible';
  if (annual <= 600000) return 'Missing middle';
  if (annual <= 1200000) return 'Self-funding';
  return 'Comfortable';
}

function supportRisk(value: SupportLevel) {
  return { strong: 0, some: 35, weak: 65, none: 85 }[value];
}

function calculate(form: FormState): Result {
  const income = toNumber(form.income);
  const dependents = Math.max(1, toNumber(form.dependents, 1));
  const earners = Math.max(1, toNumber(form.earners, 1));
  const expenses = toNumber(form.expenses);
  const debts = toNumber(form.debts);
  const emergencyMonths = toNumber(form.emergencyMonths);
  const siblings = toNumber(form.siblings);
  const programmeYears = Math.max(1, toNumber(form.programmeYears, 3));
  const annual = income * 12;
  const surplus = income - expenses - debts;
  const perCapita = income / dependents;
  const surplusRatio = income > 0 ? surplus / income : 0;
  const debtRatio = income > 0 ? debts / income : 0;
  const expenseRatio = income > 0 ? (expenses + debts) / income : 1;

  let capacity = Math.max(0, surplus * 0.75);
  if (form.living === 'away') capacity = Math.max(0, capacity - 2000);
  if (form.living === 'unsure') capacity = Math.max(0, capacity - 1000);
  if (siblings >= 1) capacity *= 0.7;
  if (siblings >= 2) capacity *= 0.85;
  if (form.incomeStability === 'variable') capacity *= 0.85;
  if (form.incomeStability === 'uncertain') capacity *= 0.65;
  if (form.creditPressure === 'medium') capacity *= 0.9;
  if (form.creditPressure === 'high') capacity *= 0.7;
  if (form.studentWork === 'yes') capacity += 1200;
  if (form.studentWork === 'maybe') capacity += 500;
  capacity = Math.round(Math.max(0, capacity));

  const householdCapacityRaw = clamp(
    (perCapita < 4000 ? 35 : perCapita < 8000 ? 20 : perCapita < 12000 ? 10 : 0) +
      (dependents >= 5 ? 18 : dependents >= 4 ? 10 : 4) +
      (earners === 1 ? 18 : earners === 2 ? 8 : 0) +
      (form.locationBand === 'metro' ? 8 : form.locationBand === 'town' ? 4 : 2) +
      (income <= 0 ? 25 : 0)
  );

  const financialStrainRaw = clamp(
    (surplus < 0 ? 35 : surplusRatio < 0.1 ? 28 : surplusRatio < 0.25 ? 16 : surplusRatio < 0.4 ? 8 : 0) +
      (debtRatio > 0.3 ? 22 : debtRatio > 0.2 ? 14 : debtRatio > 0.1 ? 7 : 0) +
      (expenseRatio > 0.95 ? 18 : expenseRatio > 0.8 ? 12 : expenseRatio > 0.65 ? 6 : 0) +
      (form.incomeStability === 'uncertain' ? 18 : form.incomeStability === 'variable' ? 9 : 0) +
      (emergencyMonths < 1 ? 14 : emergencyMonths < 3 ? 7 : 0) +
      (form.creditPressure === 'high' ? 16 : form.creditPressure === 'medium' ? 8 : 0)
  );

  const routeRisk = {
    publicUniversity: 36,
    uot: 28,
    tvet: 16,
    distance: 12,
    private: 52,
    trade: 22,
    learnership: 8,
    unsure: 30,
  }[form.routeType];

  const studyBurdenRaw = clamp(
    routeRisk +
      (form.living === 'away' ? 24 : form.living === 'unsure' ? 12 : 0) +
      (form.setupNeed === 'high' ? 18 : form.setupNeed === 'medium' ? 10 : form.setupNeed === 'unknown' ? 8 : 0) +
      (programmeYears >= 4 ? 10 : programmeYears >= 3 ? 5 : 0) +
      (siblings >= 2 ? 18 : siblings === 1 ? 10 : 0)
  );

  const supportGapRaw = clamp(
    supportRisk(form.bursaryProspect) * 0.3 +
      supportRisk(form.familySupport) * 0.2 +
      supportRisk(form.employerSupport) * 0.2 +
      supportRisk(form.paymentPlanCertainty) * 0.15 +
      (emergencyMonths < 1 ? 10 : emergencyMonths < 3 ? 5 : 0) +
      (form.studentWork === 'yes' ? 0 : form.studentWork === 'maybe' ? 5 : 10)
  );

  const dimensions: Dimension[] = [
    {
      key: 'capacity',
      label: 'Household capacity',
      weight: 25,
      raw: Math.round(householdCapacityRaw),
      weighted: householdCapacityRaw * 0.25,
      explanation: 'Income, people supported, per-person pressure and number of earners.',
    },
    {
      key: 'strain',
      label: 'Financial strain',
      weight: 30,
      raw: Math.round(financialStrainRaw),
      weighted: financialStrainRaw * 0.3,
      explanation: 'Debt, fixed expenses, surplus ratio, income stability and emergency buffer.',
    },
    {
      key: 'burden',
      label: 'Study burden',
      weight: 25,
      raw: Math.round(studyBurdenRaw),
      weighted: studyBurdenRaw * 0.25,
      explanation: 'Living arrangement, route type, first-year setup, duration and sibling overlap.',
    },
    {
      key: 'support',
      label: 'Support gap',
      weight: 20,
      raw: Math.round(supportGapRaw),
      weighted: supportGapRaw * 0.2,
      explanation: 'Funding confidence, family support, employer support, savings and fallback plan.',
    },
  ];

  const pressureScore = Math.round(dimensions.reduce((sum, dim) => sum + dim.weighted, 0));
  const pressure = scoreBand(pressureScore);
  const meta = pressureMeta[pressure];
  const bracket = fundingBracket(annual);

  const drivers = [
    ...(surplus < 0 ? ['Essential costs and debt already exceed income.'] : []),
    ...(surplusRatio < 0.25 ? [`Only about ${Math.max(0, Math.round(surplusRatio * 100))}% of income remains before study costs.`] : []),
    ...(debtRatio > 0.2 ? [`Debt repayments use about ${Math.round(debtRatio * 100)}% of monthly income.`] : []),
    ...(form.living === 'away' ? ['Living away from home is a major study-cost driver.'] : []),
    ...(form.routeType === 'private' ? ['Private-provider routes need extra accreditation, refund and total-cost checks.'] : []),
    ...(form.incomeStability !== 'stable' ? ['Income stability is not fully secure, which makes long commitments riskier.'] : []),
    ...(emergencyMonths < 1 ? ['Emergency savings are below one month.'] : []),
    ...(siblings >= 1 ? ['Another child may need study support in the next five years.'] : []),
    ...(form.bursaryProspect === 'weak' || form.bursaryProspect === 'none' ? ['Funding support is not yet reliable.'] : []),
  ].slice(0, 6);

  if (!drivers.length) drivers.push('No single pressure driver dominates, but full route costs still need to be confirmed.');

  const routeSafety =
    pressure === 'low'
      ? 'You can compare routes from a position of relative stability, but still verify fees, residence costs and funding rules.'
      : pressure === 'manageable'
        ? 'This route may be possible, but hidden costs or first-month cash shock could change the decision.'
        : pressure === 'moderate'
          ? 'A cheaper, funded, local, distance or work-linked version deserves serious comparison before committing.'
          : pressure === 'high'
            ? 'Do not commit to residence, private loans or non-refundable deposits until support is confirmed.'
            : 'Prioritise funded, staged, TVET, learnership, work-and-study or postponement-with-plan options before high-cost routes.';

  const nextActions = [
    'Run True Cost for the preferred route, including residence, deposits, devices and data.',
    pressure === 'low'
      ? 'Compare at least one lower-cost route so prestige does not drive the decision alone.'
      : 'Compare this route against a living-at-home, TVET, distance, funded or work-study alternative.',
    bracket === 'NSFAS-eligible'
      ? 'Check NSFAS bursary requirements and apply early; verify current rules directly.'
      : bracket === 'Missing middle'
        ? 'Investigate the NSFAS Missing-Middle Loan Scheme, merit awards, employer bursaries and lower-risk routes.'
        : 'Do not assume full self-funding; check payment plans, merit funding and cheaper institution options.',
    'Use Career Fit before paying deposits so affordability is checked against the student’s fit and readiness.',
  ];

  return {
    income,
    dependents,
    earners,
    expenses,
    debts,
    living: form.living,
    siblings,
    incomeStability: form.incomeStability,
    studentWork: form.studentWork,
    emergencyMonths,
    creditPressure: form.creditPressure,
    annual,
    surplus,
    capacity,
    bracket,
    pressure,
    pressureBand: meta.band,
    pressureScore,
    riskPoints: pressureScore,
    dimensions,
    drivers,
    nextActions,
    routeSafety,
    routeType: form.routeType,
    locationBand: form.locationBand,
    setupNeed: form.setupNeed,
    programmeYears,
    bursaryProspect: form.bursaryProspect,
    familySupport: form.familySupport,
    employerSupport: form.employerSupport,
    paymentPlanCertainty: form.paymentPlanCertainty,
  };
}

function RadioGroup<T extends string>({
  name,
  value,
  options,
  onChange,
}: {
  name: string;
  value: T;
  options: Array<{ value: T; label: string }>;
  onChange: (value: T) => void;
}) {
  return (
    <div className="segmented">
      {options.map((option) => {
        const id = `${name}-${option.value}`;
        return (
          <Fragment key={option.value}>
            <input id={id} name={name} checked={value === option.value} type="radio" onChange={() => onChange(option.value)} />
            <label htmlFor={id}>{option.label}</label>
          </Fragment>
        );
      })}
    </div>
  );
}

export default function RealityCheckTool() {
  const [form, setForm] = useState<FormState>(defaultForm);
  const [result, setResult] = useState<Result | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (!saved) return;
        const parsed = JSON.parse(saved) as Partial<Result>;
        setForm((current) => ({
          ...current,
          income: parsed.income != null ? String(parsed.income) : current.income,
          dependents: parsed.dependents != null ? String(parsed.dependents) : current.dependents,
          earners: parsed.earners != null ? String(parsed.earners) : current.earners,
          expenses: parsed.expenses != null ? String(parsed.expenses) : current.expenses,
          debts: parsed.debts != null ? String(parsed.debts) : current.debts,
          living: parsed.living ?? current.living,
          siblings: parsed.siblings != null ? String(parsed.siblings) : current.siblings,
          incomeStability: parsed.incomeStability ?? current.incomeStability,
          studentWork: parsed.studentWork ?? current.studentWork,
          emergencyMonths: parsed.emergencyMonths != null ? String(parsed.emergencyMonths) : current.emergencyMonths,
          creditPressure: parsed.creditPressure ?? current.creditPressure,
          routeType: parsed.routeType ?? current.routeType,
          locationBand: parsed.locationBand ?? current.locationBand,
          setupNeed: parsed.setupNeed ?? current.setupNeed,
          programmeYears: parsed.programmeYears != null ? String(parsed.programmeYears) : current.programmeYears,
          bursaryProspect: parsed.bursaryProspect ?? current.bursaryProspect,
          familySupport: parsed.familySupport ?? current.familySupport,
          employerSupport: parsed.employerSupport ?? current.employerSupport,
          paymentPlanCertainty: parsed.paymentPlanCertainty ?? current.paymentPlanCertainty,
        }));
      } catch {
        // Ignore broken localStorage from earlier beta versions.
      }
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  const preview = useMemo(() => calculate(form), [form]);
  const meta = pressureMeta[(result ?? preview).pressure];

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const calculated = calculate(form);
    setResult(calculated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(calculated));
    } catch {
      // Keep the tool usable even if localStorage is blocked.
    }
    window.setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
  };

  const onReset = () => {
    setForm(defaultForm);
    setResult(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
  };

  return (
    <>
      <section className="tool-header">
        <div className="container container-narrow">
          <div className="progress">Step 01 of 04 · <span>Missing Middle Reality Check</span></div>
          <h1>See the pressure behind the household income.</h1>
          <p className="lead">
            This version looks beyond annual income. It checks household capacity, financial strain, study burden and support gaps so your family can choose a route it can carry.
          </p>
        </div>
      </section>

      <section className="tool-body reality-react-tool">
        <div className="container container-narrow">
          <div className="method-note">
            <strong>How to read this:</strong> This is decision support, not funding approval or financial advice. It helps explain whether a route may be unsafe unless funding, cheaper study options or a stronger fallback plan is in place.
          </div>

          <form onSubmit={onSubmit} onReset={onReset}>
            <div className="form-section">
              <span className="eyebrow">1. Household profile</span>
              <h3>Who is supported by the income?</h3>
              <p className="helper">Use monthly take-home figures where possible. This section measures basic household capacity.</p>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="rc-income">Monthly household take-home income</label>
                  <div className="prefix-input"><input id="rc-income" min="0" required step="500" type="number" value={form.income} onChange={(e) => update('income', e.target.value)} placeholder="e.g. 42000" /></div>
                </div>
                <div className="form-group">
                  <label htmlFor="rc-dependents">People supported by this income</label>
                  <input id="rc-dependents" min="1" max="15" required step="1" type="number" value={form.dependents} onChange={(e) => update('dependents', e.target.value)} />
                </div>
                <div className="form-group">
                  <label htmlFor="rc-earners">Number of income earners</label>
                  <input id="rc-earners" min="1" max="6" required step="1" type="number" value={form.earners} onChange={(e) => update('earners', e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Location pressure</label>
                  <RadioGroup name="locationBand" value={form.locationBand} onChange={(value) => update('locationBand', value)} options={[{ value: 'metro', label: 'Metro' }, { value: 'town', label: 'Town' }, { value: 'rural', label: 'Rural' }]} />
                </div>
              </div>
            </div>

            <div className="form-section">
              <span className="eyebrow">2. Financial pressure</span>
              <h3>What is already committed before study?</h3>
              <p className="helper">This is where an on-paper income can become real-life pressure.</p>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="rc-expenses">Essential monthly expenses</label>
                  <div className="prefix-input"><input id="rc-expenses" min="0" required step="500" type="number" value={form.expenses} onChange={(e) => update('expenses', e.target.value)} placeholder="rent, food, transport, medical" /></div>
                </div>
                <div className="form-group">
                  <label htmlFor="rc-debts">Existing monthly debt repayments</label>
                  <div className="prefix-input"><input id="rc-debts" min="0" step="100" type="number" value={form.debts} onChange={(e) => update('debts', e.target.value)} /></div>
                </div>
                <div className="form-group">
                  <label>Income stability</label>
                  <RadioGroup name="incomeStability" value={form.incomeStability} onChange={(value) => update('incomeStability', value)} options={[{ value: 'stable', label: 'Stable' }, { value: 'variable', label: 'Variable' }, { value: 'uncertain', label: 'Uncertain' }]} />
                </div>
                <div className="form-group">
                  <label htmlFor="rc-emergency">Emergency savings available</label>
                  <select id="rc-emergency" value={form.emergencyMonths} onChange={(e) => update('emergencyMonths', e.target.value)}>
                    <option value="0">Less than 1 month</option>
                    <option value="1">About 1 month</option>
                    <option value="3">2-3 months</option>
                    <option value="6">More than 3 months</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Current credit pressure</label>
                  <RadioGroup name="creditPressure" value={form.creditPressure} onChange={(value) => update('creditPressure', value)} options={[{ value: 'low', label: 'Low' }, { value: 'medium', label: 'Medium' }, { value: 'high', label: 'High' }]} />
                </div>
              </div>
            </div>

            <div className="form-section">
              <span className="eyebrow">3. Study plan pressure</span>
              <h3>How heavy is the likely route?</h3>
              <p className="helper">You can choose unsure if the family is still exploring. The tool will treat uncertainty as a risk to clarify.</p>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="rc-route-type">Likely route type</label>
                  <select id="rc-route-type" value={form.routeType} onChange={(e) => update('routeType', e.target.value as RouteType)}>
                    {Object.entries(routeLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Will the student need to live away from home?</label>
                  <RadioGroup name="living" value={form.living} onChange={(value) => update('living', value)} options={[{ value: 'home', label: 'At home' }, { value: 'away', label: 'Away' }, { value: 'unsure', label: 'Unsure' }]} />
                </div>
                <div className="form-group">
                  <label htmlFor="rc-setup">First-year setup need</label>
                  <select id="rc-setup" value={form.setupNeed} onChange={(e) => update('setupNeed', e.target.value as SetupNeed)}>
                    <option value="low">Low: mostly transport/books</option>
                    <option value="medium">Medium: registration, books, device/data</option>
                    <option value="high">High: residence deposit, device, transport setup</option>
                    <option value="unknown">Unknown: not checked yet</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="rc-years">Expected programme years</label>
                  <input id="rc-years" min="1" max="8" step="1" type="number" value={form.programmeYears} onChange={(e) => update('programmeYears', e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Other children expected to study in the next 5 years?</label>
                  <RadioGroup name="siblings" value={form.siblings} onChange={(value) => update('siblings', value)} options={[{ value: '0', label: 'None' }, { value: '1', label: 'One' }, { value: '2', label: 'Two+' }]} />
                </div>
              </div>
            </div>

            <div className="form-section">
              <span className="eyebrow">4. Support gap</span>
              <h3>What safety net exists if costs are higher than expected?</h3>
              <p className="helper">This does not assume funding. It checks whether the family has confirmed support, possible support, or no clear fallback yet.</p>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="rc-bursary">Bursary / funding confidence</label>
                  <select id="rc-bursary" value={form.bursaryProspect} onChange={(e) => update('bursaryProspect', e.target.value as SupportLevel)}>
                    <option value="strong">Strong: likely/confirmed documents</option>
                    <option value="some">Some: possible but not confirmed</option>
                    <option value="weak">Weak: unlikely or unclear</option>
                    <option value="none">None known yet</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="rc-family-support">Extra family support</label>
                  <select id="rc-family-support" value={form.familySupport} onChange={(e) => update('familySupport', e.target.value as SupportLevel)}>
                    <option value="strong">Strong</option>
                    <option value="some">Some</option>
                    <option value="weak">Weak</option>
                    <option value="none">None</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="rc-employer">Employer / sponsor support</label>
                  <select id="rc-employer" value={form.employerSupport} onChange={(e) => update('employerSupport', e.target.value as SupportLevel)}>
                    <option value="strong">Strong or confirmed</option>
                    <option value="some">Possible</option>
                    <option value="weak">Weak / unclear</option>
                    <option value="none">None</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="rc-payment-plan">Payment plan certainty</label>
                  <select id="rc-payment-plan" value={form.paymentPlanCertainty} onChange={(e) => update('paymentPlanCertainty', e.target.value as SupportLevel)}>
                    <option value="strong">Confirmed and affordable</option>
                    <option value="some">Possible</option>
                    <option value="weak">Unclear or risky</option>
                    <option value="none">No plan</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Can the student realistically work part-time?</label>
                  <RadioGroup name="studentWork" value={form.studentWork} onChange={(value) => update('studentWork', value)} options={[{ value: 'no', label: 'No' }, { value: 'maybe', label: 'Maybe' }, { value: 'yes', label: 'Yes' }]} />
                </div>
              </div>
            </div>

            <div className="form-actions">
              <button className="btn btn-primary" type="submit">Show my pressure score →</button>
              <button className="btn btn-ghost" type="reset">Reset</button>
            </div>
          </form>

          <div className="snapshot-panel pressure-preview" aria-live="polite">
            <span className="eyebrow">Live preview</span>
            <h3>{preview.pressureBand}: {preview.pressureScore}/100 pressure score</h3>
            <p>{pressureMeta[preview.pressure].action}</p>
            <div className="pressure-meter"><span style={{ width: `${preview.pressureScore}%` }} /></div>
          </div>

          {result ? (
            <div className="result-panel" ref={resultRef}>
              <span className="eyebrow" style={{ color: 'var(--terracotta-soft)' }}>Your Missing Middle Reality Check</span>
              <div className={`verdict ${meta.cls}`}>{meta.verdict}</div>
              <p>{meta.meaning}</p>

              <div className="stats">
                <div><div className="stat-num">{result.pressureScore}/100</div><div className="stat-label">Pressure score</div></div>
                <div><div className="stat-num">{result.pressureBand}</div><div className="stat-label">Pressure band</div></div>
                <div><div className="stat-num">{result.bracket}</div><div className="stat-label">Funding bracket</div></div>
                <div><div className="stat-num">{formatR(result.capacity)}/mo</div><div className="stat-label">Realistic study capacity</div></div>
              </div>

              <div className="on-paper-box">
                <h4>On paper vs real life</h4>
                <p><strong>On paper:</strong> Annual household income is {formatR(result.annual)}, placing the family in the <strong>{result.bracket}</strong> bracket.</p>
                <p><strong>Real life:</strong> After essentials and debt, estimated monthly surplus is {formatR(result.surplus)}. With a safety buffer and study-risk adjustments, realistic study capacity is about <strong>{formatR(result.capacity)}/month</strong>.</p>
                <p><strong>Study-cost reality:</strong> {result.routeSafety}</p>
              </div>

              <h4 style={{ marginTop: 'var(--space-8)', marginBottom: 'var(--space-3)' }}>Pressure dimensions</h4>
              <div className="dimension-grid">
                {result.dimensions.map((dimension) => (
                  <div className="dimension-card" key={dimension.key}>
                    <div className="dimension-top"><strong>{dimension.label}</strong><span>{dimension.raw}/100</span></div>
                    <div className="dimension-bar"><span style={{ width: `${dimension.raw}%` }} /></div>
                    <p>{dimension.explanation}</p>
                  </div>
                ))}
              </div>

              <h4 style={{ marginTop: 'var(--space-8)', marginBottom: 'var(--space-3)' }}>Top pressure drivers</h4>
              <ul>{result.drivers.map((driver) => <li key={driver}>{driver}</li>)}</ul>

              <h4 style={{ marginTop: 'var(--space-8)', marginBottom: 'var(--space-3)' }}>Recommended next actions</h4>
              <ol className="result-ordered-list">{result.nextActions.map((action) => <li key={action}>{action}</li>)}</ol>

              <div className="next-steps">
                <a className="btn btn-primary" href="/tools/cost-calculator">Next: True Cost Calculator →</a>
                <a className="btn btn-secondary" href="/tools/route-compare">Compare safer routes →</a>
                <button className="btn btn-print" type="button" onClick={() => window.print()}>Print / save as PDF</button>
              </div>
            </div>
          ) : null}
        </div>
      </section>
    </>
  );
}
