# Changelog

## 0.3.0: Pulse redesign and deployment (13 October 2026)

No medical content changed in this release. Severity is still shown with an icon and a word as well as a colour.

### New look: Pulse

You chose this direction from three options on a design canvas. It builds on the logo's indigo-to-cyan gradient.

- **Colours:**
  - **Light theme:** indigo ink on a pale indigo background.
  - **Dark theme:** deep navy.
  - **Contrast:** all 35 text-and-background pairs pass WCAG AA in each theme, and white text passes on every stop of the gradient.
- **Module colours:** each module keeps one colour everywhere it appears:
  - X-ray: indigo
  - Bone X-ray: violet
  - ECG: rose
  - Blood test: emerald
  - Prescription: amber
  - Symptom guide: cyan
  - Depression screening: violet
  - Vital signs: emerald
- **Components:**
  - primary buttons use the logo gradient;
  - cards are rounder, with soft shadows;
  - severity and review badges are pills;
  - headings are bolder.
- **Landing page:**
  - **Hero:** soft colour glows, and an illustration of the report screen. The illustration is labelled "Example", and screen readers hear it as one described image.
  - **Tools band:** a deep-indigo band for the tools that don't use AI.
- **Dashboard:** a gradient welcome banner, and colour chips on every tile.
- **Page headers and lists:** the analyzer and tool pages show the module's chip in their header. Scan lists and the first aid list use the chips too.
- **Urdu:** highlighted Urdu words use solid indigo instead of gradient text, so the tops of tall Nastaliq letters are never clipped.
- **PDF and browser:** the PDF and the browser theme colour move from teal to indigo.

### Design polish

- **Buttons:**
  - **Primary:** a clean indigo with a light top edge, a thin inner highlight and a tinted shadow. They lift slightly on hover and press down on click. The diagonal logo gradient stays on large surfaces such as banners, where its cyan end doesn't muddy small buttons.
  - **Outline and secondary:** light borders that turn indigo on hover.
  - **Touch targets:** every size keeps 44 px. A larger `xl` size is used for page-level calls to action.
- **Corners:** one ordered scale of 8, 10, 12, 16, 20 and 24 px. Before, `xl` (18 px) was larger than `2xl` (16 px).
  - Buttons, inputs and chips use 16 px.
  - Cards use 20 px.
  - Banners and dialogs use 24 px.
- **Inputs and selects:** 48 px tall, with a lighter border that still meets 3:1 contrast and an indigo focus glow.
- **Tabs:** a segmented pill control.
- **Cards and containers:** alerts, dialogs, menus, empty states, radio cards and every feature card now share the same radius and soft shadow.
- **Public pages:**
  - **Emergency strip:** "Call 1122" and "Call 115" are compact pill buttons, and the strip fits one line on phones.
  - **Hero:** the emergency hint is an aligned callout instead of a loose icon and line, and both buttons are full width on phones.
  - **Footer:** the logo and disclaimer sit beside the links, with the copyright on its own row.
- **Dashboard:** all five analyzers fit one row on wide screens, and the stat numbers line up even when a label wraps.
- **Upload:** the drop zone has a soft indigo outline and an icon chip.

### Deployment

- **Backend:**
  - **Blueprint:** `render.yaml` (at the repository root) deploys it on Render, using Docker in Singapore on the free plan.
  - **Secrets:** `DATABASE_URL` (Neon Postgres) and `GEMINI_API_KEY` are entered in Render. `SECRET_KEY` is generated there.
  - **Database driver:** SQLAlchemy 2.1 changed the default PostgreSQL driver, so `DATABASE_URL` must start with `postgresql+psycopg2://`.
- **Sleeping backend:** Render's free service sleeps after 15 idle minutes and can take about a minute to wake. The frontend therefore:
  - wakes the backend when the landing, sign-in or register page opens;
  - allows API calls up to 75 seconds;
  - after 6 seconds of a slow sign-in, explains that the server is waking up.
- **Fallback backend address:** when `VITE_API_URL` isn't set, the frontend now uses the Render backend instead of the old Cloud Run one.

### Performance

- **Icons:** they load as one file instead of one tiny file each, which removes about a dozen requests from the landing page.
- **Fonts:** Inter is preloaded, so headings don't repaint when it arrives. The Urdu font never loads on English pages.
- **Lighthouse:** mobile emulation on `/` scored 94–95 for performance in three of four local runs, and 100 for accessibility, best practices and SEO. The local preview speaks HTTP/1.1, so this is pessimistic.
- **Landing page JavaScript:** 152 KB gzipped, or 132 KB with brotli as Vercel serves it.

## 0.2.0: frontend rebuild (10 October 2026)

The frontend in `frontend/` was rebuilt on the `frontend-rebuild` branch, one commit per phase. The backend, its API paths and its payloads were not changed.

This file has four parts:

