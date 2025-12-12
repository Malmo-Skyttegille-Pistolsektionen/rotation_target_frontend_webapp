# GitHub Issues Template for Shoelace Migration

This file contains templates for creating the Epic and sub-issues in GitHub.

---

## Epic Issue

**Title:** [Epic] Mobile-First UI Migration to Shoelace

**Labels:** `enhancement`, `epic`, `mobile`

**Body:**

```markdown
# Mobile-First UI Migration to Shoelace

Migrate the rotation_target_frontend_webapp to a mobile-first design using Shoelace Web Components. The current application has zero mobile responsiveness (no media queries, fixed widths), which is critical since primary usage will be on mobile devices.

## Critical Finding

🚨 Current CSS has **ZERO media queries** in 2,033 lines - not responsive for mobile devices.

## Why Shoelace?

- ✅ Lightweight (50KB vs 500KB for PatternFly React)
- ✅ Mobile-first with touch optimization (44x44px tap targets)
- ✅ Works with existing vanilla JavaScript (no React rewrite)
- ✅ Excellent accessibility (WCAG 2.1 AA)
- ✅ Gradual migration possible

## Implementation Phases

- [ ] **Phase 0:** Preparation & Foundation (3-4 days) - #TBD
- [ ] **Phase 1:** Run Tab (4-5 days) - #TBD
- [ ] **Phase 2:** Audios Tab (3-4 days) - #TBD
- [ ] **Phase 3:** Programs Tab (6-8 days) ⚠️ Most Complex - #TBD
- [ ] **Phase 4:** Settings Tab (2-3 days) - #TBD
- [ ] **Phase 5:** Testing & Polish (5-7 days) - #TBD

**Total Duration:** 5-6 weeks (23-31 days)

## Documentation

- [Executive Summary](../blob/main/docs/EXECUTIVE-SUMMARY.md)
- [Full Investigation Report](../blob/main/docs/ui-framework-investigation.md)
- [Migration Epic (Detailed Plan)](../blob/main/docs/shoelace-migration-epic.md)
- [PatternFly MCP Assessment](../blob/main/docs/patternfly-mcp-assessment.md)

## Pre-Migration Assessment

✅ **No blocking issues** - Can proceed immediately

**Compatible issues:**
- #30, #29, #23 - Can be implemented after migration
- #7 (Multi-View Editor) - Will be enhanced by mobile-first design

See [shoelace-migration-epic.md](../blob/main/docs/shoelace-migration-epic.md) for complete details.

## Success Criteria

- ✅ All features work on mobile (320px+), tablet (768px+), desktop (1024px+)
- ✅ No regressions in existing functionality
- ✅ Load time <3s on 3G
- ✅ Lighthouse Accessibility score ≥95
- ✅ All touch targets ≥44x44px
```

---

## Sub-Issue 1: Phase 0

**Title:** Shoelace Setup and Responsive Foundation

**Labels:** `enhancement`, `mobile`, `phase-0`

**Body:**

```markdown
Part of Epic: #TBD (replace with epic number)

## Description

Install Shoelace and create the responsive foundation for mobile-first design, including navigation system and base styles.

## Tasks

- [ ] Install Shoelace via npm (`@shoelace-style/shoelace`)
- [ ] Import Shoelace CSS and set base path in `main.js`
- [ ] Create responsive navigation system:
  - [ ] Bottom navigation bar for mobile (< 768px)
  - [ ] Horizontal tabs for desktop (≥ 768px)
  - [ ] Implement `<sl-drawer>` for mobile menu
  - [ ] Keep existing tab switching logic, update selectors
- [ ] Add base responsive CSS:
  - [ ] Mobile breakpoints (320-767px)
  - [ ] Tablet breakpoints (768-1023px)
  - [ ] Desktop breakpoints (1024px+)
  - [ ] Touch-friendly tap target sizes (44x44px minimum)
- [ ] Create CSS custom properties for theming
- [ ] Update `.gitignore` if needed
- [ ] Test navigation on mobile emulator (Chrome DevTools)

## Acceptance Criteria

- Shoelace is installed and imported correctly
- Navigation works on mobile (drawer) and desktop (tabs)
- Base responsive styles are in place
- No breaking changes to existing functionality
- **Screenshot of mobile navigation required**

## Files to Modify

- `package.json`
- `src/main.js`
- `index.html`
- `src/index.css`

## Estimated Time

3-4 days

## Dependencies

None - Start immediately
```

---

## Sub-Issue 2: Phase 1

**Title:** Migrate Run Tab to Mobile-First Shoelace Components

**Labels:** `enhancement`, `mobile`, `phase-1`

**Body:**

