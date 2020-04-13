+++
title = "Pattern for Adding Svelte Components"
weight = 1
order = 1
date = 2020-04-11
insert_anchor_links = "right"
draft = true
[taxonomies]
categories = ["svelte"]
+++

I recently had the time to spend investing in creating a new personal website and wanted to figure out a way to easily create Svelte components that can be included as part of the site template and page contents. My previous experience with Svelte had been limited making full Svelte apps, so this was a good chance to figure out some patterns for including Svelte components on an existing site, in my case, one statically generated using Zola.

The basic template for a Svelte app project looks like this:

```text
├── public            // Compilation target directory containing template files
│   ├── facicon.png
│   ├── global.css    // Common styling to be applied to index.html
│   ├── index.html    // HTML template where body element is the target
├── src
│   ├── App.svelte    // Parent Svelte component
│   ├── main.js       // App.svelte instantiated as target for body of public/index.html
├── .gitignore
├── README.md
├── package.json
└── rollup.config.js  // Configuration and settings for Svelte compilation
```

Svelte components are a ... blah blah intro.

- pattern for integrating Svelte into an existing site that requires little boiler plate code
- bundle.js and bundle.css generated from Svelte are included in the header for the generated static pages.
- import the embeddable components in the main.js file and add the imported component to a list.
- query the dom, looking for id's matching "svelte-{component-name}", which will be the target of the component
- look for a data-cfg attribute on found elements, which will contain configuration data required to render the component. Additionally, the config json can contain an anchor, which will instruct Svelte to render (before or after) child DOM element
- Svelte component should export cfg variable.

- **name**: String that matches a defined Svelte component
- **cfg**: JSON containing any relevant configuration data needed for the component

The name value is included as part of the id tag for the created div element. The cfg value is included as a [data attribute](https://developer.mozilla.org/en-US/docs/Learn/HTML/Howto/Use_data_attributes) for the div element.

```html
<div id="svelte-{{name}}" data-cfg="{{cfg}}"></div>
```

The svelte application queries the DOM for elements with an id matching the pattern `svelte-{component}`, which will be the target DOM element of a component with the matching name.

To define a new component, import it in `svelte-components/main.js` and include it in the `containers` list.

```javascript
import Portrait from "./Portrait.svelte";

let containers = [Portrait];
```

Svelte components requiring any configuration data should define an exported variable `cfg`, which will receive the provided JSON data.

```html
<script>
  export let cfg;
  let src = cfg.image_url;
</script>
<style>
  img {
    /* Some styling for a rounded image */
    ...;
  }
</style>
<div>
  <img {src} alt="Portrait" />
</div>
```

For example, the shortcode:

```text
{{ svelte(name="portrait",cfg='{"image_url":"../portrait.png"}') }}
```

Generates the following static HTML:

```html
<div id="svelte-portrait" data-cfg='{"image_url":"./portrait.png"}'></div>
```

Which is rendered by Svelte as:

```html
<div class="svelte-jzojlj">
  <img src="./portrait.png" alt="Portrait" class="svelte-jzojlj" />
</div>
```
