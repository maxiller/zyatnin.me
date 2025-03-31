import React from 'react';
import {content} from "../data/data";

const About = ({ language }) => {
  return (
    <div className="about">
      <img src={content.about.photo} alt="Profile" className="profile-pic" />
      <p>{content.about.text[language]}</p>
    </div>
  );
};

export default About;