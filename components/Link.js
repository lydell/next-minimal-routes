import { makeUrls } from "next-minimal-routes";
import NextLink from "next/link";
import PropTypes from "prop-types";
import React from "react";

import routes from "../routes";

Link1.propTypes = {
  route: PropTypes.shape({
    page: PropTypes.string.isRequired,
    pattern: PropTypes.string.isRequired,
    match: PropTypes.func.isRequired,
    reverse: PropTypes.func.isRequired,
  }).isRequired,
  params: PropTypes.object,
  query: PropTypes.object,
  hash: PropTypes.string,
};

Link1.defaultProps = {
  params: {},
  query: {},
  hash: "",
};

// The simplest version. You pass an entire `route` object.
export function Link1({ route, params, query, hash, ...restProps }) {
  // Note: This may throw an error if `params` is not valid to for reversing the url.
  const routeProps = makeUrls({
    route,
    params,
    query,
    hash,
  });
  return <NextLink {...routeProps} {...restProps} />;
}

Link2.propTypes = {
  route: PropTypes.oneOf(Object.keys(routes)).isRequired,
  params: PropTypes.object,
  query: PropTypes.object,
  hash: PropTypes.string,
};

Link2.defaultProps = {
  params: {},
  query: {},
  hash: "",
};

// A possibly more convenient version. You pass the string name of a route, and
// the component finds the `route` object by itself.
export function Link2({ route: routeName, params, query, hash, ...restProps }) {
  const route = routes[routeName];

  if (route == null) {
    throw new Error(`Unknown route: ${routeName}`);
  }

  // Note: This may throw an error if `params` is not valid to for reversing the url.
  const routeProps = makeUrls({
    route,
    params,
    query,
    hash,
  });

  return <NextLink {...routeProps} {...restProps} />;
}

const warned = new Set();

Link3.propTypes = {
  route: PropTypes.oneOf(Object.keys(routes)).isRequired,
  params: PropTypes.object,
  query: PropTypes.object,
  hash: PropTypes.string,
  children: PropTypes.node.isRequired,
};

Link3.defaultProps = {
  params: {},
  query: {},
  hash: "",
};

// A version that logs warnings to the console instead of throwing errors.
export function Link3({
  route: routeName,
  params,
  query,
  hash,
  children,
  ...restProps
}) {
  const route = routes[routeName];

  if (route == null) {
    const message = `<Link>: Unknown route: ${routeName}`;
    if (!warned.has(message)) {
      console.warn(message);
      warned.add(message);
    }
    return children;
  }

  let routeProps = undefined;

  try {
    routeProps = makeUrls({
      route,
      params,
      query,
      hash,
    });
  } catch (error) {
    const message = `<Link>: Failed to make URLs for route '${routeName}': ${
      error.message
    }`;
    if (!warned.has(message)) {
      console.warn(message);
      warned.add(message);
    }
    return children;
  }

  return (
    <NextLink {...routeProps} {...restProps}>
      {children}
    </NextLink>
  );
}
