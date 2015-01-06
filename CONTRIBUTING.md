# Contributing

## Running the documentation site locally

**Requirements:**

* [ruby](https://www.ruby-lang.org/en/downloads/)
* [bundler](http://bundler.io/) (`gem install bundler`)
* [node](http://nodejs.org/)
* [grunt](http://gruntjs.com/) (`npm install -g grunt-cli`)

If you'd like to run the doc site locally, clone the github repository and cd into the project directory, then run `bundle install` and `npm install` to download and install local dependencies. From there you should be able to run `grunt docs:serve` to start a local preview server, `grunt docs:build` to build the site to static files, and `grunt docs:deploy` to deploy the built files to github pages. The `grunt build` command takes care of building files in the `dist` folder from source.

## Adding Custom Icons

Icons are included using an icon font. You can add icons to the framework by doing the following:

### Create your Icons

Icons that are a part of the icon font must be a one color svg with no strokes (only fills). It's best to design for a square format, as it will be treated as such in the font itself.

### Open the Existing Font on IcoMoon

IcoMoon is an in-browser app that allows you to package webfonts from svg files. If you go to [icomoon.io/app](http://icomoon.io/app/) and click "Import Icons" you can browse to the current icon font's json file. In the repository, the current icon font always lives at:

```
docs > source > assets > fonts > tailcoat > tailcoat.json
```

This will load all the current icons into icomoon as a project called 'tailcoat'.

### Import Your New Icons

Click on the hamburger/list icon to the far right of the project name. Inside the menu that opens select 'Import to Set'. Then browse to the icons you'd like to add and select individual .svg files.

### Export Font

Once you are finished, and all the icons are added, select the 'Select All' option in the same project menu you used above. That should add a yellow border around all the icons (including your new ones). Then click the 'Font' button at the very bottom of your screen.

At this point, write the classname you'd like to use for the new icons at the bottom. *Note: 'icon-' will be automatically added for you. After they have the right names, download the font.

### Add the Font to the Framework

Inside the downloaded folder, you'll see a file tree like the following:

```
|____fonts
| |____tailcoat.eot
| |____tailcoat.svg
| |____tailcoat.ttf
| |____tailcoat.woff
|____demo.html
|____Read Me.txt
|____selection.json
|____style.css
```

Replace the current fonts `docs/source/assets/fonts/tailcoat/` with the new fonts.

Then move `selection.json` to the same font folder and name it `tailcoat.json`.

Open `style.css` from the font download in your text editor of choice. Find the icon class of your new icon at the bottom, and add it to `sass/tailcoat/_icons.scss`.

Then move `selection.json` to the

That's it! Once your pull request is merged, the icon will be part of the repo.

### Document the New Icons

We use KSS to parse css documentation, so all of the documentation is inside the actual SASS files. To document the icon so other groups know it's there, find Section 7.1 of the documentation (line 86 in `sass/tailcoat/_icons.scss`) and add the icon class to the styleguide modifiers list with a short description of what the icon is.

If you are running the documentation site just restart the server and you should now see your icons in the list on the components page.

Once you're happy with your changes, open a pull request and we'll add it to the framework!

## Versioning

Tailcoat uses SemVer (Semantic Versioning) for its releases. This means that version numbers are basically formatted like `MAJOR.MINOR.PATCH`.

#### Major

Breaking changes are signified with a new **first** number. For example, moving from 1.0.0 to 2.0.0 implies breaking changes.

#### Minor

New components, new helper classes, or substantial visual changes to existing components and patterns are *minor releases*. These are signified by the second number changing. So from 1.1.2 to 1.2.0 there are minor changes.

#### Patches

The final number signifies patches such as fixing a pattern or component in a certain browser, or fixing an existing bug. Small changes to the documentation site and the tooling around the Tailcoat library are also considered patches.

## Building new Tailcoat releases

1. Bump the version in `package.json`. Make sure to use [semantic versioning](http://semver.org/) (MAJOR.MINOR.PATCH).
2. Run `grunt build` to build the latest distribution to the `dist` folder.
3. Commit changes and open a pull request to the master branch.
4. Once merged, click "Draft a new release" on the [releases page](https://github.com/ArcGIS/tailcoat/releases).
5. Run `grunt build` to build a new version of the files in `dist`
6. Tag and title your release, using the description to list what changed.
7. Run `grunt docs:build` and `grunt docs:deploy` to build the latest version of the documentation and deploy it to github pages.
