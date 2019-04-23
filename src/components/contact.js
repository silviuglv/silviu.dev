import React, { Component } from 'react';
import styled from 'styled-components';

const emails = [
  'thebestfed',
  'thisguyisgreat',
  'omgimmailing',
  'pushitpushitpushit',
  'idontfixprinters',
];

const Section = styled.section`
  padding-top: 40px;
  padding-bottom: 40px;
  background-image: linear-gradient(to bottom, var(--blue), var(--green));
  @media (min-width: 768px) {
    padding-top: 60px;
    padding-bottom: 60px;
  }
`;

const Title = styled.h3`
  font-size: 1.6rem;
  font-weight: 900;
  line-height: 1.2;
  text-align: center;

  @media (min-width: 360px) {
    width: 90%;
    margin: 0 auto;
  }

  @media (min-width: 768px) {
    font-size: 2.2rem;
  }

  @media (min-width: 960px) {
    font-size: 2.8rem;
    width: 50%;
    margin: 0;
    display: inline-block;
    text-align: left;
    vertical-align: middle;
  }
`;

const ECTA = styled.a`
  display: block;
  background: var(--dark);
  padding: 10px;
  color: var(--silver);
  text-align: center;
  font-weight: 600;
  font-size: 1.2rem;
  border-radius: 50px;
  border: 0;
  text-decoration: none;

  @media (min-width: 1200px) {
    padding: 13px;
  }
`;

const ChangeCTA = styled.button`
  border: none;
  font-weight: bold;
  background-color: transparent;
  outline: none;
  margin-top: 10px;
`;

const EmailWrapper = styled.div`
  width: 280px;
  margin: 30px auto 0;

  @media (min-width: 480px) {
    width: 320px;
  }
  @media (min-width: 768px) {
    width: 360px;
  }
  @media (min-width: 960px) {
    width: 40%;
    margin: 0;
    display: inline-block;
    vertical-align: middle;
    margin-left: 10%;
  }

  @media (min-width: 1200px) {
    width: 35%;
    margin-left: 12%;
  }
`;
class Contact extends Component {
  state = {
    email: 'omgimmailing@silviu.dev',
  };

  handleEmailChange = () => {
    const email = `${
      emails[Math.floor(Math.random() * emails.length)]
    }@silviu.dev`;

    this.setState({ email });
  };
  render() {
    return (
      <Section id="contact">
        <div className="global__container">
          <Title>I'd love to hear from&nbsp;you!</Title>
          <EmailWrapper>
            <ECTA href={`mailto:${this.state.email}`}>{this.state.email}</ECTA>
            <div
              style={{
                textAlign: 'center',
                marginTop: '10px',
                fontSize: '1rem',
              }}
            >
              <span>Not feeling it? </span>
              <ChangeCTA onClick={this.handleEmailChange}>
                Choose another
              </ChangeCTA>
            </div>
          </EmailWrapper>
        </div>
      </Section>
    );
  }
}

export default Contact;
