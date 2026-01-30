# ai-chat-bot

## Overview
This project is a **Shopify App** that provides an AI-powered chatbot for merchants. It integrates with **OpenAI** for conversational capabilities and **Pinecone** for vector-based product search (RAG). The app allows merchants to customize the chatbot's appearance and behavior, manage products, and view chat history.

## Tech Stack
-   **Framework**: [Remix](https://remix.run/) (React Router v7)
-   **Platform**: Node.js
-   **Database**: PostgreSQL (via [Prisma ORM](https://www.prisma.io/))
-   **AI Services**:
    -   **OpenAI**: For generating chat responses.
    -   **Pinecone**: Vector database for semantic product search.
-   **Frontend (Admin)**: React, [Shopify Polaris](https://polaris.shopify.com/)
-   **Frontend (Widget)**: Liquid, Vanilla JS (Theme Extension)
-   **Tooling**: Vite, TypeScript, Docker

## Key Features
1.  **AI Chat Interface**: A widget embedded in the merchant's storefront that allows customers to chat with an AI.
2.  **Product Recommendation**: Uses vector embeddings to understand customer intent and recommend relevant products from the store.
3.  **Admin Dashboard**:
    -   **Customization**: Configure chat window design, colors, and animations.
    -   **Personality**: Define the AI's tone, language, and behavioral policies.
    -   **Chat Management**: View past chat sessions.
    -   **Credits System**: Manage usage limits and billing plans.
4.  **Data Sync**: Background workers to sync Shopify products to the local database and Pinecone index.

## Project Structure

### `app/` (Remix App)
-   **`routes/`**: Defines the application routes.
    -   `app.*`: Admin UI pages (Dashboard, Settings, Credits).
    -   `api.*`: API endpoints for the chat widget and internal operations.
    -   `webhooks.*`: Handlers for Shopify webhooks (e.g., app uninstall).
-   **`components/`**: React components.
    -   `AIPersonalityAndBehavior/`: Components for configuring AI settings.
    -   `CustomizationAndAppearance/`: Components for styling the chat widget.
    -   `ChatbotPreview.tsx`: Preview component for the admin UI.
-   **`services/`**: Business logic layer.
    -   `openaiService.ts`: Interaction with OpenAI API.
    -   `pineconeService.ts`: Vector embedding and search logic.
    -   `productService.ts`: CRUD and sync logic for products.
    -   `creditService.ts`: Logic for managing merchant credits and plans.
-   **`worker/`**: Background scripts.
    -   `syncData.ts`: Syncs products from Shopify to DB and Pinecone.
-   **`shopify.server.ts`**: Shopify app authentication and setup.

### `extensions/` (Shopify Extensions)
-   **`core-script/`**: A Theme App Extension.
    -   `blocks/chatbot_widget.liquid`: The Liquid block that injects the chatbot into the storefront.
    -   `assets/script.js`: Client-side logic for the chatbot widget.
    -   `assets/style.css`: Styles for the widget.

### `prisma/`
-   **`schema.prisma`**: Defines the database models (`Product`, `ChatSession`, `Message`, `MerchantCredits`, etc.).

## Setup & Configuration
-   **Environment Variables**:
    -   `DATABASE_URL`: PostgreSQL connection string.
    -   `OPENAI_API_KEY`: Key for OpenAI API.
    -   `PINECONE_API_KEY`: Key for Pinecone.
    -   `SHOPIFY_API_KEY` / `SHOPIFY_API_SECRET`: App credentials.
-   **Development**:
    -   `npm run dev`: Starts the local development server with Shopify CLI.
    -   `npm run setup`: Runs Prisma migrations.

## Data Flow
1.  **Product Sync**: Shopify Products -> Webhook/Worker -> Prisma DB -> OpenAI Embedding -> Pinecone.
2.  **Chat**: Customer Message -> Widget API -> OpenAI Service -> (Optional RAG via Pinecone) -> Response -> Widget.
