import React from 'react';
import MusicalExplorer from '../components/MusicalExplorer';
import CollapsibleSection from '../components/CollapsibleSection'; // Added import
import '../styles/musical-explorer-page.css';

const MusicalExplorerPage: React.FC = () => {
  return (
    <div className="musical-explorer-page-container">
      <h1>Musical Explorer Showcase</h1>

      <MusicalExplorer />

      <div className="guide-sections-container" style={{ textAlign: 'left', width: '100%', maxWidth: '900px', marginBottom: '2rem' }}>
        <CollapsibleSection title="What is this demo?">
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
  );
};

export default MusicalExplorerPage;