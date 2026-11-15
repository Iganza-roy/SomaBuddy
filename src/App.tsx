import { useEffect, useMemo, useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  AudioLines,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleHelp,
  Clock3,
  Flame,
  Headphones,
  Home,
  LockKeyhole,
  Medal,
  Menu,
  RotateCcw,
  Sparkles,
  Star,
  Trophy,
  Volume2,
  X,
} from 'lucide-react'
import './App.css'

type Subject = 'English' | 'Kiswahili' | 'Mathematics'
type ActivityType = 'choice' | 'fill' | 'match' | 'arrange' | 'reading' | 'visual'
type Exercise = {
  type: ActivityType
  prompt: string
  options?: string[]
  answer: string
  feedback: string
  passage?: string
  hint?: string
}
type Topic = {
  id: string
  subject: Subject
  grade: number
  title: string
  description: string
  icon: string
  lesson: string
  example: string
  exampleNote: string
  questions: Exercise[]
}
type LearnerProfile = {
  name: string
  grade: number
  avatar: string
  points: number
  streak: number
  lastStudyDate: string
  completedTopics: string[]
  correctAnswers: number
  attempts: Record<string, { correct: number; missed: number }>
}
type View = 'home' | 'learn' | 'parent' | 'lesson'
type LessonStage = 'learn' | 'example' | 'practise' | 'celebrate'

const STORAGE_KEY = 'somabuddy-learner-v1'

const avatarOptions = ['👧🏾', '👦🏿', '👧🏿', '👦🏾', '🧒🏽', '🧒🏿']

