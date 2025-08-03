# NurtureUp – Parent Adaptive Interface & Feature Blueprint
*(Living markdown document – export‑friendly, no tables)*

---

## 1 · Purpose
Provide a **single source of truth** for how the NurtureUp **parent‑facing** app adapts from conception through late adolescence, detailing:
* feature sets that appear or retire at each stage,
* UI tone and layout shifts,
* transition mechanics so parents are never surprised,
* guiding principles to keep complexity and cognitive load in check.

---

## 2 · Core Design Principles
1. **Lifecycle Continuity** – one account that travels from TTC (Trying to Conceive) to college drop‑off.  
2. **Progressive Disclosure** – surface only the tools relevant *right now*; unlock deeper modules as confidence grows.  
3. **Privacy‑First & Trust** – end‑to‑end encryption, parental consent flows, region‑aware compliance.  
4. **Cultural & Family‑Model Inclusivity** – gender‑neutral language, configurable roles (parent, guardian, foster, grandparent), support for multicultural holidays.  
5. **Evidence‑Based Guidance** – developmental psychology and pediatric best‑practice woven into every suggestion.  
6. **One‑Handed Operation** – thumb‑reachable CTAs, quick voice input, haptic confirmations.  
7. **Delight Without Over‑Stim** – gentle micro‑animations, color palettes that mature with the child.

---

## 3 · Stage‑by‑Stage Parent Interface Map

### 3.1 TTC & Pregnancy (Planning → Birth)
* **Parent Goals & Context**  
  · Track ovulation and cycles.  
  · Monitor fetal growth and maternal vitals.  
  · Prepare checklists (registry, hospital bag).  
  · Keep non‑gestational partner engaged.
* **Key Modules / Widgets**  
  · Cycle & ovulation tracker with predictive window.  
  · Week‑by‑week fetus growth visualisation.  
  · Health vitals log (weight, BP, mood).  
  · Partner tip‑of‑the‑day feed.  
  · Registry & “count‑down” checklist.
* **Home Dashboard Highlights**  
  · Card stack: *Today’s gestation day*, next appointment, hydration ring.  
  · CTA to add doctor notes or ultrasound photo.
* **Visual & Tone Shifts**  
  · Warm pastels, calm gradients, celebratory confetti for milestones.  
  · Gentle pulse animations signalling fetal heartbeat weeks.
* **Transition Trigger**  
  · Manual due‑date entry → auto‑shift at recorded birth date.

#### 3.1A · Detailed UI Architecture (TTC & Pregnancy)

**Primary Navigation Model**  
A bottom navigation bar with four persistent icons ensures thumb‑reachability:  
1. **Home** – daily snapshot and quick actions.  
2. **Tracker** – log & graph vitals and cycle events.  
3. **Library** – curated content and partner tips.  
4. **Profile** – settings, caregivers, medical info.

*Gesture shortcuts:*  
· Swipe right from Home ⇢ opens *Checklist* overlay.  
· Long‑press Home icon ⇢ quick‑add symptom modal.  
· Shake‑to‑share ultrasound photo (opt‑in).

---

##### Screen‑by‑Screen Breakdown

1. **Home Dashboard (“Today”)**  
   • *Header*: Gestation Day badge (e.g. “Week 18 + 3”), notification bell, settings gear.  
   • *Card 1 – Fetal Growth*: Illustration + size comparison (e.g. “Sweet Potato”). Tap ⇒ detail view.  
   • *Card 2 – Upcoming Appointment*: date, time, clinic map chip; CTA “Add Questions”.  
   • *Card 3 – Hydration Ring*: radial progress + “Log Glass” button.  
   • *Quick‑Action Row*: “Log Symptom”, “Add Photo”, “Checklist”.  
   • *Partner Nudge*: if partner hasn’t opened app in 48 h, shows gentle reminder banner.  
   • **FAB** (Floating Action Button): “+” opens radial menu (Log Symptom, Add BP, Add Weight).  
   • *Navigation cue*: subtle dot row at bottom indicates horizontal peek‑nav to Tracker summary (swipe left).

2. **Tracker**  
   • *Top Tabs*: “Cycle”, “Pregnancy”. Default switches based on conception status.  
   • *Cycle View*: calendar with fertile window shading, basal body temp graph overlay.  
   • *Pregnancy View*: stacked graphs (weight, BP, mood) with pinch‑zoom.  
   • *Data Chips*: today’s entries displayed inline; tap chip ⇒ edit modal.  
   • *Persistent FAB*: “+ Log” context‑aware (symptom if none today, otherwise vitals).  
   • *Overflow Menu*: export PDF for OB‑GYN.

3. **Checklist Overlay**  
   • Opens as 90% height modal from bottom (maintains Home context).  
   • Sections: *First Trimester*, *Second Trimester*, *Third Trimester*, *Registry*, *Hospital Bag*.  
   • Each item: checkbox + optional note. Checked items roll to bottom (“Done” cluster).  
   • *Add Item* button bottom‑sticky; uses natural‑language input (“Pack swaddle blankets”).  
   • Progress header shows % complete per section.  
   • Swipe down to dismiss.

4. **Library**  
   • *Search Bar* with voice input.  
   • *Featured Article* hero card (rotates daily).  
   • *Feed Sections*: “This Week’s Development”, “Nutrition”, “Partner Corner”.  
   • Content cards include 2–minute read time tag, save icon.  
   • Partner tips flagged with special icon; share back‑to‑Home banner on save.

5. **Profile**  
   • *Profile Header*: photo, preferred name, gestational week.  
   • *Caregivers List*: manage invite links, roles toggles.  
   • *Medical Info*: blood type, allergies, due date edit.  
   • *Notification Preferences*: per‑module toggles.  
   • *Data & Privacy*: export, delete, permissions.  
   • *Support*: chat, FAQs, feedback.

