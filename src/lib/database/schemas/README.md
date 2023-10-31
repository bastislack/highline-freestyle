Idea behind this directory is to create a structure for upgrading Databases.

Each Version should declare a schema and an upgrade function that are then passed to Dexie.
Additionally, since TypeScript, interfaces for all tables are to exported.

The export structure should stay the same so that one can simply

```diff
- import {...} from "./schemas/VersionXSchema.ts"
+ import {...} from "./schemas/Version(X+1)Schema.ts"
```

in the Database.

The `CurrentVersion.ts` exports the current Version data. Anything that relies on Database-Types should import from there.
