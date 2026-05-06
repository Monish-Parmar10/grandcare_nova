# GrandCare

GrandCare is a highly accessible web application frontend designed specifically for elderly users (60+) and community helpers. It focuses on large typography, high-contrast colors, minimal navigation steps, and relatable UI/UX to ensure a frictionless experience for users with low tech-literacy.

## 🚀 How to Run the Frontend

This project is built with React, Vite, and Tailwind CSS v4.

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm run dev
   ```

3. **Open the App:**
   Navigate to `http://localhost:5173` in your browser.

## 🎨 UI/UX Philosophy (Elder-Friendly)

- **Typography First:** Base font size is increased. We use clean, sans-serif fonts for legibility.
- **High Contrast:** Colors are chosen to provide maximum contrast (e.g., strong blues, dark text on light backgrounds).
- **Large Touch Targets:** Buttons (`LargeButton.jsx`) and Cards (`Card.jsx`) are designed to be easily tappable on mobile devices, reducing frustration from misclicks.
- **Minimal Steps:** Core actions (e.g., SOS, taking medicine, asking for help) are accessible with 1 or 2 clicks from the dashboard.
- **Clear Labeling:** Icons are always accompanied by clear, jargon-free text (e.g., "Need Help" instead of just an icon).

## 🛠 Project Structure

- `src/components/`: Reusable, accessible UI components.
- `src/context/`: Local state management using React Context to simulate a backend.
- `src/data/`: Mock JSON data used for initial testing.
- `src/pages/`: Distinct views for Auth, Elder flows, and Helper flows.
- `src/routes/`: Router setups restricting access based on user role.

## 📄 Data Contracts

For details on the expected backend API shapes and models, please refer to:
[docs/data-contracts.md](docs/data-contracts.md)
