# About the app

This is a collection of most of the freestyle tricks, for people to keep a better overview of all the tricks.

The link to the page is: https://highline-freestyle.com


## Features

- Predefinded tricks from the [google sheet](https://docs.google.com/spreadsheets/d/1amLK2b6BQkJ10I3LcbUe-D-wgQpHkcgoIrL10TPkHPo) **Feedback to tricks, on this sheet as a comment and not as an issue**
- Tricks added by the user
- Random combo generator
- Possibility to mark tricks on how good you can do them


## Future plans

- ComboMaker to allow the user to save his own combo
- Possibility to share own tricks and combos with other people
- Integrate judging feature for competitions



# Get involved

Help us out develop an awesome app!


## Bugs, suggestions, feedback

Open an issue and describe what is you want to see different


## Development

We don't always know what we really do, but we try to keep some order, through issues ...

Checkout the [good first issue tag](https://github.com/bastislack/highline-freestyle/labels/good%20first%20issue), if you don't know where to start.


### Requirements:

- Node (v20.6.1)
- npm (v9.8.1)


### Setup

0. (Optional) If you are using [nvm](https://github.com/nvm-sh/nvm) and switch between Node versions regularly use the correct one by running

   `nvm use`

1. Install node modules

   Open a terminal and in the root folder (highline-freestyle) run `npm install`

2. Start the development server

   run `npm run dev`

3. Run the production environment (needed to use features of the service worker -> offline usage)

   run `npm run serve`

Sometimes after updating you have to delete your indexDB in your browser, through the development tools (__Storage__ in Firefox, __Application__ in Chrome).


### Tests

Tests are written with the jest package and can be run with `npm test`.


### Project structure

We are working on the develop branch and merging to main once we consider a milestone to be complete.


### i18n (internationalization)

At the time of writing we support two separate languages; English and Spanish. This is implemented using a package called Lingui.js which is [well documented](https://lingui.js.org/tutorials/react.html). It's really worth reading the documentation to understand everything that's possible (e.g. handling plurals). The basic flow for adding a new piece of translated text is:

1. Wrap the text in a `<Trans>` tag and give it a meaningful id, so `example to translate` becomes `<Trans id="example.somethingToTranslate">example to translate</Trans>`.
2. `npm run extract`.
3. Edit `src/locales/es/messages.po` and fill in the missing translation.
4. Reload the page.

The id helps to keep the translations organised where a general rule would be to have a categor (e.g. links or languages) followed by a full-stop and then something describing the text. This also helps to avoid having multiple translations with the same key.


#### Enums

So far the best way I'm aware of for providing translations for enums is to convert them to a javascript object and use `<Trans>` as mentioned above. See `src/links.js` for an example.


#### Why explicitly define ids for `Trans`

Lingui.js supports automatic id generation but in my experience this kind of behaviour is messy. An example is if the translated text is changed, Lingui.js has no way to know that the translation was changed and instead will keep the old one and add a new one.
