import { useEffect, useRef, useState } from "react";

interface Project {
  id: string;
  className: string;
  number: string;
  title: string;
  summary: string;
  briefTitle: string;
  brief: string;
  stack: string;
  category: string;
}

const projects: Project[] = [
  {
    id: "ai",
    className: "project-card-ai",
    number: "01",
    title: "Hybrid cloud AI foundation",
    summary: "Designed cloud architecture and data streaming into Azure Data Factory for AI-driven asset performance modelling.",
    briefTitle: "AI-ready energy data layer",
    brief: "Proposed a hybrid cloud model that connects asset telemetry into Azure Data Factory, creating the foundation for performance modelling, decision support, and scalable renewable energy operations.",
    stack: "Azure Data Factory / Hybrid cloud / Asset telemetry",
    category: "cloud delivery ai-cloud",
  },
  {
    id: "cyber",
    className: "project-card-cyber",
    number: "02",
    title: "IT/OT cyber uplift",
    summary: "Advanced Essential Eight initiatives, SOCI planning, AESCSF audit participation, and Dragos evaluation for SCADA-integrated sites.",
    briefTitle: "Cyber maturity across critical assets",
    brief: "Led cyber uplift across IT and OT environments, balancing compliance, audit readiness, threat monitoring, and practical controls for SCADA-integrated solar infrastructure.",
    stack: "Essential Eight / SOCI / AESCSF / Dragos",
    category: "cybersecurity energy it-ot",
  },
  {
    id: "finops",
    className: "project-card-finops",
    number: "03",
    title: "FinOps optimisation",
    summary: "Achieved 30% cloud operations savings, with a further 20-30% target through reserved instances, workload tuning, and license consolidation.",
    briefTitle: "Cloud spend with operating discipline",
    brief: "Reduced cloud operating cost while keeping service reliability intact, using workload review, reserved capacity, licence consolidation, and governance conversations with stakeholders.",
    stack: "30% saved / Reserved instances / Licence governance",
    category: "cloud delivery",
  },
  {
    id: "meraki",
    className: "project-card-meraki",
    number: "04",
    title: "Meraki segmentation",
    summary: "Deployed Meraki SDN, VLANs, QoS, and centralised management to support OT isolation and secure asset connectivity.",
    briefTitle: "Network control for OT isolation",
    brief: "Moved the network toward a more observable, segmented, and centrally managed model, supporting secure asset connectivity, quality of service, and operational resilience.",
    stack: "Meraki SDN / VLANs / QoS / OT isolation",
    category: "infrastructure it-ot",
  },
  {
    id: "automation",
    className: "project-card-automation",
    number: "05",
    title: "Lifecycle automation",
    summary: "Built Power Automate and SharePoint onboarding/offboarding workflows, reducing manual process effort by 90%.",
    briefTitle: "From manual handoffs to governed flow",
    brief: "Connected HR and IT workflows through SharePoint, M365, and Power Automate, improving identity lifecycle control, audit readiness, and staff onboarding speed.",
    stack: "90% time saved / M365 / SharePoint / Power Automate",
    category: "delivery automation",
  },
  {
    id: "enterprise",
    className: "project-card-enterprise",
    number: "06",
    title: "Enterprise systems governance",
    summary: "Managed Energy One private cloud, SAP ERP, WMS, and multi-vendor delivery across IT, OT, cyber, SCADA, and asset platforms.",
    briefTitle: "Keeping business platforms dependable",
    brief: "Governed vendor delivery across trading, ERP, warehouse, cyber, and asset systems, maintaining Energy One private cloud uptime and aligning platforms to business operations.",
    stack: "99.9% uptime / SAP / WMS / Vendor governance",
    category: "enterprise delivery",
  },
];

const filters = [
  { id: "all", label: "All zones" },
  { id: "cybersecurity", label: "Cybersecurity" },
  { id: "cloud", label: "Cloud" },
  { id: "it-ot", label: "IT/OT" },
  { id: "infrastructure", label: "Infrastructure" },
  { id: "enterprise", label: "Enterprise" },
  { id: "delivery", label: "Delivery" },
];

