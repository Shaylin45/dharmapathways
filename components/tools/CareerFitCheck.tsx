'use client';

import { FormEvent, useMemo, useRef, useState } from 'react';

type SliderKey = 'iAna' | 'iCre' | 'iPeo' | 'iHan' | 'iCar' | 'iEnt' | 'wFlex' | 'wTeam' | 'wOut' | 'wRisk';
type InterestKey = 'iAna' | 'iCre' | 'iPeo' | 'iHan' | 'iCar' | 'iEnt';
type StyleKey = 'wFlex' | 'wTeam' | 'wOut' | 'wRisk';
type MarkKey = 'math' | 'science' | 'english' | 'accounting' | 'lifeScience' | 'overall';
type Motivation = 'stability' | 'income' | 'creativity' | 'autonomy' | 'service' | 'impact';
type DreamRoute = 'medicine' | 'engineering' | 'law' | 'accounting' | 'software' | 'psychology' | 'teaching' | 'design' | 'business' | 'unsure';

type Profile = Record<SliderKey, number>;
type Marks = Record<MarkKey, number>;

type FormState = {
  profile: Profile;
  marks: Marks;
  motivation: Motivation;
  exposure: string;
  dreamRoute: DreamRoute;
};

type StoredReality = {
  capacity?: number;
  pressure?: string;
  pressureBand?: string;
};

type StoredCost = {
  netMonthly?: number;
  programmeTotal?: number;
};

type CareerField = {
  title: string;
  fieldKey: string;
  blurb: string;
  routes: string;
  profile: Record<SliderKey, number>;
  readiness: Partial<Record<MarkKey, number>>;
  values: Record<Motivation, number>;
  employmentBase: number;
  pathwayClarity: number;
  bottleneckRisk: number;
  bottleneckNote: string;
  evidenceNote: string;
};

type SaferRoute = {
  title: string;
  tag: string;
  why: string;
  route: string;
  next: string;
};

type CareerResult = CareerField & {
  fieldFit: number;
  interestScore: number;
  styleScore: number;
  valuesScore: number;
  exposureScore: number;
  routeReadiness: number;
  subjectGateScore: number;
  marksReadinessScore: number;
  affordabilityScore: number;
  employmentSignal: number;
  match: number;
  readinessNotes: string[];
};

type Result = {
  top: CareerResult[];
  dream: {
    key: DreamRoute;
    label: string;
    note: string;
    saferRoutes: SaferRoute[];
  };
  verdict: string;
  verdictClass: 'green' | 'amber' | 'red';
  verdictBody: string;
  implications: string[];
};

const STORAGE_KEY = 'dharma_fit';

const sliderDefs: { id: SliderKey; label: string; helper: string; group: 'interest' | 'style' }[] = [
  { id: 'iAna', label: 'Analytical & problem-solving', helper: 'data, logic, numbers, debugging', group: 'interest' },
  { id: 'iCre', label: 'Creative & expressive', helper: 'design, writing, music, storytelling', group: 'interest' },
  { id: 'iPeo', label: 'People & communication', helper: 'teaching, persuasion, coaching', group: 'interest' },
  { id: 'iHan', label: 'Hands-on & practical', helper: 'building, fixing, physical work', group: 'interest' },
  { id: 'iCar', label: 'Care & service', helper: 'health, social work, helping', group: 'interest' },
  { id: 'iEnt', label: 'Entrepreneurial & commercial', helper: 'starting things, selling, deals', group: 'interest' },
  { id: 'wFlex', label: 'Structure to flexibility', helper: '0 = predictable; 100 = open-ended', group: 'style' },
  { id: 'wTeam', label: 'Solo to team', helper: '0 = alone; 100 = team-driven', group: 'style' },
  { id: 'wOut', label: 'Indoor to field/site', helper: '0 = desk; 100 = field or site', group: 'style' },
  { id: 'wRisk', label: 'Stable salary to variable upside', helper: '0 = security; 100 = upside', group: 'style' },
];

const interestKeys: InterestKey[] = ['iAna', 'iCre', 'iPeo', 'iHan', 'iCar', 'iEnt'];
const styleKeys: StyleKey[] = ['wFlex', 'wTeam', 'wOut', 'wRisk'];

const defaultProfile: Profile = {
  iAna: 50,
  iCre: 50,
  iPeo: 50,
  iHan: 50,
  iCar: 50,
  iEnt: 50,
  wFlex: 50,
  wTeam: 50,
  wOut: 50,
  wRisk: 50,
};

const defaultMarks: Marks = {
  math: 55,
  science: 0,
  english: 55,
  accounting: 0,
  lifeScience: 0,
  overall: 55,
};

const defaultForm: FormState = {
  profile: defaultProfile,
  marks: defaultMarks,
  motivation: 'stability',
  exposure: '40',
  dreamRoute: 'unsure',
};

const markOptions: [number, string][] = [
  [0, 'Not taking / unknown'],
  [35, '30-39%'],
  [45, '40-49%'],
  [55, '50-59%'],
  [65, '60-69%'],
  [75, '70-79%'],
  [85, '80%+'],
];

const markLabels: Record<MarkKey, string> = {
  math: 'Maths',
  science: 'Physical Sciences',
  english: 'English',
  accounting: 'Accounting / Business',
  lifeScience: 'Life Sciences',
  overall: 'General average / overall strength',
};

const motivationLabels: Record<Motivation, string> = {
  stability: 'Stable work and predictable income',
  income: 'High earning ceiling',
  creativity: 'Creative expression',
  autonomy: 'Independence and flexibility',
  service: 'Helping people directly',
  impact: 'Social impact or public contribution',
};

