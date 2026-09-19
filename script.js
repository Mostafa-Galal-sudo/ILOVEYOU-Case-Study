const doc = document.documentElement;
const header = document.querySelector("[data-header]");
const progressBar = document.querySelector(".page-progress span");
const menuButton = document.querySelector(".menu-button");
const nav = document.querySelector(".site-nav");
const navLinks = [...document.querySelectorAll(".site-nav a")];
const steps = [...document.querySelectorAll(".sequence-step")];
const thread = document.querySelector(".infection-thread span");
const sequenceTrack = document.querySelector(".sequence-track");
const intro = document.querySelector("[data-intro]");
const introSkip = document.querySelector("[data-intro-skip]");
const infectedSection = document.querySelector("[data-infected]");
const openingSection = document.querySelector("#the-message");
const parallaxSections = [...document.querySelectorAll("[data-parallax]")];
const counter = document.querySelector("[data-counter]");

function dismissIntro() {
  if (!intro || intro.classList.contains("is-leaving")) return;
  intro.classList.add("is-leaving");
  document.body.classList.remove("intro-locked");
  window.setTimeout(() => intro.setAttribute("aria-hidden", "true"), 1000);
  const audio = document.querySelector("[data-intro-audio]");
  if (audio) {
    audio.pause();
    audio.currentTime = 0;
  }
}

introSkip?.addEventListener("click", dismissIntro);

const introAudio = document.querySelector("[data-intro-audio]");
const introImg = document.querySelector(".intro-frame img");
const startGate = document.querySelector("[data-start-gate]");
const startButton = document.querySelector("[data-start-button]");
let caseStarted = false;

function startCase() {
  if (caseStarted) return;
  caseStarted = true;

  startGate?.classList.add("is-leaving");
  window.setTimeout(() => startGate?.setAttribute("aria-hidden", "true"), 700);

  // Reveal the intro-gate now (it was display:none), which restarts its
  // CSS animations (loader bar, frame impact) from frame one.
  intro?.classList.remove("is-pending");

  // The gif has no src until now, so it starts playing exactly on click.
  // assets/intro-love.gif is preloaded, so this paints instantly.
  if (introImg && introImg.dataset.src) {
    introImg.src = introImg.dataset.src;
  }

  // Audio: this fires inside a real click handler, so browsers allow it.
  if (introAudio) {
    introAudio.currentTime = 0;
    introAudio.play().catch(() => {});
    window.setTimeout(() => {
      introAudio.pause();
      introAudio.currentTime = 0;
    }, 12000);
  }

  window.setTimeout(dismissIntro, 12000);
}

startButton?.addEventListener("click", startCase);

function updateScrollState() {
  const scrollable = doc.scrollHeight - window.innerHeight;
  const progress = scrollable > 0 ? window.scrollY / scrollable : 0;
  progressBar.style.transform = `scaleX(${Math.min(1, Math.max(0, progress))})`;
  header.classList.toggle("is-scrolled", window.scrollY > 40);

  if (openingSection && infectedSection) {
    const infectionStart = openingSection.offsetTop + openingSection.offsetHeight * 0.2;
    const infectionEnd = infectedSection.offsetTop + infectedSection.offsetHeight * 0.2;
    const infectionLevel = Math.min(1, Math.max(0, (window.scrollY - infectionStart) / Math.max(1, infectionEnd - infectionStart)));
    doc.style.setProperty("--infection-level", infectionLevel.toFixed(3));
    document.body.classList.toggle("theme-threat", infectionLevel > 0.34);
    document.body.classList.toggle("theme-infected", infectionLevel > 0.78);
  }

  parallaxSections.forEach((section) => {
    const rect = section.getBoundingClientRect();
    const local = Math.min(1, Math.max(-1, (window.innerHeight * .5 - (rect.top + rect.height * .5)) / window.innerHeight));
    section.style.setProperty("--parallax-y", `${local * 6}%`);
  });

  if (sequenceTrack && thread) {
    const rect = sequenceTrack.getBoundingClientRect();
    const start = window.innerHeight * 0.45;
    const traveled = start - rect.top;
    const amount = Math.min(1, Math.max(0, traveled / Math.max(1, rect.height - window.innerHeight * 0.35)));
    thread.style.transform = `scaleY(${amount})`;

    steps.forEach((step) => {
      const stepRect = step.getBoundingClientRect();
      const center = stepRect.top + stepRect.height / 2;
      step.classList.toggle("is-current", center > window.innerHeight * 0.22 && center < window.innerHeight * 0.78);
    });
  }
}