1. [Decisions and details still needed](#decisions-and-details-still-needed)
2. [Medical content changes for clinical review](#medical-content-changes-for-clinical-review)
3. [Removed](#removed)
4. [Changed](#changed), then [Backend follow-ups](#backend-follow-ups-not-done)

## Decisions and details still needed

- **Marketing claims.** None of the 33 claims listed in Phase 0 were confirmed, so all of them were removed and nothing was put in their place. Any of them can come back once someone confirms it.
- **About, Privacy and Terms** are drafts. Each shows a "Draft for review" notice and highlights what is missing:
  - who runs MedCare AI, with an address;
  - a contact email;
  - which Gemini API tier production uses;
  - how long data is kept, and where the database is hosted;
  - liability, governing law and how the terms change.

  None of these pages has had legal review.
- **Gemini terms.** The Gemini API Additional Terms (last modified 28 April 2026) apply to the analyses:
  - on the free tier, Google uses submitted content to improve its products and human reviewers may read it;
  - on the free tier, Google says not to submit sensitive or personal information;
  - on every tier, the Services may not be used "in clinical practice, to provide medical advice".

  This is a business and legal decision for the people who run MedCare AI.
- **Offline first aid.** `/emergency` doesn't work offline yet. Adding that needs a service worker and a new dependency (`vite-plugin-pwa`), and the brief asked for approval first.
- **Vercel.** Rename the environment variable `REACT_APP_API_URL` to `VITE_API_URL`. Until then the app falls back to the production Cloud Run URL.

## Medical content changes for clinical review

English medical instructions were not changed anywhere. Two kinds of change need review:

- **Translations.** Urdu text that was missing or shortened was translated to match the English one to one.
- **Presentation.** These change what a user sees, but not the medical advice:
  - safety notices and helplines were added;
  - severity is now taken from the report's own SEVERITY line;
  - the crisis rule for PHQ-9 item 9 was added.

### Disclaimers

Every AI result shows the same notice, in the user's language. That covers the analyzer result, the report detail page and the doctor's review page. The landing page shows it too.

| English | Urdu |
|---|---|
| AI output is informational, not a diagnosis. | اے آئی کا نتیجہ صرف معلومات کے لیے ہے، یہ تشخیص نہیں ہے۔ |
| A doctor must review it before you act on it. | اس پر عمل کرنے سے پہلے ڈاکٹر کا جائزہ ضروری ہے۔ |
| In an emergency, call 1122 or 115. | ہنگامی صورت میں 1122 یا 115 پر کال کریں۔ |

- **PDF.** The PDF carries the notice in English and Urdu. Every page footer reads "AI output is informational, not a diagnosis · Emergency: 1122 / 115".
- **Public pages.** A strip on every public page offers "Call 1122", "Call 115" and the first aid guide.
- **Old wording.** The old disclaimers were in Roman Urdu only, at the bottom of each module page, and gave no emergency numbers.

### Emergency first aid

- **Access.** First aid moved from `/app/emergency`, which required sign-in, to the public `/emergency`. The old URL redirects.
- **Matching.** English steps, English symptoms and the Urdu titles are unchanged; the tables below are checked against the old code.
- **Step count.** Urdu had 25 steps against 36 in English, and now has all 36:
  - 13 are unchanged;
  - 15 were revised to match the English, including steps that had been merged into one;
  - 8 are new.
- **Symptoms.** All 24 signs and symptoms are newly translated, since there was no Urdu before.

#### Heart attack (دل کا دورہ)

English had 6 steps and Urdu 5; both now have 6.

| # | English (unchanged) | Urdu now | Urdu before | Change |
|---|---|---|---|---|
| 1 | Call emergency services (1122/115) IMMEDIATELY | فوری طور پر ایمرجنسی نمبر 1122/115 پر کال کریں | فوری طور پر ایمرجنسی نمبر 1122/115 پر کال کریں | Unchanged |
| 2 | Have the person sit or lie down comfortably | مریض کو آرام سے بٹھائیں یا لٹائیں | مریض کو بٹھائیں یا لٹائیں | Revised |
| 3 | If prescribed, give 1 aspirin (chewed, not swallowed whole) | اگر ڈاکٹر نے تجویز کی ہو تو ایک اسپرین دیں (گولی چبائی جائے، ثابت نہ نگلی جائے) | اگر ڈاکٹر نے بتائی ہو تو ایک اسپرین دیں | Revised |
| 4 | Loosen tight clothing | تنگ کپڑے ڈھیلے کریں | تنگ کپڑے ڈھیلے کریں | Unchanged |
| 5 | If person becomes unconscious, begin CPR | اگر بے ہوش ہو جائیں تو CPR شروع کریں | اگر بے ہوش ہو جائیں تو CPR شروع کریں | Unchanged |
| 6 | Do NOT leave the person alone | مریض کو اکیلا مت چھوڑیں | — | New (missing in Urdu) |

Signs and symptoms (all four newly translated; there was no Urdu before):

| English (unchanged) | Urdu now |
|---|---|
| Chest pain or pressure | سینے میں درد یا دباؤ |
| Pain in arm, jaw, or back | بازو، جبڑے یا کمر میں درد |
| Shortness of breath | سانس پھولنا |
| Cold sweats, nausea | ٹھنڈا پسینہ، متلی |

#### Choking (گلا بند ہونا)

English had 6 steps and Urdu 3; both now have 6.

| # | English (unchanged) | Urdu now | Urdu before | Change |
|---|---|---|---|---|
| 1 | Ask "Are you choking?" — if they cannot respond, act! | پوچھیں کیا گلے میں کچھ پھنسا ہے — اگر جواب نہ دے سکیں تو فوری عمل کریں | پوچھیں کیا گلے میں کچھ پھنسا ہے — اگر جواب نہ دے سکیں تو فوری عمل کریں | Unchanged |
| 2 | Stand behind the person, wrap arms around waist | مریض کے پیچھے کھڑے ہو کر اپنے بازو اس کی کمر کے گرد لپیٹیں | پیچھے سے بازو لپیٹ کر تیز جھٹکے دیں (ہائم لک) | Revised: old step 2 split into steps 2, 3, 4 |
| 3 | Make a fist with one hand, place above navel | ایک ہاتھ کی مٹھی بنائیں اور اسے ناف سے اوپر رکھیں | پیچھے سے بازو لپیٹ کر تیز جھٹکے دیں (ہائم لک) | Revised: old step 2 split into steps 2, 3, 4 |
| 4 | Perform quick upward thrusts (Heimlich maneuver) | تیزی سے اوپر کی طرف جھٹکے دیں (ہائم لک طریقہ) | پیچھے سے بازو لپیٹ کر تیز جھٹکے دیں (ہائم لک) | Revised: old step 2 split into steps 2, 3, 4 |
| 5 | Repeat until object is expelled or person becomes unconscious | یہ عمل دہراتے رہیں جب تک چیز باہر نہ نکل آئے یا مریض بے ہوش نہ ہو جائے | — | New (missing in Urdu) |
| 6 | If unconscious, call emergency and start CPR | اگر بے ہوش ہو جائیں تو ایمرجنسی کال کریں اور CPR شروع کریں | بے ہوش ہو جائیں تو CPR شروع کریں | Revised |

Signs and symptoms (all four newly translated; there was no Urdu before):

| English (unchanged) | Urdu now |
|---|---|
| Cannot speak, cry, or breathe | بول، رو یا سانس نہ لے سکنا |
| Clutching throat (universal sign) | گلا پکڑنا (عالمی علامت) |
| Coughing weakly or not at all | کمزور کھانسی یا بالکل کھانسی نہ آنا |
| Skin turning blue | جلد کا نیلا پڑ جانا |

#### Burns (جلنا)

English had 6 steps and Urdu 4; both now have 6.

| # | English (unchanged) | Urdu now | Urdu before | Change |
|---|---|---|---|---|
| 1 | Remove from heat source immediately | آگ/گرمی سے فوری دور کریں | آگ/گرمی سے فوری دور کریں | Unchanged |
| 2 | Cool the burn under running water for 10-20 minutes | جلی ہوئی جگہ کو 10-20 منٹ تک بہتے پانی کے نیچے ٹھنڈا کریں | 10-20 منٹ ٹھنڈا پانی ڈالیں | Revised |
| 3 | Do NOT use ice, butter, or toothpaste | برف، مکھن یا ٹوتھ پیسٹ نہ لگائیں | برف، مکھن یا ٹوتھ پیسٹ نہ لگائیں | Unchanged |
| 4 | Cover loosely with clean, non-stick bandage | صاف اور نہ چپکنے والی پٹی سے ڈھیلا سا ڈھانپیں | صاف پٹی سے ڈھانپیں | Revised |
| 5 | Take over-the-counter pain relief if needed | ضرورت ہو تو بغیر نسخے کے ملنے والی درد کی دوا لیں | — | New (missing in Urdu) |
| 6 | Seek medical help for burns larger than palm size | اگر جلی ہوئی جگہ ہتھیلی سے بڑی ہو تو طبی مدد حاصل کریں | — | New (missing in Urdu) |

Signs and symptoms (all four newly translated; there was no Urdu before):

| English (unchanged) | Urdu now |
|---|---|
| Red, swollen, painful skin | سرخ، سوجی ہوئی اور دردناک جلد |
| Blisters forming | چھالے بننا |
| White or charred skin (severe) | سفید یا جھلسی ہوئی جلد (شدید) |
| Intense pain or numbness | شدید درد یا سن ہو جانا |

#### Severe bleeding (شدید خون بہنا)

English had 6 steps and Urdu 4; both now have 6.

| # | English (unchanged) | Urdu now | Urdu before | Change |
|---|---|---|---|---|
| 1 | Apply firm, direct pressure with clean cloth | صاف کپڑے سے زخم پر براہِ راست اور مضبوطی سے دباؤ ڈالیں | صاف کپڑے سے زخم پر دبائیں | Revised |
| 2 | Keep pressing — do NOT lift to check | دبائے رکھیں — چیک کرنے کے لیے نہ اٹھائیں | دبائے رکھیں — چیک کرنے کے لیے نہ اٹھائیں | Unchanged |
| 3 | Elevate the injured area above heart level | زخمی حصے کو دل سے اونچا رکھیں | زخمی حصے کو دل سے اونچا رکھیں | Unchanged |
| 4 | Call emergency services if bleeding doesn't stop in 10 min | 10 منٹ میں نہ رکے تو ایمرجنسی کال کریں | 10 منٹ میں نہ رکے تو ایمرجنسی کال کریں | Unchanged |
| 5 | If blood soaks through, add more cloth on top | اگر خون کپڑے سے رس کر باہر آ جائے تو اوپر مزید کپڑا رکھ دیں | — | New (missing in Urdu) |
| 6 | Keep the person calm and lying down | مریض کو پرسکون اور لیٹا ہوا رکھیں | — | New (missing in Urdu) |

Signs and symptoms (all four newly translated; there was no Urdu before):

| English (unchanged) | Urdu now |
|---|---|
| Blood soaking through bandages | پٹی سے خون رسنا |
| Blood spurting from wound | زخم سے خون کی دھار نکلنا |
| Large pool of blood | زیادہ مقدار میں خون جمع ہونا |
| Person becoming pale/weak | مریض کا پیلا یا کمزور پڑنا |

#### Fracture (ہڈی ٹوٹنا)

English had 6 steps and Urdu 4; both now have 6.

| # | English (unchanged) | Urdu now | Urdu before | Change |
|---|---|---|---|---|
| 1 | Do NOT move the injured area | زخمی حصے کو ہلائیں نہیں | زخمی حصے کو ہلائیں نہیں | Unchanged |
| 2 | Immobilize the limb with a splint | کھپچی باندھ کر حرکت بند کریں | کھپچی باندھ کر حرکت بند کریں | Unchanged |
| 3 | Apply ice pack wrapped in cloth (15 min on, 15 off) | برف کو کپڑے میں لپیٹ کر لگائیں (15 منٹ لگائیں، 15 منٹ ہٹا دیں) | برف کپڑے میں لپیٹ کر لگائیں | Revised |
| 4 | Control swelling by elevation | متاثرہ حصے کو اونچا رکھ کر سوجن کم کریں | — | New (missing in Urdu) |
| 5 | Call emergency or go to nearest hospital | ایمرجنسی کال کریں یا قریبی ہسپتال جائیں | ہسپتال جائیں — خود ہڈی سیدھی نہ کریں | Revised: old step 4 split into steps 5, 6 |
| 6 | Do NOT try to realign the bone | ہڈی کو خود سیدھا کرنے کی کوشش نہ کریں | ہسپتال جائیں — خود ہڈی سیدھی نہ کریں | Revised: old step 4 split into steps 5, 6 |

Signs and symptoms (all four newly translated; there was no Urdu before):

| English (unchanged) | Urdu now |
|---|---|
| Intense pain at injury site | چوٹ کی جگہ پر شدید درد |
| Swelling and bruising | سوجن اور نیل پڑنا |
| Visible deformity | ظاہری ٹیڑھا پن |
| Unable to move the area | متاثرہ حصے کو ہلا نہ پانا |

#### Seizure (مرگی کا دورہ)

English had 6 steps and Urdu 5; both now have 6.

| # | English (unchanged) | Urdu now | Urdu before | Change |
|---|---|---|---|---|
| 1 | Clear the area of dangerous objects | خطرناک چیزیں ہٹائیں | خطرناک چیزیں ہٹائیں | Unchanged |
| 2 | Do NOT hold the person down or restrain them | مریض کو زبردستی پکڑیں یا دبائیں نہیں | مریض کو پکڑیں نہیں | Revised |
| 3 | Place them on their side (recovery position) | کروٹ کے بل لٹائیں (ریکوری پوزیشن) | کروٹ پر لٹائیں | Revised |
| 4 | Do NOT put anything in their mouth | منہ میں کچھ نہ ڈالیں | منہ میں کچھ نہ ڈالیں | Unchanged |
| 5 | Time the seizure — call 1122 if it lasts >5 minutes | دورے کا وقت نوٹ کریں — 5 منٹ سے زیادہ رہے تو 1122 پر کال کریں | 5 منٹ سے زیادہ ہو تو 1122 کال کریں | Revised |
| 6 | Stay with them until fully conscious | مکمل ہوش میں آنے تک ان کے ساتھ رہیں | — | New (missing in Urdu) |

Signs and symptoms (all four newly translated; there was no Urdu before):

| English (unchanged) | Urdu now |
|---|---|
| Uncontrollable shaking/jerking | بے قابو کپکپی یا جھٹکے |
| Falls to the ground | زمین پر گر جانا |
| Loss of consciousness | ہوش کھو دینا |
| Stiffening of body | جسم کا اکڑ جانا |

**Please check these, too.** Their wording was kept as it was, both English and Urdu:

- **Heart attack, step 3:** "If prescribed, give 1 aspirin (chewed, not swallowed whole)". Common guidance asks about allergy rather than a prescription.
- **Severe bleeding, step 4:** emergency services are called only "if bleeding doesn't stop in 10 min".
- **Fracture:** step 1 says "Do NOT move the injured area", but step 4 says "Control swelling by elevation".
- **Seizure:** the Urdu title مرگی کا دورہ means "epileptic fit", and not every seizure is epilepsy.

### Depression screening (PHQ-9)

- **Standard English wording restored.**
  - The lead-in "Over the last 2 weeks, how often have you been bothered by any of the following problems?" was added.
  - Items 6–9 were shortened before. Each one now has its full standard wording:
    - item 6 adds "or have let yourself or your family down";
    - item 7 adds "such as reading the newspaper or watching television";
    - item 8 reads "Moving or speaking so slowly that other people could have noticed? Or the opposite — being so fidgety or restless that you have been moving around a lot more than usual";
    - item 9 reads "Thoughts that you would be better off dead or of hurting yourself in some way".
  - The answer "More than half" is now "More than half the days".
- **The questions stay in English in the Urdu interface.** A published, validated Urdu PHQ-9 should be used, but its exact text couldn't be obtained, so no Urdu wording was invented. The Urdu interface explains this: «سوالات انگریزی میں دکھائے گئے ہیں، کیونکہ یہاں PHQ-9 کے تصدیق شدہ الفاظ استعمال کیے گئے ہیں اور اس کا تصدیق شدہ اردو متن ابھی شامل نہیں کیا گیا۔ سمجھنے میں مشکل ہو تو کسی قابلِ اعتماد شخص یا ڈاکٹر سے مدد لیں۔»
- **Scoring is unchanged.**

  | Total (0–27) | Band |
  |---|---|
  | 0–4 | minimal |
  | 5–9 | mild |
  | 10–14 | moderate |
  | 15–19 | moderately severe |
  | 20–27 | severe |

  English advice text is unchanged. Each answer must be given before the result shows.
- **New crisis rule for item 9.** If item 9 is answered above zero, a crisis panel appears straight away, whatever the total score:
  - it shows under the question, and again at the top of the results;
  - it has the "Call 1122" and "Call 115" buttons and the helplines below;
  - the reassuring advice for the minimal and mild bands is not shown alongside it.

  The panel's text:

  | English | Urdu |
  |---|---|
  | You mentioned thoughts of harming yourself or of being better off dead | آپ نے خود کو نقصان پہنچانے، یا یہ سوچنے کا ذکر کیا ہے کہ آپ کا مر جانا بہتر ہوگا |
  | You don't have to face this alone. Please talk to someone today. | آپ کو اس کا اکیلے سامنا نہیں کرنا۔ براہ کرم آج ہی کسی سے بات کریں۔ |
  | If you are in immediate danger, call 1122 or 115 now. | اگر آپ فوری خطرے میں ہیں تو ابھی 1122 یا 115 پر کال کریں۔ |

- **Helplines.** Each number was checked against an official source on 10 October 2026, and they are kept in `src/features/tools/helplines.tsx`. Check them again regularly.

  | Helpline | Number | Hours | Source |
  |---|---|---|---|
  | Umang mental health helpline | 0311 7786264 | 24 hours | [WHO EMRO list of mental health services](https://www.emro.who.int/mhps/mental_health_professionals.html). Umang's own site had an expired certificate. |
  | Government mental health helpline | 1166 | Toll-free | [Government of Pakistan, Press Information Department, 9 March 2023](https://pid.gov.pk/site/press_detail/22237) |
  | Rozan Counseling Helpline | 0304 111 1741 | Monday to Friday, 9 am to 5 pm | [Rozan counseling services](https://rozan.org/counseling-services/) |

- **Urdu band names and advice corrected.**
  - **Moderate:** the old Urdu used اعتدال پسند, "moderate" in the sense of temperament.
  - **Moderately severe:** the old Urdu said شدید, which means "severe".
  - **Advice:** all five Urdu texts were re-translated to match the English.

  | Band | Urdu label now | Urdu advice now | Urdu advice before |
  |---|---|---|---|
  | Minimal | کم سے کم | آپ کی ذہنی صحت اچھی حالت میں دکھائی دیتی ہے۔ صحت مند عادات جاری رکھیں۔ | آپ کی ذہنی صحت اچھی ہے۔ صحت مند عادات جاری رکھیں۔ |
  | Mild | معمولی | ہلکی علامات پائی گئیں۔ اپنی دیکھ بھال کی سرگرمیوں پر غور کریں: ورزش، مراقبہ، دوستوں سے بات چیت۔ | ہلکی علامات پائی گئیں۔ ورزش، مراقبہ اور دوستوں سے بات کریں۔ |
  | Moderate | درمیانہ | ڈپریشن کی درمیانے درجے کی علامات۔ ہم ذہنی صحت کے کسی ماہر سے مشورہ کرنے کی تجویز دیتے ہیں۔ | اعتدال پسند ڈپریشن کی علامات۔ ماہر نفسیات سے مشورہ کریں۔ |
  | Moderately severe | درمیانے سے شدید | ڈپریشن کی نمایاں علامات۔ براہ کرم جلد از جلد پیشہ ورانہ مدد حاصل کریں۔ | شدید ڈپریشن کی علامات۔ براہ کرم جلد از جلد پیشہ ورانہ مدد حاصل کریں۔ |
  | Severe | شدید | شدید ڈپریشن کی نشاندہی ہوئی ہے۔ براہ کرم فوری طور پر ذہنی صحت کے کسی ماہر یا بحران کی ہیلپ لائن سے رابطہ کریں۔ | شدید ڈپریشن — فوری طور پر ماہر نفسیات سے رابطہ کریں یا ہیلپ لائن پر کال کریں۔ |

### Symptom guide

The old page was called "Diagnosis AI", although no AI was involved: it matched keywords in free text.

- **What was wrong.** It showed a green "Mild" result for anything it didn't recognise, such as "can't breathe". It also matched "no fever" as fever.
- **New input.** The guide uses tick boxes for the same 10 symptoms.
- **Unchanged content.** The severity of each symptom, the English possible causes and the English advice are all unchanged.
- **Urgent symptoms.** Results are sorted with the most urgent first. Chest pain and shortness of breath now add a banner with the "Call 1122" and "Call 115" buttons.
- **Urdu.** The old Urdu was a one-line paraphrase of each symptom. It now translates the possible causes and the full advice:

| Symptom | English advice (unchanged) | Urdu now (conditions; advice) | Urdu before |
|---|---|---|---|
| Headache (سر درد) | Rest in a dark room. Stay hydrated. Take OTC pain relief if needed. See a doctor if persistent. | تناؤ کا سر درد، درد شقیقہ (مائیگرین)، سائنوسائٹس۔ اندھیرے کمرے میں آرام کریں۔ پانی پیتے رہیں۔ ضرورت ہو تو بغیر نسخے کے ملنے والی درد کی دوا لیں۔ اگر درد برقرار رہے تو ڈاکٹر سے ملیں۔ | سر درد — آرام کریں، پانی پئیں، اگر بار بار ہو تو ڈاکٹر سے ملیں۔ |
| Fever (بخار) | Monitor temperature. Stay hydrated. Take paracetamol. Seek medical help if above 103°F. | وائرل انفیکشن، فلو (انفلوئنزا)، کووڈ-19، بیکٹیریل انفیکشن۔ درجہ حرارت چیک کرتے رہیں۔ پانی پیتے رہیں۔ پیراسیٹامول لیں۔ اگر بخار 103°F سے زیادہ ہو تو طبی مدد حاصل کریں۔ | بخار — درجہ حرارت چیک کریں، پانی پئیں، 103 سے اوپر ہو تو ڈاکٹر کے پاس جائیں۔ |
| Cough (کھانسی) | Stay hydrated. Use honey and warm water. Avoid irritants. See doctor if cough persists >2 weeks. | عام نزلہ زکام، برونکائٹس، الرجی، نمونیا۔ پانی پیتے رہیں۔ شہد اور نیم گرم پانی استعمال کریں۔ خراش پیدا کرنے والی چیزوں سے بچیں۔ اگر کھانسی 2 ہفتے سے زیادہ رہے تو ڈاکٹر سے ملیں۔ | کھانسی — گرم پانی پئیں، شہد استعمال کریں، 2 ہفتے سے زیادہ ہو تو ڈاکٹر سے ملیں۔ |
| Chest pain (سینے میں درد) | SEEK IMMEDIATE MEDICAL ATTENTION. Call emergency services if accompanied by shortness of breath. | انجائنا (دل کا درد)، تیزابیت (ایسڈ ریفلکس، GERD)، پٹھوں کا کھنچاؤ، بے چینی (اینگزائٹی)۔ فوری طبی مدد حاصل کریں۔ اگر ساتھ سانس پھول رہا ہو تو ایمرجنسی سروسز کو کال کریں۔ | سینے میں درد — فوری طبی مدد حاصل کریں! سانس کی تکلیف ہو تو ایمرجنسی کال کریں۔ |
| Stomach pain (پیٹ میں درد) | Eat bland foods. Avoid spicy food. Stay hydrated. See doctor if pain is severe or persistent. | معدے کی سوزش (گیسٹرائٹس)، فوڈ پوائزننگ، اریٹیبل باؤل سنڈروم (IBS)، اپنڈی سائٹس۔ ہلکی پھلکی غذا کھائیں۔ مسالے دار کھانے سے پرہیز کریں۔ پانی پیتے رہیں۔ اگر درد شدید ہو یا برقرار رہے تو ڈاکٹر سے ملیں۔ | پیٹ درد — ہلکا کھانا کھائیں، مسالے دار سے بچیں، شدید ہو تو ڈاکٹر سے ملیں۔ |
| Back pain (کمر درد) | Apply heat/ice. Gentle stretching. Maintain good posture. See doctor if numbness develops. | پٹھوں کا کھنچاؤ، ڈسک کا کھسکنا، غلط پوسچر، عرق النساء (سائٹیکا)۔ گرم یا ٹھنڈی سکائی کریں۔ ہلکی اسٹریچنگ کریں۔ اپنا پوسچر درست رکھیں۔ اگر سن پن ہو تو ڈاکٹر سے ملیں۔ | کمر درد — گرم/ٹھنڈا سیک کریں، ہلکی ورزش کریں، سنّ پن ہو تو ڈاکٹر سے ملیں۔ |
| Dizziness (چکر آنا) | Sit or lie down safely. Drink water. Avoid sudden movements. See doctor if frequent. | ورٹیگو (سر چکرانا)، کم بلڈ پریشر، پانی کی کمی، خون کی کمی (انیمیا)۔ محفوظ طریقے سے بیٹھ جائیں یا لیٹ جائیں۔ پانی پئیں۔ اچانک حرکت سے بچیں۔ اگر بار بار ہو تو ڈاکٹر سے ملیں۔ | چکر آنا — بیٹھ جائیں، پانی پئیں، بار بار ہو تو ڈاکٹر سے ملیں۔ |
| Shortness of breath (سانس پھولنا) | SEEK IMMEDIATE MEDICAL ATTENTION if severe or sudden onset. Use inhaler if prescribed. | دمہ، بے چینی (اینگزائٹی)، نمونیا، ہارٹ فیلیئر (دل کا کمزور ہونا)۔ اگر شدید ہو یا اچانک شروع ہو تو فوری طبی مدد حاصل کریں۔ اگر ڈاکٹر نے انہیلر تجویز کیا ہو تو استعمال کریں۔ | سانس کی تکلیف — فوری طبی مدد حاصل کریں! اگر انہیلر ہے تو استعمال کریں۔ |
| Fatigue (تھکاوٹ) | Get adequate sleep. Eat balanced diet. Exercise regularly. See doctor if persistent. | خون کی کمی (انیمیا)، تھائیرائیڈ کے مسائل، ڈپریشن، ذیابیطس (شوگر)۔ مناسب نیند لیں۔ متوازن غذا کھائیں۔ باقاعدگی سے ورزش کریں۔ اگر تھکاوٹ برقرار رہے تو ڈاکٹر سے ملیں۔ | تھکاوٹ — مناسب نیند لیں، متوازن غذا کھائیں، مسلسل ہو تو ڈاکٹر سے ملیں۔ |
| Joint pain (جوڑوں کا درد) | Rest the affected joint. Apply ice. Take anti-inflammatory medication. See doctor if swelling persists. | جوڑوں کی سوزش (آرتھرائٹس)، گنٹھیا (گاؤٹ)، برسائٹس، لوپس۔ متاثرہ جوڑ کو آرام دیں۔ برف لگائیں۔ سوزش کم کرنے والی دوا لیں۔ اگر سوجن برقرار رہے تو ڈاکٹر سے ملیں۔ | جوڑوں کا درد — آرام کریں، برف لگائیں، سوجن ہو تو ڈاکٹر سے ملیں۔ |

Please also check that the English advice "Take paracetamol" for fever, given without a dose, is acceptable.

### Vital signs

- **Thresholds unchanged.** Inside the normal range the result is Normal, inside the warning range Warning, and outside it Critical.

  | Reading | Normal | Warning | Accepted input |
  |---|---|---|---|
  | Heart rate (bpm) | 60–100 | 50–120 | 1–300 |
  | Systolic (mmHg) | 90–120 | 80–140 | 1–300 |
  | Diastolic (mmHg) | 60–80 | 50–90 | 1–200 |
  | Temperature (°F) | 97–99 | 95–103 | 80–115 |
  | SpO₂ (%) | 95–100 | 90–100 | 1–100 |
  | Breathing rate (/min) | 12–20 | 8–30 | 1–80 |

- **New input check.** "Accepted input" is new: it catches typing mistakes, such as 37 (°C) entered as °F. It is not a clinical threshold.
- **New call buttons.** A Critical result now shows the "Call 1122" and "Call 115" buttons.
- **Summaries.** These existed only in Urdu, and the Urdu is unchanged. The English versions are new translations:
  - "All your vital signs are normal. Keep up healthy habits."
  - "Some vital signs are outside the normal range. Consult a doctor."
  - "Get medical help immediately! Some vital signs are in a dangerous range."
- **Please check:** a systolic reading of 141 counts as Critical.

### How AI reports are shown

- **Severity.** The badge uses the SEVERITY line in the report itself, and falls back to the stored severity only when the report has none. The backend's stored severity comes from a keyword match, so "no severe findings" was stored as Severe. When the two differ, doctors see a note such as "The report text states Moderate; the stored severity is Severe."
- **Confidence.** Confidence is shown only when the report states it, as "N% model confidence, not diagnostic certainty". Otherwise it reads "not stated". The backend fills in a number when the report has none: the first percentage in the text, which may be an SpO₂ value, or `75 + length/80`.
- **Urdu summary.**
  - **Report screens.** The summary appears in its own tab, taken from the report text under اردو خلاصہ.
  - **PDF.** The summary is now included in the PDF. The PDF shows it as an image, because jsPDF can't shape Nastaliq text.
  - **PDF report ID.** The PDF's report ID is now the real scan ID. Before, it was a random number on every download.
- **X-ray subtypes.** MRI and CT images are labelled as read with the general X-ray instructions, because there is no MRI or CT endpoint. Bone X-rays now go to the existing `/analyze/bone` instead of the chest X-ray prompt.
- **Analyzer copy.** Every analyzer warns that the AI can be wrong. The X-ray, bone and ECG pages say it "can miss things or be wrong"; the blood test and prescription pages warn about misread values and handwriting. Each page also gives photo tips, such as "Avoid glare, shadows and reflections".

## Removed

### Unconfirmed claims, from the landing page and elsewhere

- **Firsts and speed:**
  - "Pakistan's First Medical AI — Live Now", and "Pakistan's first AI-powered medical platform" in the footer;
  - "2–3 minutes", "instantly", "real-time";
  - "Your Doctor is Now Always Home", which implied replacing a doctor.
- **Price:** "Free forever", "Always free", "100% free, no hidden charges", "No credit card needed" and "No waiting rooms — no bills".
- **Numbers:** "Trusted by 10,000+ Pakistanis", "10,000+ patients served", "Join 10,000+ Pakistanis", "98% accuracy rate" and "9 Medical AI Modules". Only five modules use AI.
- **Social proof:**
  - five initials avatars with ★★★★★;
  - six named five-star testimonials (Dr Ahmed Khan, Fatima Malik, Dr Sara Hussain, Muhammad Ali, Dr Zainab Khan and Hassan Ahmed);
  - "As seen in Dawn News, Geo TV, ARY Digital, Express Tribune, The News".
- **Technology:**
  - "Powered by Microsoft Research, Nature Medicine, Google Cloud, LLaVA-Med AI, Atomcamp Cohort 15";
  - "LLaVA-Med — Nature Medicine 2024 by Microsoft Research". The AI is Google Gemini, and LLaVA-Med was a NeurIPS 2023 paper.
- **Accuracy and review:**
  - "radiologist-level accuracy" and "orthopedic precision";
  - "Certified physician verifies & signs off" and "Certified — guaranteed";
  - "All AI reports are reviewed and approved by certified Pakistani physicians before being finalized". Doctor accounts aren't verified, and a review isn't guaranteed.
- **Features:**
  - "PHQ-9 & GAD-7", although there is no GAD-7;
  - "differential diagnosis with confidence scores";
  - "BP, blood sugar & oxygen … tracking", although there is no sugar field and nothing is saved;
  - "DICOM" listed as accepted;
  - static "AI Online" chips, shown on pages that don't use AI;
  - the "AI Kya Detect Karega?" lists of conditions.
- **Privacy:** "Encrypted & Private", "end-to-end encryption", "never shared with any third parties" and "You own your data". Images are sent to Google Gemini.
- **Coverage:** "every city, every village, 24/7", the ten named cities and "+ 200 more cities".
- **Comparison:** the "Traditional vs AI-Powered" table ("2–5 days", "Rs. 2,000–10,000", "BEST", "The choice is obvious").
- **Footer credit:** "Built with ♥ by Syed Hassan Tayyab — Atomcamp Cohort 15". It wasn't confirmed, but can be restored on request.

### Things that didn't work

- **Demo:** two "Watch Demo" buttons with no demo behind them, and the hero mock-up showing "medcareai.app" and "LIVE".
- **Newsletter:** the form sent nothing anywhere but still showed "Subscribed!".
- **Links:** every footer link and social link was dead.
- **Sign-in:** the "Doctor Demo" button that filled in `doctor@demo.com` / `demo123`.

### Sample images

The sample images were removed. The one labelled "Normal Chest" was in fact an influenza pneumonia X-ray, and none of them credited Wikimedia. Using one also created a real scan in the patient's history and in the doctor queue.

### Code

- **Old app:** Create React App and the old pages, along with their 1,241 inline style objects.
- **Duplicates:** the five near-identical analyzers (about 84% duplicated) and the duplicated API calls with a hard-coded backend URL in six files.
- **Unused:** `html2canvas` had been installed but never used; it now renders the Urdu text for the PDF.
- **Committed `.env`:** it is no longer tracked; `.env.example` replaces it.
- **Roman Urdu errors:** Roman Urdu error messages are no longer shown. Errors are mapped to English and Urdu messages, and the backend's own error text is never displayed.

## Changed

- **Stack:**
  - **Build and language:** Vite 8, React 19 and TypeScript 5 in strict mode;
  - **Routing and data:** React Router 7 (data router, lazy routes) and TanStack Query 5;
  - **Styling and UI:** Tailwind CSS 4 with CSS-variable tokens, and shadcn-style components on Radix with lucide icons;
  - **Forms:** react-hook-form with zod;
  - **Translation:** i18next;
  - **PDF:** jsPDF and html2canvas, loaded only when a PDF is downloaded;
  - **Tests:** Vitest with Testing Library, and Playwright with axe.
- **Routes:**
  - **Public:** `/`, `/login`, `/register`, `/emergency`, `/emergency/:slug`, `/about`, `/privacy`, `/terms` and a 404 page.
  - **Patient:** `/app`, `/app/scans`, `/app/scans/:id`, `/app/analyze/:module`, `/app/diagnosis`, `/app/mental-health` and `/app/vitals`.
  - **Doctor:** `/doctor` (pending reports, oldest first), `/doctor/scans` (all scans, with filters in the URL) and `/doctor/scans/:id`.
  - **Guards:** role guards protect the patient and doctor areas. Any 401 ends the session and returns to `/login?next=…`.
- **Design:**
  - **Look:** calm and clinical, with the original name and logo, light by default and a dark theme. The theme follows the system or the toggle.
  - **Severity:** each level has its own colour, icon and label, and every colour pair meets WCAG AA in both themes.
  - **Layout:** mobile first, with touch targets of at least 44 px and a bottom navigation bar on phones.
- **Bilingual:**
  - **Strings:** every string lives in `src/i18n/locales/{en,ur}`, and a test keeps the two languages in step.
  - **Urdu:** the language sets `<html lang="ur" dir="rtl">`, the layout mirrors through logical CSS properties, and the text uses Noto Nastaliq Urdu with a line height of about 2.
  - **Formats:** numbers and dates follow the locale.
- **Accessibility:** WCAG 2.2 AA is the target. axe reports no serious or critical issues on any route, in English (light, 1280 px) or Urdu (dark, 360 px). Pages also have a skip link, labelled forms, visible focus and announced errors.
- **Performance:**
  - **Landing page:** the JavaScript is 148 KB gzipped (129 KB with brotli).
  - **Lighthouse:** mobile emulation on `/`, over three runs of a local, uncompressed build, gave these scores:

    | Category | Score |
    |---|---|
    | Performance | 93 |
    | Accessibility | 100 |
    | Best practices | 100 |
    | SEO | 100 |

    Cumulative layout shift is 0.001.
- **Privacy in the browser:**
  - **Storage:** only the sign-in token, the user's profile, the language and the theme are stored. Uploaded images and reports never go into storage.
  - **Previews:** object URLs for image previews are revoked after use.
- **Tests:**
  - **Unit and component:** 135 tests.
  - **Playwright:** 57 tests against a mocked API:
    - the patient journey: register, X-ray, report in English and Urdu, PDF, sign out;
    - the doctor journey: sign in, then approve with notes;
    - back-button and direct-URL navigation;
    - axe and the horizontal-scroll check at 360 px and 1440 px on every route.

## Backend follow-ups (not done)

No backend code was changed. These need backend work:

1. **Doctor accounts.** Verify doctors before giving them access. Anyone can register as a doctor with any PMDC text, and `GET /users/doctor/all-scans` returns every patient's name, email and report.
2. **Gemini.** Decide on the production Gemini tier, and resolve the terms above.
3. **Sign-in tokens.** Move them from `localStorage` to httpOnly cookies.
4. **Scan records.** Store:
   - the Urdu report (today it is only embedded in the report text);
   - the X-ray subtype;
   - who reviewed a scan, and when.

   Also add an endpoint that fetches a single scan. Detail pages currently load the whole list.
5. **Timestamps.** Return them with a timezone. The client treats them as UTC.
6. **Severity and confidence.** Fix the keyword-based severity and the invented confidence value.
7. **File types.** Reject BMP, AVIF and TIFF, or send them with their real type. Today they are sent to Gemini labelled as JPEG.
8. **Accounts.** Add password reset, and a way to delete an account and its data. The Privacy draft points people to a contact email until then.
9. **Secret key.** Remove the hard-coded fallback `SECRET_KEY`.
10. **Health check.** Make `/health` cheap; today every call queries Gemini.
11. **Demo accounts.** Remove any that exist in production.
12. **Root README.** It still has claims outside the frontend sections:
    - the "Pakistan's First AI-Powered Medical Diagnosis Platform" banner;
    - "Results in 2-3 Minutes | Free Forever";
    - the Build Passing, Status Live, MIT, OpenAI and LLaVA-Med badges (there is no LICENSE file);
    - the LLaVA-Med intro, the architecture diagram and the roadmap;
    - `LLAVA_API_KEY`, although the code reads `GEMINI_API_KEY`.

    The frontend sections were updated in this release.
