import type { EditorApi } from "../editor";

type ToolboxProps = {
  editor: EditorApi | null;
};

export function Toolbox({ editor }: ToolboxProps) {
  return (
    <div
      style={{
        position: "absolute",
        top: 16,
        left: 16,
        background: "rgba(20, 20, 24, 0.85)",
        border: "1px solid rgba(255, 255, 255, 0.12)",
        borderRadius: 8,
        padding: 12,
        color: "#fff",
        display: "flex",
        gap: 8,
        alignItems: "center",
        fontFamily: "system-ui, -apple-system, Segoe UI, sans-serif",
        zIndex: 10,
      }}
      onPointerDown={(event) => event.stopPropagation()}
    >
      <span style={{ opacity: 0.8, fontSize: 12 }}>Toolbox</span>
      <button
        type="button"
        style={{
          background: "#4e58bf",
          border: "1px solid #3f47a0",
          color: "#fff",
          borderRadius: 6,
          padding: "6px 10px",
          cursor: editor ? "pointer" : "not-allowed",
          opacity: editor ? 1 : 0.5,
        }}
        onClick={() => editor?.addNode("A")}
        disabled={!editor}
      >
        Add A
      </button>
      <button
        type="button"
        style={{
          background: "#4e58bf",
          border: "1px solid #3f47a0",
          color: "#fff",
          borderRadius: 6,
          padding: "6px 10px",
          cursor: editor ? "pointer" : "not-allowed",
          opacity: editor ? 1 : 0.5,
        }}
        onClick={() => editor?.addNode("B")}
        disabled={!editor}
      >
        Add B
      </button>
      <button
        type="button"
        style={{
          background: "#2f8f6f",
          border: "1px solid #1d6f55",
          color: "#fff",
          borderRadius: 6,
          padding: "6px 10px",
          cursor: editor ? "pointer" : "not-allowed",
          opacity: editor ? 1 : 0.5,
        }}
        onClick={() => editor?.addNode("Indicator")}
        disabled={!editor}
      >
        Indicator
      </button>
      <button
        type="button"
        style={{
          background: "#a97a2b",
          border: "1px solid #835e1f",
          color: "#fff",
          borderRadius: 6,
          padding: "6px 10px",
          cursor: editor ? "pointer" : "not-allowed",
          opacity: editor ? 1 : 0.5,
        }}
        onClick={() => editor?.addNode("Condition")}
        disabled={!editor}
      >
        Condition
      </button>
      <button
        type="button"
        style={{
          background: "#a23b3b",
          border: "1px solid #7f2c2c",
          color: "#fff",
          borderRadius: 6,
          padding: "6px 10px",
          cursor: editor ? "pointer" : "not-allowed",
          opacity: editor ? 1 : 0.5,
        }}
        onClick={() => editor?.addNode("Order")}
        disabled={!editor}
      >
        Order
      </button>
    </div>
  );
}
