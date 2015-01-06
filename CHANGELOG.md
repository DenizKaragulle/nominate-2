# Tailcoat Changelog

## v1.2.0

- bumped compass gem dependency to v1
- removed unescaped multiline string in `_config.scss` (deprecated in Sass)

## v1.1.10

#### Additions
- `icon-cart` for a cart icon
- `btn-clear` can be used for the clear button style if you don't want the button to recieve the clearfix.

## v1.1.9

#### Additions
- `icon-copy` for a copy-to-clipboard icon

#### Fixes
- clear buttons have sensible disabled state.

## v1.1.8

#### Additions
- `icon-heart-outline` for an outline-only heart icon
- `icon-download` for a more explicit 'download' icon
- `icon-browser` for a 'window' icon with no cursor

#### Fixes
- better instructions for contributing to icon font

## v1.1.7
#### Fixes
- fix backward compatabillity bug.

## v1.1.6

#### Fixes
- fix visual bug for accordians with paragraphs inside
- fix cascade order so `square` classes apply to buttons and inputs
- always expose Tailcoat.js globally

## v1.1.5
- fix tab event target bug in tailcoat.js

## v1.1.4

#### Additions
- `icon-fork` for the GitHub "fork" icon

#### Style Changes
- GitHub icon now uses the more current octocat

#### Fixes
- Fix bug with using Tailcoat as a Compass extension
- `content-area` class now uses Rems with a Pixel fallback.
- nesting ordered lists in unordered lists no longer gives list numbered blue background.
- Fix clickdropdown in IE 8

#### New Modifier Classes
- `overflow-ellipsis` truncates text to ellipsis
- `square-*` Squares out the round border radius on elements.
  - `square-left`
  - `square-right`
  - `square-top`
  - `square-bottom`
  - `square-left-top`
  - `square-left-bottom`
  - `square-right-top`
  - `square-right-bottom`

## v1.1.3

#### New Modifier Classes
- `full-width` class for breadcrumbs

#### Style Changes
- Breadcrumbs now look cleaner and more subtle

#### Fixes
- Fix blue tables with multiple header rows

## v1.1.2

#### Style Changes
- Accordian now looks more like sidebar navigation

## v1.1.1

#### Fixes
- Fix `site-search` pattern in ie9

## v1.1.0

#### Fixes
- Improvements to placeholder text
- Fix 150% Zoom Bug for responsive show/hide classes
- Hides tooltips on touch devices

#### Additions
- Pagination component.
- Placeholder shim in tailcoat.js to support placeholders in older browsers (<= IE9).
- Add suport for a search field inside the drawer (mobile search)
- `T.init()` function to startup tailcoat.js
- Add `search-bar` component for search pages
- Add `search-filters` area for search pages
- Add `site-search` pattern
- Add `click-dropdown` javascript component

#### New Modifier Classes
- Add `show-visited-links` class to make visited links purple

#### Removals
- Removed outdated `examples` folder

### Style Changes
- Differentiate between site-dropdown active and site-dropdown hover
- Placeholder text is no longer italic

### Structural Changes
- Moved all assets in `dist` to a `tailcoat` folder to allow easier drop-in installation when using static assets
- new dist directory structure:
```
tailcoat
└── fonts
    └── tailcoat
└── images
    └── tailcoat
├── javascripts
└── stylesheets
```
- compass plugin expects fonts to be in a `tailcoat` folder inside of `fonts_dir`
- compass plugin expects images to be in a `tailcoat` folder inside of `images_dir`

## v1.0.0
- Change project name to Tailcoat

#### Fixes
- Handle long tab names more gracefully
- Handle long subnav names more gracefully
- Fix bugs with inputs
- Remove `white-space: no-wrap` from framework
- Fix default lineheight in `<h3>` and `<h4>`

#### Additions
- Added a comprehensive tailcoat.js for all javascript
- Right-to-left helper mixins
- Full ie8 support
- `leader` and `trailer` classes
- `padding-leader` and `padding-trailer` static classes
- Responsive `leader` and `trailer` classes
- Responsive `padding-leader` and `padding-trailer` classes
- Responsive 'pre' and 'post' classes
- Responsive `column-width` classes
- Responsive right and left classes
- `content-area` class for long-form content
- Accordian pattern
- Button Groups
- Block Groups (for quick gridded layouts)
- Responsive navigation bar pattern with javascript
- `la-point` icon
- `loader` spinner component for loading screens (all css)
- Numbered list styles for `<ol>` elements in `content-area`

