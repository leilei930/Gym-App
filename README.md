# FORM — Workout log

A phone-first Expo / React Native prototype built from the supplied Expo starter, upgraded to SDK 58 for current iPhone Expo Go.

## Run

```sh
npm install
npm run web
```

For iPhone testing, install/update Expo Go from the App Store, run `npm run phone`, then scan the terminal QR code using the iPhone Camera. This starts a temporary ngrok development tunnel. Keep the computer awake and server running. Node 22 is installed as a project-local development dependency and used by npm scripts.

## Features

- Freestyle workouts and two starter plans
- Create/edit plans with exercise selection, set count and target reps
- Record weight (kg), reps and completed sets; add sets/exercises
- Automatic 90-second rest timer with skip and +30 seconds
- Resume an unfinished session after reopening
- Save completed sets to history and inspect session details
- Search/filter 876 imported exercises plus eight preserved starter entries; written cues and tutorial photos
- SQLite exercise catalog and session/plan state on iOS/Android; localStorage for browser preview

## Scope

Data stays on the device/browser; there is no account, cloud sync, or backup yet. Rest deadlines survive reopening, but background notifications are not implemented. Tutorials use still photos from Free Exercise DB. Five imported entries have no instructions and three have no photos; the UI labels missing content. The native SQLite path requires device/emulator testing before release. No sample workout history is fabricated.

## Checks

```sh
npx tsc --noEmit
npx expo export --platform web
npx jest --runInBand --watchAll=false
```


## Exercise catalog

The bundled Free Exercise DB snapshot includes 876 imported exercises plus the eight original app entries retained for existing plan/history IDs. Native startup seeds SQLite in a versioned transaction; the catalog is then read from SQLite. User state stays in its existing table and is never replaced by a catalog import. Web uses the same bundled catalog and localStorage for workout state.

Source, pinned commit and upstream license are in `data/free-exercise-db/`. Imported IDs are namespaced as `fedb:<upstream-id>`. Search covers names, muscle groups, detailed muscles and equipment. Library, workout picker and plan builder show 30 results at a time with a Show more control.

Twelve photos for six starter movements are bundled. Other photos use pinned GitHub image URLs and Expo Image's disk cache on native; browser caching follows browser policy. Cached downloads may be evicted by the OS. Instructions always work offline. Missing/failed photos display a fallback and retry control. These are still photos, not animations. Retained Romanian deadlift and reverse-lunge entries have no photos because the dataset did not provide an exact match for those starter variants.

To re-import this exact snapshot:

```sh
node scripts/import-catalog.cjs
```

To deliberately update, pass a full upstream commit SHA. Review changes and the license, revalidate bundled photos, and run tests before releasing. No upstream code is executed. The source is community-maintained and has not been professionally reviewed by this project.

