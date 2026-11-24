
import { useEffect, useState } from "react";
import {PROFILE, SKILLS, PROJECTS, CERTIFICATIONS, EXPERIENCE} from "./data/portfolioData";
import "./App.css";
import CommandPalette from "./components/CommandPalette";


const TECH_STACK = [
  "Salesforce",
  "Apex",
  "Lightning Web Components",
  "SOQL / SOSL",
  "Flows",
  "JavaScript",
  "React",
  "REST APIs",
  "Java",
  "Git & GitHub"
];


const INITIAL_QUERY = "SELECT Name, Level__c FROM Skill__c WHERE Level__c > 70 ORDER BY Level__c DESC LIMIT 5";

const EXAMPLE_QUERIES = [
  
  INITIAL_QUERY,
  "SELECT Name, Status__c FROM Project__c WHERE Type__c = 'Salesforce'",
  "SELECT Name, Stack__c FROM Project__c WHERE Stack__c LIKE '%Apex%'",
  "SELECT Name, Status__c FROM Certification__c"
];

const EXAMPLE_LABELS = [
  "Top Salesforce Skills",
  "Salesforce Projects",
  "Projects Using Apex",
  "Certifications"
];


const OBJECTS = {
  skill__c: SKILLS,
  project__c: PROJECTS,
  certification__c: CERTIFICATIONS
};

// Browser-only SOQL-style query simulator.
// This does not connect to an actual Salesforce org.



function executeQuery(rawQuery) {
  try {
    const query = rawQuery.trim().replace(/;$/, "");

    const pattern =
      /^SELECT\s+(.+?)\s+FROM\s+(\w+)(?:\s+WHERE\s+(.+?))?(?:\s+ORDER\s+BY\s+(\w+)(?:\s+(ASC|DESC))?)?(?:\s+LIMIT\s+(\d+))?$/i;

    const match = query.match(pattern);

    if (!match) {
      throw new Error(
        "MALFORMED_QUERY: Use SELECT fields FROM Object [WHERE ...] [ORDER BY ...] [LIMIT n]"
      );
    }

    const [
      ,
      selectedFields,
      objectName,
      whereClause,
      orderField,
      orderDirection,
      limitValue
    ] = match;

    const records = OBJECTS[objectName.toLowerCase()];

    if (!records) {
      throw new Error(
        `INVALID_TYPE: Unsupported object '${objectName}'. Try Skill__c, Project__c, or Certification__c.`
      );
    }

    if (selectedFields.trim() === "*") {
      throw new Error(
        "MALFORMED_QUERY: SELECT * is not supported in SOQL."
      );
    }

    const availableFields = Object.keys(records[0] || {});

    function findField(name) {
      const field = availableFields.find(
        key => key.toLowerCase() === name.toLowerCase()
      );

      if (!field) {
        throw new Error(
          `INVALID_FIELD: No such field '${name}' on ${objectName}.`
        );
      }

      return field;
    }

    const fields = selectedFields
      .split(",")
      .map(field => findField(field.trim()));

    let rows = [...records];

    if (whereClause) {
      const conditions = whereClause.split(/\s+AND\s+/i);

      for (const condition of conditions) {
        const parsed = condition.trim().match(
          /^(\w+)\s*(>=|<=|!=|=|>|<|LIKE)\s*(?:'([^']*)'|(-?\d+(?:\.\d+)?))$/i
        );

        if (!parsed) {
          throw new Error(
            `MALFORMED_QUERY: Invalid condition '${condition}'.`
          );
        }

        const [, fieldName, operator, stringValue, numericValue] =
          parsed;

        const field = findField(fieldName);
        const comparisonValue =
          stringValue !== undefined
            ? stringValue
            : Number(numericValue);

        rows = rows.filter(record => {
          const currentValue = record[field];

          if (operator.toUpperCase() === "LIKE") {
            const pattern = String(comparisonValue)
              .replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
              .replace(/%/g, ".*")
              .replace(/_/g, ".");

            return new RegExp(`^${pattern}$`, "i").test(
              String(currentValue)
            );
          }

          if (operator === "=") {
            return (
              String(currentValue).toLowerCase() ===
              String(comparisonValue).toLowerCase()
            );
          }

          if (operator === "!=") {
            return (
              String(currentValue).toLowerCase() !==
              String(comparisonValue).toLowerCase()
            );
          }

          if (operator === ">") return currentValue > comparisonValue;
          if (operator === "<") return currentValue < comparisonValue;
          if (operator === ">=") return currentValue >= comparisonValue;
          if (operator === "<=") return currentValue <= comparisonValue;

          return false;
        });
      }
    }

    if (orderField) {
      const field = findField(orderField);
      const multiplier =
        orderDirection?.toUpperCase() === "DESC" ? -1 : 1;

      rows.sort((a, b) => {
        if (a[field] > b[field]) return multiplier;
        if (a[field] < b[field]) return -multiplier;
        return 0;
      });
    }

    if (limitValue !== undefined) {
      rows = rows.slice(0, Number(limitValue));
    }

    return {
      fields,
      rows,
      count: rows.length,
      error: null
    };
  } catch (error) {
    return {
      fields: [],
      rows: [],
      count: 0,
      error: error.message
    };
  }
}

