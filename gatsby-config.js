module.exports = {
  siteMetadata: {
    title: `Silviu Glavan | Personal Portfolio | silviu.dev`,
    description: `Front End Developer with a focus on JavaScript, React and Serverless Architectures. Passionate about wine and astronomy and how well they work toghether.`,
    author: `@silviuglv`,
    canonical: `https://www.silviu.dev/`,
  },
  plugins: [
    `gatsby-plugin-sass`,
    `gatsby-plugin-react-helmet`,
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `images`,
        path: `${__dirname}/src/images`,
      },
    },
    `gatsby-transformer-sharp`,
    `gatsby-plugin-sharp`,
    {
      resolve: `gatsby-plugin-styled-components`,
      options: {
        displayName: false,
        // Add any options here
      },
    },

    {
      resolve: `gatsby-plugin-google-tagmanager`,
      options: {
        id: 'GTM-NS924RG',

        // Include GTM in development.
        // Defaults to false meaning GTM will only be loaded in production.
        includeInDevelopment: false,
      },
    },
    // this (optional) plugin enables Progressive Web App + Offline functionality
    // To learn more, visit: https://gatsby.dev/offline
    // `gatsby-plugin-offline`,
    `gatsby-plugin-netlify`,
  ],
};
