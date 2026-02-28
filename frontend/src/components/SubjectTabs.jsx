import syllabusData from "./syllabusData";

function SubjectTabs({ setSubject }) {
  return (
    <div style={{ display: "flex", gap: "20px", padding: "15px", background: "#222", color: "white" }}>
      {Object.keys(syllabusData).map((key) => (
        <h3
          key={key}
          style={{ cursor: "pointer" }}
          onClick={() => setSubject(key)}
        >
          {syllabusData[key].title}
        </h3>
      ))}
    </div>
  );
}

export default SubjectTabs;