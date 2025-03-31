import React from 'react';
import {content} from "../data/data";


const Expertise = ({ language }) => {
  return (
    <div className="expertise">
      <ul className="tags">
        {content.expertise.tags.map((tag, index) => (
          <li key={index}>{tag}</li>
        ))}
      </ul>
    </div>
  );
};

export default Expertise;