const panels: Record<string, { title: string; text: string }> = {
  banpu: {
    title: "Head of IT - Banpu Energy Australia",
    text: "Leading IT/OT transformation, cyber maturity uplift, cloud optimisation, Energy One operations, Meraki segmentation, and executive-level strategy across renewable energy infrastructure.",
  },
  anspec: {
    title: "IT Operations Manager - Anspec",
    text: "Supported ISO 9001 certification through IT documentation and controls, lifted cyber maturity from level 0 to 1, directed SAP ERP and WMS modernisation, and managed MSP and cybersecurity partners.",
  },
  "ideagen-manager": {
    title: "IT Infrastructure Manager - Ideagen / CompliSpace",
    text: "Led Aruba SDN, Intune MDM, Proofpoint, cloud security gateways, quarterly cyber awareness programs, endpoint compliance, and SaaS infrastructure operations.",
  },
  "ideagen-admin": {
    title: "Senior Sys & Network Administrator - Ideagen / CompliSpace",
    text: "Migrated on-prem environments to Azure and Office 365, implemented VPNs, firewalls, patch management, proactive monitoring, and disaster recovery design.",
  },
  wta: {
    title: "Network Systems Administrator - W.T.A International Trading",
    text: "Re-architected Linux and Windows infrastructure, improved SAN and virtualised performance, upgraded VPN access, and managed LAN/WAN, firewalls, switching, PBX/VoIP, and backups.",
  },
};

const timeline = [
  { year: "2023", label: "Banpu Energy Australia", panel: "banpu" },
  { year: "2022", label: "Anspec", panel: "anspec" },
  { year: "2018", label: "Ideagen", panel: "ideagen-manager" },
  { year: "2012", label: "Senior systems", panel: "ideagen-admin" },
  { year: "2009", label: "W.T.A foundation", panel: "wta" },
];

const expertise = [
  { title: "Cybersecurity", text: "Essential Eight, NIST, SOCI awareness, AESCSF audit participation, KnowBe4 awareness, OT monitoring evaluation, and cyber governance.", category: "cybersecurity" },
  { title: "Cloud & Platform", text: "Azure, AWS, M365 E5, Intune, private cloud, Azure Data Factory, hybrid architecture, governance, and FinOps.", category: "cloud" },
  { title: "Infrastructure", text: "Cisco, Meraki, Aruba, VLANs, VPNs, SD-WAN, VMware, Hyper-V, monitoring, DR design, and enterprise support.", category: "infrastructure" },
  { title: "Energy OT", text: "SCADA/OT integration, network segmentation, solar site resilience, asset data streaming, Energy One, and renewable energy operations.", category: "it-ot" },
  { title: "Leadership", text: "Executive communication, vendor governance, budgeting, forecasting, contract management, team development, and roadmap delivery.", category: "delivery" },
];

const credentials = [
  "AWS Solutions Architect Associate",
  "AWS DevOps Associate",
  "AWS SysOps Associate",
  "CCNP Routing & Switching",
  "CCNP Security",
  "CompTIA Security+",
  "MCSE Server Infrastructure",
  "MCITP Server Administrator",
  "CompTIA Linux+",
  "PMP",
  "ITIL Foundation",
  "Salesforce Administrator",
  "In progress: CISSP",
  "In progress: OSCP",
  "In progress: AWS SA-Pro",
];

function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll(".reveal");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add("visible");
        });
      },
      { threshold: 0.16 },
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);
}

function matches(category: string, filter: string) {
  return filter === "all" || category.split(" ").includes(filter);
}

