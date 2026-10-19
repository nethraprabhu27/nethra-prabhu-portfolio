"use client";

import { motion, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState, type MouseEvent as ReactMouseEvent, type PointerEvent as ReactPointerEvent } from "react";
import Image from "next/image";
import { Mail } from "lucide-react";
import SwayingScene from "@/components/SwayingScene";

// Look of the hero. "scene" is the illustrated night-time desk with light lettering; "light" is a
// plain white page with the name in black; "dark" is a plain black hero with the name in white; "pond" is
// the original dark water background. Lily pads are kept but switched off; set SHOW_LILY_PADS to bring them back.
const HERO_THEME: "scene" | "light" | "dark" | "pond" = "dark";
const SHOW_LILY_PADS = false;
// Orange-tree branches (cut out of the sunset picture, sky removed) framing the hero's sides; the right-hand
// tree's lowest leaves hang past the hero into the Featured section.
const SHOW_BRANCHES = true;

const leaves = [
  { id: 1, x: "4%", y: "11%", w: 145, delay: 0, duration: 8, rotate: -18 },
  { id: 2, x: "83%", y: "15%", w: 132, delay: 0.8, duration: 9, rotate: 20 },
  { id: 3, x: "12%", y: "66%", w: 98, delay: 1.4, duration: 10, rotate: 30 },
  { id: 4, x: "83%", y: "73%", w: 116, delay: 0.4, duration: 11, rotate: -18 },
  // These two sit across the hero's bottom edge, spilling onto the section below.
  { id: 5, x: "70%", y: "93%", w: 96, delay: 1.8, duration: 10, rotate: 12 },
  { id: 6, x: "4%", y: "95%", w: 85, delay: 1, duration: 12, rotate: -34 },
];

// Menu items, in order, and the sections they jump to.
const navItems = [
  { id: "about", label: "About" },
  { id: "exploring", label: "Exploring" },
  { id: "featured", label: "Projects" },
  { id: "experience", label: "Experience" },
  { id: "contact", label: "Contact", arrow: true },
];

// "What I'm Exploring" intro: the themes between the opening and closing lines.
const exploreThemes = [
  {
    title: "AI That Businesses Can Depend On",
    body:
      "At Penumbra, I built a platform that translated complex device information into something sales reps could use with " +
      "physicians. I want to do the same for enterprise AI: organizing information and designing AI interactions so teams " +
      "get trustworthy answers and make better business decisions.",
  },
  {
    title: "Designing for Every Mind",
    body:
      "Most software doesn’t account for how much cognitive load a person can handle in a given moment. I want to design " +
      "interfaces that adapt to people who are tired, older, reading in a second language, or living with a cognitive " +
      "disability.",
  },
];

// "Where I'd Place My Bets" panels: a subtitle and a short piece of writing (the title is just a label for the code).
const exploreTopics: { title: string; subtitle?: string; body?: string }[] = [
  {
    title: "AI Infrastructure",
    subtitle: "What Powers AI, and What It Costs",
    body:
      "AI’s future depends on what’s underneath: compute, energy, and governance. Buyers want to know what it costs to run, " +
      "how much power it draws, and whether they can trust it. I want to help AI infrastructure companies answer those " +
      "questions clearly, equipping sales teams and customers to adopt AI responsibly.",
  },
  {
    title: "What’s Underrated",
    subtitle: "The Reliability Layer for AI",
    body:
      "Bigger models get the hype, but companies adopt AI when they can trust it on a Tuesday afternoon with real customer " +
      "data. Verifying AI-assisted clinical content at a medical device company showed me that trust has to be built in, " +
      "and I want to build the tools that test, monitor, and verify AI after deployment.",
  },
  {
    title: "If I Had $1M, I’d Invest In",
    subtitle: "Vertical AI for Healthcare Operations",
    body:
      "As a medical assistant, I watched documentation, prior auths, and scheduling eat into time clinicians wanted to spend " +
      "with patients. I want to build the AI that gives that time back, grounded in real workflow knowledge and a serious " +
      "approach to accuracy and privacy.",
  },
];


// The skills Clinical Education Hub drew on, by area: a bordered two-by-two table (Product and Marketing in the left column,
// Technical and Design in the right; one column on phones), each area in its own colour.
function ProjectSkills() {
  return (
    <dl className="skill-grid">
      <div className="is-orange">
        <dt>Product</dt>
        <dd>product discovery, user research, survey research, problem framing, feature prioritization, MVP scoping, roadmap planning, stakeholder alignment</dd>
      </div>
      <div className="is-pink">
        <dt>Marketing</dt>
        <dd>positioning &amp; messaging, sales enablement, go-to-market planning, competitive intelligence, audience segmentation, value storytelling, scientific communication</dd>
      </div>
      <div className="is-green">
        <dt>Technical</dt>
        <dd>Python, data analysis, machine learning fundamentals, prompt engineering, LLM APIs, Next.js, React, TypeScript, responsive design, Git/GitHub, AI-assisted development</dd>
      </div>
      <div className="is-blue">
        <dt>Design</dt>
        <dd>information architecture, user flows, wireframing, prototyping, usability testing, UX writing, visual hierarchy, accessibility, responsive design, user research</dd>
      </div>
    </dl>
  );
}

