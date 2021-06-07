# Oildrop

<img src="https://raw.githubusercontent.com/shinzlet/oildrop/media/oildrop-hero.png" alt="An image showing Oildrop in light and dark mode. Several scripts are listed in its overview panel.">

Oildrop is a userscript manager for Firefox. It was designed to be audited by anyone in less than
30 minutes, does not communicate with a server, and is easily modifiable to suit your needs.

## Features
- Sleek, modern interface
- Manage scripts and styles in one extension
- Dark and light theme
- Import / Export your scripts with JSON
- GPLv3 License
- Less than 600 lines of code (no golfing required)
- Easy to tweak to your needs
- Designed with accessibility in mind

## Installation
Oildrop can be installed via several means, the easiest of which is the
[Firefox Addon Store](https://addons.mozilla.org/en-CA/firefox/addon/oildrop/).

You can also download the latest signed release from GitHub, which is easier to
audit - this is what I'd reccommend doing. Unlike the first method, you will not
receive automatic updates. If you go this route, see
["How to Audit Oildrop"](#how-to-audit-oildrop).

If you want to modify Oildrop for your needs, instructions are available below for
[development](#development), [building, and self-signing](#building-and-signing) the
extension.

## How to Audit Oildrop
TODO

## Development
Oildrop is written in plain HTML and JavaScript, but uses sass to accelerate styling.
If you're tweaking Oildrop for personal use, you can edit the compiled CSS and ignore
the build process. However, if you want to contribute to or fork Oildrop, you'll want
to use the Sass pipeline. To do so, [install dart-sass](https://sass-lang.com/install),
then run `make watch`. This will automatically watch and compile your scss into the `css` folder.

To test the extension, you will need to have [`web-ext`
installed](https://extensionworkshop.com/documentation/develop/getting-started-with-web-ext/).
Then, invoke `make run` to open a development browser with Oildrop loaded.

## Building and Signing

## Limitations
- Oildrop only works in Firefox. Adding the neccessary polyfills to make it cross-platform would have easily doubled the codebase. That being said, porting it would not be a monumental challenge, and forks are welcomed.
- Oildrop's editor is good enough for quick scripting, but is not intended to replace your editor of choice. For complicated scripts, you should write code elsewhere and import it into Oildrop.
- Because it isn't needed for most tasks, the GreaseMonkey `GM_` API is not implemented in Oildrop. Increasing compatibility with other userscript managers is something I'd like to look into, however.

## Contributors
- [Seth Hinz](https://github.com/shinzlet), [sethhinz@me.com](mailto:sethhinz@me.com)
    + Concept, programming
- [Chiara Coangelo](https://dribbble.com/ChiaraColangelo), [chiara.coangelo@ninjabit.com](mailto:chiara.coangelo@ninjabit.com)
    + UI Designer

## Licensing
All of Oildrop's source code is licensed under GPLv3. Some of the fonts and
icons used are under different licenses.  Their respective licenses are stored
in the assets folder.
