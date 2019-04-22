import React from 'react';
import styled from 'styled-components';

import facebook from '../images/facebook_logo.png';
import instagram from '../images/instagram_logo.png';
import linkedin from '../images/linkedin_logo.png';
import spotify from '../images/spotify_logo.png';
import github from '../images/github_logo.png';

const Block = styled.header`
  position: absolute;
  width: 100%;
  margin-left: 0;
  margin-top: 0;
  padding-top: 10px;
  padding-bottom: 10px;
  z-index: 9;
  @media (min-width: 768px) {
    padding-top: 20px;
    padding-bottom: 20px;
  }

  @media (min-width: 960px) {
    padding-top: 40px;
  }
`;

const IconContainer = styled.div`
  width: 160px;
  display: flex;
  justify-content: space-between;
  align-items: center;

  @media (min-width: 480px) {
    width: 200px;
  }

  @media (min-width: 960px) {
    width: 280px;
  }
`;

const Icon = styled.a`
  width: 25px;

  @media (min-width: 480px) {
    width: 30px;
  }

  @media (min-width: 960px) {
    width: 40px;
  }
`;
const Header = () => (
  <Block>
    <div className="global__container">
      <IconContainer>
        <Icon
          href="https://www.facebook.com/silviuandreiglavan"
          target="_blank"
        >
          <img src={facebook} alt="Facebook Icon" />
        </Icon>
        <Icon href="https://www.instagram.com/silviuglv/" target="_blank">
          <img src={instagram} alt="Instagram Icon" />
        </Icon>
        <Icon href="https://www.linkedin.com/in/silviuglv/" target="_blank">
          <img src={linkedin} alt="LinkedIn Icon" />
        </Icon>
        <Icon
          href="https://open.spotify.com/user/21bojrda5zxm6hsitnizqxouq"
          target="_blank"
        >
          <img src={spotify} alt="Spotify Icon" />
        </Icon>
        <Icon href="https://github.com/silviuglv" target="_blank">
          <img src={github} alt="GitHub Icon" />
        </Icon>
      </IconContainer>
    </div>
  </Block>
);

export default Header;
