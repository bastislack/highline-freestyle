# About

This Markdown defines notes that came up during the Migration.
They should be resolved during or after the migration and deleted afterwards.

## Localization

I have disabled localization for now as there were issues with Babel. Could look into it after the Migration and re-enable.
Another question is as to if an i18n-Provider is even needed with the very low usage of translated texts.

Another question I have is what benefits lingui has to offer. Is there any reason it is being used to the (more common) i18next?

## Routing

react-router added "Data Routers" in v6+.
It would be beneficial to switch a data router in the future.

Data Routers provide the same functionality as the SSR Rendering Framework "Remix" by the same developers. You get nested routes with an isolated data flow. I could go into greater detail about this in a GH Issue.

## Dependencies

Some dependencies are out of data.

### Material UI

`Fab` from `@material-ui/core` comes to mind here. It looks like `@material-ui/core` got renamed to `@mui/material`, but now also depends on the emotion Styling Cache.

Is the FAB from MUI _really_ needed? I don't see much merit in using it as the FAB is the only time it is used.

## Database

The only significant change I did during the Migration was to extract Migrations into a separate Module and also change from Papaparse importing from a JS-Module to using the virtual module provided by a new Vite Plugin.

The Database needs other changes, which I have chosen to not add for now. The PR will be bloated enough already.
