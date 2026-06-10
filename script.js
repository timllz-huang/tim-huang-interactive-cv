const body = document.body;
const progressFill = document.querySelector(".progress-fill");
const cursorDot = document.querySelector(".cursor-dot");
const revealEls = document.querySelectorAll(".reveal");
const filterButtons = document.querySelectorAll(".filter-bar button");
const heroSignalButtons = document.querySelectorAll(".hero-tags [data-signal]");
const projectCards = document.querySelectorAll(".project-card");
const expertiseCards = document.querySelectorAll(".expertise-grid article");
const credentialChips = document.querySelectorAll(".drawer-content span");
const timelineNodes = document.querySelectorAll(".timeline-node");
const diveProfileNodes = document.querySelectorAll(".dive-profile-node");
const palette = document.querySelector("#commandPalette");
const paletteButtons = document.querySelectorAll(".palette-button, .search-command");
const diveToggle = document.querySelector(".dive-toggle");
const signalPanel = document.querySelector("#signalPanel");
const signalProjects = document.querySelector("#signalProjects");
const signalCredentials = document.querySelector("#signalCredentials");
const signalExperience = document.querySelector("#signalExperience");

const panels = {
  banpu: {
    title: "Head of IT - Banpu Energy Australia",
    text: "Leading IT/OT transformation across renewable energy assets, including Essential Eight uplift, AESCSF audit participation, SOCI-aware planning, Energy One private cloud operations, Meraki segmentation, M365 automation, cloud cost optimisation, and AI-ready Azure data foundations."
  },
  anspec: {
    title: "IT Operations Manager - Anspec",
    text: "Supported ISO 9001 certification through IT documentation and controls, lifted cyber maturity from level 0 to 1, directed SAP ERP and WMS modernisation, built BCP/DRP frameworks, and managed MSP and cybersecurity partners."
  },
  "ideagen-manager": {
    title: "IT Infrastructure Manager - Ideagen / CompliSpace",
    text: "Led Aruba SDN, Intune MDM, Proofpoint, cloud security gateways, stakeholder alignment, quarterly cyber awareness programs, endpoint compliance, and SaaS infrastructure operations."
  },
  "ideagen-admin": {
    title: "Senior Sys & Network Administrator - Ideagen / CompliSpace",
    text: "Migrated on-prem environments to Azure and Office 365, implemented VPNs, firewalls, patch management, proactive monitoring, and disaster recovery design."
  },
  wta: {
    title: "Network Systems Administrator - W.T.A International Trading",
    text: "Re-architected Linux and Windows infrastructure, improved SAN and virtualised performance, upgraded VPN access, managed LAN/WAN, firewalls, switching, PBX/VoIP, inventory, backups, and third-party troubleshooting."
  }
};

const signals = {
  "it-ot": {
    label: "IT/OT Roadmap",
    filter: "it-ot",
    projects: "IT/OT cyber uplift, Meraki segmentation, Energy One operations",
    credentials: "Essential Eight, SOCI awareness, AESCSF audit participation",
    experience: "Banpu Energy Australia - 95% of Year 1 IT/OT roadmap delivered",
    panel: "banpu"
  },
  "essential-eight": {
    label: "Essential Eight",
    filter: "cybersecurity",
    projects: "IT/OT cyber uplift and organisation-wide cyber awareness",
    credentials: "CompTIA Security+",
    experience: "Banpu and Anspec - maturity uplift from structured controls, training, and governance",
    panel: "banpu"
  },
  finops: {
    label: "FinOps",
    filter: "cloud",
    projects: "FinOps optimisation and hybrid cloud AI foundation",
    credentials: "AWS Solutions Architect Associate",
    experience: "Banpu Energy Australia - 30% cloud operations savings achieved, with a further 20-30% target",
    panel: "banpu"
  },
  "ai-cloud": {
    label: "AI Cloud",
    filter: "cloud",
    projects: "Hybrid cloud architecture and Azure Data Factory asset data streaming",
    credentials: "AWS Associate certifications, AWS SA-Pro in progress",
    experience: "Banpu Energy Australia - AI-driven performance modelling foundation",
    panel: "banpu"
  },
  pmp: {
    label: "PMP",
    filter: "delivery",
    projects: "Lifecycle automation and enterprise systems governance",
    credentials: "PMP, ITIL Foundation, Salesforce Administrator",
    experience: "Banpu and Anspec - roadmap delivery, executive communication, vendor governance",
    panel: "anspec"
  }
};

function updateProgress() {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  const progress = max > 0 ? (window.scrollY / max) * 100 : 0;
  progressFill.style.height = `${progress}%`;
}

function animateCounts() {
  document.querySelectorAll("[data-count]").forEach((el) => {
    if (el.dataset.animated === "true") return;
    el.dataset.animated = "true";
    const target = Number(el.dataset.count);
    let current = 0;
    const step = Math.max(1, Math.ceil(target / 32));
    const timer = setInterval(() => {
      current = Math.min(target, current + step);
      el.textContent = `${current}${el.dataset.suffix || "+"}`;
      if (current >= target) clearInterval(timer);
    }, 36);
  });
}

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
      if (entry.target.classList.contains("command-panel")) animateCounts();
    }
  });
}, { threshold: 0.16 });

