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
            <Title type="title">Do you even work, bro?</Title>
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
            <Title type="title">Any cool tech and tools?</Title>
            <Content type="content">
              My stack is JS centred for frontend as well as backend. I enjoy
              working with React and Serverless. Also, I'm a big fan of
              JAMStack.
            </Content>
          </Tab>
          <Tab>
            <Title type="title">Anything that stands out?</Title>
            <Content type="content">
              I'm currently working on a personal project that uses the
              Instagram Graph API to render user-friendly insights data. It uses
              React for the frontend and an AWS Lambda API along with DynamoDB.
              <p>
                <b>
                  <InlineLink
                    href="https://influb.com"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    influb.com
                  </InlineLink>
                </b>
              </p>
            </Content>
          </Tab>
          <Tab>
            <Title type="title">Do you do fun?</Title>
            <Content type="content">
              I'm a big wine lover, in fact, I have a Court of Masters
              Sommeliers Introductory Diploma. Also, I can cook a whole lasagna
              from scratch.
            </Content>
          </Tab>
        </Toggle>
      </div>
    </Section>
  );
};

export default FAQ;