```markdown
Part of Epic: #TBD (replace with epic number)

## Description

Convert the Run tab to use Shoelace components with mobile-responsive design. This is the critical path as it controls program execution.

## Tasks

- [ ] Replace program selector `<select>` with `<sl-select size="large">`
- [ ] Replace series selector with `<sl-select size="large">`
- [ ] Replace timeline mode selector with `<sl-select>`
- [ ] Replace Start button with `<sl-button variant="success" size="large">`
  - [ ] Add `<sl-icon name="play-fill">` 
- [ ] Replace Stop button with `<sl-button variant="danger" size="large">`
  - [ ] Add `<sl-icon name="stop-fill">`
- [ ] Replace Toggle Targets button with `<sl-button variant="primary" size="large">`
- [ ] Update chrono display for mobile (larger touch target)
- [ ] Make timeline responsive:
  - [ ] Vertical layout option for mobile
  - [ ] Horizontal scroll on tablet
  - [ ] Full view on desktop
- [ ] Update JavaScript event listeners for Shoelace components
- [ ] Add loading states using `<sl-spinner>`
- [ ] Test on mobile emulator

## Acceptance Criteria

- All buttons are touch-friendly (≥44x44px)
- Selects work well on mobile (native picker or Shoelace dropdown)
- Timeline is responsive across devices
- Program execution works correctly
- **Screenshots required:** mobile (portrait), tablet, desktop

## Files to Modify

- `src/ui/views/run_tab.js`
- `src/ui/views/timeline.js`
- `src/index.css` (responsive styles)
- `index.html` (Run section)

## Estimated Time

4-5 days

## Dependencies

- #TBD (Phase 0) must be complete
```

---

## Sub-Issue 3: Phase 2

**Title:** Migrate Audios Tab to Mobile-First Shoelace Components

**Labels:** `enhancement`, `mobile`, `phase-2`

**Body:**

```markdown
Part of Epic: #TBD (replace with epic number)

## Description

Convert the Audios tab to use Shoelace components with card-based layout for mobile.

## Tasks

- [ ] Replace upload form with Shoelace form components:
  - [ ] `<sl-input type="file">` for file picker
  - [ ] `<sl-input>` for title field
  - [ ] `<sl-select>` for codec selector
  - [ ] `<sl-button type="submit" variant="primary">` for upload
  - [ ] Add `<sl-icon name="upload">` to button
- [ ] Convert audio list to responsive layout:
  - [ ] Mobile: `<sl-card>` components (1 column)
  - [ ] Tablet: `<sl-card>` grid (2 columns)
  - [ ] Desktop: Keep table or use cards (3 columns)
- [ ] Add action buttons to cards:
  - [ ] Play: `<sl-button size="small"><sl-icon name="play">`
  - [ ] Delete: `<sl-button size="small" variant="danger"><sl-icon name="trash">`
- [ ] Add swipe-to-delete gesture on mobile (optional)
- [ ] Show upload progress with `<sl-progress-bar>`
- [ ] Add toast notifications for success/error (`<sl-alert>`)
- [ ] Update JavaScript for Shoelace component events
- [ ] Test file upload on mobile devices

## Acceptance Criteria

- File upload works on mobile (native file picker)
- Audio list displays as cards on mobile, responsive on all devices
- Action buttons are touch-friendly
- Upload progress visible
- Success/error feedback shown
- **Screenshots required:** mobile upload flow, card layout

## Files to Modify

- `src/ui/views/audios_tab.js`
- `src/index.css` (card responsive styles)
- `index.html` (Audio section)

## Estimated Time

3-4 days

## Dependencies

- #TBD (Phase 0) must be complete
```

---

## Sub-Issue 4: Phase 3

**Title:** Migrate Programs Tab to Mobile-First Shoelace Components

**Labels:** `enhancement`, `mobile`, `phase-3`, `complex`

**Body:**

```markdown
Part of Epic: #TBD (replace with epic number)

## Description

Convert the Programs tab to use Shoelace components with card-based layout. This is the **most complex migration** due to the Program Editor (2,172 lines).

## Tasks

**Programs List:**
- [ ] Replace Add Program button (FAB on mobile, button on desktop)
- [ ] Convert programs list to responsive card layout:
  - [ ] Mobile: `<sl-card>` (1 column)
  - [ ] Tablet: `<sl-card>` grid (2 columns)
  - [ ] Desktop: `<sl-card>` grid (3 columns) or table
- [ ] Add card content with `<sl-badge>` for status
- [ ] Replace action buttons with Shoelace button group:
  - [ ] Run, Edit, Duplicate, Delete, Upload, Download buttons
  - [ ] All touch-friendly with icons

**Program Editor:**
- [ ] Update modal to use `<sl-dialog>` (mobile-optimized)
- [ ] Make tabs responsive with `<sl-tab-group>`
- [ ] Update form fields (`<sl-input>`, `<sl-checkbox>`, `<sl-select>`)
- [ ] Update series/events editor with Shoelace components
- [ ] Touch-friendly drag handles
- [ ] Update timeline preview (mobile-responsive)
- [ ] Add confirmation dialogs for delete actions
- [ ] Update JavaScript for Shoelace events
- [ ] Test editor workflow on mobile

## Acceptance Criteria

- Programs display as cards on mobile, responsive layout
- All action buttons are touch-friendly
- Program Editor works on mobile (usable, scrollable)
- Timeline preview is mobile-responsive
- CRUD operations work correctly
- **Screenshots required:** mobile card view, mobile editor, tablet/desktop views

## Files to Modify

- `src/ui/views/programs_tab.js`
- `src/ui/views/program_editor.js` (major refactor - 2,172 lines)
- `src/ui/views/timeline.js` (responsive updates)
- `src/index.css` (extensive responsive styles)
- `index.html` (Programs section)

## Estimated Time

6-8 days (most complex phase)

## Dependencies

- #TBD (Phase 0) must be complete

## Notes

Consider breaking into sub-tasks if needed:
- 3a: Programs list card view
- 3b: Program Editor modal and forms
- 3c: Timeline preview responsiveness
```

