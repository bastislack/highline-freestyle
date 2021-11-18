# About the app

This is a collection of most of the freestyle tricks, for people to keep a better overview of all the tricks.

The link to the page is: https://bastislack.github.io/highline-freestyle/ 

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
