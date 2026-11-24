<div align="center">

# 📄 Image2PDF

**Fast, Free & 100% Private Client-Side Image to PDF Converter**

Convert JPG, PNG, WebP, SVG, AVIF, BMP, and GIF images into a clean, single PDF document directly in your browser.  
Zero file uploads. Zero server logs. Zero watermarks.

[![Live Demo](https://img.shields.io/badge/Demo-image2pdf.github.io-DC2626?style=for-the-badge&logo=google-chrome&logoColor=white)](https://image2pdf.github.io/)
[![Support](https://img.shields.io/badge/Support-Buy%20a%20Coffee-FF813F?style=for-the-badge&logo=gumroad&logoColor=white)](https://kisharadilshan.gumroad.com/coffee)

<br />

[![Astro](https://img.shields.io/badge/Astro-5.x%20%7C%204.x-BC52EE?style=flat-square&logo=astro&logoColor=white)](https://astro.build/)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-06B6D4?style=flat-square&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![pdf-lib](https://img.shields.io/badge/pdf--lib-1.17-E53E3E?style=flat-square&logo=adobe-acrobat-reader&logoColor=white)](https://pdf-lib.js.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-emerald.svg?style=flat-square)](https://opensource.org/licenses/MIT)
[![Privacy: Zero Cloud](https://img.shields.io/badge/Privacy-100%25%20Local%20RAM-success?style=flat-square&logo=shield)](https://image2pdf.github.io/)
[![GitHub Pages](https://img.shields.io/badge/Deployment-GitHub_Pages-222222?style=flat-square&logo=github)](https://image2pdf.github.io/)

<br />

<img src="https://res.cloudinary.com/dpx6w78bt/image/upload/f_auto/q_auto/v1786342039/Online_Tool_rc1ybr.png" alt="Image2PDF Preview Banner" width="850" style="border-radius: 12px; box-shadow: 0 8px 30px rgba(0,0,0,0.12);" />

</div>

---

## 🌟 Overview

**Image2PDF** (`image2pdf.github.io`) is an ultra-fast, privacy-first web utility engineered to combine multiple images into a professional, high-resolution PDF document entirely inside the user's browser.

Unlike conventional cloud-based converters that upload sensitive documents to remote servers, Image2PDF processes every pixel inside device RAM using HTML5 Canvas and `pdf-lib`. Once the web page is loaded, you can even disconnect your internet and compile PDFs completely offline.

---

## 🚀 Key Features

- **🔒 100% Zero-Cloud Privacy:** Files never touch any cloud server. Perfect for sensitive documents like government IDs, passports, tax forms, and medical receipts.
- **⚡ Instant Processing:** Eliminates slow upload/download queues. High-speed compilation powered by client-side JavaScript and Canvas rasterization.
- **🖼️ Broad Format Compatibility:** Supports **JPG, JPEG, PNG, WebP, SVG, AVIF, BMP, and GIF**.
- **🔄 Per-Page Rotation:** Rotate individual images 90° clockwise with automatic dimension recalculation.
- **🔀 Drag-and-Drop Reordering:** Easily rearrange page sequences by dragging cards or using sequence arrow buttons.
- **📐 Flexible Page Layouts:**
  - **Sizes:** Standard A4 (210 × 297 mm), US Letter (8.5 × 11 in), and Fit-to-Image dimensions.
  - **Orientations:** Auto-detect (matches aspect ratio), Portrait, or Landscape.
  - **Margins:** None (0 mm), Small (5 mm), Standard (10 mm).
- **📋 Clipboard Paste Support:** Paste images directly from your clipboard (`Ctrl+V` / `Cmd+V`).
- **✏️ Custom Filename:** Specify your desired output filename before downloading.
- **🚫 Zero Watermarks & Limits:** No artificial page caps, file size throttles, or branding watermarks.
- **📱 100% Responsive UI:** Pixel-perfect experience on desktop, tablet, and mobile browsers.

---

## 🛠️ Tech Stack & Architecture

| Technology | Purpose |
| :--- | :--- |
| **[Astro](https://astro.build/)** | Ultra-performant Static Site Generation (SSG) with minimal JavaScript footprint |
| **[React](https://react.dev/)** | Dynamic interactive converter island loaded via `client:load` |
| **[Tailwind CSS](https://tailwindcss.com/)** | Utility-first styling with custom breakpoints and PDF Red branding |
| **[pdf-lib](https://pdf-lib.js.org/)** | In-browser creation and modification of PDF documents |
| **[HTML5 Canvas API](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)** | Image rasterization, dimension calculations, and orientation rotation |
| **[Lucide React](https://lucide.dev/)** | Lightweight, accessible vector UI icons |
| **[GitHub Pages](https://pages.github.com/)** | Automated zero-downtime CI/CD deployment via GitHub Actions |

---

## ⚙️ How It Works (Client-Side Pipeline)

```mermaid
flowchart LR
    A[Upload Images / Paste Clipboard] --> B[HTML5 Canvas Pipeline]
    B --> C{Needs Normalization?}
    C -- WebP / SVG / Rotation --> D[Rasterize to Canvas & Export JPEG/PNG Bytes]
    C -- Direct JPEG/PNG --> E[Extract Raw ArrayBuffer]
    D --> F[pdf-lib PDFDocument]
    E --> F
    F --> G[Calculate Page Dimensions & Margins]
    G --> H[Embed Image & Assemble Pages]
    H --> I[Generate Uint8Array PDF Blob]
    I --> J[Trigger Instant Browser Download]
```

---

## 📂 Project Structure

```text
image2pdf.github.io/
├── .github/
│   └── workflows/
│       └── deploy.yml          # Automated GitHub Pages CI/CD workflow
├── public/
│   ├── favicon.svg             # Vector PDF brand icon
│   ├── robots.txt              # Search crawler directives
│   └── sitemap.xml             # Search engine XML sitemap
├── src/
│   ├── components/
│   │   └── ImageToPdf.jsx      # Core React converter studio (drag, rotate, compile)
│   ├── layouts/
│   │   └── Layout.astro        # Base layout, meta tags, OpenGraph, JSON-LD, analytics
│   ├── pages/
│   │   └── index.astro         # Main landing page with SEO copy and FAQ schema
│   ├── styles/
│   │   └── global.css          # Tailwind base & custom styles
│   └── env.d.ts                # TypeScript environment declarations
├── astro.config.mjs            # Astro configuration
├── package.json                # Project dependencies and npm scripts
├── tailwind.config.mjs         # Tailwind CSS custom themes and screen sizes
├── tsconfig.json               # TypeScript configuration
└── README.md                   # Project documentation
```

---

## 🚦 Getting Started

### Prerequisites

- **[Node.js](https://nodejs.org/)** `v18.17.0` or higher
- **npm** `v9.0.0` or higher (or `pnpm` / `yarn`)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/image2pdf/image2pdf.github.io.git
   cd image2pdf.github.io
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the local development server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:4321](http://localhost:4321) in your browser to test the application.

4. **Build for production:**
   ```bash
   npm run build
   ```
   The compiled static files will be generated in the `dist/` directory.

5. **Preview the production build locally:**
   ```bash
   npm run preview
   ```

---

## 🛡️ Privacy & Security Guarantee

Image2PDF is built from the ground up on the principle of **Zero-Knowledge Data Processing**:
- **No Remote Servers:** All conversions execute exclusively within your browser's local sandbox.
- **No Third-Party Analytics Tracking of Uploads:** File metadata and contents are never logged, tracked, or transmitted.
- **RAM-Only Lifecycle:** Images exist solely in browser memory for the duration of the conversion and are cleared upon page refresh.
- **Offline Support:** The application works completely without an internet connection once cached by the browser.

---

## 🔍 Technical SEO & Accessibility

- **Google Rich Results Ready:** Comprehensive Schema.org JSON-LD `@graph` including `WebApplication`, `HowTo`, `FAQPage`, `BreadcrumbList`, and `Organization`.
- **Social Graph Optimization:** Full Open Graph (OG) and Twitter Card tags configured with 1200×630 high-resolution assets.
- **Accessibility:** Semantic HTML5 landmarks (`<header>`, `<main>`, `<article>`, `<footer>`), keyboard navigable controls, and full ARIA labeling adhering to WCAG AAA standards.
- **Performance:** Pre-rendered Astro SSG with zero layout shifts (CLS: 0) and sub-second Time to First Byte (TTFB).

---

## 🤝 Contributing

Contributions, bug reports, and feature requests are welcome!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'feat: add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## ☕ Support the Developer

If you find this free, privacy-focused tool useful, consider supporting its development and maintenance:

[![Support on Gumroad](https://img.shields.io/badge/Support%20the%20Developer-Gumroad-FF813F?style=for-the-badge&logo=gumroad&logoColor=white)](https://kisharadilshan.gumroad.com/coffee)

---

## 📄 License

Distributed under the **MIT License**. See [`LICENSE`](LICENSE) for more information.

---

<div align="center">
  <sub>Built with ❤️ for privacy, speed, and simplicity.</sub>
</div>
