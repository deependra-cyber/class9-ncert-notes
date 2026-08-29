import { type ReactNode, useEffect, useMemo, useState } from 'react';
import { Route, Switch, Link, useLocation, useParams, Router as WouterRouter } from 'wouter';
import { ArrowRight, BookOpen, Calculator as CalculatorIcon, Check, CheckCircle2, ChevronLeft, ChevronRight, CircleHelp, Clock3, Delete, Filter, Info, LayoutDashboard, Menu, Minus, Plus, RotateCcw, Search, Sparkles, Target, Trophy, X } from 'lucide-react';

type Subject = {
  slug: string;
  name: string;
  title: string;
  blurb: string;
  chapters: string[];
  facts: QuizFact[];
  color: string;
  tint: string;
};

type QuizFact = {
  prompt: string;
  answer: string;
  distractors: string[];
};

type QuizQuestion = QuizFact & { id: string; options: string[]; answerIndex: number; chapter: string };

type Progress = {
  answered: number;
  correct: number;
  bestScore: number;
  attempts: number;
  bySubject: Record<string, { answered: number; correct: number; bestScore: number; attempts: number }>;
};

const STORAGE_KEY = 'class9-desk-progress';

const subjects: Subject[] = [
  {
    slug: 'mathematics',
    name: 'Mathematics',
    title: 'Ganita Manjari',
    blurb: 'See the pattern. Name the rule. Solve with confidence.',
    color: '#d96b4f',
    tint: '#f6ded3',
    chapters: ['Number Systems', 'Polynomials', 'Coordinate Geometry', 'Linear Equations', 'Lines & Angles', 'Triangles', 'Quadrilaterals', 'Circles', 'Heron’s Formula', 'Statistics'],
    facts: [
      { prompt: 'Which number cannot be written as a ratio of two integers?', answer: 'An irrational number', distractors: ['A natural number', 'An integer', 'A rational number'] },
      { prompt: 'What is the degree of a non-zero constant polynomial?', answer: '0', distractors: ['1', '2', 'It cannot be defined'] },
      { prompt: 'The point where the x-axis and y-axis meet is called the', answer: 'origin', distractors: ['abscissa', 'ordinate', 'quadrant'] },
      { prompt: 'The graph of a linear equation in two variables is a', answer: 'straight line', distractors: ['circle', 'parabola', 'point'] },
      { prompt: 'If two lines intersect, the vertically opposite angles are', answer: 'equal', distractors: ['supplementary', 'always acute', 'always right angles'] },
      { prompt: 'A triangle with all three sides equal is', answer: 'equilateral', distractors: ['isosceles', 'scalene', 'right-angled'] },
      { prompt: 'The diagonals of a parallelogram', answer: 'bisect each other', distractors: ['are always equal', 'are perpendicular always', 'never intersect'] },
      { prompt: 'The area of a circle depends on its', answer: 'radius', distractors: ['diameter only', 'circumference only', 'chord only'] },
    ],
  },
  {
    slug: 'hindi',
    name: 'Hindi',
    title: 'Ganga',
    blurb: 'Read closely, feel the voice, and let the words stay with you.',
    color: '#b76a3f',
    tint: '#f2e1ca',
    chapters: ['दो बैलों की कथा', 'ल्हासा की ओर', 'उपभोक्तावाद की संस्कृति', 'साँवले सपनों की याद', 'प्रेमचंद के फटे जूते', 'मेरे बचपन के दिन', 'साखी', 'वाख', 'सवैये', 'कैदी और कोकिला'],
    facts: [
      { prompt: 'कहानी में किसी पात्र के स्वभाव को समझने के लिए सबसे उपयोगी है', answer: 'उसके कार्य और संवाद', distractors: ['केवल उसका नाम', 'केवल कहानी का शीर्षक', 'पृष्ठ संख्या'] },
      { prompt: '‘साखी’ का सामान्य अर्थ है', answer: 'साक्षी या गवाही', distractors: ['यात्रा', 'उत्सव', 'प्रश्न'] },
      { prompt: 'कविता में एक ही वर्ण या ध्वनि की पुनरावृत्ति कहलाती है', answer: 'अनुप्रास अलंकार', distractors: ['उपमा अलंकार', 'रूपक अलंकार', 'यमक अलंकार'] },
      { prompt: 'किसी रचना का केंद्रीय विचार उसका', answer: 'भाव या संदेश', distractors: ['लेखक का पता', 'प्रकाशन मूल्य', 'अनुच्छेद क्रम'] },
      { prompt: '‘जो मेहनत करता है’ में ‘मेहनत करता है’ है', answer: 'क्रिया पदबंध', distractors: ['संज्ञा पदबंध', 'विशेषण पदबंध', 'सर्वनाम पदबंध'] },
      { prompt: 'विलोम शब्दों का संबंध होता है', answer: 'विपरीत अर्थ से', distractors: ['समान अर्थ से', 'ध्वनि की समानता से', 'लिंग से'] },
      { prompt: 'आत्मकथा में लेखक लिखता है', answer: 'अपने जीवन के अनुभव', distractors: ['केवल कल्पित संवाद', 'शब्दकोश', 'समाचार शीर्षक'] },
      { prompt: 'किसी पाठ का सार लिखते समय सबसे पहले पहचानना चाहिए', answer: 'मुख्य विचार', distractors: ['हर अलंकार', 'लेखक की आयु', 'कुल पृष्ठ'] },
    ],
  },
  {
    slug: 'english',
    name: 'English',
    title: 'Kaveri',
    blurb: 'Find the thought beneath the sentence, then make it yours.',
    color: '#347e83',
    tint: '#d9edeb',
    chapters: ['The Fun They Had', 'The Sound of Music', 'The Little Girl', 'A Truly Beautiful Mind', 'The Snake and the Mirror', 'My Childhood', 'Reach for the Top', 'Kathmandu', 'If I Were You', 'The Road Not Taken'],
    facts: [
      { prompt: 'A character’s actions in a story mainly help the reader understand their', answer: 'personality and choices', distractors: ['page number', 'font size', 'setting’s weather'] },
      { prompt: 'The central idea of a poem is its', answer: 'main thought or message', distractors: ['rhyme count only', 'longest line', 'title font'] },
      { prompt: 'A word used in place of a noun is a', answer: 'pronoun', distractors: ['preposition', 'conjunction', 'adverb'] },
      { prompt: '“She has finished her work” is in the', answer: 'present perfect tense', distractors: ['simple past tense', 'future tense', 'past continuous tense'] },
      { prompt: 'The setting of a story tells us where and', answer: 'when it happens', distractors: ['who printed it', 'how long it is', 'what it costs'] },
      { prompt: 'A comparison using “like” or “as” is a', answer: 'simile', distractors: ['metaphor', 'alliteration', 'personification'] },
      { prompt: 'A formal letter should usually begin with a', answer: 'clear subject or purpose', distractors: ['joke', 'riddle', 'random quotation'] },
      { prompt: 'The passive voice focuses attention on the', answer: 'action or receiver of the action', distractors: ['speaker’s accent', 'number of paragraphs', 'punctuation mark'] },
    ],
  },
  {
    slug: 'science',
    name: 'Science',
    title: 'Exploration',
    blurb: 'Ask better questions. Notice the evidence. Explain the why.',
    color: '#377c61',
    tint: '#dcecdf',
    chapters: ['Matter in Our Surroundings', 'Is Matter Around Us Pure?', 'Atoms and Molecules', 'The Fundamental Unit of Life', 'Tissues', 'Motion', 'Force and Laws of Motion', 'Gravitation', 'Work and Energy', 'Sound'],
    facts: [
      { prompt: 'The smallest particle of an element that takes part in a chemical reaction is an', answer: 'atom', distractors: ['organ', 'tissue', 'mixture'] },
      { prompt: 'The basic structural and functional unit of life is the', answer: 'cell', distractors: ['organ system', 'tissue', 'molecule'] },
      { prompt: 'The SI unit of speed is', answer: 'metre per second', distractors: ['kilometre', 'newton', 'joule per second'] },
      { prompt: 'An object remains at rest or in uniform motion because of', answer: 'inertia', distractors: ['density', 'pressure', 'temperature'] },
      { prompt: 'The force that attracts objects towards Earth is', answer: 'gravity', distractors: ['friction only', 'magnetism only', 'buoyancy'] },
      { prompt: 'Work is done when a force causes', answer: 'displacement', distractors: ['mass', 'colour', 'temperature alone'] },
      { prompt: 'Sound needs a medium because it is a', answer: 'mechanical wave', distractors: ['light ray', 'vacuum particle', 'chemical change'] },
      { prompt: 'A solution in which no more solute can dissolve at a given temperature is', answer: 'saturated', distractors: ['dilute only', 'unsaturated always', 'colloidal'] },
    ],
  },
  {
    slug: 'social-science',
    name: 'Social Science',
    title: 'Exploring Society: India and Beyond',
    blurb: 'Connect people, places, power, and the choices that shape everyday life.',
    color: '#866247',
    tint: '#eee2d1',
    chapters: ['India: Size and Location', 'Physical Features of India', 'Drainage', 'Climate', 'Democracy in the Contemporary World', 'Constitutional Design', 'People as Resource', 'Poverty as a Challenge', 'Food Security', 'The French Revolution'],
    facts: [
      { prompt: 'A democratic government is ultimately accountable to the', answer: 'people', distractors: ['army alone', 'monarchy alone', 'largest company'] },
      { prompt: 'The Constitution lays down the', answer: 'basic rules and rights of a country', distractors: ['daily weather', 'price of every product', 'school timetable'] },
      { prompt: 'The Northern Plains were formed mainly by', answer: 'alluvial deposits', distractors: ['volcanic lava', 'coral reefs', 'wind-blown sand only'] },
      { prompt: 'The monsoon is important to India because it strongly affects', answer: 'rainfall and agriculture', distractors: ['the length of a day', 'Earth’s orbit', 'ocean salinity only'] },
      { prompt: 'People become a resource when they are', answer: 'educated, skilled and healthy', distractors: ['counted only', 'given no training', 'removed from work'] },
      { prompt: 'Poverty is best understood as a lack of', answer: 'resources and opportunities for a decent life', distractors: ['one luxury item', 'a particular surname', 'a single festival'] },
      { prompt: 'The French Revolution began in', answer: '1789', distractors: ['1492', '1857', '1947'] },
      { prompt: 'Food security means that people have', answer: 'regular access to sufficient, safe food', distractors: ['only stored grain', 'one meal a week', 'food only during festivals'] },
    ],
  },
];

