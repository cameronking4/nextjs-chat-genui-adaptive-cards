# Adaptive Cards Chat

A Next.js chat application that uses Adaptive Cards to render dynamic, interactive responses.

## Features

- Chat interface with AI-powered responses
- Dynamic rendering of Adaptive Cards for structured data
- Interactive card elements (buttons, forms, etc.)
- Card action handling via API endpoints

## What are Adaptive Cards?

[Adaptive Cards](https://adaptivecards.io/) are a platform-agnostic way to exchange content in a common and consistent way. They are:

- **Portable** - Cards render natively across platforms and applications
- **Expressive** - Cards support rich layouts, inputs, and actions
- **Open** - The format is open-source and standardized

## Implementation Details

This project implements Adaptive Cards in a chat interface using:

- Next.js App Router for the application framework
- AI SDK for chat functionality
- Adaptive Cards SDK for rendering interactive cards
- Tailwind CSS for styling

### Key Components

1. **AdaptiveCard Component** (`app/adaptive-card.tsx`)
   - Renders Adaptive Cards from JSON
   - Handles card actions and user interactions
   - Communicates with the backend API

2. **Chat API** (`app/api/chat/route.ts`)
   - Processes chat messages
   - Instructs the AI model to generate Adaptive Cards when appropriate
   - Provides a welcome card for new users

3. **Card Action API** (`app/api/card-action/route.ts`)
   - Handles actions from Adaptive Cards (form submissions, button clicks, etc.)
   - Processes different action types (feedback, quizzes, to-do items, etc.)

4. **Adaptive Cards Utilities** (`lib/adaptive-cards.ts`)
   - Provides card templates for common use cases
   - Includes utility functions for working with cards
   - Handles variable replacement in templates

## Card Types

The application supports various types of Adaptive Cards:

1. **Welcome Card** - Shown to new users
2. **Weather Card** - Displays weather information
3. **To-Do List Card** - Interactive to-do list management
4. **Quiz/Poll Card** - Interactive quizzes and polls
5. **Error Card** - Displays error messages

## Example Card JSON

Here's an example of a simple Adaptive Card:

```json
{
  "type": "AdaptiveCard",
  "version": "1.5",
  "body": [
    {
      "type": "TextBlock",
      "size": "Medium",
      "weight": "Bolder",
      "text": "Card Title"
    },
    {
      "type": "TextBlock",
      "text": "This is a simple Adaptive Card with text content.",
      "wrap": true
    }
  ],
  "actions": [
    {
      "type": "Action.Submit",
      "title": "Submit",
      "data": {
        "action": "submitAction"
      }
    }
  ]
}
```

## How to Use

1. Start a conversation in the chat interface
2. For certain types of information, the AI will respond with an Adaptive Card
3. Interact with the card elements (buttons, forms, etc.)
4. Card actions will be processed by the backend API

## Development

### Prerequisites

- Node.js 18+
- npm or pnpm

### Setup

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
   or
   ```
   pnpm install
   ```

3. Create a `.env` file with your API keys:
   ```
   OPENAI_API_KEY=your_openai_api_key
   ```

4. Start the development server:
   ```
   npm run dev
   ```
   or
   ```
   pnpm dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Resources

- [Adaptive Cards Documentation](https://adaptivecards.io/documentation/)
- [Adaptive Cards Designer](https://adaptivecards.io/designer/)
- [Adaptive Cards SDK](https://www.npmjs.com/package/adaptivecards)
- [Next.js Documentation](https://nextjs.org/docs)
- [AI SDK Documentation](https://sdk.vercel.ai/docs)
