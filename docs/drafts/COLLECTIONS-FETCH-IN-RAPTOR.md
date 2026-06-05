# Collections Fetch in Raptor

There are two distinct collection types in Gateway and it is critical they are not mixed up.

## Collection Types

| Type | Class | Source |
|---|---|---|
| **Registered Collection** | `Gateway\Collection` | PHP `::register()` call — exists only while its plugin is active |
| **Raptor Collection** | `Gateway\Raptor\Collections\RaptorCollection` | DB table `gateway_raptor_collection` — persists across plugin activation |

## When to Use Each

### Use the CollectionRegistry (`gateway/v1/collections`)

Anywhere that presents **live data** or the **active state** of the system. This endpoint reads directly from `CollectionRegistry` (populated at runtime by `Collection::register()` calls). Collections whose plugin is deactivated are simply absent.

**Uses:**
- Records page (`#/records`) — browse records across active collections
- Sidebar collection list — navigation should reflect what is actually live
- `with_counts=1` param supported — counts records via each collection's `getTable()`
- `package=<key>` param supported — filter by package

### Use `gateway/v1/raptor/registered-collections` (Studio)

Anywhere that needs **Raptor schema data** (field_list, view_list, form_list) but must still be scoped to registered collections only. This endpoint reads the registry for the collection list, then merges matching Raptor DB records for nested configuration.

**Uses:**
- Fields, Views, Forms, Collections Studio pages — need Raptor nested config
- `with_nested=true` param loads `field_list`, `view_list`, `form_list` from DB for each registered collection
- Returns `fields` from the live `Collection::getFields()` (PHP definition)

### Use `gateway/v1/raptor/collection` (Raptor Management Only)

The raw DB-backed Raptor collection list. Use only for Raptor's own collection management screens (create, edit, delete Raptor collection records). **Do not use this to drive any UI that shows records or active collections.**

## Summary

```
Records page              → gateway/v1/collections?with_counts=1
Sidebar                   → gateway/v1/collections
Studio (Fields/Views/Forms) → gateway/v1/raptor/registered-collections?with_nested=true
Raptor collection manager → gateway/v1/raptor/collection
```