const topics: Topic[] = [
  {
    id: 'english-kiosk-words',
    subject: 'English',
    grade: 1,
    title: 'Words at the kiosk',
    description: 'Meet words for the things we see every day.',
    icon: '🥭',
    lesson: 'A noun is a word for a person, place, animal or thing. At a kiosk, you might see a mango, a cup or a shopkeeper.',
    example: 'The shopkeeper sells a mango.',
    exampleNote: '“Shopkeeper” is a person. “Mango” is a thing. Both are nouns!',
    questions: [
      { type: 'match', prompt: 'Match “mango” to what it is.', options: ['A fruit', 'A place', 'A person'], answer: 'A fruit', feedback: 'A mango is a fruit. You might find one at the market!', hint: 'Think of something sweet and juicy.' },
      { type: 'choice', prompt: 'Which word names a person?', options: ['Kiosk', 'Amina', 'Mandazi'], answer: 'Amina', feedback: 'Amina is a person. A kiosk is a place and mandazi is a thing.', hint: 'Look for the name of someone.' },
    ],
  },
  {
    id: 'english-kind-sentence',
    subject: 'English',
    grade: 2,
    title: 'Make a sentence',
    description: 'Put words in order to tell a little story.',
    icon: '📝',
    lesson: 'A sentence puts words in an order that makes sense. It starts with a capital letter and ends with a full stop.',
    example: 'Asha buys ripe mangoes.',
    exampleNote: 'Who? Asha. What does she do? Buys. What does she buy? Ripe mangoes.',
    questions: [
      { type: 'arrange', prompt: 'Put the words in the right order.', options: ['mandazi.', 'Juma', 'eats', 'a warm'], answer: 'Juma eats a warm mandazi.', feedback: 'Juma eats a warm mandazi. The sentence starts with who, then what they do.', hint: 'Start with the person, then the action.' },
      { type: 'fill', prompt: 'Finish the sentence: The matatu is _____.', options: ['blue', 'runs', 'quickly'], answer: 'blue', feedback: '“Blue” tells us what the matatu looks like. It describes the matatu.', hint: 'Choose a word that tells us its colour.' },
    ],
  },
  {
    id: 'english-reading-market',
    subject: 'English',
    grade: 3,
    title: 'A morning at the market',
    description: 'Read a short story and find its details.',
    icon: '📖',
    lesson: 'Good readers look for clues in a story. Read slowly and think about who is there, where they are and what happens.',
    example: 'If a story says “Nia carried a basket to the market,” we know Nia went to the market with a basket.',
    exampleNote: 'The answer is right there in the story. Readers can go back and look for a clue.',
    questions: [
      { type: 'reading', passage: 'On Saturday, Nia went to the market with her aunt. They bought tomatoes, green sukuma wiki and two sweet oranges. Nia carried the oranges home in a small basket.', prompt: 'What did Nia carry home?', options: ['Two oranges', 'Some books', 'A red ball'], answer: 'Two oranges', feedback: 'Nia carried the oranges home in a small basket. The story tells us exactly what she carried.', hint: 'Look at the last sentence.' },
      { type: 'choice', prompt: 'Who went to the market with Nia?', options: ['Her aunt', 'Her teacher', 'Her brother'], answer: 'Her aunt', feedback: 'The first sentence says Nia went with her aunt.', hint: 'Look at the first sentence.' },
    ],
  },
  {
    id: 'kiswahili-salamu',
    subject: 'Kiswahili',
    grade: 1,
    title: 'Salamu za kila siku',
    description: 'Tujifunze kusalimiana kwa furaha.',
    icon: '👋🏾',
    lesson: 'Tunasalimiana tunapokutana na watu. Asubuhi tunasema “Habari za asubuhi”. Mtu akijibu, tunaweza kusema “Nzuri”.',
    example: 'A: Habari za asubuhi?  B: Nzuri, asante!',
    exampleNote: '“Habari za asubuhi” ni salamu ya asubuhi. “Asante” ni neno la shukrani.',
    questions: [
      { type: 'choice', prompt: 'Unasema nini ukikutana na rafiki asubuhi?', options: ['Habari za asubuhi', 'Usiku mwema', 'Kwaheri'], answer: 'Habari za asubuhi', feedback: 'Ndiyo! “Habari za asubuhi” ni salamu ya asubuhi.', hint: 'Chagua salamu ya asubuhi.' },
      { type: 'match', prompt: 'Linganisha “asante” na maana yake.', options: ['Thank you', 'Good night', 'Goodbye'], answer: 'Thank you', feedback: '“Asante” maana yake ni “thank you”. Tunatumia tunaposhukuru.', hint: 'Ni neno la kumshukuru mtu.' },
    ],
  },
  {
    id: 'kiswahili-matunda',
    subject: 'Kiswahili',
    grade: 2,
    title: 'Matunda matamu',
    description: 'Taja na eleza matunda tunayopenda.',
    icon: '🍌',
    lesson: 'Majina ya matunda hutusaidia kueleza tunachokula. Embe ni tamu, ndizi ni njano, na chungwa lina juisi.',
    example: 'Embe moja ni tamu. Ndizi mbili ni njano.',
    exampleNote: '“Tamu” inaeleza ladha. “Njano” inaeleza rangi.',
    questions: [
      { type: 'fill', prompt: 'Ndizi ni za rangi ya _____.', options: ['njano', 'asubuhi', 'rafiki'], answer: 'njano', feedback: 'Vizuri! Ndizi nyingi huwa na rangi ya njano.', hint: 'Ni rangi ya jua.' },
      { type: 'choice', prompt: 'Ni tunda gani lenye juisi?', options: ['Chungwa', 'Kiti', 'Shule'], answer: 'Chungwa', feedback: 'Chungwa ni tunda lenye juisi. Kiti ni kitu, na shule ni mahali.', hint: 'Ni tunda la mviringo.' },
    ],
  },
  {
    id: 'kiswahili-sentensi',
    subject: 'Kiswahili',
    grade: 3,
    title: 'Sentensi za soko',
    description: 'Soma sentensi na utafute maana.',
    icon: '🧺',
    lesson: 'Sentensi ina maneno yanayokamilisha wazo. Sentensi huanza kwa herufi kubwa na huishia kwa nukta.',
    example: 'Akinyi ananunua nyanya sokoni.',
    exampleNote: 'Tunaweza kuona nani anafanya nini na mahali anapofanya.',
    questions: [
      { type: 'reading', passage: 'Baraka anaenda sokoni na mama yake. Wananunua viazi vitamu na mahindi. Baraka anabeba mahindi nyumbani.', prompt: 'Baraka anabeba nini nyumbani?', options: ['Mahindi', 'Viatu', 'Vitabu'], answer: 'Mahindi', feedback: 'Sentensi ya mwisho inasema Baraka anabeba mahindi nyumbani.', hint: 'Soma sentensi ya mwisho tena.' },
      { type: 'arrange', prompt: 'Panga maneno ili kutengeneza sentensi.', options: ['sokoni.', 'ananunua', 'Akinyi', 'nyanya'], answer: 'Akinyi ananunua nyanya sokoni.', feedback: 'Akinyi ananunua nyanya sokoni. Sentensi inaanza kwa jina na kuishia kwa nukta.', hint: 'Anza kwa jina la mtu.' },
    ],
  },
  {
    id: 'math-mango-count',
    subject: 'Mathematics',
    grade: 1,
    title: 'Count the mangoes',
    description: 'Count objects and find how many there are.',
    icon: '🥭',
    lesson: 'Counting helps us know how many things we have. Touch each mango as you count: one, two, three!',
    example: '🥭 🥭 🥭 = 3 mangoes',
    exampleNote: 'We counted each mango once. There are three mangoes altogether.',
    questions: [
      { type: 'visual', prompt: 'How many mangoes can you see?', options: ['3', '4', '5'], answer: '4', feedback: 'There are four mangoes. Count each one from left to right: 1, 2, 3, 4.', hint: 'Count each fruit one time.' },
      { type: 'choice', prompt: 'You have 2 mangoes and get 1 more. How many now?', options: ['2', '3', '4'], answer: '3', feedback: 'Two mangoes plus one more makes three mangoes.', hint: 'Count on from two: three!' },
    ],
  },
  {
    id: 'math-sharing',
    subject: 'Mathematics',
    grade: 2,
    title: 'Share the mandazi',
    description: 'Make equal groups when we share.',
    icon: '🍩',
    lesson: 'Sharing means making equal groups. If we share 6 mandazi between 2 friends, each friend gets the same number.',
    example: '🍩🍩🍩  🍩🍩🍩\n6 shared between 2 friends = 3 each',
    exampleNote: 'Give one to each friend in turns. Each friend gets 3 mandazi.',
    questions: [
      { type: 'visual', prompt: 'Share 8 mangoes equally between 2 baskets. How many in each basket?', options: ['3', '4', '6'], answer: '4', feedback: 'Each basket gets 4 mangoes. Four and four makes eight, so the groups are equal.', hint: 'Split 8 into two equal groups.' },
      { type: 'choice', prompt: 'Share 6 mandazi equally between 3 friends. How many each?', options: ['2', '3', '4'], answer: '2', feedback: 'Each friend gets 2 mandazi. 2 + 2 + 2 makes 6.', hint: 'Give one to each friend, then repeat.' },
    ],
  },
  {
    id: 'math-market-sums',
    subject: 'Mathematics',
    grade: 3,
    title: 'Market number stories',
    description: 'Add and multiply with market treats.',
    icon: '🧮',
    lesson: 'Maths helps us solve everyday problems. We can add prices to find a total, or make equal groups with multiplication.',
    example: '4 baskets with 3 mangoes in each: 3 + 3 + 3 + 3 = 12 mangoes.',
    exampleNote: 'Four groups of three is the same as 4 × 3. The answer is 12.',
    questions: [
      { type: 'visual', prompt: 'There are 3 bags with 4 oranges in each. How many oranges altogether?', options: ['7', '12', '14'], answer: '12', feedback: 'Three groups of four make 12. You can count 4, 8, 12.', hint: 'Add 4 + 4 + 4.' },
      { type: 'fill', prompt: 'A mango costs 5 shillings. Two mangoes cost _____ shillings.', options: ['7', '10', '15'], answer: '10', feedback: '5 + 5 = 10. Two mangoes cost 10 shillings altogether.', hint: 'Add the cost two times.' },
    ],
  },
]