function SectionTitle({ label, title, description }) {
  return (
    <div className="section-heading">
      <span className="section-eyebrow">{label}</span>
      <h2>{title}</h2>
      {description && <p>{description}</p>}
    </div>
  );
}


function ProjectCard({ project }) {
  const isFeatured = Boolean(project.featured);

  const technologies = project.Stack__c
    .split(",")
    .map(tech => tech.trim())
    .filter(Boolean);

  const highlights = project.Highlights || [];

  function handlePointerMove(event) {
    if (event.pointerType !== "mouse") return;

    const rect = event.currentTarget.getBoundingClientRect();

    event.currentTarget.style.setProperty(
      "--pointer-x",
      `${event.clientX - rect.left}px`
    );

    event.currentTarget.style.setProperty(
      "--pointer-y",
      `${event.clientY - rect.top}px`
    );
  }

  return (
    <article
      className={`project-card bento-project ${
        isFeatured ? "bento-featured" : ""
      }`}
      onPointerMove={handlePointerMove}
    >
      <div className="bento-card-main">

        {/* PROJECT HEADER */}
        <div className="bento-card-header">
          <span className="bento-card-type">
            <svg
              width="17"
              height="17"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              {project.Type__c === "Salesforce" ? (
                <path d="M7 18h10a4 4 0 0 0 .4-8A6 6 0 0 0 6 8a5 5 0 0 0 1 10Z" />
              ) : (
                <>
                  <rect x="3" y="4" width="18" height="16" rx="2" />
                  <path d="m9 9-3 3 3 3m6-6 3 3-3 3" />
                </>
              )}
            </svg>

            {project.Type__c === "Salesforce"
              ? "Salesforce CRM"
              : "Full-Stack Application"}
          </span>

          <span className="bento-card-status">
            <span className="bento-status-dot" />
            {project.Status__c}
          </span>
        </div>

        {/* FEATURED LABEL */}
        {isFeatured && (
          <span className="bento-featured-label">
            FEATURED END-TO-END PROJECT
          </span>
        )}

        {/* PROJECT CONTENT */}
        <h3 className="bento-project-title">
          {project.Name}
        </h3>

        <p className="bento-project-description">
          {project.Description__c}
        </p>

        {/* TECHNOLOGIES */}
        <div className="bento-tech-stack">
          {technologies.map(tech => (
            <span className="bento-tech" key={tech}>
              {tech}
            </span>
          ))}
        </div>

        {/* EXPANDABLE PROJECT DETAILS */}
        {highlights.length > 0 && (
          <details className="bento-details">
            <summary>
              Explore Implementation
              <span className="details-plus" aria-hidden="true">
                +
              </span>
            </summary>

            <ul>
              {highlights.map(highlight => (
                <li key={highlight}>{highlight}</li>
              ))}
            </ul>
          </details>
        )}

        {/* PROJECT LINKS */}
        {(project.Github__c || project.Live__c) && (
          <div className="bento-project-actions">
            {project.Github__c && (
              <a
                href={project.Github__c}
                target="_blank"
                rel="noopener noreferrer"
              >
                GitHub Repository ↗
              </a>
            )}

            {project.Live__c && (
              <a
                href={project.Live__c}
                target="_blank"
                rel="noopener noreferrer"
              >
                Live Demo ↗
              </a>
            )}
          </div>
        )}
      </div>

      {/* FEATURED PROJECT ARCHITECTURE */}
      {isFeatured && (
        <div className="bento-architecture">
          <span className="bento-architecture-label">
            SOLUTION ARCHITECTURE
          </span>

          <h4>Real Estate CRM</h4>

          <p className="architecture-description">
            How the core modules work together.
          </p>

          <div className="architecture-flow">
            {[
              {
                number: "01",
                title: "Data Architecture",
                detail: "Sales Office, Sales Region & Property"
              },
              {
                number: "02",
                title: "Commission Automation",
                detail: "Apex Triggers & Business Logic"
              },
              {
                number: "03",
                title: "Manager Approval",
                detail: "Flows & Commission Processing"
              },
              {
                number: "04",
                title: "User Experience",
                detail: "LWC Dashboard & Record Security"
              }
            ].map(item => (
              <div
                className="architecture-step"
                key={item.number}
              >
                <div className="architecture-number">
                  {item.number}
                </div>

                <div className="architecture-step-content">
                  <strong>{item.title}</strong>
                  <span>{item.detail}</span>
                </div>

                <span
                  className="architecture-check"
                  aria-hidden="true"
                >
                  ✓
                </span>
              </div>
            ))}
          </div>

          <p className="architecture-footer">
            Salesforce Admin + Custom Development
          </p>
        </div>
      )}
    </article>
  );
}