function buildQuestions(subject: Subject): QuizQuestion[] {
  return Array.from({ length: 80 }, (_, index) => {
    const fact = subject.facts[index % subject.facts.length];
    const chapter = subject.chapters[index % subject.chapters.length];
    const shift = index % 4;
    const options = [fact.answer, ...fact.distractors];
    const rotated = [...options.slice(shift), ...options.slice(0, shift)];
    return { ...fact, id: `${subject.slug}-${index + 1}`, chapter, options: rotated, answerIndex: rotated.indexOf(fact.answer) };
  });
}

function blankProgress(): Progress {
  return { answered: 0, correct: 0, bestScore: 0, attempts: 0, bySubject: {} };
}

function readProgress(): Progress {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? { ...blankProgress(), ...JSON.parse(stored) } : blankProgress();
  } catch {
    return blankProgress();
  }
}

function writeProgress(progress: Progress) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

function recordAnswer(slug: string, correct: boolean) {
  const current = readProgress();
  const subject = current.bySubject[slug] || { answered: 0, correct: 0, bestScore: 0, attempts: 0 };
  subject.answered += 1;
  if (correct) subject.correct += 1;
  current.answered += 1;
  if (correct) current.correct += 1;
  current.bySubject[slug] = subject;
  writeProgress(current);
  return current;
}

function recordScore(slug: string, score: number, total: number) {
  const current = readProgress();
  const subject = current.bySubject[slug] || { answered: 0, correct: 0, bestScore: 0, attempts: 0 };
  subject.bestScore = Math.max(subject.bestScore, Math.round((score / total) * 100));
  subject.attempts += 1;
  current.bestScore = Math.max(current.bestScore, subject.bestScore);
  current.attempts += 1;
  current.bySubject[slug] = subject;
  writeProgress(current);
  return current;
}