const subjectInfo: Record<Subject, { icon: string; tone: string; detail: string }> = {
  English: { icon: '📚', tone: 'english', detail: 'Read, write & discover words' },
  Kiswahili: { icon: '💬', tone: 'kiswahili', detail: 'Soma, sikiliza na ongea' },
  Mathematics: { icon: '🔢', tone: 'math', detail: 'Count, add & solve' },
}

function isProfile(value: unknown): value is LearnerProfile {
  if (!value || typeof value !== 'object') return false
  const profile = value as Partial<LearnerProfile>
  return (
    typeof profile.name === 'string' &&
    typeof profile.grade === 'number' &&
    typeof profile.avatar === 'string' &&
    typeof profile.points === 'number' &&
    typeof profile.streak === 'number' &&
    Array.isArray(profile.completedTopics) &&
    typeof profile.correctAnswers === 'number' &&
    typeof profile.attempts === 'object'
  )
}

function loadProfile(): LearnerProfile | null {
  const saved = localStorage.getItem(STORAGE_KEY)
  if (!saved) return null
  const parsed: unknown = JSON.parse(saved)
  return isProfile(parsed) ? parsed : null
}

function say(text: string) {
  if (!('speechSynthesis' in window)) return
  window.speechSynthesis.cancel()
  const message = new SpeechSynthesisUtterance(text)
  message.lang = 'en-KE'
  message.rate = 0.88
  window.speechSynthesis.speak(message)
}

function dateKey() {
  return new Date().toLocaleDateString('en-CA')
}

function App() {
  const [profile, setProfile] = useState<LearnerProfile | null>(loadProfile)
  const [view, setView] = useState<View>(profile ? 'home' : 'home')
  const [subject, setSubject] = useState<Subject>('English')
  const [activeTopicId, setActiveTopicId] = useState<string | null>(null)
  const [stage, setStage] = useState<LessonStage>('learn')
  const [questionIndex, setQuestionIndex] = useState(0)
  const [answer, setAnswer] = useState('')
  const [checked, setChecked] = useState<boolean | null>(null)
  const [correctInSession, setCorrectInSession] = useState(0)
  const [dailyCompleted, setDailyCompleted] = useState(0)
  const [showMobileMenu, setShowMobileMenu] = useState(false)

  useEffect(() => {
    if (profile) localStorage.setItem(STORAGE_KEY, JSON.stringify(profile))
    else localStorage.removeItem(STORAGE_KEY)
  }, [profile])

  const activeTopic = topics.find((topic) => topic.id === activeTopicId)
  const subjectTopics = useMemo(
    () => topics.filter((topic) => topic.subject === subject && topic.grade === (profile?.grade ?? 1)),
    [profile?.grade, subject],
  )
  const nextTopic = topics.find((topic) => topic.grade === profile?.grade && !profile.completedTopics.includes(topic.id))
    ?? topics.find((topic) => topic.grade === profile?.grade)

  function createProfile(name: string, grade: number, avatar: string) {
    setProfile({
      name: name.trim(),
      grade,
      avatar,
      points: 0,
      streak: 0,
      lastStudyDate: '',
      completedTopics: [],
      correctAnswers: 0,
      attempts: {},
    })
    setView('home')
  }

  function startTopic(topic: Topic) {
    setActiveTopicId(topic.id)
    setSubject(topic.subject)
    setStage('learn')
    setQuestionIndex(0)
    setAnswer('')
    setChecked(null)
    setCorrectInSession(0)
    setView('lesson')
  }

  function recordAnswer(isCorrect: boolean) {
    if (!activeTopic || !profile) return
    setChecked(isCorrect)
    setProfile((current) => {
      if (!current) return current
      const previous = current.attempts[activeTopic.id] ?? { correct: 0, missed: 0 }
      const today = dateKey()
      const yesterday = new Date(Date.now() - 86400000).toLocaleDateString('en-CA')
      const streak = current.lastStudyDate === today
        ? current.streak
        : current.lastStudyDate === yesterday
          ? current.streak + 1
          : 1
      return {
        ...current,
        points: current.points + (isCorrect ? 5 : 0),
        streak,
        lastStudyDate: today,
        correctAnswers: current.correctAnswers + (isCorrect ? 1 : 0),
        attempts: {
          ...current.attempts,
          [activeTopic.id]: {
            correct: previous.correct + (isCorrect ? 1 : 0),
            missed: previous.missed + (isCorrect ? 0 : 1),
          },
        },
      }
    })
    if (isCorrect) setCorrectInSession((count) => count + 1)
  }

  function finishTopic() {
    if (!activeTopic || !profile) return
    const alreadyCompleted = profile.completedTopics.includes(activeTopic.id)
    if (!alreadyCompleted) {
      setProfile((current) => {
        if (!current || current.completedTopics.includes(activeTopic.id)) return current
        return {
          ...current,
          points: current.points + 35,
          completedTopics: [...current.completedTopics, activeTopic.id],
        }
      })
      setDailyCompleted((count) => count + 1)
    }
    setStage('celebrate')
  }

  function resetLesson() {
    setStage('learn')
    setQuestionIndex(0)
    setAnswer('')
    setChecked(null)
    setCorrectInSession(0)
  }

  function navigate(nextView: View) {
    setView(nextView)
    setShowMobileMenu(false)
  }

  if (!profile) {
    return <WelcomeScreen onCreate={createProfile} />
  }

  return (
    <div className="app-shell">
      <aside className={`sidebar ${showMobileMenu ? 'sidebar-open' : ''}`}>
        <div className="brand">
          <div className="brand-mark">s<span>✦</span></div>
          <div><strong>soma</strong><span>buddy</span></div>
        </div>
        <div className="sidebar-label">YOUR SPACE</div>
        <nav className="main-nav" aria-label="Main navigation">
          <button className={view === 'home' ? 'nav-item active' : 'nav-item'} onClick={() => navigate('home')}>
            <Home size={19} /> <span>My home</span>
          </button>
          <button className={view === 'learn' ? 'nav-item active' : 'nav-item'} onClick={() => navigate('learn')}>
            <BookOpen size={19} /> <span>Explore & learn</span>
          </button>
        </nav>
        <div className="sidebar-label grown-label">GROWN-UPS</div>
        <button className={view === 'parent' ? 'nav-item active' : 'nav-item'} onClick={() => navigate('parent')}>
          <LockKeyhole size={18} /> <span>Parent corner</span>
        </button>
        <div className="sidebar-bottom">
          <div className="sidebar-quote"><span>“</span><p>Little steps make<br />big discoveries.</p><i>— Soma</i></div>
          <div className="profile-switch">
            <div className="avatar-small">{profile.avatar}</div>
            <div><strong>{profile.name}</strong><span>Grade {profile.grade}</span></div>
            <button aria-label="Create a different learner profile" title="Switch learner" onClick={() => { setProfile(null); navigate('home') }}><RotateCcw size={15} /></button>
          </div>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <button className="mobile-menu" aria-label="Open menu" onClick={() => setShowMobileMenu((open) => !open)}>
            {showMobileMenu ? <X size={21} /> : <Menu size={21} />}
          </button>
          <div className="breadcrumb"><span>My space</span><ChevronRight size={14} /><strong>{view === 'home' ? 'Home' : view === 'learn' ? 'Explore & learn' : view === 'parent' ? 'Parent corner' : 'Your lesson'}</strong></div>
          <div className="topbar-right">
            <div className="streak-chip"><Flame size={17} fill="currentColor" /><strong>{profile.streak}</strong><span>day streak</span></div>
            <div className="points-chip"><span className="coin">✦</span><strong>{profile.points}</strong><span>points</span></div>
            <div className="avatar-small top-avatar">{profile.avatar}</div>
          </div>
        </header>

        {view === 'home' && (
          <Dashboard
            profile={profile}
            dailyCompleted={dailyCompleted}
            nextTopic={nextTopic}
            onStart={startTopic}
            onExplore={() => navigate('learn')}
          />
        )}
        {view === 'learn' && (
          <LearnScreen
            profile={profile}
            subject={subject}
            setSubject={setSubject}
            subjectTopics={subjectTopics}
            onStart={startTopic}
          />
        )}
        {view === 'parent' && (
          <ParentDashboard profile={profile} dailyCompleted={dailyCompleted} />
        )}
        {view === 'lesson' && activeTopic && (
          <LessonScreen
            profile={profile}
            topic={activeTopic}
            stage={stage}
            setStage={setStage}
            questionIndex={questionIndex}
            setQuestionIndex={setQuestionIndex}
            answer={answer}
            setAnswer={setAnswer}
            checked={checked}
            setChecked={setChecked}
            correctInSession={correctInSession}
            recordAnswer={recordAnswer}
            finishTopic={finishTopic}
            resetLesson={resetLesson}
            onBack={() => navigate('learn')}
          />
        )}
      </main>
    </div>
  )
}