function App() {
  const [theme, setTheme] = useState(() => {
    try {
      const saved = localStorage.getItem("portfolio-theme");

      if (saved === "dark" || saved === "light") {
        return saved;
      }
    } catch {
      // Browser storage is optional.
    }

    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  });

  const [menuOpen, setMenuOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [typedRole, setTypedRole] = useState("");
  const [projectFilter, setProjectFilter] = useState("All");
  const [scrollProgress, setScrollProgress] = useState(0);
  const [query, setQuery] = useState(INITIAL_QUERY);
  const [queryResult, setQueryResult] = useState(() =>
    executeQuery(INITIAL_QUERY)
  );


/* STEP 6 — SCROLL REVEAL ANIMATIONS */

useEffect(() => {
  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  if (
    reduceMotion ||
    !("IntersectionObserver" in window)
  ) {
    return;
  }

  const selectors = [
    ".section-heading",
    ".about-copy",
    ".fact-card",
    ".skill-group",
    ".playground",
    ".timeline-card",
    ".cert-card",
    ".contact-info",
    ".contact-form"
  ];

  const elements = document.querySelectorAll(
    selectors.join(", ")
  );

  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.08,
      rootMargin: "0px 0px -20px 0px"
    }
  );

  elements.forEach(element => {
    element.classList.add("scroll-reveal");
    observer.observe(element);
  });

  return () => {
    observer.disconnect();

    elements.forEach(element => {
      element.classList.remove(
        "scroll-reveal",
        "is-visible"
      );
    });
  };
}, []);

