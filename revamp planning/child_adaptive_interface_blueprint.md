# NurtureUp – Child Adaptive Interface & Feature Blueprint
*(Living markdown document – export‑friendly, no tables)*

---

## 1 · Purpose
Define how the **child‑facing** NurtureUp app (installed on the child’s own tablet/phone or shown on a shared family device) evolves in tandem with developmental stages. Detail every screen, gesture, CTA, and edge‑case so that an implementation AI can generate pixel‑perfect flows without additional context.

---

## 2 · Core Design Principles
1. **Age‑Appropriate Autonomy** – gradually enlarge the child’s sphere of control while maintaining safety rails.  
2. **Positive Reinforcement & Gamification** – stars, badges, and avatar upgrades substitute for negative feedback.  
3. **Privacy & Safety First** – COPPA / GDPR‑K compliance, no open chats, all data routed through parent consent layer.  
4. **Inclusivity & Representation** – gender‑neutral avatar options, multicultural palettes, neurodiversity‑friendly interactions.  
5. **Motion & Sensory Balance** – delightful micro‑animations that never exceed 4 sec, haptic cues tuned for small hands.  
6. **Offline‑First** – core tasks cached; connectivity required only for sync events.  
7. **Parental Override** – secret gesture (triple‑tap logo + hold 2 s) opens PIN gate for parent quick‑access.

---

## 3 · Stage‑by‑Stage Child Interface Map (overview)
* **0–12 m (Newborn / Infant)** – *No dedicated child UI*; interactions surface on family smart display only (ambient lullaby, photo slideshow).  
* **1–3 y (Toddler)** – tactile star jar, potty timer monster, animated emotions wheel.  
* **4–6 y (Early Childhood)** – chore board mini‑game, phonics arcade, daily avatar outfit quests.  
* **7–12 y (School Age)** – homework dojo, allowance wallet, badge leaderboard with friends (family‑only).  
* **13–18 y (Adolescence)** – planner Kanban, mood journal, life‑skills XP, minimal gamification.

---

## 4 · Detailed UI Specification – Toddler Stage (1–3 years)

### 4.1 Context & Goals
Toddlers lack strong reading skills and have limited fine‑motor precision. The UI must rely on **large tappable targets**, bold iconography, and short audio cues. Primary objectives: reward positive behaviors, support potty training, introduce basic routines, and offer calm‑down aids.

### 4.2 Primary Navigation Model
A **persistent bottom nav bar** with four icon‑only buttons (labels announced via audio on first use):  
1. **Home** 🏠 – Star Jar & routine rings.  
2. **Potty** 🚽 – potty monster timer.  
3. **Play** 🎈 – curated play ideas & mini‑games.  
4. **Calm** 🌈 – emotion wheel & soothing tools.

Parent settings hide behind secret gesture; no visible settings icon for child.

### 4.3 Gesture Shortcuts
* **Shake device** (>1.0 g) ⇒ launches Calm screen immediately (emergency de‑escalation).  
* **Long‑press Home** (>700 ms) ⇒ verbal "Great job!" audio and star shower animation (reinforce exploration).  
* **Swipe down anywhere** ⇒ exits current game to Play lobby.

### 4.4 Screen‑by‑Screen Breakdown

#### 4.4.1 Home (Star Jar)
* **Header** – friendly mascot speaking today’s positive mantra ("Let’s have fun cleaning!"). Tappable to replay.  
* **Star Jar** – large glass jar occupying 50 % height, shows collected stars floating; tap star triggers sparkle + count voice‑over ("Three stars!").  
* **Routine Rings** – two concentric rings under jar: Meal 🍴 and Nap 🌙 timers. Rings fill from 0 → 360° over parent‑defined interval; when full the ring pulses yellow.  
* **Action Buttons Row** (bottom center):  
  · **➕ Star** – adds star (greyed unless triggered via parent API call).  
  · **🎉 Dance** – plays 5‑sec celebration GIF; usable once per hour.  
  · **🚀 Go Play** – shortcut to Play tab.
* **Navigation Cue** – tiny indicator dots encourage horizontal swipe to Potty screen.
* **Audio & Haptics** – every tap gives subtle vibration (<30 ms); star add uses twinkling chime.