// Clinical Education Hub's problem, as a three-card deck: the assignment, what the research turned up, and the reframe.
const projectProblem: { title: string; body: React.ReactNode }[] = [
  {
    title: "The Assignment",
    body: (
      <>
        <p>Sales reps needed to master complex neurovascular trials, endpoints, and device technology. That evidence was scattered across long papers, email threads, shared drives, and internal platforms.</p>
        <p className="problem-turn">Initially, I was asked to summarize clinical articles with AI. A shorter paper, though, isn&rsquo;t easier to find or explain to a neurosurgeon, so I wanted to understand what was actually going on.</p>
      </>
    ),
  },
  {
    title: "What I Learned",
    body: (
      <>
        <p>I interviewed 25+ reps, ran a survey, audited the existing content platform, and spent a week in neurovascular sales training. Through all of this, I noticed a few patterns:</p>
        <table className="problem-table">
          <tbody>
            <tr><th scope="row">Time</th><td>long papers don&rsquo;t fit into days in hospitals</td></tr>
            <tr><th scope="row">Retrieval</th><td>resources got lost across email and tools</td></tr>
            <tr><th scope="row">Formats</th><td>some reps wanted briefs, while others wanted audio, visuals, or practice</td></tr>
            <tr><th scope="row">Experience</th><td>new reps needed foundations, while veterans needed refreshers</td></tr>
            <tr><th scope="row">Application</th><td>reps needed to know why a study mattered, not just what it found</td></tr>
          </tbody>
        </table>
      </>
    ),
  },
  {
    title: "Reframing the Question",
    body: (
      <>
        <p>The question shifted from &ldquo;How do we summarize papers faster?&rdquo; to</p>
        <p className="problem-question">&ldquo;How can reps find, understand, retain, and appropriately apply credible evidence, in the format they need?&rdquo;</p>
      </>
    ),
  },
];

// Clinical Education Hub's design and build, as a four-card deck: the approach, the educational assets, building the
// prototype, and the key decisions with their tradeoffs.
const projectBuild: { title: string; body: React.ReactNode }[] = [
  {
    title: "The Approach",
    body: (
      <>
        <p>I proposed a centralized, searchable, multimedia hub, with each design principle addressing a pattern from the research:</p>
        {/* Each principle, with the research pattern it answers in small print beneath it. */}
        <table className="problem-table">
          <tbody>
            <tr><th scope="row">Findability<span className="table-note">retrieval</span></th><td>search, tags, and categories</td></tr>
            <tr><th scope="row">Accessibility<span className="table-note">time</span></th><td>short summaries, audio, and mobile access</td></tr>
            <tr><th scope="row">Flexibility<span className="table-note">formats &amp; experience</span></th><td>briefs, visuals, audio, and flashcards at multiple depths</td></tr>
            <tr><th scope="row">Context<span className="table-note">application</span></th><td>why each study matters in the field</td></tr>
            <tr><th scope="row">Credibility</th><td>citations and sources on everything, so nothing is lost in simplification</td></tr>
          </tbody>
        </table>
      </>
    ),
  },
  {
    title: "Educational Assets",
    body: (
      <>
        <p>Alongside the product work, I created 20+ educational assets: quick-read briefs, illustrated snapshots, podcast-style audio, and transcripts. They covered landmark thrombectomy trials, aspiration versus stent-retriever evidence, extended-window trials, and how to interpret endpoints like mTICI and 90-day mRS.</p>
        <p className="problem-turn is-wide">Every asset followed a repeatable structure: why to read it, how it connects to field discussion, talking points, and original sources. Every simplification had to keep the study&rsquo;s limitations intact. They also allowed a rep to move from a visual snapshot to audio, a transcript, and the original paper, all on one concept.</p>
      </>
    ),
  },
  {
    title: "Building It",
    body: (
      <>
        <p>I knew a working prototype would land better than a slide deck, so I learned to build one. I owned the problem, information architecture, and scope, and built the app in VS Code with AI coding tools.</p>
        <p className="problem-turn is-wide">In a four-day MVP sprint, I shipped navigation, content cards, snapshots, audio with transcripts, flashcards, citations, basic search, and a mobile-friendly layout. Then I deployed it on Vercel so stakeholders could use it directly. I deliberately held off on AI features until the core experience was proven.</p>
      </>
    ),
  },
  {
    title: "Key Decisions",
    body: (
      <table className="decision-table">
        <thead>
          <tr><th scope="col">Decision</th><th scope="col">Tradeoff</th></tr>
        </thead>
        <tbody>
          <tr><th scope="row">Go beyond summaries</th><td>Solved retrieval and application, but widened the scope</td></tr>
          <tr><th scope="row">Research before building</th><td>Better fit with users, at the cost of slower time to first demo</td></tr>
          <tr><th scope="row">Multiple formats</th><td>Matched how reps learn, but more content to maintain</td></tr>
          <tr><th scope="row">Source integrity first</th><td>Built credibility, but added verification work</td></tr>
          <tr><th scope="row" className="is-snug">Basic search before AI</th><td>Validated the core experience before investing in complexity</td></tr>
        </tbody>
      </table>
    ),
  },
];

