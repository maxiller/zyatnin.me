import React from 'react';
import {content} from "../data/data";

const Footer = ({ language }) => {
  return (
    <footer className="footer">
      <p>{content.footer.text[language]}</p>
    </footer>
  );
};

export default Footer;