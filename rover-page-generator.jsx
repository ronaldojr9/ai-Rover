import { useState, useRef, useCallback, useEffect } from "react";

const ROVER_SYSTEM_PROMPT = `You are the Rover ERP Web Page Generator. You create production-ready HTML pages that EXACTLY match the Rover ERP / Zumasys brand system.

## BRAND SYSTEM (MANDATORY)

### Colors
- Cerulean (Primary): #009bd8 / rgb(0, 155, 216)
- Tarawera (Dark): #0b3655 / rgb(11, 54, 85)
- Tarawera Deep: #072740
- Jaffa (Accent/CTA): #ec7834 / rgb(236, 120, 52)
- Manatee (Neutral): #838690 / rgb(131, 134, 144)
- Text Dark: #1a2a3a
- Text Body: #3d4f5f
- Text Muted: #6b7a8a
- Off-white Background: #f8f9fb
- Cerulean Light: #e6f5fc
- Cerulean Pale: #f0f9fd

### Typography
- Font: 'Barlow', sans-serif (Google Fonts import: https://fonts.googleapis.com/css2?family=Barlow:wght@300;400;500;600;700;800&display=swap)
- Headings: 700-800 weight, tight letter-spacing (-0.03em), Tarawera color
- Body: 400-500 weight, text-body or text-muted color
- Section tags: 0.75rem, 700 weight, uppercase, 0.12em letter-spacing, Jaffa color

### Design Patterns
- Nav: Fixed top, Tarawera Deep background with backdrop blur, Cerulean border accent
- Hero sections: Tarawera gradient backgrounds with subtle grid overlay and radial gradients
- Cards: White background, subtle border (rgba(131,134,144,0.12)), 16px border-radius, hover lift effect
- Buttons Primary: Jaffa background, white text, 8px border-radius, hover lift + shadow
- Buttons Secondary: Transparent with white/tarawera border
- Section spacing: 5-6rem padding
- Max content width: 1280px
- Stat cards: Semi-transparent on dark backgrounds
- Trust bars: Cerulean icon + muted text
- Grid overlay on dark sections: rgba(0,155,216,0.04) 1px lines at 60px intervals

### Voice & Tone
- Friendly & Professional: Approachable but credible, never corporate or robotic
- Authentic & Humble: Real experience, no buzzwords or tech hype
- Empowering: Focus on customer success
- Optimistic & Forward-Looking: Prepare clients for the future
- Community-Focused: Real businesses, real people
- Tagline: "Chaos to Clarity"

### Messaging Pillars
1. "Modernization without compromise" - Respect legacy systems
2. "Efficiency at your fingertips" - Clarity and speed
3. "One source of truth" - Real-time data accuracy
4. Built for manufacturers with 20-250 employees

### ICP (Ideal Customer Profile)
- Small-to-mid-sized manufacturers and distributors (20-250 employees)
- Often using legacy PICK/MultiValue systems
- Family-owned or owner-operated businesses
- Practical decision-makers who value ROI over flash

### Page Structure Patterns
Pages should follow this general structure:
1. Fixed nav with logo left, CTA button right
2. Hero section with headline, subtext, CTA buttons, and supporting visual/stats
3. Problem/pain point section (what challenges the audience faces)
4. Solution section (how Rover solves it, with numbered or card-based layout)
5. Results/metrics section (dark background with stat cards)
6. Social proof or day-in-the-life section
7. Final CTA section with trust badges
8. Footer with copyright and tagline

### Technical Requirements
- Fully responsive (mobile-first breakpoints at 768px and 1024px)
- Scroll-triggered reveal animations using IntersectionObserver
- Nav scroll shadow effect
- CSS custom properties for all brand colors
- Clean semantic HTML
- Self-contained single HTML file with inline CSS and JS
- Google Fonts Barlow import in head
- No external dependencies beyond Google Fonts

## OUTPUT FORMAT
Return ONLY the complete HTML document. No markdown, no code fences, no explanations. Start with <!DOCTYPE html> and end with </html>.`;

const PAGE_TEMPLATES = [
  {
    id: "landing",
    label: "Landing Page",
    desc: "Full marketing page with hero, features, social proof, CTA",
    icon: "◇",
  },
  {
    id: "industry",
    label: "Industry Page",
    desc: "Vertical-specific page with pain points, solutions, results",
    icon: "▣",
  },
  {
    id: "product",
    label: "Product / Feature",
    desc: "Product or module page with capabilities and benefits",
    icon: "◈",
  },
  {
    id: "event",
    label: "Event / Webinar",
    desc: "Event registration page with agenda, speakers, signup",
    icon: "◎",
  },
  {
    id: "comparison",
    label: "Comparison Page",
    desc: "Vs. competitor or before/after comparison layout",
    icon: "⊞",
  },
  {
    id: "custom",
    label: "Custom / Freeform",
    desc: "Describe exactly what you need—full creative control",
    icon: "✦",
  },
];

