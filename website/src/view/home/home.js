import React from 'react';

import Header from '../../components/header/header';
import FeedLogo from '../../components/feedlogo/feedlogo';
import { useAuth } from "../../provider/auth";

import linkedin from "../../assets/linkedin.jpg"
import post from "../../assets/post.svg"

import { Colors } from "../../Constants"

import "./home.css"

const RightPart = () => (
  <div className="column">
    <img alt="linkedin-mockup" src={linkedin} className="linkedin-image" />
  </div>
);

const UpperText = ({ iconSize }) => (
  <div className="column" style={{ alignItems: "flex-start" }}>
    <div className="main-text">
      <FeedLogo isMonotone={false} size={iconSize} />
      <div className="absolute-text" style={{ left: 3 * iconSize / 5 }}>
        <p className="important-text">eed my flow</p>
      </div>
    </div>
    <p className='second-text'>
      Free Linkedin post scheduling
    </p>
  </div>
);

const Home = (props) => {
  const auth = useAuth();

  const GoButton = () => (
    <div style={{ backgroundColor: Colors.shade1 }} className='cta-container' onClick={() => auth.signIn(true, props)}>
      <p className='cta-text'>LET'S GO</p>
    </div>
  )

  const LeftPart = () => (
    <div className="column">
      <UpperText iconSize={80} />
      <img alt="home-illustration" src={post} className="post-image" />
      <GoButton />
    </div >
  )

  return (
    <div className="home-container">
      <Header {...props} />
      <div className="home-wrapper">
        <LeftPart />
        <RightPart />
      </div>
    </div>
  );
}

export default Home;