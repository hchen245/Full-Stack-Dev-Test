# Full Stack HVAC Estimate Tool

## Overview

This project is a full-stack HVAC estimate tool that simulates a real-world workflow used by contractors to generate, compare, and export job estimates.

Users can search for customers, select HVAC equipment, input job parameters, and generate multiple pricing options for comparison.

The goal of this project is to demonstrate end-to-end full-stack development, including frontend UI design, backend API integration, and business logic implementation.

---

## What I Built

- A React-based frontend for selecting customers, equipment, and creating estimates
- A backend API that serves customer, equipment, and labor rate data
- A calculation engine that generates multiple estimate tiers (Good / Better / Best)
- A comparison view to evaluate different pricing options side-by-side
- PDF export functionality for generated estimates

---

## DEMO


https://github.com/user-attachments/assets/2c8a296f-bddd-4c44-b727-07a76bf8fdb2


## Tech Stack

- **Frontend:** React (Vite), TailwindCSS
- **Backend:** Python (FastAPI / Flask-style API)
- **Data Layer:** JSON-based mock datasets
- **Tooling:** Axios, html2pdf, fuzzy search utilities

---

## Key Features

### Estimate Generation
- Dynamic pricing based on equipment and labor inputs
- Multi-tier estimate generation (Good / Better / Best)

### Customer & Equipment Selection
- Searchable customer database
- Equipment catalog browsing with filtering

### Estimate Comparison
- Side-by-side comparison of multiple estimate options
- Clear breakdown of cost components

### PDF Export
- Export estimates as professional PDF documents (printable)

---

## Design Decisions

- **React component-based architecture** was used to keep UI modular and reusable
- **Backend API separation** ensures clear division between data and presentation logic
- **JSON mock data** was used to simplify backend setup and focus on core functionality
- **Simple calculation logic** was prioritized over over-engineering to keep business rules transparent

---

### Progressive Web App (PWA) Support

This application is also configured as a Progressive Web App (PWA), allowing users to install it directly onto their device for a more native-like experience.

- Installable on desktop, tablet, and mobile devices
- Can be added to home screen for quick access
- Provides a full-screen app-like interface when installed
- Service Worker enables basic offline support for previously loaded data and pages
- Improves performance through caching of static assets

---

## Tradeoffs

- Used JSON instead of a database to reduce complexity
- No authentication system to focus on core estimation logic
- Basic UI styling instead of heavy UI frameworks to prioritize functionality

---

## Future Improvements&Ideas

- Add a real database (PostgreSQL or MongoDB)
- Implement user authentication and saved quotes
- Improve offline support with local persistence
- Add backend deployment (cloud hosting)
- Expand testing coverage for API and calculation logic
- Improve UI polish and animations
