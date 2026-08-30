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
type QuestionAnswer = { question: string; answer: string };
type ChapterDetail = {
  topics: string[];
  summary: string;
  notes: string[];
  qa: QuestionAnswer[];
  extraQa: QuestionAnswer[];
};

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
    chapters: ['Understanding Social Science', 'Shaping of the Earth’s Surface', 'Atmosphere and Climate', 'Early Humans and Beginning of Civilisation', 'State and Society up to 1000 CE', 'Democracy', 'Elections', 'Building Blocks in Economics: The Problem of Choice', 'The Price Puzzle: What Drives the Market'],
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

const socialScienceChapterDetails: Record<string, ChapterDetail> = {
  'Understanding Social Science': {
    topics: ['Meaning and scope of social science', 'Interdisciplinary thinking', 'Sources and evidence', 'Responsible citizenship'],
    summary: 'Social science helps us understand people, communities, institutions, places, economies, and the choices that shape public life. It connects history, geography, political science, and economics instead of treating them as isolated subjects.',
    notes: ['History studies change over time and uses evidence to explain the past.', 'Geography connects people, places, resources, and the physical environment.', 'Political science examines power, government, rights, and participation.', 'Economics studies choices made when resources and wants do not match.'],
    qa: [
      { question: 'Why is social science called an interconnected field?', answer: 'Because real-life issues involve time, place, society, government, and resources together, so more than one discipline helps explain them.' },
      { question: 'What is the role of evidence in social science?', answer: 'Evidence helps us support interpretations, compare viewpoints, and avoid treating an unsupported opinion as a fact.' },
      { question: 'How can a student practise responsible citizenship?', answer: 'By asking informed questions, respecting diversity, understanding rights and duties, and taking part in community life.' },
    ],
    extraQa: [
      { question: 'Give one example of a question that needs more than one social science subject.', answer: 'Understanding migration needs geography for movement and place, economics for work, history for causes, and political science for policies.' },
      { question: 'What is the difference between a fact and an interpretation?', answer: 'A fact is supported information or an observation; an interpretation is a reasoned explanation built from facts.' },
    ],
  },
  'Shaping of the Earth’s Surface': {
    topics: ['Interior and structure of Earth', 'Rocks and minerals', 'Plate movement', 'Landforms and processes'],
    summary: 'Earth’s surface is continually shaped by forces inside the planet and processes acting on its surface. Mountains, plateaus, plains, valleys, and coasts record the long interaction of tectonic activity, weathering, erosion, and deposition.',
    notes: ['Internal forces can uplift, fold, fault, or break the crust.', 'Weathering breaks rocks in place while erosion carries material away.', 'Rivers, glaciers, wind, and sea waves create and modify landforms.', 'Landforms influence settlement, farming, transport, and natural hazards.'],
    qa: [
      { question: 'What are endogenic forces?', answer: 'They are forces originating inside Earth, such as tectonic movements, earthquakes, and volcanism, that build or deform the crust.' },
      { question: 'How is erosion different from weathering?', answer: 'Weathering breaks rock at its original location; erosion transports the broken material through agents such as water, wind, or ice.' },
      { question: 'Why are landforms important to society?', answer: 'They affect soil, water, transport, settlement patterns, livelihoods, and the risks people face from natural processes.' },
    ],
    extraQa: [
      { question: 'How do rivers shape a valley?', answer: 'Running water cuts, transports, and deposits material; over time this deepens or widens the valley and builds features such as floodplains.' },
      { question: 'What is a plate boundary?', answer: 'It is a zone where tectonic plates meet, move apart, move together, or slide past one another.' },
    ],
  },
  'Atmosphere and Climate': {
    topics: ['Layers and composition of atmosphere', 'Weather and climate', 'Heat and pressure', 'Winds and rainfall'],
    summary: 'The atmosphere is the envelope of gases around Earth. Weather describes short-term conditions, while climate is the long-term pattern created by latitude, altitude, pressure, winds, distance from the sea, and relief.',
    notes: ['The atmosphere supplies gases needed for life and protects Earth from harmful radiation.', 'Unequal heating creates differences in air pressure and drives winds.', 'Humidity, condensation, clouds, and uplift are connected to rainfall.', 'Climate influences crops, clothing, homes, occupations, and daily life.'],
    qa: [
      { question: 'What is the difference between weather and climate?', answer: 'Weather is the condition of the atmosphere at a particular time and place; climate is the average pattern observed over a long period.' },
      { question: 'Why does air move from one place to another?', answer: 'Air moves because unequal heating creates pressure differences; it generally flows from high-pressure areas toward low-pressure areas.' },
      { question: 'What causes rainfall?', answer: 'Moist air rises, cools, condenses into droplets, and falls when the droplets become heavy enough.' },
    ],
    extraQa: [
      { question: 'Why do coastal areas usually have a moderate climate?', answer: 'Water heats and cools more slowly than land, so the nearby sea reduces extreme temperature changes.' },
      { question: 'How does altitude affect temperature?', answer: 'Temperature generally decreases as altitude increases because the air is thinner and holds less heat.' },
    ],
  },
  'Early Humans and Beginning of Civilisation': {
    topics: ['Hunter-gatherer life', 'Stone tools and fire', 'Farming and settled life', 'Early cities and exchange'],
    summary: 'Human communities changed gradually from mobile hunter-gatherer groups to settled farming societies. Tool-making, controlled use of fire, domestication, surplus production, and cooperation helped create villages, crafts, trade, and early cities.',
    notes: ['Archaeologists use tools, bones, pottery, settlements, and plant remains as evidence.', 'The shift to food production did not happen everywhere at the same time.', 'Surplus food supported specialised work such as craft, trade, and administration.', 'Early civilisations depended on cooperation, water management, and shared rules.'],
    qa: [
      { question: 'Why was the control of fire important for early humans?', answer: 'Fire provided warmth, protection, light, cooked food, and a way to process some materials, improving survival and cooperation.' },
      { question: 'What changed when humans began farming?', answer: 'Many groups became more settled, domesticated plants and animals, stored food, and developed new forms of work and community organisation.' },
      { question: 'What evidence helps historians study early humans?', answer: 'Material evidence such as tools, fossils, hearths, pottery, burials, buildings, and food remains helps reconstruct their lives.' },
    ],
    extraQa: [
      { question: 'Why did settled communities need cooperation?', answer: 'Farming, irrigation, storage, building, protection, and sharing resources required people to coordinate their work and decisions.' },
      { question: 'What is an archaeological site?', answer: 'It is a place where remains of past human activity are found and studied systematically.' },
    ],
  },
  'State and Society up to 1000 CE': {
    topics: ['Early states and kingdoms', 'Governance and social groups', 'Trade and cultural exchange', 'Sources of the period'],
    summary: 'Up to 1000 CE, many regions of the Indian subcontinent saw changing states, kingdoms, communities, trade networks, and cultural traditions. Political authority interacted with local societies rather than existing separately from them.',
    notes: ['Inscriptions, coins, texts, monuments, and archaeology are important sources.', 'States depended on relationships among rulers, local communities, farmers, craft workers, and traders.', 'Trade and travel carried goods, ideas, languages, and religious practices across regions.', 'Historical explanations should recognise both continuity and change.'],
    qa: [
      { question: 'Why do historians use multiple sources for early Indian history?', answer: 'Each source reveals different details and has limits; comparing them makes an explanation more reliable and balanced.' },
      { question: 'How did trade influence society?', answer: 'Trade connected regions, supported towns and crafts, moved wealth, and helped ideas, technologies, and cultural practices travel.' },
      { question: 'What is meant by state and society being connected?', answer: 'Government and political authority depended on communities and resources, while society was affected by laws, taxes, protection, and public works.' },
    ],
    extraQa: [
      { question: 'What can coins tell us about the past?', answer: 'They can provide clues about rulers, symbols, trade, metals, economic activity, and the areas where they circulated.' },
      { question: 'Why should we avoid judging the past only by present-day standards?', answer: 'Past societies had different conditions and ideas; careful history explains context before evaluating change.' },
    ],
  },
  Democracy: {
    topics: ['Meaning of democracy', 'Rights and equality', 'Institutions and accountability', 'Participation and challenges'],
    summary: 'Democracy is a form of government in which people are treated as equal citizens and have a meaningful role in choosing, questioning, and changing those who exercise public power.',
    notes: ['Democracy requires more than voting; it also needs rights, discussion, information, and accountability.', 'Constitutional rules limit power and protect citizens from arbitrary action.', 'Institutions help convert public choices into decisions and policies.', 'A healthy democracy keeps working to include voices that are often ignored.'],
    qa: [
      { question: 'What is the basic idea of democracy?', answer: 'The basic idea is that public power is exercised with the consent and participation of citizens who have equal political status.' },
      { question: 'Why are rights important in a democracy?', answer: 'Rights protect dignity and freedom, allow people to participate, and place limits on the misuse of power.' },
      { question: 'How are democratic governments held accountable?', answer: 'Through elections, legislatures, courts, media, public debate, citizen action, and constitutional checks.' },
    ],
    extraQa: [
      { question: 'Is majority rule alone enough for democracy?', answer: 'No. Majority decisions must also respect rights, constitutional limits, and the equal dignity of minorities.' },
      { question: 'What makes participation meaningful?', answer: 'People need access to information, freedom to speak and organise, equal opportunity, and a genuine possibility of influencing decisions.' },
    ],
  },
  Elections: {
    topics: ['Purpose of elections', 'Constituencies and representation', 'Campaigns and choices', 'Fairness and participation'],
    summary: 'Elections give citizens a regular way to choose representatives and review public performance. Fair elections need clear rules, genuine alternatives, secret ballots, equal opportunity, and informed participation.',
    notes: ['A constituency is an area whose voters choose a representative.', 'An election is meaningful when voters can choose among real alternatives.', 'Campaigns communicate policies and also require limits against intimidation and unfair influence.', 'Participation includes registering, learning about choices, voting, and holding representatives accountable.'],
    qa: [
      { question: 'Why are elections necessary in a representative democracy?', answer: 'They allow citizens to choose representatives, replace them peacefully, and give public approval or disapproval to competing programmes.' },
      { question: 'What is a constituency?', answer: 'It is a defined area or group of voters represented by an elected member.' },
      { question: 'What makes an election free and fair?', answer: 'All eligible voters should have equal value, genuine choices, secret voting, impartial rules, and freedom from coercion.' },
    ],
    extraQa: [
      { question: 'Why is a secret ballot important?', answer: 'It protects voters from pressure and allows them to make a choice privately.' },
      { question: 'How can citizens evaluate candidates?', answer: 'They can compare records, promises, qualifications, public issues, and reliable information instead of relying only on slogans.' },
    ],
  },
  'Building Blocks in Economics: The Problem of Choice': {
    topics: ['Scarcity and wants', 'Opportunity cost', 'Resources and production', 'Economic decision-making'],
    summary: 'Economics begins with the problem of choice: human wants are many, but time, money, skills, land, and other resources are limited. Every choice has a cost because choosing one option means giving up another.',
    notes: ['Scarcity means resources are limited in relation to wants.', 'Opportunity cost is the next best alternative given up when a choice is made.', 'Land, labour, physical capital, and human capital support production.', 'Good decisions compare benefits, costs, needs, and long-term effects.'],
    qa: [
      { question: 'Why do people have to make economic choices?', answer: 'Because resources such as time, income, land, and skills are limited while wants and possible uses are numerous.' },
      { question: 'What is opportunity cost?', answer: 'It is the value of the next best alternative that is sacrificed when a decision is made.' },
      { question: 'Why is human capital important?', answer: 'Education, health, and skills improve people’s ability to work, create value, and make informed decisions.' },
    ],
    extraQa: [
      { question: 'Can a free item have an opportunity cost?', answer: 'Yes. Even if no money is paid, time, effort, or another possible use of the resource may be given up.' },
      { question: 'What is the difference between a need and a want?', answer: 'A need is essential for basic well-being, while a want is something desirable but not necessary for survival.' },
    ],
  },
  'The Price Puzzle: What Drives the Market': {
    topics: ['Demand and supply', 'Price signals', 'Markets and exchange', 'Consumers and producers'],
    summary: 'Prices in a market are influenced by the interaction of demand and supply. They act as signals that affect what consumers buy, what producers offer, and how scarce resources are directed.',
    notes: ['Demand describes how much buyers are willing and able to purchase at different prices.', 'Supply describes how much sellers are willing and able to offer.', 'A change in income, taste, technology, or input cost can shift market conditions.', 'Markets work within rules that protect fairness, safety, information, and public interest.'],
    qa: [
      { question: 'What is demand?', answer: 'Demand is the quantity of a good or service that consumers are willing and able to buy at different prices during a given period.' },
      { question: 'How does price act as a signal?', answer: 'A rising price can signal scarcity or strong demand and encourage producers to supply more, while also making consumers reconsider purchases.' },
      { question: 'Why do markets need rules?', answer: 'Rules help prevent fraud and exploitation, protect consumers and workers, and address harms that private exchange alone may not solve.' },
    ],
    extraQa: [
      { question: 'What can happen when supply falls but demand stays the same?', answer: 'The good may become scarcer and its price may rise, encouraging conservation or additional production.' },
      { question: 'Why is information important to consumers?', answer: 'Reliable information helps consumers compare quality, price, safety, and value before making a choice.' },
    ],
  },
};

