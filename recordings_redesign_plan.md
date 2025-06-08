# Recordings Section Redesign Plan

**Overall Goal:** Redesign the record interpretation area to emphasize album art, consolidate controls, and enhance interactivity.

## Phase 1: Restructure Card Layout & Relocate Controls
*   **Goal:** Move interactive controls to the right side of the card and establish the new basic layout.
*   **Tasks:**
    1.  **Modify `client/src/components/RecordingsSection.tsx`:**
        *   Adjust JSX: Album art (left), recording info (middle/adjusted), new controls container (right).
    2.  **Modify `client/src/components/RecordingsSection.css`:**
        *   Update `.recording-card` styles for the new three-section layout (flexbox/grid).
        *   Remove old positioning for `.play-button` and `.playing-indicator`.
        *   Style the new right-side controls container.

## Phase 2: Implement Consolidated Interactive Button
*   **Goal:** Create the new multi-state interactive button.
*   **Tasks:**
    1.  **Modify `client/src/components/RecordingsSection.tsx`:**
        *   Manage state for button interactions.
        *   Button logic:
            *   Default: Sound icon (`Volume2`).
            *   Hover (not playing): Play icon.
            *   Playing: Sound wave animation (adapted from `.playing-indicator`).
            *   Hover (while playing): Stop icon.
    2.  **Modify `client/src/components/RecordingsSection.css`:**
        *   Style different states of the new button.
        *   Adapt `.sound-wave` animation for use within the button.

## Phase 3: Enlarge and Style Album Art
*   **Goal:** Increase album art size and apply visual styling.
*   **Tasks:**
    1.  **Modify `client/src/components/RecordingsSection.tsx`:**
        *   Use `<img>` tags for album art.
        *   Initially, all front covers will use the placeholder: `client/src/assets/images/front_horowitz_rachmaninoff_rca_1.jpg`.
    2.  **Modify `client/src/components/RecordingsSection.css`:**
        *   Increase album art `width` and `height` by ~25-30% (e.g., `60px` to `75px-78px`).
        *   Add `border-radius` for rounded corners.
        *   Implement a subtle "shine" gradient (e.g., a light, semi-transparent white diagonal linear gradient from top-left to bottom-right) as an overlay.
        *   Add hover effects (e.g., slight change in shine/gradient or subtle scale).
        *   Adjust overall card padding/margins iteratively for balance.

## Phase 4: Implement Expandable Album Art (with Flip Prototype)
*   **Goal:** Allow users to view larger art and prototype a flip-to-back feature.
*   **Tasks:**
    1.  **Modify `client/src/components/RecordingsSection.tsx`:**
        *   Add state for expanded view (`expandedRecordingId`, `isFlipped`).
        *   Implement a modal/overlay for enlarged art.
        *   On art click: trigger expansion.
        *   Flip logic: toggle `isFlipped` state.
            *   Expanded front: `client/src/assets/images/front_horowitz_rachmaninoff_rca_1.jpg`
            *   Expanded back (when flipped): `client/src/assets/images/back_ogdon_rachmaninoff_rca_1.jpg`
        *   Comment placeholders for future liner notes.
    2.  **Modify `client/src/components/RecordingsSection.css`:**
        *   Style the modal/overlay and enlarged art.
        *   Implement CSS for flip animation (e.g., `transform: rotateY(180deg)`, `backface-visibility`).

## Conceptual Card Structure (Mermaid Diagram)
```mermaid
graph LR
    A[Recording Card] --> B(Album Art Container);
    A --> C(Recording Info);
    A --> D(Interactive Controls Container);

    B --> E[img src='front_placeholder.jpg'];
    C --> F[Pianist Name];
    C --> G[Year];
    C --> H[Label];
    D --> I{Consolidated Button Icon};

    style A fill:#f9f9f9,stroke:#333,stroke-width:2px,rx:12,ry:12
    style B fill:#e0e0e0,stroke:#ccc,stroke-width:1px,rx:8,ry:8
    style E fill:#ccc,stroke:#bbb,stroke-width:1px
    style C fill:#f0f0f0,stroke:#ccc,stroke-width:1px
    style D fill:#e8e8e8,stroke:#ccc,stroke-width:1px,rx:8,ry:8
    style I fill:#d0d0d0,stroke:#bbb,stroke-width:1px,rx:50,ry:50