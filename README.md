# Personal Site for Brady Joslin

This is a personal site for [bradyjoslin.com](https://bradyjoslin.com) built with the Rust-based static site generator [Zola](https://getzola.org), enhanced with [Svelte](https://svelte.dev) components, and hosted by [Cloudflare Workers](https://workers.dev). The template is a modified version of the [Even theme](https://github.com/getzola/even).

## Get started

Install the dependencies...

```bash
brew install zola
cd svelte-components
npm install
```

Then to run the site for local development:

```bash
./dev.sh
```

This will run two processes, `zola serve` which listens on the relevant zola directories for changes and rebuilds the site, while also running `npm run dev` in the svelte-components directory, that monitors for updates to the Svelte components and recompiles them. Svelte components are compiled to bundle.css and bundle.js files, which are outputted to Zola's static directory, which is one of the directories monitored by `zola serve`. This setup also gives you the full benefits of live reloading with both the zola native bits along with the Svelte components.

Navigate to [localhost:1111](http://localhost:1111). You should see your app running.

Control-C exits zola and another control-c exits the svelte process.

## Update content

Site content lives in the `content` directory, which is currently configured for blog content to go in the `/blog` subdirectory, which is marked as transparent in the `_index.md`, which allows the main blog news feed page to be served by the base directory instead of `/blog`. An "about" page is created separate from the blog content, and additional indpendent pages or sections could similarly be made.

## Svelte components

Svelte components are leveraged as part of the rendered template and can also be included within content of pages and blog posts using the available `svelte` [shortcode](https://www.getzola.org/documentation/content/shortcodes/), which takes a component name and configuration data as arguments, where:

- **name**: String that matches a defined Svelte component
- **cfg**: JSON containing any relevant configuration data needed for the component

Example use from with markdown or HTML:

```txt
{{ svelte(name="portrait",cfg='{"image_url":"../portrait.png"}') }}
```

The shortcode snippet is replaced at build time by a div element defined within `templates/shortcodes/svelte.html`. The name value is included as part of the id tag for the created div element. The cfg value is included as a [data attribute](https://developer.mozilla.org/en-US/docs/Learn/HTML/Howto/Use_data_attributes) for the div element.

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

## Building and running in production mode

To create an optimised version of the app:

```bash
./build.sh
```

Which buids the Svelte components and builds the site for production release.

## Deploying to Cloudflare Workers

To preview:

```bash
wrangler preview --watch
```

To publish to workers.dev:

```bash
wrangler publish
```

To publish to bradyjoslin.com

```bash
wrangler publish --env production
```

[TO-DO] Deploy with GitHub Action

Push to the master branch of this repo which will trigger a Github Action to publish using [Wrangler Action](https://github.com/cloudflare/wrangler-action).

Need to work through doing Zola build as part of a GitHub action.