---

##### Navigation & Prioritization Logic
* **Visual Hierarchy**: Home is first tab and auto‑opens; Tracker is second because logging is frequent; Library and Profile less frequent.  
* **Return‑to‑Home**: tapping Home icon when already on Home scrolls to top and triggers subtle pulse on FAB – affordance for quick log.  
* **Deep Links**: push notifications for appointment reminders open Tracker ▸ Pregnancy ▸ Appointment card in expanded state.  
* **Accessibility**: WCAG AA color contrast, resizable text, haptic feedback for page change.

---

##### Key Buttons & CTAs
| Context | Button | Function | Placement |
| – | – | – | – |
| Home | **+** (FAB) | Opens radial quick‑log menu | Bottom‑right | 
| Card 1 | “View Details” | Opens trimester‑specific growth info | Card footer |
| Card 2 | “Navigate” | Launches preferred map app to clinic | Card footer |
| Tracker | “Export PDF” | Shares graphed data to email | Overflow menu |
| Checklist | “Add Item” | Natural‑language checklist entry | Bottom bar |
| Library | “Save” | Adds article to Saved list | Card corner |
| Profile | “Invite Caregiver” | Generates invite link/QR | Caregivers section |

---

##### Empty‑State & Edge‑Case UX
* If due date not set, Home shows *Set Due Date* CTA banner; other features limited.  
* If no vitals logged for 3 days, Tracker surfaces *Log Weight?* ghost card with nudge.  
* If partner role exists but app not installed, Partner Tips feed shows install prompt.

---

_End of TTC & Pregnancy UI specification. Next phase UI specs will follow in subsequent iterations._
  · Manual due‑date entry → auto‑shift at recorded birth date.

### 3.2 Newborn / Infant (0–12 months)
* **Parent Goals & Context**  
  · Log feeds, sleep, diapers.  
  · Track growth percentiles.  
  · Capture developmental “firsts.”  
  · Prepare for regular pediatric check‑ups.
* **Key Modules / Widgets**  
  · One‑tap logging tiles (feed, diaper, sleep).  
  · Growth chart synced to WHO curves.  
  · Milestone camera with auto‑date sticker.  
  · Pediatric visit prep checklist.  
  · Sleep trends sparkline dashboard widget.
* **Home Dashboard Highlights**  
  · Ring widgets: last feed, last nap, diaper count.  
  · Sleep trends mini‑graph.
* **Visual & Tone Shifts**  
  · Soft neutrals, low‑stim icons, subtle haptics.  
* **Transition Trigger**  
  · Child age ≥ 1 year **and** parent confirmation (can postpone).

#### 3.2A · Detailed UI Architecture (Newborn / Infant)

**Primary Navigation Model**  
A bottom navigation bar with four persistent icons (thumb‑reachable):  
1. **Home** – live care snapshot and quick actions.  
2. **Log** – feeds, sleep, diapers, meds.  
3. **Growth** – percentile graphs & measurements.  
4. **Profile** – child info, caregivers, immunizations.

*Gesture shortcuts:*  
· Swipe right from Home ⇢ opens *Pediatric Checklist* overlay.  
· Long‑press “Log” icon ⇢ starts default log (Feed).  
· Double‑tap Home header ⇢ scrolls to top and pulses FAB.

---

##### Screen‑by‑Screen Breakdown

1. **Home Dashboard (“Today”)**  
   • *Header*: Baby avatar + age badge (e.g. “Day 87”), notification bell.  
   • *Card 1 – Feed Ring*: circular progress since last feed; center tap ⇒ “Log Feed” modal.  
   • *Card 2 – Sleep Tracker*: last 24 h bar graph w/ total hours; tap ⇒ Sleep Log tab.  
   • *Card 3 – Diaper Count*: wet / dirty tally for day; tap ⇒ Diaper Log tab.  
   • *Card 4 – Milestone Spotlight*: thumbnail of latest milestone or CTA “Capture Moment”.  
   • *Card 5 – Next Pediatric Visit*: date/time, clinic map chip; CTA “Add Questions”.  
   • *Quick‑Action Row*: “Log Feed”, “Log Sleep”, “Log Diaper”, “Add Photo”.  
   • **FAB**: “+” opens radial menu (Feed ▸ Bottle/Breast, Sleep, Diaper, Pump, Note).  
   • *Navigation cue*: horizontal dot row signals swipe to Log summary.

2. **Log Center**  
   • *Top Tabs*: **Feed**, **Sleep**, **Diaper**, **Other**.  
   • **Feed Tab**: timeline list (time, type, amount, side); “Add Feed” button; toggle Bottle ↔ Breast default.  
   • **Sleep Tab**: interactive 24 h bar graph; *Start Nap* timer; swipe to end.  
   • **Diaper Tab**: timeline list with emoji wet/dirty icons; “Add Diaper” button.  
   • **Other Tab**: meds, pumping, notes with tag chips.  
   • Persistent FAB mirrors tab context.

3. **Growth Tracker**  
   • Graph carousel: Weight / Length / Head Circumference percentiles.  
   • Toggle Weeks ↔ Months axis.  
   • “Add Measurement” CTA (megaphone icon) top‑right.  
   • Share icon exports PDF/PNG for pediatrician.  
   • Alert banner if measurement overdue (>2 weeks).

4. **Moments Gallery**  
   • Grid layout with auto‑sorted milestone tags (First Smile, First Roll).  
   • “Capture Moment” floating camera button.  
   • Edit modal: crop, tag, share to social (permissioned).  
   • Search bar filters by milestone tag.

