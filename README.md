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

### Requirements:

- node
- npm

### Setup

1. install node modules

   Open a terminal and in the root folder (highline-freestyle) run `npm install`

2. start the development server

   run `npm run dev`

3. run the production environment (needed to use features of the service worker -> offline usage)

   run `npm run serve`

sometimes after updating you have to delete your indexDB in your browser, through the development tools (__Storage__ in firefox, __Application__ in chrome)

### Project structure

right now we are just working on the main branch, until we get to have a halfway working beta version (our first milestone)

after that we will develop on a separate branch and keep the main branch always working

### i18n (internationalization)

At the time of writing we support two separate languages; English and Spanish. This is implemented using a package called Lingui.js which is [well documented](https://lingui.js.org/tutorials/react.html). It's really worth reading the documentation to understand everything that's possible (e.g. handling plurals). The basic flow for adding a new piece of translated text is:

1. Wrap the text in a `<Trans>` tag and give it a meaningful id, so `example to translate` becomes `<Trans id="example.somethingToTranslate">example to translate</Trans>`.
2. `npm run extract`.
3. Edit `src/locales/es/messages.po` and fill in the missing translation.
4. Reload the page.

The id helps to keep the translations organised where a general rule would be to have a categor (e.g. links or languages) followed by a full-stop and then something describing the text. This also helps to avoid having multiple translations with the same key.

#### Common translations

Sometimes the same translation will be used in multiple places. If they are common globally then they should be placed in `src/services/commonTranslations.js` otherwise they can be placed in the relevant file. In either case common translations must be defined with `defineMessage`. See [Defining a message before using it](#defining-a-message-before-using-it) for an example.

#### Enums

So far the best way I'm aware of for providing translations for enums is to convert them to a javascript object and use `<Trans>` as mentioned in [Defining a message before using it](#defining-a-message-before-using-it).

#### `<option>` tags

There is a [known bug](https://github.com/lingui/js-lingui/issues/655#issuecomment-621637390) where `<Trans>` (and any react component actually) cannot be used inside an `<option>` tag. The workaround is to directly use i18n and pre-define the message as follows:

```javascript
import { defineMessage } from '@lingui/macro';
import { i18n } from '@lingui/core';

const Example = () => {
  const someMessage = defineMessage({ id: "theDesiredMessageId", message: "The desired message" });

  return <select>
    <option value={0} key="0">{i18n._(someMessage)}</option>
  </select>;
}
```

#### Defining a message before using it

```javascript
import { Trans, defineMessage } from '@lingui/macro';
import { i18n } from '@lingui/core';

const Example = () => {
  const someMessage = defineMessage({ id: "theDesiredMessageId", message: "The desired message" });

  // Use this form if you _need_ a String e.g. for the value of a setState call
  // or for some data that is being stored.
  const someMessageString = i18n._(someMessage);

  // Where possible use this for as it handles changing the value automatically
  // when the locale changes.
  return <Trans id={someMessage.id} />;
}
```

#### Why explicitly define ids for `Trans`

Lingui.js supports automatic id generation but in my experience this kind of behaviour is messy. An example is if the translated text is changed, Lingui.js has no way to know that the translation was changed and instead will keep the old one and add a new one.
