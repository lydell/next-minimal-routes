import Head from "next/head";
import PropTypes from "prop-types";
import React from "react";

import Debug from "../components/Debug";
import { Link1, Link2, Link3 } from "../components/Link";
import routes from "../routes";

const LINKS = { Link1, Link2, Link3 };

export default class BadLink extends React.Component {
  static propTypes = {
    query: PropTypes.object.isRequired,
  };

  static getInitialProps({ query }) {
    return {
      query,
    };
  }

  render() {
    const { query } = this.props;
    const { name, type } = query;

    const Link = LINKS[name];

    return (
      <div>
        <Head>
          <title>
            Bad link: {name} – {type}
          </title>
        </Head>

        <h1>
          Bad link: {name} – {type}
        </h1>

        <p>
          <Link1 route={routes.home}>
            <a>Home</a>
          </Link1>
        </p>

        {type === "unknown" ? (
          <Link route={name === "Link1" ? undefined : "nope"}>
            <a>{type}</a>
          </Link>
        ) : type === "invalid" ? (
          <Link
            route={name === "Link1" ? routes.product : "product"}
            params={{ slug: "" }}
          >
            <a>{type}</a>
          </Link>
        ) : null}

        <Debug route={routes.badLink} query={query} />
      </div>
    );
  }
}
