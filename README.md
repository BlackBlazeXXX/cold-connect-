# 🚀 Cold Connect

> A modern, AI-powered React application built for performance and scale.

Cold Connect is a cutting-edge web application leveraging the power of generative AI, modern frontend tooling, and real-time database capabilities to deliver a seamless user experience.

## ✨ Features

- **⚡ Lightning Fast:** Powered by [Vite](https://vitejs.dev/) and React 19 for instantaneous hot module replacement and optimized builds.
- **🎨 Beautiful UI:** Styled with [Tailwind CSS v4](https://tailwindcss.com/) and animated smoothly with [Motion](https://motion.dev/).
- **🧠 AI-Integrated:** Utilizes the `@google/genai` SDK to bring intelligent, generative capabilities directly to the user.
- **📊 Data Visualization:** Interactive and responsive charts built with [Recharts](https://recharts.org/), paired with powerful data tables via TanStack Table.
- **🗄️ Robust Backend:** Seamless integration with [Supabase](https://supabase.com/) for authentication, database, and storage.

## 🛠️ Tech Stack

- **Frontend:** React, TypeScript, Tailwind CSS, Vite
- **Data & AI:** Supabase, Google GenAI
- **UI Components:** Lucide Icons, Framer Motion, Recharts

## 🚀 Getting Started

Follow these steps to set up the project locally:

### Prerequisites

Ensure you have Node.js installed on your machine.

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Environment Setup:**
   Create a `.env.local` file in the root directory (you can use `.env.example` as a template) and add your required environment variables:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

3. **Run the development server:**
   ```bash
   npm run dev
   ```

4. **Build for production:**
   ```bash
   npm run build
   ```