function IconMark() {
  return <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[hsl(var(--secondary))] text-[hsl(var(--foreground))] ink-shadow" aria-hidden="true"><BookOpen size={20} strokeWidth={2.4} /></span>;
}

function NavItem({ href, label, icon: Icon, active }: { href: string; label: string; icon: typeof BookOpen; active: boolean }) {
  return (
    <Link href={href} data-testid={`link-nav-${label.toLowerCase().replaceAll(' ', '-')}`} className={`focus-ring flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all duration-200 ${active ? 'bg-[hsl(var(--sidebar-accent))] text-[hsl(var(--sidebar-accent-foreground))] translate-x-1' : 'text-[hsl(var(--sidebar-foreground)/.68)] hover:bg-[hsl(var(--sidebar-accent)/.7)] hover:text-[hsl(var(--sidebar-foreground))]'}`}>
      <Icon size={17} /><span>{label}</span>{active && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[hsl(var(--secondary))]" />}
    </Link>
  );
}

function Shell({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const nav = [
    { href: '/', label: 'Study desk', icon: LayoutDashboard },
    { href: '/calculator', label: 'Calculator', icon: CalculatorIcon },
    { href: '/about', label: 'About the syllabus', icon: Info },
  ];
  return (
    <div className="min-h-[100dvh] bg-[hsl(var(--background))]">
      <aside className={`fixed inset-y-0 left-0 z-30 flex w-64 flex-col bg-[hsl(var(--sidebar))] px-5 py-6 text-[hsl(var(--sidebar-foreground))] transition-transform duration-300 md:translate-x-0 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center gap-3 px-2">
          <IconMark />
          <div><p className="display text-lg leading-none">padhai desk</p><p className="mono mt-1 text-[10px] uppercase tracking-[.18em] text-[hsl(var(--sidebar-foreground)/.5)]">class 09 / ncert</p></div>
          <button onClick={() => setMobileOpen(false)} data-testid="button-close-mobile-nav" aria-label="Close navigation" className="focus-ring ml-auto rounded-lg p-1 text-[hsl(var(--sidebar-foreground)/.65)] hover:text-[hsl(var(--secondary))] md:hidden"><X size={19} /></button>
        </div>
        <div className="my-8 h-px bg-[hsl(var(--sidebar-border))]" />
        <p className="mono mb-3 px-3 text-[10px] uppercase tracking-[.2em] text-[hsl(var(--sidebar-foreground)/.42)]">Your desk</p>
        <nav className="space-y-1">
          {nav.map((item) => <div key={item.href} onClick={() => setMobileOpen(false)}><NavItem {...item} active={item.href === '/' ? location === '/' : location.startsWith(item.href)} /></div>)}
        </nav>
        <p className="mono mb-3 mt-9 px-3 text-[10px] uppercase tracking-[.2em] text-[hsl(var(--sidebar-foreground)/.42)]">Subjects</p>
        <nav className="space-y-1">
          {subjects.map((subject) => <div key={subject.slug} onClick={() => setMobileOpen(false)}><NavItem href={`/subject/${subject.slug}`} label={subject.name} icon={BookOpen} active={location.includes(`/subject/${subject.slug}`) || location.includes(`/quiz/${subject.slug}`)} /></div>)}
        </nav>
        <div className="mt-auto rounded-2xl border border-[hsl(var(--sidebar-border))] bg-[hsl(var(--sidebar-accent)/.7)] p-4">
          <Sparkles size={17} className="mb-3 text-[hsl(var(--secondary))]" />
          <p className="text-xs font-semibold leading-relaxed">Small sessions beat heroic plans.</p>
          <p className="mt-1 text-[11px] leading-relaxed text-[hsl(var(--sidebar-foreground)/.52)]">Open one chapter. Leave with one clear idea.</p>
        </div>
      </aside>
      {mobileOpen && <button aria-label="Close menu overlay" data-testid="button-menu-overlay" onClick={() => setMobileOpen(false)} className="fixed inset-0 z-20 bg-[hsl(var(--foreground)/.35)] md:hidden" />}
      <main className="min-h-[100dvh] md:pl-64">
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-[hsl(var(--border)/.75)] bg-[hsl(var(--background)/.92)] px-5 backdrop-blur-md md:px-10">
          <button onClick={() => setMobileOpen(true)} data-testid="button-open-mobile-nav" aria-label="Open navigation" className="focus-ring rounded-lg p-2 hover:bg-[hsl(var(--muted))] md:hidden"><Menu size={21} /></button>
          <div className="hidden items-center gap-2 text-xs text-[hsl(var(--muted-foreground))] md:flex"><span className="h-2 w-2 rounded-full bg-[hsl(var(--primary))]" /> evening revision mode <span className="mono ml-1 text-[10px]">18:40 IST</span></div>
          <div className="ml-auto flex items-center gap-3"><span className="mono hidden text-[10px] uppercase tracking-[.15em] text-[hsl(var(--muted-foreground))] sm:inline">class 9 · 2025–26</span><div className="flex h-8 w-8 items-center justify-center rounded-full bg-[hsl(var(--primary))] text-xs font-bold text-[hsl(var(--primary-foreground))]">A</div></div>
        </header>
        {children}
      </main>
    </div>
  );
}

function StatCard({ value, label, note, icon: Icon, accent }: { value: string; label: string; note: string; icon: typeof Target; accent: string }) {
  return <div className="rounded-2xl border border-[hsl(var(--card-border))] bg-[hsl(var(--card))] p-5 soft-shadow"><div className="mb-6 flex items-start justify-between"><span className="mono text-[10px] uppercase tracking-[.16em] text-[hsl(var(--muted-foreground))]">{label}</span><span style={{ backgroundColor: accent }} className="flex h-8 w-8 items-center justify-center rounded-lg text-[hsl(var(--foreground))]"><Icon size={16} /></span></div><p className="display text-3xl">{value}</p><p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">{note}</p></div>;
}

function Dashboard() {
  const [progress, setProgress] = useState<Progress>(readProgress);
  useEffect(() => {
    const onFocus = () => setProgress(readProgress());
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, []);
  const accuracy = progress.answered ? Math.round((progress.correct / progress.answered) * 100) : 0;
  return (
    <div className="mx-auto max-w-7xl px-5 py-8 md:px-10 md:py-12">
      <section className="paper-grid relative overflow-hidden rounded-[1.7rem] border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-6 py-9 md:px-12 md:py-12">
        <div className="absolute -right-16 -top-24 h-64 w-64 rounded-full border-[28px] border-[hsl(var(--secondary)/.2)]" />
        <div className="absolute bottom-[-75px] right-20 h-36 w-36 rounded-full bg-[hsl(var(--accent)/.14)]" />
        <div className="relative max-w-2xl reveal"><p className="mono mb-4 text-[11px] uppercase tracking-[.2em] text-[hsl(var(--primary))]">Tuesday, 14 January · desk note 01</p><h1 className="display text-4xl leading-[.98] tracking-[-.03em] sm:text-6xl">Make tonight’s<br /><em className="text-[hsl(var(--primary))]">understanding</em> count.</h1><p className="mt-5 max-w-md text-sm leading-6 text-[hsl(var(--muted-foreground))]">A focused corner for chapter clarity, quick practice, and that quiet click when a difficult idea finally lands.</p><div className="mt-7 flex flex-wrap gap-3"><Link href="/subject/mathematics" data-testid="link-start-study" className="focus-ring inline-flex items-center gap-2 rounded-xl bg-[hsl(var(--primary))] px-4 py-3 text-sm font-bold text-[hsl(var(--primary-foreground))] transition-transform hover:-translate-y-0.5">Start a study sprint <ArrowRight size={16} /></Link><Link href="/calculator" data-testid="link-hero-calculator" className="focus-ring inline-flex items-center gap-2 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card)/.72)] px-4 py-3 text-sm font-bold transition-colors hover:bg-[hsl(var(--muted))]">Open calculator</Link></div></div>
      </section>
      <section className="mt-8 grid gap-4 sm:grid-cols-3">
        <StatCard value={`${progress.answered}`} label="questions answered" note="Every attempt makes the next one lighter." icon={CheckCircle2} accent="hsl(35 76% 61%)" />
        <StatCard value={`${accuracy}%`} label="accuracy" note={progress.answered ? 'Keep the rhythm, not the pressure.' : 'Your first answer sets the baseline.'} icon={Target} accent="hsl(174 62% 31% / .2)" />
        <StatCard value={`${progress.attempts}`} label="quiz sessions" note={progress.attempts ? `Best session: ${progress.bestScore}%` : 'A 10-minute session is enough.'} icon={Clock3} accent="hsl(11 70% 62% / .25)" />
      </section>
      <section className="mt-11 grid gap-8 lg:grid-cols-[1fr_320px]">
        <div><div className="mb-4 flex items-end justify-between"><div><p className="mono text-[10px] uppercase tracking-[.18em] text-[hsl(var(--muted-foreground))]">Your shelves</p><h2 className="display mt-1 text-3xl">Pick a subject</h2></div><span className="hidden text-xs text-[hsl(var(--muted-foreground))] sm:block">Five ways to get unstuck</span></div><div className="grid gap-4 sm:grid-cols-2">
          {subjects.map((subject, index) => {
            const item = progress.bySubject[subject.slug];
            const subjectAccuracy = item?.answered ? Math.round((item.correct / item.answered) * 100) : 0;
            return <Link href={`/subject/${subject.slug}`} data-testid={`card-subject-${subject.slug}`} key={subject.slug} className={`group focus-ring rounded-2xl border border-[hsl(var(--card-border))] bg-[hsl(var(--card))] p-5 transition-all duration-300 hover:-translate-y-1 hover:soft-shadow ${index === 4 ? 'sm:col-span-2 lg:col-span-1' : ''}`}><div className="flex items-start justify-between"><span style={{ backgroundColor: subject.tint, color: subject.color }} className="flex h-11 w-11 items-center justify-center rounded-xl text-sm font-bold">{subject.title.slice(0, 2)}</span><ChevronRight size={18} className="text-[hsl(var(--muted-foreground))] transition-transform group-hover:translate-x-1" /></div><h3 className="mt-5 text-base font-bold">{subject.name}</h3><p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">{subject.title}</p><div className="mt-5 flex items-center gap-3"><div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[hsl(var(--muted))]"><div className="progress-sheen h-full rounded-full" style={{ width: `${Math.min(100, subjectAccuracy)}%`, backgroundColor: subject.color }} /></div><span className="mono text-[10px] text-[hsl(var(--muted-foreground))]">{item?.answered || 0} done</span></div></Link>;
          })}
        </div></div>
        <aside className="rounded-2xl bg-[hsl(var(--primary))] p-6 text-[hsl(var(--primary-foreground))] ink-shadow"><div className="flex items-center justify-between"><Trophy size={22} className="text-[hsl(var(--secondary))]" /><span className="mono text-[10px] uppercase tracking-[.16em] opacity-60">desk rule</span></div><h2 className="display mt-12 text-3xl leading-tight">Clarity before<br />completion.</h2><p className="mt-4 text-sm leading-6 opacity-75">Don’t rush through a chapter to tick it off. Explain one idea in your own words — that is the real progress bar.</p><Link href="/subject/science" data-testid="link-desk-rule" className="focus-ring mt-7 inline-flex items-center gap-2 text-sm font-bold text-[hsl(var(--secondary))]">Try a science chapter <ArrowRight size={15} /></Link></aside>
      </section>
      <section className="mt-10 rounded-2xl border border-[hsl(var(--card-border))] bg-[hsl(var(--card))] p-6 sm:p-8"><div className="flex flex-wrap items-start justify-between gap-4"><div><p className="mono text-[10px] uppercase tracking-[.18em] text-[hsl(var(--muted-foreground))]">A tiny plan for tonight</p><h2 className="display mt-1 text-2xl">The 20-minute loop</h2></div><span className="rounded-full bg-[hsl(var(--secondary)/.2)] px-3 py-1 text-xs font-semibold text-[hsl(var(--foreground))]">low friction / high recall</span></div><div className="mt-7 grid gap-6 md:grid-cols-3">{[['01', 'Read the map', 'Scan a chapter summary and name the one thing it is really about.'], ['02', 'Test the edges', 'Answer five questions without looking back. Wrong answers are useful clues.'], ['03', 'Leave a mark', 'Write a one-line takeaway. Future-you will thank tonight-you.']].map(([number, title, text]) => <div className="flex gap-4" key={number}><span className="mono text-sm text-[hsl(var(--accent))]">{number}</span><div><h3 className="text-sm font-bold">{title}</h3><p className="mt-1 text-xs leading-5 text-[hsl(var(--muted-foreground))]">{text}</p></div></div>)}</div></section>
    </div>
  );
}

function EmptyState({ title, text }: { title: string; text: string }) {
  return <div className="mx-auto flex min-h-[65vh] max-w-xl flex-col items-center justify-center px-6 text-center"><div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-[hsl(var(--secondary)/.25)] text-[hsl(var(--primary))]"><CircleHelp size={27} /></div><h1 className="display text-4xl">{title}</h1><p className="mt-3 text-sm leading-6 text-[hsl(var(--muted-foreground))]">{text}</p><Link href="/" data-testid="link-empty-home" className="focus-ring mt-6 inline-flex items-center gap-2 rounded-xl bg-[hsl(var(--primary))] px-4 py-3 text-sm font-bold text-[hsl(var(--primary-foreground))]">Back to study desk <ArrowRight size={16} /></Link></div>;
}

function SubjectPage() {
  const params = useParams<{ slug: string }>();
  const subject = subjects.find((item) => item.slug === params.slug);
  const [query, setQuery] = useState('');
  const [selectedChapter, setSelectedChapter] = useState('All chapters');
  if (!subject) return <EmptyState title="That shelf is empty." text="We could not find this subject in the Class 9 desk. Pick another route and keep your study streak intact." />;
  const filtered = subject.chapters.filter((chapter) => chapter.toLowerCase().includes(query.toLowerCase()) && (selectedChapter === 'All chapters' || chapter === selectedChapter));
  const summaryLead = subject.slug === 'mathematics'
    ? 'Name the objects, write the rule, and test it with one clean example.'
    : subject.slug === 'hindi'
      ? 'Listen for the writer’s voice, then connect the image, feeling, and idea.'
      : subject.slug === 'english'
        ? 'Notice the choice of words, the speaker’s point of view, and what changes by the end.'
        : subject.slug === 'science'
          ? 'Start with the observation, trace the mechanism, and keep the evidence visible.'
          : 'Place the event or idea on a map of people, power, place, and consequence.';
  return <div className="mx-auto max-w-7xl px-5 py-8 md:px-10 md:py-12">
    <div className="flex flex-wrap items-start justify-between gap-6 reveal"><div className="flex gap-4"><span style={{ backgroundColor: subject.tint, color: subject.color }} className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-lg font-bold">{subject.title.slice(0, 2)}</span><div><Link href="/" data-testid="link-subject-back" className="focus-ring mono text-[10px] uppercase tracking-[.15em] text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--primary))]">Study desk / subjects</Link><h1 className="display mt-2 text-4xl leading-none sm:text-5xl">{subject.name}</h1><p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">{subject.title}</p></div></div><Link href={`/quiz/${subject.slug}`} data-testid={`link-start-quiz-${subject.slug}`} className="focus-ring inline-flex items-center gap-2 rounded-xl bg-[hsl(var(--primary))] px-4 py-3 text-sm font-bold text-[hsl(var(--primary-foreground))] transition-transform hover:-translate-y-0.5">Practice 20 questions <ArrowRight size={16} /></Link></div>
    <div className="mt-10 grid gap-6 lg:grid-cols-[1.1fr_.9fr]"><section className="rounded-2xl bg-[hsl(var(--primary))] p-7 text-[hsl(var(--primary-foreground))] sm:p-9"><p className="mono text-[10px] uppercase tracking-[.18em] text-[hsl(var(--secondary))]">subject note</p><h2 className="display mt-7 max-w-lg text-3xl leading-tight sm:text-4xl">{subject.blurb}</h2><p className="mt-6 max-w-lg text-sm leading-6 opacity-75">These notes are your first pass — a clean map before the textbook’s details. Read one card, close it, and say the idea out loud.</p><div className="mt-8 flex items-center gap-2 text-xs font-semibold"><span className="h-2 w-2 rounded-full bg-[hsl(var(--secondary))]" /> {subject.chapters.length} chapter maps <span className="mx-1 opacity-40">·</span> 80 question bank</div></section><section className="paper-grid rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-7 sm:p-9"><div className="flex items-center justify-between"><p className="mono text-[10px] uppercase tracking-[.18em] text-[hsl(var(--muted-foreground))]">quick clarity</p><Sparkles size={18} className="text-[hsl(var(--accent))]" /></div><div className="mt-8 space-y-5"><div className="border-l-2 border-[hsl(var(--secondary))] pl-4"><p className="text-xs font-bold">How to use this page</p><p className="mt-1 text-xs leading-5 text-[hsl(var(--muted-foreground))]">Search a chapter, read its three-line map, then jump straight into practice.</p></div><div className="border-l-2 border-[hsl(var(--accent))] pl-4"><p className="text-xs font-bold">A useful pause</p><p className="mt-1 text-xs leading-5 text-[hsl(var(--muted-foreground))]">If an answer feels familiar but fuzzy, mark it by trying a question — recall is the check.</p></div></div></section></div>
     <section className="mt-11"><div className="flex flex-wrap items-end justify-between gap-4"><div><p className="mono text-[10px] uppercase tracking-[.18em] text-[hsl(var(--muted-foreground))]">chapter index</p><h2 className="display mt-1 text-3xl">Find your foothold</h2></div><div className="flex w-full gap-2 sm:w-auto"><label className="relative flex min-w-0 flex-1 items-center sm:w-60"><Search size={15} className="absolute left-3 text-[hsl(var(--muted-foreground))]" /><input value={query} onChange={(event) => setQuery(event.target.value)} data-testid="input-chapter-search" aria-label="Search chapters" placeholder="Search chapters" className="focus-ring h-10 w-full rounded-xl border border-[hsl(var(--input))] bg-[hsl(var(--card))] pl-9 pr-3 text-sm outline-none placeholder:text-[hsl(var(--muted-foreground))]" /></label><div className="relative"><Filter size={14} className="pointer-events-none absolute left-3 top-3 text-[hsl(var(--muted-foreground))]" /><select value={selectedChapter} onChange={(event) => setSelectedChapter(event.target.value)} data-testid="select-chapter-filter" aria-label="Filter chapters" className="focus-ring h-10 max-w-36 appearance-none rounded-xl border border-[hsl(var(--input))] bg-[hsl(var(--card))] pl-8 pr-3 text-xs outline-none"><option>All chapters</option>{subject.chapters.map((chapter) => <option key={chapter}>{chapter}</option>)}</select></div></div></div><div className="mt-5 grid gap-3">{filtered.map((chapter, index) => <article key={chapter} data-testid={`card-chapter-${subject.slug}-${index}`} className="group rounded-2xl border border-[hsl(var(--card-border))] bg-[hsl(var(--card))] p-5 transition-all duration-200 hover:border-[hsl(var(--primary)/.35)] hover:soft-shadow sm:p-6"><div className="flex gap-4"><span className="mono pt-1 text-xs text-[hsl(var(--accent))]">{String(subject.chapters.indexOf(chapter) + 1).padStart(2, '0')}</span><div className="min-w-0 flex-1"><div className="flex flex-wrap items-start justify-between gap-2"><h3 className="font-bold">{chapter}</h3><span className="rounded-full bg-[hsl(var(--muted))] px-2.5 py-1 text-[10px] text-[hsl(var(--muted-foreground))]">chapter map</span></div><p className="mt-2 max-w-3xl text-sm leading-6 text-[hsl(var(--muted-foreground))]">{summaryLead} For <strong className="font-semibold text-[hsl(var(--foreground))]">{chapter}</strong>, build one small example, explain why it works, and keep one question open for practice.</p><Link href={`/quiz/${subject.slug}`} data-testid={`link-chapter-practice-${subject.slug}-${index}`} className="focus-ring mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-[hsl(var(--primary))] opacity-80 transition-opacity group-hover:opacity-100">Practice this subject <ChevronRight size={14} /></Link></div></div></article>)}</div>{filtered.length === 0 && <div className="mt-5 rounded-2xl border border-dashed border-[hsl(var(--border))] p-10 text-center"><p className="font-semibold">No chapter found.</p><p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">Try a shorter search or return to all chapters.</p><button onClick={() => { setQuery(''); setSelectedChapter('All chapters'); }} data-testid="button-clear-chapter-filter" className="focus-ring mt-4 text-xs font-bold text-[hsl(var(--primary))]">Clear filters</button></div>}</section>
  </div>;
}

function QuizPage() {
  const params = useParams<{ slug: string }>();
  const subject = subjects.find((item) => item.slug === params.slug);
  const [, setLocation] = useLocation();
  const questions = useMemo(() => subject ? buildQuestions(subject).slice(0, 20) : [], [subject]);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [saved, setSaved] = useState(false);
  if (!subject) return <EmptyState title="Quiz not found." text="This question set wandered off the desk. Head back and choose a subject to practise." />;
  const question = questions[current];
  const choose = (option: number) => { if (selected === null) setSelected(option); };
  const next = () => {
    if (selected === null) return;
    const correct = selected === question.answerIndex;
    recordAnswer(subject.slug, correct);
    if (correct) setScore((value) => value + 1);
    if (current === questions.length - 1) { const finalScore = score + (correct ? 1 : 0); recordScore(subject.slug, finalScore, questions.length); setSaved(true); setFinished(true); } else { setCurrent((value) => value + 1); setSelected(null); }
  };
  if (finished) {
    const percentage = Math.round((score / questions.length) * 100);
    return <div className="mx-auto max-w-3xl px-5 py-10 md:px-10 md:py-16"><div className="paper-grid rounded-[1.7rem] border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-7 text-center sm:p-12 reveal"><div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[hsl(var(--secondary))] text-[hsl(var(--foreground))] ink-shadow"><Trophy size={30} /></div><p className="mono mt-7 text-[10px] uppercase tracking-[.2em] text-[hsl(var(--primary))]">session complete · {saved ? 'saved to your desk' : 'saving'}</p><h1 className="display mt-3 text-5xl">{score} <span className="text-[hsl(var(--muted-foreground)/.45)]">/ {questions.length}</span></h1><p className="mt-3 text-sm text-[hsl(var(--muted-foreground))]">{percentage >= 80 ? 'That idea is sticking. Keep the momentum gentle.' : percentage >= 50 ? 'Good base. The misses are your next revision list.' : 'You found the edges. A reread will make the next round easier.'}</p><div className="mx-auto mt-8 max-w-sm"><div className="mb-2 flex justify-between text-xs"><span>recall score</span><span className="mono">{percentage}%</span></div><div className="h-3 overflow-hidden rounded-full bg-[hsl(var(--muted))]"><div className="h-full rounded-full bg-[hsl(var(--primary))] transition-all duration-700" style={{ width: `${percentage}%` }} /></div></div><div className="mt-9 flex flex-wrap justify-center gap-3"><button onClick={() => { setCurrent(0); setSelected(null); setScore(0); setFinished(false); setSaved(false); }} data-testid="button-retry-quiz" className="focus-ring inline-flex items-center gap-2 rounded-xl bg-[hsl(var(--primary))] px-4 py-3 text-sm font-bold text-[hsl(var(--primary-foreground))]"><RotateCcw size={16} /> Try again</button><Link href={`/subject/${subject.slug}`} data-testid="link-quiz-subject" className="focus-ring inline-flex items-center gap-2 rounded-xl border border-[hsl(var(--border))] px-4 py-3 text-sm font-bold">Back to {subject.name}</Link></div></div></div>;
  }
  return <div className="mx-auto max-w-4xl px-5 py-8 md:px-10 md:py-12"><div className="flex items-center justify-between"><button onClick={() => setLocation(`/subject/${subject.slug}`)} data-testid="button-exit-quiz" className="focus-ring inline-flex items-center gap-1 text-xs font-bold text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--primary))]"><ChevronLeft size={15} /> Exit practice</button><span className="mono text-[10px] uppercase tracking-[.15em] text-[hsl(var(--muted-foreground))]">80 question bank</span></div><div className="mt-8 flex items-end justify-between gap-4"><div><p style={{ color: subject.color }} className="mono text-[10px] uppercase tracking-[.18em]">{subject.name} · quick practice</p><h1 className="display mt-2 text-4xl sm:text-5xl">Show what stayed.</h1></div><span className="mono text-sm">{String(current + 1).padStart(2, '0')} <span className="text-[hsl(var(--muted-foreground))]">/ {questions.length}</span></span></div><div className="mt-6 flex gap-1.5">{questions.map((item, index) => <span key={item.id} className={`h-1.5 flex-1 rounded-full ${index < current ? 'bg-[hsl(var(--primary))]' : index === current ? 'bg-[hsl(var(--secondary))]' : 'bg-[hsl(var(--muted))]'}`} />)}</div><section className="mt-8 rounded-[1.5rem] border border-[hsl(var(--card-border))] bg-[hsl(var(--card))] p-6 soft-shadow sm:p-10"><div className="flex items-center gap-2 text-xs text-[hsl(var(--muted-foreground))]"><BookOpen size={14} /> {question.chapter}</div><h2 className="mt-8 max-w-2xl text-xl font-bold leading-8 sm:text-2xl">{question.prompt}</h2><div className="mt-8 grid gap-3">{question.options.map((option, index) => { const isCorrect = selected !== null && index === question.answerIndex; const isWrong = selected === index && !isCorrect; return <button key={option} onClick={() => choose(index)} data-testid={`button-answer-${current}-${index}`} aria-pressed={selected === index} className={`focus-ring flex w-full items-center gap-3 rounded-xl border p-4 text-left text-sm transition-all duration-200 ${isCorrect ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary)/.1)]' : isWrong ? 'border-[hsl(var(--destructive))] bg-[hsl(var(--destructive)/.08)]' : selected !== null ? 'opacity-60' : 'hover:-translate-y-0.5 hover:border-[hsl(var(--primary)/.45)] hover:bg-[hsl(var(--muted)/.6)]'}`}><span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border text-xs font-bold ${isCorrect ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]' : isWrong ? 'border-[hsl(var(--destructive))] text-[hsl(var(--destructive))]' : 'border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))]'}`}>{isCorrect ? <Check size={14} /> : String.fromCharCode(65 + index)}</span><span>{option}</span></button>; })}</div>{selected !== null && <div className={`mt-6 flex items-start gap-3 rounded-xl p-4 text-sm ${selected === question.answerIndex ? 'bg-[hsl(var(--primary)/.1)] text-[hsl(var(--primary))]' : 'bg-[hsl(var(--accent)/.12)] text-[hsl(var(--foreground))]'}`}><CircleHelp size={17} className="mt-0.5 shrink-0" /><p><strong>{selected === question.answerIndex ? 'Good catch.' : 'Not quite.'}</strong> {selected === question.answerIndex ? 'That connection is on the right track.' : `The clearest answer is “${question.answer}”. Keep it on your next revision pass.`}</p></div>}<div className="mt-8 flex justify-end"><button onClick={next} disabled={selected === null} data-testid="button-next-question" className="focus-ring inline-flex items-center gap-2 rounded-xl bg-[hsl(var(--primary))] px-5 py-3 text-sm font-bold text-[hsl(var(--primary-foreground))] transition-all hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40">{current === questions.length - 1 ? 'See my score' : 'Next question'} <ChevronRight size={16} /></button></div></section></div>;
}

function CalculatorPage() {
  const [expression, setExpression] = useState('');
  const [result, setResult] = useState('');
  const keys = [['C', '⌫', '%', '÷'], ['7', '8', '9', '×'], ['4', '5', '6', '−'], ['1', '2', '3', '+'], ['0', '.', '(', ')']];
  const press = (key: string) => {
    if (key === 'C') { setExpression(''); setResult(''); return; }
    if (key === '⌫') { setExpression((value) => value.slice(0, -1)); setResult(''); return; }
    if (key === '=') { calculate(); return; }
    setExpression((value) => value + ({ '×': '*', '÷': '/', '−': '-' }[key] || key)); setResult('');
  };
  const calculate = () => {
    if (!expression || !/^[0-9+\-*/().% ]+$/.test(expression)) return;
    try { const value = Function(`"use strict"; return (${expression})`)(); if (Number.isFinite(value)) setResult(String(Math.round(value * 100000) / 100000)); } catch { setResult('Check the expression'); }
  };
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => { if (/^[0-9.+\-*/%()]$/.test(event.key)) press(event.key); else if (event.key === 'Enter' || event.key === '=') calculate(); else if (event.key === 'Backspace') press('⌫'); else if (event.key === 'Escape') press('C'); };
    window.addEventListener('keydown', onKey); return () => window.removeEventListener('keydown', onKey);
  });
  return <div className="mx-auto max-w-5xl px-5 py-8 md:px-10 md:py-12"><div className="reveal"><p className="mono text-[10px] uppercase tracking-[.18em] text-[hsl(var(--primary))]">math tool / no distractions</p><h1 className="display mt-2 text-5xl">The scratchpad.</h1><p className="mt-3 max-w-md text-sm leading-6 text-[hsl(var(--muted-foreground))]">A quiet calculator for checking the final step — not skipping the thinking before it.</p></div><div className="mt-10 grid gap-7 lg:grid-cols-[minmax(0,430px)_1fr]"><section className="rounded-[1.5rem] bg-[hsl(var(--primary))] p-4 text-[hsl(var(--primary-foreground))] ink-shadow sm:p-5"><div className="rounded-xl bg-[hsl(var(--sidebar))] p-5 text-right"><p className="mono min-h-6 break-all text-sm text-[hsl(var(--sidebar-foreground)/.55)]">{expression || '0'}</p><p data-testid="text-calculator-result" className="display mt-3 min-h-12 break-all text-4xl text-[hsl(var(--sidebar-foreground))]">{result || ' '}</p></div><div className="mt-4 grid grid-cols-4 gap-2">{keys.flat().map((key) => <button key={key} onClick={() => press(key)} data-testid={`button-calculator-${key}`} className={`focus-ring flex h-12 items-center justify-center rounded-xl text-sm font-bold transition-transform hover:-translate-y-0.5 ${['C', '⌫', '%', '÷', '×', '−', '+'].includes(key) ? 'bg-[hsl(var(--secondary)/.92)] text-[hsl(var(--foreground))]' : 'bg-[hsl(var(--sidebar-accent))] text-[hsl(var(--sidebar-foreground))]'}`}>{key === '⌫' ? <Delete size={17} /> : key}</button>)}<button onClick={() => press('=')} data-testid="button-calculator-equals" className="focus-ring col-span-4 flex h-12 items-center justify-center rounded-xl bg-[hsl(var(--accent))] text-sm font-bold text-[hsl(var(--accent-foreground))] transition-transform hover:-translate-y-0.5">= <span className="ml-2 text-xs opacity-70">enter</span></button></div></section><section className="paper-grid rounded-[1.5rem] border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-7 sm:p-9"><div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[hsl(var(--secondary)/.3)]"><CalculatorIcon size={19} /></div><div><h2 className="font-bold">Use it like a rough page</h2><p className="text-xs text-[hsl(var(--muted-foreground))]">Keyboard friendly · result stays local</p></div></div><div className="mt-9 space-y-6 text-sm"><div className="flex gap-4"><span className="mono text-xs text-[hsl(var(--accent))]">01</span><p className="leading-6">Write the formula yourself first. Use this to verify, not replace, the reasoning.</p></div><div className="flex gap-4"><span className="mono text-xs text-[hsl(var(--accent))]">02</span><p className="leading-6">Use brackets for the order you mean: <code className="rounded bg-[hsl(var(--muted))] px-1.5 py-0.5 text-xs">2 × (3 + 4)</code>.</p></div><div className="flex gap-4"><span className="mono text-xs text-[hsl(var(--accent))]">03</span><p className="leading-6">Check units and signs before you copy an answer into your notebook.</p></div></div><div className="mt-10 border-t border-[hsl(var(--border))] pt-5 text-xs text-[hsl(var(--muted-foreground))]"><span className="font-bold text-[hsl(var(--foreground))]">Shortcuts:</span> numbers, + − × /, brackets, Enter, Backspace, Escape</div></section></div></div>;
}

function AboutPage() {
  return <div className="mx-auto max-w-6xl px-5 py-8 md:px-10 md:py-12"><div className="max-w-3xl reveal"><p className="mono text-[10px] uppercase tracking-[.18em] text-[hsl(var(--primary))]">a note about the desk</p><h1 className="display mt-3 text-5xl leading-[.95] sm:text-7xl">The syllabus,<br /><em className="text-[hsl(var(--primary))]">made less loud.</em></h1><p className="mt-6 max-w-xl text-base leading-7 text-[hsl(var(--muted-foreground))]">Padhai desk is a local-first study companion for Class 9 NCERT — built for the ten minutes before dinner, the bus ride home, and the evening when a chapter refuses to make sense.</p></div><div className="mt-12 grid gap-6 lg:grid-cols-[1fr_1.2fr]"><section className="rounded-2xl bg-[hsl(var(--primary))] p-7 text-[hsl(var(--primary-foreground))] sm:p-9"><p className="mono text-[10px] uppercase tracking-[.18em] text-[hsl(var(--secondary))]">what is inside</p><div className="mt-8 space-y-6">{[['05', 'subject shelves', 'The five NCERT subject worlds, each with a chapter map.'], ['80', 'questions per subject', 'Small, selectable checks that turn reading into recall.'], ['01', 'private progress trail', 'Your answers stay in this browser, so the desk remembers you.']].map(([number, title, copy]) => <div className="flex items-start gap-4" key={title}><span className="display text-3xl text-[hsl(var(--secondary))]">{number}</span><div><h2 className="font-bold">{title}</h2><p className="mt-1 text-sm leading-5 opacity-70">{copy}</p></div></div>)}</div></section><section className="rounded-2xl border border-[hsl(var(--card-border))] bg-[hsl(var(--card))] p-7 sm:p-9"><div className="flex items-center justify-between"><h2 className="display text-3xl">Syllabus shelf</h2><BookOpen size={20} className="text-[hsl(var(--accent))]" /></div><div className="mt-6 divide-y divide-[hsl(var(--border))]">{subjects.map((subject) => <Link href={`/subject/${subject.slug}`} data-testid={`link-about-${subject.slug}`} key={subject.slug} className="focus-ring group flex items-center gap-4 py-4"><span style={{ backgroundColor: subject.tint, color: subject.color }} className="flex h-9 w-9 items-center justify-center rounded-lg text-xs font-bold">{subject.title.slice(0, 2)}</span><span className="flex-1"><strong className="block text-sm">{subject.name}</strong><span className="text-xs text-[hsl(var(--muted-foreground))]">{subject.title} · {subject.chapters.length} chapter maps</span></span><ChevronRight size={16} className="text-[hsl(var(--muted-foreground))] transition-transform group-hover:translate-x-1" /></Link>)}</div></section></div><section className="mt-10 grid gap-4 sm:grid-cols-3">{[['Local-first', 'No account, no feed, no noise. Progress is stored in your browser.'], ['Recall-led', 'Read a short map, then ask your memory to do the work.'], ['NCERT-minded', 'A companion layer for the syllabus — never a replacement for your textbook.']].map(([title, copy]) => <div key={title} className="rounded-2xl border border-[hsl(var(--card-border))] bg-[hsl(var(--card))] p-5"><p className="text-sm font-bold">{title}</p><p className="mt-2 text-xs leading-5 text-[hsl(var(--muted-foreground))]">{copy}</p></div>)}</section></div>;
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

function Router() {
  return <RoutedErrorBoundary><Shell><Switch><Route path="/" component={Dashboard} /><Route path="/subject/:slug" component={SubjectPage} /><Route path="/quiz/:slug" component={QuizPage} /><Route path="/calculator" component={CalculatorPage} /><Route path="/about" component={AboutPage} /><Route component={() => <EmptyState title="Page not on this desk." text="This route does not belong to the Class 9 study companion." />} /></Switch></Shell></RoutedErrorBoundary>;
}

function App() {
  return <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}><Router /></WouterRouter>;
}

export default App;