#### 4.4.2 Potty Monster
* **Hero Monster** – animated friend sitting on potty seat; idle breathing loop.  
* **Timer Button** – huge circular "Start Timer"; once tapped, monster reads "Let’s try for two minutes!" and timer counts down.  
* **Sticker Board Preview** – after successful timer completion, child chooses one sticker (scrollable list of 8) to place onto board behind monster.  
* **Accident Button** – small corner button (red droplet) for parent use; long‑press 2 s to avoid accidental taps.  
* **Progress Banner** – top banner shows "3 stickers to next Surprise"; confetti on reward.

#### 4.4.3 Play Lobby
* **Daily Featured Game** – large tile top: auto‑rotating (memory flip, color match, simple puzzles). Tap launches sub‑app; max 3‑min session enforced.  
* **Idea Carousel** – horizontally scrollable cards with photo + 1‑word label ("Stack", "Paint"); tapping card speaks instructions and shows 3‑step pictorial guide.  
* **Favorites Row** – last 4 played items pinned bottom; long‑press heart to un‑favorite.  
* **Session Timer** – subtle bar top‑right counts total Play time; defaults 15 min/day; turns yellow at 90 %, red at limit then auto‑returns to Home.

#### 4.4.4 Calm (Emotion Wheel)
* **Wheel Picker** – full‑screen radial dial with 6 emoji faces (Happy, Sad, Mad, Tired, Scared, Calm). Child spins wheel; selected face grows and says emotion word aloud.  
* **Follow‑Up Modal** – depending on emotion, presents coping activity:  
  · *Mad* ⇒ bubble pop game (tap bubbles to release anger).  
  · *Sad* ⇒ breathing flower animation; inhaling expands petals.  
  · *Tired* ⇒ lullaby audio + dimmed night gradient.  
* **Exit Button** – top‑right "I feel better"; requires 2‑sec hold to ensure intent.

### 4.5 Navigation & Prioritization Logic
* Child lands on **Home** by default (Star Jar priority).  
* **Potty** is second due to training frequency.  
* **Play** third; **Calm** last but accessible via shake gesture.  
* Auto‑return to Home after 30 s of inactivity on any screen.

### 4.6 Key Buttons & CTAs (Toddler)
* **➕ Star** – adds star; greyed unless parent send event via BLE/API.  
* **Start Timer** – Potty monster main button.  
* **Sticker Choice** – tap sticker; confirmation audio "Stuck!".  
* **Daily Game Tile** – launches game; plays swoosh sound.  
* **Emotion Wheel Exit** – long‑hold 2 s; subtle progress ring shows hold duration.

### 4.7 Empty‑State & Edge‑Case UX
* **No Stars Yet** – Star Jar half‑filled with faint outline; tapping triggers friendly voice "Let’s earn stars by helping!".  
* **Potty Timer Used <3 times/week** – monster appears bored, speech bubble suggests trying again.  
* **Play Time Limit Reached** – Play lobby greys out, mascot prompts "Time to rest our eyes!" and returns Home.  
* **Offline Mode** – stars earned locally; sync badge appears top‑left until connection restored.

---

---

## 5 · Detailed UI Specification – Early Childhood Stage (4–6 years)

### 5.1 Context & Goals
Children begin to read simple words, understand basic cause‑and‑effect, and crave a sense of accomplishment. The UI must introduce **structured responsibilities (chores), early academics (phonics, numeracy)**, and avatar‑based personalization—while keeping interactions playful and rewarding.

### 5.2 Primary Navigation Model
Bottom nav bar with four icon+label buttons (text below icon for emerging readers):  
1. **Home** 🏡 – Daily Quest & Star Bank.  
2. **Chores** ✅ – interactive board & reward store.  
3. **Learn** 📚 – phonics arcade & counting games.  
4. **Avatar** 🎨 – dress‑up & room decor.

Secret parent override remains: triple‑tap logo + 2‑s hold.

### 5.3 Gesture Shortcuts
* **Swipe right** on any screen ⇒ opens Quick Stars overlay (shows today’s earned stars).  
* **Long‑press Chores card** (>600 ms) ⇒ quick mark complete with star burst.  
* **Double‑tap avatar** in Avatar screen ⇒ random silly animation to encourage exploration.

### 5.4 Screen‑by‑Screen Breakdown

