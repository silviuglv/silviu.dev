import React from 'react';
import styled from 'styled-components';

import gatsby from '../images/gatsby-icon.png';

const Block = styled.header`
  position: absolute;
  width: 100%;
  margin-left: 0;
  margin-top: 0;
  padding-top: 30px;
  padding-bottom: 30px;
  z-index: 9;

  @media (min-width: 768px) {
    & .global__container {
      display: flex;
      justify-content: space-between;
    }
  }
`;

const IconContainer = styled.div`
  width: 220px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  @media (min-width: 768px) {
    order: 2;
    margin: 0;
  }
`;

const Icon = styled.a`
  width: 100px;
`;

const Copy = styled.span`
  display: block;
  text-align: center;
  margin-top: 15px;
  font-size: 1rem;
  @media (min-width: 768px) {
    order: 1;
  }
`;

const Footer = () => (
  <Block>
    <div className="global__container">
      <IconContainer>
        <Icon href="https://www.gatsbyjs.org" target="_blank">
          <img src={gatsby} alt="Build with GatsbyJs" />
        </Icon>
        <Icon href="https://www.netlify.com" target="_blank">
          <img
            src="https://www.netlify.com/img/global/badges/netlify-color-accent.svg"
            alt="Deployed on Netlify"
          />
        </Icon>
      </IconContainer>
      <Copy>&copy; silviu.dev</Copy>
    </div>
  </Block>
);

export default Footer;
