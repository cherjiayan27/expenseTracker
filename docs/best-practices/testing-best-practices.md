# Testing Best Practices (Playwright & Cypress)

A concise, opinionated guide for writing reliable tests across unit, integration, and E2E suites, with E2E guidance tailored to Playwright and Cypress.

## Principles
1. **Behavior > Implementation**  
   Test what users or consumers observe, not how it’s implemented.

2. **Determinism is non‑negotiable**  
   Flaky tests are bugs. Control time, randomness, and external state.

3. **Right level, right cost**  
   Prefer unit tests; use integration for wiring; reserve E2E for critical flows.

---

## Must‑Follow Rules

### 1. Use the Test Pyramid
- **Many** unit tests
- **Some** integration tests
- **Few** E2E tests

### 2. AAA Structure
Every test should follow Arrange → Act → Assert.  
If a test doesn’t clearly fit this, refactor it.

### 3. One Behavior per Test
A test should fail for one reason only.  
Avoid multi‑purpose tests that hide the real failure.

### 4. No Hidden Async
Never assert before the system is ready.  
Prefer waiting for a condition over fixed sleeps.

### 5. No Global Leaks
Reset mocks, timers, and global state between tests.  
Tests must be order‑independent.

---

## Practical Guidance

### Unit Tests
- Pure logic: no IO, no network
- Mock external dependencies
- Use small, focused fixtures

### Integration Tests
- Real modules + real dependencies
- Use test databases or isolated environments
- Verify contracts between layers

### E2E Tests (Playwright/Cypress)
- Critical user journeys only
- Prefer role- or label-based selectors; use `data-testid` for edge cases
- Avoid brittle UI text assertions unless part of UX contract
- Assert on visible behavior, not DOM structure

#### Playwright Tips
- Prefer `getByRole`, `getByLabel`, `getByTestId`
- Rely on auto-waiting; avoid `waitForTimeout` unless unavoidable
- Use `expect(locator).toBeVisible()` or `toHaveText()` for stable assertions

#### Cypress Tips
- Prefer `cy.findByRole` / `cy.findByLabelText` (Testing Library)
- Avoid forcing actions (`{ force: true }`) unless unavoidable and documented
- Use `cy.intercept` to control network and make tests deterministic

---

## Anti‑Patterns to Avoid
- **Snapshot spam**: use sparingly, only for stable output
- **Over‑mocking**: if everything is mocked, you’re not testing reality
- **Test coupling**: tests depending on other tests’ side effects
- **Magic sleeps**: replace with explicit waits or retries
- **Testing private functions**: prefer public interfaces
- **Selector roulette**: avoid brittle selectors (CSS chains, nth-child)

---

## Naming & Readability
- Test names should explain behavior, not implementation.
- Prefer: `should show error when input is invalid`
- Avoid: `should call validate()`

---

## Data & Fixtures
- Use realistic data shapes
- Keep fixtures minimal and explicit
- Document any assumptions or constraints

---

## Debuggability
- Keep assertions tight and descriptive
- Log only when needed (avoid noisy output)
- Failures should immediately indicate what broke

---

## Selector Strategy (E2E)
1. **Prefer semantic selectors**: roles, labels, placeholders
2. **Fallback**: `data-testid` for elements without good semantics
3. **Last resort**: CSS selectors (avoid chaining and positional selectors)

---

## Network & State Control
- Mock or intercept non-critical external services
- Seed test data explicitly
- Reset state between tests (DB, local storage, cookies)

---

## Quick Checklist
- [ ] Behavior‑focused assertions
- [ ] Deterministic (time, random, network controlled)
- [ ] Clear AAA structure
- [ ] Single behavior per test
- [ ] No global state leaks
- [ ] Right test level used
- [ ] Semantic selectors preferred
- [ ] No magic sleeps