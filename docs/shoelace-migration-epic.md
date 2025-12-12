# Epic: Mobile-First UI Migration to Shoelace

**Status:** Ready for Implementation  
**Estimated Duration:** 5 weeks  
**Framework:** Shoelace (Web Components)  
**Architecture:** Vanilla JavaScript (no React migration)

---

## Overview

Migrate the rotation_target_frontend_webapp to a mobile-first design using Shoelace Web Components. The current application has zero mobile responsiveness (no media queries, fixed widths), which is critical since primary usage will be on mobile devices (phones/tablets).

**Key Benefits:**
- ✅ Mobile-ready with touch-optimized components (44x44px tap targets)
- ✅ Responsive design (320px to 4K)
- ✅ Lightweight (50KB base bundle)
- ✅ Excellent accessibility (WCAG 2.1 AA)
- ✅ Works with existing vanilla JavaScript (no framework rewrite)

**Reference Documentation:**
- [Executive Summary](./EXECUTIVE-SUMMARY.md)
- [Full Investigation Report](./ui-framework-investigation.md)
- [PatternFly MCP Assessment](./patternfly-mcp-assessment.md)

---

## Pre-Migration Considerations

### Existing Issues to Address First

Before starting the Shoelace migration, consider the following open issues:

#### ⚠️ Should Complete First (Conflicts with Migration)

**None** - The migration can proceed immediately. However, be aware of:

