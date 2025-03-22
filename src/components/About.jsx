import React from 'react';
import { content } from '../data/data';

const About = ({ language }) => {
  const aboutContent = content.about[language];

  return (
      <section className="about">
        <div className="content">
          {aboutContent.photo && (
              <img src={aboutContent.photo} alt="Profile" className="profile-photo" />
          )}
          <p>{aboutContent.text}</p>
        </div>
      </section>
  );
};

export default About;