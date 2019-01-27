import Head from "next/head";
import PropTypes from "prop-types";
import React from "react";

import Debug from "../components/Debug";
import { Link1 } from "../components/Link";
import routes from "../routes";

export default class Weird extends React.Component {
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
          <title>Weird pattern</title>
        </Head>

        <h1>Weird pattern</h1>

        <p>
          <Link1 route={routes.home}>
            <a>Home</a>
          </Link1>
        </p>

        <p>Reloading the page should not change the query.</p>

        <Debug route={routes.weird} query={query} />
      </div>
    );
  }
}