function WelcomeScreen({ onCreate }: { onCreate: (name: string, grade: number, avatar: string) => void }) {
  const [name, setName] = useState('')
  const [grade, setGrade] = useState(1)
  const [avatar, setAvatar] = useState(avatarOptions[0])

  return (
    <main className="welcome-screen">
      <div className="welcome-doodle doodle-one">✳</div>
      <div className="welcome-doodle doodle-two">●</div>
      <div className="welcome-card">
        <div className="welcome-brand"><div className="brand-mark">s<span>✦</span></div><strong>soma<span>buddy</span></strong></div>
        <div className="welcome-content">
          <div className="welcome-art" aria-hidden="true">
            <span className="art-sun">☀</span><span className="art-star">✦</span>
            <div className="art-book">📚</div><div className="art-kid">🧒🏿</div>
            <span className="art-sparkle">✧</span>
          </div>
          <div className="welcome-copy">
            <span className="eyebrow">KARIBU, LITTLE LEARNER!</span>
            <h1>Big discoveries<br />start <em>right here.</em></h1>
            <p>A happy little space to read, count and grow — one fun lesson at a time.</p>
            <div className="welcome-perks"><span><span>✓</span> Made for you</span><span><span>✓</span> Learn at your pace</span></div>
          </div>
        </div>
        <form className="profile-form" onSubmit={(event) => { event.preventDefault(); if (name.trim()) onCreate(name, grade, avatar) }}>
          <div className="form-heading"><div><h2>Let’s make your space!</h2><p>Just a few little things to get started.</p></div><span className="form-step">1 <i>/</i> 1</span></div>
          <label className="field-label" htmlFor="learner-name">What should we call you?</label>
          <input id="learner-name" className="name-input" maxLength={24} placeholder="Your name or nickname" value={name} onChange={(event) => setName(event.target.value)} required />
          <div className="form-row">
            <div className="grade-field">
              <span className="field-label">I’m in...</span>
              <div className="grade-options">{[1, 2, 3].map((value) => <button type="button" className={grade === value ? 'grade-option selected' : 'grade-option'} key={value} onClick={() => setGrade(value)}>Grade {value}</button>)}</div>
            </div>
            <div className="avatar-field">
              <span className="field-label">Pick your buddy</span>
              <div className="avatar-options">{avatarOptions.map((option) => <button type="button" key={option} aria-label={`Choose avatar ${option}`} className={avatar === option ? 'avatar-option selected' : 'avatar-option'} onClick={() => setAvatar(option)}>{option}</button>)}</div>
            </div>
          </div>
          <button className="button-primary welcome-submit" type="submit" disabled={!name.trim()}>Let’s go, {name.trim() || 'friend'}! <ArrowRight size={19} /></button>
          <p className="privacy-note"><LockKeyhole size={13} /> Your little profile stays on this device.</p>
        </form>
      </div>
      <p className="welcome-footer">Made with <span>♥</span> for curious minds everywhere</p>
    </main>
  )
}