#### 5.4.1 Home (Daily Quest Hub)
* **Header** – avatar portrait with dynamic expression (smiles when stars earned).  
* **Daily Quest Card** – three daily tasks auto‑pulled from parent app (e.g., Brush Teeth, Tidy Toys, Feed Pet). Each shows icon + progress bar; tap task brings to Chores screen with card highlighted.  
* **Star Bank** – coin‑jar style counter; tapping jar spills stars animation and speaks total.  
* **Energy Meter** – ring that fills as screen time accrues (if parent enabled). Turns yellow at 80 %; red & locks Learn tab when full.  
* **Quick‑Action Buttons** (bottom area):  
  · **➕ Log Chore** (opens Chores).  
  · **🎮 Play Game** (opens Learn, picks featured game).  
  · **🎁 Spend Stars** (opens Reward Store overlay).  
* **FAB**: “+” radial menu (Add Chore, Start Game, Customize Avatar).

#### 5.4.2 Chores Board
* **Columns** – “To Do” and “Done”. Child drags card to Done to earn stars (haptic click).  
* **Card Anatomy** – icon, short label, star value badge.  
* **Reward Store Button** – top‑right gift icon; opens store overlay with items priced in stars.  
* **Add Chore** button (bottom‑right) only visible if parent allowed; opens simplified form (emoji icon picker, star slider 1‑5).  
* **Bulk Star Burst** – when ≥3 chores moved to Done at once, fireworks overlay plays.

#### 5.4.3 Learn Arcade
* **Skill Tabs**: Phonics, Numbers, Shapes.  
* **Featured Game Banner** – rotates daily; shows XP progress ring.  
* **Game Grid** – cards show skill icon, XP earned, and lock overlay until prerequisite skill reached.  
* **Session Timer** – bar top‑right (parent‑defined). Turns orange when 1 min left; upon expiry, friendly mascot escorts child back Home.  
* **XP to Stars Exchange** – every 100 XP auto‑converts to 1 star (message toast).

#### 5.4.4 Avatar Studio
* **Sections** – Wardrobe, Accessories, Room Decor.  
* **Swipe Carousel** of items; locked items show star cost; tap to purchase.  
* **Try‑On Preview** – drag garment onto avatar; pinch zoom rotates stage.  
* **Save Outfit** button bottom; audio "Looking good!".  
* **Room Decor**: grid furniture items; long‑press to place into draggable room scene.

### 5.5 Navigation & Prioritization Logic
* **Home** opens by default; shows tasks and motivation.  
* **Chores** second for daily responsibilities.  
* **Learn** third; parent can reorder via parent app setting.  
* **Avatar** last but high engagement; star cost gating prevents over‑use.  
* Idle 60 s ⇒ auto‑play calming background music and dim screen.

### 5.6 Key Buttons & CTAs (Early Childhood)
| Context | Button | Function | Placement |
| Home | **🎁 Spend Stars** | Opens Reward Store | Quick‑Action Row |
| Chores | **Gift Icon** | Reward Store overlay | Top‑right |
| Chores | **Add Chore** | New chore modal | Bottom‑right |
| Learn | **Play Game Card** | Launch selected game | Game grid |
| Avatar | **Save Outfit** | Confirms look | Bottom center |
| Reward Store | **Buy** | Deduct stars, unlock item | Item card |

### 5.7 Empty‑State & Edge‑Case UX
* **No Chores Yet** – board displays animated broom sweeping with "Ask your grown‑up to add tasks!" voice‑over.  
* **Insufficient Stars** – jitter animation on locked item; toast "Earn 3 more stars to buy this!"  
* **Session Timer End** – learning arcade fades; mascot waves goodbye.  
* **Offline Mode** – star purchases queued; star jar shows cloud‑slash icon until sync.

---

## 6 · Detailed UI Specification – School Age Stage (7–12 years)

### 6.1 Context & Goals
Kids now possess solid reading skills, basic time‑management awareness, and a growing social identity. The child app must help them **organise schoolwork, manage allowance, and visualise progress** while preserving fun through badges and friendly competition (family‑only leaderboards). Autonomy expands, but parental contract boundaries (screen‑time, spending caps) remain critical.

### 6.2 Primary Navigation Model
Bottom nav bar with four icon+label buttons:  
1. **Home** 🏠 – Smart Agenda & Streaks.  
2. **School** 📓 – homework & activities board.  
3. **Wallet** 💰 – allowance balance & spend log.  
4. **Badges** 🏅 – leaderboard & achievements.