const careers: CareerField[] = [
  {
    title: 'Software development & data',
    fieldKey: 'software',
    blurb: 'Building apps, sites, systems and analysing data.',
    routes: 'BSc/BCom IT, Diploma in IT, systems support learnerships, portfolio and bootcamp routes.',
    profile: { iAna: 9, iCre: 6, iPeo: 3, iHan: 4, iCar: 2, iEnt: 6, wFlex: 7, wTeam: 6, wOut: 1, wRisk: 6 },
    readiness: { math: 60, english: 50, overall: 55 },
    values: { stability: 6, income: 8, creativity: 7, autonomy: 8, service: 3, impact: 6 },
    employmentBase: 75,
    pathwayClarity: 78,
    bottleneckRisk: 38,
    bottleneckNote: 'Portfolio and practical skill matter; a qualification alone is not enough.',
    evidenceNote: 'DHET OIHD digital roles, recruitment-market reports and portfolio-based hiring signals.',
  },
  {
    title: 'Engineering',
    fieldKey: 'engineering',
    blurb: 'Designing and building physical systems; strong demand but gated by maths and science.',
    routes: 'BEng, BSc Eng, UoT engineering diploma, TVET NATED technical route.',
    profile: { iAna: 9, iCre: 5, iPeo: 4, iHan: 8, iCar: 3, iEnt: 4, wFlex: 4, wTeam: 7, wOut: 6, wRisk: 4 },
    readiness: { math: 70, science: 65, overall: 65 },
    values: { stability: 8, income: 8, creativity: 5, autonomy: 5, service: 5, impact: 8 },
    employmentBase: 75,
    pathwayClarity: 88,
    bottleneckRisk: 45,
    bottleneckNote: 'Direct BEng entry and completion are high-pressure; UoT and TVET routes may be safer.',
    evidenceNote: 'DHET OIHD engineering demand, ECSA/professional pathway requirements and scarce-skills signals.',
  },
  {
    title: 'Trades',
    fieldKey: 'trades',
    blurb: 'Electrical, plumbing, welding, fitting, mechanics and artisan routes.',
    routes: 'TVET NCV/NATED plus apprenticeship and QCTO trade test.',
    profile: { iAna: 5, iCre: 3, iPeo: 3, iHan: 10, iCar: 3, iEnt: 7, wFlex: 6, wTeam: 5, wOut: 7, wRisk: 6 },
    readiness: { math: 40, overall: 40 },
    values: { stability: 7, income: 7, creativity: 4, autonomy: 8, service: 4, impact: 5 },
    employmentBase: 78,
    pathwayClarity: 84,
    bottleneckRisk: 35,
    bottleneckNote: 'The trade test and workplace placement are the key bottlenecks.',
    evidenceNote: 'DHET OIHD artisan demand, QCTO trade-test route and sector SETA placement requirements.',
  },
  {
    title: 'Health professions',
    fieldKey: 'health',
    blurb: 'Doctors, nurses, allied health and care-related professions.',
    routes: 'MBChB, BNursing, radiography, pharmacy, clinical associate and allied health degrees.',
    profile: { iAna: 7, iCre: 3, iPeo: 8, iHan: 6, iCar: 10, iEnt: 2, wFlex: 3, wTeam: 7, wOut: 3, wRisk: 2 },
    readiness: { math: 60, science: 60, english: 55, lifeScience: 60, overall: 65 },
    values: { stability: 8, income: 7, creativity: 2, autonomy: 3, service: 10, impact: 9 },
    employmentBase: 76,
    pathwayClarity: 86,
    bottleneckRisk: 62,
    bottleneckNote: 'Medicine and many allied health routes are selective, long and placement-dependent.',
    evidenceNote: 'DHET OIHD health occupations, professional registration requirements and clinical placement signals.',
  },
  {
    title: 'Teaching & education',
    fieldKey: 'teaching',
    blurb: 'School teaching, ECD, tutoring, training and education support.',
    routes: 'BEd, PGCE, ECD qualifications, training and facilitation routes.',
    profile: { iAna: 5, iCre: 6, iPeo: 9, iHan: 3, iCar: 9, iEnt: 2, wFlex: 4, wTeam: 6, wOut: 3, wRisk: 1 },
    readiness: { english: 50, overall: 50 },
    values: { stability: 8, income: 4, creativity: 5, autonomy: 4, service: 9, impact: 10 },
    employmentBase: 72,
    pathwayClarity: 82,
    bottleneckRisk: 32,
    bottleneckNote: 'Demand depends heavily on phase, subject specialisation and SACE registration.',
    evidenceNote: 'DHET priority teaching signals, Funza Lushaka/service obligations and SACE registration route.',
  },
  {
    title: 'Finance, accounting & actuarial',
    fieldKey: 'finance',
    blurb: 'Structured finance, accounting, audit, tax, actuarial and business reporting roles.',
    routes: 'BCom, CA(SA), SAIPA, CIMA, accounting diploma, bookkeeping and payroll routes.',
    profile: { iAna: 9, iCre: 2, iPeo: 5, iHan: 1, iCar: 3, iEnt: 5, wFlex: 3, wTeam: 6, wOut: 1, wRisk: 4 },
    readiness: { math: 55, accounting: 55, english: 50, overall: 55 },
    values: { stability: 9, income: 8, creativity: 2, autonomy: 5, service: 3, impact: 4 },
    employmentBase: 70,
    pathwayClarity: 86,
    bottleneckRisk: 58,
    bottleneckNote: 'CA-style routes include CTA/PGDA, articles and board-exam bottlenecks.',
    evidenceNote: 'DHET OIHD finance roles, professional-body pathways and accounting clerkship signals.',
  },
  {
    title: 'Marketing, brand & communications',
    fieldKey: 'marketing',
    blurb: 'Brand, advertising, content, public relations, social media and communications.',
    routes: 'BCom Marketing, BA Communication, IMM diploma, agency portfolio and digital short-course routes.',
    profile: { iAna: 5, iCre: 8, iPeo: 8, iHan: 2, iCar: 3, iEnt: 7, wFlex: 7, wTeam: 7, wOut: 2, wRisk: 6 },
    readiness: { english: 55, overall: 50 },
    values: { stability: 4, income: 6, creativity: 8, autonomy: 7, service: 3, impact: 5 },
    employmentBase: 58,
    pathwayClarity: 68,
    bottleneckRisk: 46,
    bottleneckNote: 'Portfolio, internships and networks carry a lot of weight in first-job access.',
    evidenceNote: 'Recruitment-market demand for digital marketing and communications, with portfolio-sensitive entry.',
  },
  {
    title: 'Design & creative production',
    fieldKey: 'design',
    blurb: 'Graphic design, UX, fashion, film, content production and visual communication.',
    routes: 'Design diploma/degree, UX/product design, portfolio route, specialist creative schools.',
    profile: { iAna: 4, iCre: 10, iPeo: 5, iHan: 5, iCar: 2, iEnt: 7, wFlex: 9, wTeam: 5, wOut: 3, wRisk: 8 },
    readiness: { english: 45, overall: 45 },
    values: { stability: 3, income: 5, creativity: 10, autonomy: 8, service: 2, impact: 5 },
    employmentBase: 52,
    pathwayClarity: 62,
    bottleneckRisk: 58,
    bottleneckNote: 'Creative employment depends strongly on portfolio quality and market access.',
    evidenceNote: 'Recruitment-market and portfolio-based hiring signals; verify private-provider accreditation carefully.',
  },
  {
    title: 'Law & legal services',
    fieldKey: 'law',
    blurb: 'Attorney, advocate, compliance, contracts, public policy and legal support roles.',
    routes: 'LLB, BA Law into LLB, paralegal, compliance, public administration and policy routes.',
    profile: { iAna: 8, iCre: 4, iPeo: 7, iHan: 1, iCar: 4, iEnt: 4, wFlex: 3, wTeam: 5, wOut: 1, wRisk: 5 },
    readiness: { english: 65, overall: 60 },
    values: { stability: 6, income: 7, creativity: 4, autonomy: 5, service: 6, impact: 8 },
    employmentBase: 50,
    pathwayClarity: 72,
    bottleneckRisk: 72,
    bottleneckNote: 'Articles and graduate legal placement are major post-study bottlenecks.',
    evidenceNote: 'Professional route requirements, articles bottleneck and competitive graduate market signals.',
  },
  {
    title: 'Psychology',
    fieldKey: 'psychology',
    blurb: 'Human behaviour, counselling-adjacent work, mental health, HR and research routes.',
    routes: 'BA Psychology, BSocSci, Honours/Masters selection, social work, counselling support and HR routes.',
    profile: { iAna: 6, iCre: 4, iPeo: 8, iHan: 2, iCar: 9, iEnt: 3, wFlex: 5, wTeam: 6, wOut: 2, wRisk: 2 },
    readiness: { english: 60, lifeScience: 45, overall: 60 },
    values: { stability: 5, income: 4, creativity: 4, autonomy: 5, service: 10, impact: 9 },
    employmentBase: 45,
    pathwayClarity: 58,
    bottleneckRisk: 78,
    bottleneckNote: 'Professional registration usually depends on competitive postgraduate selection and supervised practice.',
    evidenceNote: 'Professional registration bottleneck, postgraduate selection and broader people-helping alternatives.',
  },
  {
    title: 'Entrepreneurship & small business',
    fieldKey: 'business',
    blurb: 'Building a business, selling, operations and self-employment.',
    routes: 'Marketable skill plus business basics, BCom entrepreneurship, sales, digital marketing, SEDA support.',
    profile: { iAna: 6, iCre: 7, iPeo: 7, iHan: 6, iCar: 4, iEnt: 10, wFlex: 9, wTeam: 5, wOut: 5, wRisk: 9 },
    readiness: { english: 45, overall: 45 },
    values: { stability: 2, income: 8, creativity: 7, autonomy: 10, service: 4, impact: 6 },
    employmentBase: 50,
    pathwayClarity: 50,
    bottleneckRisk: 60,
    bottleneckNote: 'Entrepreneurship needs a marketable skill; business theory alone is not a product.',
    evidenceNote: 'Self-employment depends on skill proof, demand testing, SEDA/SETA support and early revenue.',
  },
  {
    title: 'Hospitality, tourism & events',
    fieldKey: 'hospitality',
    blurb: 'Hotels, lodges, restaurants, travel, events and customer-facing service.',
    routes: 'Hospitality diploma, TVET hospitality, lodge/restaurant work-up routes and events certificates.',
    profile: { iAna: 3, iCre: 6, iPeo: 9, iHan: 6, iCar: 6, iEnt: 6, wFlex: 6, wTeam: 8, wOut: 5, wRisk: 5 },
    readiness: { english: 45, overall: 40 },
    values: { stability: 4, income: 4, creativity: 6, autonomy: 5, service: 8, impact: 4 },
    employmentBase: 55,
    pathwayClarity: 64,
    bottleneckRisk: 45,
    bottleneckNote: 'Work exists, but pay, hours, seasonality and progression vary strongly.',
    evidenceNote: 'Tourism/hospitality sector demand plus practical-experience weighting.',
  },
  {
    title: 'Public service, NGO & social work',
    fieldKey: 'public',
    blurb: 'Government, NGOs, social work, community development and public systems.',
    routes: 'BSocSci, BSW, Public Administration, community development and policy routes.',
    profile: { iAna: 6, iCre: 4, iPeo: 8, iHan: 3, iCar: 9, iEnt: 3, wFlex: 4, wTeam: 7, wOut: 4, wRisk: 1 },
    readiness: { english: 55, overall: 50 },
    values: { stability: 7, income: 3, creativity: 4, autonomy: 4, service: 10, impact: 10 },
    employmentBase: 56,
    pathwayClarity: 70,
    bottleneckRisk: 42,
    bottleneckNote: 'Employment depends on public-sector hiring cycles, NGO funding and fieldwork exposure.',
    evidenceNote: 'Public-sector and social-service route clarity, with funding-cycle caution.',
  },
  {
    title: 'Agriculture, environment & natural sciences',
    fieldKey: 'agriculture',
    blurb: 'Farming, agri-business, conservation, environmental science and natural resources.',
    routes: 'BSc Agric, agricultural college diplomas, environmental science and conservation routes.',
    profile: { iAna: 7, iCre: 3, iPeo: 4, iHan: 7, iCar: 5, iEnt: 5, wFlex: 5, wTeam: 5, wOut: 9, wRisk: 4 },
    readiness: { math: 50, science: 50, lifeScience: 55, overall: 50 },
    values: { stability: 5, income: 5, creativity: 4, autonomy: 6, service: 5, impact: 9 },
    employmentBase: 62,
    pathwayClarity: 72,
    bottleneckRisk: 40,
    bottleneckNote: 'Demand differs by province and sub-sector; practical exposure matters.',
    evidenceNote: 'Agriculture/environment demand signals with strong regional variation.',
  },
  {
    title: 'Logistics, supply chain & operations',
    fieldKey: 'logistics',
    blurb: 'Moving things, managing systems, operations, procurement and warehouses.',
    routes: 'BCom Logistics, Diploma in Logistics, supply chain certificates and operations learnerships.',
    profile: { iAna: 7, iCre: 3, iPeo: 6, iHan: 5, iCar: 2, iEnt: 5, wFlex: 4, wTeam: 7, wOut: 4, wRisk: 3 },
    readiness: { math: 45, english: 45, overall: 45 },
    values: { stability: 7, income: 6, creativity: 3, autonomy: 4, service: 3, impact: 5 },
    employmentBase: 68,
    pathwayClarity: 76,
    bottleneckRisk: 30,
    bottleneckNote: 'Practical systems exposure and internships improve first-job access.',
    evidenceNote: 'Recruitment-market operations demand and logistics/supply-chain pathway signals.',
  },
];