function Dashboard({ profile, dailyCompleted, nextTopic, onStart, onExplore }: {
  profile: LearnerProfile
  dailyCompleted: number
  nextTopic?: Topic
  onStart: (topic: Topic) => void
  onExplore: () => void
}) {
  const goal = 2
  const percent = Math.min(100, (dailyCompleted / goal) * 100)
  const completed = profile.completedTopics.length
  return (
    <div className="page-content dashboard">
      <section className="welcome-banner">
        <div className="welcome-banner-copy">
          <span className="eyebrow">TUESDAY, 15TH NOVEMBER</span>
          <h1>Habari, {profile.name}! <span>✦</span></h1>
          <p>Ready to make today a little brighter? Let’s learn something new.</p>
          <button className="button-primary banner-button" onClick={() => nextTopic && onStart(nextTopic)}>
            {completed ? 'Keep learning' : 'Start today’s learning'} <ArrowRight size={17} />
          </button>
        </div>
        <div className="banner-illustration" aria-hidden="true">
          <span className="banner-cloud cloud-a">✦</span><span className="banner-cloud cloud-b">✿</span>
          <div className="banner-character">{profile.avatar}</div>
          <div className="banner-book">📖</div><div className="banner-flower">✿</div>
          <div className="banner-ground"></div>
        </div>
        <div className="banner-grade">GRADE {profile.grade} <span>•</span> LEARNER</div>
      </section>

      <section className="dashboard-stats">
        <div className="stat-card daily-stat">
          <div className="stat-icon goal-icon"><Star size={19} fill="currentColor" /></div>
          <div className="stat-copy"><span>DAILY LITTLE GOAL</span><strong>{dailyCompleted} <small>of {goal} activities</small></strong><div className="progress-track"><span style={{ width: `${percent}%` }} /></div></div>
          <div className="goal-sun">☀</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon streak-icon"><Flame size={20} fill="currentColor" /></div>
          <div className="stat-copy"><span>YOUR STREAK</span><strong>{profile.streak} <small>{profile.streak === 1 ? 'day' : 'days'}</small></strong><p>Every little bit counts!</p></div>
          <span className="stat-decoration">✦</span>
        </div>
        <div className="stat-card">
          <div className="stat-icon trophy-icon"><Trophy size={20} /></div>
          <div className="stat-copy"><span>LESSONS FINISHED</span><strong>{completed} <small>{completed === 1 ? 'lesson' : 'lessons'}</small></strong><p>You’re doing great!</p></div>
          <span className="stat-decoration trophy-deco">✧</span>
        </div>
      </section>

      <section className="section-block">
        <div className="section-heading"><div><span className="eyebrow">PICK YOUR ADVENTURE</span><h2>What shall we learn?</h2></div><button className="text-link" onClick={onExplore}>See all topics <ArrowRight size={16} /></button></div>
        <div className="subject-grid">
          {(Object.keys(subjectInfo) as Subject[]).map((item) => {
            const info = subjectInfo[item]
            const count = topics.filter((topic) => topic.subject === item && topic.grade === profile.grade).length
            return <button className={`subject-card ${info.tone}`} key={item} onClick={onExplore}>
              <span className="subject-icon">{info.icon}</span><span className="subject-arrow"><ArrowRight size={17} /></span>
              <span className="subject-name">{item}</span><span className="subject-detail">{info.detail}</span>
              <span className="subject-bottom">{count} fun topics <span>•</span> Grade {profile.grade}</span>
            </button>
          })}
        </div>
      </section>

      <section className="bottom-grid">
        <div className="continue-card">
          <div className="section-heading compact"><div><span className="eyebrow">JUST FOR YOU</span><h2>Your next little adventure</h2></div><span className="mini-sparkle">✦</span></div>
          {nextTopic ? <button className="next-topic" onClick={() => onStart(nextTopic)}>
            <span className={`next-topic-icon ${subjectInfo[nextTopic.subject].tone}`}>{nextTopic.icon}</span>
            <span className="next-topic-copy"><strong>{nextTopic.title}</strong><span>{nextTopic.subject} <i>•</i> Grade {nextTopic.grade}</span></span>
            <span className="play-circle"><ArrowRight size={18} /></span>
          </button> : <p className="all-done">You’ve explored every topic for your grade. Amazing work! 🎉</p>}
        </div>
        <div className="badges-card">
          <div className="section-heading compact"><div><span className="eyebrow">YOUR COLLECTION</span><h2>Little achievements</h2></div><Medal className="badge-heading-icon" size={20} /></div>
          <div className="badge-row">
            <Badge icon="📚" label="Reading Star" unlocked={completed > 0 && profile.completedTopics.some((id) => topics.find((topic) => topic.id === id)?.subject === 'English')} />
            <Badge icon="🔢" label="Math Explorer" unlocked={completed > 0 && profile.completedTopics.some((id) => topics.find((topic) => topic.id === id)?.subject === 'Mathematics')} />
            <Badge icon="💬" label="Word Wizard" unlocked={completed > 0 && profile.completedTopics.some((id) => topics.find((topic) => topic.id === id)?.subject === 'Kiswahili')} />
            <Badge icon="🌟" label="Super Steady" unlocked={profile.streak >= 3} />
          </div>
        </div>
      </section>
      <footer className="page-footer"><span>✦</span> Keep being curious, {profile.name}. You’re doing wonderfully! <span>✦</span></footer>
    </div>
  )
}

function Badge({ icon, label, unlocked }: { icon: string; label: string; unlocked: boolean }) {
  return <div className={`badge ${unlocked ? 'unlocked' : 'locked'}`} title={unlocked ? `${label} unlocked` : 'Keep learning to unlock this badge'}>
    <span className="badge-art">{unlocked ? icon : <LockKeyhole size={14} />}</span><span>{label}</span>
  </div>
}

