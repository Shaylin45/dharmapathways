'use client';

import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';

type PathwayType =
  | 'publicUniversity'
  | 'uot'
  | 'tvet'
  | 'distance'
  | 'privateCollege'
  | 'trade'
  | 'learnership'
  | 'unsure';

type LivingArrangement = 'home' | 'residence' | 'private' | 'family' | 'unsure';
type RepeatRisk = '0' | '0.25' | '0.5' | '1';
type AffordabilityBand = 'comfortable' | 'tight' | 'over' | 'severe';
type ResidenceBand = 'avoided' | 'low' | 'moderate' | 'high' | 'severe';

type CostState = {
  pathwayType: PathwayType;
  livingArrangement: LivingArrangement;
  programmeYears: string;
  repeatRisk: RepeatRisk;
  tuition: string;
  registration: string;
  accommodation: string;
  accommodationDeposit: string;
  food: string;
  transport: string;
  books: string;
  devices: string;
  data: string;
  personal: string;
  tools: string;
  other: string;
  confirmedFunding: string;
  hopedFunding: string;
  confirmedMonthlySupport: string;
  hopedMonthlySupport: string;
  studentIncome: string;
};

type StoredReality = {
  capacity?: number;
  bracket?: string;
  pressure?: string;
  pressureBand?: string;
};

type CostDriver = {
  label: string;
  amount: number;
  share: number;
};

type FundingRoute = {
  title: string;
  relevance: 'High relevance' | 'Possible' | 'Lower priority';
  level: 'high' | 'possible' | 'low';
  who: string;
  warning: string;
};

type Result = {
  totalAnnual: number;
  recurringAnnual: number;
  confirmedAnnualFunding: number;
  hopedAnnualFunding: number;
  safeNetAnnual: number;
  scenarioNetAnnual: number;
  netAnnual: number;
  safeNetMonthly: number;
  scenarioNetMonthly: number;
  netMonthly: number;
  tuitionShare: number;
  firstMonthCost: number;
  programmeYears: number;
  repeatRisk: number;
  programmeTotal: number;
  affordabilityGap: number;
  stressRatio: number | null;
  band: AffordabilityBand;
  verdict: string;
  verdictBody: string;
  residenceBand: ResidenceBand;
  residenceRiskRatio: number | null;
  topDrivers: CostDriver[];
  implications: string[];
  fundingRoutes: FundingRoute[];
  saferLevers: string[];
  breakdown: {
    tuition: number;
    reg: number;
    accom: number;
    food: number;
    transport: number;
    books: number;
    devices: number;
    data: number;
    personal: number;
    other: number;
  };
};


type SavedCost = Partial<Pick<Result, 'programmeYears' | 'repeatRisk' | 'breakdown'>>;

const STORAGE_KEY = 'dharma_cost';

const pathwayLabels: Record<PathwayType, string> = {
  publicUniversity: 'Public university undergraduate',
  uot: 'University of Technology diploma/degree',
  tvet: 'TVET college route',
  distance: 'Distance / online study',
  privateCollege: 'Private college / private provider',
  trade: 'Trade / apprenticeship',
  learnership: 'Learnership / work-based route',
  unsure: 'Not sure yet / custom route',
};

const livingLabels: Record<LivingArrangement, string> = {
  home: 'Living at home',
  residence: 'Residence / campus accommodation',
  private: 'Private accommodation / digs',
  family: 'Staying with family near campus',
  unsure: 'Not sure yet',
};

const defaultForm: CostState = {
  pathwayType: 'publicUniversity',
  livingArrangement: 'unsure',
  programmeYears: '3',
  repeatRisk: '0.25',
  tuition: '65000',
  registration: '6000',
  accommodation: '45000',
  accommodationDeposit: '8000',
  food: '30000',
  transport: '16000',
  books: '6500',
  devices: '9000',
  data: '7200',
  personal: '7000',
  tools: '0',
  other: '3000',
  confirmedFunding: '0',
  hopedFunding: '0',
  confirmedMonthlySupport: '0',
  hopedMonthlySupport: '0',
  studentIncome: '0',
};