const dreamRouteLibrary: Record<DreamRoute, { label: string; note: string; matchFields: string[]; alternatives: SaferRoute[] }> = {
  medicine: {
    label: 'Medicine / direct health dream',
    note: 'Medicine is valid, but it is highly selective, long and placement-dependent. Compare adjacent health routes before committing only to MBChB.',
    matchFields: ['health'],
    alternatives: [
      { title: 'Nursing', tag: 'Fundable health route', why: 'Still patient-facing, often more accessible, and linked to public-sector demand.', route: 'Diploma or Bachelor of Nursing plus SANC registration.', next: 'Ask about clinical placement, service obligations and provincial bursaries.' },
      { title: 'Radiography / allied health', tag: 'Registered health option', why: 'Healthcare-facing and technical, with a clearer professional registration route.', route: 'Radiography, pharmacy, occupational therapy or emergency care routes.', next: 'Check HPCSA/SANC registration and clinical training sites.' },
      { title: 'Clinical associate / support route', tag: 'Practical medical team route', why: 'Lets the student test health-care work without assuming only medicine counts.', route: 'Clinical associate or health support programme where available.', next: 'Confirm current programme availability and recognition directly.' },
    ],
  },
  engineering: {
    label: 'Engineering',
    note: 'Engineering has strong demand, but direct BEng entry is not the only credible route.',
    matchFields: ['engineering', 'trades', 'logistics'],
    alternatives: [
      { title: 'UoT engineering diploma', tag: 'Practical route', why: 'Lower cost and more applied than direct BEng while still leading to technical engineering work.', route: 'Diploma at a University of Technology with work-integrated learning.', next: 'Compare BEng vs UoT diploma in Route Compare.' },
      { title: 'TVET NATED technical route', tag: 'Lower-cost entry', why: 'Useful when maths/science marks are moderate but technical interest is strong.', route: 'N1-N6 electrical, mechanical or civil route plus workplace experience.', next: 'Ask whether workplace placement is supported.' },
      { title: 'Trade / artisan pathway', tag: 'Earn sooner', why: 'Hands-on technical path with demand in electrical, plumbing, fitting and welding.', route: 'TVET plus apprenticeship plus trade test.', next: 'Compare cost, time and earning speed.' },
    ],
  },
  law: {
    label: 'Law',
    note: 'Law is writing-heavy, competitive and does not automatically lead to articles.',
    matchFields: ['law', 'public'],
    alternatives: [
      { title: 'Paralegal / legal assistant', tag: 'Lower-risk entry', why: 'Allows exposure to legal work before committing to the full LLB route.', route: 'Paralegal certificate/diploma plus legal office experience.', next: 'Ask firms what entry-level legal support roles require.' },
      { title: 'Compliance', tag: 'Corporate legal-adjacent', why: 'Uses legal reasoning in business, finance, privacy, risk and governance contexts.', route: 'Diploma/degree in law, compliance, risk or business.', next: 'Compare LLB vs compliance route for cost and employment prospects.' },
      { title: 'Public administration / policy', tag: 'Civic pathway', why: 'Good for students drawn to justice and public systems without necessarily practising law.', route: 'BA/BSocSci/Public Administration route.', next: 'Ask about internships and public-sector placement.' },
    ],
  },
  accounting: {
    label: 'CA / accounting',
    note: 'The CA route is valuable but long, costly and academically demanding.',
    matchFields: ['finance'],
    alternatives: [
      { title: 'Accounting diploma / clerk route', tag: 'Earn sooner', why: 'Gets the student into junior accounting work faster while leaving room to study further.', route: 'Diploma or bookkeeping qualification plus clerk role.', next: 'Compare BCom CA vs diploma/clerk route.' },
      { title: 'SAIPA / CIMA pathway', tag: 'Professional alternative', why: 'Still professional, often more commerce-focused or SME-friendly than the CA route.', route: 'BCom/diploma plus SAIPA or CIMA progression.', next: 'Ask about workplace training, fees and designation requirements.' },
      { title: 'Payroll / financial operations', tag: 'Practical entry', why: 'Lower barrier and useful for testing finance work before a long route.', route: 'Certificate/diploma plus workplace experience.', next: 'Ask employers what junior roles require.' },
    ],
  },
  software: {
    label: 'Software / data',
    note: 'Software has opportunity, but portfolio and practical skill matter as much as the route name.',
    matchFields: ['software'],
    alternatives: [
      { title: 'Diploma in IT', tag: 'Structured alternative', why: 'Often more accessible than BSc Computer Science while still building employable skills.', route: 'Diploma in IT / software development / systems development.', next: 'Ask about graduate placement and portfolio work.' },
      { title: 'Learnership / systems support', tag: 'Earn while learning', why: 'Can reduce family pressure and provide workplace exposure earlier.', route: 'MICT SETA or employer-linked learnership.', next: 'Check stipend, qualification level and placement.' },
      { title: 'Portfolio + short courses', tag: 'Proof-of-skill route', why: 'Useful for self-driven students who can build real projects before paying for expensive study.', route: 'Bootcamp/free courses plus GitHub portfolio plus internships.', next: 'Build one small project before committing.' },
    ],
  },
  psychology: {
    label: 'Psychology',
    note: 'Psychology is meaningful, but professional registration usually depends on competitive postgraduate selection.',
    matchFields: ['psychology', 'public', 'teaching'],
    alternatives: [
      { title: 'Social work', tag: 'Professional helping route', why: 'More direct public-service pathway with clearer professional registration.', route: 'Bachelor of Social Work plus registration.', next: 'Ask about bursaries, fieldwork and placement.' },
      { title: 'Counselling / community support', tag: 'Adjacent support route', why: 'Allows earlier exposure to support work while testing fit.', route: 'Recognised counselling/community development route where available.', next: 'Verify accreditation and scope of practice carefully.' },
      { title: 'HR / industrial psychology pathway', tag: 'Workplace people route', why: 'Uses psychology interest in workplace settings with broader options.', route: 'BA/BCom HR, Industrial Psychology or related route.', next: 'Ask about registration and internship requirements.' },
    ],
  },
  teaching: {
    label: 'Teaching',
    note: 'Teaching can be stable and meaningful, but phase, subject choice and bursary obligations matter.',
    matchFields: ['teaching', 'public'],
    alternatives: [
      { title: 'Priority-subject teaching', tag: 'Bursary-aligned', why: 'Maths, science and language teaching may align better with demand and funding.', route: 'BEd with priority subject focus or PGCE route.', next: 'Check Funza Lushaka rules and service obligations.' },
      { title: 'ECD / foundation phase', tag: 'Early learning route', why: 'Good for students drawn to younger learners and care-oriented education.', route: 'BEd Foundation Phase or recognised ECD qualification.', next: 'Ask about recognition and employment settings.' },
      { title: 'Training / facilitation', tag: 'Non-school option', why: 'Education skills can be used in NGOs, corporate training and community programmes.', route: 'Education/training certificates plus facilitation experience.', next: 'Compare school teaching vs training route.' },
    ],
  },
  design: {
    label: 'Design / creative',
    note: 'Creative routes depend heavily on portfolio and market access. Avoid overpaying for prestige without outcome evidence.',
    matchFields: ['design', 'marketing'],
    alternatives: [
      { title: 'UX / digital product design', tag: 'Employability bridge', why: 'Combines creativity with tech and problem-solving.', route: 'Design diploma/short courses plus portfolio.', next: 'Build a portfolio case study before enrolling.' },
      { title: 'Marketing content / brand', tag: 'Commercial creative route', why: 'Uses writing, design and storytelling in business contexts.', route: 'Marketing/communications/design route plus portfolio.', next: 'Compare design degree vs marketing/content route.' },
      { title: 'Freelance skill stack', tag: 'Low-cost test', why: 'Lets the student test demand before expensive creative study.', route: 'Short courses plus portfolio plus small paid projects.', next: 'Complete three sample projects and get feedback.' },
    ],
  },
  business: {
    label: 'Business / entrepreneurship',
    note: 'Entrepreneurship is not a qualification by itself. Pair the interest with a concrete marketable skill.',
    matchFields: ['business', 'marketing', 'finance', 'logistics'],
    alternatives: [
      { title: 'Practical skill + business', tag: 'Stronger foundation', why: 'A trade, design, accounting, coding or sales skill gives the business something real to sell.', route: 'Marketable skill route plus business basics.', next: 'Choose the skill first, then compare business study options.' },
      { title: 'Sales / digital marketing', tag: 'Fast exposure', why: 'Builds commercial confidence while testing entrepreneurial appetite.', route: 'Short course/diploma plus entry-level work.', next: 'Ask employers what entry roles require.' },
      { title: 'Accounting / operations', tag: 'Business backbone', why: 'Useful for students who want to run things but need financial and operational literacy.', route: 'Accounting/logistics/operations route.', next: 'Compare BCom vs diploma/work route.' },
    ],
  },
  unsure: {
    label: 'Unsure / still deciding',
    note: 'If the student is unsure, avoid expensive commitments until they have tested interests and realistic routes.',
    matchFields: [],
    alternatives: [
      { title: 'Structured gap year', tag: 'Clarity route', why: 'A structured year can be safer than entering the wrong expensive degree.', route: 'Work, volunteer, short courses, job-shadowing and applications plan.', next: 'Set monthly goals and re-run Career Fit after exposure.' },
      { title: 'Higher Certificate / bridging', tag: 'Lower-risk entry', why: 'Can test readiness and direction without the full cost of a degree.', route: 'Higher Certificate linked to possible articulation.', next: 'Ask whether credits articulate into a diploma or degree.' },
      { title: 'Work-and-study', tag: 'Earn while deciding', why: 'Keeps the household stable while the student builds exposure and maturity.', route: 'Part-time/distance study plus entry-level work.', next: 'Compare against full-time campus study.' },
    ],
  },
};

