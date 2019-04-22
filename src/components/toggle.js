import React, { Component } from 'react';
import styled, { keyframes } from 'styled-components';

import even from '../images/plus_green.png';
import odd from '../images/plus_blue.png';

const ToggleWrapper = styled.div`
  width: 100%;
  margin: 20px auto;

  @media (min-width: 360px) {
    width: 90%;
  }

  @media (min-width: 768px) {
    width: 75%;
  }

  @media (min-width: 960px) {
    width: 65%;
  }

  @media (min-width: 1200px) {
    width: 60%;
  }
`;
export class Toggle extends Component {
  render() {
    const children = React.Children.map(this.props.children, (child, index) => {
      return React.cloneElement(child, {
        even: index % 2 === 0 ? true : false,
      });
    });
    return <ToggleWrapper>{children}</ToggleWrapper>;
  }
}

const TabWrapper = styled.div`
  margin: 20px auto;
  border-radius: 25px;
  overflow: hidden;

  @media (min-width: 960px) {
    border-radius: 30px;
  }
`;

export class Tab extends Component {
  state = {
    active: this.props.active,
  };

  render() {
    const children = React.Children.map(this.props.children, child => {
      if (child.props.type === 'title') {
        return React.cloneElement(child, {
          even: this.props.even,
          active: this.state.active,
          onToggle: () => this.setState({ active: !this.state.active }),
        });
      } else if (child.props.type === 'content') {
        return React.cloneElement(child, {
          active: this.state.active,
        });
      } else {
        return child;
      }
    });

    return <TabWrapper>{children}</TabWrapper>;
  }
}

const TitleWrapper = styled.div`
  background-color: var(--dark);
  color: white;
  padding: 15px 20px;
  display flex;
  justify-content: space-between;
  align-items: center;
  font-size: 1.1rem;
  cursor: pointer;
  @media (min-width: 480px) {
    font-size: 1.2rem;
  }
`;

const Icon = styled.img`
  width: 20px;
  transform: ${props => (props.active ? 'rotate(45deg)' : 'rotate(90deg)')};
  transition: 0.3s linear;
`;

export class Title extends Component {
  render() {
    return (
      <TitleWrapper
        onClick={() => this.props.onToggle()}
        active={this.props.active}
      >
        <h3>{this.props.children}</h3>
        <Icon
          src={this.props.even ? even : odd}
          alt="Plus Icon"
          active={this.props.active}
        />
      </TitleWrapper>
    );
  }
}

const grow = keyframes`
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
`;

const ContentWrapper = styled.div`
  padding: 15px 20px 25px;
  background-color: white;
  line-height: 1.4;
  transition: 0.3s ease-in;
  font-size: 1rem;
  overflow; hidden;
  animation: .5s ${grow} ease-in-out;
  animation-fill-mode: forwards;
`;

export class Content extends Component {
  render() {
    return this.props.active ? (
      <ContentWrapper>{this.props.children}</ContentWrapper>
    ) : null;
  }
}