const EXAMPLE_PROMPTS = [
  "Create a landing page for Rover Pay, our integrated payment processing solution for manufacturers. Emphasize faster cash flow, fewer systems, and automatic reconciliation.",
  "Build an industry page for plastics injection molding companies. Focus on mold tracking, cycle time optimization, and material yield management.",
  "Create an event registration page for our upcoming 'AI for Manufacturers' webinar on March 15th. Include agenda, speaker bios placeholder, and registration form.",
  "Build a comparison page showing Rover ERP vs. legacy green-screen systems. Highlight modern UI, real-time data, mobile access, and AI capabilities.",
];

export default function RoverPageGenerator() {
  const [selectedTemplate, setSelectedTemplate] = useState("landing");
  const [userPrompt, setUserPrompt] = useState("");
  const [additionalInstructions, setAdditionalInstructions] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedHTML, setGeneratedHTML] = useState("");
  const [streamingHTML, setStreamingHTML] = useState("");
  const [error, setError] = useState("");
  const [activeView, setActiveView] = useState("editor");
  const [generationCount, setGenerationCount] = useState(0);
  const [showExamples, setShowExamples] = useState(false);
  const iframeRef = useRef(null);
  const abortRef = useRef(null);

  const updateIframe = useCallback((html) => {
    if (iframeRef.current && html) {
      const doc = iframeRef.current.contentDocument;
      if (doc) {
        doc.open();
        doc.write(html);
        doc.close();
      }
    }
  }, []);

  useEffect(() => {
    if (activeView === "preview" && generatedHTML) {
      setTimeout(() => updateIframe(generatedHTML), 100);
    }
  }, [activeView, generatedHTML, updateIframe]);

  const generatePage = async () => {
    if (!userPrompt.trim()) return;
    setIsGenerating(true);
    setError("");
    setStreamingHTML("");
    setGeneratedHTML("");
    setActiveView("preview");

    const templateInfo = PAGE_TEMPLATES.find((t) => t.id === selectedTemplate);
    const userMessage = `PAGE TYPE: ${templateInfo.label}

USER CONTENT & COPY:
${userPrompt}

${additionalInstructions ? `ADDITIONAL INSTRUCTIONS:\n${additionalInstructions}` : ""}

Generate the complete, production-ready HTML page now. Remember: output ONLY the HTML document, nothing else.`;

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 16000,
          stream: true,
          system: ROVER_SYSTEM_PROMPT,
          messages: [{ role: "user", content: userMessage }],
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error?.message || `API error: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6).trim();
            if (data === "[DONE]") continue;
            try {
              const parsed = JSON.parse(data);
              if (parsed.type === "content_block_delta" && parsed.delta?.text) {
                accumulated += parsed.delta.text;
                setStreamingHTML(accumulated);
              }
            } catch {}
          }
        }
      }

      // Clean up - extract just the HTML if there's any wrapper
      let finalHTML = accumulated.trim();
      const doctypeIdx = finalHTML.indexOf("<!DOCTYPE");
      const htmlEndIdx = finalHTML.lastIndexOf("</html>");
      if (doctypeIdx >= 0 && htmlEndIdx >= 0) {
        finalHTML = finalHTML.substring(doctypeIdx, htmlEndIdx + 7);
      }

      setGeneratedHTML(finalHTML);
      setStreamingHTML("");
      setGenerationCount((c) => c + 1);
      setTimeout(() => updateIframe(finalHTML), 150);
    } catch (err) {
      setError(err.message || "Generation failed. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadHTML = () => {
    if (!generatedHTML) return;
    const blob = new Blob([generatedHTML], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const slug = userPrompt.slice(0, 40).replace(/[^a-z0-9]+/gi, "-").toLowerCase();
    a.download = `rover-${slug || "page"}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyHTML = () => {
    if (!generatedHTML) return;
    navigator.clipboard.writeText(generatedHTML);
  };

  const displayHTML = generatedHTML || streamingHTML;

  return (
    <div style={{
      minHeight: "100vh",
      background: "#060e18",
      fontFamily: "'Barlow', sans-serif",
      color: "#c8d0d8",
    }}>
      <link href="https://fonts.googleapis.com/css2?family=Barlow:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />

      {/* Header */}
      <header style={{
        borderBottom: "1px solid rgba(0,155,216,0.12)",
        background: "rgba(7,39,64,0.6)",
        backdropFilter: "blur(20px)",
        position: "sticky",
        top: 0,
        zIndex: 50,
      }}>
        <div style={{
          maxWidth: 1400,
          margin: "0 auto",
          padding: "0 1.5rem",
          height: 64,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: "linear-gradient(135deg, #009bd8, #0b3655)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "0.85rem", fontWeight: 800, color: "#fff",
            }}>R</div>
            <div>
              <div style={{ fontSize: "0.95rem", fontWeight: 700, color: "#fff", lineHeight: 1.2 }}>
                Rover <span style={{ color: "#009bd8" }}>Page Generator</span>
              </div>
              <div style={{ fontSize: "0.65rem", color: "#838690", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                Brand-Consistent • AI-Powered
              </div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            {generationCount > 0 && (
              <span style={{ fontSize: "0.75rem", color: "#838690" }}>
                {generationCount} page{generationCount !== 1 ? "s" : ""} generated
              </span>
            )}
            {generatedHTML && (
              <>
                <button onClick={copyHTML} style={{
                  background: "rgba(0,155,216,0.1)",
                  border: "1px solid rgba(0,155,216,0.2)",
                  color: "#009bd8",
                  padding: "0.4rem 1rem",
                  borderRadius: 6,
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}>Copy HTML</button>
                <button onClick={downloadHTML} style={{
                  background: "#ec7834",
                  border: "none",
                  color: "#fff",
                  padding: "0.4rem 1rem",
                  borderRadius: 6,
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}>↓ Download</button>
              </>
            )}
          </div>
        </div>
      </header>

      <div style={{
        maxWidth: 1400,
        margin: "0 auto",
        padding: "1.5rem",
        display: "grid",
        gridTemplateColumns: activeView === "preview" && displayHTML ? "420px 1fr" : "1fr",
        gap: "1.5rem",
        minHeight: "calc(100vh - 64px)",
        transition: "grid-template-columns 0.3s",
      }}>
        {/* Editor Panel */}
        <div style={{
          display: "flex",
          flexDirection: "column",
          gap: "1.25rem",
          maxHeight: "calc(100vh - 100px)",
          overflowY: "auto",
          paddingRight: displayHTML ? "0.5rem" : 0,
        }}>
          {/* Template Selection */}
          <div>
            <label style={{
              display: "block",
              fontSize: "0.72rem",
              fontWeight: 700,
              color: "#ec7834",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              marginBottom: "0.6rem",
            }}>Page Type</label>
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "0.5rem",
            }}>
              {PAGE_TEMPLATES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setSelectedTemplate(t.id)}
                  style={{
                    background: selectedTemplate === t.id
                      ? "rgba(0,155,216,0.12)"
                      : "rgba(255,255,255,0.02)",
                    border: `1px solid ${selectedTemplate === t.id ? "rgba(0,155,216,0.35)" : "rgba(255,255,255,0.06)"}`,
                    borderRadius: 10,
                    padding: "0.7rem 0.6rem",
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "all 0.2s",
                    fontFamily: "inherit",
                  }}
                >
                  <div style={{
                    fontSize: "1.1rem",
                    marginBottom: "0.25rem",
                    opacity: selectedTemplate === t.id ? 1 : 0.5,
                  }}>{t.icon}</div>
                  <div style={{
                    fontSize: "0.78rem",
                    fontWeight: 700,
                    color: selectedTemplate === t.id ? "#009bd8" : "#c8d0d8",
                    marginBottom: "0.15rem",
                  }}>{t.label}</div>
                  <div style={{
                    fontSize: "0.65rem",
                    color: "#838690",
                    lineHeight: 1.4,
                  }}>{t.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Main Content Input */}
          <div>
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "0.5rem",
            }}>
              <label style={{
                fontSize: "0.72rem",
                fontWeight: 700,
                color: "#ec7834",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
              }}>Content & Copy</label>
              <button
                onClick={() => setShowExamples(!showExamples)}
                style={{
                  background: "none",
                  border: "none",
                  color: "#009bd8",
                  fontSize: "0.72rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >{showExamples ? "Hide" : "Show"} examples</button>
            </div>

            {showExamples && (
              <div style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.4rem",
                marginBottom: "0.6rem",
              }}>
                {EXAMPLE_PROMPTS.map((ex, i) => (
                  <button
                    key={i}
                    onClick={() => { setUserPrompt(ex); setShowExamples(false); }}
                    style={{
                      background: "rgba(0,155,216,0.05)",
                      border: "1px solid rgba(0,155,216,0.1)",
                      borderRadius: 8,
                      padding: "0.6rem 0.8rem",
                      textAlign: "left",
                      cursor: "pointer",
                      fontSize: "0.78rem",
                      color: "#c8d0d8",
                      lineHeight: 1.5,
                      fontFamily: "inherit",
                      transition: "all 0.2s",
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.borderColor = "rgba(0,155,216,0.3)";
                      e.target.style.background = "rgba(0,155,216,0.08)";
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.borderColor = "rgba(0,155,216,0.1)";
                      e.target.style.background = "rgba(0,155,216,0.05)";
                    }}
                  >{ex}</button>
                ))}
              </div>
            )}

            <textarea
              value={userPrompt}
              onChange={(e) => setUserPrompt(e.target.value)}
              placeholder="Describe the page you want to create. Include specific copy, headlines, feature descriptions, stats, testimonials — the more detail, the better the output.

Example: Create a landing page for our new Rover AI module. Headline: 'Ask Your ERP Anything.' Subtext about natural language queries across all modules. Features: inventory lookup, financial reporting, production insights, customer history. Include a demo CTA and trust badges."
              style={{
                width: "100%",
                minHeight: 180,
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 12,
                padding: "1rem",
                color: "#e0e4e8",
                fontSize: "0.88rem",
                lineHeight: 1.65,
                fontFamily: "inherit",
                resize: "vertical",
                outline: "none",
                transition: "border-color 0.2s",
              }}
              onFocus={(e) => e.target.style.borderColor = "rgba(0,155,216,0.3)"}
              onBlur={(e) => e.target.style.borderColor = "rgba(255,255,255,0.08)"}
            />
          </div>

          {/* Additional Instructions */}
          <div>
            <label style={{
              display: "block",
              fontSize: "0.72rem",
              fontWeight: 700,
              color: "#ec7834",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              marginBottom: "0.5rem",
            }}>Additional Instructions <span style={{ color: "#838690", fontWeight: 400, textTransform: "none" }}>(optional)</span></label>
            <textarea
              value={additionalInstructions}
              onChange={(e) => setAdditionalInstructions(e.target.value)}
              placeholder="Any special requests: specific sections to include, tone adjustments, layout preferences, specific CTAs, form fields, etc."
              style={{
                width: "100%",
                minHeight: 80,
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 12,
                padding: "1rem",
                color: "#e0e4e8",
                fontSize: "0.88rem",
                lineHeight: 1.65,
                fontFamily: "inherit",
                resize: "vertical",
                outline: "none",
                transition: "border-color 0.2s",
              }}
              onFocus={(e) => e.target.style.borderColor = "rgba(0,155,216,0.3)"}
              onBlur={(e) => e.target.style.borderColor = "rgba(255,255,255,0.08)"}
            />
          </div>

          {/* Generate Button */}
          <button
            onClick={generatePage}
            disabled={isGenerating || !userPrompt.trim()}
            style={{
              width: "100%",
              padding: "0.9rem",
              borderRadius: 10,
              border: "none",
              background: isGenerating
                ? "rgba(236,120,52,0.3)"
                : !userPrompt.trim()
                  ? "rgba(131,134,144,0.2)"
                  : "linear-gradient(135deg, #ec7834, #e0651e)",
              color: !userPrompt.trim() ? "#838690" : "#fff",
              fontSize: "0.95rem",
              fontWeight: 700,
              cursor: isGenerating || !userPrompt.trim() ? "not-allowed" : "pointer",
              fontFamily: "inherit",
              letterSpacing: "0.02em",
              transition: "all 0.3s",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {isGenerating ? (
              <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
                <span style={{
                  width: 16, height: 16, border: "2px solid rgba(255,255,255,0.3)",
                  borderTopColor: "#fff", borderRadius: "50%",
                  animation: "spin 0.8s linear infinite",
                  display: "inline-block",
                }} />
                Generating Page...
              </span>
            ) : generatedHTML ? "Regenerate Page →" : "Generate Page →"}
          </button>

          {error && (
            <div style={{
              background: "rgba(220,50,50,0.1)",
              border: "1px solid rgba(220,50,50,0.25)",
              borderRadius: 10,
              padding: "0.8rem 1rem",
              fontSize: "0.82rem",
              color: "#f08080",
              lineHeight: 1.5,
            }}>{error}</div>
          )}

          {/* Brand Reference */}
          <div style={{
            background: "rgba(0,155,216,0.04)",
            border: "1px solid rgba(0,155,216,0.08)",
            borderRadius: 12,
            padding: "1rem",
          }}>
            <div style={{
              fontSize: "0.68rem",
              fontWeight: 700,
              color: "#838690",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              marginBottom: "0.6rem",
            }}>Built-in Brand System</div>
            <div style={{ display: "flex", gap: "0.4rem", marginBottom: "0.6rem" }}>
              {["#009bd8", "#0b3655", "#ec7834", "#838690", "#072740"].map((c) => (
                <div key={c} style={{
                  width: 24, height: 24, borderRadius: 6,
                  background: c, border: "1px solid rgba(255,255,255,0.1)",
                }} title={c} />
              ))}
            </div>
            <div style={{ fontSize: "0.72rem", color: "#6b7a8a", lineHeight: 1.5 }}>
              Every page uses Barlow font, Rover color palette, responsive design, scroll animations, and manufacturing-focused messaging.
            </div>
          </div>
        </div>

        {/* Preview Panel */}
        {displayHTML && (
          <div style={{
            display: "flex",
            flexDirection: "column",
            borderRadius: 16,
            overflow: "hidden",
            border: "1px solid rgba(0,155,216,0.12)",
            background: "#0a1520",
          }}>
            {/* Preview Toolbar */}
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "0.5rem 1rem",
              background: "rgba(7,39,64,0.8)",
              borderBottom: "1px solid rgba(0,155,216,0.1)",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <div style={{ display: "flex", gap: "0.35rem" }}>
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#ff5f57" }} />
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#ffbd2e" }} />
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#28c840" }} />
                </div>
                <span style={{ fontSize: "0.72rem", color: "#838690", marginLeft: "0.5rem" }}>
                  {isGenerating ? "Generating..." : "Preview"}
                </span>
              </div>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button
                  onClick={() => setActiveView(activeView === "code" ? "preview" : "code")}
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    color: "#c8d0d8",
                    padding: "0.25rem 0.6rem",
                    borderRadius: 4,
                    fontSize: "0.7rem",
                    fontWeight: 600,
                    cursor: "pointer",
                    fontFamily: "inherit",
                  }}
                >{activeView === "code" ? "◉ Preview" : "</> Code"}</button>
              </div>
            </div>

            {/* Content Area */}
            <div style={{ flex: 1, position: "relative", minHeight: 0 }}>
              {activeView === "preview" ? (
                <iframe
                  ref={iframeRef}
                  style={{
                    width: "100%",
                    height: "calc(100vh - 160px)",
                    border: "none",
                    background: "#fff",
                  }}
                  title="Page Preview"
                  srcDoc={displayHTML}
                />
              ) : (
                <pre style={{
                  height: "calc(100vh - 160px)",
                  overflow: "auto",
                  padding: "1rem",
                  margin: 0,
                  fontSize: "0.72rem",
                  lineHeight: 1.6,
                  color: "#a0b0c0",
                  background: "#060e18",
                  fontFamily: "'Courier New', monospace",
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                }}>{displayHTML}</pre>
              )}

              {isGenerating && (
                <div style={{
                  position: "absolute",
                  bottom: 16,
                  left: "50%",
                  transform: "translateX(-50%)",
                  background: "rgba(7,39,64,0.9)",
                  backdropFilter: "blur(10px)",
                  border: "1px solid rgba(0,155,216,0.2)",
                  borderRadius: 100,
                  padding: "0.5rem 1.25rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  fontSize: "0.78rem",
                  color: "#009bd8",
                  fontWeight: 600,
                }}>
                  <span style={{
                    width: 12, height: 12,
                    border: "2px solid rgba(0,155,216,0.3)",
                    borderTopColor: "#009bd8",
                    borderRadius: "50%",
                    animation: "spin 0.8s linear infinite",
                    display: "inline-block",
                  }} />
                  Building your page...
                </div>
              )}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!displayHTML && (
          <div style={{
            display: "none",
          }} />
        )}
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        textarea::placeholder {
          color: #4a5568;
        }
        ::-webkit-scrollbar {
          width: 6px;
        }
        ::-webkit-scrollbar-track {
          background: transparent;
        }
        ::-webkit-scrollbar-thumb {
          background: rgba(0,155,216,0.2);
          border-radius: 3px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: rgba(0,155,216,0.35);
        }
      `}</style>
    </div>
  );
}
