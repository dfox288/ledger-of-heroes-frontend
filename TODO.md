# Frontend TODO List

**Last Updated:** 2025-11-25
**Priority:** High - Backend API changes in progress

---

## 🚨 High Priority - Backend API Evolution

### 1. **Monitor for More Meilisearch Migrations** ⚠️
**Status:** ACTIVE - Backend is evolving
**Urgency:** Respond within 24-48 hours of backend changes

**What to Watch:**
- Damage types filter migration to Meilisearch
- Saving throws filter migration to Meilisearch
- Other entity filters (items, monsters, races)

**Current State (2025-11-25):**
- ✅ **Class filtering migrated** - Using `filter=class_slugs IN [wizard]`
- ⏳ **Pending:** Damage types, saving throws, other filters

**Action Required:**
1. Check backend API docs daily: `http://localhost:8080/docs/api`
2. Test existing filters for breaking changes
3. Update frontend query builders when filters migrate
4. Follow same pattern as class filter migration:
   - Add to `meilisearchFilters` array
   - Use `IN [value1, value2]` syntax for multi-select
   - Maintain MySQL fallback where possible

**Tracking:**
- Backend repo: `../importer`
- API spec: `http://localhost:8080/docs/api.json`

---

## 🎯 Medium Priority - Feature Enhancements

### 2. **Advanced Filter UI for Power Users**
**Estimated:** 4-6 hours
**Prerequisites:** Wait for more filters to migrate to Meilisearch

**Features:**
- "Advanced Filters" section toggle
- Visual query builder
- Filter combination preview: `class_slugs IN [wizard] AND level >= 7`
- Save filter presets to localStorage
- Share filter URLs

**Design Considerations:**
- Show Meilisearch query syntax
- Help users understand AND/OR logic
- Provide preset examples (e.g., "High-level wizard evocation spells")

---

### 3. **Type Generation Automation**
**Estimated:** 2-3 hours
**Issue:** `npm run types:sync` doesn't work from Docker container

**Current Problem:**
- Script can't reach `localhost:8080` from inside container
- Must manually fix generated types when API changes
- Recent fix: `is_base_class` from `string` to `boolean`

**Solution:**
- Update `scripts/sync-api-types.js` to use `host.docker.internal`
- Or: Run script on host machine, not in container
- Or: Add ENV variable for API spec URL

**Files:**
- `scripts/sync-api-types.js`
- `package.json` scripts section

---

### 4. **Migrate Other Filters to Meilisearch**
**Estimated:** 1-2 hours per entity
**Dependencies:** Backend must support it first

**Candidates:**
1. **Spells:**
   - Damage types (currently: `damage_type=fire,cold`)
   - Saving throws (currently: `saving_throw=DEX,CON`)
   - Potentially: Casting time, range, duration

2. **Items:**
   - Item type multi-select
   - Rarity multi-select

3. **Monsters:**
   - CR range
   - Type multi-select

**Pattern to Follow:**
```typescript
// In queryBuilder
const meilisearchFilters: string[] = []

if (selectedDamageTypes.value.length > 0) {
  meilisearchFilters.push(`tag_slugs IN [${selectedDamageTypes.value.join(', ')}]`)
}

if (meilisearchFilters.length > 0) {
  params.filter = meilisearchFilters.join(' AND ')
}
```

---

## 🔧 Technical Debt

### 5. **Fix Remaining TypeScript Errors**
**Count:** 11 errors (all in `app/pages/monsters/[slug].vue`)
**Issue:** `Property 'spellcasting' does not exist on type 'Monster'`

**Root Cause:**
- Generated types don't include `spellcasting` field
- Monster detail page uses it

**Solution:**
- Regenerate types after fixing type sync script
- Or: Add manual type extension in `app/types/api/entities.ts`

---

### 6. **E2E Testing with Playwright**
**Estimated:** 8-12 hours
**Status:** Infrastructure ready, no tests written

**Priority Tests:**
1. **Filter Interactions:**
   - Select class filter → verify results update
   - Combine multiple filters → verify AND logic
   - Clear filters → verify reset

2. **Navigation:**
   - Homepage → Spells → Filter → Detail page
   - Back button behavior

3. **Spell List Generator:**
   - Select class/level → verify spell slots
   - Toggle spells → verify localStorage

**Files to Create:**
- `tests/e2e/filters.spec.ts`
- `tests/e2e/navigation.spec.ts`
- `tests/e2e/spell-list-generator.spec.ts`

---

## 💡 Future Enhancements

### 7. **Multi-Class Spell Lists**
**Estimated:** 6-8 hours
**Prerequisites:** Spell List Generator MVP complete ✅

**Features:**
- Select multiple classes (e.g., Wizard 5 / Cleric 3)
- Merge spell lists correctly
- Handle multiclass spellcasting rules
- Show spell slots for multiclass

---

### 8. **Export Functionality**
**Estimated:** 4-6 hours

**Formats:**
- PDF spell list printout
- JSON export for import into other tools
- Markdown for notes/wikis

---

### 9. **Advanced Meilisearch Queries in UI**
**Estimated:** 8-10 hours
**Dependencies:** Multiple filters migrated to Meilisearch

**Features:**
- Query builder UI with drag-and-drop
- AND/OR logic toggles
- Parentheses grouping: `(class_slugs IN [wizard] OR class_slugs IN [sorcerer]) AND level >= 5`
- Save complex queries as presets

---

## 📊 Task Tracking

### Completed (2025-11-25)
- ✅ Migrate spell class filtering to Meilisearch
- ✅ Fix `is_base_class` type mismatch
- ✅ Update ClassCard boolean comparison
- ✅ Document migration in CHANGELOG and handover

### In Progress
- ⏳ Monitor backend for more Meilisearch migrations

### Blocked
- 🚫 Type generation automation (need to fix script)
- 🚫 Migrate other filters (waiting for backend support)

---

## 🎯 Recommended Order

1. **Monitor backend daily** - High priority, prevents breakage
2. **Fix type generation** - Unblocks future API changes
3. **E2E testing** - Regression protection before more changes
4. **Migrate other filters** - After backend supports them
5. **Advanced filter UI** - Polish after core migrations complete

---

**End of TODO List**

**Next Review:** After next backend API change is detected
