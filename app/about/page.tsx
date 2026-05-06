const values = [
  ['Independence', 'No payment from universities, colleges, lenders, or bursary providers.'],
  ['Transparency', 'Every formula and assumption used in our tools is documented.'],
  ['Realism over optimism', 'We default to honest, conservative numbers.'],
  ['Range, not ranking', "We will not tell you which institution is better. We'll show trade-offs."],
  ['Privacy by default', 'Tools run in your browser. We do not ask for ID or documents.'],
  ['Local context', 'NSFAS thresholds, SAQA levels, TVET reality — built in.'],
] as const;

const team = [
  {
    role: 'Executive Lead & Founder',
    name: 'Shaylin Sing',
    paragraphs: [
      'Shaylin is the Supporter Relationship Manager at OUTA (Organisation Undoing Tax Abuse), where he manages a national call centre team and the organisation\'s supporter engagement function.',
      'He started Dharma Pathways because he fell through the missing middle gap himself. His parents earned too much for NSFAS and not enough for university to feel financially safe — and when he eventually studied, he chose the wrong field partly because he did not have access to the kind of honest, numbers-based guidance these tools try to provide.',
    ],
    quote: '“I built the tools I wish existed when I was 18.”',
  },
  {
    role: 'Chairperson & Chief Strategy Officer',
    name: 'Urvashi Dayanand',
    paragraphs: [
      'Urvashi is a Clinical Associate at DL Wineberg Inc., where she works alongside general and trauma surgeons in both surgical and administrative functions.',
      'She completed her BClinMedPrac (BCMP) at the University of Pretoria after not qualifying directly for medicine, on the understanding at the time that the degree would serve as a pathway into the medicine degree. During her first year, however, the university discontinued this transition — leaving her on a path shaped by advice that ultimately proved inaccurate, without access to tools to compare options or model alternative routes forward.',
      'This experience has shaped her commitment to supporting young people in making informed decisions about their post-school education. She is passionate about helping youth identify pathways that align with their goals and strengths, so they can move forward with clarity and confidence, and avoid the regret that can come from uninformed or misdirected choices.',
    ],
    quote: '“If I\'d had something like Route Compare, I might have found options I didn\'t know existed — and I would have known to check whether the programme was secure before committing.”',
  },
  {
    role: 'Director & Chief Compliance Officer',
    name: 'Merissa Chetty',
    paragraphs: [
      'Merissa studied medicine at the University of KwaZulu-Natal and is currently completing her community service at Charlotte Maxeke Johannesburg Academic Hospital. She has a strong academic background and a keen interest in paediatrics.',
      'Through her journey, she has gained insight into the complexities of career pathways in South Africa, including the challenges of workforce planning and employment opportunities. She is passionate about helping students make informed, realistic decisions about their futures.',
    ],
    quote: '“Brilliant marks and the wrong labour-market information can still leave you without a job. The system doesn\'t tell you that upfront.”',
  },
  {
    role: 'Director & Chief Financial Officer',
    name: 'Keian Padayachee',
    paragraphs: [
      'Keian is a Chartered Accountant at Deloitte, with prior experience at KPMG. He is responsible for the financial integrity and modelling behind the tools.',
      'Keian was not personally affected by the missing middle gap in the same way as his co-founders. He came to Dharma Pathways because he watched the people around him — peers, family members, colleagues earlier in their careers — struggle not from lack of ability, but from a lack of good information at the decision point. That gap, he argues, is the same whether the family earns R 350,000 or R 600,000 a year.',
    ],
    quote: '“It\'s not a skills problem. It\'s an information problem — and information problems are solvable.”',
  },
];

export default function Page() {
  return (
    <div className="page-section active" data-page="about">
      <section className="page-hero">
        <div className="container container-narrow">
          <span className="eyebrow">About</span>
          <h1>Four people who lived the gap, built the tools they wish existed.</h1>
          <p className="lead">Dharma Pathways wasn&apos;t built by consultants who studied the problem — it was built by people who experienced it.</p>
        </div>
      </section>

      <section>
        <div className="container">
          <div className="two-col">
            <div>
              <span className="eyebrow">The name</span>
              <h2>Why &quot;Dharma&quot;?</h2>
            </div>
            <div>
              <p>
                <strong>Dharma</strong>, in the traditions it comes from, means the <em>right path</em> — not a single universal one, but the path that aligns with who you are, what you owe, and what you are built to carry.
              </p>
              <p>Dharma Pathways exists to help each family find <em>their</em> right path — the one that works for their finances, their student, and their future.</p>
            </div>
          </div>
        </div>
      </section>

      <hr className="divider" />

      <section style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="two-col">
            <div>
              <span className="eyebrow">Mission</span>
              <h2>What we are trying to do.</h2>
            </div>
            <div>
              <p style={{ fontSize: '1.15rem', color: 'var(--ink)' }}>
                Help every South African family — especially those in the missing middle — make post-school education decisions with full information, honest maths, and zero conflicts of interest.
              </p>
              <p>That means free tools that work without you signing up. Numbers that come from public, citable sources. Comparisons that include TVET, distance learning, work-then-study, and gap years with purpose.</p>
            </div>
          </div>
        </div>
      </section>

      <section style={{ background: 'var(--paper-deep)' }}>
        <div className="container">
          <span className="eyebrow">How we work</span>
          <h2 style={{ maxWidth: '22ch' }}>Six commitments we hold ourselves to.</h2>
          <div className="value-grid">
            {values.map(([title, body]) => (
              <div className="value-item reveal" key={title}>
                <h4>{title}</h4>
                <p>{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section>
        <div className="container">
          <span className="eyebrow">The team</span>
          <h2 style={{ maxWidth: '26ch' }}>Built by people who lived the problem.</h2>
          <div className="team-grid">
            {team.map((member) => (
              <div className="team-card reveal" key={member.name}>
                <div className="team-card-role">{member.role}</div>
                <h4>{member.name}</h4>
                {member.paragraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
                <div className="lived-it">{member.quote}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
