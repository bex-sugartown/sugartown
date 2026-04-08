# EPIC — Contact Form

**Epic ID:** EPIC-0179
**Linear Issue:** SUG-10
**Surface:** `apps/web`
**Priority:** 🟣 Soon
**Created:** 2026-03-15
**Depends on:** DNS cutover to Netlify (form submissions require Netlify hosting to be active)

---

## Objective

Add a working contact form to the `/contact` page so visitors can send a message to `bex@sugartown.io` directly from the site. The form collects name, email, and message body. On submit, the visitor receives an inline success or error message — no page navigation, no redirect to a third-party "thank you" URL.

After this epic: (1) a contact form renders on the `/contact` page with three fields (name, email, message) and a send button; (2) submissions are delivered to `bex@sugartown.io`; (3) the form shows inline success/error feedback without a page reload; (4) basic client-side validation prevents empty or malformed submissions.

**Data layer:** No schema changes required for the MVP. Optional: a `contactFormSection` schema type for the section builder (allows editors to place the form on any page, not just `/contact`).
**Query layer:** No changes for MVP. Optional: GROQ projection for `contactFormSection` if schema route is chosen.
**Render layer:** New `ContactForm` component with fields, validation, submission handler, and inline feedback states.

---

## Context

### Current `/contact` page

- Route: `/:slug` → `RootPage.jsx` → fetches Sanity `page` document with `slug: "contact"`
- Renders via `PageSections` — currently uses text sections and CTA buttons
- No form component, no form handling, no submission endpoint
- No form libraries installed (`react-hook-form`, `formik`, etc.)

### Netlify hosting

The site is deploying to Netlify (hosting decision made 2026-03-15). Netlify Forms is the simplest submission backend:
- Zero server-side code — forms are detected at deploy time via `data-netlify="true"` attribute
- Submissions stored in Netlify dashboard + email notifications configurable to `bex@sugartown.io`
- Free tier: 100 submissions/month (sufficient for a portfolio site)
- Spam protection: built-in honeypot field + optional reCAPTCHA
- Works with SPA/React via the `fetch()` POST pattern (not native HTML form submit)

### Alternative backends (evaluate if Netlify Forms is insufficient)

- **Formspree** — hosted form endpoint, free tier 50 submissions/month
- **Resend** — email API, requires serverless function (Netlify Function) to call
- **EmailJS** — client-side email sending via browser SDK, no server needed but exposes service credentials in client JS

---

## Scope (draft — refine at activation)

### ContactForm component
- [ ] Create `apps/web/src/components/ContactForm.jsx`
- [ ] Three fields:
  - **Name** — `<input type="text" name="name" required />`
  - **Email** — `<input type="email" name="email" required />`
  - **Message** — `<textarea name="message" required />`
- [ ] Submit button: "Send Message" (or configurable label)
- [ ] Honeypot field for spam protection (hidden `<input name="bot-field">`)

### Client-side validation
- [ ] All fields required — prevent empty submissions
- [ ] Email format validation (HTML5 `type="email"` + optional regex)
- [ ] Disable submit button during submission (prevent double-submit)
- [ ] Inline error messages per field (not just browser-native validation bubbles)

### Form submission (Netlify Forms)
- [ ] Submit via `fetch()` POST to the page URL with `Content-Type: application/x-www-form-urlencoded`
- [ ] Include hidden `form-name` field (required for Netlify Forms with SPA)
- [ ] Handle response: success (200) → show success message; error → show error message
- [ ] Netlify Forms SPA pattern:
  ```jsx
  // Hidden HTML form for Netlify's deploy-time detection
  // (Netlify's bot parses static HTML at deploy, not runtime React)
  <form name="contact" data-netlify="true" netlify-honeypot="bot-field" hidden>
    <input type="text" name="name" />
    <input type="email" name="email" />
    <textarea name="message"></textarea>
  </form>
  ```
  This static form goes in `apps/web/index.html` or the component's render output. The actual React form submits via `fetch()`.

### Inline feedback states
- [ ] **Idle** — form visible, submit button enabled
- [ ] **Submitting** — button shows loading indicator (text change or spinner), fields disabled
- [ ] **Success** — form replaced with success message: "Thanks! Your message has been sent." (or similar)
- [ ] **Error** — error message shown below the form: "Something went wrong. Please try again." with a retry option
- [ ] Success/error messages are inline — no page navigation, no alert(), no toast

### Styling
- [ ] CSS module: `apps/web/src/components/ContactForm.module.css`
- [ ] Use existing design tokens: `--st-color-text-primary`, `--st-color-bg-canvas`, `--st-color-brand-primary`, `--st-font-family-ui`
- [ ] Form inputs styled consistently with the site aesthetic (dark/light theme aware)
- [ ] Responsive: single-column layout, full-width inputs on mobile
- [ ] Focus states on inputs using `--st-color-brand-primary`
- [ ] Error state styling: `--st-color-error` or a red/warning token

### Integration with `/contact` page
- [ ] **Option A (simpler):** Hardcode `<ContactForm />` in `RootPage.jsx` when slug is `"contact"` — renders after the page sections
- [ ] **Option B (section builder):** Create a `contactFormSection` schema type in Studio so editors can place the form via the section builder on any page. Requires schema + GROQ projection + PageSections case. More flexible but more scope.
- [ ] Decide at activation. Option A is recommended for MVP; Option B can follow.