Parent override still via triple‑tap logo + 2‑s hold (PIN).

### 6.3 Gesture Shortcuts
* **Swipe right** from Home ⇒ opens *Quick Add* overlay (Homework, Event, Expense).  
* **Long‑press Homework card** (>700 ms) ⇒ mark complete, star burst animation.  
* **Tilt device left‑right** (±15°) on Badges screen ⇒ medals jingle, subtle parallax.

### 6.4 Screen‑by‑Screen Breakdown

#### 6.4.1 Home (Smart Agenda)
* **Header** – avatar badge with grade ("Grade 4"), settings gear hidden via long‑press.  
* **Smart Agenda Card** – shows next due homework and upcoming activity (time + icon). Tapping item jumps to School tab with item highlighted.  
* **Streak Meter** – consecutive days homework completed; thermometer style bar; pulses at milestones (7, 14, 21).  
* **Screen‑Time Ring** – if limits active, radial graph with remaining minutes. Turns red at 0 and greys apps requiring limit.  
* **Quick‑Action Row**: “Add HW”, “Add Activity”, “Log Expense”, “Spend Stars”.  
* **FAB**: “+” radial (Homework, Activity, Expense, Note).

#### 6.4.2 School Center
* **Top Tabs**: **Homework**, **Activities**, **Grades**.  
* **Homework Tab**  
  · Card list grouped by due date; subject stripe colour‑coded.  
  · Swipe right ⇒ mark complete; left ⇒ edit/delete.  
  · “Scan Diary” button top‑right opens camera with OCR hint overlay.  
* **Activities Tab**  
  · Calendar list; coloured pill per activity type (sport, music).  
  · Conflict alert banner if overlap detected; tap opens edit.  
* **Grades Tab** (optional enable)  
  · Bar chart of recent test scores; tap bar ⇒ detail modal (subject, notes).
* **Persistent FAB** adapts per tab (Add HW / Activity / Grade).

#### 6.4.3 Wallet
* **Balance Header** – total allowance, savings goal progress ring.  
* **Earnings Feed** – chronological list of chores/stars converted to currency; green + amounts.  
* **Spend Log** – red − amounts with category icon; tap for detail & note.  
* **Request Payout** button – sends parent approval push.  
* **Savings Goal Editor** (pencil icon) – set goal item & amount; progress bar updates in real‑time.

#### 6.4.4 Badges & Leaderboard
* **My Achievements Grid** – tiles for milestone badges (Streaks, Grades, Chore Master). Locked tiles grayscale; tap shows requirements.  
* **Family Leaderboard** – horizontal carousel of family avatars ranked by star totals this week.  
* **Challenge Button** – send friendly challenge (“Beat my streak!”) to sibling; parent approval gate.  
* **Share Badge** long‑press ⇒ generates confetti GIF saved locally (share only via parent app).

### 6.5 Navigation & Prioritization Logic
* **Home** default landing.  
* **School** second due to academic urgency.  
* **Wallet** third; weekly engagement.  
* **Badges** last but retains pull via notification dot when new badge earned.  
* Idle 120 s ⇒ dims and shows motivational quote overlay.

### 6.6 Key Buttons & CTAs (School Age)
| Context | Button | Function | Placement |
| Home | **+** (FAB) | Radial add menu | Bottom‑right |
| Agenda Card | Homework/Activity label | Deep‑link to School tab | Within card |
| Homework Tab | **Scan Diary** | Camera OCR add | Top‑right |
| Wallet | **Request Payout** | Sends approval request | Balance footer |
| Badges | **Challenge** | Send challenge | Top‑right |
| Badges | **Share Badge** | Save confetti GIF | Long‑press badge |

### 6.7 Empty‑State & Edge‑Case UX
* **No Homework Added** – Study‑desk illustration + "Add your first assignment!" hint.  
* **Overdue Homework** – card pulses red every 5 min until done.  
* **Zero Balance** – Wallet shows piggybank shaking, message "Earn stars to fill me up!"  
* **Leaderboard Tie** – tie banner shows fireworks, encourages new challenge.  
* **OCR Failure** – friendly retry prompt "Oops, could you take that photo again?".  
* **Offline Mode** – queue banner in School & Wallet; items grey until sync.

---

## 7 · Detailed UI Specification – Adolescence Stage (13–18 years)