function toNumber(value: string | number, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function clamp(value: number, min = 0, max = 100) {
  return Math.min(max, Math.max(min, value));
}

function getStoredReality(): StoredReality | null {
  try {
    const raw = window.localStorage.getItem('dharma_reality');
    return raw ? (JSON.parse(raw) as StoredReality) : null;
  } catch {
    return null;
  }
}

function getStoredCost(): StoredCost | null {
  try {
    const raw = window.localStorage.getItem('dharma_cost');
    return raw ? (JSON.parse(raw) as StoredCost) : null;
  } catch {
    return null;
  }
}

function formatR(value: number) {
  return 'R ' + Math.round(value || 0).toLocaleString('en-ZA');
}

function profileScore(keys: SliderKey[], weights: Record<SliderKey, number>, profile: Profile) {
  const total = keys.reduce((sum, key) => sum + weights[key] * profile[key], 0);
  const max = keys.reduce((sum, key) => sum + weights[key] * 100, 0);
  return max ? Math.round(total / max * 100) : 0;
}

function subjectGateScore(field: CareerField, marks: Marks) {
  const entries = Object.entries(field.readiness) as [MarkKey, number][];
  if (!entries.length) return { score: 70, notes: [] as string[] };

  const notes: string[] = [];
  const scores = entries.map(([key, required]) => {
    const actual = marks[key] || 0;
    if (actual === 0 && required >= 50) {
      notes.push(`${markLabels[key]} is missing or unknown; this may close some direct-entry routes.`);
      return 30;
    }
    if (actual >= required) return 100;
    if (actual >= required - 10) {
      notes.push(`${markLabels[key]} is close but below the common readiness level. Compare bridging, diploma or extended routes.`);
      return 72;
    }
    notes.push(`${markLabels[key]} may be below the common readiness level for direct entry. Consider a safer entry route.`);
    return clamp(Math.round((actual / required) * 70), 20, 70);
  });

  return { score: Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length), notes };
}