// Clinical Education Hub's impact and what comes next, as a three-card deck: the impact so far, the planned AI roadmap,
// and what I took away.
const projectImpact: { title: string; body: React.ReactNode }[] = [
  {
    title: "Impact",
    body: (
      <>
        <p>I presented the Hub to senior leadership and to marketing, international, and sales teams. It sparked cross-functional planning around content ownership, compliance, and IT integration.</p>
        <p>My internship became a contract role as product owner bridging Marketing and IT.</p>
      </>
    ),
  },
  {
    title: "What’s Next",
    body: (
      <>
        <p className="card-note">Planned, not shipped</p>
        <p>I&rsquo;ve outlined a phased AI roadmap, with success metrics such as time to find evidence, citation accuracy, and knowledge gains:</p>
        {/* The roadmap's phases, in order, in the same bordered table as the Problem and Approach cards. */}
        <table className="problem-table">
          <tbody>
            <tr><th scope="row">Evidence foundation</th><td>approved sources and metadata</td></tr>
            <tr><th scope="row">Semantic search</th><td>finding evidence by meaning, not just keywords</td></tr>
            <tr><th scope="row">Evidence assistant</th><td>answers that cite sources or decline when evidence is thin</td></tr>
            <tr><th scope="row">Practice conversations</th><td>simulated physician questions with feedback</td></tr>
            <tr><th scope="row">Personalized content</th><td>reviewed, tailored learning</td></tr>
          </tbody>
        </table>
      </>
    ),
  },
  {
    title: "My Biggest Takeaways",
    body: (
      // The three takeaways as a green table, styled like the reframed question's green box in the Problem deck.
      <table className="takeaway-table">
        <tbody>
          <tr><td>The solution you&rsquo;re asked for isn&rsquo;t always the problem that needs solving.</td></tr>
          <tr><td>More information isn&rsquo;t the same as a better information experience.</td></tr>
          <tr><td>A working prototype starts more concrete conversations than any proposal.</td></tr>
        </tbody>
      </table>
    ),
  },
];

// Experiences and Outcomes: five wide cards stacked one above the other. Each card lists organizations, each with its
// role(s) and dates (or other detail, such as a GPA) on the right.
type XpRole = { title: string; meta?: string; note?: string };
// A role note's **double-starred** phrases are drawn in bold (the résumé's key points).
function withBold(text: string) {
  return text.split(/\*\*(.+?)\*\*/g).map((part, i) => (i % 2 ? <strong key={i}>{part}</strong> : part));
}
function XpOrg({ name, roles, children }: { name: string; roles: XpRole[]; children?: React.ReactNode }) {
  return (
    <div className="xp-org">
      <h4 className="xp-org-name">{name}</h4>
      {roles.map((role) => (
        <div key={role.title} className="xp-role">
          <p className="xp-role-title">{role.title}{role.meta && <span className="xp-meta">{role.meta}</span>}</p>
          {role.note && <p className="xp-role-note">{withBold(role.note)}</p>}
        </div>
      ))}
      {children}
    </div>
  );
}

// The cards follow the résumé's sections and order (public/resume.pdf), newest first within each.
const productMarketing = (
  <XpOrg name="Penumbra, Inc." roles={[
    { title: "Technical Product Owner, Clinical Education Hub", meta: "Contract · Oct 2026–Present", note: "Own requirements and roadmap for the Hub’s company-wide rollout, **aligning marketing, compliance, and IT** on **content ownership**, review, and platform integration. Lead the Hub’s **phased AI roadmap**, including **semantic search** and a **citation-grounded evidence assistant** that declines when evidence is thin, with **success metrics** for time-to-evidence and citation accuracy." },
    { title: "Neurovascular Product Marketing Intern", meta: "Jul–Sep 2026", note: "Reframed an AI-summarization request into a **retrieval and application problem** after interviewing **25+ reps**, running field surveys, auditing the ShowPad library, and joining sales training. Designed and built the **Clinical Education Hub** with **Next.js/React** and AI-assisted development, shipping a **searchable multimedia MVP** in a 4-day sprint; leadership selected it for **4,000+ sales and marketing employees**, turning the internship into a **contract product-owner role**. Analyzed **clinical trial data** and co-developed **evidence-based sales messaging** with marketing teams for the **launch of THUNDERBOLT**, a computer-assisted vacuum thrombectomy (CAVT) device; equipped **70 neuro sales reps** with **20 sales enablement assets**, translating **clinical data, R&D technical training**, and **competitive positioning** into **customer-facing value narratives**." },
  ]} />
);

const leadership = (
  <>
    <XpOrg name="Medical City Dallas Adult Volunteer Program" roles={[{ title: "Vice President, Auxiliary Board", meta: "May 2025–May 2026", note: "Led operations, recruitment, and outreach for a **200+ member service organization** as **primary liaison** to hospital leadership. Grew participation in patient-centered initiatives **~6x (10 to 60+)** through new programs (NICU projects, donation drives, hospital events) and a volunteer newsletter." }]} />
    <XpOrg name="Accessible Prosthetics Initiative" roles={[{ title: "Communications & Outreach Team Lead", meta: "Nov 2023–Jan 2026", note: "Built the nonprofit’s digital presence from zero (branded social content, targeted outreach, Canva collateral), driving **5x membership growth (15 to 75+)**. Led a **10-person fundraising team** that raised **$2,000+ in 4 months** to fund 3D-printed prosthetics for low-income and uninsured amputees. Partnered with disability advocacy groups on **assistive-tech workshops** that fed **user input** into prosthetic design, and led **event marketing** at **Abilities Expo 2024**." }]} />
    <XpOrg name="End Overdose (Texas chapter)" roles={[{ title: "Marketing Director & Lead Crisis Response Trainer", meta: "Aug 2023–Nov 2024", note: "Launched the **first End Overdose chapter in Texas**, aligning brand and messaging with the national organization and running **multichannel campaigns** against overdose misinformation. Trained **910+ people** in overdose response, naloxone, and CPR and distributed **918+ naloxone doses**, managing procurement and logistics to scale operations." }]} />
  </>
);