#### Style Changes
- Small changes to look of site-dropdown
- Navigation-bar pattern now uses tabs instead of carets for active status
- New navigation-bar graphics
- Updated and improved dropdown styles
- Updated sidebar navigation styles
- Tables have headers, borders, but no stripes by default

#### New Modifier Classes
- 'compact' panel class for less padding
- `compact` modifier for less padding on lists
- 'inline' header class for non-block headers
- 'clear' button class for just an outline
- 'clear.white' and 'clear.gray' buttons
- 'no-color' for non-blue links
- `center-text`, `white-text` modifiers for all text
- `light` option for headers
- `vertical-center` class for features
- `full` mixin for fullscreen components
- `animate` class for tooltips
- `.align-right` modifier for dropdowns
- `no-space-to-footer` class to clear footer's margin-top
- `green-text` and `red-text` helper classes
- `error` class for text-areas and selects
- `plain` class for tables sans formatting
- `striped` class for striped tables
- `align-top` for vertically aligning table cell content to top
- `numbered` for ordered lists

#### Project Organization
- `arcgis/base` replaced by `tailcoat/imports` for sass helpers
- Added every weight of avenir to project example
- Configurable legacy support for older browsers
- Development Styleguides for html, js, and css
- Images are now in a `tailcoat/` directory
- Added a comprehensive tailcoat.js for all javascript

####Breaking Changes####
- Removed extra table classes
- Removed "hierarchical" button classes (use just colors instead)
- revamped responsive grids and show/hide classes
- less specificity in framework (remove IDs and `!important` rules)
- No IDs in layout, use classes instead
- Must add a `site-nav` class to the main navigation
- Removed `%full-width` SASS class
- Removed `%callout` SASS class
- Removed `%banner` SASS class
- Removed `%form-in-panel` SASS class
- Removed `size()` SASS mixin
- Removed `square()` SASS mixin
- Removed `full()` mixin, now an extendable class `%full`
- Removed `visuallyhidden()` mixin, now an extendable class spelled `%visually-hidden`
- Changed `.accordion section` to `.accordion .accordion-section` to avoid overly generic CSS rules
- Renamed `.toggle` (for drawer toggle) to `.drawer-toggle`
- Renamed `.logo-wrap` to `.site-brand`
- `.site-dropdown` must be inside `.site-brand`
- Renamed `.down-arrow` (for `.site-dropdown`) to `.site-dropdown-toggle`
- Changed tab classes (`.tabs` -> `.tab-group`, `.tabs nav` -> `.tab-group .tab-nav`, `.contents` -> `.tab-contents`, `.content` -> `.tab-content`)
- Rewrote modal javascript pattern
- Reworked some drawer javascript component logic (`id="drawer"` no longer necessary)
- banner.jpg and banner-green.jpg are now called navigation-bar-background.jpg and navigation-bar-background-green.jpg
- Footer now requires `sticky-footer` modifier class to be sticky
- Bulleted list is an option, not the default
- Headers are now a lighter font weight
- New 'no-nav' class for navigation bars without navs


## Early Releases (under [ArcGIS/arcgis-for-developers-css](http://github.com/ArcGIS/arcgis-for-developers-css))

### v0.1.6
- Added several icons
- Added a tabs component
- Cleaned up inputs
- Cleaned up corder-radius
- Added a loading class for buttons
- More eloquently handle long titles in navigation bar
- Fix typo for Segoe UI font-family reference

### v0.1.5
- Added $container-min variable for non-responsive layouts
- Renamed calcite color variables
- Added a drop down pattern
- Added new icons for Map, Video, and Stopwatch
- Added Print Styles
- Added Modal Pattern
- Added Dropdown as a Component

### v0.1.4.beta
- Fixed icons inside of buttons
- Reduced rounding on .panel class
- Fixes to horizontal <dl>
- Tooltips now display below by default

### v0.1.3.beta
- Added minified versions of static assets (js and css)
- Improved spacing of form elements
- Fixed sprockets error
- Added several new icons

### v0.1.2.beta
- Fix rows with single column
- Fix form elements with margin and padding
- Improvements to static css file size

### v0.1.1.beta
- Reduce size of header navigation and navigation bar patterns
- Add table helpers
- Fix issue with $white variable

### v0.1.0.beta
- Initial Release
