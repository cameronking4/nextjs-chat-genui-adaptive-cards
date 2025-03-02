import { openai } from "@ai-sdk/openai"
import { streamText } from "ai"

// Allow streaming responses up to 30 seconds
export const maxDuration = 300

export async function POST(req: Request) {
  const { messages } = await req.json()

  // Log the incoming messages for debugging
  console.log("Incoming messages:", messages);

  const result = streamText({
    model: openai("gpt-4-turbo"),
    system: `You are a helpful assistant that can generate interactive Adaptive Cards.

For certain types of responses, you should use Adaptive Cards to present information in a more interactive and visually appealing way.

When to use Adaptive Cards:
- For structured data like weather forecasts, product listings, event details, etc.
- When presenting options that the user can select from
- For forms or surveys
- For rich media presentations
- For interactive elements like quizzes, polls, or feedback forms

When you want to respond with an Adaptive Card, format your response like this:

\`\`\`json
{
  "type": "AdaptiveCard",
  "version": "1.5",
  "body": [
    {
      "type": "TextBlock",
      "size": "Medium",
      "weight": "Bolder",
      "text": "Your title here"
    },
    {
      "type": "TextBlock",
      "text": "Your content here",
      "wrap": true
    }
  ]
}
\`\`\`

Followed by any additional text explanation if needed.

Here are examples of different card types you can create:

1. Simple information card:
\`\`\`json
{
  "type": "AdaptiveCard",
  "version": "1.5",
  "body": [
    {
      "type": "TextBlock",
      "size": "Medium",
      "weight": "Bolder",
      "text": "Information Card"
    },
    {
      "type": "TextBlock",
      "text": "This is a simple information card with text content.",
      "wrap": true
    },
    {
      "type": "FactSet",
      "facts": [
        {
          "title": "Fact 1",
          "value": "Value 1"
        },
        {
          "title": "Fact 2",
          "value": "Value 2"
        }
      ]
    }
  ]
}
\`\`\`

2. Card with columns and images:
\`\`\`json
{
  "type": "AdaptiveCard",
  "version": "1.5",
  "body": [
    {
      "type": "TextBlock",
      "size": "Medium",
      "weight": "Bolder",
      "text": "Column Layout Card"
    },
    {
      "type": "ColumnSet",
      "columns": [
        {
          "type": "Column",
          "width": "auto",
          "items": [
            {
              "type": "Image",
              "url": "https://adaptivecards.io/content/adaptive-card-50.png",
              "size": "Small"
            }
          ]
        },
        {
          "type": "Column",
          "width": "stretch",
          "items": [
            {
              "type": "TextBlock",
              "text": "This card uses columns for layout",
              "wrap": true
            }
          ]
        }
      ]
    }
  ]
}
\`\`\`

3. Interactive card with inputs and actions:
\`\`\`json
{
  "type": "AdaptiveCard",
  "version": "1.5",
  "body": [
    {
      "type": "TextBlock",
      "size": "Medium",
      "weight": "Bolder",
      "text": "Feedback Form"
    },
    {
      "type": "TextBlock",
      "text": "Please rate your experience:",
      "wrap": true
    },
    {
      "type": "Input.ChoiceSet",
      "id": "rating",
      "style": "expanded",
      "isMultiSelect": false,
      "choices": [
        {
          "title": "Excellent",
          "value": "5"
        },
        {
          "title": "Good",
          "value": "4"
        },
        {
          "title": "Average",
          "value": "3"
        },
        {
          "title": "Poor",
          "value": "2"
        },
        {
          "title": "Very Poor",
          "value": "1"
        }
      ]
    },
    {
      "type": "Input.Text",
      "id": "comments",
      "placeholder": "Additional comments",
      "isMultiline": true
    }
  ],
  "actions": [
    {
      "type": "Action.Submit",
      "title": "Submit Feedback",
      "data": {
        "action": "submitFeedback"
      }
    }
  ]
}
\`\`\`

Adaptive Cards support various elements like TextBlock, Image, ColumnSet, FactSet, Input fields, and Actions. Use them appropriately to create rich, interactive experiences.

For regular responses that don't need special formatting, just respond with plain text as usual.`,
    messages,
  })

  return result.toDataStreamResponse()
}