5. **Profile**  
   • Baby info card: photo, full name, DOB, gestational age at birth.  
   • *Caregivers* list with role chips and invite/ revoke.  
   • *Immunizations*: checklist cards with due date, status, doc upload.  
   • *Connected Devices*: baby monitor, smart‑scale toggles.  
   • *Data & Privacy*: export JSON/CSV, delete data, permissions.

---

##### Navigation & Prioritization Logic
* **Visual Hierarchy**: Home opens by default; Log second due to high‑frequency entries; Growth third; Profile last.  
* **Return‑to‑Home**: tapping Home when already on Home scrolls up and pulses Feed Ring.  
* **Deep Links**: push notification “Time for next feed” opens Log ▸ Feed modal.  
* **Accessibility**: 48 px touch targets, dark mode default on dim ambient light, voice commands for logging.

---

##### Key Buttons & CTAs
| Context | Button | Function | Placement |
| Home | **+** (FAB) | Radial quick‑log | Bottom‑right |
| Feed Ring | “Log Feed” | Opens Feed modal | Center of ring |
| Sleep Card | “Start Nap” | Starts sleep timer | Card footer |
| Ped Visit | “Navigate” | Opens preferred map app | Card footer |
| Log Center | “Add” | Adds entry based on tab | Top‑right |
| Growth | “Add Measurement” | Opens measurement modal | Top‑right |
| Moments | “Capture Moment” | Launches camera | Floating button |
| Profile | “Invite Caregiver” | Generates invite link/QR | Caregivers section |

---

##### Empty‑State & Edge‑Case UX
* **First‑Launch**: guided logging tutorial overlay prompts first Feed entry.  
* **No Feed in 4 h**: Home shows red pulse behind Feed Ring with “Log Feed?” banner.  
* **Measurement Overdue**: Growth graph ghosts future plot area and shows “Update Weight” CTA.  
* **Premature Baby**: toggling “Premature” in Profile switches growth curves to Fenton charts.

---

_End of Newborn / Infant UI specification._

### 3.3 Toddler (1–3 years)

* **Parent Goals & Context**  
  · Build predictable routines (meals, naps, potty).  
  · Encourage positive behavior with tangible rewards.  
  · Manage tantrums and emotional regulation.  
  · Provide age‑appropriate play ideas that build fine & gross motor skills.

* **Key Modules / Widgets**  
  · Behavior tracker with star rewards.  
  · Potty‑training suite (timer, sticker board).  
  · Play suggestion carousel (STEM, sensory, outdoor).  
  · “Calm‑Down” toolbox (breathing GIF, white‑noise toggle, emotion cards).  
  · Routine scheduler (meal, nap, bath reminders).

* **Home Dashboard Highlights**  
  · Timeline strip: recent behavior events (⭐ earned, 🚩 tantrum).  
  · Reward progress bar – shows stars until next “Treasure Box”.  
  · Routine rings: time since last meal / nap.  
  · Quick‑Action Row: “Log Behavior”, “Start Potty Timer”, “Play Idea”, “Calm‑Down”.

* **Visual & Tone Shifts**  
  · Brighter palette with playful blobs, subtle whoosh sounds on star award.  
  · Larger iconography and tappable areas for on‑the‑move parents.  
  · Sticker animations when goals met.

* **Transition Trigger**  
  · Automatic at child age ≥ 4 years *or* when school start date set (parent can defer).

#### 3.3A · Detailed UI Architecture (Toddler)

**Primary Navigation Model**  
Bottom navigation with four persistent icons:  
1. **Home** – real‑time routine & rewards snapshot.  
2. **Routine** – Behavior & Potty logs.  
3. **Play** – curated play suggestions.  
4. **Profile** – child settings & caregiver management.

*Gesture Shortcuts*  
· Swipe right from Home → opens *Behavior Summary* overlay (star tally, tantrum stats).  
· Long‑press Routine icon → quick‑launch Potty Timer.  
· Shake phone (≥1.2 g) → opens Calm‑Down toolbox fullscreen.

---

##### Screen‑by‑Screen Breakdown

1. **Home Dashboard (“Today”)**  
   • *Header*: Child avatar + age badge (e.g. “2 yrs 3 mos”), notification bell.  
   • *Behavior Timeline*: horizontal scroll chips – ⭐ Positive, 🚩 Tantrum, 🏆 Milestone. Tap chip ⇒ detail modal.  
   • *Reward Progress Bar*: animated star bar; tap ⇒ Treasure Box inventory.  
   • *Routine Rings*: meal ring (fork icon), nap ring (moon icon) show elapsed time; tap ⇒ Log Meal / Start Nap.  
   • *Quick‑Action Row*: 4 buttons as above; icons animate on press.  
   • **FAB**: “+” opens radial menu (Log Behavior, Start Potty, Log Meal, Add Note).

2. **Routine Center**  
   • *Top Tabs*: **Behavior**, **Potty**, **Schedule**.  
   • **Behavior Tab**: vertical timeline list; “Add Behavior” CTA; star picker (1‑3) for positive actions; tantrum type dropdown.  
   • **Potty Tab**: big timer card – Start / Pause; success / accident toggle on stop; sticker board preview.  
   • **Schedule Tab**: draggable routine blocks (Breakfast, Morning Nap, Lunch, etc.); reminds via push.  
   • Persistent FAB context‑aware (“Add Behavior”, “Start Potty”, “Add Routine”).

3. **Play Hub**  
   • Search bar (emoji filters: 🎨 Art, 🔬 STEM, 🏃‍♂️ Gross Motor).  
   • Daily Featured Idea card (image, materials list, dev‑skill tags).  
   • Category carousels; tap card ⇒ step‑by‑step instructions overlay.  
   • Save icon adds to Favorites list; share icon copies link.