const research = (
  <XpOrg name="Targeted Neuroplasticity Lab, Texas Biomedical Device Center" roles={[{ title: "Research Assistant", meta: "Jan 2023–Nov 2024", note: "Ran **vagus nerve stimulation (VNS)** and urodynamic experiments to restore bladder function after spinal cord injury, tracking response data in **MATLAB** across **60+ animal subjects**. Fabricated **stimulation hardware** (nerve cuffs, head caps, cables)." }]} />
);

const clinical = (
  <>
    <XpOrg name="ClearSky Rehabilitation Hospital" roles={[{ title: "Patient Care Tech (PCT/CNA)", meta: "Aug 2025–Dec 2025", note: "Delivered inpatient care and documented patient status for **interdisciplinary teams** under **HIPAA** and **infection-control standards**." }]} />
    <XpOrg name="Pain Specialists of Frisco" roles={[{ title: "Front/Back Office Medical Assistant & Scribe", meta: "Jun 2024–Aug 2025", note: "Supported a **50+ patient/day** orthopedic and spine clinic across **intake, insurance verification, EMR documentation**, and **imaging** during **interventional procedures**, gaining a ground-level view of patient journeys and provider workflows." }]} />
  </>
);

// The AI & ML program's progress: three columns (completed, in progress, next up), each topic a bold name and a line on it.
const courseProgress: { heading: string; items: { name: string; text: string }[] }[] = [
  { heading: "Completed", items: [
    { name: "Predictive modeling.", text: "Regression, decision trees, clustering, ensemble methods, and neural networks. I can frame a business question as a modeling problem, pick a sensible approach, and explain the accuracy vs. interpretability tradeoff to non-technical stakeholders." },
    { name: "Python & data analysis.", text: "Cleaning, exploring, and visualizing data to find the story before building anything." },
    { name: "Applied AI workflows.", text: "Prompt engineering, agentic workflows, building on LLM APIs, and weighing performance against cost when AI goes into production." },
  ] },
  { heading: "In Progress", items: [
    { name: "Generative AI & LLMs.", text: "Prompt design, evaluating GenAI output quality, retrieval-augmented generation (grounding answers in trusted sources), and responsible AI practices like bias, safety, and governance." },
  ] },
  { heading: "Next Up", items: [
    { name: "Agentic AI.", text: "Single- and multi-agent systems, and how to evaluate whether an agent is actually doing the job." },
    { name: "Deployment.", text: "Taking ML and GenAI from prototype to production." },
    { name: "Electives.", text: "Multimodal AI, computer vision, recommendation systems, statistical learning, and SQL." },
  ] },
];

