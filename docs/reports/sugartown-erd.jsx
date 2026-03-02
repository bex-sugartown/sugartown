import { useState } from "react";

const PINK = "#ff247d";
const SEAFOAM = "#2bd4aa";
const LIME = "#D1FF1D";
const NAVY = "#0D1226";
const DARK = "#141828";
const MID = "#1e2540";
const LIGHT = "#2a3158";
const TEXT = "#e8eaf6";
const MUTED = "#7b82a8";

const schema = {
  atoms: [
    {
      id: "link",
      label: "link",
      kind: "object",
      color: SEAFOAM,
      fields: ["url (url)", "label (string)", "openInNewTab (bool)"],
    },
    {
      id: "richImage",
      label: "richImage",
      kind: "object",
      color: SEAFOAM,
      fields: ["asset (image)", "alt (string)", "caption (string)", "credit (string)"],
    },
    {
      id: "ctaButton",
      label: "ctaButton",
      kind: "object",
      color: SEAFOAM,
      fields: ["label (string)", "link → link", "style (select)", "icon (string)"],
    },
    {
      id: "seoMetadata",
      label: "seoMetadata",
      kind: "object",
      color: SEAFOAM,
      fields: ["title (string)", "description (text)", "canonicalUrl (url)", "noIndex (bool)", "ogImage → richImage"],
    },
    {
      id: "portableText",
      label: "portableTextConfig",
      kind: "object",
      color: SEAFOAM,
      fields: ["Summary config", "Standard config", "Minimal config"],
    },
  ],
  taxonomy: [
    {
      id: "category",
      label: "category",
      kind: "document",
      color: LIME,
      fields: ["title (string) *", "slug (slug) *", "description (text)", "colorHex (string)", "parent → category"],
    },
    {
      id: "tag",
      label: "tag",
      kind: "document",
      color: LIME,
      fields: ["title (string) *", "slug (slug) *", "description (text)"],
    },
    {
      id: "project",
      label: "project",
      kind: "document",
      color: LIME,
      fields: ["title (string) *", "slug (slug) *", "projectId (string)", "colorHex (string)", "description (text)"],
    },
  ],
  content: [
    {
      id: "node",
      label: "node ★",
      kind: "document",
      color: PINK,
      fields: [
        "title (string) *",
        "slug (slug) *",
        "publishedAt (datetime)",
        "status (select)",
        "aiTool (string)",
        "categories[] → category",
        "tags[] → tag",
        "projects[] → project",
        "authors[] → person",
        "body (portableText)",
        "seo → seoMetadata",
        "legacySource → legacySource",
      ],
    },
    {
      id: "article",
      label: "article",
      kind: "document",
      color: PINK,
      fields: [
        "title (string) *",
        "slug (slug) *",
        "publishedAt (datetime)",
        "status (select)",
        "categories[] → category",
        "tags[] → tag",
        "projects[] → project",
        "authors[] → person",
        "featuredImage → richImage",
        "excerpt (text)",
        "body (portableText)",
        "seo → seoMetadata",
        "legacySource → legacySource",
      ],
    },
    {
      id: "caseStudy",
      label: "caseStudy",
      kind: "document",
      color: PINK,
      fields: [
        "title (string) *",
        "slug (slug) *",
        "publishedAt (datetime)",
        "status (select)",
        "categories[] → category",
        "tags[] → tag",
        "projects[] → project",
        "authors[] → person",
        "featuredImage → richImage",
        "sections[] (hero|text|gallery|cta)",
        "seo → seoMetadata",
        "legacySource → legacySource",
      ],
    },
    {
      id: "page",
      label: "page",
      kind: "document",
      color: PINK,
      fields: [
        "title (string) *",
        "slug (slug) *",
        "sections[] (hero|text|gallery|cta)",
        "seo → seoMetadata",
        "legacySource → legacySource",
      ],
    },
  ],
  infra: [
    {
      id: "person",
      label: "person",
      kind: "document",
      color: "#9b6dff",
      fields: ["name (string) *", "slug (slug) *", "bio (portableText)", "image → richImage", "links[] → link"],
    },
    {
      id: "archivePage",
      label: "archivePage",
      kind: "document",
      color: "#9b6dff",
      fields: [
        "title (string) *",
        "slug (slug) *",
        "contentTypes[] (select)",
        "hero → hero",
        "filterConfig (object)",
        "listStyle (select)",
        "featuredItems[] → ref",
        "seo → seoMetadata",
      ],
    },
    {
      id: "navigation",
      label: "navigation",
      kind: "document",
      color: "#9b6dff",
      fields: ["title (string) *", "items[] (link|nested)"],
    },
    {
      id: "siteSettings",
      label: "siteSettings",
      kind: "document",
      color: "#9b6dff",
      fields: [
        "title (string) *",
        "description (text)",
        "defaultOgImage → richImage",
        "defaultMetaTitle (string)",
        "defaultMetaDescription (text)",
      ],
    },
    {
      id: "redirect",
      label: "redirect",
      kind: "document",
      color: "#9b6dff",
      fields: ["from (string) *", "to (string) *", "statusCode (301|302)", "note (text)"],
    },
  ],
};

