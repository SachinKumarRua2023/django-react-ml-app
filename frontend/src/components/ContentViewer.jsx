function ContentViewer({ content }) {
  return (
    <div style={{ flex: 1, padding: "30px" }}>
      <h2>{content}</h2>
      <p>
        Detailed explanation about {content} will be shown here.
        You can later enhance this with markdown rendering.
      </p>
    </div>
  );
}

export default ContentViewer;