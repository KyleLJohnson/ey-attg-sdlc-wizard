````instructions
---
applyTo: '**'
description: "SonarQube-aware coding guidelines — write code that is clean, maintainable, and passes static analysis with minimal findings out of the box."
---
# SonarQube-Clean Code Guidelines

This project uses SonarQube for continuous code quality scanning.  
**Your goal:** produce code where SonarQube findings are zero or near-zero on every commit.

---

## 1. Cognitive Complexity (S3776 / squid:S3776)

SonarQube enforces a **maximum Cognitive Complexity of 15** per function/method.  
High complexity = harder to test, review, and maintain.

**Rules:**
- Each `if`, `else if`, `else`, `switch case`, `for`, `while`, `do-while`, `catch`, `?:`, `&&`, `||`, `??` adds +1 (with nesting penalties)
- A deeply nested `if` inside a `for` inside a `while` adds +3, not +1
- Extract logic into named helper functions before complexity exceeds **10** — don't wait until it hits 15

**Patterns to avoid:**
```typescript
// ❌ BAD — Cognitive Complexity ≈ 22
function process(data: Order[]) {
  for (const order of data) {
    if (order.status === 'active') {
      if (order.items.length > 0) {
        for (const item of order.items) {
          if (item.inStock) {
            if (item.price > 0) {
              // ...
            }
          }
        }
      }
    }
  }
}

// ✅ GOOD — each function ≤ 5 complexity
function processActiveOrders(orders: Order[]) {
  orders.filter(isActiveWithItems).forEach(processOrder);
}

function isActiveWithItems(order: Order): boolean {
  return order.status === 'active' && order.items.length > 0;
}

function processOrder(order: Order) {
  order.items.filter(isAvailableItem).forEach(chargeItem);
}

function isAvailableItem(item: OrderItem): boolean {
  return item.inStock && item.price > 0;
}
```

---

## 2. Code Duplication (S1192, S4144, CPD)

SonarQube's Copy-Paste Detector (CPD) flags blocks of **≥ 10 identical or near-identical lines**.

**Rules:**
- Extract repeated logic into shared utilities — never copy-paste code between modules
- Repeated string literals (used 3+ times) must be extracted to `const` — never repeated inline
- Shared validation logic must live in one place and be imported

```typescript
// ❌ BAD — magic string repeated throughout codebase
if (user.role === 'admin') { ... }
if (user.role === 'admin') { ... }

// ✅ GOOD
const ROLES = { ADMIN: 'admin', VIEWER: 'viewer' } as const;
if (user.role === ROLES.ADMIN) { ... }
```

---

## 3. Reliability — Bugs (CRITICAL / BLOCKER)

These cause SonarQube Blocker/Critical findings and must never appear:

### Null / Undefined Dereference (S2259, S6544)
- Never access a property of a value that may be `null` or `undefined` without a guard
- Use optional chaining `?.` and nullish coalescing `??` — never assume
```typescript
// ❌ const name = user.profile.name;
// ✅ const name = user?.profile?.name ?? 'Unknown';
```

### Empty `catch` Blocks (S108, S2486)
- Never silently swallow exceptions
- At minimum: log the error; better: re-throw or handle specifically
```typescript
// ❌ try { ... } catch { }
// ✅ try { ... } catch (err) { logger.error('Operation failed', { err }); throw err; }
```

### Dead Code (S1764, S905, S1135)
- Remove unreachable code, unused variables, unused imports
- `TODO` comments are flagged as S1135 — either resolve them or link to a tracked issue

### Promise / Async (S4830, S2933, typescript:S6544)
- All `async` functions must properly `await` or `return` Promises — never floating Promises
- Always handle Promise rejections — either `try/catch` in `async`, or `.catch()` on the chain

```typescript
// ❌ BAD — floating Promise, rejection unhandled
sendEmail(user);

// ✅ GOOD
await sendEmail(user);
```

---

## 4. Security Hotspots (SonarQube will flag these for review)

Even when SonarQube marks these "to review" rather than bugs, resolve them proactively:

| Hotspot | Rule | Resolution |
|---|---|---|
| Hardcoded credentials | S2068 | Use env vars / secret manager (never literals) |
| SQL built from string concat | S2077 | Use parameterised queries exclusively |
| `Math.random()` for security | S2245 | Use `crypto.getRandomValues()` / `secrets` module |
| `eval()` / `new Function()` | S1523 | Remove — no exceptions |
| HTTP not HTTPS | S5332 | All outbound calls use HTTPS |
| Loose CORS (`*`) | S5122 | Restrict `Access-Control-Allow-Origin` to known domains |
| Disabled SSL cert verify | S4830 | Never disable certificate validation |
| Regex without timeout | S5852 | Cap input length or use `re2` / safe-regex |
| Unmasked sensitive logs | S4792 | Never log passwords, tokens, PII |

---

## 5. Code Smells — Maintainability

### Function Length (S138)
- Functions must not exceed **75 lines** (SonarQube default threshold)
- If a function grows beyond 40 lines, refactor proactively

