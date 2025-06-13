import React, { useEffect } from 'react';
import { Link } from 'wouter';
import proposalPageCssUrl from '../styles/phd-proposal-page.css?url';
import MusicalExplorerPageWrapper from '../components/MusicalExplorer';
import CollapsibleSection from '../components/CollapsibleSection';

const PhdProposalPage: React.FC = () => {
  useEffect(() => {
    // Create a new link element
    const link = document.createElement('link');
    link.href = proposalPageCssUrl;
    link.rel = 'stylesheet';
    link.id = 'phd-proposal-styles'; // Add an ID for easy removal

    // Append to head
    document.head.appendChild(link);

    // Cleanup function to remove the stylesheet when the component unmounts
    return () => {
      const existingLink = document.getElementById('phd-proposal-styles');
      if (existingLink) {
        document.head.removeChild(existingLink);
      }
    };
  }, []); // Empty dependency array ensures this runs only on mount and unmount

  useEffect(() => {
    const sections = document.querySelectorAll('.container > section');

    const options = {
      root: null, // relative to document viewport
      rootMargin: '0px',
      threshold: 0.1, // 10% of section visible
    };

    const observer = new IntersectionObserver((entries, observerInstance) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          // Optional: Stop observing the element after it has become visible
          observerInstance.unobserve(entry.target);
        }
      });
    }, options);

    sections.forEach(section => {
      observer.observe(section);
    });

    // Cleanup function
    return () => {
      observer.disconnect();
    };
  }, []); // Empty dependency array ensures this runs only once after the initial render
useEffect(() => {
    const literatureReviewSection = document.getElementById('literature'); // CORRECTED ID
    if (!literatureReviewSection) {
      return;
    }

    const detailsElements = Array.from(literatureReviewSection.querySelectorAll<HTMLDetailsElement>('details.expandable-table')); // Made selector more specific
    const expandAllButton = document.getElementById('expand-all-button') as HTMLButtonElement | null;
    const collapseAllButton = document.getElementById('collapse-all-button') as HTMLButtonElement | null;

    const detailsToggleHandlers: Array<{ element: HTMLDetailsElement; handler: () => void }> = [];

    detailsElements.forEach(detailsEl => {
      const summaryEl = detailsEl.querySelector('summary');
      if (!summaryEl) return;

      // Initialize ARIA attributes and data-open based on initial 'open' state
      const initialIsOpen = detailsEl.open;
      summaryEl.setAttribute('aria-expanded', initialIsOpen.toString());
      detailsEl.dataset.open = initialIsOpen.toString();

      const handleToggle = () => {
        const currentOpenState = detailsEl.open; // This reflects the NEW state after the toggle
        summaryEl.setAttribute('aria-expanded', currentOpenState.toString());
        detailsEl.dataset.open = currentOpenState.toString();

        // Log active element to check focus (summary should retain focus natively)
        setTimeout(() => {
          if (document.activeElement !== summaryEl) {
            summaryEl.focus(); // Explicitly re-focus if lost
          }
        }, 0);
      };

      detailsEl.addEventListener('toggle', handleToggle);
      detailsToggleHandlers.push({ element: detailsEl, handler: handleToggle });
    });

    const handleExpandAll = () => {
      detailsElements.forEach(detailsEl => {
        if (!detailsEl.open) {
          detailsEl.open = true;
        }
        detailsEl.dataset.open = 'true';
        const summaryEl = detailsEl.querySelector('summary');
        if (summaryEl) {
          summaryEl.setAttribute('aria-expanded', 'true');
        }
      });
    };

    const handleCollapseAll = () => {
      detailsElements.forEach(detailsEl => {
        if (detailsEl.open) {
          detailsEl.open = false;
        }
        detailsEl.dataset.open = 'false';
        const summaryEl = detailsEl.querySelector('summary');
        if (summaryEl) {
          summaryEl.setAttribute('aria-expanded', 'false');
        }
      });
    };

    if (expandAllButton) {
      expandAllButton.addEventListener('click', handleExpandAll);
    } else {
    }

    if (collapseAllButton) {
      collapseAllButton.addEventListener('click', handleCollapseAll);
    } else {
    }

    return () => {
      detailsToggleHandlers.forEach(({ element, handler }) => {
        element.removeEventListener('toggle', handler);
      });
      if (expandAllButton) {
        expandAllButton.removeEventListener('click', handleExpandAll);
      }
      if (collapseAllButton) {
        collapseAllButton.removeEventListener('click', handleCollapseAll);
      }
    };
  }, []); // Empty dependency array: runs once on mount, cleans up on unmount