4. **Calm‑Down Toolbox**  
   • Fullscreen modal launched from Home or shake gesture.  
   • Tabs: **Breathe**, **Visuals**, **Sounds**.  
   • Breathe: animated bubble to guide inhaling/exhaling cycles.  
   • Visuals: color‑shift gradient or kaleidoscope.  
   • Sounds: white noise, rainfall, heartbeat.  
   • “Exit” requires 2‑second hold (prevents accidental close by toddler).

5. **Profile**  
   • Child info card: name, avatar, birthdate.  
   • *Caregivers*: manage invites, role permissions (can log behavior? can edit schedules?).  
   • *Rewards & Economy*: set star thresholds, add Treasure Box items (images, descriptions).  
   • *Development Goals*: toggle focus areas (language, fine motor) to influence Play feed.  
   • *Privacy & Data*: export logs, reset star count, delete data.

---

##### Navigation & Prioritization Logic
* **High‑Frequency Modules**: Routine center prioritized as second tab for rapid potty & behavior logging.  
* **Play Hub**: third tab; lower frequency but value for inspiration.  
* **Deep Links**: push “Potty Timer” reminder opens Routine ▸ Potty tab auto‑starting timer.  
* **Return‑to‑Home**: double‑tap Home header scrolls timeline to latest and pulses Reward Bar.  
* **Accessibility**: toddler‑safe large icons, screen‑reader labels, haptics for star events.

---

##### Key Buttons, CTAs, and Their Locations
* **FAB (+)** – bottom‑right on Home, opens radial quick actions.  
* **Reward Bar “Treasure Box”** – inside Reward Progress Bar on Home.  
* **“Add Behavior”** – top‑right in Behavior tab.  
* **“Start Potty Timer”** – large button center of Potty tab.  
* **“Add Routine”** – FAB within Schedule tab.  
* **“Save Play Idea”** – corner of play idea card.  
* **“Invite Caregiver”** – inside Profile ▸ Caregivers.  

---

##### Empty‑State & Edge‑Case UX
* **No Behavior logged >24 h**: Behavior Timeline shows ghost chip prompting star award.  
* **Potty Timer not used for 3 days**: subtle banner suggests readiness checklist.  
* **Star Count reaches threshold**: burst animation; opens Treasure Box claim modal.  
* **Overlapping Nap & Meal**: Schedule tab highlights conflict and suggests shift.  
* **Offline Mode**: logs cached until reconnect; Home shows cloud‑slash icon.

---

_End of Toddler UI specification._

### 3.4 Early Childhood (4–6 years)

* **Parent Goals & Context**  
  · Smooth transition to structured schooling and social environments.  
  · Introduce age‑appropriate chores and responsibility.  
  · Strengthen early literacy and numeracy skills through play.  
  · Coordinate family schedules (school, extracurriculars, caregiver shifts).

* **Key Modules / Widgets**  
  · **Chore Board** – drag‑and‑drop tasks linked to child app, star rewards.  
  · **Learning Games Hub** – curated mini‑games (letters, phonics, counting).  
  · **School Readiness Checklist** – vaccines, school supplies, orientation tasks.  
  · **Shared Family Calendar** – unified view of events with color‑coded members.  
  · **Chore Stars Ticker** – running star count toward weekly prize.

* **Home Dashboard Highlights**  
  · *Today’s Agenda* card (events + chore due notifications).  
  · *Chore Stars* ticker with animated stars.  
  · *Quick‑Add* FAB: Chore ▸ Event ▸ Note ▸ Reward.  
  · *Learning Spotlight* — “Letter of the Day” or “Number of the Day”.

* **Visual & Tone Shifts**  
  · Primary‑color accents, badge animations on task completion.  
  · Friendly sans‑serif typography, slight playful motion.  
  · Stickers morph into slightly more mature badge style.

* **Transition Trigger**  
  · Automatic when child age ≥ 7 years (with parent option to defer or preview School‑Age stage).

#### 3.4A · Detailed UI Architecture (Early Childhood)

**Primary Navigation Model**  
A bottom nav bar with four persistent, thumb‑reachable icons:  
1. **Home** – overview dashboard (agenda + stars).  
2. **Chores** – board & rewards.  
3. **Learn** – games hub & progress.  
4. **Calendar** – shared family schedule.  

*Profile & settings* are accessible via the child avatar in the Home header (tap ⇒ Profile sheet). This keeps frequent actions within four‑icon limit.

*Gesture Shortcuts*  
· Swipe right from Home ⇒ opens *School Readiness Checklist* overlay.  
· Long‑press **Chores** icon ⇒ opens quick‑add chore modal.  
· 3‑finger tap anywhere ⇒ toggles *Screen Time Lock* for child device (requires PIN).

---

##### Screen‑by‑Screen Breakdown

1. **Home Dashboard (“Today”)**  
   • *Header*: Child avatar + age badge (e.g. “5 yrs 2 mos”), notification bell.  
   • *Card 1 – Today’s Agenda*: next event, time, location icon; tap ⇒ Calendar Day view.  
   • *Card 2 – Chore Stars*: horizontal star ticker; tap ⇒ Chores tab, Reward Store overlay.  
   • *Card 3 – Learning Spotlight*: interactive tile (flip anim) for “Letter/Number of the Day”; tap ⇒ Learn tab, corresponding game pre‑loaded.  
   • *Quick‑Action Row*: “Add Chore”, “Add Event”, “Start Game”, “Checklist”.  
   • **FAB**: “+” radial menu (Chore, Event, Note, Reward).  
   • *Navigation cue*: horizontal dot row ⇒ peek‑swipe to Chores summary page.