---

## Sub-Issue 5: Phase 4

**Title:** Migrate Settings Tab to Mobile-First Shoelace Components

**Labels:** `enhancement`, `mobile`, `phase-4`

**Body:**

```markdown
Part of Epic: #TBD (replace with epic number)

## Description

Convert the Settings tab to use Shoelace form components. This is the simplest migration.

## Tasks

- [ ] Replace settings form with Shoelace components:
  - [ ] `<sl-input>` for server base URL
  - [ ] `<sl-button type="submit" variant="primary">` for Save
- [ ] Replace admin mode form:
  - [ ] `<sl-input type="password">` for password
  - [ ] `<sl-switch>` or `<sl-button>` for enable/disable
- [ ] Add form validation:
  - [ ] URL validation with visual feedback
  - [ ] Required field indicators
- [ ] Show status messages with `<sl-alert>`
- [ ] Make form mobile-friendly:
  - [ ] Full-width inputs on mobile
  - [ ] Large touch-friendly buttons
  - [ ] Proper spacing for thumbs
- [ ] Update JavaScript for Shoelace form events
- [ ] Test form submission on mobile

## Acceptance Criteria

- Settings form is mobile-responsive
- Inputs are touch-friendly with proper validation
- Success/error feedback visible
- Form works correctly on all devices
- **Screenshots required:** mobile form view

## Files to Modify

- `src/ui/views/settings_tab.js`
- `src/index.css` (form responsive styles)
- `index.html` (Settings section)

## Estimated Time

2-3 days

## Dependencies

- #TBD (Phase 0) must be complete
```

---

## Sub-Issue 6: Phase 5

**Title:** Cross-Device Testing, Performance Optimization & Polish

**Labels:** `enhancement`, `mobile`, `phase-5`, `testing`

**Body:**

```markdown
Part of Epic: #TBD (replace with epic number)

## Description

Comprehensive testing across devices, performance optimization, and final polish.

## Device Testing

- [ ] Test on iPhone (Safari) - Portrait & Landscape
- [ ] Test on Android phone (Chrome) - Portrait & Landscape
- [ ] Test on iPad (Safari) - Both orientations
- [ ] Test on Android tablet (Chrome)
- [ ] Test on Desktop browsers (Chrome, Firefox, Safari, Edge)

## Performance Testing

- [ ] Test on slow 3G network
- [ ] Measure load time (target: <3s on 3G)
- [ ] Test with large datasets
- [ ] Check Lighthouse scores (Performance, Accessibility)

## Accessibility Testing

- [ ] Keyboard navigation (all features accessible)
- [ ] Screen reader testing (NVDA/VoiceOver)
- [ ] Color contrast validation (≥4.5:1)
- [ ] Focus indicators visible
- [ ] ARIA labels present

## Performance Optimization

- [ ] Lazy load Shoelace components if needed
- [ ] Optimize images (WebP, compress)
- [ ] Code splitting for large components
- [ ] Add service worker for offline support (optional)

## Bug Fixes

- [ ] Fix mobile-specific issues
- [ ] Fix tablet-specific issues
- [ ] Fix accessibility issues
- [ ] Fix performance issues

## Documentation

- [ ] Update README with Shoelace usage
- [ ] Document responsive breakpoints
- [ ] Document component patterns
- [ ] Add screenshots of new UI

## Acceptance Criteria

- All tests pass on target devices
- Performance meets targets (<3s load on 3G)
- Lighthouse Accessibility score ≥95
- All critical bugs fixed
- Documentation updated
- **Screenshots required:** All device types, Lighthouse scores

## Files to Modify

- Various files (bug fixes)
- `README.md`
- `docs/` (component documentation)
- `vite.config.ts` (optimization settings)

## Estimated Time

5-7 days

## Dependencies

- All previous phases (#TBD Phase 0-4) must be complete
```

---

## Instructions for Creating Issues

1. **Create Epic first** - Copy the Epic template above
2. **Get Epic number** - Note the issue number (e.g., #32)
3. **Create sub-issues** - Copy each Phase template, replace `#TBD` with epic number
4. **Update Epic** - Add sub-issue numbers to Epic checklist
5. **Add labels** - Use suggested labels for filtering
6. **Assign** - Assign to GitHub Copilot Agent or team member

## Labels to Create (if not exist)

- `epic` - For the main epic issue
- `mobile` - For mobile-related work
- `phase-0`, `phase-1`, etc. - For each phase
- `complex` - For Phase 3 (most complex)
- `testing` - For Phase 5

---

**Note:** Replace all `#TBD` placeholders with actual issue numbers after creating them.
