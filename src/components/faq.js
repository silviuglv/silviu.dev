import React from 'react';
import styled from 'styled-components';
import { Toggle, Tab, Title, Content } from './toggle';

const Section = styled.section`
  padding-top: 40px;
  padding-bottom: 40px;
  background-color: var(--silver);

  @media (min-width: 768px) {
    padding-top: 60px;
    padding-bottom: 60px;
  }

  @media (min-width: 960px) {
    padding-top: 80px;
    padding-bottom: 80px;
  }
`;

const InlineLink = styled.a`
  color: inherit;
`;

const FAQ = () => {
  return (
    <Section>
      <div className="global__container">
        <Toggle>
          <Tab>
            <Title type="title">Do you even work or just brag?</Title>
            <Content type="content">
              I'm currently working at{' '}
              <InlineLink
                href="https://www.ropto.com"
                rel="noopener noreferrer"
                target="_blank"
              >
                ROPTO
              </InlineLink>
              , a Lead Generation company where I build awesome landing pages
              for our marketing campaigns. Also, I maintain our delivery system,
              a NodeJS Serverless&nbsp;API.
            </Content>
          </Tab>
          <Tab>
            <Title type="title">How do you build these awesome products?</Title>
            <Content type="content">
              On a daily basis, I mainly work with HTML, CSS and Vanilla JS.
            </Content>
          </Tab>
          <Tab>
            <Title type="title">Do you even work or just brag?</Title>
            <Content type="content">
              I'm content. Just some content to keep me going for now. I will
              talk about my current jub in here eventually.
            </Content>
          </Tab>
          <Tab>
            <Title type="title">More bragging!?</Title>
            <Content type="content">
              I enjoy wine, actually, I have a Court of Masters Sommeliers
              Introductory Diploma and I can cook a whole lasagna from scratch
            </Content>
          </Tab>
        </Toggle>
      </div>
    </Section>
  );
};

export default FAQ;