const topicBanks: Record<string, string[][]> = {
  mathematics: [
    ['Rational and irrational numbers', 'Real number line', 'Laws of exponents', 'Rationalisation'],
    ['Terms and coefficients', 'Degree of a polynomial', 'Identities', 'Factorisation'],
    ['Cartesian plane', 'Coordinates and quadrants', 'Plotting points', 'Reading graphs'],
    ['Linear equations', 'Solutions and ordered pairs', 'Graphical representation', 'Real-life situations'],
    ['Basic angle facts', 'Parallel lines', 'Transversal relationships', 'Angle reasoning'],
    ['Congruence criteria', 'Properties of triangles', 'Inequalities', 'Proof practice'],
    ['Parallelograms', 'Properties of quadrilaterals', 'Mid-point theorem', 'Construction ideas'],
    ['Chords and arcs', 'Angles in a circle', 'Cyclic relationships', 'Circle theorems'],
    ['Heron’s formula', 'Semi-perimeter', 'Area of a triangle', 'Applications'],
    ['Data collection', 'Frequency tables', 'Bar graphs and histograms', 'Mean, median, and mode'],
  ],
  hindi: [
    ['कथा का परिवेश', 'पात्र-चित्रण', 'संघर्ष और संदेश', 'भाषा-शैली'],
    ['यात्रा-वृत्तांत', 'स्थान और संस्कृति', 'लेखक का दृष्टिकोण', 'वर्णन-कौशल'],
    ['उपभोक्तावाद', 'बाजार और समाज', 'विज्ञापन का प्रभाव', 'विवेकपूर्ण चुनाव'],
    ['स्मृति और संवेदना', 'प्रकृति-चित्रण', 'भाव-पक्ष', 'शीर्षक की सार्थकता'],
    ['व्यंग्य', 'लेखक की दृष्टि', 'हास्य और आलोचना', 'सामाजिक संदर्भ'],
    ['बाल्यकाल की स्मृतियाँ', 'परिवार और शिक्षा', 'आत्मकथात्मक स्वर', 'प्रेरक अनुभव'],
    ['साखी की भाषा', 'कबीर का संदेश', 'दोहा-रचना', 'सामाजिक समानता'],
    ['वाख का भाव', 'आध्यात्मिक खोज', 'प्रतीक और बिंब', 'भाषिक सौंदर्य'],
    ['भक्ति और समर्पण', 'काव्य-भाव', 'अलंकार', 'लय और छंद'],
    ['स्वतंत्रता की आकांक्षा', 'प्रतीकात्मकता', 'देशभक्ति', 'काव्य-संदेश'],
  ],
  english: [
    ['Future learning', 'Characterisation', 'Setting and contrast', 'Central idea'],
    ['Music and identity', 'Cultural diversity', 'Biography', 'Resilience'],
    ['Fear and relationships', 'Childhood perspective', 'Change in character', 'Narrative voice'],
    ['Scientific curiosity', 'Einstein’s life', 'Human values', 'Achievement and responsibility'],
    ['Humour and irony', 'Fear and imagination', 'Narrator’s voice', 'Unexpected change'],
    ['Childhood memories', 'Values and influences', 'Diversity', 'Personal growth'],
    ['Achievement and discipline', 'Women in sport', 'Goal setting', 'Perseverance'],
    ['Place and observation', 'Travel writing', 'Culture and language', 'Sensory detail'],
    ['Conflict and dialogue', 'Power and wit', 'Dramatic structure', 'Resolution'],
    ['Choice and consequence', 'Nature imagery', 'Tone and symbolism', 'Interpretation'],
  ],
  science: [
    ['Particles of matter', 'States of matter', 'Change of state', 'Evaporation'],
    ['Mixtures and solutions', 'Separation methods', 'Elements and compounds', 'Physical and chemical change'],
    ['Laws of chemical combination', 'Atoms and molecules', 'Valency', 'Mole concept'],
    ['Cell structure', 'Cell organelles', 'Plant and animal cells', 'Cell transport'],
    ['Plant tissues', 'Animal tissues', 'Structure and function', 'Specialisation'],
    ['Distance and displacement', 'Speed and velocity', 'Graphs of motion', 'Uniform acceleration'],
    ['Force and inertia', 'Newton’s laws', 'Momentum', 'Action and reaction'],
    ['Universal gravitation', 'Mass and weight', 'Free fall', 'Thrust and pressure'],
    ['Work and energy', 'Kinetic energy', 'Potential energy', 'Power and conservation'],
    ['Production of sound', 'Propagation', 'Characteristics of sound', 'Reflection and echo'],
  ],
};

