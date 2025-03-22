import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { content } from '../data/data';

const Cases = ({ language }) => {
  const [searchParams] = useSearchParams();
  const selectedTag = searchParams.get('tag');
  const [filteredCases, setFilteredCases] = useState(content.cases[language]);
  const [expandedCase, setExpandedCase] = useState(null);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (selectedTag) {
      setFilteredCases(
          content.cases[language].filter(caseItem =>
              caseItem.tags.includes(selectedTag)
          )
      );
    } else {
      setFilteredCases(content.cases[language]);
    }
  }, [selectedTag, language]);

  const toggleCase = index => {
    setExpandedCase(expandedCase === index ? null : index);
  };

  const getPreviewText = (text, title) => {
    const padding = 20;
    const availableWidth = Math.floor(windowWidth / 16) - padding;
    const titleLength = title.length + 6;
    const maxTextLength = availableWidth - titleLength;
    return text.length > maxTextLength
        ? text.substring(0, maxTextLength) + '...'
        : text;
  };

  const renderJson = (obj, isExpanded) => {
    const previewText = getPreviewText(obj.text, obj.title);

    if (!isExpanded) {
      return (
          <span>
          {`{ `}<span className="json-string">"{obj.title}"</span>: <span className="json-string">"{previewText}"</span>{`}`}
        </span>
      );
    }

    return (
        <span>
        {`{\n`}
          {`  `}<span className="json-key">"case"</span>: <span className="json-string">"{obj.title}"</span>{`,\n`}
          {`  `}<span className="json-key">"text"</span>: <span className="json-string">"{obj.text}"</span>{`,\n`}
          {`  `}<span className="json-key">"tags"</span>: <span className="json-array">[{obj.tags.map(tag => `"${tag}"`).join(', ')}]</span>{`\n`}
          {`}`}
      </span>
    );
  };

  return (
      <section className="cases">
        <div className="case-list">
          {filteredCases.map((item, index) => {
            const isExpanded = expandedCase === index;
            return (
                <div
                    key={index}
                    className={`case-item ${isExpanded ? 'expanded' : ''}`}
                    onClick={() => toggleCase(index)}
                >
                  <pre>{renderJson(item, isExpanded)}</pre>
                </div>
            );
          })}
        </div>
      </section>
  );
};

export default Cases;