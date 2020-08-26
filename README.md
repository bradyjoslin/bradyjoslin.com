# Personal Site for Brady Joslin

This is a personal site for [bradyjoslin.com](https://bradyjoslin.com) built with the Rust-based static site generator [Zola](https://getzola.org) and hosted by [Cloudflare Workers](https://workers.dev). The template is a modified version of the [Even theme](https://github.com/getzola/even).

## Get started

Install the dependencies...

```bash
brew install zola
```

Then to run the site for local development:

```bash
zola serve
```

Navigate to [localhost:1111](http://localhost:1111). You should see your app running.

## Update content

Site content lives in the `content` directory, which is currently configured for blog content to go in the `/blog` subdirectory, which is marked as transparent in the `_index.md`, which allows the main blog news feed page to be served by the base directory instead of `/blog`. An "about" page is created separate from the blog content, and additional indpendent pages or sections could similarly be made.

## Building and running in production mode

To create an optimised version of the app running on Cloudflare Workers workers.dev subdomain:

```bash
zola build --base-url "{your workers.dev domain}"
```

Then to deploy to Cloudflare workers.dev:

```bash
wrangler publish
```

To publish to bradyjoslin.com

```bash
zola build
```

```bash
wrangler publish --env production
```

## Deploy with GitHub Action

Push to the master branch of this repo which will trigger a Github Action that publishes the site using [Wrangler Action](https://github.com/cloudflare/wrangler-action).