2. **Chores Board**  
   • *Drag‑and‑Drop Grid*: columns “To Do”, “Doing”, “Done”. Tasks represented by cards (icon, label, star value).  
   • “Add Chore” button top‑right; natural‑language entry (“Clean room – 3 stars”).  
   • *Reward Store* button top‑left: opens prize list (set by parent).  
   • *Bulk Edit* mode via long‑press; multi‑select for star value change.  
   • Swipe left on card ⇒ delete; swipe right ⇒ mark complete.  
   • Star burst animation when moved to “Done”.

3. **Learning Games Hub**  
   • Search bar with category chips (Phonics, Counting, Shapes).  
   • *Featured Game* hero card (rotates daily).  
   • *Progress Meter*: ring showing % of weekly learning goal.  
   • Grid of mini‑game cards; each shows skill tags and stars earned.  
   • Timer option for parent‑set play limits.

4. **Shared Calendar**  
   • Month grid; colored dots per family member.  
   • Day view list of events with edit / delete.  
   • “Add Event” FAB (voice to text supported).  
   • Import .ics button for school calendar.  
   • Conflict alerts highlight overlapping events.

5. **School Readiness Checklist Overlay**  
   • Slides up 90% height; sections: *Health*, *Supplies*, *Orientation*.  
   • Checklist items with checkbox + notes; completed items auto‑collapse.  
   • Progress bar per section; confetti animation on 100%.  
   • Share PDF with school option.

6. **Profile Sheet**  
   • Displays when tapping avatar on Home.  
   • Tabs: **Child Info**, **Caregivers**, **Rewards**, **Settings**.  
   • Caregivers manage invites; Rewards to edit star thresholds & store items.

---

##### Navigation & Prioritization Logic
* **High‑Frequency Modules**: Home (always first) and Chores (second) due to daily task flows.  
* **Learn** is third; games accessed a few times per day/week.  
* **Calendar** is fourth; viewed less frequently but critical for planning.  
* **Return‑to‑Home**: tapping Home while on Home scrolls to top and pulses Agenda card.  
* **Deep Links**: notification “Chore due” opens Chores tab with that card highlighted.  
* **Accessibility**: 48 px touch targets, dyslexia‑friendly font toggle, voice‑over labels.

---

##### Key Buttons, CTAs, and Their Locations
* **FAB (+)** – Home & Calendar screens, radial menu (Chore, Event, Note, Reward).  
* **“Add Chore”** – Chores board, top‑right.  
* **“Reward Store”** – Chores board, top‑left.  
* **“Add Event”** – Calendar, bottom‑right FAB.  
* **“Start Game”** – on Learning Spotlight card and within game cards.  
* **Checklist “Share PDF”** – bottom bar of Readiness overlay.  
* **“Invite Caregiver”** – Profile ▸ Caregivers.  

---

##### Empty‑State & Edge‑Case UX
* **No Chores Added Yet**: Chores board shows friendly illustration + “Add first chore” CTA.  
* **Event Conflict**: overlapping events highlighted; dialogue suggests reschedule.  
* **Stars Near Weekly Goal**: ticker pulses yellow at 90% to motivate completion.  
* **Learning Goal Not Met**: Sunday evening banner gently nudges parent to assign game.  
* **Offline Mode**: Calendar in read‑only, new events queued until reconnect.

---

_End of Early Childhood UI specification._

### 3.5 School Age (7–12 years)

* **Parent Goals & Context**  
  · Coordinate homework, extracurriculars, and social events.  
  · Balance screen‑time with real‑world responsibility.  
  · Teach financial literacy through allowance & spending.  
  · Encourage routine self‑care (hygiene, chores) while building independence.

* **Key Modules / Widgets**  
  · **Homework Tracker** – assignments list with due‑date alerts, photo OCR import.  
  · **Activity Calendar** – clubs, sports, play‑dates with clash warnings.  
  · **Mini‑Wallet** – virtual allowance, chore earnings, spending log.  
  · **Screen‑Time Manager** – daily allowance ring, request queue, contract settings.  
  · **Streak Widget** – consecutive homework‑done days, bonus incentives.

* **Home Dashboard Highlights**  
  · *Smart Agenda* card (next assignment + today’s activity).  
  · *Streak Widget* (days of all homework done).  
  · *Screen‑Time Pill* – remaining minutes.  
  · Quick‑Action Row: “Add Homework”, “Add Activity”, “Grant Screen Time”, “Wallet”.

* **Visual & Tone Shifts**  
  · Sleek accent colors, minimal cartoon graphics.  
  · More data‑dense cards; subtle progress animations.  
  · Avatar illustrations swap to stylised profile badges.

* **Transition Trigger**  
  · Automatic when child age ≥ 13 years (parent can preview Teen mode sooner).

#### 3.5A · Detailed UI Architecture (School Age)

**Primary Navigation Model**  
Bottom navigation with four persistent icons:  
1. **Home** – agenda snapshot & quick actions.  
2. **School** – Homework & Activities center.  
3. **Wallet** – allowance & spending.  
4. **ScreenTime** – device‑time rules & requests.  

*Profile & settings* accessible via avatar in Home header (tap ⇒ Profile sheet).

*Gesture Shortcuts*  
· Swipe right from Home ⇒ opens *Homework Board* overlay (Kanban view).  
· Long‑press **ScreenTime** icon ⇒ quick‑grant +15 min modal (PIN protected).  
· Double‑tap Home header ⇒ scroll to top & pulse Smart Agenda card.

---

##### Screen‑by‑Screen Breakdown