function marksReadinessScore(field: CareerField, marks: Marks) {
  const entries = Object.entries(field.readiness) as [MarkKey, number][];
  if (!entries.length) return 70;
  const scores = entries.map(([key, required]) => clamp(Math.round(((marks[key] || 0) / required) * 100), 0, 105));
  return Math.round(clamp(scores.reduce((sum, score) => sum + score, 0) / scores.length));
}

function affordabilityScore(reality: StoredReality | null, cost: StoredCost | null) {
  if (!reality?.capacity || reality.capacity <= 0 || !cost?.netMonthly) return { score: 65, note: 'Affordability handoff is limited because Tool 1 or Tool 2 is incomplete.' };
  const ratio = cost.netMonthly / reality.capacity;
  if (ratio > 1.2) return { score: 25, note: `The last costed route appears above saved monthly capacity (${formatR(cost.netMonthly)} vs ${formatR(reality.capacity)}).` };
  if (ratio > 0.8) return { score: 55, note: `The last costed route uses most of saved monthly capacity (${formatR(cost.netMonthly)} vs ${formatR(reality.capacity)}).` };
  return { score: 90, note: `The last costed route appears within saved monthly capacity (${formatR(cost.netMonthly)} vs ${formatR(reality.capacity)}).` };
}

function scoreCareer(field: CareerField, form: FormState, reality: StoredReality | null, cost: StoredCost | null): CareerResult {
  const interestScore = profileScore(interestKeys, field.profile, form.profile);
  const styleScore = profileScore(styleKeys, field.profile, form.profile);
  const valuesScore = (field.values[form.motivation] || 5) * 10;
  const exposureScore = toNumber(form.exposure, 40);
  const gate = subjectGateScore(field, form.marks);
  const marksScore = marksReadinessScore(field, form.marks);
  const affordability = affordabilityScore(reality, cost);
  const dream = dreamRouteLibrary[form.dreamRoute];
  const dreamBoost = dream.matchFields.includes(field.fieldKey) ? 4 : 0;

  const fieldFit = Math.round(
    interestScore * 0.45 +
      styleScore * 0.25 +
      valuesScore * 0.15 +
      exposureScore * 0.15 +
      dreamBoost
  );

  const routeReadiness = Math.round(
    gate.score * 0.3 +
      marksScore * 0.3 +
      field.pathwayClarity * 0.15 +
      (100 - field.bottleneckRisk) * 0.15 +
      affordability.score * 0.1
  );

  const employmentSignal = Math.round(clamp(field.employmentBase + (routeReadiness - 65) * 0.1 + (fieldFit - 65) * 0.08 - (field.bottleneckRisk > 65 ? 4 : 0), 25, 88));
  const match = Math.round(fieldFit * 0.5 + routeReadiness * 0.3 + employmentSignal * 0.2);
  const readinessNotes = [...gate.notes];

  if (field.bottleneckRisk >= 60) readinessNotes.push(field.bottleneckNote);
  if (affordability.score < 70) readinessNotes.push(affordability.note);
  if (routeReadiness >= 85) readinessNotes.push('Current marks and route conditions look supportive, but institution requirements still vary.');
  if (fieldFit >= 78 && routeReadiness < 60) readinessNotes.push('Strong fit, weaker readiness: do not drop the dream, but compare a safer entry route first.');

  return {
    ...field,
    fieldFit: clamp(fieldFit),
    interestScore,
    styleScore,
    valuesScore,
    exposureScore,
    routeReadiness: clamp(routeReadiness),
    subjectGateScore: gate.score,
    marksReadinessScore: marksScore,
    affordabilityScore: affordability.score,
    employmentSignal,
    match,
    readinessNotes: [...new Set(readinessNotes)].slice(0, 5),
  };
}

