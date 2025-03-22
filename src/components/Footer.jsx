import React from 'react';
import { content } from '../data/data';

const Footer = ({ language }) => {
  const footerContent = content.footer[language];

  return (
      <footer className="footer">
        {footerContent.text}
      </footer>
  );
};

export default Footer;