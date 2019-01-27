import pathToRegexp from "path-to-regexp";

export function makeRoute({ page, pattern = page, ...rest }) {
  if (typeof page !== "string") {
    throw new TypeError(`Expected 'page' to be a string, but got: ${page}`);
  }

  // These functions aren’t created until they are used for the first time.
  let match = undefined;
  let reverse = undefined;

  return {
    page,
    pattern,
    match: pathname => {
      if (match == null) {
        match = makeMatchFunction(pattern);
      }
      return match(pathname);
    },
    reverse: params => {
      if (reverse == null) {
        reverse = pathToRegexp.compile(pattern);
      }
      return reverse(params);
    },
    ...rest,
  };
}

function makeMatchFunction(pattern) {
  const keys = [];
  const regex = pathToRegexp(pattern, keys, {
    // Just like standard Next.js, don’t allow trailing slashes.
    strict: true,
  });

  return pathname => {
    const match = regex.exec(pathname);

    if (match == null) {
      return undefined;
    }

    return match.slice(1).reduce((result, value, index) => {
      const key = keys[index];

      // Later params with the same name overwrite earlier ones. We _could_ make
      // an array with all values, but it is not possible to pass an array of
      // values when reversing the URL, so to be consistent we must only allow
      // one value per param name (unless the param is repeatable).
      result[key.name] =
        key.repeat && value != null ? value.split(key.delimiter) : value;

      return result;
    }, Object.create(null));
  };
}

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

export function matchRoute(routes, pathname) {
  for (let index = 0; index < routes.length; index++) {
    const route = routes[index];
    const match = route.match(pathname);
    if (match != null) {
      return {
        route,
        params: match,
      };
    }
  }
  return undefined;
}
