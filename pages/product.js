import Head from "next/head";
import PropTypes from "prop-types";
import React from "react";

import Debug from "../components/Debug";
import { Link1 } from "../components/Link";
import routes from "../routes";

export default class Product extends React.Component {
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

    return (
      <div>
        <Head>
          <title>Product: {query.slug}</title>
        </Head>

        <h1>Product: {query.slug}</h1>

        <p>
          <Link1 route={routes.home}>
            <a>Home</a>
          </Link1>
        </p>

        <Debug route={routes.product} query={query} />

        <p id="description" style={{ marginTop: "80vh" }}>
          The page can scroll down here by adding <code>#description</code> to
          the URL.
        </p>
      </div>
    );
  }
}
