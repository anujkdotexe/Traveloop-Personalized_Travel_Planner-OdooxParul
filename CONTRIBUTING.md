# Contributing to Traveloop

Thank you for contributing to Traveloop! This document outlines the standards and workflow for the team.

---

## Branch Strategy

```
main          ─── stable, production-ready
dev           ─── integration branch
feature/xxx   ─── individual feature work (branch from dev)
fix/xxx       ─── bug fixes
```

### Branch naming examples
```
feature/community-likes
feature/admin-user-management
fix/budget-chart-overflow
fix/auth-token-expiry
```

---

## Commit Message Format

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <short summary>
```

| Type | When to use |
|---|---|
| `feat` | New feature or screen |
| `fix` | Bug fix |
| `style` | CSS / visual changes, no logic change |
| `refactor` | Code restructure, no feature change |
| `docs` | Documentation only |
| `chore` | Config, tooling, deps (gitignore, package.json) |
| `test` | Tests |

**Examples:**
```
feat(auth): add quick demo login dropdown with role badges
fix(budget): resolve chart.js canvas memory leak on unmount
style(navbar): increase role badge contrast ratio
docs(readme): add database setup section
chore(deps): install bcryptjs and jsonwebtoken
```

---

## Code Standards

### React / JSX
- Functional components only — no class components
- One component per file
- No inline `style` for repeated patterns — use CSS classes from `index.css`
- All icons must be inline SVG — **zero emoji policy**
- Form fields must have `htmlFor` + `id` linkage for accessibility
- Interactive elements must have accessible `title` or `aria-label`

### CSS
- All design tokens defined as `--variables` in `index.css`
- No hardcoded color hex values inside component files
- Class names use `kebab-case`
- Prefer composing existing utility classes over writing new one-off styles

### JavaScript / Node
- `async/await` over `.then()` chains
- Always handle errors in `try/catch` blocks on the server
- Use parameterized DB queries — never string interpolation in SQL
- Environment variables via `process.env.*` — never hardcode secrets

---

## Pull Request Process

1. Branch from `dev`, not `main`
2. Write a clear PR description explaining what changed and why
3. Ensure no console errors in the browser
4. Run `npm run lint` in the `client/` directory before opening PR
5. Tag at least one team member for review
6. Squash commits before merging

---

## File Structure Rules

| Location | What belongs there |
|---|---|
| `client/src/pages/` | Full page components (one per screen) |
| `client/src/components/` | Reusable components used across pages |
| `client/src/context/` | React Context providers |
| `client/src/routes/` | Route guard components |
| `server/controllers/` | Request/response business logic |
| `server/routes/` | Express route definitions only |
| `server/middleware/` | Express middleware functions |
| `server/db/` | DB connection, schema, seed scripts |
| `docs/` | Markdown documentation only |

---

*Team OdooxParul — Hackathon 2025*
