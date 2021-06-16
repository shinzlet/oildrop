# Oildrop
Oildrop is a userscript manager for Firefox. It was designed to be audited by anyone in less than
30 minutes, does not communicate with a server, and can be easily modified to suit your needs.

## Table of Contents
- [Features](#features)
- [Screenshots](#screenshots)
- [Installation Instructions](#installation)
- [How to Audit Oildrop](#how-to-audit-oildrop)
- [Development Instructions](#development)
- [Limitations](#limitations)
- [Contributors](#contributors)
- [Licensing Info](#licensing)

## Features
- Sleek, modern interface
- Manage scripts and styles in one extension
- Dark and light theme
- Import / Export your scripts with JSON
- GPLv3 License
- Less than 600 lines of code (no golfing required)
- Easy to tweak to your needs
- Designed with accessibility in mind

## Screenshots
### Main UI
<img src="https://raw.githubusercontent.com/shinzlet/oildrop/media/oildrop-hero.png" alt="An image showing Oildrop in light and dark mode. Several scripts are listed in its overview panel.">
Oildrop is invoked via the browser icon by default. Shown here is the script overview in both light and dark mode, which can be toggled easily.

### Full-page View
<img src="https://raw.githubusercontent.com/shinzlet/oildrop/media/fullscreen_windows.png" alt="Oildrop's data management window and full-screen popup shown in a browser.">
Oildrop can be opened in a full page for ease-of-use if a popup is not desirable. Also shown is Oildrop's data management page, which allows you to import and export scripts.

### Editor and Settings Menu
<img src="https://raw.githubusercontent.com/shinzlet/oildrop/media/menu_demos.png" alt="A preview showing the editor and settings menu in oildrop.">
This preview shows a script being edited in Oildrop on the left, and the settings menu on the right.

## Installation
Oildrop can be installed via several means, the easiest of which is the
[Firefox Addon Store](https://addons.mozilla.org/en-CA/firefox/addon/oildrop/).

You can also [download the latest signed release from GitHub](https://github.com/shinzlet/oildrop/releases),
which is easier to audit. this is what I'd reccommend doing. Unlike the first
method, you will not receive automatic updates. If you go this route, see
["How to Audit Oildrop"](#how-to-audit-oildrop). Once you audit the release,
you can install it by typing `about:addons` in the address bar, clicking the
gear next to "Manage Your Extensions", and then selecting "Install Add-on From
File..." in the context menu. From there, navigate to the `.xpi` file you
downloaded, and click `Open`.

If you want to modify Oildrop for your needs, instructions are available below for
[development](#development), [building, and self-signing](#building-and-signing) the
extension.

## How to Audit Oildrop
Understanding how a peice of software functions can be daunting, and this section aims
to help guide you through Oildrop's internals.

To start, a little exposition. The `.xpi` file you downloaded in the releases
section is a compressed archive of Oildrop's source code which was signed by Mozilla.
In order to audit the code within, we'll first have to decompress that archive. You can
do this either by renaming it from `oildrop-xxx.xpi` to `oildrop-xxx.zip` (where `xxx`
is a version number), or by running `unzip oildrop-xxx.xpi -d oildrop` at the command
line.

Once you've done this, you'll see a carbon copy of this repository. The one difference
is the addition of a `META-INF` folder, which is what Mozilla added.

Now that you've opened up Oildrop, you can feel free to inspect any files you'd like.
The only executable code that Oildrop includes is in the `js` folder. Here's a rundown
of what you'll find there:

- `oildrop.js`: Contains helper functions that are used everywhere throughout Oildrop.
- `background.js`: Interfaces with Firefox's `userScripts` api, which is what actually injects your userscripts into websites.
- `ui.js`: Connects Oildrop's main user interface to the background script, which allows you to create, edit, and view your scripts.
- `code_editor.js`: Allows indenting and un-indenting in Oildrop's code editor.
- `manage.js`: Implements data management functions and connects them to the `Import / Export Data` page (accessible via Oildrop's settings).

Additionally, feel free to make sure that the HTML and CSS do not reference any remote
files. As far as I'm aware, HTML and CSS cannot be used maliciously when only local
assets are used, which is the case in Oildrop.

This should be enough help to get started, but I hope to make a full walkthrough
of the source code soon. If you have any questions, feel free to open an issue!

## Development
Oildrop is written in plain HTML and JavaScript, but uses sass to accelerate styling.
If you're tweaking Oildrop for personal use, you can edit the compiled CSS and ignore
the build process. However, if you want to contribute to or fork Oildrop, you'll want
to use the Sass pipeline. To do so, [install dart-sass](https://sass-lang.com/install),
then run `make watch`. This will automatically watch and compile your scss into the `css` folder.

To test the extension, you will need to have [`web-ext`
installed](https://extensionworkshop.com/documentation/develop/getting-started-with-web-ext/).
Then, invoke `make run` to open a development browser with Oildrop loaded.

### Building and Signing
Oildrop can be built and signed using the `web-ext` CLI. For documentation about this process,
see https://extensionworkshop.com/documentation/develop/getting-started-with-web-ext/.

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
