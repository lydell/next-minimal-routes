import Head from "next/head";
import PropTypes from "prop-types";
import React from "react";

import Debug from "../components/Debug";
import { Link1 } from "../components/Link";
import routes from "../routes";

export default class About extends React.Component {
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
          <title>About</title>
        </Head>

        <h1>About</h1>

        <p>
          <Link1 route={routes.home}>
            <a>Home</a>
          </Link1>
        </p>

        <Debug route={routes.about} query={query} />
      </div>
    );
  }
}