1. **Home Dashboard (“Today”)**  
   • *Header*: Child badge (e.g. “Grade 4”), notification bell.  
   • *Card 1 – Smart Agenda*: shows next due assignment, next event time & location; tap ⇒ School ▸ Homework or Activity detail depending on item.  
   • *Card 2 – Streak Widget*: thermometer bar for consecutive homework‑done days; confetti at 7‑day multiples.  
   • *Card 3 – Screen‑Time Pill*: circular ring with remaining minutes; tap ⇒ ScreenTime tab.  
   • *Quick‑Action Row*: “Add Homework”, “Add Activity”, “Grant Screen Time”, “Wallet Overview”.  
   • **FAB**: “+” radial menu (Homework, Activity, Allowance, Note).  
   • Navigation cue: horizontal dots for peek‑swipe to School summary.

2. **School Center**  
   • *Top Tabs*: **Homework**, **Activities**, **Grades** (optional).  
   • **Homework Tab**: list view grouped by due date; each card shows subject, title, due chip, status checkbox.  
      – *Add Homework* button top‑right (manual form or *Scan Diary Photo* OCR).  
      – Swipe right on card ⇒ Mark complete; swipe left ⇒ Edit / Delete.  
      – Overdue items highlight red edge, priority sort.  
   • **Activities Tab**: calendar list (club, sport, lesson); clash warning banner if overlap.  
      – “Add Activity” FAB; color tag for type.  
   • **Grades Tab** (opt‑in): record test scores, view average graph.  
   • Persistent FAB context‑aware (Homework or Activity add).

3. **Mini‑Wallet**  
   • *Balance Header*: current balance chips (cash 🪙 & saved 💾).  
   • *Earnings Feed*: timeline of chore payouts (source, stars/credits).  
   • *Spend Log*: swipe sheet with categories (Toys, Games, Gifts).  
   • *Request Payout* button – parent approves or schedules.  
   • Savings Goal progress ring; tap ⇒ edit goal amount.  
   • Export CSV for allowance history.

4. **Screen‑Time Manager**  
   • *Allowance Ring*: radial graph for today’s minutes granted / used.  
   • *Rules Summary* card: weekday & weekend limits, device list toggle.  
   • *Request Queue*: list of child‑requested bonus time; Accept / Deny buttons (PIN confirm).  
   • *Contract Settings*: define earning rules (e.g. 30 min bonus for chore completion).  
   • “Grant Bonus” FAB; presets +5, +15, +30 min.

5. **Profile Sheet**  
   • Child info, caregiver roles, chore↔ wallet linkage, screen‑time contract overview, privacy/export controls.

---

##### Navigation & Prioritization Logic
* **Home** first, **School** second due to daily academic focus.  
* **Wallet** third – likely accessed weekly.  
* **ScreenTime** last but prominent badge counter appears on icon when request pending.  
* Deep links: homework due notification opens School ▸ Homework tab with card auto‑scrolled & highlighted.  
* Return‑to‑Home: double‑tap Home header scrolls & pulses Streak Widget.  
* Accessibility: color‑blind friendly palette, text scaling, haptic confirm on grant time.

---

##### Key Buttons & CTAs
| Context | Button | Function | Placement |
| Home | **+** (FAB) | Radial: Homework, Activity, Allowance, Note | Bottom‑right |
| Agenda | Subject link | Opens Homework/Activity detail | Card body |
| Homework Tab | “Scan Diary Photo” | Capture homework using camera + OCR | Add Homework form |
| Wallet | “Request Payout” | Sends payout request | Balance footer |
| ScreenTime | “Grant Bonus” | Modal preset time grant | FAB |
| ScreenTime | “Accept/Deny” | Handle child request | Request queue card |
| Profile | “Invite Caregiver” | Generates invite link/QR | Caregivers section |

---

##### Empty‑State & Edge‑Case UX
* **No Homework Added Yet**: friendly monster illustration + “Add first assignment” CTA.  
* **Overdue Homework**: red glow pulse every 4 h until marked done.  
* **Activity Clash**: overlapping events marked with ⚠ icon; conflict alert modal suggests edit.  
* **Screen‑Time Exhausted**: icon grays out; banner suggests outdoor play ideas.  
* **Zero Wallet Balance**: “Earn credits by completing chores” hint appears.  
* **Offline Mode**: agenda read‑only; new logs queued until reconnect.

---

_End of School Age UI specification._

### 3.6 Adolescence (13–18 years)

* **Parent Goals & Context**  
  · Negotiate growing autonomy while maintaining safety nets.  
  · Support mental‑health check‑ins and privacy‑respectful sharing.  
  · Guide college / career preparation (tests, applications, deadlines).  
  · Teach advanced life skills (finance, laundry, cooking, time‑management).  
  · Balance digital freedom with healthy habits.

* **Key Modules / Widgets**  
  · **Today Feed** – unified view of deadlines, mood gauge, and teen posts (permission‑based).  
  · **Planner** – calendar + college timeline + task board.  
  · **Wellbeing Center** – mood tracker, resources, SOS contact flow.  
  · **Life‑Skills Task List** – parent‑assignable modules with teen feedback.  
  · **Privacy & Permissions** – adjustable data‑sharing contracts.  
  · **Location Check‑Ins** – consent‑based optional pings (ETA, geo‑fence alerts).

* **Home Dashboard Highlights**  
  · *Today Feed* card stack: top = next critical deadline, middle = mood pulse, bottom = highlighted life skill.  
  · *Screen‑Time Pill* appears only if limits active.  
  · Quiet nudges appear if mood dips for 3+ consecutive days.

* **Visual & Tone Shifts**  
  · Neutral palette (charcoal, teal accents) with minimal illustration.  
  · Reduced gamification, more data‑centric widgets.  
  · Text + micro‑icons replace cartoon badges.

* **Transition Trigger**  
  · Auto‑shift at 13th birthday **or** parent/teen jointly enabling “Teen Mode” sooner.  
  · Exit when teen archived to *Alumni* view (e.g., college move‑in).

