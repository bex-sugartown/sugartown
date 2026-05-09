# GROQ Patterns Reference — Epic Writer

---

## Query File Location

All queries: `apps/web/src/lib/queries.js`

---

## The Four Slug Queries

Any new section type added to `sections[]` must be projected in ALL FOUR:

| Query name | Page type |
|-----------|-----------|
| `pageBySlugQuery` | Generic pages |
| `articleBySlugQuery` | Articles |
| `caseStudyBySlugQuery` | Case studies |
| `nodeBySlugQuery` | Knowledge graph nodes |

"I only need it on articles" is not a valid reason to skip the others. The section type
being absent from a query silently omits it — no error, no warning, no data.

---

## Section Projection Pattern

```groq
sections[] {
  _type,
  _key,
  // existing section types...
  _type == "myNewSection" => {
    field1,
    field2,
    "derivedField": field3.asset->url
  }
}
```

---

## Archive Query Rules

Archive queries (`allArticlesQuery`, `allCaseStudiesQuery`, etc.) project card-level
fields only. Add a field here **only if** the card display needs it.

Archive queries are independent of slug queries. A change to `articleBySlugQuery` does
not affect `allArticlesQuery`.

---

## Slug Query Smoke Test

After updating projections, verify with a real document that has the new section type:

```groq
*[_type == "article" && slug.current == "your-test-slug"][0] {
  sections[] {
    _type,
    // ... your new projection fields
  }
}
```

Run this in the Sanity Vision tool or against the API. Confirm the new fields appear.

---

## Reference Expansion Pattern

```groq
"author": author-> { name, slug },
"tags": tags[]-> { title, slug },
```

The `->` operator dereferences a Sanity reference. Use it when the document references
another document by `_ref` and you need fields from the referenced document.

---

## Conditional Projection (by doc type in same query)

When a query spans multiple document types:

```groq
_type == "article" => { articleSpecificField },
_type == "caseStudy" => { caseStudySpecificField },
```
