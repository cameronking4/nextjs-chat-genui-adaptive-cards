import { openai } from "@ai-sdk/openai"
import { streamText } from "ai"
import azureCopilotPromptData from "@/lib/azure-copilot-prompt.json"

// Allow streaming responses up to 30 seconds
export const maxDuration = 300

export async function POST(req: Request) {
  const { messages } = await req.json()

  // Log the incoming messages for debugging
  console.log("Incoming messages:", messages);

  const result = streamText({
    model: openai("gpt-4-turbo"),
    system: azureCopilotPromptData.prompt,
    messages,
  })

  return result.toDataStreamResponse()
}
