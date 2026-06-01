# Native-speaker review — Batch 1 (Japanese + Arabic)

Spot-check sample of 13 UI strings pulled from the production MESSAGES
record on `staging-gtranslate-test`. Each string is a representative
sample of a different surface (chrome / hero / calculator / SAP module
catalog / advice-style industry guidance). Picked deliberately to
exercise placeholder tokens, `<noTranslate>` marker preservation,
imperative-voice handling (Pass 4-A.1 work), and dense technical
content.

**For the reviewer:** mark each row OK / minor / major / wrong in the
right-most column. "Minor" = reads fine but a native speaker would
phrase it differently; "major" = grammatically correct but
register/tone is off; "wrong" = unusable. After you finish, return the
file and we triage per-locale (fixes go through `--keys` re-translation
at ~$0.01-0.05 per fix).

**Commit:** `8e98048` on `staging-gtranslate-test`
**Translation model:** GPT-5.4 (Pass 4-B run, $4.94 total, 11,738
strings, Block 6c)
**Date:** 2026-06-01

## How to mark

| Mark | Meaning |
|---|---|
| **OK** | Translation reads naturally; native speaker would not change it. |
| **minor** | Reads fine but a native speaker would phrase differently. Acceptable to ship. |
| **major** | Tone or register is off enough to feel awkward, even if grammar is correct. Worth fixing pre-launch. |
| **wrong** | Mistranslation, broken grammar, or unusable output. Must fix pre-launch. |

## Japanese review

| # | Key | English source | Japanese (production) | Mark |
|---|---|---|---|---|
| 1 | `nav.solutionsDropdown` | Solutions | ソリューション |   |
| 2 | `nav.about` | About | 概要 |   |
| 3 | `stickyCta.bookConsultation` | Book consultation | 相談を予約する |   |
| 4 | `hero.headline` | I run ERP transformations | 私はERP変革を主導します |   |
| 5 | `hero.primaryCta` | Book a 30-min call | 30分の通話を予約する |   |
| 6 | `article.primaryCtaBookCall` | Book a 30-min call | 30分の通話を予約する |   |
| 7 | `sapCostCalculator.submitLabel` (markers) | Estimate my `<noTranslate>SAP</noTranslate>` cost | 私の`<noTranslate>SAP</noTranslate>`コストを見積もる |   |
| 8 | `calculator.cio.driverManyCountries` (interpolated `{n}`) | `{n}` countries — wave planning and central governance are critical | `{n}`か国 — ウェーブ計画と中央ガバナンスが重要です |   |
| 9 | `solutionBuilder.industries.financial-services.bestPractices` (long descriptive, markers) | Regulatory reporting, Group consolidation, and `<noTranslate>FSCM</noTranslate>` (credit, dispute, collections) are the spine. Treasury, in-house cash, and risk management carry the heaviest configuration burden. | 規制報告、グループ連結、`<noTranslate>FSCM</noTranslate>`（与信、紛争、回収）が中核です。トレジャリー、インハウスキャッシュ、リスク管理が最も重い設定負荷を担います。 |   |
| 10 | `solutionBuilder.industries.healthcare.bestPractices` (long descriptive, declarative voice) | Patient data privacy and audit trails dominate the design. Procurement and inventory of medical supplies need strict batch and expiry control. Workforce planning is mission-critical for clinical staffing. | 患者データのプライバシーと監査証跡が設計を大きく左右します。医療用品の調達と在庫管理には、厳格なバッチ管理と有効期限管理が必要です。臨床スタッフ配置では要員計画がミッションクリティカルです。 |   |
| 11 | `sapModules.modules.ibp.description` (markers) | Demand, supply, `<noTranslate>S&OP</noTranslate>`, inventory optimisation | 需要、供給、`<noTranslate>S&OP</noTranslate>`、在庫最適化 |   |
| 12 | `sapModules.modules.btp.label` (markers, English in parens) | `<noTranslate>SAP BTP</noTranslate>` (Business Technology Platform) | `<noTranslate>SAP BTP</noTranslate>`（Business Technology Platform） |   |
| 13 | `sapModules.modules.fi-gl.description` (short technical) | General Ledger, statutory reporting foundation | 総勘定元帳、法定報告の基盤です |   |

### Japanese-specific check points (helpful for the reviewer)

- **Register consistency:** all translations should use ですます調
  (polite form), not だ・である (plain form). Pass 4 used the polite
  register as the default per `LANG_REGISTER.ja`.
- **Marker handling:** the `<noTranslate>...</noTranslate>` wrappers
  are stripped at render time. The reviewer can ignore the wrappers and
  read what's inside as plain Latin script in the live UI.
