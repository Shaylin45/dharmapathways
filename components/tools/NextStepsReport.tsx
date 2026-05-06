'use client';

import { useEffect, useMemo, useState } from 'react';

type Tone = 'green' | 'amber' | 'red';
type LensKey = 'lowerRisk' | 'strongerEmployment' | 'fasterEntry';

type StoredReality = {
  capacity?: number;
  surplus?: number;
  bracket?: string;
  pressure?: string;
  pressureBand?: string;
  drivers?: string[];
  nextActions?: string[];
  routeSafety?: string;
};

type CostDriver = {
  label: string;
  amount: number;
  share: number;
};

type FundingRoute = {
  title: string;
  relevance: string;
  level: 'high' | 'possible' | 'low';
  who: string;
  warning: string;
};

type StoredCost = {
  totalAnnual?: number;
  netMonthly?: number;
  safeNetMonthly?: number;
  scenarioNetMonthly?: number;
  firstMonthCost?: number;
  programmeTotal?: number;
  affordabilityGap?: number;
  stressRatio?: number | null;
  band?: 'comfortable' | 'tight' | 'over' | 'severe';
  residenceBand?: 'avoided' | 'low' | 'moderate' | 'high' | 'severe';
  topDrivers?: CostDriver[];
  fundingRoutes?: FundingRoute[];
  saferLevers?: string[];
  pathwayLabel?: string;
  livingLabel?: string;
  breakdown?: {
    tuition?: number;
    reg?: number;
    accom?: number;
    food?: number;
    transport?: number;
    books?: number;
    devices?: number;
    data?: number;
    personal?: number;
    other?: number;
  };
};

type StoredRoute = {
  name?: string;
  field?: string;
  fieldLabel?: string;
  qual?: string;
  duration?: number;
  cost?: number;
  support?: number;
  fundingCertainty?: number;
  admission?: number;
  accreditation?: number;
  completion?: number;
  workIntegrated?: number;
  job?: number;
  suggestedEmploymentSignal?: number;
  bottleneck?: string;
  employmentBasis?: string;
  modifiers?: string[];
};

type RouteScore = {
  affordabilityScore?: number;
  employment?: {
    suggested?: number;
  };
  total?: number;
  monthlyExposure?: number;
  riskFlags?: string[];
};

type StoredCompare = {
  a?: StoredRoute;
  b?: StoredRoute;
  sa?: RouteScore;
  sb?: RouteScore;
};

type SaferRoute = {
  title: string;
  tag: string;
  why: string;
  route: string;
  next: string;
};

type FitDetail = {
  title: string;
  match: number;
  fitScore: number;
  readinessScore: number;
  fieldFit?: number;
  routeReadiness?: string;
  employmentSignal?: number;
  readinessNotes?: string[];
  routes?: string;
  evidenceNote?: string;
  bottleneckNote?: string;
};

type StoredFit = {
  top?: string[];
  detailedTop?: FitDetail[];
  dream?: {
    label?: string;
    note?: string;
    saferRoutes?: SaferRoute[];
  };
  verdict?: string;
  verdictBody?: string;
};

type PathwayCard = {
  title: string;
  summary: string;
  cost: string;
  duration: string;
  qualification: string;
  tradeoffs: string;
  thisWeek: string;
};

type PathwayBrief = {
  field: string;
  labourSignal: string;
  lowerRisk: PathwayCard;
  strongerEmployment: PathwayCard;
  fasterEntry: PathwayCard;
};

type DecisionLight = {
  label: string;
  value: string;
  tone: Tone;
  note: string;
};

type Recommendation = {
  title: string;
  match: number;
  readinessScore: number;
  employmentSignal: number;
  lens: LensKey;
  lensLabel: string;
  lensReason: string;
  labourSignal: string;
  primary: PathwayCard;
  secondary: PathwayCard[];
  readinessNotes: string[];
  cautionNotes: string[];
  thisWeek: string;
};

const STORAGE_KEYS = {
  reality: 'dharma_reality',
  cost: 'dharma_cost',
  compare: 'dharma_compare',
  fit: 'dharma_fit',
  checklist: 'commitChecklist',
} as const;

const CHECKLIST_ITEMS = [
  { key: 'save-report', label: 'Save or print the report.' },
  { key: 'fee-statement', label: 'Get an official fee statement from the institution or provider.' },
  { key: 'accreditation', label: 'Confirm accreditation or registration from an official source.' },
  { key: 'funding-deadline', label: 'Check the relevant bursary, loan or funder deadline.' },
  { key: 'residence-deposit', label: 'Ask about residence, registration, deposit and first-month costs.' },
  { key: 'compare-route', label: 'Compare at least one lower-cost or lower-risk route.' },
  { key: 'field-conversation', label: 'Speak to someone already working or studying in the field.' },
  { key: 'employment-outcomes', label: 'Ask about completion and first-job outcomes.' },
  { key: 'refund-policy', label: 'Check the refund or cancellation policy before any payment.' },
  { key: 'repeat-risk', label: 'Confirm what happens if the student repeats a year or funding falls through.' },
] as const;

