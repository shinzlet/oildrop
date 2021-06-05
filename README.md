# Oildrop

<img src="https://raw.githubusercontent.com/shinzlet/oildrop/media/oildrop-hero.png" alt="An image showing Oildrop in light and dark mode. Several scripts are listed in its overview panel.">

Oildrop is a userscript manager designed to be audited by anyone in less than 30 minutes.
It uses around 500 lines of JavaScript (excluding comments), does not communicate
with a server, and is easily modifiable to suit your needs.

## Features
- Sleek, modern interface
- Manage scripts and styles in one extension
- Dark and light theme
- Import / Export your scripts with JSON
- GPLv3 License
- Only 500 lines of code
- Easy to tweak to your needs

## Limitations
- Oildrop is not bundled with a fully-fledged code editor. For complicated scripts, using your editor of choice is reccommended.
- 

## Development
Oildrop is written in plain HTML and JavaScript, but uses sass to accelerate styling.
In order to work on Oildrop, ensure you've installed dart-sass, then run `make watch`.
This will automatically watch and compile your scss into the `css` folder.

To test the extension, you should have `web-ext` installed. Then, you can run `make run`
to open a development browser with Oildrop loaded.

TODO: Add instructions for building / signing

## Contributors
- [Seth Hinz](https://github.com/shinzlet), [sethhinz@me.com](mailto:sethhinz@me.com)
    + Concept, programming
- [Chiara Coangelo](https://dribbble.com/ChiaraColangelo), [chiara.coangelo@ninjabit.com](mailto:chiara.coangelo@ninjabit.com)
    + UI Designer

## Licensing
All of Oildrop's source code is licensed under GPLv3. Some of the fonts and
icons used are under different licenses.  Their respective licenses are stored
in the assets folder.