export function SiteRest() {
  useReveal();
  const [filter, setFilter] = useState("all");
  const [flipped, setFlipped] = useState<string | null>(null);
  const [panelKey, setPanelKey] = useState("banpu");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const pingHost = useRef<HTMLButtonElement>(null);
  const panel = panels[panelKey] ?? panels.banpu!;

  const handlePing = () => {
    const host = pingHost.current;
    if (!host) return;
    const ping = document.createElement("span");
    ping.className = "ping";
    host.appendChild(ping);
    window.setTimeout(() => ping.remove(), 700);
  };

  return (
    <main className="after-dive">
      <section className="ticker" aria-label="Career achievements">
        <div className="ticker-track">
          <span>Zero high severity security incidents for 4+ years</span>
          <span>95% of Year 1 IT/OT roadmap delivered</span>
          <span>90% onboarding and offboarding time saved</span>
          <span>30% cloud operations cost savings achieved</span>
          <span>Energy One private cloud maintained at 99.9% uptime</span>
          <span>Meraki SDN transformation</span>
          <span>AESCSF audit and SOCI-aware cyber uplift</span>
        </div>
      </section>

      <section className="world section-pad">
        <div className="section-intro reveal">
          <p className="eyebrow">Explore my world</p>
          <h2>Filter the signal.</h2>
          <p>Jump between the systems I build, secure, automate, and optimise.</p>
        </div>
        <div className="filter-bar reveal" role="group" aria-label="Filter expertise">
          {filters.map((f) => (
            <button
              key={f.id}
              type="button"
              className={filter === f.id ? "active" : undefined}
              onClick={() => setFilter(f.id)}
            >
              {f.label}
            </button>
          ))}
        </div>
      </section>

      <section className="projects section-pad" id="projects">
        <div className="section-intro reveal">
          <p className="eyebrow">Expedition logs</p>
          <h2>Missions that moved the business.</h2>
        </div>
        <div className="project-grid">
          {projects.map((project) => (
            <article
              key={project.id}
              className={`project-card ${project.className} reveal${flipped === project.id ? " is-flipped" : ""}${
                matches(project.category, filter) ? "" : " hidden"
              }`}
              tabIndex={0}
              onClick={() => setFlipped((cur) => (cur === project.id ? null : project.id))}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  setFlipped((cur) => (cur === project.id ? null : project.id));
                }
              }}
            >
              <div className="project-face project-front">
                <span>{project.number}</span>
                <h3>{project.title}</h3>
                <p>{project.summary}</p>
              </div>
              <div className="project-face project-back">
                <span>Mission brief</span>
                <h3>{project.briefTitle}</h3>
                <p>{project.brief}</p>
                <strong>{project.stack}</strong>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="timeline section-pad" id="experience">
        <div className="section-intro reveal">
          <p className="eyebrow">Career depth map</p>
          <h2>A journey of building resilient systems that scale.</h2>
        </div>
        <div className="timeline-line reveal">
          {timeline.map((node) => (
            <button
              key={node.panel}
              type="button"
              className={`timeline-node${panelKey === node.panel ? " active" : ""}`}
              onClick={() => setPanelKey(node.panel)}
            >
              <span>{node.year}</span>
              {node.label}
            </button>
          ))}
        </div>
        <div className="experience-panel reveal">
          <h3>{panel.title}</h3>
          <p>{panel.text}</p>
        </div>
      </section>

      <section className="expertise section-pad" id="credentials">
        <div className="section-intro reveal">
          <p className="eyebrow">Core expertise</p>
          <h2>Technical range with leadership discipline.</h2>
        </div>
        <div className="expertise-grid">
          {expertise.map((item) => (
            <article
              key={item.title}
              className={`reveal${matches(item.category, filter) ? "" : " hidden"}`}
            >
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </article>
          ))}
        </div>
        <div className="credential-drawer reveal">
          <button
            type="button"
            className="drawer-toggle"
            aria-expanded={drawerOpen}
            onClick={() => setDrawerOpen((open) => !open)}
          >
            {drawerOpen ? "Close certification drawer" : "Open certification drawer"}
          </button>
          <div className={`drawer-content${drawerOpen ? " open" : ""}`}>
            {credentials.map((label) => (
              <span key={label}>{label}</span>
            ))}
          </div>
        </div>
      </section>

      <section className="spearfishing section-pad" id="spearfishing">
        <div className="spearfishing-copy reveal">
          <p className="eyebrow">Spearfishing</p>
          <h2>Depth, patience, precision.</h2>
          <p>
            Spearfishing brings a personal layer to the site: calm under pressure, respect for conditions,
            and the discipline to read what is happening beneath the surface.
          </p>
          <button className="ripple-button" type="button" ref={pingHost} onClick={handlePing}>
            Send a sonar ping
          </button>
        </div>
        <div className="depth-card reveal">
          <span>23m</span>
          <p>Focus below the surface. Leadership above it.</p>
          <div className="sonar" aria-hidden="true" />
        </div>
      </section>

      <section className="contact section-pad" id="contact">
        <div className="section-intro reveal">
          <p className="eyebrow">Surface</p>
          <h2>Let&apos;s connect.</h2>
          <p>
            Open to senior IT leadership conversations across IT/OT transformation, cybersecurity, cloud
            architecture, infrastructure resilience, and AI-ready digital foundations.
          </p>
        </div>
        <div className="contact-actions reveal">
          <a href="https://www.linkedin.com/in/runtian-huang-58751455/" target="_blank" rel="noreferrer">
            LinkedIn
          </a>
          <a href="mailto:timllz83@gmail.com?subject=IT leadership conversation with Tim Huang">Email</a>
          <a href="cv.html">Online CV</a>
          <a href="assets/tim-huang-head-of-it-updated-cv.docx" download>
            Head of IT CV
          </a>
          <a href="assets/tim-huang-cio-cv.docx" download>
            CIO CV
          </a>
        </div>
      </section>
    </main>
  );
}