function calculateResult(form: FormState, reality: StoredReality | null, cost: StoredCost | null): Result {
  const ranked = careers
    .map((career) => scoreCareer(career, form, reality, cost))
    .sort((a, b) => b.match - a.match)
    .slice(0, 4);
  const top = ranked[0];
  const dream = dreamRouteLibrary[form.dreamRoute];

  let verdict = `Your strongest field-fit signal is ${top.title}.`;
  let verdictClass: 'green' | 'amber' | 'red' = 'green';
  let verdictBody = 'The result separates what seems interesting from whether the route is realistic right now.';

  if (top.fieldFit >= 75 && top.routeReadiness >= 70) {
    verdict = `Strong fit and reasonable readiness: ${top.title}.`;
    verdictBody = 'This is worth investigating seriously, while still checking cost, accreditation and route alternatives.';
  } else if (top.fieldFit >= 75 && top.routeReadiness < 70) {
    verdict = `Strong fit, but route readiness needs care: ${top.title}.`;
    verdictClass = 'amber';
    verdictBody = 'This is not a no. It means compare a bridging, diploma, TVET, work-linked or adjacent route before paying deposits.';
  } else if (top.fieldFit < 60) {
    verdict = 'Mixed fit signal - slow down before choosing.';
    verdictClass = 'amber';
    verdictBody = 'No single field strongly stood out. More exposure, job-shadowing or structured conversations would make the next decision safer.';
  }

  const implications = [
    'This is a decision-support guide, not a diagnosis, APS calculator or employment promise.',
    'Weak readiness should never dead-end the learner. It should trigger bridging, diploma, TVET, work-and-study or adjacent-route comparisons.',
    'Before applying or paying deposits, ask about accreditation, full costs, completion rates, placement support, graduate outcomes and refund rules.',
  ];

  if (form.exposure === '0' || form.exposure === '25') implications.push('Exposure confidence is low. Speak to someone in the field or test a small project before committing.');
  if (dream.matchFields.length && !ranked.slice(0, 3).some((career) => dream.matchFields.includes(career.fieldKey))) implications.push(`Your selected dream route (${dream.label}) did not appear in the top field-fit results. Compare it carefully before committing.`);

  return {
    top: ranked,
    dream: { key: form.dreamRoute, label: dream.label, note: dream.note, saferRoutes: dream.alternatives },
    verdict,
    verdictClass,
    verdictBody,
    implications,
  };
}

