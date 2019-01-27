/**
 * @jest-environment node
 */

import { makeRoute } from "../src";
import { getRequestHandler } from "../src/server";

class App {
  constructor() {
    this.__handle = jest.fn();
    this.render = jest.fn();
  }

  getRequestHandler() {
    return this.__handle;
  }
}

class Request {
  constructor(url) {
    this.url = url;
  }
}

class Response {
  constructor() {
    this.__status = undefined;
    this.__buffer = [];
  }

  status(status) {
    this.__status = status;
    return this;
  }

  end(string) {
    this.__buffer.push(string);
    return this;
  }
}

test("exports", () => {
  expect(typeof getRequestHandler).toBe("function");
});

test("render", () => {
  const app = new App();
  const req = new Request("/about");
  const res = new Response();
  const routes = [makeRoute({ page: "/" }), makeRoute({ page: "/about" })];
  const handle = getRequestHandler({ app, routes });

  handle(req, res);

  expect(app.render.mock.calls).toMatchInlineSnapshot(`
Array [
  Array [
    Request {
      "url": "/about",
    },
    Response {
      "__buffer": Array [],
      "__status": undefined,
    },
    "/about",
    Object {},
  ],
]
`);

  expect(app.__handle).not.toHaveBeenCalled();
});

test("404", () => {
  const app = new App();
  const req = new Request("/nope");
  const res = new Response();
  const routes = [makeRoute({ page: "/" }), makeRoute({ page: "/about" })];
  const handle = getRequestHandler({ app, routes });

  handle(req, res);

  expect(app.__handle.mock.calls).toMatchInlineSnapshot(`
Array [
  Array [
    Request {
      "url": "/nope",
    },
    Response {
      "__buffer": Array [],
      "__status": undefined,
    },
  ],
]
`);

  expect(app.render).not.toHaveBeenCalled();
});

test("skip default", () => {
  const app = new App();
  const req1 = new Request("/");
  const req2 = new Request("/_next/static/runtime/main.js");
  const req3 = new Request("/static/flowers.jpg");
  const res1 = new Response();
  const res2 = new Response();
  const res3 = new Response();
  const match = jest.fn().mockImplementation(() => ({}));
  const routes = [makeRoute({ page: "/", match })];
  const handle = getRequestHandler({ app, routes });

  handle(req1, res1);
  expect(match).toHaveBeenCalledTimes(1);
  handle(req2, res2);
  handle(req3, res3);
  expect(match).toHaveBeenCalledTimes(1);

  expect(app.render.mock.calls).toMatchInlineSnapshot(`
Array [
  Array [
    Request {
      "url": "/",
    },
    Response {
      "__buffer": Array [],
      "__status": undefined,
    },
    "/",
    Object {},
  ],
]
`);

  expect(app.__handle.mock.calls).toMatchInlineSnapshot(`
Array [
  Array [
    Request {
      "url": "/_next/static/runtime/main.js",
    },
    Response {
      "__buffer": Array [],
      "__status": undefined,
    },
  ],
  Array [
    Request {
      "url": "/static/flowers.jpg",
    },
    Response {
      "__buffer": Array [],
      "__status": undefined,
    },
  ],
]
`);
});

test("skip custom", () => {
  const app = new App();
  const req1 = new Request("/");
  const req2 = new Request("/a");
  const res1 = new Response();
  const res2 = new Response();
  const match = jest.fn().mockImplementation(() => ({}));
  const routes = [makeRoute({ page: "/", match })];
  const skip = jest.fn().mockImplementation((req, res) => {
    expect(req).toBeInstanceOf(Request);
    expect(res).toBeInstanceOf(Response);
    return req.url !== "/";
  });
  const handle = getRequestHandler({
    app,
    routes,
    skip,
  });

  handle(req1, res1);
  expect(skip).toHaveBeenCalledTimes(1);
  expect(match).toHaveBeenCalledTimes(1);
  handle(req2, res2);
  expect(skip).toHaveBeenCalledTimes(2);
  expect(match).toHaveBeenCalledTimes(1);

  expect(app.render.mock.calls).toMatchInlineSnapshot(`
Array [
  Array [
    Request {
      "url": "/",
    },
    Response {
      "__buffer": Array [],
      "__status": undefined,
    },
    "/",
    Object {},
  ],
]
`);

  expect(app.__handle.mock.calls).toMatchInlineSnapshot(`
Array [
  Array [
    Request {
      "url": "/a",
    },
    Response {
      "__buffer": Array [],
      "__status": undefined,
    },
  ],
]
`);
});

test("decoding", () => {
  const app = new App();
  const query = `${encodeURIComponent("å")}=${encodeURIComponent("ö")}`;
  const req = new Request(`/city/${encodeURIComponent("göteborg")}?${query}`);
  const res = new Response();
  const routes = [makeRoute({ page: "/city", pattern: "/city/:city" })];
  const handle = getRequestHandler({ app, routes });

  handle(req, res);

  expect(app.render.mock.calls).toMatchInlineSnapshot(`
Array [
  Array [
    Request {
      "url": "/city/g%C3%B6teborg?%C3%A5=%C3%B6",
    },
    Response {
      "__buffer": Array [],
      "__status": undefined,
    },
    "/city",
    Object {
      "city": "göteborg",
      "å": "ö",
    },
  ],
]
`);

  expect(app.__handle).not.toHaveBeenCalled();
});

test("malformed URL", () => {
  const app = new App();
  const req = new Request("/%%%");
  const res = new Response();
  const routes = [makeRoute({ page: "/", pattern: "/:page" })];
  const handle = getRequestHandler({ app, routes });

  handle(req, res);

  expect(app.render).not.toHaveBeenCalled();
  expect(app.__handle).not.toHaveBeenCalled();

  expect(res).toMatchInlineSnapshot(`
Response {
  "__buffer": Array [
    "Bad Request",
  ],
  "__status": 400,
}
`);
});

test("URL params take precedence over query params", () => {
  const app = new App();
  const req = new Request(
    `/product/hammer/specs?slug=nails&tab=description&sort=price&sort=popularity&show=all#content`
  );
  const res = new Response();
  const routes = [
    makeRoute({ page: "/product", pattern: "/product/:slug/:tab?" }),
  ];
  const handle = getRequestHandler({ app, routes });

  handle(req, res);

  expect(app.render.mock.calls).toMatchInlineSnapshot(`
Array [
  Array [
    Request {
      "url": "/product/hammer/specs?slug=nails&tab=description&sort=price&sort=popularity&show=all#content",
    },
    Response {
      "__buffer": Array [],
      "__status": undefined,
    },
    "/product",
    Object {
      "show": "all",
      "slug": "hammer",
      "sort": Array [
        "price",
        "popularity",
      ],
      "tab": "specs",
    },
  ],
]
`);

  expect(app.__handle).not.toHaveBeenCalled();
});
