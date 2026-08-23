# Data Boundary Audit — W3

Question this answers: if a project is moved, renamed or retired, whose data
breaks? Method: manifest, migration and config inspection. No secret values
were read or printed; no database was queried destructively.

## Datastore inventory

Three Supabase projects exist account-wide for nine projects that reference
Supabase.

| Supabase project | Region | Status | Claimed by |
|---|---|---|---|
| `alkahtani-os` | us-east-1 | ACTIVE_HEALTHY | `22` |
| `beyond-style` | ap-south-1 | **INACTIVE** | `masaar` |
| `agentic-os` | ap-south-1 | **INACTIVE** | `agentic-os-enterprise` |

Nine projects reference Supabase; three Supabase projects exist. The arithmetic
does not close, which means at least one of the following is true and the owner
is the only one who can say which: some projects share a database, some point at
a Supabase project outside this account, or some are configured against a
database that no longer exists.

## Boundary findings

### Clean boundaries — safe to move

| Project | Data ownership | Note |
|---|---|---|
| `66` | none — in-memory per run | Nothing to migrate. Rebuilding state is free. |
| `33` RailMind | none — sample data in-repo | Proposes work orders to Maximo; **never writes to it**. The Maximo boundary is read-shaped and one-way by design. |
| `55` | none — the user's own laptop | |
| `mutabasir` | Supabase optional; the demo path runs without it | |
| `Beyond-Style-UAE-` | SQLite, in-repo, Alembic-migrated | Self-contained; moves with the repo. |
| `11` | filesystem — `data/memory.json`, `vault/` | Self-contained. |

### Boundaries requiring care

| Project | Concern |
|---|---|
| `masaar` | Owns the order lifecycle, RBAC roles, `audit_logs` and `domain_events` in `beyond-style`. **`audit_logs` is append-only by design** — an audit trail that can be rewritten during a migration is not an audit trail. Any move must preserve rows and ordering, not re-seed. |
| `Maktab` | Supabase **plus Stripe**. Stripe is the hard boundary: customer, subscription and payment records live outside the repository entirely, keyed by IDs the database stores. Renaming the repo is safe; changing the Supabase project is not, unless Stripe keys move with it. |
| `Pitchora` | Supabase + Stripe, same shape as Maktab, plus a Capacitor mobile shell whose application ID is a published identifier that cannot be changed after store submission. |
| `vertex` | Supabase `borurrzvunlzdnxiossh` per `.mcp.json`, with a nightly `pg_dump` backup workflow — the only project in the portfolio with an automated database backup. That workflow is itself a dependency: moving the repo without it silently ends the backups. |
| `22` | The only ACTIVE_HEALTHY database in the account belongs to the project classified **EXPERIMENT**. Worth the owner's attention: the live database is not serving the strategic work. |

## Blocking issue

`masaar` migration `0006_rbac_lifecycle.sql` — RBAC, role-scoped RLS, the
enforced order state machine, `audit_logs` and `domain_events` — **cannot be
applied** while the `beyond-style` Supabase project is INACTIVE. Restore was
attempted and denied by this session's permission layer.

Until it is applied, `masaar`'s security model exists in the repository and not
in the database. The application code is merged and the migration is reviewed,
but the guarantees it describes are not in force. `masaar` therefore cannot be
called PRODUCTION_READY, regardless of CI being green.

**Owner action required:** restore the `beyond-style` Supabase project, then
apply `0006` and re-verify. This is the single highest-value unblocking action
in the portfolio.

## Shared-boundary risks: none found

No two projects were found writing to the same table. No cross-project foreign
keys were found. The portfolio's data boundaries are, so far as this inspection
can tell, genuinely separate — which is why the consolidation work has been able
to proceed repo by repo without a data migration.