revealEls.forEach((el) => observer.observe(el));

function categoryMatches(element, category) {
  return (element.dataset.category || "").split(" ").includes(category);
}

function clearSignalMatches() {
  [...projectCards, ...expertiseCards, ...credentialChips, ...timelineNodes, ...diveProfileNodes].forEach((item) => {
    item.classList.remove("signal-match");
  });
}

function applyZoneFilter(filter) {
  filterButtons.forEach((btn) => btn.classList.toggle("active", btn.dataset.filter === filter));
  heroSignalButtons.forEach((btn) => btn.classList.remove("active"));
  clearSignalMatches();

  [...projectCards, ...expertiseCards].forEach((card) => {
    card.classList.toggle("hidden", filter !== "all" && !categoryMatches(card, filter));
  });
}

function setTimelinePanel(panelKey) {
  const panel = panels[panelKey];
  if (!panel) return;

  timelineNodes.forEach((item) => item.classList.toggle("active", item.dataset.panel === panelKey));
  diveProfileNodes.forEach((item) => item.classList.toggle("active", item.dataset.panel === panelKey));
  document.querySelector("#experiencePanel").innerHTML = `<h3>${panel.title}</h3><p>${panel.text}</p>`;
}

function openCredentialDrawer() {
  const drawerContent = document.querySelector(".drawer-content");
  const drawerToggle = document.querySelector(".drawer-toggle");
  drawerContent.classList.add("open");
  drawerToggle.setAttribute("aria-expanded", "true");
  drawerToggle.textContent = "Close certification drawer";
}

function applySignal(signalKey) {
  const signal = signals[signalKey];
  if (!signal) return;

  heroSignalButtons.forEach((btn) => btn.classList.toggle("active", btn.dataset.signal === signalKey));
  filterButtons.forEach((btn) => btn.classList.toggle("active", btn.dataset.filter === signal.filter));
  clearSignalMatches();

  [...projectCards, ...expertiseCards].forEach((card) => {
    const match = categoryMatches(card, signalKey) || categoryMatches(card, signal.filter);
    card.classList.toggle("hidden", !match);
    card.classList.toggle("signal-match", match);
  });

  credentialChips.forEach((chip) => {
    chip.classList.toggle("signal-match", categoryMatches(chip, signalKey) || categoryMatches(chip, signal.filter));
  });

  timelineNodes.forEach((node) => {
    node.classList.toggle("signal-match", categoryMatches(node, signalKey) || categoryMatches(node, signal.filter));
  });

  diveProfileNodes.forEach((node) => {
    node.classList.toggle("signal-match", node.dataset.panel === signal.panel);
  });

  openCredentialDrawer();
  setTimelinePanel(signal.panel);

  signalPanel.querySelector("h3").textContent = `${signal.label} evidence surfaced`;
  signalProjects.textContent = signal.projects;
  signalCredentials.textContent = signal.credentials;
  signalExperience.textContent = signal.experience;
  signalPanel.classList.remove("signal-updated");
  requestAnimationFrame(() => signalPanel.classList.add("signal-updated"));
}

window.addEventListener("scroll", updateProgress, { passive: true });
updateProgress();

window.addEventListener("mousemove", (event) => {
  if (!cursorDot) return;
  cursorDot.style.left = `${event.clientX}px`;
  cursorDot.style.top = `${event.clientY}px`;
});

diveToggle.addEventListener("click", () => {
  const active = body.classList.toggle("dive");
  diveToggle.setAttribute("aria-pressed", String(active));
});

filterButtons.forEach((button) => {
  button.addEventListener("click", () => applyZoneFilter(button.dataset.filter));
});

heroSignalButtons.forEach((button) => {
  button.addEventListener("click", () => applySignal(button.dataset.signal));
});

projectCards.forEach((card) => {
  card.addEventListener("click", () => {
    projectCards.forEach((item) => {
      if (item !== card) item.classList.remove("is-flipped");
    });
    card.classList.toggle("is-flipped");
  });

  card.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      card.click();
    }
  });
});

document.querySelectorAll("[data-jump]").forEach((button) => {
  button.addEventListener("click", () => {
    const target = document.querySelector(button.dataset.jump);
    if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
    if (palette.open) palette.close();
  });
});

timelineNodes.forEach((node) => {
  node.addEventListener("click", () => setTimelinePanel(node.dataset.panel));
});

diveProfileNodes.forEach((node) => {
  node.addEventListener("click", () => setTimelinePanel(node.dataset.panel));
});

document.querySelector(".drawer-toggle").addEventListener("click", (event) => {
  const content = document.querySelector(".drawer-content");
  const open = content.classList.toggle("open");
  event.currentTarget.setAttribute("aria-expanded", String(open));
  event.currentTarget.textContent = open ? "Close certification drawer" : "Open certification drawer";
});

document.querySelector(".ripple-button").addEventListener("click", (event) => {
  const ping = document.createElement("span");
  ping.className = "ping";
  event.currentTarget.appendChild(ping);
  setTimeout(() => ping.remove(), 700);
});

paletteButtons.forEach((button) => {
  button.addEventListener("click", () => palette.showModal());
});

window.addEventListener("keydown", (event) => {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
    event.preventDefault();
    palette.showModal();
  }
});