function getChapterDetail(subject: Subject, chapter: string, index: number): ChapterDetail {
  if (subject.slug === 'social-science' && socialScienceChapterDetails[chapter]) return socialScienceChapterDetails[chapter];
  const topics = topicBanks[subject.slug]?.[index] ?? [`${chapter} concepts`, 'Key terms and definitions', 'Worked examples', 'Exam connections'];
  const summaryBySubject: Record<string, string> = {
    mathematics: `This chapter builds a clear method for ${chapter}. Start with the definitions, test the rule on a small example, and check each step before moving to a harder problem.`,
    hindi: `This chapter invites a close reading of ${chapter}. Track the speaker or characters, notice the language choices, and connect the details to the larger भाव or message.`,
    english: `This chapter uses ${chapter} to develop reading, interpretation, and communication. Notice the choices made by the writer and support every answer with a detail from the text.`,
    science: `This chapter explains ${chapter} through observation, evidence, and cause-and-effect. Learn the vocabulary first, then connect the process to a labelled example or everyday situation.`,
  };
  const summary = summaryBySubject[subject.slug] ?? `Use this chapter map to revise ${chapter} in small, connected steps.`;
  return {
    topics,
    summary,
    notes: topics.map((topic, noteIndex) => `${noteIndex + 1}. ${topic}: write one definition, one example, and one question you still want to test.`),
    qa: [
      { question: `What is the first idea to revise in ${chapter}?`, answer: `Begin with ${topics[0]}, then connect it to the remaining topics through an example.` },
      { question: `How can you check your understanding of ${chapter}?`, answer: `Close the notes, explain the main rule or message in your own words, and solve or discuss one fresh example.` },
      { question: `Which habit helps answer exam questions from ${chapter}?`, answer: `Use the key terms accurately, show the reasoning in order, and link the answer back to the chapter’s central idea.` },
    ],
    extraQa: [
      { question: `What should you do if ${chapter} feels difficult?`, answer: `Break it into the topic list, review one small idea at a time, and return to the textbook example before attempting a new question.` },
      { question: `How can you make a one-page revision sheet for ${chapter}?`, answer: `Write the summary at the top, list the topics, add important terms or formulas, and finish with two self-made questions.` },
    ],
  };
}

