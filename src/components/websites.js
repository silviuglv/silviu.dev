import React, { Component } from 'react';
import { Link } from 'gatsby';
import styled from 'styled-components';

import portfolio from '../images/portfolio.png';
import portfolioVertical from '../images/portfolio_vertical.png';

const Section = styled.section`
  padding-top: 60px;
  padding-bottom: 60px;
  background-color: var(--silver);
  position: relative;

  @media (min-width: 768px) {
    padding-top: 100px;
    padding-bottom: 100px;
  }

  @media (min-width: 960px) {
    padding-top: 160px;
    padding-bottom: 160px;
  }
`;

const Title = styled.h3`
  font-size: 1.8rem;
  font-weight: 900;
  line-height: 1.2;

  @media (min-width: 480px) {
    width: 80%;
    margin-left: 5%;
  }

  @media (min-width: 768px) {
    font-size: 2.2rem;
    width: 60%;
  }

  @media (min-width: 1200px) {
    width: 55%;
  }
`;

const Highlight = styled.span`
  color: var(--blue);
`;

const Portfolio = styled.div`
  padding-top: 140px;
  background-image: url(${portfolio});
  background-size: auto 100%;
  margin-top: 30px;
  position: absolute;
  top: 110px;
  width: 100%;
  left: 0;

  @media (min-width: 768px) {
    width: 180px;
    height: 100%;
    background-image: url(${portfolioVertical});
    background-size: 100% auto;
    margin-top: 0;
    top: -20px;
    left: 65%;
  }

  @media (min-width: 960px) {
    width: 280px;
    left: 60%;
  }
`;

const CTA = styled(Link)`
  display: block;
  background: var(--green);
  padding: 10px;
  color: black;
  text-align: center;
  width: 220px;
  font-weight: 600;
  font-size: 1.2rem;
  margin: 170px auto 0 auto;
  border-radius: 50px;
  border: 0;
  text-decoration: none;

  @media (min-width: 480px) {
    width: 280px;
    padding: 15px;
  }

  @media (min-width: 768px) {
    margin-left: 5%;
    margin-top: 40px;
  }

  @media (min-width: 960px) {
    width: 300px;
  }

  @media (min-width: 1200px) {
    width: 340px;
  }
`;

class Websites extends Component {
  componentDidMount() {
    window.addEventListener('scroll', this.handleScroll);
  }

  handleScroll = event => {
    if (window.innerWidth > 767) {
      window.portfolio.style.backgroundPositionY = `${event.currentTarget
        .scrollY / 2}%`;
    } else if (window.innerWidth > 959) {
      window.portfolio.style.backgroundPositionY = `${
        event.currentTarget.scrollY
      }%`;
    } else {
      window.portfolio.style.backgroundPositionX = `${event.currentTarget
        .scrollY / 4}%`;
    }
  };

  render() {
    return (
      <Section>
        <div className="global__container">
          <Title>
            No really, I've built over <Highlight>200</Highlight> so far
          </Title>
          <Portfolio onScroll={this.handleScroll} id="portfolio" />
          <CTA to="/#contact">Oh, now we're talking</CTA>
        </div>
      </Section>
    );
  }
}

export default Websites;
