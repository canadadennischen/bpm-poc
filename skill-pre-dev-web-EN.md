---
name: skill-pre-dev-web
description: Before generating any Node.js + Express + MySQL + Docker web project, apply all rules in this skill to avoid common mistakes including npm ci errors, Chinese charset corruption, port conflicts, and Windows path issues.
---

# skill-pre-dev-web

**Purpose:** Apply all rules below before starting any new Node.js + Express + MySQL + Docker full-stack web project, to avoid repeating known pitfalls.

## When to trigger
- Creating a new web project (Node.js / Express / Docker)
- Generating a Dockerfile or docker-compose.yml
- Generating a backend API project that includes MySQL
- Any workflow involving `docker-compose up`

## Rules

---

### Rule 1: Use `npm install` in Dockerfile — never `npm ci`
```dockerfile
# Correct
RUN npm install --omit=dev

# Wrong — fails if package-lock.json does not exist
RUN npm ci --omit=dev
```
> Use `npm install` unless you have confirmed that `package-lock.json` is committed alongside the source code.

---

### Rule 2: Do not include a `version:` field in docker-compose.yml
```yaml
# Correct
services:
  db: ...

# Wrong — deprecated in modern Docker Compose
version: '3.9'
services:
  db: ...
```

---

### Rule 3: Map MySQL to port 3307 externally to avoid local port conflicts
```yaml
db:
  ports:
    - "3307:3306"  # local MySQL likely already occupies 3306
```

---

### Rule 4: Chinese charset — always use a single init.sql file
**Key principle:** Each `.sql` file in `docker-entrypoint-initdb.d/` runs in its own independent connection. A `SET NAMES` command in file A does not carry over to file B.

```yaml
# docker-compose.yml
volumes:
  - ./init.sql:/docker-entrypoint-initdb.d/init.sql:ro  # single file only
```

```sql
-- init.sql must start with these three lines, immediately followed by all CREATE/INSERT statements
SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;
SET character_set_connection = utf8mb4;

-- Then: DROP SCHEMA / CREATE SCHEMA / CREATE TABLE / INSERT ...
```

**Do not use `--init-connect`:** this option is ignored for accounts with the SUPER privilege (including root), which is what MySQL uses during initialization.

---

### Rule 5: Volume paths in docker-compose.yml are relative to the yml file's location
```yaml
# init.sql is in the same directory as docker-compose.yml
- ./init.sql:/docker-entrypoint-initdb.d/init.sql:ro   # correct

# SQL file is one level up
- ../BPM.sql:/docker-entrypoint-initdb.d/BPM.sql:ro    # correct

# Wrong path → tables missing after DB init → 500 error on login
```

---

### Rule 6: Windows paths with Chinese characters — advise user to copy to a pure ASCII path
```
C:\DATA\Dennis202502\prj\8. AI - 甫曉\output   # bash cd fails here
C:\src\output                                    # ASCII only, no spaces — works
```
> Whenever the user is on Windows, proactively mention: "If your path contains Chinese characters or spaces, please copy the project to a pure ASCII path before running npm or docker commands."

---

### Rule 7: Set MySQL charset via docker command flags
```yaml
db:
  command: >
    --character-set-server=utf8mb4
    --collation-server=utf8mb4_unicode_ci
```
> This sets the server-level default charset, but does NOT replace the `SET NAMES` in `init.sql` (see Rule 4). Both are required for correct Chinese data handling.

---

### Rule 8: Always use `-v` when resetting Docker to clear the volume
```bash
docker-compose down -v   # correct — clears data volume so init.sql runs again
docker-compose down      # wrong  — preserves old data, init.sql will not re-run
```
> After modifying the init SQL or charset settings, always run `down -v` to force a full DB re-initialization.

---

## Pre-output checklist

Before generating any Dockerfile or docker-compose.yml, verify each item:

- [ ] Dockerfile uses `npm install` (not `npm ci`)
- [ ] docker-compose.yml has no `version:` field
- [ ] MySQL port is set to `3307:3306`
- [ ] Single init SQL file with `SET NAMES utf8mb4` at the top
- [ ] Volume path is correct relative to docker-compose.yml location
- [ ] README explains the Windows Chinese path issue
- [ ] README explains that DB reset requires `docker-compose down -v`