### 7.1 Context & Goals
Teens seek **ownership, privacy, and real‑world relevance**. They juggle academics, social life, part‑time work, and mental health. The child app graduates into a **self‑management toolset**: planner, wellbeing center, micro‑financial wallet, and life‑skills XP—all wrapped in a neutral aesthetic. Parental oversight shifts to contract‑based transparency, not constant surveillance.

### 7.2 Primary Navigation Model
Bottom nav bar with four icon+label buttons (accessible one‑handed on phone):  
1. **Home** 🏠 – Personal Feed (deadlines, mood pulse, quick actions).  
2. **Planner** 📅 – calendar, tasks Kanban, college timeline.  
3. **Wellbeing** 💬 – mood logs, resources, SOS.  
4. **Wallet** 💳 – allowance, income, spending & savings goals.

A **Privacy Contract** shortcut (shield icon) sits top‑right on Home header, opening a modal for data‑sharing toggles (PIN / biometric protected).

### 7.3 Gesture Shortcuts
* **Swipe right** from Home ⇒ opens *Quick Add* overlay (Task, Event, Mood, Expense).  
* **Long‑press Wellbeing tab** (>800 ms) ⇒ instant emoji mood picker (slides up bottom sheet).  
* **Two‑finger swipe down** anywhere ⇒ triggers consent‑based *Location Check‑In* prompt (ETA, custom note).  
* **Shake device** 3× within 2 s ⇒ opens SOS modal (requires confirm swipe to call).

### 7.4 Screen‑by‑Screen Breakdown

#### 7.4.1 Home (Personal Feed)
* **Header** – avatar thumbnail, first‑name greeting ("Morning, Alex"), privacy shield icon (color reflects contract level).  
* **Feed Stack** (scrollable):  
  · **Deadline Card** – next academic/college task with due countdown; CTA "Open Planner".  
  · **Mood Pulse Card** – last mood emoji + 7‑day mini‑graph; tap ⇒ Wellbeing ▸ History.  
  · **Financial Snapshot** – wallet balance + savings goal progress ring; tap ⇒ Wallet.  
  · **Life‑Skill Spotlight** – task suggestion (e.g., "Cook Pasta Tonight") with XP value; tap ⇒ Life‑Skills list.  
  · **Nudge Card** (conditional) – gentle reminder if no planner update in 3 days.
* **FAB**: “+” radial menu (Task, Event, Mood, Expense, Check‑In).  
* **Navigation Cue** – horizontal dots indicating feed pages.

#### 7.4.2 Planner
* **Top Tabs**: **Calendar**, **Tasks**, **College**.  
* **Calendar Tab**  
  · Week view default; color‑coded categories (School, Social, Family, Work).  
  · Drag‑and‑drop to reschedule; long‑press event to edit details.  
* **Tasks Tab**  
  · Kanban columns – To Do, Doing, Done.  
  · Cards show subject, priority tag, due badge.  
  · Filter chips (Subject, Priority, Parent‑Assigned).  
* **College Tab**  
  · Vertical timeline (PSAT, SAT, ACT, Applications, FAFSA).  
  · Progress bars per college; tap milestone to mark complete.  
  · "Add School" button top‑right.
* **Persistent FAB** adapts (Add Task / Event / Milestone).

#### 7.4.3 Wellbeing Center
* **Mood Check‑In Button** – big emoji slider; privacy dropdown (Share, Summary‑Only, Private).  
* **History Graph** – selectable 7/30/90‑day; overlay events pins for correlation.  
* **Resources Library** – tiles: articles, videos, helplines. Tag chips (Anxiety, Study Stress).  
* **SOS Button** – fixed bottom bar; long‑press 2 s to unlock then swipe to call chosen guardian or hotline.  
* **Parent View** (if share enabled): shows aggregate mood trend, not specific notes.

#### 7.4.4 Wallet
* **Balance Header** – primary account, savings account toggle tabs.  
* **Income Feed** – job pay, allowance, chore conversions; green + amounts.  
* **Spend Log** – category filter (Food, Transport, Gaming); red − amounts.  
* **Budget Planner** – monthly budget pie; edit via pencil icon.  
* **Savings Goals** – progress bars; "Add Goal" FAB; celebrate on completion (confetti, share card).  
* **Request Transfer** button (if under 16) – sends parent approval.  
* **Financial Literacy Tips** mini‑carousel (links to external resources).