function buildQuestions(subject: Subject): QuizQuestion[] {
  return Array.from({ length: 100 }, (_, index) => {
    const fact = subject.facts[index % subject.facts.length];
    const chapter = subject.chapters[index % subject.chapters.length];
    const detail = getChapterDetail(subject, chapter, index % subject.chapters.length);
    const topic = detail.topics[index % detail.topics.length];
    const shift = index % 4;
    const options = [fact.answer, ...fact.distractors];
    const rotated = [...options.slice(shift), ...options.slice(0, shift)];
    return { ...fact, prompt: index >= subject.facts.length ? `${fact.prompt} (${topic})` : fact.prompt, id: `${subject.slug}-${index + 1}`, chapter, options: rotated, answerIndex: rotated.indexOf(fact.answer) };
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

function RevealableAnswer({ item, label = 'Show answer' }: { item: QuestionAnswer; label?: string }) {
  const [revealed, setRevealed] = useState(false);
  return <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background)/.55)] p-4">
    <div className="flex items-start justify-between gap-4">
      <p className="text-sm font-semibold leading-6">{item.question}</p>
      <button onClick={() => setRevealed((value) => !value)} className="focus-ring inline-flex shrink-0 items-center gap-1 rounded-lg border border-[hsl(var(--border))] px-2.5 py-1.5 text-[11px] font-bold text-[hsl(var(--primary))] hover:bg-[hsl(var(--muted))]" aria-expanded={revealed}>{revealed ? 'Hide answer' : label}<Plus size={13} className={`transition-transform ${revealed ? 'rotate-45' : ''}`} /></button>
    </div>
    {revealed && <p className="mt-3 border-t border-[hsl(var(--border))] pt-3 text-xs leading-6 text-[hsl(var(--muted-foreground))]">{item.answer}</p>}
  </div>;
}