- **Punctuation:** check that full-width brackets/parens (（）) are
  used where appropriate around SAP product expansions (#12 case) and
  that half-width parens stay for technical acronyms.
- **Imperative voice (#3 specifically):** "Book consultation" is a
  CTA. Pass 4-A.1 retranslated all imperative-without-subject strings
  as imperative advice rather than first-person. "相談を予約する" reads
  as imperative; verify it's not subtly first-person.

## Arabic review

| # | Key | English source | Arabic (production) | Mark |
|---|---|---|---|---|
| 1 | `nav.solutionsDropdown` | Solutions | الحلول |   |
| 2 | `nav.about` | About | نبذة |   |
| 3 | `stickyCta.bookConsultation` | Book consultation | احجز استشارة |   |
| 4 | `hero.headline` | I run ERP transformations | أقود تحولات ERP |   |
| 5 | `hero.primaryCta` | Book a 30-min call | احجز مكالمة لمدة 30 دقيقة |   |
| 6 | `article.primaryCtaBookCall` | Book a 30-min call | احجز مكالمة لمدة 30 دقيقة |   |
| 7 | `sapCostCalculator.submitLabel` (markers) | Estimate my `<noTranslate>SAP</noTranslate>` cost | قدّر تكلفة `<noTranslate>SAP</noTranslate>` الخاصة بي |   |
| 8 | `calculator.cio.driverManyCountries` (interpolated `{n}`) | `{n}` countries — wave planning and central governance are critical | `{n}` دولة — تخطيط الموجات والحوكمة المركزية أمران حاسمان |   |
| 9 | `solutionBuilder.industries.financial-services.bestPractices` (long descriptive, markers) | Regulatory reporting, Group consolidation, and `<noTranslate>FSCM</noTranslate>` (credit, dispute, collections) are the spine. Treasury, in-house cash, and risk management carry the heaviest configuration burden. | يشكّل إعداد التقارير التنظيمية والتوحيد على مستوى المجموعة و`<noTranslate>FSCM</noTranslate>` (الائتمان والنزاعات والتحصيلات) العمود الفقري. وتتحمل الخزانة والسيولة الداخلية وإدارة المخاطر أكبر عبء في الإعداد. |   |
| 10 | `solutionBuilder.industries.healthcare.bestPractices` (long descriptive, declarative voice) | Patient data privacy and audit trails dominate the design. Procurement and inventory of medical supplies need strict batch and expiry control. Workforce planning is mission-critical for clinical staffing. | تهيمن خصوصية بيانات المرضى ومسارات التدقيق على التصميم. تحتاج المشتريات ومخزون المستلزمات الطبية إلى رقابة صارمة على الدفعات وتواريخ الانتهاء. ويُعد تخطيط القوى العاملة أمرًا حاسمًا للغاية لتوظيف الكوادر السريرية. |   |
| 11 | `sapModules.modules.ibp.description` (markers) | Demand, supply, `<noTranslate>S&OP</noTranslate>`, inventory optimisation | الطلب، والتوريد، و`<noTranslate>S&OP</noTranslate>`، وتحسين المخزون |   |
| 12 | `sapModules.modules.btp.label` (markers) | `<noTranslate>SAP BTP</noTranslate>` (Business Technology Platform) | `<noTranslate>SAP BTP</noTranslate>` (Business Technology Platform) |   |
| 13 | `sapModules.modules.fi-gl.description` (short technical) | General Ledger, statutory reporting foundation | دفتر الأستاذ العام، أساس التقارير النظامية |   |

### Arabic-specific check points

- **Register:** Modern Standard Arabic (فصحى), professional register
  per `LANG_REGISTER.ar`. Should not drift into colloquial.
- **Diacritics:** the translations use shadda / damma marks sparingly
  (e.g. "قدّر" #7, "أمرًا حاسمًا" #10). Confirm these aren't
  over-applied or missing where needed.
- **RTL layout note:** the live `/ar/` routes render with `<html
  dir="rtl">` and the Block 7 logical-property migration. UI chrome
  flips correctly; the reviewer is checking translation quality, not
  layout.
- **Imperative voice (#3 and #5):** Arabic uses imperative-mood verbs
  ("احجز" = "book"). Pass 4-A.1 specifically targeted advice-style
  guidance to NOT render as first-person. Confirm CTAs read as
  imperative.
- **English in parens (#12):** `(Business Technology Platform)` was
  left in English by design — it's the expansion of an English-language
  product name. Reviewer should verify this is the natural convention
  for Arabic technical writing (often it is, but worth confirming).

## After review

1. Mark each row in the table.
2. For any "major" or "wrong" rows, add a brief note (1-2 lines)
   explaining what a native speaker would have written instead.
3. Send the file back. Triage:
   - **major / wrong** → fix pre-launch via
     `node scripts/translate-ui-strings.mjs --lang <ja|ar> --keys <dotpath>`
     with a tightened prompt or `--key` after editing the EN source.
     Cost ~$0.01-0.05 per fix.
   - **minor** → log in `_docs/post-launch-backlog.md` under a new
     "Translation polish — batch 1" entry. Fix in a post-launch
     translation pass.

If overall quality is **>90% OK**, no batch 2 needed pre-launch — the
spot check holds.

If overall quality is **<70% OK**, escalate: re-run the full Pass 4-B
translation against the affected locale with a tightened system prompt
(the script's `--lang <locale>` flag + a prompt iteration), or
manually correct the worst offenders and ship. Re-translation cost is
~$0.50-0.60 per locale.