return (
    <>
      <header>
        <svg id="header-ornament" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
          <path d="M100 10 C 80 30, 70 60, 80 80 C 90 100, 110 100, 120 80 C 130 60, 120 30, 100 10 Z
                   M100 190 C 120 170, 130 140, 120 120 C 110 100, 90 100, 80 120 C 70 140, 80 170, 100 190 Z
                   M10 100 C 30 80, 60 70, 80 80 C 100 90, 100 110, 80 120 C 60 130, 30 120, 10 100 Z
                   M190 100 C 170 120, 140 130, 120 120 C 100 110, 100 90, 120 80 C 140 70, 170 80, 190 100 Z
                   M50 50 C 60 40, 75 45, 80 60 C 85 75, 75 90, 60 90 C 45 90, 35 75, 40 60 C 45 45, 40 40, 50 50 Z
                   M150 50 C 160 40, 175 45, 180 60 C 185 75, 175 90, 160 90 C 145 90, 135 75, 140 60 C 145 45, 140 40, 150 50 Z
                   M50 150 C 60 160, 75 155, 80 140 C 85 125, 75 110, 60 110 C 45 110, 35 125, 40 140 C 45 155, 40 160, 50 150 Z
                   M150 150 C 160 160, 175 155, 180 140 C 185 125, 175 110, 160 110 C 145 110, 135 125, 140 140 C 145 155, 140 160, 150 150 Z
                   " fillRule="evenodd"/>
        </svg>

        <h1>Algorithmic Pathways towards the Exploration of Musical Interpretation</h1>
        <p className="subtitle">A PhD research proposal to develop computational methodologies for novel engagement in comparative listening</p>
        <div className="waveform">
            <div className="waveform-bar" /> <div className="waveform-bar" /> <div className="waveform-bar" />
            <div className="waveform-bar" /> <div className="waveform-bar" /> <div className="waveform-bar" />
            <div className="waveform-bar" /> <div className="waveform-bar" /> <div className="waveform-bar" />
            <div className="waveform-bar" /> <div className="waveform-bar" /> <div className="waveform-bar" />
        </div>
        <div className="scroll-indicator">
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 5v14M5 12l7 7 7-7"/>
            </svg>
        </div>
      </header>

      <div className="container">
        <section id="introduction">
            <h2>I. Introduction</h2>
            <p>Classical music, particularly the piano repertoire, thrives on the nuance of interpretation. The same score yields vastly different experiences in the hands of different artists across time. While the practice of comparative listening - contrasting different interpretations - is central to deep appreciation and learning, it faces significant hurdles. Human listeners are invariably limited by time, effort, attention span, memory, and cognitive biases when attempting to perceive differences across numerous recordings.</p>
            <br />
            <p>Furthermore, the sheer scale of available recordings presents a daunting challenge: hundreds of acclaimed interpretations exist for countless pieces, making thorough manual comparison practically impossible, especially for longer works. This proposal outlines a PhD project aimed at overcoming these limitations by developing a novel machine learning methodology coupled with an intuitive interface and platform to facilitate the exploration and enjoyment of the rich variety of classical piano recordings at scale.</p>
            <br />
            <p>The goal is not merely technological advancement, but to deepen our connection to musical artistry, making the profound experience of comparative listening more accessible and fostering a renewed appreciation for classical music - especially the diverse perspectives on it that exist but are often underacknowledged. The desire is to draw attention to what is often hiding in plain sight with regards to the perception of classical music: that it is the unique artistic perspectives and variations in musical rendering that create the magic behind the score and allow it to continue to live and breathe, today and in the future. A project like this can both enhance the ability to see and experience the richness of diverse interpretations, and furthermore steer the greater discourse towards celebrating these differences and unique qualities, rather than promoting an idea that music is about reaching a predetermined perfection. This immediacy of seeing, hearing, understanding, and appreciating the real scope and beauty of artistic variance is hoped to aid a change in perspectives and work towards a necessary tonal shift in the treatment of classical music as a whole.</p>
        </section>

        <section id="relevance">
             <h2>II. Goals & Significance</h2>
             <p>This research addresses a critical intersection of artistic tradition, technological opportunity, and cultural imperative. Its significance is multifaceted, contributing to several key domains:</p>
             <div className="grid-section">
                 <div className="card">
                     <h3>Enhancing Musical Experience, Engagement, and Cultural Connection</h3>
                     <p>This project aims to deepen the artistic experience for musicians and scholars by providing tools to explore expressive nuances in performance, fostering new analytical perspectives and enriching interpretation. Furthermore, it seeks to foster broader listener engagement through intuitive interfaces that make complex musical subtleties more accessible and enjoyable. By offering a new lens for appreciating diverse musical traditions, the research also contributes to their cultural revitalization, making unique characteristics more tangible and supporting their preservation.</p>
                 </div>
                 <div className="card">
                     <h3>Broaden Perspectives and Reinvigorate the Art Form</h3>
                     <p>This project seeks to move beyond technological novelty to foster a deeper connection with musical artistry. By making comparative listening more accessible, it aims to highlight often underacknowledged diverse perspectives within classical music. The core idea is to reveal how unique artistic interpretations and variations in performance are what truly animate a musical score, allowing it to resonate across time. Ultimately, this work endeavors to enhance the experience of interpretive richness, encourage a celebration of these differences, and contribute to a broader shift in appreciating classical music not as a pursuit of singular perfection, but as a vibrant, evolving art form shaped by diverse voices.</p>
                 </div>
                 <div className="card">
                     <h3>Advancing Music Information Retrieval (MIR)</h3>
                     <p>This research will contribute to the field of Music Information Retrieval by forging new methodologies for the nuanced comparative analysis of musical performances. It tackles the sophisticated challenge of algorithmically identifying and characterizing subtle interpretive differences, thereby pushing the current boundaries of computational musicology.</p>
                 </div>
                 <div className="card">
                     <h3>Establishing Broader Scholarly Relevance</h3>
                     <p>The broader scholarly relevance of this project lies in its timely and innovative response to the challenges and opportunities presented by large-scale digital music archives. It addresses a critical need for sophisticated tools that can help navigate and extract meaning from this vast interpretive landscape - a task for which human cognition has inherent limitations, but for which current technological capabilities, particularly in machine learning, offer unprecedented and promising solutions.</p>
                 </div>
                 <div className="card">
                     <h3>Enhancing Music Pedagogy</h3>
                     <p>This research offers substantial pedagogical potential by equipping music students and educators with powerful new analytical tools for the study of performance practice. The capacity to efficiently compare and deconstruct diverse interpretations promises to significantly enhance critical listening skills and foster a more profound understanding of musical artistry and interpretive traditions.</p>
                 </div>
             </div>
        </section>

         <section id="research-questions">
            <h2>III. Research Questions</h2>
            <ol>
                <li>How can machine learning methodologies effectively detect, quantify, and characterize interpretive differences (e.g., timing, dynamics, articulation, phrasing) between performances of the same classical piano composition, scalable to large datasets?</li>
                <li>What visualization and interaction paradigms, integrated with audio playback, best communicate these nuanced interpretive differences to both expert and novice listeners in an engaging and informative manner?</li>
                <li>How can an interactive comparative listening tool be designed to encourage exploration, discovery, and deeper engagement with the classical piano repertoire, potentially overcoming barriers faced by new listeners?</li>
                <li>What are the potential further applications and impacts of such computational tools, potentially in music education settings (for teaching performance practice and listening skills), in an expansion to other genres and forms of music, or in the deeper analysis of the psychological workings of musical expression and experience?</li>
            </ol>
        </section>

        <section id="methodology">
            <h2>IV. Proposed Methodology</h2>
            <p>This research employs a mixed-methods approach, combining computational analysis with human-centered design and evaluation.</p>
            <div className="grid-section">
                <div className="card-container">
                    <div className="card">
                        <h3>1. Machine Learning Core</h3>
                        <p>Develop a pipeline for:</p>
                        <ul className="musical-list">
                            <li>Precise audio alignment to compare equivalent passages despite tempo and dynamic variations.</li>
                            <li>Extraction of musically relevant features primarily focused on timing and dynamics (volume), approximating MIDI-like data capture.</li>
                            <li>Difference modeling using techniques like contrastive learning, attention mechanisms, Bayesian methods (e.g., inspired by Guichaoua et al., 2024), or specialized network architectures to identify and quantify interpretive variations.</li>
                            <li>Ensuring scalability for large recording datasets like MazurkaBL (Kosa et al., 2018) or beyond.</li>
                        </ul>
                    </div>
                    <div className="connector-wrapper">
                        <div className="connector-icon">
                            <i className="fas fa-plus"></i>
                        </div>
                    </div>
                </div>
                <div className="card-container">
                    <div className="card">
                        <h3>2. Exploration Tool</h3>
                        <p>Design and build an interactive web interface featuring:</p>
                        <ul className="musical-list">
                            <li>Intuitive recording selection and comparison setup.</li>
                            <li>Novel visualizations synchronized with audio playback (e.g., comparative timelines, dynamic contours, feature highlighting inspired by Cook (2007) or Zhou & Fabian (2021) but automated and interactive).</li>
                            <li>Navigation based on similarity or specific performance characteristics, potentially outliers or clusters of interpretations.</li>
                            <li>Ability to seamlessly play contrasting interpretations in key moments, to empower an immediacy and clarity of understanding and enjoyment.</li>
                        </ul>
                    </div>
                    <div className="connector-wrapper">
                        <div className="connector-icon">
                            <i className="fas fa-arrow-down"></i>
                        </div>
                    </div>
                </div>
                <div className="card-container">
                    <div className="card">
                        <h3>3. Evaluation</h3>
                         <p>Assess the system through:</p>
                         <ul className="musical-list">
                             <li>Quantitative evaluation of ML model accuracy against ground truth or established datasets.</li>
                             <li>Qualitative and quantitative user studies with diverse participants (novices, experts, educators) to evaluate the frontend's usability, effectiveness, and impact on engagement, perhaps drawing inspiration from Repp's (1997) experimental approach but focused on the tool.</li>
                             <li>Case studies exploring further pedagogical applications, uses in other genres, benefits to music appreciation, and theories about the art of music itself.</li>
                         </ul>
                    </div>
                    {/* No connector after the last card */}
                </div>
            </div>
        </section>

        <section id="interactive-musical-exploration">

          <h2>V. Demo: Interactive Musical Exploration</h2>

          <details className="expandable-table prototype-guide-details">
            <summary>Guide to the prototype</summary>
            
            <div className="table-content-wrapper">
              <div className="demo-instructions">
                <CollapsibleSection title="What is This Demo?">
                  <p>
                    This is a high-fidelity prototype envisioning how this platform for exploring musical interpretations can be designed.
                    It simulates the detection of variance (differences) among musical interpretations, particularly detecting on specific musical sections found to have the widest range of expression. This allows for direct comparative listening of these key moments across various recordings, while also visualizing this analysis across a timeline.
                    It aims to make the fascinating and often surprising world of differing musical interpretations more immediately accessible, engaging, and focused for everyone.
                  </p>
                </CollapsibleSection>
                <CollapsibleSection title="Key Features">
                  <ul>
                    <li><strong>Focused Listening:</strong> Access a curated library of short audio clips for two distinct musical sections (Section A and Section B), allowing for targeted comparison.</li>
                    <li><strong>Interpretive Variance Graphs:</strong> View line graphs that conceptually represent the differences in interpretation between recordings across the timeline, which overall represents a zoomed-in section of a larger musical work.</li>
                    <li><strong>Interactive Timeline with Flexible Playhead Control:</strong> Visually manipulate a timeline with a playhead. The playhead can snap to highlighted "moments of interest" within the musical passage, and responds as expected to a variety of user interactions.</li>
                    <li><strong>Recording Selection:</strong> Cards for available recordings automatically populate for each section. (Currently, six curated recordings are shown per section; a future platform would feature many more, with sorting/filtering options).</li>
                    <li><strong>Hover and Click Interactions:</strong> Hovering over a recording card highlights its corresponding line on the chart, while clicking on a card keeps its line highlighted until another card is clicked.</li>
                    <li><strong>Album Art Explorer:</strong> Click on any recording's album cover to see a larger version. Click the enlarged cover again to flip it and view its "back," which includes a magnifier tool. Use your mouse scroll wheel to adjust the magnifier's zoom level to read small text. Click outside the enlarged image to close it.</li>
                    <li><strong>Robust Audio Playback:</strong> Smoothly start, stop, and pause playback. Playback can be seamlessly interrupted by selecting another track, switching to a different musical section, or moving the playhead.</li>
                    <li><strong>Dynamic Visualization:</strong> The line graph corresponding to the currently playing recording is automatically highlighted on the chart, and the playhead moves across the section during playback.</li>
                  </ul>
                </CollapsibleSection>
                <CollapsibleSection title="Suggested Walkthrough">
                  <ul>
                    <li><strong>1. </strong> Play around with clicking and dragging the playhead around the timeline. By moving it into a highlighted musical section, it will snap to it, and the list of audio clips will appear for that specific section.</li>
                    <li><strong>2. </strong> Hover over other recording cards to see their lines temporarily light up on the chart. Clicking the general area of a card makes its line stay highlighted.</li>
                    <li><strong>3. </strong> Click on a recording's album cover to enlarge it, and click the large cover again to flip to the back, where you can change the magnifier with the mouse scroll wheel. Click anywhere outside the image to close it.</li>
                    <li><strong>4. </strong> Play a recording with the play button. The line will stay highlighted during playback, and the playhead will begin moving.</li>
                    <li><strong>5. </strong> Play a recording with the play button. The line will stay highlighted during playback, and the playhead will begin moving.</li>
                    <li><strong>6. </strong> Select a recording from Section A or Section B by clicking its card.</li>
                    <li><strong>7. </strong> I recommend listening to at least two recordings in <em>each</em> highlighted section (A and B) to experience the differences in interpretation. Of course, I would love if you gave them all a listen!</li>
                  </ul>
                </CollapsibleSection>
                <CollapsibleSection title="Important Caveats">
                  <p><strong>The Music & Selections are Real:</strong> The chosen musical excerpts and the specific recordings are real and were very carefully and intentionally curated from a huge library. I believe that listening to them closely and contrasting them can be a revelatory experience.</p>
                  <p><strong>Visualizations are for Demonstration Purposes Only:</strong> The lines you see on the chart are generated mathematically purely for <em>demonstration</em>. They are an <em>imagining</em> of what a visualization of interpretive variance might look like after processing audio files and charting their deviation from a calculated average. <em>These lines do not actually correlate precisely with the musical content of the recordings.</em> While a general attempt was made to align them with perceived differences, they are not scientifically accurate representations for these specific clips.
                    The overall highlighted time range (e.g., "0:53 to 5:38") and the specific timestamps displayed by the playhead as it moves are <em>approximate and not strictly correct</em>. They serve as visual aids for this demonstration.</p>
                </CollapsibleSection>
              </div>
            </div>
          </details>

          <div id="musical-explorer-instance">
            <MusicalExplorerPageWrapper />
          </div>
          <div style={{ textAlign: 'center', fontSize: 'small', marginTop: '2.5rem', marginBottom: '1rem' }}>
            To view this demo on its own dedicated page, <Link href="/explorer" className="inline-link">click here</Link>.
          </div>
        </section>

        <section id="literature">
            <h2>VI. Review of Literature</h2>
            <p>This project builds upon decades of research evolving from manual analysis to sophisticated computational methods in Music Information Retrieval (MIR), audio signal processing, machine learning, and computational musicology. Early efforts often involved manual data creation, while recent work has finally begun leveraging algorithmic processing and large datasets.</p>
 
            <details className="expandable-table">
                <summary>Table 1: Selected Literature on Music Data Analysis</summary>
                <div className="table-content-wrapper">
                    <table className="literature-table">
                        <thead>
                            <tr>
                                <th className="col-author" title="Author(s) of the publication">Author(s)</th>
                                <th className="col-journal" title="Journal or Conference Venue">Venue</th>
                                <th className="col-year" title="Year of Publication">Year</th>
                                <th className="col-type" title="Type of Publication (e.g., experiment, dataset, method)">Type</th>
                                <th className="col-subject" title="Musical Subject Matter and Repertoire Studied">Subject & Repertoire</th>
                                <th className="col-recordings" title="Number of Recordings Analyzed"># Rec.</th>
                                <th className="col-process" title="Primary Methodology or Process Used">Methodology</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td className="col-author">Repp</td>
                                <td className="col-journal">Music Perception</td>
                                <td className="col-year">1997</td>
                                <td className="col-type"><span className="highlight-green">experiment</span></td>
                                <td className="col-subject">Piano: Schumann & Chopin (non-mazurkas)</td>
                                <td className="col-recordings">41</td>
                                <td className="col-process"><span className="highlight-red">Manual</span></td>
                            </tr>
                            <tr>
                                <td className="col-author">Cook</td>
                                <td className="col-journal">Musicae Scientiae</td>
                                <td className="col-year">2007</td>
                                <td className="col-type">Method + Case</td>
                                <td className="col-subject">Piano: <span className="highlight-green">Chopin mazurkas</span> (2 pieces)</td>
                                <td className="col-recordings">50</td>
                                <td className="col-process"><span className="highlight-red">Manual</span> + <span className="abbr" title="Algorithmic">Algo</span> (tempo)</td>
                            </tr>
                            <tr>
                                <td className="col-author">Sapp</td>
                                <td className="col-journal">ISMIR<sup>a</sup></td>
                                <td className="col-year">2008</td>
                                <td className="col-type">Method + Case</td>
                                <td className="col-subject">Piano: <span className="highlight-green">Chopin mazurkas</span> (5 pieces)</td>
                                <td className="col-recordings">232</td>
                                <td className="col-process"><span className="abbr" title="Algorithmic">Algo</span> (hybrid similarity metrics)</td>
                            </tr>
                            <tr>
                                <td className="col-author">Liem, Hanjalic</td>
                                <td className="col-journal">ISMIR<sup>a</sup></td>
                                <td className="col-year">2015</td>
                                <td className="col-type">Method + Case</td>
                                <td className="col-subject"><span className="highlight-blue">Orchestra</span>: Beethoven, R. Strauss</td>
                                <td className="col-recordings">31</td>
                                <td className="col-process"><span className="abbr" title="Algorithmic">Algo</span> (image-based)</td>
                            </tr>
                            <tr>
                                <td className="col-author">Dorfer et al.</td>
                                <td className="col-journal">ISMIR<sup>a</sup></td>
                                <td className="col-year">2016</td>
                                <td className="col-type">Methodology</td>
                                <td className="col-subject">Piano (general)</td>
                                <td className="col-recordings">—</td>
                                <td className="col-process"><span className="highlight-blue">Neural nets</span> (score following)</td>
                            </tr>
                            <tr>
                                <td className="col-author">Kosta et al.</td>
                                <td className="col-journal">TENOR<sup>b</sup></td>
                                <td className="col-year">2018</td>
                                <td className="col-type"><span className="highlight-blue">Dataset</span> + Method</td>
                                <td className="col-subject">Piano: <span className="highlight-green">Chopin mazurkas</span></td>
                                <td className="col-recordings">2,239</td>
                                <td className="col-process"><span className="highlight-red">Manual</span> + <span className="abbr" title="Algorithmic">Algo</span> (score-aligned data)</td>
                            </tr>
                            <tr>
                                <td className="col-author">Yanchenko, Hoff</td>
                                <td className="col-journal">Ann. Applied Stats</td>
                                <td className="col-year">2020</td>
                                <td className="col-type">Method + Case</td>
                                <td className="col-subject"><span className="highlight-blue">Orchestra</span>: Beethoven</td>
                                <td className="col-recordings">370</td>
                                <td className="col-process"><span className="abbr" title="Algorithmic">Algo</span> (hierarchical <span className="abbr" title="Multidimensional Scaling">MDS</span>)</td>
                            </tr>
                            <tr>
                                <td className="col-author">Zhou, Fabian</td>
                                <td className="col-journal">Musicae Scientiae</td>
                                <td className="col-year">2021</td>
                                <td className="col-type">Method + Case</td>
                                <td className="col-subject">Piano: Chopin (non-mazurkas)</td>
                                <td className="col-recordings">2</td>
                                <td className="col-process"><span className="highlight-red">Manual</span> (3D tempo model)</td>
                            </tr>
                            <tr>
                                <td className="col-author">Zhang et al.</td>
                                <td className="col-journal">ISMIR<sup>a</sup></td>
                                <td className="col-year">2024</td>
                                <td className="col-type"><span className="highlight-blue">Dataset</span> + Method + Case</td>
                                <td className="col-subject">Piano: Chopin</td>
                                <td className="col-recordings">137</td>
                                <td className="col-process"><span className="highlight-red">Manual</span> + <span className="highlight-blue">ML models</span> (expertise ranking)</td>
                            </tr>
                            <tr>
                                <td className="col-author">Guichaoua et al.</td>
                                <td className="col-journal">Music & Science</td>
                                <td className="col-year">2024</td>
                                <td className="col-type">Method + Case</td>
                                <td className="col-subject">Piano: <span className="highlight-green">Chopin mazurkas</span></td>
                                <td className="col-recordings">37</td>
                                <td className="col-process"><span className="abbr" title="Algorithmic">Algo</span> (Bayesian segmentation)</td>
                            </tr>
                        </tbody>
                    </table>
                    <div className="table-footnotes">
                        <p><b>Table 1.</b> Selected journal and conference papers that have contributed research, ordered chronologically and
                        categorized by the type of research, the type of music used as a target of analysis, the volume of pieces
                        analyzed, and the applied process. Colors highlight some notable features, either due to their infrequency
                        (non-methodological paper types) or those that are repeated (categories of musical subject matter).</p>
                        <br></br>
                        <p><sup>a</sup> International Society for Music Information Retrieval</p>
                        <p><sup>b</sup> Technologies for Music Notation and Representation</p>
                    </div>
                </div>
            </details>

            <div className="lit-review-section">
                 <div className="lit-review-item">
                    <h3>Foundations in Performance Analysis</h3>
                    <p>Early influential work involved breaking down performances into core components. Repp (1997) conducted experiments using digitally manipulated piano performances to isolate and evaluate specific attributes like timing and dynamics, even creating an "average" performance computationally. Cook (2007) applied early computational methods alongside manual analysis to study Chopin Mazurkas, highlighting the potential and challenges.</p>
                </div>
                <div className="lit-review-item">
                    <h3>Methodological Development & Datasets</h3>
                    <p>The field has seen numerous methodological proposals, often tested via case studies. Piano music, especially Chopin's Mazurkas, became a common focus due to its suitability for developing analytical techniques (Sapp, 2008; Kosta et al., 2018; Guichaoua et al., 2024). Methodologies evolved from hybrid numeric/rank metrics (Sapp, 2008) and manual/algorithmic approaches (Cook, 2007) to complex algorithmic techniques like hierarchical multidimensional scaling for orchestral works (Yanchenko & Hoff, 2020) and end-to-end Bayesian segmentation for piano (Guichaoua et al., 2024). The creation of large, annotated datasets like MazurkaBL (Kosta et al., 2018), containing score-aligned data for thousands of recordings, has been crucial for training and validating modern approaches.</p>
                </div>
                 <div className="lit-review-item">
                    <h3>Machine Learning & Modern Approaches</h3>
                    <p>Recent advancements leverage machine learning, including neural networks for tasks like score following (Dorfer et al., 2016) and deep learning for feature extraction and comparison (Zhang et al., 2024). Techniques from other domains, such as image-based analysis (Liem & Hanjalic, 2015) or methods like Siamese networks and contrastive learning, are being adapted for nuanced audio comparison. There's significant overlap with AI music generation research, as both fields tackle the challenge of deconstructing and understanding musical components.</p>
                </div>
            </div>
            <br />
            <div className="publication-venues-section">
                <h4>Key Publication Venues</h4>
                <p>The research in this proposal aligns with and draws from work frequently presented in the following key academic venues and communities:</p>
                <ul>
                    <li><strong>ISMIR (International Society for Music Information Retrieval):</strong> Primarily publishes through its annual international conference proceedings. Key papers often focus on computational analysis of music, music recommendation, and music data mining.</li>
                    <li><strong>TENOR (Technologies for Music Notation and Representation):</strong> Focuses on its international conference proceedings (International Conference on Technologies for Music Notation and Representation). Explores digital technologies for music notation, representation, and interaction, including Optical Music Recognition (OMR), digital editions, and new forms of musical scores.</li>
                    <li><strong>Musicae Scientiae:</strong> The Journal of the European Society for the Cognitive Sciences of Music (ESCOM). Publishes empirical, theoretical, and methodological articles on music cognition, perception, and performance.</li>
                    <li><strong>Music Perception:</strong> An Interdisciplinary Journal. Publishes original empirical and theoretical papers on the perception and cognition of music, often covering topics like psychoacoustics, musical development, and cross-cultural music perception.</li>
                </ul>
            </div>
        </section>

        <section id="research-context">
            <h2>VII. Research Context: Who, Where, & When</h2>
            
            <h3>Why me?</h3>
            <div className="musical-list-section">
                <p>My background provides a unique foundation for this interdisciplinary project:</p>
                <ul className="qualifications-list">
                    <li><strong>Interdisciplinary Academics:</strong> Double degree in Informatics and German Studies, plus prior university studies in Computer Science and Music, demonstrating a long-term commitment to integrating technology, data analysis, arts, and humanities.</li>
                    <li><strong>Initiative for Research:</strong> Successfully designed and executed self-guided research projects (e.g., self-conducted independent study courses, a critical Spotify API analysis for classical and solo piano repertoire, a sentiment analysis in Schubert's art song texts, etc.), showcasing proactive independent research capabilities specifically with unique music and data intersections.</li>
                    <li><strong>Technical Skills:</strong> Proficiency in several coding languages, data visualization tools, AI frameworks, and full-stack web development fundamentals.</li>
                    <li><strong>Domain Passion:</strong> Decades of passionate engagement with classical piano, including extensive cataloging of massive libraries for comparative listening (~4,000 records & ~75,000 tracks individually curated), translation work to expand audience accessibility of art songs, special analysis projects, and broadcasting. This project directly addresses long-held research interests.</li>
                    <li><strong>Communication Aptitude:</strong> Experience translating complex musical ideas into accessible formats for broad audiences (e.g., via broadcasting and content creation with musical performance and discussion).</li>
                </ul>
            </div>

            <h3>Why here?</h3>
            <div className="musical-list-section">
                <p>The University of Washington offers an unparalleled environment for this research:</p>
                <ul className="musical-list">
                    <li><strong>Interdisciplinary Hub:</strong> UW excels at fostering collaboration across departments like the iSchool, Computer Science & Engineering, Music, and DXARTS, providing access to world-class faculty in ML, HCI, MIR, digital humanities, and musicology.</li>
                    <li><strong>Leading Research:</strong> Home to leading researchers and labs in relevant areas, including established ML/AI groups, HCI labs, and MIR researchers with expertise directly applicable to this project.</li>
                    <li><strong>Technological Ecosystem:</strong> Seattle's position as a global tech hub provides a rich environment, potential industry connections, and access to cutting-edge developments.</li>
                    <li><strong>Vibrant Arts Community:</strong> The city's strong support for the arts, including the renowned Seattle Symphony and vibrant local music scenes, offers potential for local impact, collaboration, and user study recruitment.</li>
                </ul>
            </div>

            <h3>Why now?</h3>
            <div className="musical-list-section">
                <p>The timing is right for this research due to several key factors:</p>
                <ul className="musical-list">
                    <li><strong>Catching Up to a Long-Term Vision:</strong> I first had this idea 10 years ago and have always returned to it - what seemed unrealistic then has become feasible due to advances in machine learning and audio processing capabilities.</li>
                    <li><strong>Machine Learning Maturity:</strong> Recent developments in ML have made large-scale audio analysis practical and accessible. The tools needed for sophisticated comparative analysis of musical performances are now available and well-documented.</li>
                    <li><strong>Growing Research Foundation:</strong> Academic work in music information retrieval and computational musicology has established methodological foundations for this type of research, providing proven approaches to build upon.</li>
                </ul>
            </div>
        </section>

        <section id="timeline">
            <h2>VIII. The Path Forward: Timeline & Milestones</h2>
            <p>A phased approach ensures manageable progress and allows for adaptation:</p>
            <div className="timeline">
            <div className="card" style={{ marginBottom: '2rem' }}>
                <h3>Ensuring Methodological Feasibility</h3>
                <p>The project's feasibility is underpinned by a research phases that leverage established audio processing techniques and contemporary machine learning advancements. The initial focus on solo piano repertoire is ideal as a well-defined domain, data-rich for robust methodological development, systematic testing, and thorough validation.</p>
            </div>
                <div className="timeline-item">
                    <div className="timeline-content">
                        <h4>Phase 1 (Year 1): Foundation & Methodology</h4>
                        <p>Deepen literature review, refine research questions, collect initial dataset (e.g., focusing on Chopin Mazurkas). Develop and validate core audio alignment and feature extraction pipeline. Implement first-generation difference detection models.</p>
                        <br /><p><strong>Milestone:</strong> 'First-generation' processing methodology; presentable preliminary results.</p>
                    </div>
                </div>
                <div className="timeline-item">
                    <div className="timeline-content">
                        <h4>Phase 1 (Year 2): Model Refinement & Prototyping</h4>
                        <p>Refine ML models (e.g., exploring Bayesian or contrastive approaches), explore advanced architectures. Focus on further design, prototyping, and implementation of real processed data with the interactive frontend. Conduct initial feasibility tests and small-scale evaluations.</p>
                        <br /><p><strong>Milestone:</strong> Improved ML models; initial frontend prototype; potential conference paper [e.g., ISMIR].</p>
                    </div>
                </div>
                 <div className="timeline-item">
                    <div className="timeline-content">
                        <h4>Phase 2 (Year 3): Frontend Development & Integration</h4>
                        <p>Develop functional web-based exploration tool, integrating ML backend analysis. Refine the implementations of core visualizations and interactions. Begin usability testing with target user groups.</p>
                        <br /><p><strong>Milestone:</strong> Working prototype of the interactive tool; publication on methodology/prototype.</p>
                    </div>
                </div>
                 <div className="timeline-item">
                    <div className="timeline-content">
                        <h4>Phase 2 (Year 4): User Evaluation & Scaling</h4>
                        <p>Conduct comprehensive user studies (qualitative/quantitative) with diverse participants. Scale analysis pipeline to a larger corpus/different repertoire. Refine tool based on feedback. Explore initial pedagogical applications.</p>
                        <br /><p><strong>Milestone:</strong> User study results published; robust & scalable analysis pipeline.</p>
                    </div>
                </div>
                 <div className="timeline-item">
                    <div className="timeline-content">
                        <h4>Phase 3 (Year 5+): Expansion, Synthesis & Dissemination</h4>
                        <p>Explore potential expansions (e.g., other instruments, broader analysis features). Address revitalization goals more directly. Finalize research, write and defend dissertation. Seek high-impact publications.</p>
                        <br /><p><strong>Milestone:</strong> Completed dissertation; publications in higher-tier venues; potential public release/outreach component; grant applications for future work.</p>
                    </div>
                </div>
            </div>
        </section>

         <section id="ethics">
            <h2>IX. Ethical Considerations</h2>
            <div className="musical-list-section">
                <p>While aiming to enhance appreciation, potential risks must be addressed:</p>
                <ul className="musical-list">
                    <li><strong>Copyright:</strong> Primarily utilizing commercially available recordings for analysis under fair use principles for research. Focusing on feature analysis rather than audio redistribution unless licensed. Ensuring proper attribution to artists and labels. Exploring future viable licensing options as the exploration tool approaches the opportunity for wider public access.</li>
                    <li><strong>Algorithmic Bias & Impact on Artistry:</strong> Acknowledging potential biases in recording availability and algorithmic analysis. Critically considering how analytical tools might influence performance practice – avoiding over-centralization around an "average" or conversely, over-valuing algorithmically flagged "uniqueness" at the expense of musicality. The goal is to provide insight, not dictate artistic norms.</li>
                    <li><strong>Data Representation:</strong> Ensuring that the chosen features and models capture musically meaningful aspects of interpretation, rather than arbitrary signal characteristics.</li>
                    <li><strong>User Privacy:</strong> Ensuring anonymity and data security if user interaction data is collected during evaluations.</li>
                    <li><strong>Accessibility:</strong> Designing the frontend tool with accessibility principles in mind for diverse users.</li>
                </ul>
            </div>
        </section>

         <section id="references">
            <h2>X. References</h2>
            <div className="lit-review-section">
                <ul style={{ fontSize: '0.9rem', listStyleType: 'none', paddingLeft: 0, marginTop: '1rem' }}>
                    <li>Cook, N. (2007). Performance analysis and Chopin's mazurkas. <i>Musicae Scientiae, 11</i>(2), 183-207. https://doi.org/10.1177/102986490701100203</li>
                    <li>Dorfer, M., Arzt, A., & Widmer, G. (2016). Towards score following in sheet music images. <i>Proceedings of the 17th International Society for Music Information Retrieval Conference (ISMIR)</i>. https://doi.org/10.48550/arXiv.1612.05050</li>
                    <li>Guichaoua, C., Lascabettes, P., & Chew, E. (2024). End-to-end Bayesian segmentation and similarity assessment of performed music tempo and dynamics without score information. <i>Music & Science, 7</i>. https://doi.org/10.1177/20592043241233411</li>
                    <li>Kosta, K., Bandtlow, O. F., & Chew, E. (2018). MazurkaBL: Score-aligned loudness, beat, and expressive markings data for 2,000 Chopin mazurka recordings. <i>Proceedings of the 4th International Conference on Technologies for Music Notation and Representation (TENOR)</i>, 85-94.</li>
                    <li>Liem, C. C. S., & Hanjalic, A. (2015). Comparative analysis of orchestral performance recordings: An image-based approach. <i>Proceedings of the 16th International Society for Music Information Retrieval Conference (ISMIR)</i>, 302-308.</li>
                    <li>Müller, M. (2015). <i>Fundamentals of Music Processing</i>. Springer.</li>
                    <li>Repp, B. H. (1997). The aesthetic quality of a quantitatively average music performance: Two preliminary experiments. <i>Music Perception, 14</i>(4), 419-444. https://doi.org/10.2307/40285732</li>
                    <li>Sapp, C. S. (2008). Hybrid numeric/rank similarity metrics for musical performance analysis. <i>Proceedings of the 9th International Society for Music Information Retrieval Conference (ISMIR)</i>, 501-506.</li>
                    <li>Widmer, G. (2016). Getting Closer to the Essence of Music: The Mazurka Project. <i>ACM Transactions on Intelligent Systems and Technology (TIST), 7</i>(3), 1-26. https://doi.org/10.1145/2724718</li>
                    <li>Yanchenko, A. K., & Hoff, P. D. (2020). Hierarchical multidimensional scaling for the comparison of musical performance styles. <i>Annals of Applied Statistics, 14</i>(4), 1581-1603. https://doi.org/10.1214/20-AOAS1391</li>
                    <li>Zhang, H., Liang, J., & Dixon, S. (2024). From audio encoders to piano judges: benchmarking performance understanding for solo piano. <i>arXiv preprint arXiv:2407.04518</i>. https://doi.org/10.48550/arXiv.2407.04518</li>
                    <li>Zhou, D. Q., & Fabian, D. (2021). A three-dimensional model for evaluating individual differences in tempo and tempo variation in musical performance. <i>Musicae Scientiae, 25</i>(2), 252-267. https://doi.org/10.1177/1029864919873193</li>
                </ul>
            </div>
        </section>
        <div className="author-credit">
          by Austin Heinz
        </div>
        <div className="author-credit-year">
          2025
        </div>
      </div>
    </>
  );
};

export default PhdProposalPage;