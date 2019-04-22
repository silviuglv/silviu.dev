import React from 'react';
import { Link } from 'gatsby';
import styled from 'styled-components';

import heroBg from '../images/hero.jpg';

const Section = styled.section`
  padding-top: 60px;
  padding-bottom: 80px;
  background-image: url(${heroBg}),
    linear-gradient(to bottom, var(--blue), var(--green));
  background-size: cover;
  background-repeat: no-repeat;
  background-position: center;
  position: relative;
  z-index: 2;

  @media (min-width: 360px) {
    background-position: 55% center;
  }
  @media (min-width: 768px) {
    padding-top: 100px;
  }
  @media (min-width: 960px) {
    padding-top: 160px;
    padding-bottom: 140px;
  }
`;

const Title = styled.h1`
  font-size: 1.8rem;
  font-weight: 900;

  @media (min-width: 480px) {
    font-size: 2.2rem;
  }

  @media (min-width: 768px) {
    font-size: 3rem;
  }

  @media (min-width: 960px) {
    margin-left: 5%;
  }
`;

const Kicker = styled.p`
  font-size: 1.2rem;
  @media (min-width: 480px) {
    font-size: 1.4rem;
  }

  @media (min-width: 768px) {
    font-size: 1.6rem;
    margin-left: 5%;
  }
  @media (min-width: 960px) {
    margin-left: 10%;
  }
`;

const CTA = styled(Link)`
  display: block;
  background: var(--purple);
  padding: 8px;
  color: white;
  text-align: center;
  width: 140px;
  font-weight: 600;
  font-size: 1.2rem;
  margin-top: 30px;
  border-radius: 50px;
  border: 0;
  text-decoration: none;
  @media (min-width: 480px) {
    width: 180px;
  }
  @media (min-width: 768px) {
    font-size: 1.4rem;
    width: 220px;
    padding: 12px;
    margin-left: 5%;
    margin-top: 40px;
  }
  @media (min-width: 960px) {
    width: 260px;
    margin-left: 10%;
  }
`;

const Hero = () => (
  <Section>
    <div className="global__container">
      <Title>Hi, I'm Silviu</Title>
      <Kicker>... and I build websites</Kicker>
      <CTA to="/#contact">I'm sold!</CTA>
    </div>
  </Section>
);

export default Hero;
