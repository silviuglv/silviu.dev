import React, { Component } from 'react';
import { Link } from 'gatsby';
import styled from 'styled-components';

const Section = styled.section`
  padding-top: 40px;
  padding-bottom: 40px;
  background-color: var(--dark);
  margin-top: -20px;
  position: relative;
  color: white;
  @media (min-width: 768px) {
    padding-top: 60px;
    padding-bottom: 60px;
  }

  @media (min-width: 960px) {
    padding-top: 80px;
    padding-bottom: 80px;
  }
`;

const Title = styled.h3`
  font-size: 1.6rem;
  font-weight: 900;
  line-height: 1.4;
  text-align: center;

  @media (min-width: 768px) {
    text-align: ${props => (props.bottom ? 'center' : 'left')};
    font-size: 2.2rem;
    width: ${props => (props.bottom ? '98%' : '80%')};
  }

  @media (min-width: 960px) {
    margin-left: ${props => (props.bottom ? '0%' : '5%')};
  }

  @media (min-width: 1200px) {
    width: ${props => (props.bottom ? '98%' : '60%')};
  }
`;

const Disclaimer = styled.p`
  text-align: center;
  color: var(--silver);
  margin-top: 10px;
  font-style: italic;

  @media (min-width: 768px) {
    margin-top: 40px;
  }
`;

const Highlight = styled.span`
  color: var(--green);
`;

const CTA = styled(Link)`
  display: block;
  background: var(--blue);
  padding: 10px;
  color: black;
  text-align: center;
  width: 220px;
  font-weight: 600;
  font-size: 1.2rem;
  margin: 30px auto 0 auto;
  border-radius: 50px;
  border: 0;
  text-decoration: none;

  @media (min-width: 480px) {
    width: 280px;
    padding: 15px;
    margin-top: 50px;
  }

  @media (min-width: 960px) {
    width: 300px;
  }

  @media (min-width: 1200px) {
    width: 340px;
  }
`;

const CommitsWrapper = styled.ul`
  display: flex;
  flex-wrap: wrap;
  margin-top: 30px;
  margin-bottom: 30px;
  flex-direction: column;
  justtify-content: space-between;
  height: 105px;
  @media (min-width: 480px) {
    height: 119px;
  }

  @media (min-width: 768px) {
    width: 75%;
    margin-left: auto;
    margin-right: auto;
    margin-top: 20px;
    margin-bottom: 50px;
  }

  @media (min-width: 960px) {
    width: 65%;
  }

  @media (min-width: 1200px) {
    height: 175px;
  }
`;

const Commit = styled.li`
  width: 10px;
  height: 10px;
  margin-top: 2.5px;
  margin-bottom: 2.5px;
  border-radius: 50px;
  background-image: linear-gradient(var(--blue), var(--green));
  @media (min-width: 480px) {
    width: 12px;
    height: 12px;
  }

  @media (min-width: 1200px) {
    width: 18px;
    height: 18px;
    margin-top: 3px;
    margin-bottom: 3px;
  }
`;

class GitHub extends Component {
  state = {};

  componentDidMount() {
    fetch('https://github-contributions-api.now.sh/v1/silviuglv')
      .then(response => response.json())
      .then(data => {
        const today = new Date();
        let yearAgo = new Date();
        yearAgo = new Date(yearAgo.setDate(yearAgo.getDate() - 182));

        const commits = data.contributions.reduce(
          (agg, item) => {
            if (today > new Date(item.date) && new Date(item.date) > yearAgo) {
              agg.commit.push(item);
              agg.total += item.count;
            }

            return agg;
          },
          { commit: [], total: 0 }
        );
        this.setState({ commits });
      });
  }

  render() {
    return (
      <Section>
        <div className="global__container">
          <Title>Ok, tough one, these are my GitHub contributions</Title>
          <Disclaimer>Last 6 months</Disclaimer>
          <CommitsWrapper>
            {this.state.commits
              ? [...this.state.commits.commit].reverse().map((item, index) => (
                  <Commit
                    key={index}
                    style={{
                      backgroundColor: item.color,
                      opacity:
                        item.intensity > 0 ? 0.2 * item.intensity + 0.2 : 0.1,
                    }}
                  />
                ))
              : null}
          </CommitsWrapper>
          <Title bottom>
            ...over{' '}
            <Highlight>
              {this.state.commits ? this.state.commits.total : 2200}
            </Highlight>{' '}
            of them
          </Title>
          <CTA to="/#contact">Wow, that's impressive</CTA>
        </div>
      </Section>
    );
  }
}

export default GitHub;