#### 7.4.5 Life‑Skills List (submenu under Planner or Home)
* **Category Chips** – Finance, Home, Health, Social.  
* **Task Cards** – title, XP value, due date; self‑assess "Done" checkbox + evidence upload (photo).  
* **XP Progress Ring** per category; levels unlock new avatar accessories.  
* **Add Task** (+) if parent/teen pact allows custom skills.

### 7.5 Navigation & Prioritization Logic
* **Home** default, summarizing all domains.  
* **Planner** second for academic and scheduling focus.  
* **Wellbeing** third, accessible via feed and nudges.  
* **Wallet** fourth but quick‑access from Home snapshot.  
* Idle 180 s ⇒ dims; displays breathing animation prompt.

### 7.6 Key Buttons & CTAs (Adolescence)
| Context | Button | Function | Placement |
| Home | **+** (FAB) | Radial add menu | Bottom‑right |
| Deadline Card | “Open Planner” | Deep‑link to Planner | Card footer |
| Mood Card | “Log Mood” | Opens mood check‑in slider | Card footer |
| Planner | **Add Task/Event** | Creates new item | FAB |
| College Tab | “Add School” | Adds college | Top‑right |
| Wellbeing | “SOS” | Emergency call flow | Bottom bar |
| Wallet | “Request Transfer” | Sends approval to parent | Balance footer |
| Privacy Shield | “Edit Contract” | Opens sharing toggles | Header icon |

### 7.7 Empty‑State & Edge‑Case UX
* **No Mood Logged 7 days** – Wellbeing tab badge pulses; Home nudge suggests quick check‑in.  
* **Missed Deadline** – Planner shows red overdue banner; Home feed card prompts reschedule.  
* **Budget Overrun** – Wallet pie slice flashes; tip card appears with suggestion.  
* **Privacy Contract Change Pending** – shield icon turns orange; tap to review.  
* **SOS Triggered** – post‑event debrief screen offers resources, option to notify school counselor.  
* **Offline Mode** – tasks & logs cached; check‑in converts to SMS if no data.

---

*Child interface blueprint now covers all stages from Toddler through Adolescence.*

---

## 8 · Design Tokens & Component Library
* **Color Palette**  
  · **Primary**: `#4F8EF7` (trust blue) – main CTAs, icons.  
  · **Secondary**: `#F7B23D` (sunshine gold) – reward indicators.  
  · **Success**: `#3CC168`, **Warning**: `#F7A53D`, **Danger**: `#E45757`.  
  · **Neutrals**: `#0F0F0F`, `#424242`, `#BDBDBD`, `#F5F5F5`, `#FFFFFF`.  
* **Typography**  
  · `Nunito Sans` – headers (700 weight).  
  · `Inter` – body (400/500 weight).  
  · Minimum font size 14 pt on phone; scale via OS settings.  
* **Spacing Scale** – 4‑pt multiples: 4, 8, 12, 16, 24, 32.  
* **Corner Radius** – 12 px default; 24 px for child avatar frames.  
* **Elevation** – 3 levels: Card (2 dp), Modal (8 dp), FAB (12 dp).

### 8.1 Core Components
| Component | Description | Props |
| Card | Elevation 2 dp, shadow rgba(0,0,0,0.15) | icon, title, subtitle, action | 
| FAB | 56 px circle, elevation 12 dp | icon, menuItems[] | 
| RingProgress | Animated sweep; accepts value 0‑100, color token | value, color | 
| Badge | Pill with icon + count | type (success, warning), count | 
| EmojiSlider | Horizontal scrub, 5‑7 steps | steps[], onChange() | 

Component library built in React Native using TypeScript and Styled Components; exported as Storybook catalog for designers & QA.

---

## 9 · Accessibility & Inclusive Design Patterns
* **WCAG 2.2 AA Compliance**: color contrast 4.5:1 for text, 3:1 for large text/icons.  
* **VoiceOver / TalkBack Labels** implemented for every interactive element; custom rotor order on iOS.  
* **Text Size Scaling**: support OS Dynamic Type up to 200 %. Layouts tested for truncation.  
* **Motion Sensitivity**: “Reduce Motion” toggle—disables parallax, replaces confetti with static badge flash.  
* **Color‑Blind Safe**: charts use texture overlays; red/green statuses paired with icon shapes.  
* **Haptics**: 30 ms light impact for success, 70 ms medium for warnings; optional disable in settings.

