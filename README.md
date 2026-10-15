# Fieldwork - OSM Spatial Guard Rails Workbench

### A safer preview and review workspace for OpenStreetMap editing

## About the Project

Fieldwork is a web-based prototype inspired by **OpenStreetMap (OSM)**, an open-source mapping platform used to create and maintain geographic data. Map editing requires careful attention to road connections, imagery alignment, and descriptive tags because small mistakes can affect the accuracy and usability of maps.

Fieldwork explores how a review workspace could help users identify potential issues and examine possible solutions before approving map changes. Instead of directly modifying map data, it provides interactive previews and guided checks in a single interface.

## Problem Statement

Map edits may contain issues such as misaligned imagery, disconnected roads, or incorrect descriptive tags. These problems can be difficult to notice without a structured review process.

Fieldwork addresses this challenge by providing a visual workspace where users can inspect common mapping scenarios, explore possible corrections, and complete review checks before marking a task as reviewed.

## Key Features

- **Imagery Alignment:** Adjusts the imagery preview to help users understand alignment differences between aerial imagery and road geometry.
- **Road Connection Preview:** Allows users to explore options such as connecting a road, considering a bridge, or leaving the road unchanged.
- **Tag Inspector:** Flags potentially suspicious values in the `name` tag for further inspection.
- **Review Desk:** Guides users through the required checks and allows them to add a review note before completing a simulated review.
- **Interactive Interface:** Uses a multi-page layout to separate tasks and make the workflow easier to understand.

## Technologies Used

- **HTML5** — Structures the web pages and interface elements.
- **CSS3** — Handles styling, layout, visual design, and responsiveness.
- **JavaScript** — Implements interactions, preview controls, validation, and dynamic interface updates.
- **JSON** — Stores sample mapping data and task information.
- **Git and GitHub** — Used for version control and project hosting.

## Implementation

The application is organised into separate files, each with a specific responsibility:

- `index.html` defines the main structure of the application.
- `style.css` provides the visual design and page layouts.
- `script.js` manages interactive features and review workflows.
- `data.json` contains sample data used by the prototype.

JavaScript connects the interface elements with the sample data and updates the displayed information based on user actions. The individual workflows demonstrate how potential mapping issues can be inspected before a review is completed.

## Scope and Limitations

Fieldwork is an educational prototype that demonstrates a possible approach to safer map-editing reviews. It uses sample data and simulated workflows. It does not connect to the live OpenStreetMap editing API, automatically correct real map data, or submit actual changes to OSM.

The project focuses on improving the review experience through visual previews, guided inspection, and structured checks.

## Future Enhancements

- Integrate real OpenStreetMap data and mapping services.
- Add more advanced validation rules for roads and tags.
- Introduce before-and-after comparisons for proposed edits.
- Support saving review history and tracking completed tasks.

## Conclusion

Fieldwork demonstrates how a thoughtfully designed web application can make map-editing reviews more structured and understandable. By combining interactive previews with guided checks, the project explores a practical way to encourage more careful and reliable OpenStreetMap editing.

---

**Project Type:** Full Stack Development — Mid-Trimester Examination  
**Domain:** OpenStreetMap, Geographic Data, and Web Development