let ticking = false;
window.addEventListener("scroll", () => {
  if (!ticking) {
    requestAnimationFrame(() => {
      updateScrollState();
      ticking = false;
    });
    ticking = true;
  }
}, { passive: true });
updateScrollState();

menuButton?.addEventListener("click", () => {
  const open = menuButton.getAttribute("aria-expanded") === "true";
  menuButton.setAttribute("aria-expanded", String(!open));
  nav.classList.toggle("is-open", !open);
});

navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    menuButton?.setAttribute("aria-expanded", "false");
    nav?.classList.remove("is-open");
  });
});

const chapterObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    const id = entry.target.id;
    navLinks.forEach((link) => link.classList.toggle("is-active", link.hash === `#${id}`));
  });
}, { rootMargin: "-35% 0px -55%", threshold: 0 });

document.querySelectorAll("[data-chapter]").forEach((chapter) => chapterObserver.observe(chapter));

const attachment = document.querySelector("[data-attachment]");
const attachmentNote = document.querySelector(".attachment-note");
attachment?.addEventListener("click", () => {
  const inspected = attachment.classList.toggle("is-inspected");
  attachment.querySelector(".attachment-action").textContent = inspected ? "Revealed" : "Inspect";
  attachmentNote.textContent = inspected
    ? "True extension revealed: .vbs — executable script, not a text document."
    : "Static reconstruction — the attachment cannot execute.";
});

const orbit = document.querySelector("[data-orbit]");
if (orbit) {
  const orbitObserver = new IntersectionObserver(([entry]) => {
    orbit.classList.toggle("is-awake", entry.isIntersecting);
  }, { threshold: 0.35 });
  orbitObserver.observe(orbit);
}

if (infectedSection) {
  const infectedObserver = new IntersectionObserver(([entry]) => {
    infectedSection.classList.toggle("is-visible", entry.isIntersecting);
  }, { threshold: 0.34 });
  infectedObserver.observe(infectedSection);
}

if (counter) {
  const counterObserver = new IntersectionObserver(([entry], observer) => {
    if (!entry.isIntersecting) return;
    const start = performance.now();
    const duration = 1700;
    function count(now) {
      const elapsed = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - elapsed, 3);
      counter.textContent = String(Math.round(250 * eased)).padStart(3, "0");
      if (elapsed < 1) requestAnimationFrame(count);
    }
    requestAnimationFrame(count);
    observer.disconnect();
  }, { threshold: .55 });
  counterObserver.observe(counter);
}

const accordion = document.querySelector("[data-accordion]");
accordion?.addEventListener("toggle", (event) => {
  const current = event.target;
  if (!(current instanceof HTMLDetailsElement) || !current.open) return;
  accordion.querySelectorAll("details[open]").forEach((item) => {
    if (item !== current) item.open = false;
  });
}, true);

const copyButton = document.querySelector("[data-copy-iocs]");
const copyStatus = document.querySelector(".copy-status");
copyButton?.addEventListener("click", async () => {
  const blocks = [...document.querySelectorAll("[data-iocs] article")];
  const text = blocks.map((block) => {
    const heading = block.querySelector("h3")?.textContent ?? "Indicators";
    const values = [...block.querySelectorAll("p")].map((item) => item.textContent.trim());
    return `${heading}\n${values.join("\n")}`;
  }).join("\n\n");

  try {
    await navigator.clipboard.writeText(text);
    copyStatus.textContent = "Indicators copied to clipboard.";
  } catch {
    copyStatus.textContent = "Clipboard access was blocked. Select the indicators manually.";
  }
});
