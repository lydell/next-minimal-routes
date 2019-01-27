import { makeUrls } from "next-minimal-routes";
import Head from "next/head";
import NextLink from "next/link";
import Router from "next/router";
import React from "react";

import { Link1, Link2 } from "../components/Link";
import routes from "../routes";

export default function Home() {
  return (
    <div>
      <Head>
        <title>Home</title>
      </Head>

      <h1>Home</h1>

      <h2>Links</h2>
      <ul>
        <li>
          {/* You can use the standard Next.js Link if you want: */}
          <NextLink {...makeUrls({ route: routes.about })}>
            <a>About</a>
          </NextLink>
        </li>
        <li>
          {/* Or you can make a small wrapper. This one lets you pass in the route: */}
          <Link1 route={routes.product} params={{ slug: "hammer" }}>
            <a>Product: Hammer</a>
          </Link1>
        </li>
        <li>
          {/* This one just takes the route name: */}
          <Link2
            route="product"
            params={{ slug: "nails" }}
            query={{ tracking_id: "123" }}
            hash="description"
          >
            <a>Product: Nails (with query and hash)</a>
          </Link2>
        </li>
      </ul>

      <h2>Imperative routing</h2>
      <ul>
        <li>
          <button
            type="button"
            onClick={() => {
              // `makeUrls` is used for `Router.push` too:
              const { href, as } = makeUrls({
                route: routes.product,
                params: { slug: "shirt" },
                query: { size: "xl" },
              });
              Router.push(href, as);
            }}
          >
            Router.push
          </button>
        </li>
        <li>
          <button
            type="button"
            onClick={() => {
              // And for `Router.replace`:
              const { href, as } = makeUrls({
                route: routes.product,
                params: { slug: "jeans" },
                query: { size: "s" },
              });
              Router.replace(href, as);
            }}
          >
            Router.replace
          </button>
        </li>
        <li>
          <button
            type="button"
            onClick={() => {
              // `Router.prefetch` does not need any `as` URL, so you just
              // need to pass the `page` of a route:
              Router.prefetch(routes.product.page);
            }}
          >
            Router.prefetch (check the Network tab) – production mode only
          </button>
        </li>
      </ul>

      <h2>Bad links</h2>
      <p>
        These links go to pages that throw errors or show warnings in the
        console. Those pages contain links with bad parameters.
      </p>
      <ul>
        {["Link1", "Link2", "Link3"].map(name =>
          ["unknown", "invalid"].map(type => (
            <li key={type}>
              <Link1 route={routes.badLink} params={{ name, type }}>
                <a>
                  {name} – {type}
                </a>
              </Link1>
            </li>
          ))
        )}
      </ul>

      <h2>Weird pattern</h2>
      <p>Just to show how a couple of edge cases are handled.</p>
      <ul>
        <li>
          {/* path-to-regexp’s `.compile` does not support specifying
            different values for params with the same name. */}
          <Link1 route={routes.weird} params={{ duplicate: "a" }}>
            <a>Duplicate param name</a>
          </Link1>
        </li>
        <li>
          {/* If the URL contains different values for params with the same
            name, the last one is picked. */}
          <NextLink
            href={{ pathname: "/weird", query: { duplicate: "b" } }}
            as={{ pathname: "/weird/a/b" }}
          >
            <a>Duplicate param name, different values</a>
          </NextLink>
        </li>
        <li>
          <Link1
            route={routes.weird}
            params={{ optional_repeat: ["1", "two", "3"], duplicate: "a" }}
          >
            <a>Optional repeat</a>
          </Link1>
        </li>
      </ul>
    </div>
  );
}
