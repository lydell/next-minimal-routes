# next-minimal-routes [![Build Status][travis-badge]][travis-link] [![minified size][bundlephobia-badge]][bundlephobia-link]

[Next.js] dynamic URLs for the minimalist.

- ✔️ Routes are represented as plain objects.
- ✔️ [path-to-regexp] patterns.
- ✔️ Use the standard Next.js `<Link>` and `Router`.
- ✔️ Well tested.

Inspired by [next-routes] and [nextjs-dynamic-routes].

## Contents

<!-- prettier-ignore-start -->
<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->


- [Installation](#installation)
- [Example](#example)
- [Reference](#reference)
  - [`Route`](#route)
  - [`QueryObject`](#queryobject)
    - [For query parameters](#for-query-parameters)
    - [For URL parameters](#for-url-parameters)
  - [`makeRoute({ page, pattern = page, ...rest }): Route`](#makeroute-page-pattern--page-rest--route)
  - [`makeUrls({ route, params = {}, query = {}, hash = "" }): { href, as }`](#makeurls-route-params---query---hash-----href-as-)
  - [`matchRoute(routes, pathname): { route, params } | undefined`](#matchrouteroutes-pathname--route-params---undefined)
  - [`getRequestHandler({ app, routes }): Function`](#getrequesthandler-app-routes--function)
- [Development](#development)
  - [npm scripts](#npm-scripts)
  - [Directories](#directories)
- [License](#license)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->
<!-- prettier-ignore-end -->

## Installation

```
npm install next-minimal-routes
```

```js
import { makeRoute, makeUrls, matchRoute } from "next-minimal-routes";
```

```js
const { getRequestHandler } = require("next-minimal-routes/server");
```

## Example

Define your routes somewhere where both your server and your Next.js app can
access them. For example, in `routes.js` next to `pages/`. Routes are just plain
objects. `makeRoute` helps you create them.

```js
// routes.js
const { makeRoute } = require("next-minimal-routes");

module.exports = {
  home: makeRoute({ page: "/" }),
  about: makeRoute({ page: "/about" }),
  product: makeRoute({ page: "/product", pattern: "/product/:slug" }),
};
```

In your server, use `getRequestHandler` to route requests to the correct page.
(This example uses [Express], but you don’t have to.)

```js
const express = require("express");
const next = require("next");

// New imports:
const { getRequestHandler } = require("next-minimal-routes/server");
const routes = require("../routes");

const port = parseInt(process.env.PORT, 10) || 3000;
const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });

// Use this instead of the usual `app.getRequestHandler()`.
const handle = getRequestHandler({ app, routes: Object.values(routes) });

app.prepare().then(() => {
  const server = express();

  server.get("*", handle);

  server.listen(port, err => {
    if (err) {
      throw err;
    }
    console.log(`> Ready on http://localhost:${port}`);
  });
});
```

In your Next.js app, use `makeUrls` whenever you use Next.js functions that need
`href` and `as`.

```js
// pages/index.js
import Link from "next/link";
import Router from "next/router";
import { makeUrls } from "next-minimal-routes";
import routes from "../routes";

export default () => (
  <div>
    <h1>Home</h1>

    <Link {...makeUrls({ route: routes.about })}>
      <a>About</a>
    </Link>

    <Link {...makeUrls({ route: routes.product, params: { slug: "hammer" } })}>
      <a>Product: Hammer</a>
    </Link>

    <button
      type="button"
      onClick={() => {
        const { href, as } = makeUrls({
          route: routes.product,
          params: { slug: "nails" },
        });
        Router.replace(href, as);
      }}
    >
      Product: Nails
    </button>
  </div>
);
```

Optionally, make your own `<Link>` component, wrapping `next/link`, for
convenience. I usually do that anyway (for example, I might want `passHref` to
default to `true`, or automatically add `/en/` etc. on a multi-language site).
For inspiration, there are three examples in [components/Link.js].

The URL parameters are available in the `query` object given to
`getInitialProps`:

```js
export default class Product extends React.Component {
  static propTypes = {
    slug: PropTypes.string.isRequired,
  };

  static getInitialProps({ query: { slug } }) {
    return {
      slug,
    };
  }

  render() {
    const { slug } = this.props;

    return (
      <div>
        <h1>Product: {slug}</h1>
      </div>
    );
  }
}
```

**Note:** Since URL parameters are merged into `query`, you can’t have URL
parameters and query parameters with the same name. URL parameters always take
precedence over query parameters, overwriting any query parameters with the same
names. This is due to how Next.js is designed. Rename your parameters if you run
into conflicts.

Finally, don’t forget to turn off [file system routing]:

```js
// next.config.js
module.exports = {
  useFileSystemPublicRoutes: false,
};
```

For a full example, see `routes.js`, `server/`, `pages/`, `components/` in this
repo. To run that example, clone this repo and run:

```
npm ci
npm run next:dev
```

## Reference

First off, there are two important types of objects:

- [Route]
- [QueryObject]

With those out of the way, this are the actual exported functions:

- [makeRoute]
- [makeUrls]
- [matchRoute]
- [getRequestHandler]

### `Route`

A `Route` is a plain object with a few required keys:

```js
type Route = {
  page: string,
  pattern: string,
  match: string => QueryObject | undefined,
  reverse: QueryObject => string, // Can throw errors.
  ...rest,
};
```

| Key       | Type                                                | Description                                                                                                                                                                            |
| --------- | --------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| page      | `string`                                            | The path to the page in `pages` that should be used for the route. Must start with a `/`.                                                                                              |
| pattern   | `string`                                            | The URL to the page (will be shown in the address bar). Can contain URL parameters. See [path-to-regexp] for pattern syntax. Must start with a `/`.                                    |
| match     | <code>string => QueryObject &vert; undefined</code> | A function that matches the pathname part of a URL (starting with a `/`) against `pattern`. If it matches, the URL parameters (if any) of the URL are returned, otherwise `undefined`. |
| reverse   | `QueryObject => string`                             | A function that replaces all URL parameters in `pattern` (if any) with values from the given object. May throw an error if the given parameters are invalid for the `pattern`.         |
| `...rest` | `any`                                               | Apart from the above keys you may attach any information you like to your routes. For example, sitemap data.                                                                           |

### `QueryObject`

The `query` object that Next.js gives you in `getInitialProps` is a
`QueryObject`. You can pass `QueryObject`s to the `href` and `as` parameters of
Next.js’ [`<Link>`](`next/link`) as well as to many [Router] methods
(`next/router`). next-minimal-routes also uses `QueryObject` for objects of URL
parameters.

```js
type QueryObject = {
  [key: string]: string | Array<string> | undefined,
};
```

#### For query parameters

The keys can be anything, since the user can type any query parameters they like
into the address bar.

The values vary:

| Type            | Situation                                                   |
| --------------- | ----------------------------------------------------------- |
| `string`        | A query parameter is supplied once. `?foo=1`                |
| `Array<string>` | A query parameter is supplied several times. `?foo=1&foo=2` |
| `undefined`     | A query parameter is not supplied at all.                   |

#### For URL parameters

The keys can only be the names specified in the `Route` pattern.

The values vary:

| Type            | Situation                                  |
| --------------- | ------------------------------------------ |
| `string`        | For regular, required parameters. `:foo`   |
| `Array<string>` | For repeating parameters. `:foo*`, `:foo+` |
| `undefined`     | For optional parameters. `:foo?`, `:foo*`  |

### `makeRoute({ page, pattern = page, ...rest }): Route`

Routes are just plain objects – see [Route]. You can make them yourself if you
like. `makeRoute` helps you do so:

- It validates that `page` is present.
- It defaults `pattern` to `page`. `makeRoute({ page: "/about" })` and
  `makeRoute({ page: "/about", pattern: "/about" })` are equivalent.
- It makes the `match` and `reverse` functions out of `pattern`.

`makeRoute` takes one argument which is an object:

| Key       | Type     | Default      | Description                                        |
| --------- | -------- | ------------ | -------------------------------------------------- |
| page      | `string` | **Required** | Path to a page in `pages/`. Must start with a `/`. |
| pattern   | `string` | `page`       | [path-to-regexp] URL pattern for the page.         |
| `...rest` | any      | `{}`         | Any extra keys are passed along.                   |

Returns a [Route].

### `makeUrls({ route, params = {}, query = {}, hash = "" }): { href, as }`

Next.js’ [`<Link>`] component (`next/link`) as well as many [Router] functions
(`next/router`) take `href` and `as` parameters. `makeUrls` makes those for you.

Given a route (`route`) and URL params for it (`params`, if any), as well as
optional query parameters (`query`) and an optional fragment identifier
(`hash`), `makeUrls` returns `href` and `as` objects to be used with `<Link>`,
`Router.push` and others.

`makeUrls` takes a single argument which is an object:

| Key    | Type          | Default      | Description                 |
| ------ | ------------- | ------------ | --------------------------- |
| route  | [Route]       | **Required** | The route to make URLs for. |
| params | [QueryObject] | `{}`         | URL parameters.             |
| query  | [QueryObject] | `{}`         | Query parameters.           |
| hash   | `string`      | `""`         | Fragment identifier.        |

The return value looks like this:

```js
type Urls = {
  href: {
    pathname: string,
    query: QueryObject,
  },
  as: {
    pathname: string,
    query: QueryObject,
    hash: string,
  },
};
```

The easiest way to see exactly what this function does is to look at its source
code:

```js
export function makeUrls({ route, params = {}, query = {}, hash = "" }) {
  return {
    href: {
      pathname: route.page,
      query: {
        ...query,
        ...params,
      },
    },
    as: {
      pathname: route.reverse(params),
      query,
      hash,
    },
  };
}
```

### `matchRoute(routes, pathname): { route, params } | undefined`

Given an array of [Route] objects and pathname part of a URL (starting with a
`/`), `matchRoute` returns the first route (if any) that matches the pathname.

Note that in Node.js you typically need to run `decodeURIComponent` on
`pathname` before trying to match on it or extract URL parameters from it.

[getRequestHandler] uses `matchRoute` behind the scenes, so usually you won’t
need this function. But if you need to manually match something in the browser
some time, `matchRoute` can be handy.

| Parameter | Type           | Description            |
| --------- | -------------- | ---------------------- |
| routes    | `Array<Route>` | Routes to match.       |
| pathname  | `string`       | Path to match against. |

Not only the matching route is returned, but also any URL parameters:

```
type ReturnValue = {
  route: Route,
  params: QueryObject,
}
```

### `getRequestHandler({ app, routes }): Function`

When using a [custom server in Next.js][nextjs-server], these two lines are
crucial:

```js
const app = next({ dev });
const handle = app.getRequestHandler();
```

`getRequestHandler` is a subsititute for the second line.

```js
const handle = getRequestHandler({ app, routes });
```

Note that you need to import `getRequestHandler` from
`"next-minimal-routes/server"` (rather than just `"next-minimal-routes"`).

`getRequestHandler` takes a single argument which is an object:

| Key    | Type           |
| ------ | -------------- |
| app    | Next.js app    |
| routes | `Array<Route>` |

Returns a typical Node.js `(req, res) => {}` request handler function.

## Development

You need [Node.js] 10 and npm 6.

### npm scripts

- `npm run next`: Start the standard [Next.js] dev server, for comparison. It
  can also be used to run arbitrary `next` commands, such as
  `npm run next -- export`. Run `npm run build` first.
- `npm run next:build`: Make a [Next.js] production build.
- `npm run next:dev`: Start the [Express]/[Next.js] example custom server in
  development mode.
- `npm run next:prod`: Start the [Express]/[Next.js] example custom server in
  production mode. Run `npm run build` and `npm run next:build` first.
- `npm run watch`: Start [Jest] in watch mode.
- `npm run eslint`: Run [ESLint] \(including [Prettier]).
- `npm run eslint:fix`: Autofix [ESLint] errors.
- `npm run prettier`: Run [Prettier] for files other than JS.
- `npm run doctoc`: Run [doctoc] on README.md.
- `npm run jest`: Run unit tests.
- `npm run coverage`: Run unit tests with code coverage.
- `npm run build`: Compile with [Babel].
- `npm test`: Check that everything works.
- `npm publish`: Publish to [npm], but only if `npm test` passes.

Servers are run at <http://localhost:3000>.

### Directories

- `src/`: Source code.
- `test/`: Tests.
- `dist/`: Compiled code, built by `npm run build`. This is what is published in
  the npm package.
- `pages/`, `components/`, `server/` and `routes.js`: [Express]/[Next.js]
  example app.
- `stub/`: An empty next-minimal-routes package to fool ESLint and Next.js
  packages check, and to require `next-minimal-routes/server` in
  `server/index.js`.

## License

[MIT](LICENSE)

<!-- prettier-ignore-start -->
[`<link>`]: https://nextjs.org/docs#with-link
[babel]: https://babeljs.io/
[bundlephobia-badge]: https://img.shields.io/bundlephobia/min/next-minimal-routes.svg
[bundlephobia-link]: https://bundlephobia.com/result?p=next-minimal-routes
[components/link.js]: https://github.com/lydell/next-minimal-routes/blob/master/components/Link.js
[doctoc]: https://github.com/thlorenz/doctoc/
[eslint]: https://eslint.org/
[express]: https://expressjs.com/
[file system routing]: https://nextjs.org/docs#disabling-file-system-routing
[getrequesthandler]: #getrequesthandler-app-routes--function
[jest]: https://jestjs.io/
[makeroute]: #makeroute-page-pattern--page-rest--route
[makeurls]: #makeurls-route-params---query---hash-----href-as-
[matchroute]: #matchrouteroutes-pathname--route-params---undefined
[next-routes]: https://github.com/fridays/next-routes
[next.js]: https://nextjs.org/
[nextjs-dynamic-routes]: https://github.com/gvergnaud/nextjs-dynamic-routes
[nextjs-server]: https://nextjs.org/docs#custom-server-and-routing
[node.js]: https://nodejs.org/en/
[npm]: https://www.npmjs.com/
[path-to-regexp]: https://github.com/pillarjs/path-to-regexp
[prettier]: https://prettier.io/
[queryobject]: #queryobject
[route]: #route
[router]: https://nextjs.org/docs#imperatively
[travis-badge]: https://travis-ci.com/lydell/next-minimal-routes.svg?branch=master
[travis-link]: https://travis-ci.com/lydell/next-minimal-routes
<!-- prettier-ignore-end -->
