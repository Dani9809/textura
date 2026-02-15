# Textura

Textura is a modern web application that transforms your images into stunning text-based portraits. Upload an image, customize the text, and generate a unique typographic masterpiece in seconds.

## Features

-   **Image to Text Conversion**: Sophisticated algorithm that maps image brightness to text opacity.
-   **Dark/Light Mode**: Seamlessly switch between themes for optimal viewing in any lighting condition.
-   **Interactive Zoom & Pan**: Deep dive into your creations with smooth zoom and drag-to-pan controls.
-   **Customization**:
    -   **Text Content**: Use your own text.
    -   **Fonts**: Choose from Script, Elegant Serif, or Modern Sans-Serif styles.
    -   **Color Modes**: Toggle between Original Color and Black & White.
    -   **Resolution**: Adjustable fine to coarse text sizing.
-   **Security & Performance**:
    -   **Smart Downscaling**: Automatically handles high-resolution images (up to 4K+) without crashing.
    -   **Input Limits**: Enforces a 5MB entry limit and 10,000 character text limit for smooth performance.
-   **Privacy**: All processing happens client-side. Your images are never uploaded to a server.
-   **Export**: Download your creation as a high-quality PNG.

## Tech Stack

-   **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
-   **Language**: [TypeScript](https://www.typescriptlang.org/)
-   **Styling**: [Tailwind CSS](https://tailwindcss.com/)
-   **Theming**: [next-themes](https://github.com/pacocoursey/next-themes)
-   **Icons**: [Lucide React](https://lucide.dev/)

## Getting Started

Follow these steps to set up the project locally.

### Prerequisites

-   [Node.js](https://nodejs.org/) (v18 or higher recommended)
-   npm, yarn, pnpm, or bun

### Installation

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/Dani9809/textura.git
    cd textura
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    # or
    yarn install
    # or
    pnpm install
    ```

3.  **Run the development server:**

    ```bash
    npm run dev
    ```

4.  **Open the application:**

    Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Usage

1.  **Upload**: Drag & drop an image or click to select one.
2.  **Configure**:
    -   Type or paste your desired text.
    -   Select a font style and color mode.
    -   Adjust the "Text Size" slider.
3.  **Generate**: Click "Generate Text Portrait".
4.  **Explore**: Click **Expand** to view in full screen. Use the +/- buttons or scroll to zoom, and drag to pan around the details.
5.  **Save**: Click "Download" to save your art as PNG or JPG.

## License

This project is open source and available under the [MIT License](LICENSE).
