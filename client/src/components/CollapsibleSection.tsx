import React, { useState, ReactNode, useId } from 'react';

interface CollapsibleSectionProps {
  title: string;
  children: ReactNode;
  initialOpen?: boolean;
  className?: string;
  titleElementType?: 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'div';
}

const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
  title,
  children,
  initialOpen = false,
  className = '',
  titleElementType = 'h4', // Defaulting to h4 as the content being wrapped uses h4
}) => {
  const [isOpen, setIsOpen] = useState(initialOpen);
  const contentId = useId(); // Generate a unique ID for ARIA

  const toggleOpen = () => {
    setIsOpen(!isOpen);
  };

  const TitleElement = titleElementType;

  return (
    <div className={`collapsible-section-phd ${className}`}>
      <TitleElement
        className="collapsible-title-phd"
        onClick={toggleOpen}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault(); // Prevent page scroll on spacebar
            toggleOpen();
          }
        }}
        role="button"
        tabIndex={0}
        aria-expanded={isOpen}
        aria-controls={contentId} // Links the button to the content region
      >
        <span className={`arrow-phd ${isOpen ? 'expanded' : 'collapsed'}`}>&#9660;</span> {/* Downwards arrow */}
        {title}
      </TitleElement>
      <div
        id={contentId}
        className={`collapsible-content-phd ${isOpen ? 'open' : ''}`}
        role="region" // ARIA role for the collapsible content
        aria-hidden={!isOpen}
      >
        <div className="collapsible-content-inner-phd">
          {children}
        </div>
      </div>
    </div>
  );
};

export default CollapsibleSection;