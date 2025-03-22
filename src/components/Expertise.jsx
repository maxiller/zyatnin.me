import React from 'react';
import { content } from '../data/data';

const Expertise = ({ language }) => {
  const tagCount = {};

  content.expertise.tags.forEach(tag => {
    tagCount[tag] = 0;
  });

  content.cases[language].forEach(caseItem => {
    caseItem.tags.forEach(tag => {
      if (tagCount.hasOwnProperty(tag)) {
        tagCount[tag] += 1;
      }
    });
  });

  const jsonLines = ['{'];
  Object.entries(tagCount).forEach(([tag, count], index, array) => {
    const line = `  <span class="json-key">"${tag}"</span>: <span class="json-number">${count}</span>${index < array.length - 1 ? ',' : ''}`;
    jsonLines.push(line);
  });
  jsonLines.push('}');

  return (
      <section className="expertise">
        <h1>{language === 'en' ? 'Expertise' : 'Экспертиза'}</h1>
        <div className="json-display">
          <pre dangerouslySetInnerHTML={{ __html: jsonLines.join('\n') }} />
        </div>
      </section>
  );
};

export default Expertise;