### Netlify configuration
- [ ] Configure email notification in Netlify dashboard: new submission → email to `bex@sugartown.io`
- [ ] This is a manual dashboard step, not code — document in the epic's delivery notes

---

## Non-Goals

- Does **not** implement a full form builder (multiple form types, conditional fields, file uploads)
- Does **not** store submissions in Sanity — Netlify dashboard is the submission store
- Does **not** add reCAPTCHA — honeypot spam protection is sufficient for a portfolio site's volume
- Does **not** send email directly from the browser (no EmailJS, no exposed credentials)
- Does **not** add a serverless function — Netlify Forms handles submission without custom backend code
- Does **not** implement auto-reply to the sender — only notification to `bex@sugartown.io`

---

## Technical Constraints

- **Netlify Forms SPA requirement:** Netlify's deploy bot only detects forms in static HTML. For React SPAs, a hidden static form must exist in `index.html` (or be rendered as a hidden element) with matching `name` and field `name` attributes. The React form submits via `fetch()` to the same URL.
- **`application/x-www-form-urlencoded` encoding:** Netlify Forms expects URL-encoded POST bodies, not JSON. The `fetch()` call must encode fields accordingly:
  ```js
  const encode = (data) =>
    Object.keys(data)
      .map(key => encodeURIComponent(key) + '=' + encodeURIComponent(data[key]))
      .join('&')

  fetch('/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: encode({ 'form-name': 'contact', name, email, message }),
  })
  ```
- **Theme awareness:** Form inputs must work in both dark and light themes. Use `var()` tokens for backgrounds, borders, and text colours — not hardcoded hex values.
- **Accessibility:** All inputs must have associated `<label>` elements (not just placeholders). Error messages must be announced to screen readers (use `role="alert"` or `aria-live="polite"`).
- **No form library for MVP:** Three fields don't justify a form state library. Use React `useState` for field values and submission state. If a future form is more complex, evaluate `react-hook-form` then.

---

## Files to Create/Modify (estimated)

**Create:**
- `apps/web/src/components/ContactForm.jsx` — form component
- `apps/web/src/components/ContactForm.module.css` — form styles

**Modify:**
- `apps/web/index.html` — add hidden static form for Netlify detection (or render in component)
- `apps/web/src/pages/RootPage.jsx` — render `<ContactForm />` on contact page (Option A)
  OR
- `apps/studio/schemas/sections/contactFormSection.ts` — CREATE (Option B)
- `apps/studio/schemas/index.ts` — register section type (Option B)
- `apps/web/src/lib/queries.js` — GROQ projection (Option B)
- `apps/web/src/components/PageSections.jsx` — new case (Option B)

---

## Doc Type Coverage (Option B only)

| Doc Type | In scope? | Reason |
|----------|-----------|--------|
| `page` | Yes | Contact is a `page` type; form section would be available on all pages |
| `article` | No | Articles don't need embedded contact forms |
| `caseStudy` | No | Same |
| `node` | No | Same |
| `archivePage` | No | Archive pages are listings, not content pages |

---

## Risks / Edge Cases

- **Netlify Forms not active until deploy:** Forms only work after the site is deployed to Netlify with the static HTML form detected. Local development cannot test actual submissions. Consider a development-mode mock that logs to console instead of submitting.
- **Spam volume:** Honeypot fields catch most bots, but a popular page could still receive spam. Monitor after launch; add reCAPTCHA if needed.
- **Email delivery:** Netlify sends notification emails via their own mail infrastructure. Verify `bex@sugartown.io` receives test submissions after deployment. Check spam filters.
- **100 submission/month limit:** Netlify's free tier caps at 100 form submissions/month. For a portfolio site this is likely sufficient. If exceeded, upgrade to Pro ($19/month) or switch to Formspree/Resend.
- **SPA routing after submission:** Ensure the form doesn't navigate away from `/contact` on submit. The `fetch()` pattern prevents this, but verify no Netlify redirect interferes (the SPA fallback `/* /index.html 200` should be fine).

---

## Acceptance Criteria (draft)

- [ ] `/contact` page renders a visible contact form with Name, Email, and Message fields
- [ ] All fields are required — submitting with empty fields shows inline validation errors
- [ ] Email field rejects malformed addresses
- [ ] Submitting a valid form shows an inline success message without page navigation
- [ ] If submission fails (network error, Netlify down), an inline error message is shown with retry option
- [ ] Submit button is disabled during submission to prevent double-submit
- [ ] Form works in both dark and light themes — inputs are legible and styled consistently
- [ ] Form is accessible: labels associated with inputs, error messages announced to screen readers
- [ ] Honeypot field is hidden from visual users but present in the form for spam protection
- [ ] After deployment to Netlify: submitting the form delivers an email notification to `bex@sugartown.io`
- [ ] Mobile: form renders single-column, full-width inputs, touch-friendly hit targets

---

## Trigger for Activation

Activate this epic when:
- DNS cutover to Netlify is complete (forms require Netlify hosting)
- The `/contact` page is the next priority for polish
- Or immediately after Netlify deploy is live, as a quick win

---

*Created 2026-03-15. Depends on Netlify hosting (decided 2026-03-15, cutover pending).*