function saveResult(form: FormState, result: Result) {
  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        profile: form.profile,
        marks: form.marks,
        dreamRoute: form.dreamRoute,
        motivation: form.motivation,
        exposure: form.exposure,
        top: result.top.slice(0, 3).map((career) => career.title),
        detailedTop: result.top.slice(0, 3).map((career) => ({
          title: career.title,
          match: career.match,
          fitScore: career.fieldFit,
          fieldFit: career.fieldFit,
          routeReadiness: career.routeReadiness,
          readinessScore: career.routeReadiness,
          employmentSignal: career.employmentSignal,
          readinessNotes: career.readinessNotes,
          routes: career.routes,
          evidenceNote: career.evidenceNote,
        })),
        dream: result.dream,
        model: 'Career Fit V2 - fit, readiness and safer routes',
        lastReviewed: 'May 2026',
      })
    );
  } catch {
    // Keep the visible result even when browser storage is unavailable.
  }
}

function Slider({ definition, value, onChange }: { definition: (typeof sliderDefs)[number]; value: number; onChange: (value: number) => void }) {
  return (
    <div className="slider-group">
      <div className="slider-header">
        <span className="slider-label">{definition.label} <span className="label-helper">{definition.helper}</span></span>
        <span className="slider-value">{value}%</span>
      </div>
      <input type="range" min="0" max="100" value={value} onChange={(event) => onChange(toNumber(event.target.value))} />
    </div>
  );
}

function ScorePill({ label, value }: { label: string; value: number }) {
  const cls = value >= 75 ? 'green' : value >= 55 ? 'amber' : 'red';
  return (
    <div className={`fit-score-pill ${cls}`}>
      <span>{label}</span>
      <strong>{Math.round(value)}%</strong>
    </div>
  );
}

function CareerResultCard({ career }: { career: CareerResult }) {
  return (
    <div className="career-item fit-v2-card">
      <div className="fit-score-row">
        <ScorePill label="Field Fit" value={career.fieldFit} />
        <ScorePill label="Route Readiness" value={career.routeReadiness} />
        <ScorePill label="Employment Signal" value={career.employmentSignal} />
      </div>
      <h4>{career.title}</h4>
      <p>{career.blurb}</p>
      <p className="fit-muted"><strong>Typical routes in SA:</strong> {career.routes}</p>
      <p className="fit-muted"><strong>Source basis:</strong> {career.evidenceNote}</p>
      {career.readinessNotes.length ? <ul>{career.readinessNotes.map((note) => <li key={note}>{note}</li>)}</ul> : null}
    </div>
  );
}

