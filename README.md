[![Build Status](https://travis-ci.com/crcn/tandem.svg?token=36W5GEcyRPyiCuMVDHBJ&branch=master)](https://travis-ci.com/crcn/tandem)

Tandem is a hackable visual editor for web applications that is similar to what you'd find in apps such as [Sketch](https://www.sketchapp.com/), and [Photoshop](http://www.adobe.com/products/photoshop.html).

You can play with the current builds [here](https://www.dropbox.com/sh/k9eqwmksv0655ss/AABQyfP5xWf4nbynRm0-OxKJa?dl=0).. **Please note that Tandem is currently a *preview*. Expect bugs, and missing features.**. Aso be sure
to install the [Atom](https://atom.io/packages/atom-tandem-extension), or [VSCode](https://marketplace.visualstudio.com/items?itemName=tandemcode.tandem-vscode-extension) extensions for the best experience.

![syncing](https://cloud.githubusercontent.com/assets/757408/21443430/c412ff9a-c86a-11e6-9e36-71df05a94ea0.gif)

Tandem displays a *live preview* of your application that you can manipulate visually - this is possible by a custom browser VM that runs your application in the background. It's intended to work with *all* programming languages, and frameworks, so you should be able to start using it *immediately* with your existing codebase. As part of a litmus test for Tandem, it was actually used to build itself.

Tandem is code-first, and unoppinionated about how you structure your code. The application synchronizes changes with your text editor in realtime.

#### Motivation

TODO
<!--I've found that developing UI application feels a bit backwards, and I sought to develop tooling that was a bit more intuitive. There are already countless HTML editors on the web. However, most I've found to-->

#### Features

- Writes code in the languages you're using. Currently supported languages include `Sass`, `HTML`, and `CSS`.
- Changes in Tandem are sent to your text editor in real time.
- Tandem automatically reloads a preview of your application *

#### Roadmap

Short list of cool features that are in the pipeline for Tandem. Cast your vote with  👍 or 👎 for each of these ideas.

- [Support more browser rendering engines, and real devices (Chrome, Internet Explorer, Firefox, IPhone, etc. )](https://github.com/tandemcode/tandem/issues/386)
- [Webpack dependency graph strategy](https://github.com/tandemcode/tandem/issues/387)

# Development

To get started, run `npm install && WATCH=1 npm run build`. After that, go ahead and run `npm run code workspace.tandem` which will open Tandem *in* Tandem:

![screenshot 2016-12-22 15 48 03](https://cloud.githubusercontent.com/assets/757408/22388273/ce17a5e0-e4ad-11e6-9327-7d7ba3dc95bf.png)

After you've booted up Tandem in Tandem, open up the `src/**` directory and start hacking away.

#### CLI commands

Other CLI commands that may help with the dev process

```
# builds the source files in out/
npm run build;

# builds the distributable app in dist/zip/[app].zip
npm run build:dist

# runs the desktop application
npm run code;

# runs tests
npm test;
```

#### Directory structure

- `src/` - source files for main `Tandem` application, and packages
  - `@tandem/` - tandem packages (core modules & extensions)
   - `tandem-client/` - client library communicating with tandem app - used in vscode, and atom extensions.
   - `tandem-code/` - tandem desktop application sources
   - `webpack-tandem-jsx-loader/` - [Webpack](//webpack.js.org) JSX loader for Tandem


## Extending Tandem