const groups = [
  { key: "atoms", label: "⚛ Atomic Objects", items: schema.atoms },
  { key: "taxonomy", label: "🏷 Taxonomy", items: schema.taxonomy },
  { key: "content", label: "📄 Content Documents", items: schema.content },
  { key: "infra", label: "⚙ Infrastructure", items: schema.infra },
];

// Key relationships for the legend/description
const relationships = [
  { from: "node", to: "category", label: "categories[]", type: "many" },
  { from: "node", to: "tag", label: "tags[]", type: "many" },
  { from: "node", to: "project", label: "projects[]", type: "many" },
  { from: "node", to: "person", label: "authors[]", type: "many" },
  { from: "node", to: "seoMetadata", label: "seo", type: "one" },
  { from: "article", to: "category", label: "categories[]", type: "many" },
  { from: "article", to: "tag", label: "tags[]", type: "many" },
  { from: "article", to: "person", label: "authors[]", type: "many" },
  { from: "article", to: "seoMetadata", label: "seo", type: "one" },
  { from: "caseStudy", to: "category", label: "categories[]", type: "many" },
  { from: "caseStudy", to: "person", label: "authors[]", type: "many" },
  { from: "caseStudy", to: "seoMetadata", label: "seo", type: "one" },
  { from: "page", to: "seoMetadata", label: "seo", type: "one" },
  { from: "category", to: "category", label: "parent (self-ref)", type: "self" },
  { from: "ctaButton", to: "link", label: "link", type: "one" },
  { from: "seoMetadata", to: "richImage", label: "ogImage", type: "one" },
  { from: "person", to: "richImage", label: "image", type: "one" },
  { from: "person", to: "link", label: "links[]", type: "many" },
  { from: "siteSettings", to: "richImage", label: "defaultOgImage", type: "one" },
  { from: "archivePage", to: "seoMetadata", label: "seo", type: "one" },
];