function ChapterCard({ subject, chapter, index }: { subject: Subject; chapter: string; index: number }) {
  const detail = getChapterDetail(subject, chapter, index);
  return <article data-testid={`card-chapter-${subject.slug}-${index}`} className="group rounded-2xl border border-[hsl(var(--card-border))] bg-[hsl(var(--card))] p-5 transition-all duration-200 hover:border-[hsl(var(--primary)/.35)] hover:soft-shadow sm:p-6">
    <div className="flex gap-4">
      <span className="mono pt-1 text-xs text-[hsl(var(--accent))]">{String(index + 1).padStart(2, '0')}</span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-start justify-between gap-2"><h3 className="font-bold">{chapter}</h3><span className="rounded-full bg-[hsl(var(--muted))] px-2.5 py-1 text-[10px] text-[hsl(var(--muted-foreground))]">{detail.topics.length} topics</span></div>
        <p className="mt-3 text-sm leading-6 text-[hsl(var(--muted-foreground))]">{detail.summary}</p>
        <div className="mt-5 flex flex-wrap gap-2">{detail.topics.map((topic) => <span key={topic} className="rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--background)/.7)] px-2.5 py-1.5 text-[11px] font-semibold text-[hsl(var(--foreground)/.78)]">{topic}</span>)}</div>
        <div className="mt-6 grid gap-5 lg:grid-cols-2">
          <div><p className="mono mb-3 text-[10px] uppercase tracking-[.16em] text-[hsl(var(--primary))]">quick notes</p><ul className="space-y-2">{detail.notes.map((note) => <li key={note} className="flex gap-2 text-xs leading-5 text-[hsl(var(--muted-foreground))]"><span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-[hsl(var(--accent))]" />{note}</li>)}</ul></div>
          <div><p className="mono mb-3 text-[10px] uppercase tracking-[.16em] text-[hsl(var(--primary))]">chapter Q&A</p><div className="space-y-2">{detail.qa.map((item) => <RevealableAnswer item={item} key={item.question} />)}</div></div>
        </div>
        <details className="mt-5 rounded-xl border border-dashed border-[hsl(var(--border))] p-4"><summary className="focus-ring cursor-pointer text-xs font-bold text-[hsl(var(--primary))]">Extra questions and answers</summary><div className="mt-4 space-y-2">{detail.extraQa.map((item) => <RevealableAnswer item={item} key={item.question} />)}</div></details>
        <Link href={`/quiz/${subject.slug}`} data-testid={`link-chapter-practice-${subject.slug}-${index}`} className="focus-ring mt-5 inline-flex items-center gap-1.5 text-xs font-bold text-[hsl(var(--primary))] opacity-80 transition-opacity group-hover:opacity-100">Practice this chapter <ChevronRight size={14} /></Link>
      </div>
    </div>
  </article>;
}

function SubjectPage() {
  const params = useParams<{ slug: string }>();
  const subject = subjects.find((item) => item.slug === params.slug);
  const [query, setQuery] = useState('');
  const [selectedChapter, setSelectedChapter] = useState('All chapters');
  if (!subject) return <EmptyState title="That shelf is empty." text="We could not find this subject in the Class 9 desk. Pick another route and keep your study streak intact." />;
  const filtered = subject.chapters.filter((chapter) => chapter.toLowerCase().includes(query.toLowerCase()) && (selectedChapter === 'All chapters' || chapter === selectedChapter));
  return <div className="mx-auto max-w-7xl px-5 py-8 md:px-10 md:py-12">
    <div className="flex flex-wrap items-start justify-between gap-6 reveal"><div className="flex gap-4"><span style={{ backgroundColor: subject.tint, color: subject.color }} className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-lg font-bold">{subject.title.slice(0, 2)}</span><div><Link href="/" data-testid="link-subject-back" className="focus-ring mono text-[10px] uppercase tracking-[.15em] text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--primary))]">Study desk / subjects</Link><h1 className="display mt-2 text-4xl leading-none sm:text-5xl">{subject.name}</h1><p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">{subject.title}</p></div></div><Link href={`/quiz/${subject.slug}`} data-testid={`link-start-quiz-${subject.slug}`} className="focus-ring inline-flex items-center gap-2 rounded-xl bg-[hsl(var(--primary))] px-4 py-3 text-sm font-bold text-[hsl(var(--primary-foreground))] transition-transform hover:-translate-y-0.5">Practice 20 questions <ArrowRight size={16} /></Link></div>
     <div className="mt-10 grid gap-6 lg:grid-cols-[1.1fr_.9fr]"><section className="rounded-2xl bg-[hsl(var(--primary))] p-7 text-[hsl(var(--primary-foreground))] sm:p-9"><p className="mono text-[10px] uppercase tracking-[.18em] text-[hsl(var(--secondary))]">subject note</p><h2 className="display mt-7 max-w-lg text-3xl leading-tight sm:text-4xl">{subject.blurb}</h2><p className="mt-6 max-w-lg text-sm leading-6 opacity-75">These notes are your first pass — a clean map before the textbook’s details. Read one card, close it, and say the idea out loud.</p><div className="mt-8 flex items-center gap-2 text-xs font-semibold"><span className="h-2 w-2 rounded-full bg-[hsl(var(--secondary))]" /> {subject.chapters.length} chapter maps <span className="mx-1 opacity-40">·</span> 100 topic-linked questions</div></section><section className="paper-grid rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-7 sm:p-9"><div className="flex items-center justify-between"><p className="mono text-[10px] uppercase tracking-[.18em] text-[hsl(var(--muted-foreground))]">quick clarity</p><Sparkles size={18} className="text-[hsl(var(--accent))]" /></div><div className="mt-8 space-y-5"><div className="border-l-2 border-[hsl(var(--secondary))] pl-4"><p className="text-xs font-bold">How to use this page</p><p className="mt-1 text-xs leading-5 text-[hsl(var(--muted-foreground))]">Search a chapter, read its topic map, open answers only when you need them, then practise.</p></div><div className="border-l-2 border-[hsl(var(--accent))] pl-4"><p className="text-xs font-bold">A useful pause</p><p className="mt-1 text-xs leading-5 text-[hsl(var(--muted-foreground))]">Try to recall first. The answer stays hidden until you choose “Show answer” — recall is the check.</p></div></div></section></div>
      <section className="mt-11"><div className="flex flex-wrap items-end justify-between gap-4"><div><p className="mono text-[10px] uppercase tracking-[.18em] text-[hsl(var(--muted-foreground))]">chapter index</p><h2 className="display mt-1 text-3xl">Find your foothold</h2></div><div className="flex w-full gap-2 sm:w-auto"><label className="relative flex min-w-0 flex-1 items-center sm:w-60"><Search size={15} className="absolute left-3 text-[hsl(var(--muted-foreground))]" /><input value={query} onChange={(event) => setQuery(event.target.value)} data-testid="input-chapter-search" aria-label="Search chapters" placeholder="Search chapters" className="focus-ring h-10 w-full rounded-xl border border-[hsl(var(--input))] bg-[hsl(var(--card))] pl-9 pr-3 text-sm outline-none placeholder:text-[hsl(var(--muted-foreground))]" /></label><div className="relative"><Filter size={14} className="pointer-events-none absolute left-3 top-3 text-[hsl(var(--muted-foreground))]" /><select value={selectedChapter} onChange={(event) => setSelectedChapter(event.target.value)} data-testid="select-chapter-filter" aria-label="Filter chapters" className="focus-ring h-10 max-w-36 appearance-none rounded-xl border border-[hsl(var(--input))] bg-[hsl(var(--card))] pl-8 pr-3 text-xs outline-none"><option>All chapters</option>{subject.chapters.map((chapter) => <option key={chapter}>{chapter}</option>)}</select></div></div></div><div className="mt-5 grid gap-3">{filtered.map((chapter) => <ChapterCard key={chapter} subject={subject} chapter={chapter} index={subject.chapters.indexOf(chapter)} />)}</div>{filtered.length === 0 && <div className="mt-5 rounded-2xl border border-dashed border-[hsl(var(--border))] p-10 text-center"><p className="font-semibold">No chapter found.</p><p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">Try a shorter search or return to all chapters.</p><button onClick={() => { setQuery(''); setSelectedChapter('All chapters'); }} data-testid="button-clear-chapter-filter" className="focus-ring mt-4 text-xs font-bold text-[hsl(var(--primary))]">Clear filters</button></div>}</section>
  </div>;
}