const PATHWAY_LIBRARY: Record<string, PathwayBrief> = {
  'Software development & data': {
    field: 'Software & data',
    labourSignal: 'Software, support and data roles remain active in the South African labour market, but employers reward portfolio quality and practical proof of skill as much as the route name.',
    lowerRisk: {
      title: 'Diploma in IT with portfolio work',
      summary: 'A diploma can be more accessible than Computer Science while still building employable software, support and systems skills.',
      cost: 'Lower than a full degree',
      duration: '3 years',
      qualification: 'NQF 6 diploma',
      tradeoffs: 'Career ceiling can be slower than a strong degree plus certifications route, but the path is more affordable.',
      thisWeek: 'Ask two providers about graduate placement, portfolio projects and whether industry certifications are built in.',
    },
    strongerEmployment: {
      title: 'Degree route plus cloud or data certifications',
      summary: 'A public-university IT or data route plus certifications usually gives the strongest long-term employer signal.',
      cost: 'Moderate to high',
      duration: '3 years + certs',
      qualification: 'NQF 7 degree',
      tradeoffs: 'Higher cost and more time before earning, so monthly affordability must be realistic.',
      thisWeek: 'Compare two public-university fee statements and check how much home vs residence changes the true cost.',
    },
    fasterEntry: {
      title: 'Learnership, support role or bootcamp plus projects',
      summary: 'Employer-linked learnerships and entry support roles can get the student into real workplace exposure sooner.',
      cost: 'Low to moderate',
      duration: '1 year to first foothold',
      qualification: 'Learnership or portfolio route',
      tradeoffs: 'Not every bootcamp delivers the same outcome, so proof of placement matters.',
      thisWeek: 'Check stipend, qualification level and placement support before paying for any short programme.',
    },
  },
  Engineering: {
    field: 'Engineering',
    labourSignal: 'Engineering routes still connect to scarce-skills demand, but direct degree entry is expensive and strongly filtered by maths, science and completion risk.',
    lowerRisk: {
      title: 'University of Technology engineering diploma',
      summary: 'A UoT diploma is often the safest structured engineering route when marks or cost make direct BEng risky.',
      cost: 'Lower than BEng',
      duration: '3 years',
      qualification: 'NQF 6 diploma',
      tradeoffs: 'Professional-engineer status is slower than the direct BEng route.',
      thisWeek: 'Compare UoT diploma fees, placement support and articulation options into advanced study.',
    },
    strongerEmployment: {
      title: 'BEng or engineering degree with strong maths and science support',
      summary: 'This remains the strongest long-run professional route where entry marks, funding and resilience are strong.',
      cost: 'High',
      duration: '4 years',
      qualification: 'NQF 8 degree',
      tradeoffs: 'A full degree is the highest-pressure option if the household cannot absorb repeats or residence costs.',
      thisWeek: 'Check direct admission thresholds and model the full four-year cost before any deposit decision.',
    },
    fasterEntry: {
      title: 'TVET NATED technical route plus workplace learning',
      summary: 'A technical NATED or artisan pathway can move the student into earning sooner while keeping technical skills central.',
      cost: 'Low to moderate',
      duration: '2 to 3 years + placement',
      qualification: 'NATED or trade-test route',
      tradeoffs: 'Not the same as a professional-engineer pathway, but often safer and more practical.',
      thisWeek: 'Ask which placements are supported and whether graduates transition into apprenticeships reliably.',
    },
  },
  Trades: {
    field: 'Trades',
    labourSignal: 'Qualified artisan routes remain one of the clearest demand signals in the market, especially when a real trade test or apprenticeship is part of the plan.',
    lowerRisk: {
      title: 'TVET NCV or NATED plus apprenticeship',
      summary: 'This is a lower-cost, structured way to build a real trade rather than paying for weak private promises.',
      cost: 'Low',
      duration: '2 to 4 years',
      qualification: 'TVET plus trade-test pathway',
      tradeoffs: 'A classroom-only route is incomplete if it does not lead to workplace evidence.',
      thisWeek: 'Ask the college how apprenticeships are sourced and how many students complete the trade test.',
    },
    strongerEmployment: {
      title: 'Full artisan route with trade test',
      summary: 'The real employability signal is not just classes but recognised workplace learning plus the trade test.',
      cost: 'Low to moderate',
      duration: 'Varies by trade',
      qualification: 'Qualified artisan status',
      tradeoffs: 'Trade-test preparation and placement are the actual bottlenecks.',
      thisWeek: 'Confirm the relevant SETA, trade-test process and employer demand in your area.',
    },
    fasterEntry: {
      title: 'Entry technical work plus staged qualification',
      summary: 'A student can sometimes start in an assistant role while building the formal artisan route in stages.',
      cost: 'Low',
      duration: 'Immediate to first earning',
      qualification: 'Work exposure plus staged study',
      tradeoffs: 'Needs discipline so the student does not stall before qualification.',
      thisWeek: 'Check whether an employer-linked apprenticeship is available before choosing a fully self-funded route.',
    },
  },
  'Health professions': {
    field: 'Health professions',
    labourSignal: 'Health work has strong social value and real demand, but professional routes are highly regulated and often depend on competitive selection, clinical placement and registration.',
    lowerRisk: {
      title: 'Nursing or support-health route with clear registration rules',
      summary: 'Nursing and support-health pathways can be safer than assuming only medicine or highly selective allied health routes count.',
      cost: 'Moderate or funded',
      duration: '1 to 4 years',
      qualification: 'Registered health pathway',
      tradeoffs: 'The student must verify professional-body rules and placement requirements directly.',
      thisWeek: 'Ask about provincial bursaries, registration rules and whether placement sites are guaranteed.',
    },
    strongerEmployment: {
      title: 'Professional degree with verified placement and registration',
      summary: 'The strongest long-run signal comes from routes that clearly lead to recognised practice and supervised placement.',
      cost: 'High',
      duration: '4 years or more',
      qualification: 'Professional degree and registration',
      tradeoffs: 'A selective route becomes high-risk if the household cannot carry long study or repeat costs.',
      thisWeek: 'Check entry requirements, clinical placement and the exact first-year cash need before committing.',
    },
    fasterEntry: {
      title: 'Auxiliary, assistant or clinical-support entry route',
      summary: 'Shorter health-support routes can provide earlier sector exposure and income while testing fit.',
      cost: 'Lower',
      duration: '1 year',
      qualification: 'Certificate or assistant route',
      tradeoffs: 'Scope of practice is narrower, so the student must know what the role actually allows.',
      thisWeek: 'Verify accreditation and the professional-body status of any assistant-level programme.',
    },
  },
  'Teaching & education': {
    field: 'Teaching & education',
    labourSignal: 'Teaching remains meaningful and relatively structured, but subject choice, phase and bursary obligations shape the real opportunity.',
    lowerRisk: {
      title: 'Priority-subject or bursary-aligned teaching route',
      summary: 'A route aligned to funding and demand can reduce family pressure while keeping the student in education.',
      cost: 'Low if funded',
      duration: '4 years',
      qualification: 'BEd or PGCE route',
      tradeoffs: 'Service obligations and public-school placement conditions need to be understood upfront.',
      thisWeek: 'Check Funza Lushaka or other teaching-funding rules, service terms and approved institutions.',
    },
    strongerEmployment: {
      title: 'Accredited BEd or PGCE with strong subject fit',
      summary: 'Employer confidence improves when the route, phase and subject combination are clear and recognised.',
      cost: 'Moderate',
      duration: '4 years or 1-year PGCE after a degree',
      qualification: 'BEd or PGCE + registration',
      tradeoffs: 'A generic education route is weaker than a well-targeted subject or phase route.',
      thisWeek: 'Ask about phase specialisation, practical teaching and current registration requirements.',
    },
    fasterEntry: {
      title: 'ECD, tutoring or training pathway',
      summary: 'Education-related work can often be tested earlier through ECD, tutoring or training roles.',
      cost: 'Low to moderate',
      duration: 'Short to medium',
      qualification: 'Recognised certificate, diploma or training route',
      tradeoffs: 'Not every ECD or training route gives the same long-run school-teaching pathway.',
      thisWeek: 'Confirm whether the programme is recognised and where graduates are actually placed.',
    },
  },
  'Finance, accounting & actuarial': {
    field: 'Finance & accounting',
    labourSignal: 'Structured finance and accounting routes still carry one of the clearest employment signals, but the top professional pathways are long and demanding.',
    lowerRisk: {
      title: 'Accounting diploma or bookkeeping route',
      summary: 'This is often the safer first step when the family needs earlier earning or the student needs to build confidence before a long professional route.',
      cost: 'Lower',
      duration: '1 to 3 years',
      qualification: 'Diploma or certificate',
      tradeoffs: 'The ceiling is lower than a full professional track unless the student studies further.',
      thisWeek: 'Ask employers which junior finance roles they hire for from diploma or bookkeeping routes.',
    },
    strongerEmployment: {
      title: 'BCom accounting with professional progression',
      summary: 'A strong BCom accounting route still provides the clearest long-run finance and professional signal.',
      cost: 'Moderate to high',
      duration: '3 years + training',
      qualification: 'BCom plus professional progression',
      tradeoffs: 'CA, SAIPA and CIMA have different timelines and pressure levels, so compare them directly.',
      thisWeek: 'Compare the total years, fees and workplace-training requirements across the major designations.',
    },
    fasterEntry: {
      title: 'Payroll, clerk or financial-operations entry route',
      summary: 'This can move the student into paid commerce work faster while keeping further study open.',
      cost: 'Lower',
      duration: '1 to 2 years',
      qualification: 'Certificate, diploma or entry-role pathway',
      tradeoffs: 'The route is practical, but it needs a plan for progression if the student wants more than entry-level work.',
      thisWeek: 'Ask about entry-level salary, software exposure and whether the employer supports further study.',
    },
  },
  'Marketing, brand & communications': {
    field: 'Marketing & communications',
    labourSignal: 'The sector rewards proof of campaigns, writing and digital work, so qualification alone is rarely enough.',
    lowerRisk: {
      title: 'Diploma or lower-cost communications route with portfolio',
      summary: 'A credible diploma plus real project work can be safer than paying premium prices for branding alone.',
      cost: 'Moderate',
      duration: '2 to 3 years',
      qualification: 'Diploma or degree',
      tradeoffs: 'Employer outcomes depend heavily on portfolio quality and internships.',
      thisWeek: 'Ask providers how many live briefs, internships or client projects students actually complete.',
    },
    strongerEmployment: {
      title: 'Public-university marketing or communications degree',
      summary: 'A degree can carry stronger corporate recognition when paired with digital, content or analytics exposure.',
      cost: 'Moderate to high',
      duration: '3 years',
      qualification: 'Bachelor’s degree',
      tradeoffs: 'A general degree without portfolio work is weaker than a practical one with evidence.',
      thisWeek: 'Compare fee statements and ask how the programme builds portfolio, analytics and internship experience.',
    },
    fasterEntry: {
      title: 'Content, social media or sales-adjacent entry route',
      summary: 'A faster route is to start building paid content, social or campaign work while studying or through a shorter route.',
      cost: 'Low to moderate',
      duration: 'Short to medium',
      qualification: 'Portfolio and practical route',
      tradeoffs: 'The student must be comfortable creating visible work and iterating quickly.',
      thisWeek: 'Create one sample campaign or content portfolio piece before paying for a long programme.',
    },
  },
  'Design & creative production': {
    field: 'Design & creative production',
    labourSignal: 'Creative routes are highly outcome-sensitive: the portfolio, client work and practical skill signal usually matter more than prestige alone.',
    lowerRisk: {
      title: 'Digital, UX or design diploma with portfolio focus',
      summary: 'A practical design route with portfolio outcomes is safer than paying for vague creative branding.',
      cost: 'Moderate',
      duration: '2 to 3 years',
      qualification: 'Diploma or degree',
      tradeoffs: 'The route only works if the student actually produces portfolio-grade work.',
      thisWeek: 'Ask for graduate portfolios and internship or freelance outcomes from the provider.',
    },
    strongerEmployment: {
      title: 'UX, digital design or product-leaning creative route',
      summary: 'Design routes connected to product, digital marketing or UI often carry stronger employment evidence.',
      cost: 'Moderate',
      duration: '2 to 3 years',
      qualification: 'Portfolio-led design route',
      tradeoffs: 'It can be less “purely artistic” but often more employable.',
      thisWeek: 'Compare a general design route with a UX or product-design route in cost and graduate outcomes.',
    },
    fasterEntry: {
      title: 'Freelance skill stack and short-course route',
      summary: 'Short courses plus a real project stack can test demand before a full expensive qualification.',
      cost: 'Low',
      duration: 'Immediate to 1 year',
      qualification: 'Portfolio and short courses',
      tradeoffs: 'Requires initiative and self-management; the student must make and show work quickly.',
      thisWeek: 'Finish three sample pieces and get external feedback before paying for the most expensive option.',
    },
  },
  'Law & legal services': {
    field: 'Law & legal services',
    labourSignal: 'Law has prestige and strong intellectual fit for some students, but direct legal practice depends on later bottlenecks such as articles and practical placement.',
    lowerRisk: {
      title: 'Paralegal or legal-assistant entry route',
      summary: 'This lets the student test real legal work before absorbing the full cost and competitive pressure of the LLB pathway.',
      cost: 'Lower',
      duration: '1 to 3 years',
      qualification: 'Certificate or diploma',
      tradeoffs: 'Not the same as being an attorney, but a much safer first exposure route.',
      thisWeek: 'Ask firms or legal NGOs what they expect from junior support hires and whether the route articulates later.',
    },
    strongerEmployment: {
      title: 'LLB or law degree with verified placement plan',
      summary: 'A full legal route makes sense when writing strength, academic readiness and family carrying power are all solid.',
      cost: 'Moderate to high',
      duration: '4 years + articles',
      qualification: 'Law degree',
      tradeoffs: 'The degree does not guarantee articles, so post-study bottlenecks must be treated seriously.',
      thisWeek: 'Ask providers and firms how students typically secure articles, and what percentage succeed.',
    },
    fasterEntry: {
      title: 'Compliance, governance or public-policy pathway',
      summary: 'A legal-adjacent route can reach employed work sooner while keeping law-like reasoning and policy interests alive.',
      cost: 'Moderate',
      duration: '2 to 3 years',
      qualification: 'Diploma or degree',
      tradeoffs: 'It is a different outcome from legal practice, but often a more realistic first commitment.',
      thisWeek: 'Compare compliance or public-policy routes against the full LLB pathway before paying a deposit.',
    },
  },
  Psychology: {
    field: 'Psychology',
    labourSignal: 'Psychology is meaningful, but undergraduate study alone does not create a registered psychologist. The postgraduate bottleneck is real and must be planned for honestly.',
    lowerRisk: {
      title: 'Psychology degree plus parallel helping route',
      summary: 'A broader people-helping route is safer when the student likes psychology but postgraduate access is still uncertain.',
      cost: 'Moderate',
      duration: '3 years',
      qualification: 'Bachelor’s degree',
      tradeoffs: 'The student needs a parallel employment story from year one, not only the hope of postgraduate selection.',
      thisWeek: 'Ask departments about Honours selection rates, work exposure and non-clinical graduate outcomes.',
    },
    strongerEmployment: {
      title: 'Professional people-helping route with clearer registration path',
      summary: 'Social work, counselling-adjacent or HR-linked people pathways may produce a clearer first-job signal than pure psychology alone.',
      cost: 'Moderate',
      duration: '3 to 4 years',
      qualification: 'Degree plus professional route',
      tradeoffs: 'The best route depends on whether the student wants therapy, community support or workplace people work.',
      thisWeek: 'Compare psychology, social work and industrial-psychology-adjacent routes before committing.',
    },
    fasterEntry: {
      title: 'Community support, NGO or HR-adjacent exposure route',
      summary: 'A student can test whether people-helping work fits through earlier community, school, NGO or workplace support experience.',
      cost: 'Low to moderate',
      duration: 'Immediate to short',
      qualification: 'Short course, volunteer or entry route',
      tradeoffs: 'The route must still be checked carefully for accreditation and scope.',
      thisWeek: 'Arrange one volunteer or shadowing conversation and ask what the work feels like on difficult days.',
    },
  },
  'Entrepreneurship & small business': {
    field: 'Entrepreneurship',
    labourSignal: 'Entrepreneurship is not a single qualification outcome. The stronger signal is a real marketable skill plus evidence that the student can sell, deliver and manage.',
    lowerRisk: {
      title: 'Marketable skill first, business second',
      summary: 'The safest entrepreneurship route is usually a practical skill paired with business basics.',
      cost: 'Low to moderate',
      duration: 'Flexible',
      qualification: 'Skill-led route',
      tradeoffs: 'A business qualification without something real to sell can become expensive theory.',
      thisWeek: 'Choose the core sellable skill first, then compare study routes that strengthen it.',
    },
    strongerEmployment: {
      title: 'Business, accounting or operations route with commercial discipline',
      summary: 'A structured commerce route can help if the student needs stronger financial, sales or operational foundations.',
      cost: 'Moderate',
      duration: '2 to 3 years',
      qualification: 'Diploma or degree',
      tradeoffs: 'The qualification helps, but the real test is whether the student can execute and sell.',
      thisWeek: 'Compare BCom or diploma cost against how quickly the student could test a real business idea.',
    },
    fasterEntry: {
      title: 'Short-course plus low-overhead business test',
      summary: 'A quick, low-risk market test is often more useful than a long expensive commitment.',
      cost: 'Low',
      duration: 'Immediate',
      qualification: 'Short course and practical test',
      tradeoffs: 'Works only if the student actually tests pricing, customers and delivery in the real world.',
      thisWeek: 'Run one small paid test this month and treat the results as data before choosing bigger study spend.',
    },
  },
  'Hospitality, tourism & events': {
    field: 'Hospitality & tourism',
    labourSignal: 'Hospitality and tourism can offer real openings, but entry salaries are often modest and practical exposure matters a lot.',
    lowerRisk: {
      title: 'TVET or practical hospitality route',
      summary: 'A practical, lower-cost route is often safer than an expensive private promise if the student mainly needs exposure and credibility.',
      cost: 'Low',
      duration: '2 to 3 years',
      qualification: 'Certificate or diploma',
      tradeoffs: 'Management-track progression usually takes time and real workplace learning.',
      thisWeek: 'Ask about internships, placement partners and the real first-job roles graduates take.',
    },
    strongerEmployment: {
      title: 'Hospitality diploma with verified work-integrated learning',
      summary: 'A structured hospitality-management route works best when placement and operations exposure are clearly built in.',
      cost: 'Moderate',
      duration: '3 years',
      qualification: 'Diploma',
      tradeoffs: 'Employer outcomes matter more than polished marketing.',
      thisWeek: 'Compare two providers on placement quality, graduate roles and total hidden costs.',
    },
    fasterEntry: {
      title: 'Entry service role plus staged study',
      summary: 'A quicker path is to enter the sector directly and study in stages once the student has confirmed the fit.',
      cost: 'Low',
      duration: 'Immediate to first earning',
      qualification: 'Work exposure plus staged study',
      tradeoffs: 'The student must be comfortable with physically demanding, customer-facing work.',
      thisWeek: 'Ask hotels or venues whether they support learnerships or study while working.',
    },
  },
  'Public service, NGO & social work': {
    field: 'Public service & social work',
    labourSignal: 'Public and social-sector work can be meaningful and necessary, but students need clarity on which routes lead to formal registration or real funded posts.',
    lowerRisk: {
      title: 'Public administration or community-development route',
      summary: 'A diploma or practical public-service pathway can be a safer entry than assuming only one professional route counts.',
      cost: 'Moderate',
      duration: '2 to 3 years',
      qualification: 'Diploma or degree',
      tradeoffs: 'The route should match the actual work goal: policy, community work, administration or social work.',
      thisWeek: 'Ask employers and NGOs what they hire at diploma level versus only at degree or registration level.',
    },
    strongerEmployment: {
      title: 'Social work or clearly targeted public-service degree',
      summary: 'A more direct degree route is stronger when the student truly wants regulated social work or formal public-sector progression.',
      cost: 'Moderate',
      duration: '3 to 4 years',
      qualification: 'Degree and registration where needed',
      tradeoffs: 'Registration requirements and placements must be verified before commitment.',
      thisWeek: 'Check registration rules and whether fieldwork or internship sites are guaranteed.',
    },
    fasterEntry: {
      title: 'Volunteer, NGO support or community-work exposure route',
      summary: 'Early NGO, school or community support work can clarify fit without the cost of a premature degree choice.',
      cost: 'Low',
      duration: 'Immediate',
      qualification: 'Exposure-led route',
      tradeoffs: 'This is a testing route, so it needs a follow-on plan if the student wants formal professional status later.',
      thisWeek: 'Arrange a volunteer or community placement conversation and ask what entry roles really require.',
    },
  },
  'Agriculture, environment & natural sciences': {
    field: 'Agriculture & environment',
    labourSignal: 'Agriculture, environmental and natural-science routes can be credible, but applied exposure and location realities matter as much as the qualification title.',
    lowerRisk: {
      title: 'Agricultural-college diploma or applied route',
      summary: 'A practical college or diploma route may be safer and more employable than an abstract academic option for some students.',
      cost: 'Moderate',
      duration: '2 to 3 years',
      qualification: 'Applied diploma',
      tradeoffs: 'Research or policy ceilings are lower than a full BSc route.',
      thisWeek: 'Check whether the route includes fieldwork, farm exposure or environmental placement support.',
    },
    strongerEmployment: {
      title: 'BSc agriculture, environmental or natural-science route',
      summary: 'A targeted public-university science route is stronger when marks, field fit and funding are all genuinely solid.',
      cost: 'Moderate to high',
      duration: '3 years',
      qualification: 'BSc degree',
      tradeoffs: 'Rural placements, fieldwork and specialised admission rules can change the real family burden.',
      thisWeek: 'Compare admission requirements and practical-learning expectations across two institutions.',
    },
    fasterEntry: {
      title: 'Learnership, conservation or field-exposure route',
      summary: 'Shorter, practical sector exposure can help the student test the work before a bigger commitment.',
      cost: 'Low',
      duration: 'Immediate to 1 year',
      qualification: 'Learnership or exposure pathway',
      tradeoffs: 'Good for fit testing, but not a full substitute if the student needs a professional science outcome later.',
      thisWeek: 'Ask about stipend, location requirements and what happens after the first exposure year.',
    },
  },
  'Logistics, supply chain & operations': {
    field: 'Logistics & supply chain',
    labourSignal: 'Logistics, operations and supply chain are broad, durable sectors, and employers often recognise both diploma and degree pathways when the route has practical credibility.',
    lowerRisk: {
      title: 'Logistics or supply-chain diploma',
      summary: 'A diploma is often a very credible, lower-cost way into operations and warehousing-related roles.',
      cost: 'Moderate',
      duration: '3 years',
      qualification: 'NQF 6 diploma',
      tradeoffs: 'The long-run corporate ceiling may be lower than a strong BCom route.',
      thisWeek: 'Ask about work-integrated learning and which companies actually recruit from the programme.',
    },
    strongerEmployment: {
      title: 'BCom logistics or supply chain',
      summary: 'This is the stronger corporate signal when the family can carry the cost and the student wants planning, procurement or graduate-programme routes.',
      cost: 'Moderate to high',
      duration: '3 years',
      qualification: 'BCom degree',
      tradeoffs: 'More theory and higher cost than a diploma, so it must be worth the extra pressure.',
      thisWeek: 'Compare diploma vs BCom cost, employer recognition and the actual role mix graduates enter.',
    },
    fasterEntry: {
      title: 'Learnership or warehouse-operations entry route',
      summary: 'A learnership or operations entry role can get the student into the sector sooner while keeping study options open.',
      cost: 'Low',
      duration: 'Immediate to 1 year',
      qualification: 'Learnership or entry-role pathway',
      tradeoffs: 'The student needs a progression plan so early earning does not become permanent stagnation.',
      thisWeek: 'Ask about stipend, qualification level and whether the employer promotes from operations into coordination or planning.',
    },
  },
};