const presetBase: Record<PathwayType, Omit<CostState, 'livingArrangement' | 'programmeYears' | 'repeatRisk' | 'confirmedFunding' | 'hopedFunding' | 'confirmedMonthlySupport' | 'hopedMonthlySupport' | 'studentIncome'>> = {
  publicUniversity: { pathwayType: 'publicUniversity', tuition: '65000', registration: '6000', accommodation: '0', accommodationDeposit: '0', food: '18000', transport: '18000', books: '6500', devices: '9000', data: '7200', personal: '6000', tools: '0', other: '3000' },
  uot: { pathwayType: 'uot', tuition: '42000', registration: '5000', accommodation: '0', accommodationDeposit: '0', food: '18000', transport: '16000', books: '5500', devices: '8000', data: '6500', personal: '5500', tools: '3000', other: '2500' },
  tvet: { pathwayType: 'tvet', tuition: '18000', registration: '2500', accommodation: '0', accommodationDeposit: '0', food: '14000', transport: '12000', books: '3500', devices: '6000', data: '4800', personal: '4500', tools: '2500', other: '2000' },
  distance: { pathwayType: 'distance', tuition: '35000', registration: '3000', accommodation: '0', accommodationDeposit: '0', food: '0', transport: '0', books: '4000', devices: '9000', data: '8400', personal: '0', tools: '0', other: '2000' },
  privateCollege: { pathwayType: 'privateCollege', tuition: '120000', registration: '9000', accommodation: '0', accommodationDeposit: '0', food: '18000', transport: '16000', books: '7500', devices: '9000', data: '7200', personal: '7000', tools: '0', other: '5000' },
  trade: { pathwayType: 'trade', tuition: '25000', registration: '2500', accommodation: '0', accommodationDeposit: '0', food: '14000', transport: '10000', books: '3000', devices: '4000', data: '4800', personal: '4500', tools: '8500', other: '2500' },
  learnership: { pathwayType: 'learnership', tuition: '0', registration: '0', accommodation: '0', accommodationDeposit: '0', food: '12000', transport: '12000', books: '1500', devices: '5000', data: '4800', personal: '3500', tools: '1000', other: '1500' },
  unsure: { pathwayType: 'unsure', tuition: '55000', registration: '5000', accommodation: '0', accommodationDeposit: '0', food: '18000', transport: '14000', books: '5000', devices: '8000', data: '6000', personal: '5500', tools: '0', other: '3000' },
};

const livingAdjustments: Record<LivingArrangement, Pick<CostState, 'accommodation' | 'accommodationDeposit' | 'food' | 'transport'>> = {
  home: { accommodation: '0', accommodationDeposit: '0', food: '18000', transport: '18000' },
  residence: { accommodation: '65000', accommodationDeposit: '10000', food: '42000', transport: '16000' },
  private: { accommodation: '72000', accommodationDeposit: '12000', food: '42000', transport: '18000' },
  family: { accommodation: '18000', accommodationDeposit: '0', food: '26000', transport: '12000' },
  unsure: { accommodation: '45000', accommodationDeposit: '8000', food: '30000', transport: '16000' },
};

