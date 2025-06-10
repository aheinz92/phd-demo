import React, { useEffect } from 'react';
import { Link } from 'wouter';
import homePageCssUrl from '../styles/home-page.css?url';

const HomePage: React.FC = () => {
  useEffect(() => {
    const link = document.createElement('link');
    link.href = homePageCssUrl;
    link.rel = 'stylesheet';
    link.id = 'home-page-styles';
    document.head.appendChild(link);

    return () => {
      const existingLink = document.getElementById('home-page-styles');
      if (existingLink) {
        document.head.removeChild(existingLink);
      }
    };
  }, []);

  return (
    <div className="home-page-container">
      <div className="home-links-wrapper">
        <h1 className="home-title">Welcome</h1>
        <Link href="/phd-proposal" className="home-link-button">
          Full PhD Proposal
        </Link>
        <Link href="/explorer" className="home-link-button">
          Demo of the Musical Explorer tool
        </Link>
      </div>
    </div>
  );
};

export default HomePage;