export default function SugartownERD() {
  const [selected, setSelected] = useState(null);
  const [activeGroup, setActiveGroup] = useState("all");

  const selectedEntity =
    selected
      ? [...schema.atoms, ...schema.taxonomy, ...schema.content, ...schema.infra].find(
          (e) => e.id === selected
        )
      : null;

  const relatedIds = selected
    ? relationships
        .filter((r) => r.from === selected || r.to === selected)
        .flatMap((r) => [r.from, r.to])
        .filter((id) => id !== selected)
    : [];

  const selectedRelationships = selected
    ? relationships.filter((r) => r.from === selected || r.to === selected)
    : [];

  const allEntities = [...schema.atoms, ...schema.taxonomy, ...schema.content, ...schema.infra];

  function getGroupForId(id) {
    for (const g of groups) {
      if (g.items.find((e) => e.id === id)) return g.key;
    }
    return null;
  }

  const filteredGroups =
    activeGroup === "all"
      ? groups
      : groups.filter((g) => g.key === activeGroup);

  return (
    <div
      style={{
        background: DARK,
        minHeight: "100vh",
        fontFamily: "'IBM Plex Mono', 'Courier New', monospace",
        color: TEXT,
        padding: "0",
      }}
    >
      {/* Header */}
      <div
        style={{
          background: NAVY,
          borderBottom: `2px solid ${PINK}`,
          padding: "20px 28px 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ color: PINK, fontSize: 22, fontWeight: 700, letterSpacing: -1 }}>
              SUGARTOWN
            </span>
            <span style={{ color: MUTED, fontSize: 13 }}>/ CMS Schema ERD</span>
          </div>
          <div style={{ color: MUTED, fontSize: 11, marginTop: 3 }}>
            35 schema types · project: poalmzla · dataset: production
          </div>
        </div>
        {/* Legend */}
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          {[
            { color: SEAFOAM, label: "Atomic Object" },
            { color: LIME, label: "Taxonomy" },
            { color: PINK, label: "Content Doc" },
            { color: "#9b6dff", label: "Infrastructure" },
          ].map(({ color, label }) => (
            <div key={label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: 2,
                  background: color,
                  flexShrink: 0,
                }}
              />
              <span style={{ fontSize: 11, color: MUTED }}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", height: "calc(100vh - 74px)" }}>
        {/* Main canvas */}
        <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px" }}>
          {/* Group filter tabs */}
          <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
            {["all", ...groups.map((g) => g.key)].map((key) => {
              const label =
                key === "all"
                  ? "All Types"
                  : groups.find((g) => g.key === key)?.label || key;
              return (
                <button
                  key={key}
                  onClick={() => setActiveGroup(key)}
                  style={{
                    padding: "5px 14px",
                    borderRadius: 4,
                    border: `1px solid ${activeGroup === key ? PINK : LIGHT}`,
                    background: activeGroup === key ? PINK + "22" : "transparent",
                    color: activeGroup === key ? PINK : MUTED,
                    fontSize: 11,
                    cursor: "pointer",
                    fontFamily: "inherit",
                    letterSpacing: "0.05em",
                    textTransform: "uppercase",
                  }}
                >
                  {label}
                </button>
              );
            })}
          </div>

          {/* Groups */}
          {filteredGroups.map((group) => (
            <div key={group.key} style={{ marginBottom: 28 }}>
              <div
                style={{
                  fontSize: 11,
                  textTransform: "uppercase",
                  letterSpacing: "0.15em",
                  color: MUTED,
                  marginBottom: 10,
                  paddingBottom: 6,
                  borderBottom: `1px solid ${LIGHT}`,
                }}
              >
                {group.label}
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
                  gap: 10,
                }}
              >
                {group.items.map((entity) => {
                  const isSelected = selected === entity.id;
                  const isRelated = relatedIds.includes(entity.id);
                  const isDimmed = selected && !isSelected && !isRelated;

                  return (
                    <div
                      key={entity.id}
                      onClick={() => setSelected(isSelected ? null : entity.id)}
                      style={{
                        background: isSelected
                          ? entity.color + "20"
                          : isRelated
                          ? MID
                          : NAVY,
                        border: `1px solid ${
                          isSelected ? entity.color : isRelated ? entity.color + "66" : LIGHT
                        }`,
                        borderRadius: 6,
                        overflow: "hidden",
                        cursor: "pointer",
                        opacity: isDimmed ? 0.35 : 1,
                        transition: "all 0.15s ease",
                        boxShadow: isSelected
                          ? `0 0 0 1px ${entity.color}44, 0 4px 20px ${entity.color}22`
                          : "none",
                      }}
                    >
                      {/* Header */}
                      <div
                        style={{
                          background: entity.color + (isSelected ? "30" : "18"),
                          padding: "7px 12px",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          borderBottom: `1px solid ${entity.color}33`,
                        }}
                      >
                        <span
                          style={{
                            fontWeight: 700,
                            fontSize: 13,
                            color: entity.color,
                          }}
                        >
                          {entity.label}
                        </span>
                        <span
                          style={{
                            fontSize: 9,
                            color: entity.color + "99",
                            background: entity.color + "22",
                            padding: "2px 6px",
                            borderRadius: 3,
                            textTransform: "uppercase",
                            letterSpacing: "0.1em",
                          }}
                        >
                          {entity.kind}
                        </span>
                      </div>
                      {/* Fields */}
                      <div style={{ padding: "8px 12px" }}>
                        {entity.fields.map((field) => {
                          const isRef = field.includes("→");
                          return (
                            <div
                              key={field}
                              style={{
                                fontSize: 11,
                                color: isRef ? SEAFOAM + "cc" : MUTED,
                                padding: "2px 0",
                                borderBottom: `1px solid ${LIGHT}44`,
                                display: "flex",
                                alignItems: "center",
                                gap: 5,
                              }}
                            >
                              {isRef && (
                                <span style={{ color: SEAFOAM, fontSize: 10 }}>⇢</span>
                              )}
                              {field}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Sidebar — relationships panel */}
        <div
          style={{
            width: 280,
            borderLeft: `1px solid ${LIGHT}`,
            background: NAVY,
            overflowY: "auto",
            padding: "20px 16px",
            flexShrink: 0,
          }}
        >
          {selectedEntity ? (
            <>
              <div
                style={{
                  color: selectedEntity.color,
                  fontWeight: 700,
                  fontSize: 15,
                  marginBottom: 4,
                }}
              >
                {selectedEntity.label}
              </div>
              <div
                style={{
                  fontSize: 10,
                  color: MUTED,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  marginBottom: 16,
                }}
              >
                {selectedEntity.kind} · {getGroupForId(selectedEntity.id)}
              </div>

              {selectedRelationships.length > 0 && (
                <>
                  <div
                    style={{
                      fontSize: 10,
                      textTransform: "uppercase",
                      letterSpacing: "0.15em",
                      color: MUTED,
                      marginBottom: 8,
                    }}
                  >
                    Relationships
                  </div>
                  {selectedRelationships.map((r, i) => {
                    const isOutgoing = r.from === selectedEntity.id;
                    const otherId = isOutgoing ? r.to : r.from;
                    const other = allEntities.find((e) => e.id === otherId);
                    return (
                      <div
                        key={i}
                        onClick={() => setSelected(otherId)}
                        style={{
                          background: MID,
                          border: `1px solid ${LIGHT}`,
                          borderRadius: 5,
                          padding: "8px 10px",
                          marginBottom: 6,
                          cursor: "pointer",
                          transition: "border-color 0.1s",
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.borderColor = other?.color || PINK)
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.borderColor = LIGHT)
                        }
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                            marginBottom: 3,
                          }}
                        >
                          <span
                            style={{
                              fontSize: 13,
                              color: isOutgoing ? PINK : SEAFOAM,
                              lineHeight: 1,
                            }}
                          >
                            {isOutgoing ? "→" : "←"}
                          </span>
                          <span
                            style={{
                              fontSize: 12,
                              fontWeight: 600,
                              color: other?.color || TEXT,
                            }}
                          >
                            {otherId}
                          </span>
                          {r.type === "many" && (
                            <span
                              style={{
                                fontSize: 9,
                                color: MUTED,
                                background: LIGHT,
                                padding: "1px 5px",
                                borderRadius: 3,
                              }}
                            >
                              [many]
                            </span>
                          )}
                          {r.type === "self" && (
                            <span
                              style={{
                                fontSize: 9,
                                color: LIME + "aa",
                                background: LIGHT,
                                padding: "1px 5px",
                                borderRadius: 3,
                              }}
                            >
                              self-ref
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: 10, color: MUTED, paddingLeft: 19 }}>
                          {r.label}
                        </div>
                      </div>
                    );
                  })}
                </>
              )}

              <div
                style={{
                  fontSize: 10,
                  textTransform: "uppercase",
                  letterSpacing: "0.15em",
                  color: MUTED,
                  marginTop: 16,
                  marginBottom: 8,
                }}
              >
                All Fields
              </div>
              {selectedEntity.fields.map((f) => (
                <div
                  key={f}
                  style={{
                    fontSize: 11,
                    color: f.includes("→") ? SEAFOAM + "cc" : MUTED,
                    padding: "3px 0",
                    borderBottom: `1px solid ${LIGHT}44`,
                  }}
                >
                  {f.includes("→") ? "⇢ " : "  "}
                  {f}
                </div>
              ))}

              <button
                onClick={() => setSelected(null)}
                style={{
                  marginTop: 20,
                  width: "100%",
                  padding: "7px",
                  background: "transparent",
                  border: `1px solid ${LIGHT}`,
                  borderRadius: 4,
                  color: MUTED,
                  fontSize: 11,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                }}
              >
                Clear selection
              </button>
            </>
          ) : (
            <div>
              <div
                style={{
                  fontSize: 11,
                  color: MUTED,
                  lineHeight: 1.7,
                  marginBottom: 20,
                }}
              >
                Click any entity to explore its fields and relationships.
              </div>
              <div
                style={{
                  fontSize: 10,
                  textTransform: "uppercase",
                  letterSpacing: "0.15em",
                  color: MUTED,
                  marginBottom: 10,
                }}
              >
                Schema summary
              </div>
              {[
                { label: "Atomic Objects", count: schema.atoms.length, color: SEAFOAM },
                { label: "Taxonomy", count: schema.taxonomy.length, color: LIME },
                { label: "Content Docs", count: schema.content.length, color: PINK },
                { label: "Infrastructure", count: schema.infra.length, color: "#9b6dff" },
                {
                  label: "Relationships",
                  count: relationships.length,
                  color: MUTED,
                },
              ].map(({ label, count, color }) => (
                <div
                  key={label}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "6px 0",
                    borderBottom: `1px solid ${LIGHT}`,
                    fontSize: 12,
                  }}
                >
                  <span style={{ color: MUTED }}>{label}</span>
                  <span style={{ color, fontWeight: 700 }}>{count}</span>
                </div>
              ))}

              <div
                style={{
                  marginTop: 24,
                  fontSize: 10,
                  textTransform: "uppercase",
                  letterSpacing: "0.15em",
                  color: MUTED,
                  marginBottom: 8,
                }}
              >
                Relation types
              </div>
              {[
                { symbol: "→", color: PINK, label: "outgoing reference" },
                { symbol: "←", color: SEAFOAM, label: "incoming reference" },
                { symbol: "[many]", color: MUTED, label: "array of references" },
                { symbol: "self-ref", color: LIME + "aa", label: "self-referential" },
              ].map(({ symbol, color, label }) => (
                <div
                  key={symbol}
                  style={{
                    display: "flex",
                    gap: 8,
                    alignItems: "center",
                    padding: "4px 0",
                    fontSize: 11,
                  }}
                >
                  <span
                    style={{
                      color,
                      fontWeight: 700,
                      minWidth: 44,
                      fontSize: symbol.length > 2 ? 9 : 13,
                    }}
                  >
                    {symbol}
                  </span>
                  <span style={{ color: MUTED }}>{label}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