function CourseProgress() {
  return (
    <div className="course-progress">
      {courseProgress.map((col) => (
        <section key={col.heading} className="course-col" aria-label={col.heading}>
          <h5 className="course-col-head">{col.heading}</h5>
          <ul className="course-col-list">
            {col.items.map((item) => (
              <li key={item.name}><strong>{item.name}</strong> {item.text}</li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

const education = (
  <>
    <XpOrg name="The University of Texas at Austin" roles={[{
      title: "Post Graduate Program in AI & Machine Learning (PGP-AIML)", meta: "Aug 2026–Feb 2027 · in progress",
      note: "I’m building the technical fluency to make better product calls on AI: knowing what a model can and can’t do, how to tell when it’s working, and what it costs to ship it. I’m especially interested in making AI reliable enough for enterprises and organizing information so people can make the right decisions.",
    }]}>
      <CourseProgress />
    </XpOrg>
    <XpOrg name="The University of Texas at Dallas" roles={[{
      title: "B.S. Medical Neuroscience, Minor in Public Health", meta: "Aug 2022–Aug 2026 · GPA 3.7",
      note: "Studied how people perceive, learn, and make decisions, and how health systems serve whole populations. Built a foundation in reading clinical evidence, running research, and turning complex science into clear takeaways, the same skills I now use to connect technology with the people it serves.",
    }]}>
      <div className="xp-sub">
        <p className="xp-sub-head">Certifications &amp; honors:</p>
        <ul className="xp-sub-list">
          <li>Dean’s List (Fall 2024)</li>
          <li>Dean’s Service Milestone Award (2024)</li>
          <li>EMT-B License (Texas DSHS)</li>
        </ul>
      </div>
    </XpOrg>
  </>
);

// (tone: the colour of the boxes around the card's organization names)
const experiences: { title: string; body: React.ReactNode; tone?: string }[] = [
  { title: "Education & Certifications", body: education },
  { title: "Product & Marketing", body: productMarketing, tone: "pink" },
  { title: "Leadership & Growth Marketing", body: leadership, tone: "orange" },
  { title: "Research", body: research, tone: "green" },
  { title: "Clinical & Healthcare Operations", body: clinical, tone: "blue" },
];

function ExperienceList() {
  return (
    <div className="xp-list">
      {experiences.map((xp) => (
        <article key={xp.title} className={`xp-card${xp.tone ? ` tone-${xp.tone}` : ""}`}>
          <h3 className="xp-card-head">{xp.title}</h3>
          {typeof xp.body === "string" ? <p className="xp-card-body">{xp.body}</p> : <div className="xp-card-body">{xp.body}</div>}
        </article>
      ))}
    </div>
  );
}

// GitHub's and LinkedIn's marks (the icon library has no brand logos).
function GitHubMark() {
  return (
    <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
  );
}

// LinkedIn's mark.
function LinkedInMark() {
  return (
    <svg aria-hidden="true" width="21" height="21" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

// True while a section is being visited: turns on when at least `ratio` of it is on screen, and off once it has scrolled
// out of view completely (so an animation keyed to it replays on the next visit).
function usePlayOnView(ref: React.RefObject<HTMLElement | null>, ratio: number, enabled: boolean) {
  const [active, setActive] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || !enabled) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.intersectionRatio >= ratio) setActive(true);
      else if (!entry.isIntersecting) setActive(false);
    }, { threshold: [0, ratio, 1] });
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref, ratio, enabled]);
  return active;
}

// A deck of cards (the "What I'm Exploring" points, or the bets): one card shows at a time, with the rest stacked behind
// it. Flip with the number pill under it (tap a number, or press and slide along it like the menu), the arrow keys, or a
// swipe. Every card sits in the same spot, so the deck is as tall as the longest one.
function ThemeDeck({ items, label, heading, className = "" }: { items: { title: string; body: React.ReactNode }[]; label: string; heading?: React.ReactNode; className?: string }) {
  const [index, setIndex] = useState(0);
  const [dir, setDir] = useState<1 | -1>(1);
  const swipeStart = useRef<number | null>(null);
  const count = items.length;
  const flip = (step: 1 | -1) => { setDir(step); setIndex((i) => (i + step + count) % count); };
  const goTo = (i: number) => { if (i !== index) { setDir(i > index ? 1 : -1); setIndex(i); } };
  // The number pill works like the menu: press it and slide along it to flip to whichever card is under the pointer.
  const pillRef = useRef<HTMLDivElement>(null);
  const scrubbing = useRef(false);
  const cardAt = (x: number) => {
    const r = pillRef.current?.getBoundingClientRect();
    if (!r) return index;
    return Math.min(count - 1, Math.max(0, Math.floor(((x - r.left) / r.width) * count)));
  };
  return (
    <div
      className={`theme-deck ${className}`.trim()}
      role="group"
      aria-roledescription="carousel"
      aria-label={label}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") { e.preventDefault(); flip(1); }
        if (e.key === "ArrowLeft") { e.preventDefault(); flip(-1); }
      }}
      onPointerDown={(e) => { if (e.pointerType !== "mouse") swipeStart.current = e.clientX; }}
      onPointerUp={(e) => {
        if (swipeStart.current === null) return;
        const dx = e.clientX - swipeStart.current;
        swipeStart.current = null;
        if (Math.abs(dx) > 40) flip(dx < 0 ? 1 : -1);
      }}
    >
      <div className="theme-stack" data-dir={dir}>
        {/* The deck's title stays at the top of the card while the cards beneath it flip. */}
        {heading && <div className="deck-heading">{heading}</div>}
        {items.map((theme, i) => (
          <div
            key={i}
            className={`explore-theme${i === index ? " is-current" : ""}`}
            role="group"
            aria-roledescription="slide"
            aria-label={`${i + 1} of ${count}`}
            aria-hidden={i !== index}
          >
            {theme.title && <h4>{theme.title}</h4>}
            {typeof theme.body === "string" ? <p>{theme.body}</p> : <div className="theme-body">{theme.body}</div>}
          </div>
        ))}
      </div>
      {/* A single card needs no number pill. */}
      {count > 1 && <div className="theme-controls">
        <div
          ref={pillRef}
          className="theme-pill"
          style={{ "--count": count, "--index": index } as React.CSSProperties}
          onPointerDown={(e) => {
            e.preventDefault();
            e.stopPropagation(); // not a swipe on the card
            e.currentTarget.setPointerCapture(e.pointerId);
            scrubbing.current = true;
            goTo(cardAt(e.clientX));
          }}
          onPointerMove={(e) => { if (scrubbing.current) goTo(cardAt(e.clientX)); }}
          onPointerUp={(e) => { e.stopPropagation(); scrubbing.current = false; }}
          onPointerCancel={() => { scrubbing.current = false; }}
        >
          <span className="theme-pill-indicator" aria-hidden="true" />
          {items.map((item, i) => (
            <button key={i} type="button" className={`theme-pill-num${i === index ? " is-current" : ""}`}
              aria-label={`Card ${i + 1} of ${count}${item.title ? `: ${item.title}` : ""}`} aria-current={i === index} onClick={() => goTo(i)}>
              {i + 1}
            </button>
          ))}
        </div>
        <span className="sr-status" aria-live="polite">{`Card ${index + 1} of ${count}`}</span>
      </div>}
    </div>
  );
}

export default function KoiPondHero() {
  const reduceMotion = useReducedMotion();

  // Menu (phone and desktop): pinned to the screen. Press the bar and slide along it; a highlight follows the
  // finger/mouse and the page scrolls to whichever section is under it. A click or tap (or Enter on a focused item)
  // jumps to that section. When scrolling normally, the highlight follows the section you're in.
  const navRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);
  const activeRef = useRef<number | null>(null);
  const [indicator, setIndicator] = useState<{ x: number; w: number } | null>(null);
  const [dragging, setDragging] = useState(false);
  // Phones show the description cut short after "Neuroscience", with a link to expand it.
  const [aboutOpen, setAboutOpen] = useState(false);

  // The hero's falling orange and the contact section's juice pour play each time their section is scrolled to: on when
  // most of it is in view, off again once it has left the screen entirely, so the next visit replays it.
  const heroRef = useRef<HTMLElement>(null);
  const contactRef = useRef<HTMLElement>(null);
  const dropping = usePlayOnView(heroRef, 0.5, !reduceMotion);

  // The hero's dangling orange shakes when touched (tap on phones, hover or click on desktop). Each touch restarts it.
  useEffect(() => {
    if (reduceMotion) return;
    const shake = (el: Element) => {
      el.classList.remove("is-shaking");
      void (el as HTMLElement).offsetWidth; // restart the animation
      el.classList.add("is-shaking");
    };
    const target = (e: Event) => (e.target as Element | null)?.closest?.(".orange-hit");
    const onOver = (e: PointerEvent) => {
      const el = target(e);
      if (el && e.pointerType === "mouse" && !el.contains(e.relatedTarget as Node | null)) shake(el);
    };
    const onDown = (e: PointerEvent) => { const el = target(e); if (el) shake(el); };
    const onEnd = (e: AnimationEvent) => {
      if (e.animationName === "orange-shake") (e.target as Element).classList.remove("is-shaking");
    };
    document.addEventListener("pointerover", onOver);
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("animationend", onEnd);
    return () => {
      document.removeEventListener("pointerover", onOver);
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("animationend", onEnd);
    };
  }, [reduceMotion]);
  const pouring = usePlayOnView(contactRef, 0.6, !reduceMotion);

  const itemAt = (clientX: number) => {
    const links = Array.from(navRef.current?.querySelectorAll<HTMLAnchorElement>("a") ?? []);
    let best = 0, bestDist = Infinity;
    links.forEach((link, i) => {
      const r = link.getBoundingClientRect();
      const d = clientX < r.left ? r.left - clientX : clientX > r.right ? clientX - r.right : 0;
      if (d < bestDist) { best = i; bestDist = d; }
    });
    return best;
  };

  // Moves the highlight onto item i (or hides it for null). Uses layout positions, so it stays put while the
  // desktop menu is scaled up on hover.
  const placeIndicator = (i: number | null) => {
    const link = i === null ? null : navRef.current?.querySelectorAll<HTMLAnchorElement>("a")[i];
    if (!link) { setIndicator(null); return; }
    setIndicator({ x: link.offsetLeft, w: link.offsetWidth });
  };

  // While a jump picked from the menu is scrolling, the scroll-following highlight holds still.
  const followPausedRef = useRef(false);
  const select = (i: number) => {
    if (i === activeRef.current) return;
    activeRef.current = i;
    followPausedRef.current = true;
    placeIndicator(i);
    document.getElementById(navItems[i].id)?.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
  };

  // As the page scrolls, highlight the section you're looking at (see follow() below).
  useEffect(() => {
    let settle = 0;
    const follow = () => {
      // Highlight the last section whose top has reached the middle of the screen (just above the middle, so a heading
      // sitting halfway down counts); at the very bottom of the page, the last one; at the very top, none.
      const line = window.innerHeight * 0.55;
      const tops = navItems.map((item) => document.getElementById(item.id)?.getBoundingClientRect().top ?? Infinity);
      let current: number | null = null;
      tops.forEach((top, i) => { if (top <= line) current = i; });
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2) current = navItems.length - 1;
      if (window.scrollY < 40) current = null; // at the top of the page, nothing is highlighted
      if (current !== activeRef.current) { activeRef.current = current; placeIndicator(current); }
    };
    const onScroll = () => {
      window.clearTimeout(settle);
      // Once scrolling has been still for a moment (and the menu isn't being dragged), follow the page again.
      settle = window.setTimeout(() => {
        if (draggingRef.current) return;
        followPausedRef.current = false;
        follow();
      }, 150);
      if (!followPausedRef.current && !draggingRef.current) follow();
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => { window.removeEventListener("scroll", onScroll); window.removeEventListener("resize", onScroll); window.clearTimeout(settle); };
  }, []);

  const onNavPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    draggingRef.current = true;
    setDragging(true);
    activeRef.current = null; // pressing the current item again still scrolls back to it
    select(itemAt(e.clientX));
  };
  const onNavPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (draggingRef.current) select(itemAt(e.clientX));
  };
  const onNavPointerEnd = () => { draggingRef.current = false; setDragging(false); };
  // Presses are handled above, so the links' own instant jump is skipped; a keyboard "click" (Enter on a focused
  // item, which has no press) scrolls to its section here.
  const onNavClick = (e: ReactMouseEvent<HTMLDivElement>) => {
    const link = (e.target as HTMLElement).closest("a");
    if (!link) return;
    e.preventDefault();
    if (e.detail === 0) {
      activeRef.current = null;
      select(navItems.findIndex((item) => `#${item.id}` === link.getAttribute("href")));
    }
  };

  return (
    <>
      <main>
        <section ref={heroRef} className={`pond-hero theme-${HERO_THEME}${dropping ? " is-dropping" : ""}`} id="home" aria-labelledby="hero-title">
          {HERO_THEME === "scene" && <SwayingScene className="hero-scene" />}
          {HERO_THEME === "pond" && (
            <>
              <div className="pond-background" aria-hidden="true" />
              <div className="pond-vignette" aria-hidden="true" />
            </>
          )}
          {SHOW_BRANCHES && (
            <>
              <div className="hero-branches" aria-hidden="true" />
              <div className="hero-branches-right" aria-hidden="true">
                {/* The tree sways in the wind; its lowest orange is a separate piece that dangles from its stem. */}
                {/* Each time the hero is scrolled to: an orange drops from behind the leaves as the tree shakes. */}
                <span className="falling-orange" />
                <div className="tree-art">
                  <span className="dangling-orange orange-hit" />
                </div>
              </div>
            </>
          )}

          <nav className="pond-nav" aria-label="Main navigation">
            <a href="#home" className="brand" aria-label="Nethra Prabhu, home">
              <Image src="/art/n-logo.png" alt="" width={234} height={160} priority />
            </a>
            <div
              ref={navRef}
              className={`nav-links${dragging ? " is-dragging" : ""}`}
              onPointerDown={onNavPointerDown}
              onPointerMove={onNavPointerMove}
              onPointerUp={onNavPointerEnd}
              onPointerCancel={onNavPointerEnd}
              onClickCapture={onNavClick}
            >
              <span
                className={`nav-indicator${indicator ? " is-on" : ""}`}
                style={indicator ? { left: indicator.x, width: indicator.w } : undefined}
                aria-hidden="true"
              />
              {navItems.map((item) => (
                <a key={item.id} href={`#${item.id}`}>
                  {item.label}{item.arrow && <span className="nav-arrow" aria-hidden="true"> ↗</span>}
                </a>
              ))}
            </div>
          </nav>

          <div className="pond-decor" aria-hidden="true">
            {SHOW_LILY_PADS && leaves.map((leaf) => (
              <motion.div
                key={leaf.id}
                className="lotus-leaf"
                style={{ left: leaf.x, top: leaf.y, width: leaf.w }}
                animate={reduceMotion ? undefined : {
                  y: [0, -9, 3, 0], x: [0, 5, -4, 0], rotate: [leaf.rotate, leaf.rotate + 5, leaf.rotate - 3, leaf.rotate]
                }}
                initial={{ rotate: leaf.rotate }}
                transition={{ duration: leaf.duration, delay: leaf.delay, repeat: Infinity, ease: "easeInOut" }}
              >
                <Image src={`/art/lotus-leaf-${leaf.id}.webp`} alt="" width={160} height={160} sizes="160px" />
              </motion.div>
            ))}
          </div>

          <div className="hero-copy">
            {/* The name sets the block's width; the headshot and about below line up with its edges. */}
            <div className="hero-head">
              <h1 id="hero-title" className="hero-name">NETHRA PRABHU</h1>
              <div className="hero-intro">
                {/* Professional headshot, shown as a circle. Served as-is (already a sharpened, high-quality WebP at full
                    resolution) rather than re-compressed by the image optimizer, which would soften it. */}
                <Image className="headshot" src="/art/nethra-headshot-hd2.webp" alt="Nethra Prabhu" width={560} height={560} unoptimized priority />
                {/* Short "about" blurb, part of the hero. */}
                <div id="about" className={`hero-about${aboutOpen ? " is-open" : ""}`}>
                  <h2 className="section-kicker">From raw ideas -&gt; real impact</h2>
                  <p>
                    I find what&rsquo;s worth building, shape it, and make sure it reaches the people who need it. My background in
                    Neuroscience
                    {/* On phones the rest is hidden until "read more" is tapped; desktop always shows it. */}
                    <span id="about-more" className="about-more">
                      {" "}from UT Dallas taught me how people think, learn, and make decisions, and I&rsquo;m now studying{" "}
                      <span className="nowrap">AI/ML</span> at UT Austin to understand what today&rsquo;s technology can actually deliver. I care
                      about products people can trust that still feel built for them. If you&rsquo;re a founder, investor, or builder
                      turning raw ideas into something real, I&rsquo;d love to talk.
                    </span>
                    <span className="about-ellipsis" aria-hidden="true">...</span>
                    <button type="button" className="about-toggle" aria-expanded={aboutOpen} aria-controls="about-more" onClick={() => setAboutOpen((open) => !open)}>
                      {aboutOpen ? "[read less]" : "[read more]"}
                    </button>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 2 — Featured: Ideas I'm Exploring (the yellow box on a black band), then Project Highlights. */}
        <section className="page-section featured-section" aria-labelledby="featured-title">
          <div className="explore-band">
            <p className="explore-kicker">I&rsquo;m interested in...</p>
            <div id="exploring" className="section-block">
              {/* Two columns, each a flippable card deck with its title inside the card (stacked on phones). */}
              <div className="explore-columns">
                <div className="explore-intro">
                  <ThemeDeck
                    items={exploreThemes}
                    label="What I'm exploring"
                    heading={<p className="explore-lede">The gap between what tech can do and who it serves.</p>}
                  />
                </div>
                <div className="explore-intro bets-intro">
                  <ThemeDeck
                    items={exploreTopics.map((topic) => ({ title: topic.subtitle ?? topic.title, body: topic.body ?? "" }))}
                    label="Where I'd place my bets"
                    heading={<h3 className="on-my-mind bets-title">Where tech meets industry</h3>}
                  />
                </div>
              </div>
            </div>
          </div>

          <div id="featured" className="snapshots-row">
            <div className="snapshots-col">
              <h2 id="featured-title" className="section-title featured-title">Project Highlights <span className="featured-project">Clinical Education Hub</span></h2>
              {/* The live prototype and the timeline, each in its own outlined box. */}
              <div className="project-meta">
                <a className="project-meta-box" href="https://clinical-education-hub.vercel.app" target="_blank" rel="noopener noreferrer">clinical-education-hub.vercel.app</a>
                <span className="project-meta-box">July 2026–present</span>
              </div>
            </div>
          </div>

          {/* A copy of the "I'm interested in" box, for the project's highlights. */}
          <div id="highlights-box" className="section-block">
            {/* The summary, then the Problem, Designing & Building, and Impact & Future decks side by side, then the wide
                Skill Stack card under them (all stacked on phones). */}
            <div id="highlights-cards" className="explore-columns">
              <p className="hl-summary">
                A <mark>centralized learning platform</mark> that translates <mark>dense clinical evidence</mark> into{" "}
                <mark>accessible, field&#8209;ready knowledge</mark> for medical device sales teams.
              </p>
              <div className="explore-intro">
                <ThemeDeck
                  items={projectProblem}
                  label="Project highlights, problem"
                  heading={<p className="explore-lede">Problem</p>}
                />
              </div>
              <div className="explore-intro bets-intro">
                <ThemeDeck
                  items={projectBuild}
                  label="Project highlights, designing and building"
                  heading={<h3 className="on-my-mind bets-title">Designing &amp; Building</h3>}
                />
              </div>
              <div className="explore-intro">
                <ThemeDeck items={projectImpact} label="Project highlights, impact and future" heading={<p className="explore-lede">Impact &amp; Future</p>} />
              </div>
              <div className="explore-intro hl-snapshot">
                <ThemeDeck items={[{ title: "", body: <ProjectSkills /> }]} label="Project highlights, skill stack" heading={<p className="explore-lede">Skill stack</p>} />
              </div>
            </div>
          </div>
        </section>

        {/* Section 3 — Experience & impact, with contact just below. */}
        <section id="experience" className="page-section experience-section" aria-labelledby="experience-title">
          <h2 id="experience-title" className="section-title featured-title">Experiences and Outcomes <span className="featured-project">From Patient Care to Product</span></h2>
          {/* A one-line summary of the path so far, and the résumé, which opens in a new tab (public/resume.pdf). */}
          <div className="xp-intro">
            <p>I&rsquo;ve delivered care, researched it, and marketed it. In every role, I saw the same problem: <mark>critical information was scattered</mark>. Now I <mark>build products</mark> that make it accessible and usable, and I&rsquo;m drawn to <mark>backing the companies solving this issue at scale</mark>.</p>
            <a className="resume-link" href="/resume.pdf" target="_blank" rel="noopener noreferrer">
              Download résumé
              <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 4v11M7 10l5 5 5-5M5 20h14" />
              </svg>
            </a>
          </div>
          {/* A copy of the "I'm interested in" box. */}
          <div id="experience-box" className="section-block">
            <ExperienceList />
          </div>
        </section>

        {/* Contact: a black section with the pinned "Let's Connect" card, the juice glasses, the peeled orange and a branch. */}
        <section ref={contactRef} className={`contact-section${pouring ? " is-pouring" : ""}`} aria-label="Contact">
          {/* Each time the section is scrolled to, juice pours from its top edge into the lower juice glass for 3 seconds. */}
          <span className="juice-pour" aria-hidden="true" />
          <div id="contact" className="contact-block">
            <p className="contact-invite">Have an idea, a question, or a problem worth solving? I&rsquo;m always happy to talk it through.</p>
            <h3 className="lets-connect">Let&rsquo;s Connect.</h3>
            <div className="contact-links">
              {/* Opens the visitor's email app with a new message to this address. */}
              <a className="email-link" href="mailto:nethraprabhu27@gmail.com" aria-label="Email nethraprabhu27@gmail.com" data-handle="nethraprabhu27@gmail.com">
                <Mail aria-hidden="true" size={22} strokeWidth={2} />
              </a>
              <a className="email-link" href="https://github.com/nethraprabhu27" target="_blank" rel="noopener noreferrer" aria-label="GitHub, @nethraprabhu27 (opens in a new tab)" data-handle="@nethraprabhu27">
                <GitHubMark />
              </a>
              <a className="email-link" href="https://www.linkedin.com/in/nethraprabhu227" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn, in/nethraprabhu227 (opens in a new tab)" data-handle="in/nethraprabhu227">
                <LinkedInMark />
              </a>
            </div>
          </div>
          {/* Peeled orange in the bottom-right corner, by the contact details. Served as-is (a high-quality WebP, large
              enough for sharp display on high-density screens) rather than re-compressed by the image optimizer. */}
          {/* Two glasses of orange juice standing behind the peeled orange (laid out to line up with it). */}
          <Image className="contact-juice" src="/art/juice-glasses-hd3.webp" alt="" width={1300} height={1180} unoptimized />
          <Image className="contact-orange" src="/art/peeled-orange-hd.webp" alt="" width={1000} height={1000} unoptimized />
          {/* A copy of the lower juice glass on the left, mirroring the right-hand one's distance from the edge. */}
          <Image className="contact-juice-left" src="/art/juice-glass-single.webp" alt="" width={579} height={715} unoptimized />
          {/* An orange-tree branch growing up from the bottom-left corner, with an extra orange tucked behind the middle of
              its leaves. */}
          <Image className="contact-branch contact-branch-bottom" src="/art/contact-branch-bottom-v2.webp" alt="" width={828} height={496} unoptimized />
          {/* Phones show this version instead: the same branch with its oranges enlarged (leaves unchanged). */}
          <Image className="contact-branch contact-branch-bottom contact-branch-bottom-phone" src="/art/contact-branch-bottom-big-oranges-v2.webp" alt="" width={828} height={496} unoptimized />
        </section>
      </main>
    </>
  );
}