---

## 10 · Localization & Internationalization
* **Locale Files**: JSON key‑value per language; fallback to `en‑US`.  
* **RTL Support**: auto‑mirrors nav bar order, swipe directions, Kanban columns.  
* **Plural Rules**: ICU MessageFormat (e.g., `{count, plural, one {star} other {stars}}`).  
* **Date/Time Formatting**: luxon with child’s device locale.  
* **Font Substitution**: Noto Sans fallback for CJK scripts.  
* **Cultural Imagery Packs**: avatar skin tones, holiday badge themes loaded via remote config.

---

## 11 · Animation & Motion Guidelines
* **Duration Scale**: XS=150 ms (icon pulse), S=250 ms (button press), M=400 ms (screen transition), L=700 ms (reward confetti).  
* **Easing**: use `cubic‑bezier(0.25, 0.8, 0.5, 1)` for material‑style ease‑out.  
* **Physics**: star burst uses 8 particles, gravity 1500 px/s², fade‑out after 600 ms.  
* **Performance Budget**: keep GPU overdraw <3; limit drop‑shadow layers.  
* **Lottie Animations** compressed <80 KB; stop after 2 loops or when off‑screen.

---

## 12 · Onboarding & Account Linking Flow
1. **Splash → Avatar Choice** (child picks mascot color).  
2. **Pair Code Screen** – 6‑digit code generated in parent app; validates via Firebase Custom Token.  
3. **Stage Detection** – backend calculates child stage from DOB; loads appropriate UI bundle.  
4. **Tutorial Carousel** – 3 contextual slides (swipe to dismiss).  
5. **Reward Preview** – shows first star and how to earn more.  
6. **Accessibility Prompt** – asks if large text, reduced motion preferred.

Edge‑case: if no parent code, app shows demo mode (offline) limited to 60 min play.

---

## 13 · Offline & Data Sync Strategy
* **Local Store**: Realm DB with per‑child partition.  
* **Event Queue**: writes queued; retry exponential back‑off (max 1 h).  
* **Conflict Resolution**: vector clock; merge rules prefer higher star count.  
* **Media Uploads**: images resized to 1280 px max width; stored with UUID, retried on Wi‑Fi only by default.  
* **Encryption**: AES‑256 at rest; TLS 1.3 in transit.

---

## 14 · Performance & Device Compatibility
* **Target FPS**: 60 on ≥A11 / Snapdragon 845; 30 fallback on low‑end devices; dynamic frame throttling on battery saver.  
* **Memory Budget**: ≤150 MB runtime RAM on 2 GB devices; avoid global singletons.  
* **App Size**: ≤80 MB download; use App Thinning / Play Feature Delivery for stage‑specific assets.  
* **Supported OS**: iOS 15+, Android 10+.  
* **Tablet Layouts**: adaptive grids; Home card width `min(400 px, 40 %)`.

---

## 15 · Testing & QA Checklist
* **Unit Tests**: 80 % coverage on business logic (Jest).  
* **UI Tests**: Detox / Espresso flows per stage (Happy Path + Edge Cases).  
* **Accessibility Tests**: Axe‑core automated + manual screen‑reader sweeps.  
* **Localization Snapshots**: Percy diff across 8 languages.  
* **Performance Benchmarks**: navigation cold‑start <1200 ms median.  
* **Security Pen‑Testing**: OWASP Mobile Top 10 compliance, encryption key rotation verified.

---

## 16 · Analytics & Metrics Instrumentation
* **Event Schema**: JSON `event_name`, `child_stage`, `timestamp`, `props`.  
* **Core KPIs**  
  · Daily Active Children (DAC) per stage.  
  · Star Earn Rate (stars/active child/day).  
  · Chore Completion % (completed/assigned).  
  · Learning XP Earned per session.  
  · Mood Check‑In Frequency (teens).  
* **Privacy**: analytics aggregated; no PII, COPPA flag disables personalized ads.  
* **A/B Infra**: feature flag SDK (LaunchDarkly); randomization key = child UUID.

---

*Blueprint enriched with design tokens, accessibility, localization, animation, onboarding, offline strategy, performance benchmarks, QA checklist, and analytics—providing comprehensive guidance for implementation AI.***