#### 3.6A · Detailed UI Architecture (Adolescence)

**Primary Navigation Model**  
A bottom nav bar with **four** thumb‑reachable icons:  
1. **Home** – Today Feed & quick actions.  
2. **Planner** – calendar, tasks, college timeline.  
3. **Wellbeing** – mood check‑ins, resources, SOS.  
4. **Profile** – privacy agreements, caregivers, settings.

*Gesture Shortcuts*  
· Swipe right from Home ⇒ opens *College Timeline* overlay.  
· Long‑press **Wellbeing** icon ⇒ quick‑add mood check‑in.  
· Two‑finger swipe down on Home ⇒ opens *Location Check‑In* prompt.  
· Shake device (teen side) ⇒ SOS modal (panic button) if enabled.

---

##### Screen‑by‑Screen Breakdown

1. **Home (“Today Feed”)**  
   • *Header*: Teen avatar + grade badge (e.g. “11th Grade”), privacy shield icon shows sharing level; tap ⇒ quick‑adjust contract (PIN).  
   • *Card 1 – Deadline Alert*: next SAT/assignment deadline; CTA “Open Planner”.  
   • *Card 2 – Mood Pulse*: latest emoji with 7‑day sparkline; tap ⇒ Wellbeing ▸ History.  
   • *Card 3 – Highlighted Life Skill*: e.g., “Laundry 101 · 60% done”; tap ⇒ Life‑Skills checklist.  
   • *Card 4 – Parental Nudge (conditional)*: e.g., “Haven’t checked in since yesterday – Send 👍?”  
   • **FAB**: “+” radial menu (Add Task, Log Mood, Check‑In, Note).  
   • Horizontal swipe reveals Planner summary view.

2. **Planner**  
   • *Top Tabs*: **Calendar**, **Tasks**, **College**.  
   • **Calendar Tab**: month/week toggle, color by category (school, social, family).  
   • **Tasks Tab**: Kanban columns – To Do, In Progress, Done; tasks created by teen or parent; points value optional.  
   • **College Tab**: vertical timeline of tests (PSAT, SAT, ACT), application due dates, financial‑aid milestones; CTA “Add School”.  
   • Search bar filters across tabs; persistent FAB context‑aware.

3. **Wellbeing Center**  
   • *Mood Check‑In* button – emoji slider + optional note; privacy dropdown (share, summary‑share, private).  
   • *History Graph*: selectable 7‑, 30‑, 90‑day views.  
   • *Resource Library*: articles, helplines, chat links; flagged items if mood dips.  
   • *SOS Button*: long‑press to contact preset emergency guardian or helpline.  
   • Parental view: only aggregate info unless teen shared specific entry.

4. **Life‑Skills Task List**  
   • Category chips (Finance, Home, Health, Social).  
   • Task cards: title, due date, XP value, self‑assessment checkbox; evidence upload optional.  
   • Progress ring for each category; confetti on 100%.  
   • “Add Task” FAB; parent vs teen toggle determines visibility.

5. **Location Check‑Ins**  
   • Map preview card shows last ping + ETA home.  
   • Consent slider: Off → School Hours → Always.  
   • Geo‑fence create button for safe zones (home, school, friend’s).  
   • Alerts list (arrived, left) with timestamp.

6. **Profile & Privacy**  
   • Tabs: **Account**, **Caregivers**, **Privacy**, **Data**.  
   • *Privacy Contract* editor: share levels per module; requires teen + parent biometric or PIN.  
   • Connected services (college portals, bank API, device tracking) toggles.  
   • Data export/erase tools.

---

##### Navigation & Prioritization Logic
* **Home** remains first for daily snapshot.  
* **Planner** second due to academic + task demands.  
* **Wellbeing** third, surfaced via proactive nudges.  
* **Profile** last but icon badge (!) appears when contract changes pending.  
* Deep links: college deadline notification opens Planner ▸ College with highlighted milestone.  
* Return‑to‑Home: double‑tap Home header scrolls top and pulses Mood Pulse card.  
* Accessibility: color‑blind palette, dark mode default, haptic confirm for SOS.

---

##### Key Buttons & CTAs & Their Locations
| Context | Button | Function | Placement |
| Home | **+** (FAB) | Add Task, Log Mood, Check‑In | Bottom‑right |
| Deadline Card | “Open Planner” | Opens Planner tab to relevant entry | Card footer |
| Mood Pulse | “See History” | Opens Wellbeing ▸ History | Card footer |
| Planner | “Add Task” | Creates task (teen/parent) | FAB |
| College Tab | “Add School” | Adds college to list | Top‑right |
| Wellbeing | “Log Mood” | Emoji slider modal | Header |
| Wellbeing | “SOS” | Emergency call sequence | Bottom bar |
| Life‑Skills | “Add Task” | Opens task builder | FAB |
| Location | “Create Geo‑Fence” | Safe zone setup modal | Geo‑fence section |
| Profile | “Edit Contract” | Opens Privacy Contract editor | Privacy tab |

---

##### Empty‑State & Edge‑Case UX
* **No Mood Logged in 3 days**: Wellbeing badge pulses; optional parent nudge appears.  
* **Deadlines Missed**: Planner timeline highlights in red; Home feed shows “Past Due” chip.  
* **Privacy Contract Pending**: Profile icon shows shield‑warning; Home card prompts review.  
* **Location Sharing Off**: Home feed card offers one‑tap share for 8 h.  
* **SOS Triggered**: Home feed shows post‑event well‑being resources and follow‑up prompt.  
* **Offline Mode**: feed cached; location & mood logs queued until reconnect.

---

_End of Adolescence UI specification._

---