### Parameter Count (S107)
- Functions must not have more than **7 parameters** — use an options object for 4+
```typescript
// ❌ function createUser(name, email, role, dept, team, manager, startDate)
// ✅ function createUser(options: CreateUserOptions)
```

### Class Size (S2094, S1448)
- Classes must not exceed **200 lines** / **20 public methods**
- Apply Single Responsibility — split large classes

### Nested Ternaries (S3358)
SonarQube flags `a ? b : c ? d : e` (nested ternary).
```typescript
// ❌ const level = score > 90 ? 'A' : score > 80 ? 'B' : 'C';
// ✅ Use if/else or a lookup map for 3+ branches
const getGrade = (score: number) => {
  if (score > 90) return 'A';
  if (score > 80) return 'B';
  return 'C';
};
```

### Nested Template Literals (S4624)
```typescript
// ❌ `Hello ${`${first} ${last}`}`
// ✅ const fullName = `${first} ${last}`; `Hello ${fullName}`
```

---

## 6. TypeScript / JavaScript Specific Rules

| Rule | Pattern to avoid |
|---|---|
| `typescript:S6544` | Non-`void` Promise return not handled — always `await` |
| `typescript:S3776` | Cognitive complexity > 15 |
| `javascript:S1854` | Useless assignment — variable written but never read |
| `javascript:S2123` | Increment is used but result discarded |
| `javascript:S6606` | Prefer `??` over `\|\|` for default values when `false`/`0` are valid |
| `javascript:S1172` | Unused function parameters — prefix with `_` or remove |
| `javascript:S4144` | Duplicated function implementations |
| `javascript:S1451` | File must have a licence header (if enforced by your org) |

**Naming:**
- Variables: `camelCase`; Classes/types: `PascalCase`; Constants: `UPPER_SNAKE_CASE`
- Boolean names: `isX`, `hasX`, `canX`, `shouldX` — never `flag`, `temp`, `data`

---

## 7. Python Specific Rules

| Rule | Pattern to avoid |
|---|---|
| `python:S1542` | Function name should match convention (`snake_case`) |
| `python:S5754` | Re-raise exceptions with `raise` not `raise e` |
| `python:S1192` | Duplicate string literals — use constants |
| `python:S930` | Too many positional arguments |
| `python:S2053` | `pickle` is a security risk with untrusted data — use `json` |
| `python:S5659` | JWT decoded without signature verification |

```python
# ❌ except Exception as e: raise e  ← loses original traceback
# ✅ except Exception: raise
```

---

## 8. C# Specific Rules

| Rule | Pattern to avoid |
|---|---|
| `csharpsquid:S2699` | Test has no assertion — always assert |
| `csharpsquid:S3971` | `GC.Collect()` should not be called manually |
| `csharpsquid:S3966` | Dispose called more than once |
| `csharpsquid:S4456` | Iterator should validate arguments eagerly |
| `csharpsquid:S2372` | Raw exceptions not re-thrown |

**Naming (matches SonarQube defaults for C#):**
- Methods: `PascalCase`; Private fields: `_camelCase`; Constants: `PascalCase`

---

## 9. Java Specific Rules

| Rule | Pattern to avoid |
|---|---|
| `java:S2166` | Class name should end in `Exception` if it extends `Exception` |
| `java:S1135` | `TODO` must be resolved |
| `java:S2629` | Logging args should not require evaluation if disabled |
| `java:S1148` | Use a logger, not `e.printStackTrace()` |
| `java:S2259` | Potential null dereference |
| `java:S3740` | Raw type used — always parameterise generics |

---

## 10. Test Quality Rules

SonarQube analyses test code separately — don't write poor tests:

- Every test must have **at least one assertion** (S2699)
- Test method names must clearly describe what they verify: `should_returnError_when_emailIsMissing`
- No commented-out tests — delete them
- Do not use `Thread.sleep()` / `time.sleep()` in tests — use proper mocks/stubs
- Empty test methods are a blocker

---

## 11. Pre-Commit Checklist (SonarQube Zero-Finding standard)

Before committing any code, verify:

- [ ] No function exceeds cognitive complexity 15 — refactor if > 10
- [ ] No copy-pasted blocks ≥ 10 lines exist anywhere in the diff
- [ ] No `catch` block is empty or swallows exceptions silently
- [ ] No hardcoded secrets, credentials, or tokens anywhere in the code
- [ ] No unused variables, imports, or dead code
- [ ] All Promises are awaited or have `.catch()` handlers
- [ ] No nested ternaries or nested template literals
- [ ] All new public methods have documented parameters where non-obvious
- [ ] SonarQube `# NOSONAR` suppressions are **never used without a comment** explaining why

---

## SonarQube Suppression Policy

`// NOSONAR` or `@SuppressWarnings("squid:...")` must **never be used** to hide a finding without justification.

If suppression is genuinely needed:
```typescript
// NOSONAR: S2245 — using Math.random() intentionally for non-security shuffle in UI demo
const shuffled = items.sort(() => Math.random() - 0.5);
```
Every suppression requires a PR comment explaining why the rule does not apply.
````