function LearnScreen({ profile, subject, setSubject, subjectTopics, onStart }: {
  profile: LearnerProfile
  subject: Subject
  setSubject: (subject: Subject) => void
  subjectTopics: Topic[]
  onStart: (topic: Topic) => void
}) {
  return <div className="page-content learn-page">
    <div className="page-intro"><span className="eyebrow">LET’S GO EXPLORING</span><h1>Pick a little adventure <span>✦</span></h1><p>Choose something that makes you curious. There’s no rush — learn at your own pace.</p></div>
    <div className="subject-tabs" role="tablist" aria-label="Learning areas">
      {(Object.keys(subjectInfo) as Subject[]).map((item) => <button role="tab" aria-selected={subject === item} key={item} className={subject === item ? `subject-tab selected ${subjectInfo[item].tone}` : 'subject-tab'} onClick={() => setSubject(item)}><span>{subjectInfo[item].icon}</span>{item}</button>)}
    </div>
    <section className="topics-panel">
      <div className={`topics-banner ${subjectInfo[subject].tone}`}><div><span className="eyebrow">GRADE {profile.grade} • {subject.toUpperCase()}</span><h2>{subject === 'Kiswahili' ? 'Tujifunze pamoja!' : subject === 'Mathematics' ? 'Maths is all around us!' : 'Let’s play with words!'}</h2><p>{subjectInfo[subject].detail} — one happy little step at a time.</p></div><span className="topics-emoji">{subjectInfo[subject].icon}</span></div>
      <div className="topic-list">{subjectTopics.length ? subjectTopics.map((topic, index) => {
        const done = profile.completedTopics.includes(topic.id)
        const progress = profile.attempts[topic.id]
        return <article className={`topic-row ${done ? 'topic-done' : ''}`} key={topic.id}>
          <span className={`topic-number ${subjectInfo[subject].tone}`}>{done ? <Check size={18} /> : `0${index + 1}`}</span>
          <span className="topic-emoji">{topic.icon}</span>
          <div className="topic-main"><span className="topic-type">{done ? 'COMPLETED' : `TOPIC ${index + 1}  •  ABOUT 5 MIN`}</span><h3>{topic.title}</h3><p>{topic.description}</p></div>
          <div className="topic-progress">{progress ? <span>{progress.correct} right answers</span> : <span>Ready when you are</span>}<button aria-label={`${done ? 'Practice' : 'Start'} ${topic.title}`} onClick={() => onStart(topic)}>{done ? 'Practise again' : 'Let’s go'} <ArrowRight size={16} /></button></div>
        </article>
      }) : <div className="empty-topics"><span>🌱</span><h3>New adventures are growing!</h3><p>More {subject} topics for Grade {profile.grade} are on their way.</p></div>}</div>
    </section>
    <div className="gentle-note"><Sparkles size={17} /><span>Every try helps your brain grow. You can always come back and practise again!</span></div>
  </div>
}

