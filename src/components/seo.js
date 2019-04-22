/**
 * SEO component that queries for data with
 *  Gatsby's useStaticQuery React hook
 *
 * See: https://www.gatsbyjs.org/docs/use-static-query/
 */

import React from 'react';
import Helmet from 'react-helmet';
import { useStaticQuery, graphql } from 'gatsby';

const SEO = () => {
  const { site } = useStaticQuery(
    graphql`
      query {
        site {
          siteMetadata {
            title
            description
            author
            canonical
          }
        }
      }
    `
  );

  return (
    <Helmet>
      <title>{site.siteMetadata.title}</title>
      <meta name="description" content={site.siteMetadata.description} />
      <link rel="stylesheet" href="https://use.typekit.net/rli3gsn.css" />
      <meta name="author" content={site.siteMetadata.author} />
      <link rel="canonical" href={site.siteMetadata.canonical} />
    </Helmet>
  );
};

export default SEO;
