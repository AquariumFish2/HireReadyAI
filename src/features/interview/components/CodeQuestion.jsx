import { useEffect, useRef, useState } from "react";

const PLACEHOLDER = {
  javascript: "// Write your JavaScript solution here\n\n",
  python: "# Write your Python solution here\n\n",
  java: "// Write your Java solution here\n\n",
  typescript: "// Write your TypeScript solution here\n\n",
  cpp: "// Write your C++ solution here\n\n",
  sql: "-- Write your SQL query here\n\n",
  default: "// Write your solution here\n\n",
};

const LANG_COLORS = {
  javascript: "#f7df1e",
  python: "#3776ab",
  java: "#ed8b00",
  typescript: "#3178c6",
  cpp: "#00599c",
  sql: "#e38c00",
  default: "#94a3b8",
};

export default function CodeQuestion({ question, onAnswer }) {
  const lang = question?.language?.toLowerCase() ?? "default";
  const placeholder = PLACEHOLDER[lang] ?? PLACEHOLDER.default;
  const langColor = LANG_COLORS[lang] ?? LANG_COLORS.default;

  const [code, setCode] = useState(placeholder);
  const textareaRef = useRef(null);
  const lineNumRef = useRef(null);

  // Sync line number gutter scroll with textarea scroll
  useEffect(() => {
    const ta = textareaRef.current;
    const ln = lineNumRef.current;
    if (!ta || !ln) return;
    const onScroll = () => { ln.scrollTop = ta.scrollTop; };
    ta.addEventListener("scroll", onScroll);
    return () => ta.removeEventListener("scroll", onScroll);
  }, []);

  // Tab key → insert 2 spaces instead of leaving field
  const handleKeyDown = (e) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const { selectionStart, selectionEnd } = e.target;
      const newCode = code.slice(0, selectionStart) + "  " + code.slice(selectionEnd);
      setCode(newCode);
      // Restore cursor position after state update
      requestAnimationFrame(() => {
        const ta = textareaRef.current;
        if (ta) {
          ta.selectionStart = selectionStart + 2;
          ta.selectionEnd = selectionStart + 2;
        }
      });
    }
  };

  const lines = code.split("\n");
  const isEmpty = code.trim() === "" || code.trim() === placeholder.trim();

  const handleSubmit = () => {
    if (isEmpty) return;
    onAnswer(code.trim());
  };

  return (
    <div className="space-y-3">
      {/* Editor chrome */}
      <div className="rounded-xl overflow-hidden border border-[#30363d] bg-[#0d1117]">
        {/* Header bar */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-[#161b22] border-b border-[#30363d]">
          <div className="flex items-center gap-3">
            {/* Traffic lights */}
            <div className="flex gap-1.5">
              <span className="size-3 rounded-full bg-[#ff5f57]" />
              <span className="size-3 rounded-full bg-[#febc2e]" />
              <span className="size-3 rounded-full bg-[#28c840]" />
            </div>
            <span className="text-xs font-mono" style={{ color: langColor }}>
              {lang === "default" ? "code" : lang}
            </span>
          </div>
          <span className="text-[11px] text-[#484f58]">Tab = 2 spaces</span>
        </div>

        {/* Code area */}
        <div className="flex" style={{ height: "280px", overflow: "hidden" }}>
          {/* Line numbers */}
          <div
            ref={lineNumRef}
            className="flex-none px-3 pt-3 pb-3 overflow-hidden select-none text-right"
            style={{
              width: "42px",
              background: "#0d1117",
              borderRight: "1px solid #21262d",
              fontFamily: "'JetBrains Mono', 'Fira Code', 'Consolas', monospace",
              fontSize: "13px",
              lineHeight: "21px",
              color: "#484f58",
            }}
          >
            {lines.map((_, i) => (
              <div key={i}>{i + 1}</div>
            ))}
          </div>

          {/* Textarea */}
          <textarea
            ref={textareaRef}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            onKeyDown={handleKeyDown}
            spellCheck={false}
            className="flex-1 resize-none focus:outline-none py-3 pl-4 pr-3"
            style={{
              background: "#0d1117",
              color: "#e6edf3",
              fontFamily: "'JetBrains Mono', 'Fira Code', 'Consolas', monospace",
              fontSize: "13px",
              lineHeight: "21px",
              caretColor: "#58a6ff",
              overflowY: "auto",
            }}
          />
        </div>

        {/* Footer bar */}
        <div className="flex items-center justify-between px-4 py-2 bg-[#161b22] border-t border-[#30363d]">
          <span className="text-[11px]" style={{ color: "#484f58", fontFamily: "monospace" }}>
            Ln {lines.length} · {code.length} chars
          </span>
          <span className="text-[11px]" style={{ color: "#484f58" }}>UTF-8</span>
        </div>
      </div>

      {/* Submit */}
      <div className="flex justify-end">
        <button
          onClick={handleSubmit}
          disabled={isEmpty}
          className="bg-primary text-primary-foreground rounded-lg px-4 py-2.5 text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Submit Answer →
        </button>
      </div>
    </div>
  );
}