export function CareerFitCheck() {
  const [form, setForm] = useState<FormState>(defaultForm);
  const [result, setResult] = useState<Result | null>(null);
  const [reality] = useState<StoredReality | null>(() => (typeof window === 'undefined' ? null : getStoredReality()));
  const [cost] = useState<StoredCost | null>(() => (typeof window === 'undefined' ? null : getStoredCost()));
  const resultRef = useRef<HTMLDivElement | null>(null);

  const preview = useMemo(() => calculateResult(form, reality, cost).top[0], [form, reality, cost]);

  function updateProfile(key: SliderKey, value: number) {
    setForm((current) => ({ ...current, profile: { ...current.profile, [key]: value } }));
    setResult(null);
  }

  function updateMark(key: MarkKey, value: number) {
    setForm((current) => ({ ...current, marks: { ...current.marks, [key]: value } }));
    setResult(null);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextResult = calculateResult(form, reality, cost);
    saveResult(form, nextResult);
    setResult(nextResult);
    window.setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 0);
  }

  function resetForm() {
    setForm(defaultForm);
    setResult(null);
  }

  return (
    <div className="page-section active fit-react-tool" data-page="fit-check-react">
      <section className="tool-header">
        <div className="container container-narrow">
          <div className="progress">Step 04 of 04 · <span>Career Fit Check</span></div>
          <h1>The cheapest path is worthless if you will quit it in two years.</h1>
          <p className="lead">A V2 fit, readiness and route-risk check for South African learners and families.</p>
        </div>
      </section>

      <section className="tool-body">
        <div className="container container-narrow">
          <form onSubmit={handleSubmit}>
            <div className="form-section">
              <span className="eyebrow">Step 1</span>
              <h3>Your subjects & marks</h3>
              <p className="helper">This is not a formal APS calculator. It separates field interest from route readiness.</p>
              <div className="form-grid">
                {(Object.keys(markLabels) as MarkKey[]).map((key) => (
                  <div className="form-group" key={key}>
                    <label htmlFor={`mark-${key}`}>{markLabels[key]}</label>
                    <select id={`mark-${key}`} value={form.marks[key]} onChange={(event) => updateMark(key, toNumber(event.target.value))}>
                      {markOptions.map(([value, label]) => <option key={`${key}-${value}`} value={value}>{label}</option>)}
                    </select>
                  </div>
                ))}
              </div>
            </div>

            <div className="form-section">
              <span className="eyebrow">Step 2</span>
              <h3>Your interests</h3>
              <p className="helper">0 = really not me; 100 = yes, definitely me.</p>
              {sliderDefs.filter((definition) => definition.group === 'interest').map((definition) => (
                <Slider key={definition.id} definition={definition} value={form.profile[definition.id]} onChange={(value) => updateProfile(definition.id, value)} />
              ))}
            </div>

            <div className="form-section">
              <span className="eyebrow">Step 3</span>
              <h3>Working style, motivation and exposure</h3>
              <p className="helper">The V2 model includes day-to-day work style, values and whether the learner has actually seen the field up close.</p>
              {sliderDefs.filter((definition) => definition.group === 'style').map((definition) => (
                <Slider key={definition.id} definition={definition} value={form.profile[definition.id]} onChange={(value) => updateProfile(definition.id, value)} />
              ))}
              <div className="form-grid fit-extra-grid">
                <div className="form-group">
                  <label htmlFor="fit-motivation">Most important motivation</label>
                  <select id="fit-motivation" value={form.motivation} onChange={(event) => { setForm((current) => ({ ...current, motivation: event.target.value as Motivation })); setResult(null); }}>
                    {Object.entries(motivationLabels).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="fit-exposure">Exposure confidence</label>
                  <select id="fit-exposure" value={form.exposure} onChange={(event) => { setForm((current) => ({ ...current, exposure: event.target.value })); setResult(null); }}>
                    <option value="0">No real exposure yet</option>
                    <option value="25">Read or watched a little</option>
                    <option value="55">Spoken to someone or researched properly</option>
                    <option value="75">Job-shadowed, volunteered or tried a project</option>
                    <option value="90">Strong first-hand exposure</option>
                  </select>
                </div>
                <div className="form-group form-group-full">
                  <label htmlFor="fit-dream-route">Dream route to pressure-test</label>
                  <select id="fit-dream-route" value={form.dreamRoute} onChange={(event) => { setForm((current) => ({ ...current, dreamRoute: event.target.value as DreamRoute })); setResult(null); }}>
                    {Object.entries(dreamRouteLibrary).map(([key, value]) => <option key={key} value={key}>{value.label}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <div className="fit-live-preview" aria-live="polite">
              <span className="eyebrow">Live preview</span>
              <h3>{preview.title}</h3>
              <div className="fit-score-row">
                <ScorePill label="Field Fit" value={preview.fieldFit} />
                <ScorePill label="Route Readiness" value={preview.routeReadiness} />
                <ScorePill label="Employment Signal" value={preview.employmentSignal} />
              </div>
              <p>This preview updates as you move the sliders. The final result shows the top fields plus safer routes to compare.</p>
            </div>

            <div className="method-note">
              <strong>Caution:</strong> This tool is a decision-support guide. It does not replace career counselling, institution admissions advice, professional registration guidance or financial advice.
            </div>

            <div className="form-actions">
              <button className="btn btn-primary" type="submit">See career fit →</button>
              <button className="btn btn-ghost" type="button" onClick={resetForm}>Reset</button>
            </div>
          </form>

          {result && (
            <div className="result-panel" ref={resultRef}>
              <span className="eyebrow eyebrow-soft">Your career fit</span>
              <div className={`verdict ${result.verdictClass}`}>{result.verdict}</div>
              <p>{result.verdictBody}</p>
              <div className="career-list">
                {result.top.slice(0, 3).map((career) => <CareerResultCard key={career.title} career={career} />)}
              </div>

              <div className="readiness-plan">
                <span className="plan-tag">Safer routes to compare</span>
                <h4>{result.dream.label}</h4>
                <p>{result.dream.note}</p>
                <div className="alternative-grid">
                  {result.dream.saferRoutes.map((route) => (
                    <div className="alternative-card" key={route.title}>
                      <div className="alt-tag">{route.tag}</div>
                      <h4>{route.title}</h4>
                      <p><strong>Why it may be safer:</strong> {route.why}</p>
                      <p><strong>Typical route:</strong> {route.route}</p>
                      <p><strong>What to ask next:</strong> {route.next}</p>
                    </div>
                  ))}
                </div>
              </div>

              <h4 className="result-subheading">A few honest notes</h4>
              <ul>{result.implications.map((item) => <li key={item}>{item}</li>)}</ul>

              <div className="next-steps">
                <a className="btn btn-primary" href="/tools/next-steps">See your three pathways →</a>
                <a className="btn btn-secondary" href="/tools/route-compare">Compare routes in detail</a>
                <button className="btn btn-print" type="button" onClick={() => window.print()}>Print / save as PDF</button>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