function LessonScreen({ profile, topic, stage, setStage, questionIndex, setQuestionIndex, answer, setAnswer, checked, setChecked, correctInSession, recordAnswer, finishTopic, resetLesson, onBack }: {
  profile: LearnerProfile
  topic: Topic
  stage: LessonStage
  setStage: (stage: LessonStage) => void
  questionIndex: number
  setQuestionIndex: (index: number) => void
  answer: string
  setAnswer: (answer: string) => void
  checked: boolean | null
  setChecked: (checked: boolean | null) => void
  correctInSession: number
  recordAnswer: (correct: boolean) => void
  finishTopic: () => void
  resetLesson: () => void
  onBack: () => void
}) {
  const stages: LessonStage[] = ['learn', 'example', 'practise', 'celebrate']
  const stageIndex = stages.indexOf(stage)
  const exercise = topic.questions[questionIndex]
  const [arranged, setArranged] = useState<string[]>([])
  const [selected, setSelected] = useState<string | null>(null)
  const isCorrect = checked === true

  function choose(value: string) {
    setAnswer(value)
    setChecked(null)
  }

  function checkAnswer() {
    if (checked !== null || !exercise) return
    const submitted = exercise.type === 'arrange' ? arranged.join(' ') : answer.trim()
    recordAnswer(submitted.toLowerCase() === exercise.answer.trim().toLowerCase())
  }

  function nextQuestion() {
    if (questionIndex + 1 >= topic.questions.length) {
      finishTopic()
      return
    }
    setQuestionIndex(questionIndex + 1)
    setAnswer('')
    setChecked(null)
    setArranged([])
    setSelected(null)
  }

  const canCheck = exercise?.type === 'arrange' ? arranged.length === exercise.options?.length : Boolean(answer.trim())
  return <div className="page-content lesson-page">
    <button className="back-link" onClick={onBack}><ArrowLeft size={17} /> Back to topics</button>
    <div className="lesson-top"><div><span className="eyebrow">{topic.subject.toUpperCase()} • GRADE {profile.grade}</span><h1>{topic.title}</h1></div><button className="listen-button" onClick={() => say(`${topic.title}. ${topic.lesson}`)}><Headphones size={17} /> Listen</button></div>
    <div className="lesson-progress-wrap">
      <div className="lesson-step-label"><span>YOUR LEARNING JOURNEY</span><strong>Step {Math.min(stageIndex + 1, 4)} of 4</strong></div>
      <div className="lesson-progress"><span style={{ width: `${((stageIndex + 1) / 4) * 100}%` }} /></div>
      <div className="lesson-step-names">{['Learn', 'See an example', 'Let’s practise', 'Celebrate'].map((label, index) => <span className={index <= stageIndex ? 'step-done' : ''} key={label}>{label}</span>)}</div>
    </div>
    <section className="lesson-card">
      {stage === 'learn' && <div className="learn-stage stage-layout">
        <div className={`lesson-art ${subjectInfo[topic.subject].tone}`}><span className="lesson-art-sparkle">✦</span><span className="lesson-big-emoji">{topic.icon}</span><span className="lesson-art-dot">●</span></div>
        <div className="stage-copy"><span className="stage-kicker">FIRST, LET’S LEARN</span><h2>Here’s a little idea</h2><p>{topic.lesson}</p><button className="audio-link" onClick={() => say(topic.lesson)}><Volume2 size={16} /> Hear that again</button><button className="button-primary stage-button" onClick={() => setStage('example')}>I’m ready! <ArrowRight size={17} /></button></div>
      </div>}
      {stage === 'example' && <div className="example-stage">
        <div className={`example-icon ${subjectInfo[topic.subject].tone}`}>{topic.icon}</div><span className="stage-kicker">LET’S SEE IT IN ACTION</span><h2>{topic.subject === 'Mathematics' ? 'A little example' : 'Here’s an example'}</h2>
        <div className="example-board"><p>{topic.example}</p></div><p className="example-note">{topic.exampleNote}</p>
        <button className="button-primary stage-button" onClick={() => setStage('practise')}>Got it! Let’s practise <ArrowRight size={17} /></button>
      </div>}
      {stage === 'practise' && exercise && <div className="practice-stage">
        <div className="practice-topline"><span className="stage-kicker">YOUR TURN, {profile.name.toUpperCase()}!</span><span className="question-count">Question {questionIndex + 1} <i>of</i> {topic.questions.length}</span></div>
        {exercise.passage && <div className="reading-passage"><BookOpen size={17} /><p>{exercise.passage}</p></div>}
        <h2>{exercise.prompt}</h2>
        {exercise.type === 'visual' && <div className="visual-objects" aria-label="Count the objects">{Array.from({ length: questionIndex === 0 && topic.id === 'math-mango-count' ? 4 : topic.id === 'math-market-sums' ? 3 : topic.id === 'math-sharing' ? 8 : 3 }, (_, index) => <span key={index}>{topic.id === 'math-sharing' ? '🥭' : topic.id === 'math-market-sums' ? '🍊' : '🥭'}</span>)}</div>}
        {(exercise.type === 'choice' || exercise.type === 'match' || exercise.type === 'reading' || exercise.type === 'visual') && <div className="answer-options">
          {exercise.type === 'match' && <p className="match-label"><span className="match-word">{topic.id === 'english-kiosk-words' ? 'mango' : 'asante'}</span><ArrowRight size={17} /> Pick the meaning</p>}
          {exercise.options?.map((option, index) => <button key={option} className={`answer-option ${answer === option ? 'chosen' : ''} ${checked !== null && answer === option && isCorrect ? 'correct-choice' : ''}`} disabled={checked !== null} onClick={() => choose(option)}><span className="option-letter">{String.fromCharCode(65 + index)}</span>{option}{answer === option && checked === true && <CheckCircle2 className="option-check" size={18} />}</button>)}
        </div>}
        {exercise.type === 'fill' && <div className="fill-area"><div className="fill-input-row"><input aria-label="Your answer" value={answer} disabled={checked !== null} onChange={(event) => choose(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter' && canCheck) checkAnswer() }} placeholder="Type your answer..." autoComplete="off" />{exercise.options?.map((option) => <button className="word-suggestion" key={option} onClick={() => choose(option)} disabled={checked !== null}>{option}</button>)}</div></div>}
        {exercise.type === 'arrange' && <div className="arrange-area">
          <div className="arranged-answer" aria-label="Your sentence">{arranged.length ? arranged.map((word, index) => <button key={`${word}-${index}`} disabled={checked !== null} onClick={() => { setArranged(arranged.filter((_, wordIndex) => wordIndex !== index)); setChecked(null) }}>{word}</button>) : <span>Tap the words to build your sentence...</span>}</div>
          <div className="word-tiles">{exercise.options?.map((word, index) => <button key={`${word}-${index}`} className={arranged.filter((item) => item === word).length > exercise.options!.slice(0, index + 1).filter((item) => item === word).length - 1 ? 'word-tile used' : 'word-tile'} disabled={arranged.filter((item) => item === word).length > exercise.options!.slice(0, index).filter((item) => item === word).length || checked !== null} onClick={() => { setArranged([...arranged, word]); setChecked(null) }}>{word}</button>)}</div>
          <button className="clear-words" onClick={() => setArranged([])} disabled={!arranged.length || checked !== null}>Clear words</button>
        </div>}
        {checked !== null && <div className={isCorrect ? 'answer-feedback right' : 'answer-feedback gentle'}>
          <span className="feedback-icon">{isCorrect ? '🎉' : '🌱'}</span><div><strong>{isCorrect ? 'That’s right!' : 'Good try — let’s think together.'}</strong><p>{isCorrect ? exercise.feedback : `${exercise.feedback} ${exercise.hint ?? ''}`}</p></div>
        </div>}
        <div className="practice-actions">
          <span className="practice-points"><span>✦</span> +5 points for a correct answer</span>
          {checked === null ? <button className="button-primary" disabled={!canCheck} onClick={checkAnswer}>Check my answer <Check size={17} /></button> : isCorrect ? <button className="button-primary" onClick={nextQuestion}>{questionIndex + 1 >= topic.questions.length ? 'Finish this topic' : 'Next question'} <ArrowRight size={17} /></button> : <button className="button-soft" onClick={() => { setChecked(null); if (exercise.type === 'arrange') setArranged([]); else setAnswer('') }}>Try again <RotateCcw size={16} /></button>}
        </div>
      </div>}
      {stage === 'celebrate' && <div className="celebrate-stage">
        <div className="celebration-sparkles"><span>✦</span><span>✧</span><span>✹</span><span>✦</span></div>
        <div className="celebration-medal">🏅</div><span className="stage-kicker">YOU DID IT, {profile.name.toUpperCase()}!</span><h2>Look at you go! <span>🎉</span></h2>
        <p>You finished <strong>{topic.title}</strong>. You’re growing your brain with every little step.</p>
        <div className="celebration-stats"><div><span>✦</span><strong>{correctInSession * 5 + 35}</strong><small>points earned</small></div><div><CheckCircle2 size={19} /><strong>{correctInSession} of {topic.questions.length}</strong><small>answers right</small></div></div>
        <div className="recap-box"><Sparkles size={18} /><p><strong>Today you learned:</strong> {topic.lesson}</p></div>
        <div className="celebrate-actions"><button className="button-primary" onClick={onBack}>Back to adventures <ArrowRight size={17} /></button><button className="button-soft" onClick={resetLesson}>Practise again <RotateCcw size={16} /></button></div>
      </div>}
    </section>
    {stage !== 'celebrate' && <p className="lesson-encouragement"><span>♥</span> You’re doing lovely. Take all the time you need.</p>}
  </div>
}

function ParentDashboard({ profile, dailyCompleted }: { profile: LearnerProfile; dailyCompleted: number }) {
  const [weekOffset, setWeekOffset] = useState(0)
  const completedTopics = topics.filter((topic) => profile.completedTopics.includes(topic.id))
  const weakTopics = Object.entries(profile.attempts)
    .filter(([, result]) => result.missed > result.correct)
    .map(([id]) => topics.find((topic) => topic.id === id))
    .filter((topic): topic is Topic => Boolean(topic))
  const totalAnswers = Object.values(profile.attempts).reduce((total, result) => total + result.correct + result.missed, 0)
  const accuracy = totalAnswers ? Math.round((profile.correctAnswers / totalAnswers) * 100) : 0
  const chartDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  return <div className="page-content parent-page">
    <div className="page-intro parent-intro"><div><span className="eyebrow">A LITTLE LOOK AT THE GROWING</span><h1>{profile.name}’s learning <span>🌱</span></h1><p>A gentle overview of the time and care they put into learning.</p></div><div className="parent-readonly"><LockKeyhole size={14} /> PRIVATE PARENT VIEW</div></div>
    <section className="parent-overview">
      <div className="child-card"><div className="parent-avatar">{profile.avatar}</div><div><span className="eyebrow">YOUR LEARNER</span><h2>{profile.name}</h2><p>Grade {profile.grade} <span>•</span> Learning at their own pace</p></div><div className="child-star">✦</div></div>
      <div className="parent-stat"><span className="parent-stat-icon time"><Clock3 size={19} /></span><span className="eyebrow">TIME LEARNING</span><strong>{Math.max(1, completedTopics.length * 5 + dailyCompleted * 2)} <small>min</small></strong><p>Approx. this week</p></div>
      <div className="parent-stat"><span className="parent-stat-icon accuracy"><CheckCircle2 size={19} /></span><span className="eyebrow">QUESTIONS RIGHT</span><strong>{accuracy}<small>%</small></strong><p>{totalAnswers ? `${profile.correctAnswers} correct answers` : 'Ready to begin'}</p></div>
    </section>
    <section className="parent-content-grid">
      <div className="parent-panel weekly-panel">
        <div className="panel-heading"><div><span className="eyebrow">STEADY STEPS</span><h2>This week’s activity</h2></div><div className="week-controls"><button aria-label="Previous week" onClick={() => setWeekOffset((offset) => offset + 1)}><ArrowLeft size={15} /></button><span>{weekOffset ? `${weekOffset} week${weekOffset > 1 ? 's' : ''} ago` : 'This week'}</span><button aria-label="Next week" disabled={!weekOffset} onClick={() => setWeekOffset((offset) => Math.max(0, offset - 1))}><ArrowRight size={15} /></button></div></div>
        <div className="weekly-chart">{chartDays.map((day, index) => {
          const height = weekOffset === 0 ? [18, dailyCompleted ? 48 : 12, 27, 12, 38, 12, 15][index] : [25, 16, 43, 26, 13, 30, 18][index]
          return <div className="chart-column" key={day}><span className="chart-bar" style={{ height: `${height}px` }} /><span className="chart-day">{day}</span></div>
        })}</div>
        <div className="chart-caption"><span><i /> Learning activity</span><span>Little and often makes a big difference.</span></div>
      </div>
      <div className="parent-panel subject-progress-panel"><div className="panel-heading"><div><span className="eyebrow">GROWING SKILLS</span><h2>Learning areas</h2></div></div>
        <div className="subject-progress-list">{(Object.keys(subjectInfo) as Subject[]).map((item) => {
          const areaTopics = topics.filter((topic) => topic.subject === item && topic.grade === profile.grade)
          const done = areaTopics.filter((topic) => profile.completedTopics.includes(topic.id)).length
          const percentage = areaTopics.length ? Math.round((done / areaTopics.length) * 100) : 0
          const info = subjectInfo[item]
          return <div className="subject-progress-row" key={item}><span className={`progress-subject-icon ${info.tone}`}>{info.icon}</span><div className="subject-progress-info"><div><strong>{item}</strong><span>{done} of {areaTopics.length} topics</span></div><div className="progress-track"><span className={info.tone} style={{ width: `${percentage}%` }} /></div></div></div>
        })}</div>
      </div>
    </section>
    <section className="parent-bottom-grid">
      <div className="parent-panel completed-panel"><div className="panel-heading"><div><span className="eyebrow">LOOK HOW FAR THEY’VE COME</span><h2>Completed activities</h2></div><span className="completed-total">{completedTopics.length}</span></div>
        {completedTopics.length ? <div className="completed-list">{completedTopics.slice(-4).reverse().map((topic) => <div className="completed-row" key={topic.id}><span className={`completed-icon ${subjectInfo[topic.subject].tone}`}>{topic.icon}</span><div><strong>{topic.title}</strong><span>{topic.subject} · Grade {topic.grade}</span></div><CheckCircle2 size={17} /></div>)}</div> : <div className="parent-empty"><span>🌱</span><p>Completed activities will bloom here as {profile.name} explores.</p></div>}
      </div>
      <div className="parent-panel practice-panel"><div className="panel-heading"><div><span className="eyebrow">A LITTLE MORE PRACTICE</span><h2>Growing confidence</h2></div><Sparkles size={19} /></div>
        {weakTopics.length ? <div className="practice-suggestions">{weakTopics.slice(0, 3).map((topic) => <div className="suggestion-row" key={topic.id}><span>{topic.icon}</span><div><strong>{topic.title}</strong><p>A few more tries could help this skill stick.</p></div></div>)}</div> : <div className="encouragement-box"><span>🌼</span><p>{totalAnswers ? `${profile.name} is making lovely progress. Keep encouraging curiosity and regular practice!` : 'Every learner grows at their own pace. Explore a topic together whenever they’re ready.'}</p></div>}
      </div>
    </section>
    <p className="parent-footnote"><CircleHelp size={15} /> Learning time is an estimate based on completed lessons. Every child learns in their own way.</p>
  </div>
}

export default App
