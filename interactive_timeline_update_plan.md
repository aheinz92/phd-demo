# Plan: Interactive Timeline Element Overlay

**Objective:** Modify the `InteractiveTimeline` component so that the "Interpretive Variance" title and the bottom time display overlay the SVG chart area, rather than appearing to occupy separate vertical space. This will ensure the component's height is strictly determined by the chart's visual area.

**Files to Modify:**

1.  [`client/src/components/InteractiveTimeline.tsx`](client/src/components/InteractiveTimeline.tsx)
2.  [`client/src/components/InteractiveTimeline.css`](client/src/components/InteractiveTimeline.css)

**Detailed Plan:**

1.  **Analyze Current Layout (Completed):**
    *   The main container (`.timeline-container`) uses `position: relative`.
    *   The title (`.timeline-title`) is an SVG `<text>` element positioned with `x` and `y` attributes within the SVG.
    *   The SVG chart (`.timeline-svg`) defines the main visual area.
    *   The bottom time display (`.timeline-time-display`) is a `div` already using `position: absolute; bottom: 0;`.
    *   The container height is fixed at `14.4rem`. The title and time display, due to their current positioning (SVG internal and absolute positioning respectively), do not expand this height. The issue is their visual placement at the extreme edges.

2.  **Implement Overlay for Title:**
    *   **File:** [`client/src/components/InteractiveTimeline.tsx`](client/src/components/InteractiveTimeline.tsx)
    *   **Action:** Modify the `y` attribute of the `<text className="timeline-title">` element.
    *   **Change:** From `y="20"` to `y="35"` (SVG units).
    *   **Reasoning:** This will lower the title's baseline, moving it visually down into the chart area, away from the top edge of the SVG's `viewBox`.
    *   **Mermaid Diagram:**
        ```mermaid
        graph TD
            subgraph SVG ViewBox (y from 20 to 200)
                TopEdge[ViewBox Top (y=20)]
                ChartContent[Chart Visual Content Area]
                OriginalTitle["Original Title (baseline at y=20)"]
                NewTitle["Proposed New Title (baseline at y=35)"]
                TopEdge --- OriginalTitle
                NewTitle --- ChartContent
                OriginalTitle --- ChartContent
            end
        ```

3.  **Implement Overlay for Bottom Time Display:**
    *   **File:** [`client/src/components/InteractiveTimeline.css`](client/src/components/InteractiveTimeline.css)
    *   **Action:** Modify the `bottom` CSS property for the `.timeline-time-display` selector.
    *   **Change:** From `bottom: 0;` to `bottom: 5px;` (or `0.25rem`).
    *   **Reasoning:** This will lift the time display slightly from the absolute bottom of the container, making it appear more integrated within the chart's visual boundaries.
    *   **Mermaid Diagram:**
        ```mermaid
        graph TD
            subgraph Timeline Container (height: 14.4rem)
                ChartArea[SVG Chart Area (fills container)]
                BottomEdge[Container Bottom Edge]
                OriginalTimeDisplay["Original Time Display (bottom: 0)"]
                NewTimeDisplay["Proposed New Time Display (bottom: 5px)"]
                ChartArea --- BottomEdge
                OriginalTimeDisplay --- BottomEdge
                NewTimeDisplay -- Floats above --- BottomEdge
                NewTimeDisplay --- ChartArea
            end
        ```

4.  **Verify Container Sizing:**
    *   Confirm that the `.timeline-container`'s height remains strictly determined by its CSS `height: 14.4rem;` and that the overlaid text elements do not expand this container. The use of `overflow: hidden;` on the container and the nature of the positioning changes (SVG internal `y` attribute and CSS `absolute` positioning) ensure this.

This plan will be passed to the Code mode for implementation.