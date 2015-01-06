# Getting Started

Tailcoat is a CSS framework and styleguide meant to empower front end developers to rapidly build web applications and websites for ArcGIS products and prototypes. The framework is built on top [SASS](http://sass-lang.com/) and [Compass](http://compass-style.org/), but can also be used as plain CSS. Tailcoat includes a comprehensive grid system, typographic standards, a large color pallette of Esri brand colors, and a complete set of components and patterns.

<h2 id="precompiled-css">Using Tailcoat CSS</h2>

The files in the `css` folder are ready to use in your projects as is. With the css files in your project, you can use any of the classes provided in your markup.

### Hosting Assets

Tailcoat has some fonts, images, and scripts that are needed for everything to work just right. All of these are available in the [`dist`]((https://github.com/ArcGIS/tailcoat)) folder on Github. Ideally you can drop the entire `tailcoat` folder from there into your site's assets folder, then add the necessary `<link>` and `<script>` tags like so:

```html
<head>
  ...
  <link href="{/path/to}/tailcoat/stylesheets/tailcoat.min.css" type="text/css" rel="stylesheet">
  <!-- your styles -->
</head>
<body>
  ...
  <script src="{/path/to}/tailcoat/javascripts/tailcoat.min.js" type="text/javascript"></script>
  <!-- your scripts -->
</body>
```

<h2 id="sass-and-compass">Tailcoat with SASS and Compass</h2>

Using the Tailcoat framework as a Compass plugin allows you to take advantage of configurable options, mixins for responsive design, and smaller final file sizes - along with conditional stylesheets for Internet Explorer.

To add Tailcoat to a Compass project, add the following line to your Gemfile and run `bundle install` from the command line.

```ruby
gem "tailcoat", :git => "git@github.com:ArcGIS/tailcoat.git", :tag => "{LATEST_VERSION}"
```

Add the following to your Compass `config.rb` file:

```ruby
require "tailcoat"
```

And finally, import the framework into a `.scss` file:

```css
@import "tailcoat";
```

You will now have access to the full gamut of mixins and classes to build your own custom experiences based on Tailcoat.

Please note that Compass requires a configuration file and already has some default paths that may need to be overridden. See the [Compass Configuration Reference](http://compass-style.org/help/tutorials/configuration-reference/) to learn more.

### Hosting Assets

You should host the images in a `tailcoat` folder in the Compass `images_dir` and the fonts in a `tailcoat` folder in the Compass `fonts_dir`, both defined in your compass config file. For this documentation site, it's structured like this:

```
assets/
├── fonts/
│   └── tailcoat/
│       └── (all tailcoat fonts)
├── images/
│   └── tailcoat/
│       └── (all tailcoat images)
└── javascripts/
    └── tailcoat.js
```

And inside the compass `config.rb` file:

```rb
set :images_dir, "assets/images"
set :fonts_dir, "assets/fonts"
```

<h2 id="browsers">Browser Compatibility</h2>

Because this framework makes use of the pseudo selectors and HTML 5 elements, IE8 requires the addition of [modernizr](http://modernizr.com/) or [html5 shiv](https://code.google.com/p/html5shiv/) to work properly. In addition to one of these, it is recommended you use [selectivizr](http://selectivizr.com/) in older browsers as well to ensure that pseudo selectors will work.

Adding these libraries for specific browsers is simple. Download the libraries and in your `head` just add the following:

```html
<!--[if lt IE 9]>
  <script src="/js/selectivizr.js" type="text/javascript"></script>
  <script src="/js/html5shiv.js" type="text/javascript"></script>
<![endif]-->
```

Tailcoat does not support versions of Internet Explorer lower than 8. Internet Explorer 7 and below don't support media queries or the `box-sizing: border-box;` css property, preventing them from displaying columns and responsive design correctly.