- **Issue #7 (Epic: Multi-View Program Editor)** - The migration will affect the Program Editor significantly. The Form Editor tab can be migrated as-is, but consider:
  - Timeline View (#28) - Should be designed with Shoelace components in mind
  - The migration will make the editor mobile-responsive, which aligns with the epic goals

#### ℹ️ Can Complete Independently (No Conflicts)

The following issues can be worked on in parallel or after migration:

- **Issue #30** - Add JSON syntax highlighting to Editor Preview (enhancement to existing feature)
- **Issue #29** - Add JSON validation against JSON Schema (enhancement to existing feature)
- **Issue #23** - Allow uploading/starting from file in Program Editor (feature addition)

#### 🔄 Will Be Enhanced by Migration

These issues will benefit from the mobile-first approach:

- **Issue #16** - Live Synchronization and Preview Error Display (will work on mobile)
- **Issue #15** - Preview UI/UX Consistency (mobile-responsive preview)

**Recommendation:** Proceed with migration immediately. Issues #30, #29, and #23 can be implemented after migration using Shoelace components for consistency.

---

## Implementation Strategy

The migration is divided into 6 phases:

1. **Phase 0: Preparation & Setup** - Foundation work
2. **Phase 1: Run Tab** - Critical path (program execution)
3. **Phase 2: Audios Tab** - File management
4. **Phase 3: Programs Tab** - Most complex (editor integration)
5. **Phase 4: Settings Tab** - Simple forms
6. **Phase 5: Testing & Polish** - Cross-device validation

---

## Sub-Issues

### Phase 0: Preparation & Foundation (Week 1)

**Issue: Shoelace Setup and Responsive Foundation**

**Description:**
Install Shoelace and create the responsive foundation for the mobile-first design, including navigation system and base styles.

**Tasks:**
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
- [ ] Update `.gitignore` if needed (node_modules already excluded)
- [ ] Test navigation on mobile emulator (Chrome DevTools)

**Acceptance Criteria:**
- Shoelace is installed and imported correctly
- Navigation works on mobile (drawer) and desktop (tabs)
- Base responsive styles are in place
- No breaking changes to existing functionality
- Screenshot of mobile navigation required

**Estimated Time:** 3-4 days

**Dependencies:** None

**Files to Modify:**
- `package.json`
- `src/main.js`
- `index.html`
- `src/index.css`

---

### Phase 1: Run Tab Migration (Week 1-2)

**Issue: Migrate Run Tab to Mobile-First Shoelace Components**

**Description:**
Convert the Run tab to use Shoelace components with mobile-responsive design. This is the critical path as it controls program execution.

**Tasks:**
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

**Acceptance Criteria:**
- All buttons are touch-friendly (≥44x44px)
- Selects work well on mobile (native picker or Shoelace dropdown)
- Timeline is responsive across devices
- Program execution works correctly
- Screenshots required: mobile (portrait), tablet, desktop

**Estimated Time:** 4-5 days

**Dependencies:** Phase 0 must be complete

**Files to Modify:**
- `src/ui/views/run_tab.js`
- `src/ui/views/timeline.js`
- `src/index.css` (responsive styles)
- `index.html` (Run section)

---

### Phase 2: Audios Tab Migration (Week 2)

**Issue: Migrate Audios Tab to Mobile-First Shoelace Components**

**Description:**
Convert the Audios tab to use Shoelace components with card-based layout for mobile.

**Tasks:**
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

**Acceptance Criteria:**
- File upload works on mobile (native file picker)
- Audio list displays as cards on mobile, responsive on all devices
- Action buttons are touch-friendly
- Upload progress visible
- Success/error feedback shown
- Screenshots required: mobile upload flow, card layout

**Estimated Time:** 3-4 days

**Dependencies:** Phase 0 must be complete

**Files to Modify:**
- `src/ui/views/audios_tab.js`
- `src/index.css` (card responsive styles)
- `index.html` (Audio section)

---

### Phase 3: Programs Tab Migration (Week 3-4)

**Issue: Migrate Programs Tab to Mobile-First Shoelace Components**

**Description:**
Convert the Programs tab to use Shoelace components with card-based layout. This is the most complex migration due to the Program Editor.

**Tasks:**
- [ ] Replace Add Program button:
  - [ ] Mobile: Floating Action Button (FAB) at bottom-right
  - [ ] Desktop: `<sl-button variant="primary">` with icon
- [ ] Convert programs list to responsive layout:
  - [ ] Mobile: `<sl-card>` (1 column, full-width)
  - [ ] Tablet: `<sl-card>` grid (2 columns)
  - [ ] Desktop: `<sl-card>` grid (3 columns) or table
- [ ] Add card content:
  - [ ] Header: Program title + `<sl-badge>` for status
  - [ ] Body: Description (truncated on mobile)
  - [ ] Footer: `<sl-button-group>` with actions
- [ ] Replace action buttons:
  - [ ] Run: `<sl-button size="small"><sl-icon name="play">`
  - [ ] Edit: `<sl-button size="small"><sl-icon name="pencil">`
  - [ ] Duplicate: `<sl-button size="small"><sl-icon name="copy">`
  - [ ] Delete: `<sl-button size="small" variant="danger"><sl-icon name="trash">`
  - [ ] Upload: `<sl-button size="small"><sl-icon name="upload">`
  - [ ] Download: `<sl-button size="small"><sl-icon name="download">`
- [ ] Update Program Editor modal/view:
  - [ ] Use `<sl-dialog>` for modal (mobile-optimized)
  - [ ] Make tabs responsive with `<sl-tab-group>`
  - [ ] Update form fields:
    - [ ] `<sl-input>` for title/description
    - [ ] `<sl-checkbox>` for readonly flag
  - [ ] Update series/events editor:
    - [ ] `<sl-button>` for add/remove
    - [ ] `<sl-input>` for fields
    - [ ] `<sl-select>` for audio selection
    - [ ] Touch-friendly drag handles
- [ ] Update timeline preview in editor (mobile-responsive)
- [ ] Add confirmation dialogs (`<sl-dialog>`) for delete actions
- [ ] Update JavaScript for Shoelace events
- [ ] Test editor workflow on mobile

**Acceptance Criteria:**
- Programs display as cards on mobile, responsive layout
- All action buttons are touch-friendly
- Program Editor works on mobile (usable, scrollable)
- Timeline preview is mobile-responsive
- CRUD operations work correctly
- Screenshots required: mobile card view, mobile editor, tablet/desktop views

**Estimated Time:** 6-8 days (most complex)

**Dependencies:** Phase 0 must be complete

**Files to Modify:**
- `src/ui/views/programs_tab.js`
- `src/ui/views/program_editor.js` (major refactor)
- `src/ui/views/timeline.js` (responsive updates)
- `src/index.css` (extensive responsive styles)
- `index.html` (Programs section)

**Notes:**
- This phase has the most work due to Program Editor complexity
- Consider breaking into sub-tasks if needed:
  - 3a: Programs list card view
  - 3b: Program Editor modal and forms
  - 3c: Timeline preview responsiveness

---

### Phase 4: Settings Tab Migration (Week 4)

**Issue: Migrate Settings Tab to Mobile-First Shoelace Components**

**Description:**
Convert the Settings tab to use Shoelace form components. This is the simplest migration.

**Tasks:**
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

**Acceptance Criteria:**
- Settings form is mobile-responsive
- Inputs are touch-friendly with proper validation
- Success/error feedback visible
- Form works correctly on all devices
- Screenshots required: mobile form view

**Estimated Time:** 2-3 days

**Dependencies:** Phase 0 must be complete

**Files to Modify:**
- `src/ui/views/settings_tab.js`
- `src/index.css` (form responsive styles)
- `index.html` (Settings section)

---

### Phase 5: Testing, Optimization & Polish (Week 5)

**Issue: Cross-Device Testing and Performance Optimization**

**Description:**
Comprehensive testing across devices, performance optimization, and final polish.

**Tasks:**

**Device Testing:**
- [ ] Test on iPhone (Safari)
  - [ ] Portrait mode
  - [ ] Landscape mode
  - [ ] iOS gestures (back, swipe)
- [ ] Test on Android phone (Chrome)
  - [ ] Portrait mode
  - [ ] Landscape mode
  - [ ] Android gestures
- [ ] Test on iPad (Safari)
  - [ ] Portrait and landscape
  - [ ] Split-screen mode
- [ ] Test on Android tablet (Chrome)
- [ ] Test on Desktop browsers:
  - [ ] Chrome
  - [ ] Firefox
  - [ ] Safari (macOS)
  - [ ] Edge

**Performance Testing:**
- [ ] Test on slow 3G network
- [ ] Measure load time (target: <3s on 3G)
- [ ] Test with large datasets (many programs/audios)
- [ ] Check Lighthouse scores (Performance, Accessibility)

**Accessibility Testing:**
- [ ] Keyboard navigation (all features accessible)
- [ ] Screen reader testing (NVDA/VoiceOver)
- [ ] Color contrast validation
- [ ] Focus indicators visible
- [ ] ARIA labels present

**Performance Optimization:**
- [ ] Lazy load Shoelace components if needed
- [ ] Optimize images (WebP, compress)
- [ ] Minify CSS/JS (Vite handles this)
- [ ] Code splitting for large components
- [ ] Add service worker for offline support (optional)

**Bug Fixes:**
- [ ] Fix any mobile-specific issues
- [ ] Fix any tablet-specific issues
- [ ] Fix any accessibility issues
- [ ] Fix any performance issues

**Documentation:**
- [ ] Update README with Shoelace usage
- [ ] Document responsive breakpoints
- [ ] Document component patterns
- [ ] Add screenshots of new UI

**Acceptance Criteria:**
- All tests pass on target devices
- Performance meets targets (<3s load on 3G)
- Accessibility score ≥90 (Lighthouse)
- All critical bugs fixed
- Documentation updated
- Screenshots required: All device types, Lighthouse scores

**Estimated Time:** 5-7 days

**Dependencies:** All previous phases must be complete

**Files to Modify:**
- Various files (bug fixes)
- `README.md`
- `docs/` (add component documentation)
- `vite.config.ts` (optimization settings)

---

## Testing Checklist

Use this checklist during Phase 5 testing:

### Mobile (Portrait)
- [ ] Navigation (bottom nav visible, works)
- [ ] Run tab (program selection, start/stop)
- [ ] Audios tab (upload, card list)
- [ ] Programs tab (card list, editor)
- [ ] Settings tab (form input, save)
- [ ] Timeline rendering (vertical or scrollable)
- [ ] Touch interactions (tap, swipe, pinch)
- [ ] Text input (keyboard doesn't obscure)
- [ ] Buttons (all ≥44x44px, easily tappable)

### Mobile (Landscape)
- [ ] Navigation adjusts appropriately
- [ ] Content fits in viewport
- [ ] Timeline readable
- [ ] No horizontal overflow issues

### Tablet (Portrait & Landscape)
- [ ] Navigation appropriate for tablet
- [ ] 2-column layouts where specified
- [ ] Timeline compact view
- [ ] Larger touch targets maintained

### Desktop
- [ ] Horizontal tabs visible
- [ ] 3-column layouts where specified
- [ ] Full timeline view
- [ ] Mouse interactions work
- [ ] Hover states present

### Cross-Browser
- [ ] Chrome (desktop & mobile)
- [ ] Firefox (desktop & mobile)
- [ ] Safari (desktop & mobile)
- [ ] Edge (desktop)

### Accessibility
- [ ] Tab navigation works
- [ ] Focus indicators visible
- [ ] Screen reader announces elements correctly
- [ ] Color contrast ≥4.5:1
- [ ] No keyboard traps

### Performance
- [ ] First Contentful Paint <1.5s (4G)
- [ ] Time to Interactive <3s (4G)
- [ ] Bundle size reasonable (~200KB total)
- [ ] No layout shift
- [ ] Smooth scrolling on mobile

---

## Success Metrics

The migration is successful when:

✅ **Functionality:**
- All features work on mobile (320px+), tablet (768px+), desktop (1024px+)
- No regressions in existing functionality
- All CRUD operations work correctly

✅ **Performance:**
- Load time <3s on 3G
- Lighthouse Performance score ≥90
- Bundle size <300KB (including Shoelace)

✅ **Accessibility:**
- Lighthouse Accessibility score ≥95
- WCAG 2.1 AA compliant
- Keyboard navigation 100% functional

✅ **Mobile UX:**
- All touch targets ≥44x44px
- No pinch-to-zoom required
- Native-like mobile experience
- Responsive on all screen sizes

✅ **Code Quality:**
- No console errors
- No accessibility warnings
- Clean git history with descriptive commits
- Documentation updated

---

## Migration Timeline Summary

| Phase | Focus | Duration | Dependencies |
|-------|-------|----------|--------------|
| **Phase 0** | Setup & Foundation | 3-4 days | None |
| **Phase 1** | Run Tab | 4-5 days | Phase 0 |
| **Phase 2** | Audios Tab | 3-4 days | Phase 0 |
| **Phase 3** | Programs Tab | 6-8 days | Phase 0 |
| **Phase 4** | Settings Tab | 2-3 days | Phase 0 |
| **Phase 5** | Testing & Polish | 5-7 days | All phases |
| **Total** | | **23-31 days (5-6 weeks)** | |

**Critical Path:** Phase 0 → Phase 1 → Phase 3 → Phase 5

Phases 1, 2, 4 can potentially be worked in parallel after Phase 0, but sequential is recommended for manageable PRs.

---

## Risk Mitigation

### High Risk: Program Editor Complexity
- **Risk:** Program Editor has 2,172 lines of code with complex state management
- **Mitigation:** 
  - Break Phase 3 into smaller sub-tasks
  - Test thoroughly after each change
  - Keep original CSS/HTML as reference
  - Create rollback plan

### Medium Risk: Timeline Rendering
- **Risk:** Custom timeline visualization (353 lines) may not adapt well to mobile
- **Mitigation:**
  - Create vertical timeline option for mobile
  - Test with various program sizes
  - Consider simplified mobile view if needed

### Medium Risk: Touch Gesture Conflicts
- **Risk:** Browser touch gestures may conflict with app interactions
- **Mitigation:**
  - Use passive event listeners
  - Prevent default only when necessary
  - Test on real devices early

### Low Risk: Shoelace Learning Curve
- **Risk:** Team unfamiliar with Web Components
- **Mitigation:**
  - Excellent Shoelace documentation available
  - Simple API (similar to HTML)
  - Examples provided in this epic

---

## Rollback Strategy

If critical issues arise:

1. **Immediate:** Use `git revert` to undo specific commits
2. **Phase-level:** Revert entire phase if needed
3. **Full rollback:** Revert to pre-migration state (tag the current commit before starting)

**Pre-Migration Tag:** Create `pre-shoelace-migration` tag before Phase 0

```bash
git tag -a pre-shoelace-migration -m "State before Shoelace migration"
git push origin pre-shoelace-migration
```

---

## Resources

### Shoelace Documentation
- **Main:** https://shoelace.style/
- **Getting Started:** https://shoelace.style/getting-started/installation
- **Components:** https://shoelace.style/components/button
- **Customizing:** https://shoelace.style/getting-started/customizing

### Key Components to Use
- `<sl-button>` - All buttons
- `<sl-select>` - Dropdowns
- `<sl-input>` - Text inputs
- `<sl-checkbox>` - Checkboxes
- `<sl-card>` - List items (mobile)
- `<sl-dialog>` - Modals
- `<sl-drawer>` - Mobile navigation
- `<sl-tab-group>` - Desktop tabs
- `<sl-icon>` - Icons (uses Bootstrap Icons)
- `<sl-alert>` - Notifications
- `<sl-spinner>` - Loading states
- `<sl-progress-bar>` - Upload progress

### Mobile Design Guidelines
- **Apple HIG:** https://developer.apple.com/design/human-interface-guidelines/
- **Material Design:** https://m3.material.io/
- **Touch Targets:** Minimum 44x44px (iOS), 48x48px (Android)

---

## Questions & Clarifications

Before starting implementation, confirm:

1. ✅ Should all phases be done sequentially or can some be parallel?
   - **Answer:** Sequential recommended for easier PR review
   
2. ✅ Should the Program Editor tabs (Form, Timeline, Events, JSON) remain as-is?
   - **Answer:** Yes, make them mobile-responsive but keep same structure
   
3. ✅ Is offline/PWA support required?
   - **Answer:** Optional, can be added in Phase 5 if time allows

4. ✅ What's the priority if timeline runs long?
   - **Answer:** Must-have: Phases 0-4 (all tabs working). Phase 5 can be extended.

---

**Epic Status:** Ready for Implementation  
**Created:** December 12, 2025  
**Author:** GitHub Copilot Agent  
**Approved:** Awaiting user confirmation
