import React from 'react';
import {content} from "../data/data";

const Cases = ({ language }) => {
  return (
    <div className="cases">
      {content.cases.map((caseItem, index) => (
        <div key={index} className="case-item">
          <h2>{caseItem.title[language]}</h2>
          <p>{caseItem.text[language]}</p>
          <ul className="tags">
            {caseItem.tagIds.map((tagId) => (
              <li key={tagId}>{content.tags.find((tag) => tag.id === tagId).name}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};

export default Cases;