useEffect(() => {
  function handleCommandShortcut(event) {
    if (
      (event.metaKey || event.ctrlKey) &&
      event.key.toLowerCase() === "k"
    ) {
      event.preventDefault();

      setPaletteOpen(current => !current);
    }
  }

  window.addEventListener(
    "keydown",
    handleCommandShortcut
  );

  return () => {
    window.removeEventListener(
      "keydown",
      handleCommandShortcut
    );
  };
}, []);


  useEffect(() => {
    document.documentElement.dataset.theme = theme;

    try {
      localStorage.setItem("portfolio-theme", theme);
    } catch {
      // The theme still works without storage.
    }
  }, [theme]);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setTypedRole(PROFILE.roles[0]);
      return;
    }

    let roleIndex = 0;
    let characterIndex = 0;
    let deleting = false;
    let timer;

    function typeNext() {
      const role = PROFILE.roles[roleIndex];

      setTypedRole(role.slice(0, characterIndex));

      let delay = deleting ? 45 : 85;

      if (!deleting && characterIndex === role.length) {
        deleting = true;
        delay = 1400;
      } else if (deleting && characterIndex === 0) {
        deleting = false;
        roleIndex = (roleIndex + 1) % PROFILE.roles.length;
        delay = 350;
      } else {
        characterIndex += deleting ? -1 : 1;
      }

      timer = window.setTimeout(typeNext, delay);
    }

    typeNext();

    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    function handleScroll() {
      const documentHeight =
        document.documentElement.scrollHeight -
        window.innerHeight;

      const percentage =
        documentHeight > 0
          ? (window.scrollY / documentHeight) * 100
          : 0;

      setScrollProgress(percentage);
    }

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);

    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, []);

  const visibleProjects = PROJECTS.filter(
    project =>
      projectFilter === "All" ||
      project.Type__c === projectFilter
  );

  const skillCategories = [...new Set(SKILLS.map(
    skill => skill.Category__c
  ))];

  function runQuery(value = query) {
    setQueryResult(executeQuery(value));
  }

  function submitContact(event) {
    event.preventDefault();

    const form = new FormData(event.currentTarget);

    const name = String(form.get("name") || "").trim();
    const email = String(form.get("email") || "").trim();
    const message = String(form.get("message") || "").trim();

    const subject = encodeURIComponent(
      `Portfolio Inquiry from ${name}`
    );

    const body = encodeURIComponent(
      `Name: ${name}\nEmail: ${email}\n\n${message}`
    );

    window.location.href =
      `mailto:${PROFILE.email}?subject=${subject}&body=${body}`;
  }

  return (
    <div className="site-shell">
      <div
        className="reading-progress"
        style={{ width: `${scrollProgress}%` }}
      />

      <div className="ambient ambient-one" aria-hidden="true" />
      <div className="ambient ambient-two" aria-hidden="true" />

      
<header className="site-header">
  <div className="nav-inner">

    {/* LOGO */}
    <a
      href="#home"
      className="brand"
      onClick={() => setMenuOpen(false)}
    >
      <span>VR<span className="brand-dot">.</span></span>
    </a>

    {/* NAVIGATION LINKS */}
    <nav
      id="main-navigation"
      className={`nav-links ${menuOpen ? "is-open" : ""}`}
      aria-label="Main navigation"
    >
      {[
        ["Home", "home"],
        ["About", "about"],
        ["Skills", "skills"],
        ["Projects", "projects"],
        ["SOQL", "soql"],
        ["Experience", "experience"],
        ["Contact", "contact"]
      ].map(([name, id]) => (
        <a
          key={id}
          href={`#${id}`}
          onClick={() => setMenuOpen(false)}
        >
          {name}
        </a>
      ))}
    </nav>

    {/* ACTION BUTTONS */}
    <div className="header-actions">

      {/* DARK / LIGHT MODE */}

{/* COMMAND PALETTE BUTTON */}
<button
  type="button"
  className="command-trigger"
  onClick={() => setPaletteOpen(true)}
  aria-label="Open command palette"
  title="Search commands"
>
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    aria-hidden="true"
  >
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-4-4" />
  </svg>

  <span className="command-shortcut">
    ⌘ K
  </span>
</button>


      {/* MOBILE MENU */}
      <button
        className="icon-button menu-toggle"
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label={
          menuOpen ? "Close navigation" : "Open navigation"
        }
        aria-expanded={menuOpen}
        aria-controls="main-navigation"
      >
        {menuOpen ? (
          <svg
            width="19"
            height="19"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            aria-hidden="true"
          >
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        ) : (
          <svg
            width="19"
            height="19"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            aria-hidden="true"
          >
            <path d="M4 7h16M4 12h16M4 17h16" />
          </svg>
        )}
      </button>

    </div>
  </div>
</header>


      <main>
        {/* HERO */}
        
{/* HERO SECTION */}
<section className="hero container" id="home">
  <div className="hero-copy">

    <div className="hero-availability">
      <span className="hero-availability-dot" />
      Open to Salesforce Developer Opportunities
    </div>

    <p className="hero-eyebrow">
      SALESFORCE CERTIFIED ADMINISTRATOR
    </p>

    <h1 className="hero-heading">
      Building smarter
      <br />
      <span>Salesforce solutions.</span>
    </h1>

    <div className="hero-role">
      <span>I'm {PROFILE.name} — </span>
      <span className="hero-role-animated">
        {typedRole}
        <span className="typing-caret">|</span>
      </span>
    </div>

    <p className="hero-description">
      {PROFILE.tagline} I combine Salesforce configuration,
      custom development, and automation to solve real-world
      business problems.
    </p>

    <div className="hero-buttons">
      <a href="#projects" className="button button-primary">
        View My Projects
        <span aria-hidden="true">↗</span>
      </a>

      <a
        href={PROFILE.resume}
        className="button button-secondary"
        download
      >
        Download Resume
        <span aria-hidden="true">↓</span>
      </a>
    </div>

    <div className="hero-socials">
      <a
        href={PROFILE.github}
        target="_blank"
        rel="noopener noreferrer"
      >
        GitHub ↗
      </a>

      <a
        href={PROFILE.linkedin}
        target="_blank"
        rel="noopener noreferrer"
      >
        LinkedIn ↗
      </a>

      <a href="#contact">
        Contact Me ↗
      </a>
    </div>

    <div className="hero-credentials">
      <div className="hero-credential">
        <span className="credential-symbol">✓</span>
        <div>
          <strong>Salesforce Administrator</strong>
          <small>Certified April 2026</small>
        </div>
      </div>

      <div className="hero-credential">
        <span className="credential-symbol">⌘</span>
        <div>
          <strong>End-to-End CRM Development</strong>
          <small>Apex · LWC · Flows</small>
        </div>
      </div>
    </div>
  </div>

  {/* FEATURED PROJECT SHOWCASE */}
  <div className="hero-showcase">
    <div className="showcase-window">

      <div className="showcase-toolbar">
        <div className="showcase-dots">
          <span />
          <span />
          <span />
        </div>

        <span>Salesforce Project Workspace</span>

        <div className="showcase-toolbar-icon">
          <svg
            viewBox="0 0 24 24"
            width="20"
            height="20"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M7 18h10a4 4 0 0 0 .4-8A6 6 0 0 0 6 8a5 5 0 0 0 1 10Z" />
          </svg>
        </div>
      </div>

      <div className="showcase-content">
        <div className="showcase-topline">
          <span>FEATURED APPLICATION</span>

          <div className="showcase-status">
            <span />
            Completed
          </div>
        </div>

        <h3>{PROJECTS[0].Name}</h3>

        <p className="showcase-subtitle">
          End-to-End Salesforce CRM Application
        </p>

        <div className="showcase-divider" />

        <p className="showcase-label">
          APPLICATION ARCHITECTURE
        </p>

        <div className="showcase-flow">
          <div className="showcase-flow-item">
            <div className="flow-number">01</div>
            <div>
              <strong>Data Architecture</strong>
              <small>Custom Objects & Relationships</small>
            </div>
            <span className="flow-check">✓</span>
          </div>

          <div className="showcase-flow-item">
            <div className="flow-number">02</div>
            <div>
              <strong>Commission Automation</strong>
              <small>Apex Triggers & Business Logic</small>
            </div>
            <span className="flow-check">✓</span>
          </div>

          <div className="showcase-flow-item">
            <div className="flow-number">03</div>
            <div>
              <strong>Manager Approvals</strong>
              <small>Salesforce Flows & Validation</small>
            </div>
            <span className="flow-check">✓</span>
          </div>

          <div className="showcase-flow-item">
            <div className="flow-number">04</div>
            <div>
              <strong>Lightning Dashboard</strong>
              <small>LWC & Apex Integration</small>
            </div>
            <span className="flow-check">✓</span>
          </div>
        </div>

        <div className="showcase-footer">
          <div>
            <span className="showcase-footer-dot" />
            Salesforce CRM
          </div>
          <span>Admin + Development</span>
        </div>
      </div>
    </div>

    <div className="showcase-floating-label">
      <span className="floating-label-icon">✓</span>
      <div>
        <strong>Project Completed</strong>
        <small>Real Estate Agency</small>
      </div>
    </div>
  </div>
</section>

{/* ANIMATED TECHNOLOGY MARQUEE */}
<div className="tech-marquee" aria-hidden="true">
  <div className="tech-marquee-track">
    {[0, 1].map(group => (
      <div className="tech-marquee-group" key={group}>
        {TECH_STACK.map(tech => (
          <span className="tech-marquee-item" key={tech}>
            <span className="tech-marquee-diamond">◆</span>
            {tech}
          </span>
        ))}
      </div>
    ))}
  </div>
</div>


        {/* ABOUT */}
        <section className="section container" id="about">
          <SectionTitle
            label="01 / INTRODUCTION"
            title="About Me"
            description="A developer who enjoys solving business problems with technology."
          />

          <div className="about-layout">
            <div className="about-copy glass-card">
              <span className="mini-label">WHO I AM</span>
              <h3>Beyond configuration. Into engineering.</h3>
              <p>{PROFILE.about}</p>
              <p>
                My work combines Salesforce platform configuration,
                business automation, and custom application development.
                I'm especially interested in designing solutions that
                are maintainable and valuable to end users.
              </p>
              <a href="#contact" className="text-link">
                Let's connect ↗
              </a>
            </div>

            <div className="about-facts">
              <div className="fact-card glass-card">
                <span className="fact-icon">🎓</span>
                <strong>B.Tech in Computer Science</strong>
                <p>D.Y. Patil College of Engineering and Technology</p>
              </div>

              <div className="fact-card glass-card">
                <span className="fact-icon">☁</span>
                <strong>Salesforce Certified Administrator</strong>
                <p>Certified April 2026</p>
              </div>

              <div className="fact-card glass-card">
                <span className="fact-icon">⌘</span>
                <strong>Salesforce Development</strong>
                <p>Apex, LWC, SOQL, Flows, Security & Automation</p>
              </div>
            </div>
          </div>
        </section>

        {/* SKILLS */}
        <section className="section container" id="skills">
          <SectionTitle
            label="02 / EXPERTISE"
            title="Technical Skills"
            description="Technologies and platform capabilities I have worked with."
          />

          <div className="skills-grid">
            {skillCategories.map(category => {
              const categorySkills = SKILLS.filter(
                skill => skill.Category__c === category
              );

              return (
                <div className="skill-group glass-card" key={category}>
                  <div className="skill-group-heading">
                    <span>
                      {category === "Salesforce"
                        ? "☁"
                        : category === "Programming"
                          ? "{ }"
                          : category === "Web"
                            ? "⌘"
                            : "⚙"}
                    </span>
                    <h3>{category}</h3>
                  </div>

                  <div className="skill-list">
                    {categorySkills.map(skill => (
                      <span className="skill-pill" key={skill.Name}>
                        <span className="skill-dot" />
                        {skill.Name}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* PROJECTS */}
        <section className="section container" id="projects">
          <SectionTitle
            label="03 / SELECTED WORK"
            title="Featured Projects"
            description="Projects demonstrating Salesforce development and full-stack engineering."
          />

          <div className="project-filters">
            {["All", "Salesforce", "Web"].map(filter => (
              <button
                key={filter}
                className={`filter-button ${
                  projectFilter === filter ? "active" : ""
                }`}
                onClick={() => setProjectFilter(filter)}
              >
                {filter}
              </button>
            ))}
          </div>

          <div className="projects-grid">
            {visibleProjects.map(project => (
              <ProjectCard key={project.Name} project={project} />
            ))}
          </div>
        </section>

        {/* SOQL PLAYGROUND */}
        <section className="section container" id="soql">
          <SectionTitle
            label="04 / INTERACTIVE DEMO"
            title="SOQL Playground"
            description="Explore my portfolio data using a simplified SOQL-style query engine."
          />

          <div className="playground">
            <div className="playground-header">
              <div className="console-title">
                <span className="console-indicator" />
                Portfolio Query Console
              </div>
              <span className="console-badge">SIMULATED ORG</span>
            </div>

            <div className="playground-body">
              <p className="playground-description">
                Query sample records from{" "}
                <code>Skill__c</code>,{" "}
                <code>Project__c</code>, and{" "}
                <code>Certification__c</code>.
              </p>

             
{/* AVAILABLE SOQL OBJECTS */}
<details className="soql-schema">
  <summary>
    <span>Explore Available Objects & Fields</span>
    <span aria-hidden="true">+</span>
  </summary>

  <div className="soql-schema-grid">
    <div className="soql-schema-card">
      <strong>Skill__c</strong>
      <p>Available fields</p>
      <code>Name</code>
      <code>Category__c</code>
      <code>Level__c</code>
    </div>

    <div className="soql-schema-card">
      <strong>Project__c</strong>
      <p>Available fields</p>
      <code>Name</code>
      <code>Type__c</code>
      <code>Status__c</code>
      <code>Stack__c</code>
      <code>Description__c</code>
    </div>

    <div className="soql-schema-card">
      <strong>Certification__c</strong>
      <p>Available fields</p>
      <code>Name</code>
      <code>Status__c</code>
      <code>Year__c</code>
    </div>
  </div>
</details>


              <label className="query-label" htmlFor="soql-query">
                SOQL Query
              </label>

              <textarea
                id="soql-query"
                className="query-input"
                value={query}
                onChange={event => setQuery(event.target.value)}
                onKeyDown={event => {
                  if (
                    (event.metaKey || event.ctrlKey) &&
                    event.key === "Enter"
                  ) {
                    runQuery();
                  }
                }}
                spellCheck="false"
                rows="4"
              />

              
<div className="query-toolbar">
  <div className="soql-toolbar-actions">

    {/* EXECUTE QUERY */}
    <button
      type="button"
      className="button button-primary"
      onClick={() => runQuery()}
    >
      ▶ Run Query
    </button>

    {/* RESET QUERY */}
    <button
      type="button"
      className="soql-reset-button"
      onClick={() => {
        setQuery(INITIAL_QUERY);
        runQuery(INITIAL_QUERY);
      }}
    >
      Reset Query
    </button>

  </div>

  <span>⌘ / Ctrl + Enter</span>
</div>


              <div
  className="query-results"
  aria-live="polite"
  aria-atomic="false"
>
                <div className="query-results-heading">
                  <strong>Query Results</strong>
                  {!queryResult.error && (
                    <span>{queryResult.count} records</span>
                  )}
                </div>

                {queryResult.error ? (
                  <p className="query-error" role="alert">
                    ⚠ {queryResult.error}
                  </p>
                ) : queryResult.rows.length === 0 ? (
                  <p className="query-empty">
                    No matching records found.
                  </p>
                ) : (
                  <div className="table-scroll">
                    <table>
                      <thead>
                        <tr>
                          {queryResult.fields.map(field => (
                            <th key={field}>{field}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {queryResult.rows.map((record, index) => (
                          <tr key={index}>
                            {queryResult.fields.map(field => (
                              <td key={field}>
                                {String(record[field] ?? "")}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              <p className="playground-disclaimer">
                This is a browser-based learning demonstration using
                local JavaScript data. It does not connect to
                Salesforce or support the full SOQL language.
                Skill level numbers are illustrative sample values.
              </p>
            </div>
          </div>
        </section>

        {/* EXPERIENCE */}
        <section className="section container" id="experience">
          <SectionTitle
            label="05 / PROFESSIONAL JOURNEY"
            title="Experience"
            description="Technical training, software engineering, and AI evaluation experience."
          />

          <div className="timeline">
            {EXPERIENCE.map(item => (
              <div className="timeline-item" key={`${item.company}-${item.role}`}>
                <span className="timeline-marker" />
                <div className="timeline-card glass-card">
                  <div className="timeline-top">
                    <h3>{item.role}</h3>
                    <span>{item.period}</span>
                  </div>
                  <strong>{item.company}</strong>
                  <p>{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CERTIFICATIONS */}
        <section className="section container" id="certifications">
          <SectionTitle
            label="06 / CREDENTIALS"
            title="Certifications"
            description="My Salesforce certification and ongoing professional learning."
          />

          <div className="cert-grid">
            {CERTIFICATIONS.map(cert => (
              <div className="cert-card glass-card" key={cert.Name}>
                <span className="cert-symbol">☁</span>

                <span
                  className={`cert-status ${
                    cert.Status__c === "Certified"
                      ? "certified"
                      : "preparing"
                  }`}
                >
                  {cert.Status__c}
                </span>

                <h3>{cert.Name}</h3>
                <p>{cert.Description}</p>
                <small>{cert.Year__c}</small>
              </div>
            ))}
          </div>
        </section>

        {/* CONTACT */}
        <section className="section container" id="contact">
          <SectionTitle
            label="07 / GET IN TOUCH"
            title="Let's Connect"
            description="Interested in collaborating or discussing a Salesforce Developer opportunity?"
          />

          <div className="contact-grid">
            <div className="contact-info glass-card">
              <span className="mini-label">CONTACT INFORMATION</span>
              <h3>Let's build something meaningful.</h3>
              <p>
                I'm interested in opportunities involving Salesforce
                development, CRM automation, and software engineering.
              </p>

              <a href={`mailto:${PROFILE.email}`}>
                ✉ {PROFILE.email}
              </a>

              <a
                href={PROFILE.linkedin}
                target="_blank"
                rel="noopener noreferrer"
              >
                in LinkedIn Profile ↗
              </a>

              <a
                href={PROFILE.github}
                target="_blank"
                rel="noopener noreferrer"
              >
                ⌘ GitHub Profile ↗
              </a>

              <span className="location">
                📍 {PROFILE.location}
              </span>
            </div>

            <form className="contact-form glass-card" onSubmit={submitContact}>
              <label>
                Your Name
                <input
                  name="name"
                  placeholder="Enter your name"
                  required
                />
              </label>

              <label>
                Email Address
                <input
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  required
                />
              </label>

              <label>
                Your Message
                <textarea
                  name="message"
                  rows="5"
                  placeholder="Tell me about the opportunity..."
                  required
                />
              </label>

              <button type="submit" className="button button-primary">
                Open Email App ↗
              </button>

              <p className="form-note">
                This prepares an email in your default email
                application. It does not send messages directly.
              </p>
            </form>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="container footer-inner">
          <a className="footer-brand" href="#home">
            PortFolio<span>.</span>
          </a>

          <p>
            © {new Date().getFullYear()} Vipul Raj.
            Built with React and inspired by Salesforce Lightning.
          </p>

          <a href="#home">Back to top ↑</a>
        </div>
      
      </footer>

      {/* COMMAND PALETTE */}
      <CommandPalette
        open={paletteOpen}
        onClose={() => setPaletteOpen(false)}
        onToggleTheme={() =>
          setTheme(current =>
            current === "light" ? "dark" : "light"
          )
        }
      />

    </div>
  );
}

export default App;
