import React from 'react';
import { content } from '../data/data';

const About = ({ language }) => {
  return (
      <section className="about">
        <h1>{content.about[language].title}</h1>
        <div className="content">
          <img src="photo.png" alt="Profile" className="profile-photo" />
          <p>{content.about[language].text}</p>
        </div>
      </section>
  );
};

export default About;