function readStorage<T>(key: string): T | null {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function formatR(value: number | null | undefined) {
  if (value == null || !Number.isFinite(value)) return 'Not saved yet';
  return `R ${Math.round(value).toLocaleString('en-ZA')}`;
}

function safeScore(value: number | undefined | null, fallback = 0) {
  return value == null || !Number.isFinite(value) ? fallback : value;
}

function pressureTone(pressure?: string): Tone {
  if (!pressure) return 'amber';
  if (['low', 'manageable'].includes(pressure)) return 'green';
  if (pressure === 'moderate') return 'amber';
  return 'red';
}

function costTone(band?: StoredCost['band']): Tone {
  if (!band) return 'amber';
  if (band === 'comfortable') return 'green';
  if (band === 'tight') return 'amber';
  return 'red';
}

function residenceTone(band?: StoredCost['residenceBand']): Tone {
  if (!band) return 'amber';
  if (band === 'avoided' || band === 'low') return 'green';
  if (band === 'moderate') return 'amber';
  return 'red';
}

function employmentTone(score: number): Tone {
  if (score >= 75) return 'green';
  if (score >= 58) return 'amber';
  return 'red';
}

function readinessTone(score: number): Tone {
  if (score >= 74) return 'green';
  if (score >= 60) return 'amber';
  return 'red';
}

function firstMonthTone(cost: StoredCost | null, reality: StoredReality | null): Tone {
  if (!cost?.firstMonthCost) return 'amber';
  const monthly = cost.netMonthly && cost.netMonthly > 0 ? cost.netMonthly : null;
  const capacity = reality?.capacity && reality.capacity > 0 ? reality.capacity : null;
  const againstMonthly = monthly ? cost.firstMonthCost / monthly : 0;
  const againstCapacity = capacity ? cost.firstMonthCost / capacity : 0;
  if (againstMonthly > 2 || againstCapacity > 2) return 'red';
  if (againstMonthly > 1.2 || againstCapacity > 1.2) return 'amber';
  return 'green';
}

function partialMessage(
  completed: { reality: boolean; cost: boolean; compare: boolean; fit: boolean },
  nextAction: string,
) {
  if (!completed.reality) {
    return 'Run Reality Check first so this report understands what the household can actually carry.';
  }
  if (!completed.cost) {
    return 'Reality Check is saved. The next move is True Cost so we can price the real monthly burden and the first-month cash shock.';
  }
  if (!completed.fit) {
    return 'You now have affordability context. Run Career Fit next so the report can recommend routes that are realistic for both the student and the household.';
  }
  if (!completed.compare) {
    return `The decision brief is mostly ready. ${nextAction}`;
  }
  return null;
}

function getNextBestAction(
  reality: StoredReality | null,
  cost: StoredCost | null,
  compare: StoredCompare | null,
  fit: StoredFit | null,
  topFit: FitDetail | null,
) {
  if (!reality) return 'Start with Reality Check to anchor the decision in household reality.';
  if (!cost) return 'Run True Cost on the most realistic route before anyone pays a deposit.';
  if (!fit) return 'Run Career Fit so the family can compare affordability against real field fit and readiness.';
  if (!compare) return 'Use Route Compare on your two most realistic options before committing money or accommodation.';
  if (cost.band === 'over' || cost.band === 'severe') return 'Do not commit to an expensive route until you compare a lower-cost or work-linked option.';
  if ((topFit?.readinessScore ?? 100) < 60) return 'Compare a bridging, diploma, TVET or staged-entry route before direct high-pressure entry.';
  return 'Use this page as your final weekly checklist: verify fees, accreditation, funding and workplace exposure before payment.';
}

function buildWarnings(
  reality: StoredReality | null,
  cost: StoredCost | null,
  compare: StoredCompare | null,
  fit: StoredFit | null,
) {
  const warnings: string[] = [];

  if (!reality) warnings.push('Reality Check has not been completed yet, so household pressure and funding bracket are still unknown.');
  if (!cost) warnings.push('True Cost has not been completed yet, so the report cannot test monthly burden, first-month cash shock or residence risk.');
  if (!fit) warnings.push('Career Fit has not been completed yet, so this report cannot yet recommend routes matched to the student’s actual fit and readiness.');
  if (!compare) warnings.push('Route Compare is still missing, so the final report cannot yet show which of two real options looks safer side by side.');

  if (reality && ['high', 'severe'].includes(reality.pressure ?? '')) {
    warnings.push('Household pressure is high. Prioritise funded, local, staged, TVET, learnership, distance or work-and-study options before high-cost prestige routes.');
  }

  if (reality?.capacity && cost?.netMonthly && cost.netMonthly > reality.capacity) {
    warnings.push(`The current study route appears to exceed saved household study capacity by about ${formatR(cost.netMonthly - reality.capacity)} per month.`);
  }

  if (cost?.firstMonthCost && cost?.netMonthly && cost.firstMonthCost > cost.netMonthly * 1.8) {
    warnings.push('The first month is materially heavier than a normal month. Registration, deposits, devices and accommodation may arrive all at once.');
  }

  if (cost?.residenceBand && ['high', 'severe'].includes(cost.residenceBand)) {
    warnings.push('Residence or moving-away costs look structurally risky. A living-at-home or staged route deserves serious comparison before any deposit.');
  }

  if (fit?.detailedTop?.some((item) => item.readinessScore < 60)) {
    warnings.push('At least one strong-interest field shows a readiness warning. A diploma, bridging, TVET or staged-entry version may be safer than direct degree entry.');
  }

  if (compare?.sa?.riskFlags?.length || compare?.sb?.riskFlags?.length) {
    warnings.push('Route Compare has already flagged route-level risks. Read those flags before paying for the “winner.”');
  }

  return warnings;
}

function getCompareSummary(compare: StoredCompare | null) {
  if (!compare?.a || !compare?.b || !compare.sa || !compare.sb) return null;
  const aTotal = safeScore(compare.sa.total, 0);
  const bTotal = safeScore(compare.sb.total, 0);
  const winner = aTotal >= bTotal ? compare.a : compare.b;
  const loser = aTotal >= bTotal ? compare.b : compare.a;
  const winnerScore = aTotal >= bTotal ? compare.sa : compare.sb;
  const loserScore = aTotal >= bTotal ? compare.sb : compare.sa;
  const margin = Math.round(Math.abs(aTotal - bTotal));
  const winnerEmployment = safeScore(winner.job ?? winner.suggestedEmploymentSignal ?? winnerScore.employment?.suggested, 55);
  const winnerAffordability = safeScore(winnerScore.affordabilityScore, 50);
  const note =
    margin < 4
      ? 'The two options are close. This is a “pause and verify” result rather than a clear winner.'
      : `${winner.name ?? 'The stronger route'} currently edges ahead because it looks easier to carry and more grounded in real work outcomes.`;

  return {
    winner,
    loser,
    winnerEmployment,
    winnerAffordability,
    note,
    margin,
    riskFlags: [...(winnerScore.riskFlags ?? []), ...(loserScore.riskFlags ?? [])].slice(0, 5),
  };
}

function lensLabel(lens: LensKey) {
  if (lens === 'lowerRisk') return 'Lower-risk first move';
  if (lens === 'strongerEmployment') return 'Stronger employment signal';
  return 'Faster route to earning or exposure';
}

function chooseLens(detail: FitDetail, reality: StoredReality | null, cost: StoredCost | null): { key: LensKey; reason: string } {
  const affordability = costTone(cost?.band);
  const readiness = readinessTone(detail.readinessScore);
  const employment = employmentTone(detail.employmentSignal ?? 55);
  const firstMonth = firstMonthTone(cost, reality);

  if (readiness === 'red') {
    return {
      key: 'lowerRisk',
      reason: 'Readiness looks fragile right now, so the safest recommendation is a staged or lower-pressure entry route.',
    };
  }

  if (affordability === 'red' || firstMonth === 'red' || pressureTone(reality?.pressure) === 'red') {
    return {
      key: 'lowerRisk',
      reason: 'Family pressure and cost risk are driving the recommendation toward a route the household can actually carry.',
    };
  }

  if (employment === 'green') {
    return {
      key: 'strongerEmployment',
      reason: 'This field already shows a good employment signal, so the recommendation favours the route with the clearest labour-market payoff.',
    };
  }

  return {
    key: 'fasterEntry',
    reason: 'This recommendation favours earlier workplace exposure so the student can test the field before absorbing too much cost.',
  };
}

function makeFallbackPath(title: string, routes: string | undefined): PathwayBrief {
  return {
    field: title,
    labourSignal: `${title} can still be a valid route, but the family should verify current fees, accreditation, placement and graduate outcomes directly before committing money.`,
    lowerRisk: {
      title: `Lower-risk ${title} entry`,
      summary: `Look for a diploma, higher certificate, TVET or staged version of ${title} before assuming the most expensive route is the only valid one.`,
      cost: 'Verify directly',
      duration: 'Verify directly',
      qualification: routes || 'Verify on SAQA and official provider pages',
      tradeoffs: 'The safer route may look less prestigious, but it can still be the wiser first step.',
      thisWeek: 'Shortlist two cheaper or staged options and ask how they articulate or lead to real work.',
    },
    strongerEmployment: {
      title: `${title} route with stronger outcomes`,
      summary: 'Identify the version of this field that leads to the clearest first-job, registration or placement story.',
      cost: 'Verify directly',
      duration: 'Verify directly',
      qualification: routes || 'Verify directly',
      tradeoffs: 'Do not assume the qualification name alone creates employability.',
      thisWeek: 'Ask for completion, placement and graduate-outcome evidence from the provider.',
    },
    fasterEntry: {
      title: `Faster ${title} exposure route`,
      summary: 'Look for a shorter, work-linked or staged route that lets the student test fit before a big financial commitment.',
      cost: 'Verify directly',
      duration: 'Short to medium',
      qualification: routes || 'Verify directly',
      tradeoffs: 'The faster route should still be real, recognised and worth the cost.',
      thisWeek: 'Ask which route gets the student closest to real workplace exposure in the next 6 to 12 months.',
    },
  };
}

function buildRecommendations(
  fit: StoredFit | null,
  reality: StoredReality | null,
  cost: StoredCost | null,
) {
  const details = fit?.detailedTop?.slice(0, 3) ?? [];

  return details.map((detail) => {
    const brief = PATHWAY_LIBRARY[detail.title] ?? makeFallbackPath(detail.title, detail.routes);
    const selected = chooseLens(detail, reality, cost);
    const primary =
      selected.key === 'lowerRisk'
        ? brief.lowerRisk
        : selected.key === 'strongerEmployment'
          ? brief.strongerEmployment
          : brief.fasterEntry;
    const secondary =
      selected.key === 'lowerRisk'
        ? [brief.strongerEmployment, brief.fasterEntry]
        : selected.key === 'strongerEmployment'
          ? [brief.lowerRisk, brief.fasterEntry]
          : [brief.lowerRisk, brief.strongerEmployment];

    const cautionNotes = [
      ...(detail.bottleneckNote ? [detail.bottleneckNote] : []),
      ...(detail.evidenceNote ? [detail.evidenceNote] : []),
      ...(cost?.band === 'over' || cost?.band === 'severe'
        ? ['The current cost picture suggests the family should treat this as a compare-again decision, not a rush decision.']
        : []),
    ].slice(0, 3);

    return {
      title: detail.title,
      match: safeScore(detail.match, 0),
      readinessScore: safeScore(detail.readinessScore, 0),
      employmentSignal: safeScore(detail.employmentSignal, 55),
      lens: selected.key,
      lensLabel: lensLabel(selected.key),
      lensReason: selected.reason,
      labourSignal: brief.labourSignal,
      primary,
      secondary,
      readinessNotes: detail.readinessNotes ?? [],
      cautionNotes,
      thisWeek: primary.thisWeek,
    } satisfies Recommendation;
  });
}

function fundingRealityLabel(reality: StoredReality | null, cost: StoredCost | null) {
  if (cost?.affordabilityGap != null && cost.affordabilityGap <= 0 && pressureTone(reality?.pressure) === 'green') {
    return {
      value: 'Secured or household-carried',
      tone: 'green' as Tone,
      note: 'On the current numbers, the route may be financially carryable without depending on uncertain rescue funding.',
    };
  }

  if (reality?.bracket === 'NSFAS-eligible') {
    return {
      value: 'Investigate strongly',
      tone: 'amber' as Tone,
      note: 'The household may fit a bursary-linked bracket, but no one should rely on assumed funding until rules and timing are confirmed.',
    };
  }

  if (reality?.bracket === 'Missing middle') {
    return {
      value: 'Not yet reliable',
      tone: 'red' as Tone,
      note: 'The family may sit in the gap where support is possible but not guaranteed. Compare lower-cost or staged routes seriously.',
    };
  }

  return {
    value: 'Investigate',
    tone: 'amber' as Tone,
    note: 'Funding routes exist, but the report still treats them as unconfirmed until they are verified directly.',
  };
}

function buildDecisionLights(
  reality: StoredReality | null,
  cost: StoredCost | null,
  compare: StoredCompare | null,
  fit: StoredFit | null,
): DecisionLight[] {
  const topFit = fit?.detailedTop?.[0] ?? null;
  const compareSummary = getCompareSummary(compare);
  const funding = fundingRealityLabel(reality, cost);

  const affordabilityValue =
    reality?.pressureBand ?? (cost?.band === 'comfortable' ? 'Low pressure' : cost?.band === 'tight' ? 'Moderate pressure' : cost?.band ? 'High pressure' : 'Not saved');

  const firstMonthValue = !cost?.firstMonthCost
    ? 'Not priced yet'
    : firstMonthTone(cost, reality) === 'green'
      ? 'Manageable'
      : firstMonthTone(cost, reality) === 'amber'
        ? 'Warning'
        : 'Dangerous';

  const readinessValue =
    topFit == null
      ? 'Run Career Fit'
      : topFit.readinessScore >= 74
        ? 'Ready'
        : topFit.readinessScore >= 60
          ? 'Needs improvement'
          : 'High-risk entry';

  const employmentScore = compareSummary?.winnerEmployment ?? safeScore(topFit?.employmentSignal, 55);
  const employmentValue = employmentScore >= 78 ? 'Very strong' : employmentScore >= 68 ? 'Strong' : employmentScore >= 55 ? 'Moderate' : 'Weak';

  return [
    {
      label: 'Affordability fit',
      value: affordabilityValue,
      tone: reality ? pressureTone(reality.pressure) : costTone(cost?.band),
      note: reality?.routeSafety ?? 'This light combines household pressure and what the saved route appears to demand each month.',
    },
    {
      label: 'First-month shock',
      value: firstMonthValue,
      tone: firstMonthTone(cost, reality),
      note: cost?.firstMonthCost
        ? `Saved first-month need: ${formatR(cost.firstMonthCost)}. This matters because deposits, devices and registration costs hit before the route settles.`
        : 'The first-month burden has not been costed yet.',
    },
    {
      label: 'Residence risk',
      value: cost?.residenceBand ? cost.residenceBand.replace('-', ' ') : 'Not saved',
      tone: residenceTone(cost?.residenceBand),
      note: cost?.livingLabel
        ? `Current cost model assumes ${cost.livingLabel.toLowerCase()}. Residence and moving-away choices can change the whole decision.`
        : 'Living arrangement has not been priced yet.',
    },
    {
      label: 'Employment signal',
      value: employmentValue,
      tone: employmentTone(employmentScore),
      note: compareSummary
        ? `${compareSummary.winner.name ?? 'The stronger route'} currently has the better route-comparison employment signal.`
        : 'This is based on the current top fit field and should be verified with actual graduate outcomes.',
    },
    {
      label: 'Readiness fit',
      value: readinessValue,
      tone: topFit ? readinessTone(topFit.readinessScore) : 'amber',
      note: topFit
        ? `${topFit.title} currently shows readiness at ${Math.round(topFit.readinessScore)}%. Use bridging, diploma or staged entry if that score is still fragile.`
        : 'The report needs Career Fit data before it can test field readiness honestly.',
    },
    {
      label: 'Funding realism',
      value: funding.value,
      tone: funding.tone,
      note: funding.note,
    },
  ];
}

function buildQuestionList(
  recommendation: Recommendation | null,
  compareSummary: ReturnType<typeof getCompareSummary>,
  cost: StoredCost | null,
) {
  const base = [
    'Is this qualification currently accredited and correctly listed on the NQF or with the relevant professional body?',
    'What did last year’s students actually pay in total, including registration, devices, residence, transport and first-month cash needs?',
    'What percentage of students complete on time, and what usually causes delays or repeats?',
    'What workplace learning, placement, articles, internship or registration steps are still required after study?',
    'What happens financially if funding falls through, the student changes route or a repeat year happens?',
  ];

  if (recommendation?.lens === 'lowerRisk') {
    base.push('If we start with the lower-risk route, what credits or articulation options stay open later?');
  }

  if (recommendation?.lens === 'strongerEmployment') {
    base.push('What evidence do you have that graduates actually enter relevant work within 6 to 12 months?');
  }

  if (recommendation?.lens === 'fasterEntry') {
    base.push('How soon does the student reach real workplace exposure, and what is the earnings or stipend reality in that period?');
  }

  if (compareSummary?.winner?.name) {
    base.push(`Why should we choose ${compareSummary.winner.name} over ${compareSummary.loser?.name ?? 'the other route'} if both remain on the table?`);
  }

  if (cost?.firstMonthCost) {
    base.push(`How should the family plan for the first-month cash need of about ${formatR(cost.firstMonthCost)}?`);
  }

  return base.slice(0, 8);
}

function buildFamilySummary(
  reality: StoredReality | null,
  cost: StoredCost | null,
  compareSummary: ReturnType<typeof getCompareSummary>,
  topRecommendation: Recommendation | null,
  nextAction: string,
) {
  const lines = [
    'Dharma Pathways family decision summary',
    '',
    `Household pressure: ${reality?.pressureBand ?? 'Not saved yet'}`,
    `Funding bracket: ${reality?.bracket ?? 'Not saved yet'}`,
    `True monthly study cost: ${formatR(cost?.netMonthly)}`,
    `First-month cash need: ${formatR(cost?.firstMonthCost)}`,
    `Residence risk: ${cost?.residenceBand ?? 'Not priced yet'}`,
    `Top fit route: ${topRecommendation?.title ?? 'Run Career Fit'}`,
    `Recommended first move: ${topRecommendation?.primary.title ?? nextAction}`,
    `Route Compare winner: ${compareSummary?.winner?.name ?? 'Not compared yet'}`,
    '',
    'Three questions to ask this week:',
    `1. ${topRecommendation?.thisWeek ?? 'What is the lowest-risk route we can still trust?'}`,
    '2. Are fees, accreditation and placement requirements confirmed on an official source?',
    '3. What happens if funding or family support changes after registration?',
    '',
    `Next best action: ${nextAction}`,
  ];

  return lines.join('\n');
}

export function NextStepsReport() {
  const [loaded, setLoaded] = useState(false);
  const [reality, setReality] = useState<StoredReality | null>(null);
  const [cost, setCost] = useState<StoredCost | null>(null);
  const [compare, setCompare] = useState<StoredCompare | null>(null);
  const [fit, setFit] = useState<StoredFit | null>(null);
  const [checklist, setChecklist] = useState<Record<string, boolean>>({});
  const [shareStatus, setShareStatus] = useState('');

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setReality(readStorage<StoredReality>(STORAGE_KEYS.reality));
      setCost(readStorage<StoredCost>(STORAGE_KEYS.cost));
      setCompare(readStorage<StoredCompare>(STORAGE_KEYS.compare));
      setFit(readStorage<StoredFit>(STORAGE_KEYS.fit));
      setChecklist(readStorage<Record<string, boolean>>(STORAGE_KEYS.checklist) ?? {});
      setLoaded(true);
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      window.localStorage.setItem(STORAGE_KEYS.checklist, JSON.stringify(checklist));
    } catch {
      // Ignore persistence failures and keep the UI working.
    }
  }, [checklist, loaded]);

  const completed = useMemo(
    () => ({
      reality: !!reality,
      cost: !!cost,
      compare: !!compare,
      fit: !!fit,
    }),
    [reality, cost, compare, fit],
  );

  const topFit = fit?.detailedTop?.[0] ?? null;
  const compareSummary = useMemo(() => getCompareSummary(compare), [compare]);
  const nextAction = useMemo(() => getNextBestAction(reality, cost, compare, fit, topFit), [reality, cost, compare, fit, topFit]);
  const partial = useMemo(() => partialMessage(completed, nextAction), [completed, nextAction]);
  const warnings = useMemo(() => buildWarnings(reality, cost, compare, fit), [reality, cost, compare, fit]);
  const recommendations = useMemo(() => buildRecommendations(fit, reality, cost), [fit, reality, cost]);
  const decisionLights = useMemo(() => buildDecisionLights(reality, cost, compare, fit), [reality, cost, compare, fit]);
  const saferRoutes = fit?.dream?.saferRoutes ?? [];
  const topRecommendation = recommendations[0] ?? null;
  const questionList = useMemo(() => buildQuestionList(topRecommendation, compareSummary, cost), [topRecommendation, compareSummary, cost]);
  const familySummary = useMemo(
    () => buildFamilySummary(reality, cost, compareSummary, topRecommendation, nextAction),
    [reality, cost, compareSummary, topRecommendation, nextAction],
  );

  const checklistDone = CHECKLIST_ITEMS.filter((item) => checklist[item.key]).length;
  const completionCount = Object.values(completed).filter(Boolean).length;

  function toggleChecklist(key: string) {
    setChecklist((current) => ({ ...current, [key]: !current[key] }));
  }

  async function copyText(value: string, success: string) {
    try {
      await navigator.clipboard.writeText(value);
      setShareStatus(success);
      window.setTimeout(() => setShareStatus(''), 3000);
    } catch {
      setShareStatus('Copy failed on this browser. You can still print the page or select the text manually.');
    }
  }

  if (!loaded) return null;

  return (
    <>
      <section className="tool-header">
        <div className="container container-narrow">
          <div className="progress">
            After Step 04 <span>What comes next</span>
          </div>
          <h1>Decision brief for the family, not just a result screen.</h1>
          <p className="lead">
            Tool 5 now pulls the first four tools into one React-based decision report so the household can see pressure,
            cost, readiness, employment signal and the next safest move in one place.
          </p>
        </div>
      </section>

      <section className="nextsteps-hero-band">
        <div className="container container-narrow">
          <div className="nextsteps-hero-grid">
            <div className="nextsteps-hero-count">
              {completionCount}/4
            </div>
            <div>
              <p className="nextsteps-hero-copy">
                tools are feeding this decision brief right now.
              </p>
              <p className="nextsteps-hero-note">
                The goal here is not false certainty. It is a calmer, better-informed commitment decision before any money moves.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="tool-body">
        <div className="container">
          {!reality && !cost && !fit && !compare ? (
            <div className="form-section nextsteps-empty-state">
              <span className="eyebrow">Nothing saved yet</span>
              <h2 className="nextsteps-empty-title">Run the first tools, then come back here for the final decision brief.</h2>
              <p className="nextsteps-empty-copy">
                This page becomes useful once the household has at least started Reality Check and True Cost. Career Fit and Route Compare
                turn it into a much stronger final decision layer.
              </p>
              <div className="form-actions form-actions-center">
                <a className="btn btn-primary" href="/tools/reality-check">
                  Start with Reality Check
                </a>
                <a className="btn btn-secondary" href="/tools">
                  View all tools
                </a>
              </div>
            </div>
          ) : (
            <div className="report-stack">
              <div className="form-section">
                <span className="eyebrow">Completion map</span>
                <h2 className="section-heading-gap">What this report already knows</h2>
                <p className="helper helper-gap">
                  Tool 5 should still be helpful when only some tools are complete. It upgrades from pressure snapshot to full decision brief as more data arrives.
                </p>

                <div className="tool-progress-grid">
                  <div className={`tool-status ${completed.reality ? 'done' : 'pending'}`}>
                    <strong>Tool 1</strong>
                    <span>Reality Check</span>
                    <small>{completed.reality ? 'Saved' : 'Not completed yet'}</small>
                  </div>
                  <div className={`tool-status ${completed.cost ? 'done' : 'pending'}`}>
                    <strong>Tool 2</strong>
                    <span>True Cost</span>
                    <small>{completed.cost ? 'Saved' : 'Not completed yet'}</small>
                  </div>
                  <div className={`tool-status ${completed.compare ? 'done' : 'pending'}`}>
                    <strong>Tool 3</strong>
                    <span>Route Compare</span>
                    <small>{completed.compare ? 'Saved' : 'Optional but recommended'}</small>
                  </div>
                  <div className={`tool-status ${completed.fit ? 'done' : 'pending'}`}>
                    <strong>Tool 4</strong>
                    <span>Career Fit</span>
                    <small>{completed.fit ? 'Saved' : 'Not completed yet'}</small>
                  </div>
                </div>

                {partial ? (
                  <div className="snapshot-action">
                    <strong>Recommended next action:</strong> {nextAction}
                    <p className="snapshot-note">{partial}</p>
                  </div>
                ) : null}
              </div>

              <div className="snapshot-panel">
                <span className="eyebrow eyebrow-soft">
                  Pathway snapshot
                </span>
                <h2>Your current decision profile</h2>
                <p>
                  This snapshot updates as your household completes the tools. It is designed to show what is true right now, not what we wish were true.
                </p>
                <div className="snapshot-grid">
                  <div className="snapshot-item">
                    <div className="snapshot-label">Household pressure</div>
                    <div className="snapshot-value">{reality?.pressureBand ?? 'Run Reality Check'}</div>
                  </div>
                  <div className="snapshot-item">
                    <div className="snapshot-label">Funding bracket</div>
                    <div className="snapshot-value">{reality?.bracket ?? 'Not saved yet'}</div>
                  </div>
                  <div className="snapshot-item">
                    <div className="snapshot-label">Monthly study load</div>
                    <div className="snapshot-value">{formatR(cost?.netMonthly)}</div>
                  </div>
                  <div className="snapshot-item">
                    <div className="snapshot-label">First-month cash need</div>
                    <div className="snapshot-value">{formatR(cost?.firstMonthCost)}</div>
                  </div>
                  <div className="snapshot-item">
                    <div className="snapshot-label">Residence risk</div>
                    <div className="snapshot-value">{cost?.residenceBand ?? 'Not priced yet'}</div>
                  </div>
                  <div className="snapshot-item">
                    <div className="snapshot-label">Route Compare result</div>
                    <div className="snapshot-value">{compareSummary?.winner?.name ?? 'Not compared yet'}</div>
                  </div>
                  <div className="snapshot-item">
                    <div className="snapshot-label">Top fit field</div>
                    <div className="snapshot-value">{topRecommendation?.title ?? 'Run Career Fit'}</div>
                  </div>
                  <div className="snapshot-item">
                    <div className="snapshot-label">Best next move</div>
                    <div className="snapshot-value muted">{nextAction}</div>
                  </div>
                </div>
              </div>

              <div className="form-section">
                <span className="eyebrow">Decision traffic lights</span>
                <h3>Where the decision looks calm, fragile or risky</h3>
                <p className="helper">These are bands, not fake precision. They exist to help the family know where to pause, verify or compare again.</p>
                <div className="decision-grid">
                  {decisionLights.map((light) => (
                    <div key={light.label} className={`decision-card ${light.tone}`}>
                      <div className="decision-label">{light.label}</div>
                      <div className="decision-value">{light.value}</div>
                      <p>{light.note}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="form-section">
                <span className="eyebrow">Risk notes</span>
                <h3>Before anyone commits money</h3>
                <ul className="report-warning-list">
                  {warnings.map((warning) => (
                    <li key={warning}>{warning}</li>
                  ))}
                </ul>
                <p className="report-muted-note">
                  This report is decision support, not a substitute for direct verification with institutions, funders or professional bodies.
                </p>
              </div>

              {compareSummary ? (
                <div className="form-section">
                  <span className="eyebrow">Route compare result</span>
                  <h3>What Tool 3 currently suggests</h3>
                  <div className="tool-compare">
                    <div>
                      <h4 className="compare-winner-title">{compareSummary.winner?.name ?? 'Winning route'}</h4>
                      <p className="compare-note">{compareSummary.note}</p>
                      <div className="pathway-facts">
                        <div>
                          <div className="pathway-fact-label">Employment signal</div>
                          <div className="pathway-fact-value">{Math.round(compareSummary.winnerEmployment)}%</div>
                        </div>
                        <div>
                          <div className="pathway-fact-label">Affordability score</div>
                          <div className="pathway-fact-value">{Math.round(compareSummary.winnerAffordability)}%</div>
                        </div>
                        <div>
                          <div className="pathway-fact-label">Decision margin</div>
                          <div className="pathway-fact-value">{compareSummary.margin} pts</div>
                        </div>
                      </div>
                      <p className="pathway-note">
                        This does not mean “stop thinking.” It means this route currently looks safer on the data you saved. The next step is verification.
                      </p>
                    </div>
                    <div>
                      <div className="warning-box warning-box-reset">
                        <strong>Check before paying</strong>
                        {compareSummary.riskFlags.length ? (
                          <ul className="warning-list-compact">
                            {compareSummary.riskFlags.map((flag) => (
                              <li key={flag}>{flag}</li>
                            ))}
                          </ul>
                        ) : (
                          <p className="warning-copy-top">No major compare-specific warning was triggered, but costs, accreditation and placement still need direct confirmation.</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}

              {recommendations.length ? (
                <div className="form-section">
                  <span className="eyebrow">Recommended routes</span>
                  <h3>What the family should investigate first</h3>
                  <p className="helper">
                    The report starts with the top three Career Fit fields, then adjusts the route lens using affordability, readiness and first-month risk.
                  </p>

                  {recommendations.map((recommendation, index) => (
                    <section key={recommendation.title} className="recommendation-section">
                      <span className="eyebrow">Match #{index + 1}</span>
                      <h2 className="recommendation-section-title">{recommendation.title}</h2>
                      <div className="recommendation-facts">
                        <div>
                          <div className="pathway-fact-label">Overall match</div>
                          <div className="pathway-fact-value">{recommendation.match}%</div>
                        </div>
                        <div>
                          <div className="pathway-fact-label">Readiness</div>
                          <div className="pathway-fact-value">{recommendation.readinessScore}%</div>
                        </div>
                        <div>
                          <div className="pathway-fact-label">Employment signal</div>
                          <div className="pathway-fact-value">{recommendation.employmentSignal}%</div>
                        </div>
                      </div>

                      {recommendation.readinessNotes.length ? (
                        <div className="warning-box">
                          <strong>Readiness notes</strong>
                          <ul className="warning-list-compact">
                            {recommendation.readinessNotes.map((note) => (
                              <li key={note}>{note}</li>
                            ))}
                          </ul>
                        </div>
                      ) : null}

                      <div className="method-note">
                        <strong>{recommendation.lensLabel}:</strong> {recommendation.lensReason}
                      </div>

                      <div className="pathway-card">
                        <div className="pathway-label">{recommendation.lensLabel}</div>
                        <h3>{recommendation.primary.title}</h3>
                        <p>{recommendation.primary.summary}</p>
                        <div className="pathway-facts">
                          <div>
                            <div className="pathway-fact-label">Cost</div>
                            <div className="pathway-fact-value">{recommendation.primary.cost}</div>
                          </div>
                          <div>
                            <div className="pathway-fact-label">Duration</div>
                            <div className="pathway-fact-value">{recommendation.primary.duration}</div>
                          </div>
                          <div>
                            <div className="pathway-fact-label">Qualification</div>
                            <div className="pathway-fact-value">{recommendation.primary.qualification}</div>
                          </div>
                        </div>
                        <p>
                          <strong>Trade-offs:</strong> {recommendation.primary.tradeoffs}
                        </p>
                        <p className="paragraph-reset">
                          <strong className="terracotta-strong">What to check this week:</strong> {recommendation.thisWeek}
                        </p>
                      </div>

                      <div className="recommendation-secondary-grid">
                        {recommendation.secondary.map((option) => (
                          <div key={option.title} className="pathway-card amber">
                            <div className="pathway-label">Also compare</div>
                            <h3>{option.title}</h3>
                            <p>{option.summary}</p>
                            <p className="paragraph-reset">
                              <strong>Why it matters:</strong> {option.tradeoffs}
                            </p>
                          </div>
                        ))}
                      </div>

                      <div className="method-note">
                        <strong>Labour-market signal:</strong> {recommendation.labourSignal}
                      </div>

                      {recommendation.cautionNotes.length ? (
                        <div className="pathway-support-list">
                          {recommendation.cautionNotes.map((note) => (
                            <p key={note}>{note}</p>
                          ))}
                        </div>
                      ) : null}
                    </section>
                  ))}
                </div>
              ) : null}

              {saferRoutes.length ? (
                <div className="alternative-finder">
                  <span className="eyebrow">Safer routes to compare</span>
                  <h3>{fit?.dream?.label ?? 'Dream route'} may still be valid. These are simply safer routes to investigate before committing money, debt or accommodation.</h3>
                  {fit?.dream?.note ? <p className="helper helper-top-gap">{fit.dream.note}</p> : null}
                  <div className="alternative-grid">
                    {saferRoutes.slice(0, 3).map((route) => (
                      <div key={route.title} className="alternative-card">
                        <div className="alt-tag">{route.tag}</div>
                        <h4>{route.title}</h4>
                        <p>
                          <strong>Why it may be safer:</strong> {route.why}
                        </p>
                        <p>
                          <strong>Typical route:</strong> {route.route}
                        </p>
                        <p className="paragraph-reset">
                          <strong>What to ask next:</strong> {route.next}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              {cost ? (
                <div className="residence-risk">
                  <span className="eyebrow">Residence and cash-shock read</span>
                  <h3>What the cost tool is saying right now</h3>
                  <div className="residence-risk-grid">
                    <div className="residence-risk-item">
                      <div className="residence-risk-label">Current living assumption</div>
                      <div className="residence-risk-value">{cost.livingLabel ?? 'Not saved yet'}</div>
                    </div>
                    <div className="residence-risk-item">
                      <div className="residence-risk-label">Residence risk</div>
                      <div className={`residence-risk-value ${residenceTone(cost.residenceBand)}`}>
                        {cost.residenceBand ?? 'Not priced yet'}
                      </div>
                    </div>
                    <div className="residence-risk-item">
                      <div className="residence-risk-label">First-month cash need</div>
                      <div className={`residence-risk-value ${firstMonthTone(cost, reality)}`}>{formatR(cost.firstMonthCost)}</div>
                    </div>
                  </div>

                  {cost.topDrivers?.length ? (
                    <>
                      <h4>Biggest cost drivers</h4>
                      <ul className="report-list-compact">
                        {cost.topDrivers.slice(0, 5).map((driver) => (
                          <li key={driver.label}>
                            {driver.label}: {formatR(driver.amount)} ({Math.round(driver.share)}% of the recurring cost)
                          </li>
                        ))}
                      </ul>
                    </>
                  ) : null}

                  {cost.saferLevers?.length ? (
                    <>
                      <h4 className="report-subheading-top">Levers that could reduce pressure</h4>
                      <ul className="report-list-compact">
                        {cost.saferLevers.slice(0, 5).map((lever) => (
                          <li key={lever}>{lever}</li>
                        ))}
                      </ul>
                    </>
                  ) : null}
                </div>
              ) : null}

              {cost ? (
                <div className="funding-guidance">
                  <span className="eyebrow">Funding routes</span>
                  <h2>What funding still looks credible</h2>
                  <p>
                    This section is not a promise of support. It is the report’s best read of which funding paths deserve immediate verification before the household commits cash.
                  </p>
                  <div className="funding-grid">
                    {(cost.fundingRoutes?.length
                      ? cost.fundingRoutes
                      : [
                          {
                            title: reality?.bracket === 'NSFAS-eligible' ? 'NSFAS and bursary-linked support' : 'Institutional and employer-linked funding',
                            relevance: 'Possible',
                            level: reality?.bracket === 'NSFAS-eligible' ? 'high' : 'possible',
                            who: 'Depends on the route, household bracket and provider',
                            warning: 'Treat all funding as unconfirmed until the provider or funder confirms it in writing.',
                          },
                        ]
                    ).slice(0, 4).map((route) => (
                      <div key={route.title} className={`funding-card ${route.level}`}>
                        <div className="funding-tag">{route.relevance}</div>
                        <h4>{route.title}</h4>
                        <p>
                          <strong>Who it fits:</strong> {route.who}
                        </p>
                        <p className="funding-warning">{route.warning}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              <div className="result-panel">
                <span className="eyebrow eyebrow-soft">
                  Final decision layer
                </span>
                <div className={`verdict ${topRecommendation ? readinessTone(topRecommendation.readinessScore) : 'amber'}`}>
                  {topRecommendation
                    ? `${topRecommendation.title} looks strongest when the route is matched to your family’s carrying power.`
                    : 'This report becomes much stronger once Career Fit and Route Compare are complete.'}
                </div>
                <p>
                  What matters now is not just what sounds impressive. It is what the family can carry, what the student can finish, and what the labour market can realistically reward.
                </p>

                <div className="question-generator">
                  <span className="eyebrow">Questions to ask this week</span>
                  <h3>Use these questions before any payment or application decision</h3>
                  <div className="question-output question-output-block">
                    <ol className="question-list">
                      {questionList.map((question) => (
                        <li key={question}>
                          {question}
                        </li>
                      ))}
                    </ol>
                  </div>
                </div>

                <div className="action-checklist">
                  <h4>Before you commit</h4>
                  {CHECKLIST_ITEMS.map((item) => (
                    <label key={item.key}>
                      <input
                        checked={!!checklist[item.key]}
                        type="checkbox"
                        onChange={() => toggleChecklist(item.key)}
                      />
                      {item.label}
                    </label>
                  ))}
                  <div className="checklist-progress">{checklistDone} of {CHECKLIST_ITEMS.length} completed.</div>
                </div>

                <div className="conversation-guide">
                  <h4>Family conversation guide</h4>
                  <p>
                    This report should support a calmer conversation. It is okay if the answer is not “yes” yet. Sometimes the best decision is “not on these terms.”
                  </p>
                  <div className="conversation-grid">
                    <div className="conversation-card">
                      <h5>For parents or guardians</h5>
                      <ul>
                        <li>What can we safely carry every month without destabilising the household?</li>
                        <li>What are we unwilling to borrow for?</li>
                        <li>What happens if the student changes route, repeats, or funding changes?</li>
                        <li>Are we choosing this because it is wise, or because it feels prestigious?</li>
                        <li>What would make us pause before paying a deposit?</li>
                      </ul>
                    </div>
                    <div className="conversation-card">
                      <h5>For students</h5>
                      <ul>
                        <li>Do I understand the actual work in this field, not just the qualification name?</li>
                        <li>Would I still choose this route if it takes longer or starts smaller than I imagined?</li>
                        <li>Have I tested the field through shadowing, volunteering, a project or a conversation?</li>
                        <li>What is my safer second option if the first route becomes too costly or too selective?</li>
                        <li>What can I do this month to test the route before a bigger commitment?</li>
                      </ul>
                    </div>
                  </div>
                  <p className="conversation-muted">
                    A good decision is not the one that sounds most impressive. It is the one the family can carry and the student can finish with dignity.
                  </p>
                </div>

                <div className="report-actions">
                  <button className="btn btn-print" type="button" onClick={() => window.print()}>
                    Print / save as PDF
                  </button>
                  <button className="btn btn-secondary" type="button" onClick={() => copyText(familySummary, 'Family summary copied.')}>
                    Copy family summary
                  </button>
                  <button
                    className="btn btn-secondary"
                    type="button"
                    onClick={() => {
                      window.open(`https://wa.me/?text=${encodeURIComponent(familySummary)}`, '_blank', 'noopener');
                    }}
                  >
                    Share on WhatsApp
                  </button>
                  <button className="btn btn-secondary" type="button" onClick={() => copyText(questionList.join('\n'), 'Questions copied.')}>
                    Copy questions
                  </button>
                  <a className="btn btn-secondary" href="/tools/route-compare">
                    Compare two routes
                  </a>
                  <a className="btn btn-secondary" href="/contact">
                    Ask for human review
                  </a>
                </div>

                {shareStatus ? <div className="share-status">{shareStatus}</div> : null}
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
