---
name: sloppy-copywriting
description: Specialist anti-slop skill for copywriting, word budgeting, eliminating negative parallelism clichés, and preventing fabricated metrics. Load on-demand when writing headlines, body copy, marketing text, or placeholder content.
metadata:
  version: 1.4.0
---

# Sloppy Copywriting: Word Budgeting & Anti-Slop Copy

This specialist skill provides strict rules for authentic product copywriting. It eliminates marketing clichés and synthetic filler while preserving high information density.

---

## 1. Word Budget Discipline (`TYP-08`)

AI agents flood every interface with walls of synthetic text. Sloppy enforces strict word budgeting per component surface:

| Surface Type | Word Budget Limit | Structural Strategy |
| :--- | :--- | :--- |
| **Illustration / Icon Scene** | <= 12 words | 2-3 genuine strings; use quiet placeholder bars (`<Bar width={120} />`) for secondary data. |
| **Feature Card** | <= 18 words | Single crisp headline, 1-line description, 1 metric badge. |
| **Hero Section** | <= 32 words | Direct value proposition, single CTA button, authentic terminal tag. |
| **Bento Grid Cell** | <= 40 words | Concise focal stat, label, and high-density telemetry rows. |
| **Application Screen** | <= 150 words | Concrete operational data; zero synthetic marketing fluff. |

---

## 2. Eliminating Negative Parallelism Clichés (`CPY-04`)

AI copywriters fall into formulaic rhetorical reframes:
- Bad: "Don't just build software. Orchestrate intelligence."
- Bad: "Stop wrestling with configs. Start shipping velocity."
- Bad: "It's not just another database. It's an autonomous data layer."

### Mandatory Affirmative Rewrite:
State the product capability directly and affirmatively without rhetorical denial:
- Good: "Distributed Postgres with sub-millisecond query routing."
- Good: "Automated container builds with instant rollback."
- Good: "Unified logging, traces, and metrics in one pipeline."

---

## 3. Eliminating Fabricated Social Proof Metrics (`CPY-01` - Floor Blocker)

AI generators invent fake round numbers that destroy technical credibility:
- Blocked: "10x faster execution", "99.999% guaranteed uptime", "Trusted by 10,000+ top developers", "Over 1,000,000 happy users".

### Genuine Technical Representation:
Use concrete, verifiable technical measures:
- Good: "p99 latency < 14ms across 12 edge regions"
- Good: "100% test coverage across 64 unit suites"
- Good: "Direct integration with PostgreSQL 16"
If actual metrics are not yet available, use an explicit `TODO` or structural skeleton bar instead of fabricated numbers.

---

## 4. Stripping Chatbot Artifacts & Filler (`CPY-06`, `CPY-07`)

- **`CPY-06` (Chatbot Conversational Artifacts)**: Eliminate conversational prefixes ("Certainly! Here is your component", "Sure, let's explore", "Hope this helps!").
- **`CPY-07` (Lorem Ipsum & John Doe)**: Never insert raw Latin filler ("Lorem ipsum dolor sit amet", "John Doe"). Use authentic domain nouns (e.g., `production-cluster-04`, `invoice_8492_paid.pdf`).
