const path = require("path");

module.exports = {
  // You probably want to set `useFileSystemPublicRoutes: false`. See:
  // https://nextjs.org/docs#disabling-file-system-routing
  // In this example we only disable file system routing if running with the
  // custom server.
  useFileSystemPublicRoutes: !process.argv[1].endsWith("/server/index.js"),

  // This is just here to let the example app resolve `import
  // "next-minimal-routes"` to local directories in the repo.
  webpack: config => ({
    ...config,
    resolve: {
      ...config.resolve,
      alias: {
        ...config.resolve.alias,
        "next-minimal-routes": path.resolve(
          __dirname,
          process.env.PACKAGE_DIR || ""
        ),
      },
    },
  }),
};