## 4 · Multi‑Child & Shared‑Caregiver Experience
* When multiple kids exist, the dashboard defaults to the youngest child with urgent needs; horizontal child‑avatar carousel for quick switch.  
* Shared caregivers (partner, nanny, grandparent) view real‑time status chips (✔ done, ⟳ pending) on each module they have permission for.

---

## 5 · Stage Transition Experience
1. **Preview Banner** – appears two weeks before a stage shift; parents can tour upcoming tools or snooze.  
2. **Guided Tour** – first post‑shift launch triggers a 90‑second, skippable walkthrough.  
3. **Data Carry‑Forward** – historical graphs accessible via swipe‑back history and timeline filter.  
4. **Opt‑Out Controls** – parents may postpone, fast‑track, or revert a stage from *Settings ▸ Child Profile ▸ Stage Control*.

---

## 6 · Personalization Engine (v1)
* **Rule‑Based Core**  
  · Primary key = child age (months until age 6, years thereafter).  
  · Modifiers: parent‑flagged concerns (e.g. “speech delay”), cultural profile (holiday packs), connected IoT devices (baby monitor, smartwatch).
* **Feed Ranking Formula**  
  `card_score = relevance × recency × engagement_weight`  
  · Relevance: stage‑matching tag weight.  
  · Recency: exponential decay over 7 days.  
  · Engagement: boosted by prior parent interactions with similar cards.
* **v2 Roadmap**  
  · ML prediction of “next likely task” based on sensor + manual logs.  
  · UI navigation reorder based on feature frequency.

---

## 7 · Open Questions & Next Steps
* Should teen privacy controls live *inside* the parent app behind biometric auth, or in a separate web dashboard?  
* What KPI best measures satisfaction with stage transitions (e.g. % of parents who keep default timing vs postpone)?  
* Which cross‑platform motion library yields the most consistent micro‑interaction feel (Lottie vs Rive vs native)?  
* **Action Item:** draft low‑fidelity wireframes for Newborn dashboard and stage‑transition preview banner.  
* **Action Item:** schedule user interviews with parents of 8–16 y/o to validate autonomy features.

---

## 8 · Cross‑Stage System Modules

### 8.1 Notification & Nudge Framework
* **Channel Mix** – in‑app push (default), email digest (weekly), optional SMS for critical alerts.  
* **Quiet Hours** – parent‑defined window suppresses non‑urgent pushes; emergencies bypass with distinct vibration pattern.  
* **Smart Scheduling** – notifications bundled if >3 event triggers within 30 min, reducing alert fatigue.  
* **Priority Ladder**  
  1. Safety (SOS, geo‑fence breach)  
  2. Health (meds, vaccination due)  
  3. Time‑Sensitive Tasks (homework due today)  
  4. Nudges (learning goal incomplete)  
* **A/B Buckets** – alternate copy styling (“Action‑First” vs “Context‑First”) to optimise click‑through.

### 8.2 Insight & Analytics Dashboard
* **Weekly Digest** – emailed PDF or in‑app carousel summarising: sleep averages, chore completion rate, screen‑time trends, mood variance.  
* **Trend Detection** – 14‑day moving average flags significant deltas (>20% change).  
* **Milestone Highlights** – auto‑generates share card when developmental or academic milestone logged.  
* **Retention Heatmap** – visualises app engagement per module to guide progressive disclosure tweaks.

### 8.3 Caregiver Onboarding & Role Permissions
* **Invite Flow** – QR or link with time‑bound token (24 h) and default role suggestion (Partner, Grandparent, Nanny).  
* **Permission Matrix**: Log Only ▸ View & Log ▸ Edit Schedules ▸ Admin.  
* **Guardian Modes** – Temporary Caregiver (expires after set days) and Emergency Guardian (SOS contact only).  
* **Onboarding Tour** – tailored mini‑tutorial depending on role; e.g., Grandparent gets overview of Photo & Moments, Nanny focused on Log Center.

### 8.4 Data Sync & Offline Strategy
* **On‑Device Vault** – Realm/SQLite encrypted store; writes logged with vector clocks.  
* **Event Queue** – retry with exponential back‑off; collision resolved via last‑write‑wins + merge prompts for critical (e.g., medical data).  
* **Bandwidth Saver Mode** – defers photo uploads to Wi‑Fi; low‑res placeholder displayed meanwhile.

### 8.5 AI Assistant & Natural‑Language Input
* **Contextual Slash Commands** – “/add chore vacuum 3 stars” parses into Chore Board.  
* **Conversational UI** – GPT‑powered chat suggests play ideas, answers parenting Q&A, summarises last week insights.  
* **Privacy Guardrails** – all assistant prompts stay on‑device unless user opts‑in to cloud analysis; PII redacted server‑side.

---

## 9 · Roadmap & Milestones
| Phase | Target Date | Scope Highlights | Success Metric |
| Alpha (Private) | 2026‑Q1 | TTC/Pregnancy + Newborn modules, core data sync | DAU ≥ 1 k, churn < 25% | 
| Beta (Invite) | 2026‑Q3 | Toddler + Early Childhood, Chore Board, Learning Hub | Weekly retention ≥ 60% |
| Public Launch | 2027‑Q1 | School Age + basic Teen planner, Notification framework | Paid conversion ≥ 8% |
| Teen Expansion | 2027‑Q3 | Full Wellbeing Center, Privacy contracts, AI Assistant v2 | Teen NPS ≥ 30 |
| Cross‑Platform Wearables | 2027‑Q4 | Apple/Android watch quick‑log, haptics | % quick‑logs from wearables ≥ 15 |

*Dependencies:* encryption library selection, pediatric data partnership, LLM hosting compliance.

---

*Add comments or request edits below, and we’ll refine further!*

