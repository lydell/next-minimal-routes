import { makeRoute, makeUrls, matchRoute } from "../src";

test("exports", () => {
  expect(typeof makeRoute).toBe("function");
  expect(typeof makeUrls).toBe("function");
  expect(typeof matchRoute).toBe("function");
});

describe("makeRoute", () => {
  test("throws an error if 'page' is missing", () => {
    expect(() => makeRoute({})).toThrowErrorMatchingInlineSnapshot(
      `"Expected 'page' to be a string, but got: undefined"`
    );
  });

  test("pattern defaults to page", () => {
    expect(makeRoute({ page: "/about" })).toMatchObject({
      page: "/about",
      pattern: "/about",
    });
  });

  describe("match", () => {
    test("no params", () => {
      const route = makeRoute({ page: "/about" });
      expect(route.match("/about")).toEqual({});
      expect(route.match("/About")).toEqual({});
      expect(route.match("/about/")).toBeUndefined();
      expect(route.match("/nope")).toBeUndefined();
    });

    test("with params", () => {
      const route = makeRoute({ page: "/product", pattern: "/product/:slug" });
      expect(route.match("/product/hammer")).toEqual({ slug: "hammer" });
      expect(route.match("/product")).toBeUndefined();
      expect(route.match("/product/")).toBeUndefined();
    });

    test("repeatable params become arrays", () => {
      const route = makeRoute({ page: "/blog", pattern: "/blog/:parts*" });
      expect(route.match("/blog")).toEqual({});
      expect(route.match("/blog/one")).toEqual({ parts: ["one"] });
      expect(route.match("/blog/one/two")).toEqual({ parts: ["one", "two"] });
    });
  });

  describe("reverse", () => {
    test("no params", () => {
      const route = makeRoute({ page: "/about" });
      expect(route.reverse()).toEqual("/about");
    });

    test("with params", () => {
      const route = makeRoute({ page: "/product", pattern: "/product/:slug" });
      expect(route.reverse({ slug: "hammer" })).toEqual("/product/hammer");
      expect(() => route.reverse()).toThrowErrorMatchingInlineSnapshot(
        `"Expected \\"slug\\" to be a string"`
      );
      expect(() =>
        route.reverse({ slug: "" })
      ).toThrowErrorMatchingInlineSnapshot(
        `"Expected \\"slug\\" to match \\"[^\\\\/]+?\\", but got \\"\\""`
      );
    });

    test("encoding", () => {
      const route = makeRoute({ page: "/brand", pattern: "/brand/:slug" });
      expect(route.reverse({ slug: "black&decker" })).toBe(
        "/brand/black%26decker"
      );
      expect(route.reverse({ slug: "Sandvik A/S" })).toBe(
        "/brand/Sandvik%20A%2FS"
      );
    });
  });

  test("extra properties are passed on", () => {
    expect(makeRoute({ page: "/", sitemap: true, weight: 123 }))
      .toMatchInlineSnapshot(`
Object {
  "match": [Function],
  "page": "/",
  "pattern": "/",
  "reverse": [Function],
  "sitemap": true,
  "weight": 123,
}
`);
  });

  test("overriding `match`", () => {
    const LEGACY_URLS = new Map([
      ["/en/about-us.php", "about"],
      ["/en-us/product.php", "product"],
    ]);

    const route = makeRoute({
      page: "/legacy",
      match: pathname => {
        const name = LEGACY_URLS.get(pathname.toLowerCase());
        return name != null ? { name } : undefined;
      },
    });

    expect(route.match("/en/about-us.php")).toEqual({ name: "about" });
    expect(route.match("/en-US/product.php")).toEqual({ name: "product" });
    expect(route.match("/legacy")).toBeUndefined();
  });

  test("overriding `reverse`", () => {
    const route = makeRoute({
      page: "/file",
      pattern: "/file/:file",
      reverse: ({ file }) => `/file/${file.toLowerCase()}`,
    });

    expect(route.reverse({ file: "img.BMP" })).toBe("/file/img.bmp");
  });
});

