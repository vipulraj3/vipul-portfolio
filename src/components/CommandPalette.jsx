
import { useEffect, useRef, useState } from "react";
import { PROFILE } from "../data/portfolioData";

const NAVIGATION = [
  { label: "Home", id: "home" },
  { label: "About Me", id: "about" },
  { label: "Technical Skills", id: "skills" },
  { label: "Projects", id: "projects" },
  { label: "SOQL Playground", id: "soql" },
  { label: "Experience", id: "experience" },
  { label: "Certifications", id: "certifications" },
  { label: "Contact", id: "contact" }
];

function downloadResume() {
  const link = document.createElement("a");
  link.href = PROFILE.resume;
  link.download = "Vipul_Raj_Resume.pdf";

  document.body.appendChild(link);
  link.click();
  link.remove();
}

export default function CommandPalette({
  open,
  onClose,
  onToggleTheme
}) {
  const dialogRef = useRef(null);
  const inputRef = useRef(null);

  const [search, setSearch] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) {
      dialog.showModal();
      setSearch("");
      setActiveIndex(0);
      inputRef.current?.focus();
    }

    if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  const actions = [
    ...NAVIGATION.map(item => ({
      label: `Go to ${item.label}`,
      category: "Navigation",
      icon: "↗",
      run: () => {
        window.location.hash = item.id;
      }
    })),
    {
      label: "Download Resume",
      category: "File",
      icon: "↓",
      run: downloadResume
    },
    {
      label: "Open GitHub Profile",
      category: "External Link",
      icon: "⌘",
      run: () => {
        window.open(
          PROFILE.github,
          "_blank",
          "noopener,noreferrer"
        );
      }
    },
    {
      label: "Open LinkedIn Profile",
      category: "External Link",
      icon: "↗",
      run: () => {
        window.open(
          PROFILE.linkedin,
          "_blank",
          "noopener,noreferrer"
        );
      }
    },
    {
      label: "Toggle Dark / Light Mode",
      category: "Appearance",
      icon: "◐",
      run: onToggleTheme
    }
  ];

  const filteredActions = actions.filter(action =>
    `${action.label} ${action.category}`
      .toLowerCase()
      .includes(search.trim().toLowerCase())
  );

  function executeCommand(action) {
    action.run();
    onClose();
  }

  function handleKeyDown(event) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex(index =>
        Math.min(index + 1, filteredActions.length - 1)
      );
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex(index => Math.max(0, index - 1));
    }

    if (event.key === "Enter") {
      event.preventDefault();

      const action = filteredActions[activeIndex];

      if (action) {
        executeCommand(action);
      }
    }
  }

  return (
    <dialog
      ref={dialogRef}
      className="command-dialog"
      aria-label="Portfolio command palette"
      onClose={onClose}
      onClick={event => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="command-search">
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-4-4" />
        </svg>

        <input
          ref={inputRef}
          type="text"
          value={search}
          placeholder="Search commands..."
          aria-label="Search commands"
          onChange={event => {
            setSearch(event.target.value);
            setActiveIndex(0);
          }}
          onKeyDown={handleKeyDown}
        />

        <button
          type="button"
          className="command-escape"
          onClick={onClose}
        >
          ESC
        </button>
      </div>

      <div className="command-results">
        <p className="command-section-title">
          AVAILABLE COMMANDS
        </p>

        {filteredActions.length === 0 ? (
          <p className="command-empty">
            No matching commands found.
          </p>
        ) : (
          <ul className="command-list">
            {filteredActions.map((action, index) => (
              <li key={action.label}>
                <button
                  type="button"
                  className={`command-item ${
                    activeIndex === index ? "active" : ""
                  }`}
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => executeCommand(action)}
                >
                  <span className="command-item-icon">
                    {action.icon}
                  </span>

                  <span className="command-item-label">
                    {action.label}
                  </span>

                  <span className="command-item-category">
                    {action.category}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="command-footer">
        <span>↑ ↓ Navigate</span>
        <span>↵ Select</span>
        <span>ESC Close</span>
      </div>
    </dialog>
  );
}
