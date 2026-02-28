import { useState } from "react";
import syllabusData from "./syllabusData";

function Sidebar({ subject, setContent }) {
  const [activeTopic, setActiveTopic] = useState("");
  const [openModule, setOpenModule] = useState(null);

  if (!subject) return null;

  const modules = syllabusData[subject].modules;

  const handleClick = (topic) => {
    setActiveTopic(topic);
    setContent(topic);
  };

  return (
    <div className="sidebar">
      {Object.keys(modules).map((module) => (
        <div key={module}>
          <div
            className="module-title"
            onClick={() =>
              setOpenModule(openModule === module ? null : module)
            }
          >
            {module}
          </div>

          {openModule === module &&
            modules[module].map((topic) => (
              <div
                key={topic}
                className={`topic ${activeTopic === topic ? "active" : ""}`}
                onClick={() => handleClick(topic)}
              >
                {topic}
              </div>
            ))}
        </div>
      ))}
    </div>
  );
}

export default Sidebar;