function toNumber(value: string, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function formatR(value: number) {
  return 'R ' + Math.round(value || 0).toLocaleString('en-ZA');
}

function pct(value: number | null) {
  if (value === null || !Number.isFinite(value)) return 'No capacity saved';
  return Math.round(value * 100) + '%';
}

function bandClass(band: AffordabilityBand) {
  return band === 'comfortable' ? 'green' : band === 'tight' ? 'amber' : 'red';
}

function residenceClass(band: ResidenceBand) {
  return band === 'avoided' || band === 'low' ? 'green' : band === 'moderate' ? 'amber' : 'red';
}

function getStoredReality(): StoredReality | null {
  try {
    const raw = window.localStorage.getItem('dharma_reality');
    return raw ? (JSON.parse(raw) as StoredReality) : null;
  } catch {
    return null;
  }
}

function applyPreset(current: CostState, pathwayType: PathwayType, livingArrangement: LivingArrangement): CostState {
  const base = presetBase[pathwayType];
  const living = livingAdjustments[livingArrangement];
  return {
    ...current,
    ...base,
    ...living,
    pathwayType,
    livingArrangement,
  };
}

function affordabilityBand(stressRatio: number | null): AffordabilityBand {
  if (stressRatio === null || !Number.isFinite(stressRatio) || stressRatio > 1.4) return 'severe';
  if (stressRatio > 1) return 'over';
  if (stressRatio > 0.6) return 'tight';
  return 'comfortable';
}

function residenceBand(accommodation: number, capacity: number | null): { band: ResidenceBand; ratio: number | null } {
  if (accommodation <= 0) return { band: 'avoided', ratio: 0 };
  if (!capacity || capacity <= 0) return { band: 'severe', ratio: null };
  const monthlyLivingAway = accommodation / 12;
  const ratio = monthlyLivingAway / capacity;
  if (ratio > 1.1) return { band: 'severe', ratio };
  if (ratio > 0.75) return { band: 'high', ratio };
  if (ratio > 0.4) return { band: 'moderate', ratio };
  return { band: 'low', ratio };
}

function buildFundingRoutes(form: CostState, resultCore: Pick<Result, 'totalAnnual' | 'safeNetMonthly' | 'stressRatio'>, reality: StoredReality | null): FundingRoute[] {
  const highCost = resultCore.totalAnnual > 100000;
  const overCapacity = resultCore.stressRatio === null || resultCore.stressRatio > 1;
  const pressure = reality?.pressure === 'high' || reality?.pressure === 'severe';
  const route = form.pathwayType;

  const routes: FundingRoute[] = [
    {
      title: 'Payment plan',
      relevance: resultCore.safeNetMonthly > 0 ? 'Possible' : 'Lower priority',
      level: resultCore.safeNetMonthly > 0 ? 'possible' : 'low',
      who: 'Families that can pay monthly but cannot absorb registration, deposit and first-month costs at once.',
      warning: 'A payment plan is not funding. It can still overload the household if the monthly burden is above capacity.',
    },
    {
      title: 'Employer-sponsored / work-and-study',
      relevance: pressure || overCapacity ? 'High relevance' : 'Possible',
      level: pressure || overCapacity ? 'high' : 'possible',
      who: 'Students who need to earn while building a qualification, especially when full-time study would destabilise the household.',
      warning: 'Usually slower and demanding, but it can reduce debt and keep the household stable.',
    },
  ];

  if (route === 'tvet' || route === 'trade' || route === 'learnership') {
    routes.unshift({
      title: 'SETA learnerships / occupational funding',
      relevance: 'High relevance',
      level: 'high',
      who: 'Practical, occupational, ICT, trades and business-services routes where employer placement may be part of the pathway.',
      warning: 'Check stipend, employer placement, qualification level and contract obligations before relying on it.',
    });
  }

  if (route === 'publicUniversity' || route === 'uot' || route === 'privateCollege') {
    routes.unshift({
      title: 'Corporate / bank bursaries',
      relevance: highCost || overCapacity ? 'High relevance' : 'Possible',
      level: highCost || overCapacity ? 'high' : 'possible',
      who: 'High-cost fields such as accounting, engineering, ICT, data, finance, health, law, mining and scarce-skills routes.',
      warning: 'Renewal, service-back and academic-performance rules matter as much as the first award letter.',
    });
  }

  if (route === 'publicUniversity' || route === 'uot' || route === 'tvet') {
    routes.push({
      title: 'Institution merit awards',
      relevance: 'Possible',
      level: 'possible',
      who: 'Students with strong marks, talent or programme-specific achievement.',
      warning: 'Some awards are once-off or partial. Verify renewal rules and whether residence, devices and books are included.',
    });
  }

  return routes.slice(0, 4);
}

function calculate(form: CostState, reality: StoredReality | null): Result {
  const tuition = toNumber(form.tuition);
  const reg = toNumber(form.registration);
  const accom = toNumber(form.accommodation);
  const accomDeposit = toNumber(form.accommodationDeposit);
  const food = toNumber(form.food);
  const transport = toNumber(form.transport);
  const books = toNumber(form.books);
  const devices = toNumber(form.devices);
  const data = toNumber(form.data);
  const personal = toNumber(form.personal);
  const tools = toNumber(form.tools);
  const other = toNumber(form.other);
  const confirmedFunding = toNumber(form.confirmedFunding);
  const hopedFunding = toNumber(form.hopedFunding);
  const confirmedMonthlySupport = toNumber(form.confirmedMonthlySupport);
  const hopedMonthlySupport = toNumber(form.hopedMonthlySupport);
  const studentIncome = toNumber(form.studentIncome);
  const programmeYears = Math.max(1, toNumber(form.programmeYears, 3));
  const repeatRisk = toNumber(form.repeatRisk);

  const recurringAnnual = tuition + reg + accom + food + transport + books + devices + data + personal + tools + other;
  const totalAnnual = recurringAnnual + accomDeposit;
  const confirmedAnnualFunding = confirmedFunding + confirmedMonthlySupport * 12 + studentIncome * 12;
  const hopedAnnualFunding = hopedFunding + hopedMonthlySupport * 12;
  const safeNetAnnual = Math.max(0, totalAnnual - confirmedAnnualFunding);
  const scenarioNetAnnual = Math.max(0, safeNetAnnual - hopedAnnualFunding);
  const safeNetMonthly = safeNetAnnual / 12;
  const scenarioNetMonthly = scenarioNetAnnual / 12;
  const firstMonthCost = reg + accomDeposit + Math.round(accom / 12) + devices + books + Math.round(transport / 12) + Math.round(data / 12);
  const programmeTotal = Math.max(0, recurringAnnual * (programmeYears + repeatRisk) + accomDeposit - confirmedAnnualFunding * programmeYears);
  const capacity = typeof reality?.capacity === 'number' ? reality.capacity : null;
  const stressRatio = capacity && capacity > 0 ? safeNetMonthly / capacity : null;
  const band = affordabilityBand(stressRatio);
  const affordabilityGap = capacity && capacity > 0 ? Math.max(0, safeNetMonthly - capacity) : safeNetMonthly;
  const tuitionShare = totalAnnual > 0 ? Math.round((tuition / totalAnnual) * 100) : 0;
  const residence = residenceBand(accom, capacity);

  const drivers = [
    { label: 'Tuition', amount: tuition },
    { label: 'Accommodation', amount: accom + accomDeposit },
    { label: 'Food', amount: food },
    { label: 'Transport', amount: transport },
    { label: 'Devices, books and data', amount: devices + books + data },
    { label: 'Tools, personal and other', amount: tools + personal + other },
  ]
    .filter((driver) => driver.amount > 0)
    .map((driver) => ({ ...driver, share: totalAnnual > 0 ? Math.round((driver.amount / totalAnnual) * 100) : 0 }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 3);

  const verdicts: Record<AffordabilityBand, { title: string; body: string }> = {
    comfortable: {
      title: 'This route appears to fit within household capacity.',
      body: 'Confirmed funding and household capacity suggest there is some margin, but first-month costs and refund rules still need checking.',
    },
    tight: {
      title: 'This route may work, but it uses most of the margin.',
      body: 'Protect emergency cash and avoid adding debt until registration, residence and funding timing are confirmed.',
    },
    over: {
      title: 'This route exceeds current capacity.',
      body: 'The family needs additional confirmed funding, a cheaper living arrangement, or a safer version of the route before committing.',
    },
    severe: {
      title: 'This route is likely unsafe without major support.',
      body: 'Do not rely on hoped-for funding or sign accommodation contracts without a written funding decision and a backup plan.',
    },
  };

  const implications: string[] = [];
  if (!reality?.capacity) implications.push('Run Tool 1 first to compare this monthly burden against household study capacity. For now, the verdict assumes no saved capacity.');
  if (tuitionShare > 0 && tuitionShare < 50) implications.push(`Tuition is only ${tuitionShare}% of the true year-one cost. Non-tuition costs are driving the decision.`);
  if (firstMonthCost > safeNetMonthly * 1.8 && totalAnnual > 0) implications.push(`First-month cash need is about ${formatR(firstMonthCost)}, which is materially higher than the average monthly burden.`);
  if (hopedAnnualFunding > 0) implications.push(`Hoped-for funding could reduce the monthly scenario to ${formatR(scenarioNetMonthly)}, but the safe verdict uses confirmed funding only.`);
  if (accom > 0) implications.push('Accommodation is a separate risk. Verify deposit deadlines, refund rules and whether funding covers this exact accommodation type.');
  if (repeatRisk >= 0.5) implications.push(`Repeat/delay risk makes a ${programmeYears}-year route behave closer to ${programmeYears + repeatRisk} funded years.`);
  if (devices === 0 && tuition > 0) implications.push('No device cost is included. Most study routes need a reliable laptop or tablet plus repairs/replacement margin.');
  if (data === 0 && tuition > 0) implications.push('No data/internet cost is included. Distance, blended and campus study all carry connectivity costs.');
  if (form.pathwayType === 'privateCollege') implications.push('Private-provider route selected. Confirm DHET registration, programme accreditation, refund policy and employment outcomes before paying deposits.');
  if (!implications.length) implications.push('The numbers are not flashing obvious danger, but compare at least one cheaper route before committing.');

  const saferLevers: string[] = [];
  if (accom > 0) saferLevers.push('Compare a living-at-home, closer-campus or distance-study version before signing accommodation.');
  if (band === 'over' || band === 'severe') saferLevers.push('Take this route to Route Compare against TVET, UoT, distance, learnership or work-and-study options.');
  if (confirmedFunding === 0 && hopedFunding > 0) saferLevers.push('Wait for written funding confirmation before paying non-refundable deposits.');
  if (firstMonthCost > 0) saferLevers.push('Ask the institution for registration, deposit, device, books, payment-plan and refund deadlines in writing.');
  if (form.pathwayType === 'privateCollege') saferLevers.push('Ask for proof of accreditation and whether the qualification leads to the advertised job or registration outcome.');
  if (!saferLevers.length) saferLevers.push('Get official fee statements from two providers and compare the cheaper credible option.');

  const core = { totalAnnual, safeNetMonthly, stressRatio };

  return {
    totalAnnual,
    recurringAnnual,
    confirmedAnnualFunding,
    hopedAnnualFunding,
    safeNetAnnual,
    scenarioNetAnnual,
    netAnnual: safeNetAnnual,
    safeNetMonthly,
    scenarioNetMonthly,
    netMonthly: safeNetMonthly,
    tuitionShare,
    firstMonthCost,
    programmeYears,
    repeatRisk,
    programmeTotal,
    affordabilityGap,
    stressRatio,
    band,
    verdict: verdicts[band].title,
    verdictBody: verdicts[band].body,
    residenceBand: residence.band,
    residenceRiskRatio: residence.ratio,
    topDrivers: drivers,
    implications,
    fundingRoutes: buildFundingRoutes(form, core, reality),
    saferLevers,
    breakdown: {
      tuition,
      reg,
      accom,
      food,
      transport,
      books,
      devices,
      data,
      personal,
      other: tools + other + accomDeposit,
    },
  };
}

function numberInputLabel(id: keyof CostState, label: string, value: string, onChange: (id: keyof CostState, value: string) => void, helper?: string) {
  return (
    <div className="form-group" key={id}>
      <label htmlFor={id}>{label}{helper ? <span className="label-helper">{helper}</span> : null}</label>
      <div className="prefix-input">
        <input id={id} min="0" step="500" type="number" value={value} onChange={(event) => onChange(id, event.target.value)} />
      </div>
    </div>
  );
}

export function TrueCostTool() {
  const [form, setForm] = useState<CostState>(defaultForm);
  const [reality, setReality] = useState<StoredReality | null>(null);
  const [showResult, setShowResult] = useState(false);
  const resultRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setReality(getStoredReality());
      try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (!raw) return;
        const saved = JSON.parse(raw) as SavedCost;
        if (saved.breakdown) {
          setForm((current) => ({
            ...current,
            tuition: String(saved.breakdown?.tuition ?? current.tuition),
            registration: String(saved.breakdown?.reg ?? current.registration),
            accommodation: String(saved.breakdown?.accom ?? current.accommodation),
            food: String(saved.breakdown?.food ?? current.food),
            transport: String(saved.breakdown?.transport ?? current.transport),
            books: String(saved.breakdown?.books ?? current.books),
            devices: String(saved.breakdown?.devices ?? current.devices),
            data: String(saved.breakdown?.data ?? current.data),
            personal: String(saved.breakdown?.personal ?? current.personal),
            programmeYears: String(saved.programmeYears ?? current.programmeYears),
            repeatRisk: String(saved.repeatRisk ?? current.repeatRisk) as RepeatRisk,
          }));
        }
      } catch {}
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const result = useMemo(() => calculate(form, reality), [form, reality]);

  function updateField(id: keyof CostState, value: string) {
    setForm((current) => ({ ...current, [id]: value }));
    setShowResult(false);
  }

  function updatePathway(pathwayType: PathwayType) {
    setForm((current) => applyPreset(current, pathwayType, current.livingArrangement));
    setShowResult(false);
  }

  function updateLiving(livingArrangement: LivingArrangement) {
    setForm((current) => applyPreset(current, current.pathwayType, livingArrangement));
    setShowResult(false);
  }

  function saveResult(nextResult: Result) {
    const payload = {
      ...nextResult,
      pathwayType: form.pathwayType,
      pathwayLabel: pathwayLabels[form.pathwayType],
      livingArrangement: form.livingArrangement,
      livingLabel: livingLabels[form.livingArrangement],
      confirmedAnnualFunding: nextResult.confirmedAnnualFunding,
      hopedAnnualFunding: nextResult.hopedAnnualFunding,
      safeNetMonthly: nextResult.safeNetMonthly,
      scenarioNetMonthly: nextResult.scenarioNetMonthly,
      affordabilityGap: nextResult.affordabilityGap,
      stressRatio: nextResult.stressRatio,
      residenceBand: nextResult.residenceBand,
      topDrivers: nextResult.topDrivers,
    };
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {}
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    saveResult(result);
    setShowResult(true);
    window.setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 0);
  }

  function handleReset() {
    setForm(defaultForm);
    setShowResult(false);
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {}
  }

  return (
    <div className="page-section active" data-page="cost-calculator">
      <section className="tool-header">
        <div className="container container-narrow">
          <div className="progress">Step 02 of 04 · <span>True Cost Calculator</span></div>
          <h1>Tuition is rarely more than half the bill.</h1>
          <p className="lead">Use guided South African starting values, then adjust the numbers to see monthly burden, first-month shock and residence risk.</p>
        </div>
      </section>

      <section className="tool-body">
        <div className="container container-narrow">
          <div className="method-note">
            <strong>V2 logic:</strong> safe affordability uses confirmed funding only. Hoped-for bursaries or loans are shown as a scenario, not as the decision baseline.
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-section">
              <h3>Pathway being costed</h3>
              <p className="helper">Choose the route and living arrangement first. The calculator fills conservative starting values you can override.</p>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="pathwayType">Pathway type</label>
                  <select id="pathwayType" value={form.pathwayType} onChange={(event) => updatePathway(event.target.value as PathwayType)}>
                    {Object.entries(pathwayLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="livingArrangement">Living arrangement</label>
                  <select id="livingArrangement" value={form.livingArrangement} onChange={(event) => updateLiving(event.target.value as LivingArrangement)}>
                    {Object.entries(livingLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="programmeYears">Expected programme length</label>
                  <select id="programmeYears" value={form.programmeYears} onChange={(event) => updateField('programmeYears', event.target.value)}>
                    {['1', '2', '3', '4', '5', '6'].map((year) => <option key={year} value={year}>{year} year{year === '1' ? '' : 's'}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="repeatRisk">Repeat-year / delay risk</label>
                  <select id="repeatRisk" value={form.repeatRisk} onChange={(event) => updateField('repeatRisk', event.target.value as RepeatRisk)}>
                    <option value="0">Low — assume minimum time</option>
                    <option value="0.25">Moderate — add 25% of one year</option>
                    <option value="0.5">High — add 50% of one year</option>
                    <option value="1">Very high — model one extra year</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="form-section">
              <h3>Study-year costs</h3>
              <p className="helper">These are editable estimates for year one. Keep setup costs visible because they often arrive before classes begin.</p>
              <div className="form-grid">
                {numberInputLabel('tuition', 'Tuition fees', form.tuition, updateField)}
                {numberInputLabel('registration', 'Registration & admin fees', form.registration, updateField, 'usually upfront')}
                {numberInputLabel('accommodation', 'Accommodation', form.accommodation, updateField, 'annual rent/residence')}
                {numberInputLabel('accommodationDeposit', 'Accommodation deposit', form.accommodationDeposit, updateField, 'once-off setup')}
                {numberInputLabel('food', 'Food & groceries', form.food, updateField)}
                {numberInputLabel('transport', 'Transport', form.transport, updateField)}
                {numberInputLabel('books', 'Books and materials', form.books, updateField)}
                {numberInputLabel('devices', 'Device setup', form.devices, updateField, 'laptop/tablet')}
                {numberInputLabel('data', 'Data & internet', form.data, updateField)}
                {numberInputLabel('tools', 'Tools / uniform / practical kit', form.tools, updateField)}
                {numberInputLabel('personal', 'Personal & social', form.personal, updateField)}
                {numberInputLabel('other', 'Other costs', form.other, updateField)}
              </div>
            </div>

            <div className="form-section">
              <h3>Funding & support</h3>
              <p className="helper">Separate confirmed money from hoped-for money. This keeps the decision safer.</p>
              <div className="form-grid">
                {numberInputLabel('confirmedFunding', 'Confirmed annual funding', form.confirmedFunding, updateField, 'award letter / written confirmation')}
                {numberInputLabel('hopedFunding', 'Hoped-for annual funding', form.hopedFunding, updateField, 'scenario only')}
                {numberInputLabel('confirmedMonthlySupport', 'Confirmed monthly contribution', form.confirmedMonthlySupport, updateField)}
                {numberInputLabel('hopedMonthlySupport', 'Hoped-for monthly contribution', form.hopedMonthlySupport, updateField, 'scenario only')}
                {numberInputLabel('studentIncome', 'Student income / stipend', form.studentIncome, updateField, 'per month')}
              </div>
            </div>

            <div className="cost-live-preview" aria-live="polite">
              <div>
                <span className="eyebrow">Live affordability read</span>
                <h3>{result.verdict}</h3>
                <p>{reality?.capacity ? `Safe monthly burden is ${formatR(result.safeNetMonthly)} against Tool 1 capacity of ${formatR(reality.capacity)}.` : 'Run Tool 1 first to add household capacity to this verdict.'}</p>
              </div>
              <div className="cost-preview-stat">
                <strong>{formatR(result.safeNetMonthly)}</strong>
                <span>safe monthly burden</span>
              </div>
            </div>

            <div className="form-actions">
              <button className="btn btn-primary" type="submit">Calculate true cost →</button>
              <button className="btn btn-ghost" type="button" onClick={handleReset}>Reset</button>
            </div>
          </form>

          {showResult ? (
            <div className="result-panel" ref={resultRef}>
              <span className="eyebrow" style={{ color: 'var(--terracotta-soft)' }}>Your true cost</span>
              <div className={`verdict ${bandClass(result.band)}`}>{result.verdict}</div>
              <p>{result.verdictBody}</p>

              <div className="stats">
                <div><div className="stat-num">{formatR(result.totalAnnual)}</div><div className="stat-label">True year-one cost</div></div>
                <div><div className="stat-num">{formatR(result.safeNetAnnual)}</div><div className="stat-label">After confirmed funding</div></div>
                <div><div className="stat-num">{formatR(result.safeNetMonthly)}</div><div className="stat-label">Safe required / month</div></div>
                <div><div className="stat-num">{formatR(result.firstMonthCost)}</div><div className="stat-label">First-month cash need</div></div>
                <div><div className="stat-num">{pct(result.stressRatio)}</div><div className="stat-label">Capacity used</div></div>
                <div><div className="stat-num">{formatR(result.programmeTotal)}</div><div className="stat-label">Programme exposure</div></div>
              </div>

              <div className="cost-result-grid">
                <div className="cost-insight-box">
                  <h4>Top cost drivers</h4>
                  <ol className="result-ordered-list">
                    {result.topDrivers.map((driver) => <li key={driver.label}><strong>{driver.label}:</strong> {formatR(driver.amount)} ({driver.share}% of year one)</li>)}
                  </ol>
                </div>
                <div className="cost-insight-box">
                  <h4>Funding scenario</h4>
                  <p>Confirmed funding leaves {formatR(result.safeNetMonthly)} per month.</p>
                  <p>If hoped-for funding comes through, the scenario drops to {formatR(result.scenarioNetMonthly)} per month.</p>
                </div>
              </div>

              <h4 style={{ marginBottom: 'var(--space-3)' }}>What this means</h4>
              <ul>{result.implications.map((item) => <li key={item}>{item}</li>)}</ul>

              <div className="residence-risk">
                <span className="eyebrow">Residence and first-month shock</span>
                <h3>Residence risk: <span className={`residence-risk-value ${residenceClass(result.residenceBand)}`}>{result.residenceBand}</span></h3>
                <div className="residence-risk-grid">
                  <div className="residence-risk-item"><div className="residence-risk-label">Living-away burden</div><div className="residence-risk-value">{formatR(toNumber(form.accommodation) / 12)}</div></div>
                  <div className="residence-risk-item"><div className="residence-risk-label">Risk ratio</div><div className="residence-risk-value">{pct(result.residenceRiskRatio)}</div></div>
                  <div className="residence-risk-item"><div className="residence-risk-label">First month</div><div className="residence-risk-value">{formatR(result.firstMonthCost)}</div></div>
                </div>
                <p>{result.residenceBand === 'avoided' ? 'Living at home appears to avoid the residence cost shock.' : 'Verify residence deposit deadlines, refund policy, private accommodation coverage and whether funding pays before the landlord or residence expects payment.'}</p>
              </div>

              <div className="funding-guidance">
                <span className="eyebrow">Funding routes to investigate</span>
                <h2>Start here before paying deposits</h2>
                <div className="funding-grid">
                  {result.fundingRoutes.map((route) => (
                    <div className={`funding-card ${route.level}`} key={route.title}>
                      <div className="funding-tag">{route.relevance}</div>
                      <h4>{route.title}</h4>
                      <p>{route.who}</p>
                      <p><strong>Watch:</strong> {route.warning}</p>
                    </div>
                  ))}
                </div>
                <p className="funding-warning">Funding warning: do not treat hoped-for funding as safe until it is confirmed in writing.</p>
              </div>

              <div className="on-paper-box">
                <h4>Safer levers to test next</h4>
                <ol className="result-ordered-list">
                  {result.saferLevers.map((lever) => <li key={lever}>{lever}</li>)}
                </ol>
              </div>

              <div className="next-steps">
                <a className="btn btn-primary" href="/tools/route-compare">Next: Compare two routes →</a>
                <button className="btn btn-secondary" type="button" onClick={() => setShowResult(false)}>Adjust answers</button>
                <button className="btn btn-print" type="button" onClick={() => window.print()}>Print / save as PDF</button>
              </div>
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}
