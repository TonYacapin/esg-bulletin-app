# ESG Bulletin Generator
[![Ask DeepWiki](https://devin.ai/assets/askdeepwiki.png)](https://deepwiki.com/TonYacapin/esg-bulletin-app)

The ESG Bulletin Generator is a web application built with Next.js that empowers users to create customized, professional Environmental, Social, and Governance (ESG) bulletins. It streamlines the process of curating relevant news, generating insightful summaries with AI, and producing a polished, print-ready PDF document.

The application features a multi-step workflow:
1.  **Configure & Fetch:** Users specify search criteria, including keywords, date ranges, jurisdictions, and content types, to fetch relevant ESG news articles from a backend service.
2.  **Select & Customize:** Users select articles from the fetched list, customize AI-generated summaries, and attach relevant images. The application automatically generates key bulletin sections like a greeting message, executive summary, and key trends using the OpenAI API.
3.  **Review & Export:** Users review the fully-assembled bulletin, make final edits to any text section, and export the final document as a PDF.

## Key Features

*   **Dynamic News Fetching:** Retrieves ESG news articles from a secure backend API with robust filtering options.
*   **AI-Powered Content Generation:** Utilizes the OpenAI API (`gpt-3.5-turbo`) to automatically generate various sections of the bulletin, including:
    *   Greeting Messages
    *   Executive Summaries
    *   Key Trends (global and regional)
    *   Article Summaries
    *   Section Titles and Introductions
*   **Interactive Article Curation:** An intuitive interface for selecting articles, with options to view details, customize summaries, and attach images.
*   **Global Coverage Visualization:** An interactive world map displays the geographic distribution of the selected news articles.
*   **In-Place Editing:** All generated text content in the final bulletin preview is editable, allowing for fine-tuning before export.
*   **Themed Outputs:** Supports different visual themes (e.g., Regulatory, Disclosure, Litigation) to match the bulletin's focus.
*   **Print-to-PDF:** Generates a clean, professional, and print-optimized PDF of the final bulletin directly from the browser.
*   **Component-Based UI:** Built with a rich set of modern UI components from **shadcn/ui**.

## Technology Stack

*   **Framework:** [Next.js](https://nextjs.org/) (with App Router)
*   **Language:** [TypeScript](https://www.typescriptlang.org/)
*   **AI & NLP:** [OpenAI API](https://openai.com/docs)
*   **Styling:** [Tailwind CSS](https://tailwindcss.com/)
*   **UI Components:** [shadcn/ui](https://ui.shadcn.com/)
*   **Forms:** [React Hook Form](https://react-hook-form.com/) & [Zod](https://zod.dev/)
*   **Data Visualization:** [React Simple Maps](https://www.react-simple-maps.io/) for the world map
*   **Package Manager:** [pnpm](https://pnpm.io/)

## Getting Started

To run the ESG Bulletin Generator locally, follow these steps.

### Prerequisites

*   Node.js (v18 or newer)
*   pnpm

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/tonyacapin/esg-bulletin-app.git
    cd esg-bulletin-app
    ```

2.  **Install dependencies:**
    ```bash
    pnpm install
    ```

3.  **Set up environment variables:**

    Create a `.env.local` file in the root of the project and add the following variables. These are required for the application to connect to the backend news API and the OpenAI API.

    ```bash
    # OpenAI API Key for generating summaries and other content
    OPENAI_API_KEY="your_openai_api_key"

    # Backend API configuration for fetching news articles
    BACKEND_API_URL="https://your-backend-api-url.com"
    BACKEND_API_TOKEN="your_backend_api_bearer_token"
    BACKEND_API_KEY="your_backend_x_api_key"
    ```

4.  **Run the development server:**
    ```bash
    pnpm dev
    ```

    Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Project Structure

The repository is organized following standard Next.js conventions:

*   `app/`: Contains the main application pages and routing logic using the App Router.
    *   `app/api/`: Houses all API route handlers. These routes act as a secure backend-for-frontend (BFF), managing requests to the OpenAI API and the internal news API.
*   `components/`: Contains the core React components that make up the application's UI.
    *   `components/ui/`: UI primitives and components from `shadcn/ui`.
    *   `BulletinGenerator.tsx`: The main state machine component that controls the application flow.
    *   `BulletinForm.tsx`: The initial form for fetching news.
    *   `ArticleSelector.tsx`: The interface for selecting and configuring articles.
    *   `BulletinOutput.tsx`: The final preview and editing stage for the generated bulletin.
*   `lib/`: Contains utility functions and server actions.
    *   `actions.ts`: A server action for fetching news from the backend API.
*   `hooks/`: Custom React hooks, such as `use-toast`.
*   `public/`: Static assets.

## API Endpoints

The application uses several internal API routes within the `app/api/` directory to handle server-side operations securely.

*   `POST /api/generate-bulletin-content`: This is the primary endpoint for AI content generation. It accepts a `type` (e.g., `greeting`, `key_trends`, `executive_summary`) and a list of `articles` to generate context-aware text for different bulletin sections.
*   `POST /api/generate-article-summary`: Generates a concise, professional summary for a single article based on its content and a system prompt.
*   `GET /api/internal/news/list`: This route acts as a secure proxy to the main backend service. It forwards search and filter parameters and authenticates using server-side environment variables, preventing exposure of API keys on the client side.
