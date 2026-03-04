# 🚀 Peter · Interactive DevOps Portfolio & Documentation Hub

> A next-generation, interactive portfolio designed to showcase DevOps engineering capabilities. Built with Astro Islands, it features live, browser-based simulators of complex infrastructure concepts wrapped in a modern, glassmorphic UI.

![Astro](https://img.shields.io/badge/Astro-5.x-FF5D01?style=for-the-badge&logo=astro&logoColor=white)
![Preact](https://img.shields.io/badge/Preact-10.x-673AB7?style=for-the-badge&logo=preact&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white)

## ✨ Key Features

This portfolio goes beyond static text by implementing **functional infrastructure simulators** directly in the browser:

*   🖥️ **Interactive UNIX Terminal:** A fully functional terminal emulator built into the Hero section. Supports real commands (`kubectl`, `docker`, `terraform`), auto-completion `[TAB]`, command history, and custom DevOps easter eggs.
*   ⚙️ **DevOps Simulators (Preact Islands):** +12 interactive simulators that visually demonstrate complex concepts:
    *   **Argo Rollouts:** Simulates Canary, Blue-Green, and Rolling deployment strategies with realistic `kubectl` terminal logs and Kubelet lifecycle events.
    *   **GitOps Flow:** An action graph representing proper pipeline stages with synchronous propagation delays (Cold Starts, Image Builds).
    *   *And more:* Pod Lifecycle, Service Mesh (Istio), Zero Trust Security, Database HA, etc.
*   🏝️ **Astro Islands Architecture:** Extreme performance achieved by hydrating JavaScript *only* where necessary (Zero-JS by default).
*   🌍 **Native i18n (EN/ES):** Deep internationalization using **Nano Stores** (`@nanostores/preact`). State is shared across isolated Preact islands without reloading the page.
*   🧊 **Glassmorphic Design System:** Premium UI/UX featuring custom CSS variables, backdrop filters, and a responsive dark/light theme.
*   🧊 **3D Integration:** Asynchronous rendering of 3D Spline models (`@splinetool/react-spline`) that respect Astro's SSR capabilities.

## 🏗️ Architecture & Tech Stack

The project leverages a hybrid SSG/SSR approach to deliver maximum performance while keeping complex interactivity isolated.

| Category | Technology | Purpose |
| :--- | :--- | :--- |
| **Framework** | [Astro 5](https://astro.build/) | Core framework, routing, and static generation. |
| **Interactive UI** | [Preact](https://preactjs.com/) | Lightweight rendering for heavy simulators and terminal. |
| **3D Rendering** | React | Lazy-loaded exclusively for Spline 3D integrations. |
| **State Management** | Nano Stores | Cross-island state sharing (e.g., Language Toggle). |
| **Content** | Astro Collections | Zod-validated Markdown for portfolio entries. |
| **Styling** | Custom CSS | Pure CSS with Design Tokens (No Tailwind). |

## 📂 Project Structure

```text
src/
├── components/     # Preact/React Islands (Terminal, Simulators, 3D)
├── content/work/   # Portfolio projects in Markdown (EN/ES)
├── i18n/           # Translation dictionaries and routing utils
├── store/          # Nano Stores state management (languageStore.ts)
├── pages/          # Astro dynamic routes and static pages
└── styles/         # Global CSS and Design Tokens (global.css)
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- npm or pnpm

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/yourusername/portfolio-astro.git

# 2. Install dependencies
npm install

# 3. Start the development server
npm run dev
```

Visit `http://localhost:4321` to view the interactive portfolio.

### Build & Production

```bash
# Build for production
npm run build

# Preview the production build locally
npm run preview
```

## 🛠️ DevOps Skills Highlighted in this Portfolio

*   **Container Orchestration:** Kubernetes, Docker, Talos OS
*   **Progressive Delivery:** Argo Rollouts, ArgoCD
*   **Cloud & Infrastructure:** Terraform, GitOps
*   **Networking & Security:** Istio Ambient Mesh, Zero Trust
*   **Observability:** Prometheus, Grafana

---
*Designed & Developed by Peter.*