function QuizPage() {
  const params = useParams<{ slug: string }>();
  const subject = subjects.find((item) => item.slug === params.slug);
  const [, setLocation] = useLocation();
  const questions = useMemo(() => subject ? buildQuestions(subject).slice(0, 20) : [], [subject]);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
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
    if (current === questions.length - 1) { const finalScore = score + (correct ? 1 : 0); recordScore(subject.slug, finalScore, questions.length); setSaved(true); setFinished(true); } else { setCurrent((value) => value + 1); setSelected(null); setShowAnswer(false); }
  };
  if (finished) {
    const percentage = Math.round((score / questions.length) * 100);
     return <div className="mx-auto max-w-3xl px-5 py-10 md:px-10 md:py-16"><div className="paper-grid rounded-[1.7rem] border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-7 text-center sm:p-12 reveal"><div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[hsl(var(--secondary))] text-[hsl(var(--foreground))] ink-shadow"><Trophy size={30} /></div><p className="mono mt-7 text-[10px] uppercase tracking-[.2em] text-[hsl(var(--primary))]">session complete · {saved ? 'saved to your desk' : 'saving'}</p><h1 className="display mt-3 text-5xl">{score} <span className="text-[hsl(var(--muted-foreground)/.45)]">/ {questions.length}</span></h1><p className="mt-3 text-sm text-[hsl(var(--muted-foreground))]">{percentage >= 80 ? 'That idea is sticking. Keep the momentum gentle.' : percentage >= 50 ? 'Good base. The misses are your next revision list.' : 'You found the edges. A reread will make the next round easier.'}</p><div className="mx-auto mt-8 max-w-sm"><div className="mb-2 flex justify-between text-xs"><span>recall score</span><span className="mono">{percentage}%</span></div><div className="h-3 overflow-hidden rounded-full bg-[hsl(var(--muted))]"><div className="h-full rounded-full bg-[hsl(var(--primary))] transition-all duration-700" style={{ width: `${percentage}%` }} /></div></div><div className="mt-9 flex flex-wrap justify-center gap-3"><button onClick={() => { setCurrent(0); setSelected(null); setShowAnswer(false); setScore(0); setFinished(false); setSaved(false); }} data-testid="button-retry-quiz" className="focus-ring inline-flex items-center gap-2 rounded-xl bg-[hsl(var(--primary))] px-4 py-3 text-sm font-bold text-[hsl(var(--primary-foreground))]"><RotateCcw size={16} /> Try again</button><Link href={`/subject/${subject.slug}`} data-testid="link-quiz-subject" className="focus-ring inline-flex items-center gap-2 rounded-xl border border-[hsl(var(--border))] px-4 py-3 text-sm font-bold">Back to {subject.name}</Link></div></div></div>;
  }
   return <div className="mx-auto max-w-4xl px-5 py-8 md:px-10 md:py-12"><div className="flex items-center justify-between"><button onClick={() => setLocation(`/subject/${subject.slug}`)} data-testid="button-exit-quiz" className="focus-ring inline-flex items-center gap-1 text-xs font-bold text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--primary))]"><ChevronLeft size={15} /> Exit practice</button><span className="mono text-[10px] uppercase tracking-[.15em] text-[hsl(var(--muted-foreground))]">100 question bank</span></div><div className="mt-8 flex items-end justify-between gap-4"><div><p style={{ color: subject.color }} className="mono text-[10px] uppercase tracking-[.18em]">{subject.name} · quick practice</p><h1 className="display mt-2 text-4xl sm:text-5xl">Show what stayed.</h1></div><span className="mono text-sm">{String(current + 1).padStart(2, '0')} <span className="text-[hsl(var(--muted-foreground))]">/ {questions.length}</span></span></div><div className="mt-6 flex gap-1.5">{questions.map((item, index) => <span key={item.id} className={`h-1.5 flex-1 rounded-full ${index < current ? 'bg-[hsl(var(--primary))]' : index === current ? 'bg-[hsl(var(--secondary))]' : 'bg-[hsl(var(--muted))]'}`} />)}</div><section className="mt-8 rounded-[1.5rem] border border-[hsl(var(--card-border))] bg-[hsl(var(--card))] p-6 soft-shadow sm:p-10"><div className="flex items-center gap-2 text-xs text-[hsl(var(--muted-foreground))]"><BookOpen size={14} /> {question.chapter}</div><h2 className="mt-8 max-w-2xl text-xl font-bold leading-8 sm:text-2xl">{question.prompt}</h2><div className="mt-8 grid gap-3">{question.options.map((option, index) => { const isCorrect = showAnswer && index === question.answerIndex; const isWrong = showAnswer && selected === index && !isCorrect; return <button key={option} onClick={() => choose(index)} data-testid={`button-answer-${current}-${index}`} aria-pressed={selected === index} className={`focus-ring flex w-full items-center gap-3 rounded-xl border p-4 text-left text-sm transition-all duration-200 ${isCorrect ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary)/.1)]' : isWrong ? 'border-[hsl(var(--destructive))] bg-[hsl(var(--destructive)/.08)]' : selected !== null ? 'opacity-60' : 'hover:-translate-y-0.5 hover:border-[hsl(var(--primary)/.45)] hover:bg-[hsl(var(--muted)/.6)]'}`}><span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border text-xs font-bold ${isCorrect ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]' : isWrong ? 'border-[hsl(var(--destructive))] text-[hsl(var(--destructive))]' : 'border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))]'}`}>{isCorrect ? <Check size={14} /> : String.fromCharCode(65 + index)}</span><span>{option}</span></button>; })}</div>{selected !== null && !showAnswer && <button onClick={() => setShowAnswer(true)} data-testid="button-show-answer" className="focus-ring mt-6 rounded-xl border border-[hsl(var(--primary)/.45)] px-4 py-2.5 text-xs font-bold text-[hsl(var(--primary))] hover:bg-[hsl(var(--muted))]">Show answer</button>}{showAnswer && <div className={`mt-6 flex items-start gap-3 rounded-xl p-4 text-sm ${selected === question.answerIndex ? 'bg-[hsl(var(--primary)/.1)] text-[hsl(var(--primary))]' : 'bg-[hsl(var(--accent)/.12)] text-[hsl(var(--foreground))]'}`}><CircleHelp size={17} className="mt-0.5 shrink-0" /><p><strong>{selected === question.answerIndex ? 'Good catch.' : 'Not quite.'}</strong> {selected === question.answerIndex ? 'That connection is on the right track.' : `The clearest answer is “${question.answer}”. Keep it on your next revision pass.`}</p></div>}<div className="mt-8 flex justify-end"><button onClick={next} disabled={selected === null} data-testid="button-next-question" className="focus-ring inline-flex items-center gap-2 rounded-xl bg-[hsl(var(--primary))] px-5 py-3 text-sm font-bold text-[hsl(var(--primary-foreground))] transition-all hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40">{current === questions.length - 1 ? 'See my score' : 'Next question'} <ChevronRight size={16} /></button></div></section></div>;
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
  return <div className="mx-auto max-w-6xl px-5 py-8 md:px-10 md:py-12"><div className="max-w-3xl reveal"><p className="mono text-[10px] uppercase tracking-[.18em] text-[hsl(var(--primary))]">a note about the desk</p><h1 className="display mt-3 text-5xl leading-[.95] sm:text-7xl">The syllabus,<br /><em className="text-[hsl(var(--primary))]">made less loud.</em></h1><p className="mt-6 max-w-xl text-base leading-7 text-[hsl(var(--muted-foreground))]">Padhai desk is a local-first study companion for Class 9 NCERT — built for the ten minutes before dinner, the bus ride home, and the evening when a chapter refuses to make sense.</p></div><div className="mt-12 grid gap-6 lg:grid-cols-[1fr_1.2fr]"><section className="rounded-2xl bg-[hsl(var(--primary))] p-7 text-[hsl(var(--primary-foreground))] sm:p-9"><p className="mono text-[10px] uppercase tracking-[.18em] text-[hsl(var(--secondary))]">what is inside</p><div className="mt-8 space-y-6">{[['05', 'subject shelves', 'The five NCERT subject worlds, each with a chapter map.'], ['100', 'questions per subject', 'Topic-linked checks that turn reading into recall.'], ['01', 'private progress trail', 'Your answers stay in this browser, so the desk remembers you.']].map(([number, title, copy]) => <div className="flex items-start gap-4" key={title}><span className="display text-3xl text-[hsl(var(--secondary))]">{number}</span><div><h2 className="font-bold">{title}</h2><p className="mt-1 text-sm leading-5 opacity-70">{copy}</p></div></div>)}</div></section><section className="rounded-2xl border border-[hsl(var(--card-border))] bg-[hsl(var(--card))] p-7 sm:p-9"><div className="flex items-center justify-between"><h2 className="display text-3xl">Syllabus shelf</h2><BookOpen size={20} className="text-[hsl(var(--accent))]" /></div><div className="mt-6 divide-y divide-[hsl(var(--border))]">{subjects.map((subject) => <Link href={`/subject/${subject.slug}`} data-testid={`link-about-${subject.slug}`} key={subject.slug} className="focus-ring group flex items-center gap-4 py-4"><span style={{ backgroundColor: subject.tint, color: subject.color }} className="flex h-9 w-9 items-center justify-center rounded-lg text-xs font-bold">{subject.title.slice(0, 2)}</span><span className="flex-1"><strong className="block text-sm">{subject.name}</strong><span className="text-xs text-[hsl(var(--muted-foreground))]">{subject.title} · {subject.chapters.length} chapter maps</span></span><ChevronRight size={16} className="text-[hsl(var(--muted-foreground))] transition-transform group-hover:translate-x-1" /></Link>)}</div></section></div><section className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{[['Local-first', 'No account, no feed, no noise. Progress is stored in your browser.'], ['Recall-led', 'Read a short map, then ask your memory to do the work.'], ['NCERT-minded', 'A companion layer for the syllabus — never a replacement for your textbook.'], ['Offline-ready', 'Install it from your browser on Android or Windows. Notes and quizzes keep working without internet.']].map(([title, copy]) => <div key={title} className="rounded-2xl border border-[hsl(var(--card-border))] bg-[hsl(var(--card))] p-5"><p className="text-sm font-bold">{title}</p><p className="mt-2 text-xs leading-5 text-[hsl(var(--muted-foreground))]">{copy}</p></div>)}</section></div>;
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