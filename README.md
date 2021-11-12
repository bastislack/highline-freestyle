# about the app

This is a collection of all/most of the freestyle tricks, for people to keep a better overview of all the tricks.

> a production test version is hosted at https://higline-fs.dynv6.net at the moment (but not regularly updated)

## features

- predefinded tricks from the [google sheet](https://docs.google.com/spreadsheets/d/1amLK2b6BQkJ10I3LcbUe-D-wgQpHkcgoIrL10TPkHPo) **Feedback to tricks, on this sheet as a comment and not as an issue**
- tricks added by the user
- a random combo generator
- the possibility to mark tricks on how good you can do them

## future plans

- the possibility to share own tricks and combos with other people
- something which can help judging competitions

# get involved

help us out develop an awesome app!

## Bugs, suggestions, feedback

open an issue and describe what is is you want to see different

## Development

we don't always know what we really do, but we try to keep some order, through issues ...

### requirements:

- node
- npm

### setup

1. install node modules

   Open a terminal and in the root folder (highline-freestyle) run `npm install`

2. start the development server

   run `npm run dev`
 
3. run the production environment (needed to use features of the service worker -> offline usage)

   run `npm run serve`

sometimes after updating you have to delete your indexDB in your browser, through the development tools (__Storage__ in firefox, __Application__ in chrome)

### project structure

right now we are just working on the main branch, until we get to have a halfway working beta version (our first milestone)

after that we will develop on a separate branch and keep the main branch always working