describe("makeUrls", () => {
  test("simple route", () => {
    const route = makeRoute({ page: "/" });
    expect(makeUrls({ route })).toMatchInlineSnapshot(`
Object {
  "as": Object {
    "hash": "",
    "pathname": "/",
    "query": Object {},
  },
  "href": Object {
    "pathname": "/",
    "query": Object {},
  },
}
`);
  });

  test("with params", () => {
    const route = makeRoute({ page: "/product", pattern: "/product/:slug" });
    expect(makeUrls({ route, params: { slug: "hammer" } }))
      .toMatchInlineSnapshot(`
Object {
  "as": Object {
    "hash": "",
    "pathname": "/product/hammer",
    "query": Object {},
  },
  "href": Object {
    "pathname": "/product",
    "query": Object {
      "slug": "hammer",
    },
  },
}
`);
  });

  test("with params, query params and hash", () => {
    const route = makeRoute({
      page: "/product",
      pattern: "/product/:slug/:tab?",
    });
    expect(
      makeUrls({
        route,
        params: { slug: "hammer", tab: "specs" },
        query: { sort: ["price", "popularity"], show: "all" },
        hash: "content",
      })
    ).toMatchInlineSnapshot(`
Object {
  "as": Object {
    "hash": "content",
    "pathname": "/product/hammer/specs",
    "query": Object {
      "show": "all",
      "sort": Array [
        "price",
        "popularity",
      ],
    },
  },
  "href": Object {
    "pathname": "/product",
    "query": Object {
      "show": "all",
      "slug": "hammer",
      "sort": Array [
        "price",
        "popularity",
      ],
      "tab": "specs",
    },
  },
}
`);
  });

  test("hash with # character", () => {
    const route = makeRoute({ page: "/" });
    expect(makeUrls({ route, hash: "#test" })).toMatchInlineSnapshot(`
Object {
  "as": Object {
    "hash": "#test",
    "pathname": "/",
    "query": Object {},
  },
  "href": Object {
    "pathname": "/",
    "query": Object {},
  },
}
`);
  });
});

describe("matchRoute", () => {
  test("it works", () => {
    const routes = [
      makeRoute({ page: "/" }),
      makeRoute({ page: "/about" }),
      makeRoute({ page: "/product", pattern: "/product/:slug" }),
      makeRoute({ page: "/blog", pattern: "/blog/:num(x\\d+)?/:parts*/:name" }),
    ];

    expect(matchRoute(routes, "/")).toMatchInlineSnapshot(`
Object {
  "params": Object {},
  "route": Object {
    "match": [Function],
    "page": "/",
    "pattern": "/",
    "reverse": [Function],
  },
}
`);

    expect(matchRoute(routes, "/about")).toMatchInlineSnapshot(`
Object {
  "params": Object {},
  "route": Object {
    "match": [Function],
    "page": "/about",
    "pattern": "/about",
    "reverse": [Function],
  },
}
`);
    expect(matchRoute(routes, "/product/hammer")).toMatchInlineSnapshot(`
Object {
  "params": Object {
    "slug": "hammer",
  },
  "route": Object {
    "match": [Function],
    "page": "/product",
    "pattern": "/product/:slug",
    "reverse": [Function],
  },
}
`);
    expect(matchRoute(routes, "/blog/next-js-considered-harmful"))
      .toMatchInlineSnapshot(`
Object {
  "params": Object {
    "name": "next-js-considered-harmful",
    "num": undefined,
    "parts": undefined,
  },
  "route": Object {
    "match": [Function],
    "page": "/blog",
    "pattern": "/blog/:num(x\\\\d+)?/:parts*/:name",
    "reverse": [Function],
  },
}
`);
    expect(matchRoute(routes, "/blog/x5/2019/01/27/tech/laptop-guide"))
      .toMatchInlineSnapshot(`
Object {
  "params": Object {
    "name": "laptop-guide",
    "num": "x5",
    "parts": Array [
      "2019",
      "01",
      "27",
      "tech",
    ],
  },
  "route": Object {
    "match": [Function],
    "page": "/blog",
    "pattern": "/blog/:num(x\\\\d+)?/:parts*/:name",
    "reverse": [Function],
  },
}
`);

    expect(matchRoute(routes, "/nope")).toBeUndefined();
    expect(matchRoute(routes, "/about/")).toBeUndefined();
    expect(matchRoute(routes, "about")).toBeUndefined();
    expect(matchRoute(routes, "/abou")).toBeUndefined();
  });

  test("first matching route is picked", () => {
    const routes = [
      makeRoute({ page: "/one", pattern: "/" }),
      makeRoute({ page: "/two", pattern: "/" }),
    ];
    expect(matchRoute(routes, "/").route.page).toBe("/one");
  });

  test("empty list", () => {
    expect(matchRoute([], "")).toBeUndefined();
  });
});
