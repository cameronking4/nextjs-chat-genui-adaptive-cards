import { NextResponse } from "next/server"
import { getCardTemplate } from "@/lib/adaptive-cards"

export async function POST(req: Request) {
  try {
    const actionData = await req.json()
    console.log("Received card action:", actionData)

    // Handle different action types
    if (!actionData.action) {
      return NextResponse.json(
        { error: "Missing action type" },
        { status: 400 }
      )
    }

    switch (actionData.action) {
      case "executePrompt":
        // Handle executing a prompt starter
        const prompt = actionData.prompt
        if (!prompt) {
          return NextResponse.json(
            { error: "Missing prompt text" },
            { status: 400 }
          )
        }
        
        console.log(`Executing prompt: ${prompt}`)
        
        return NextResponse.json({
          message: "Executing your prompt...",
          executePrompt: prompt,
        })
        
      case "getStarted":
        // Handle the "Get Started" action
        return NextResponse.json({
          message: "Welcome! How can I help you today?",
        })

      case "submitFeedback":
        // Handle feedback submission
        const rating = actionData.rating
        const comments = actionData.comments
        
        // Here you would typically store this feedback in a database
        console.log(`Received feedback - Rating: ${rating}, Comments: ${comments}`)
        
        // Return a thank you card
        const thankYouCard = getCardTemplate("welcome", {
          title: "Thank You for Your Feedback!",
          message: "We appreciate your input and will use it to improve our service.",
        })
        
        return NextResponse.json({
          card: thankYouCard,
          message: "Thank you for your feedback!",
        })

      case "submitQuiz":
        // Handle quiz submission
        const quizAnswers = { ...actionData }
        delete quizAnswers.action // Remove the action property
        
        // Format the answers into a message for the AI
        const answersMessage = Object.entries(quizAnswers)
          .map(([question, answer]) => `${question}: ${answer}`)
          .join('\n')
        
        // Return the formatted message to be sent to the AI
        return NextResponse.json({
          message: "Processing your answers...",
          executePrompt: `Here are my answers to the quiz:\n${answersMessage}\n\nPlease check if they are correct and provide feedback.`
        })

      case "addTodo":
        // Handle adding a todo item
        const todoText = actionData.newTodo
        
        if (!todoText) {
          return NextResponse.json(
            { error: "Missing todo text" },
            { status: 400 }
          )
        }
        
        // Here you would typically add this to a database
        console.log(`Adding todo item: ${todoText}`)
        
        return NextResponse.json({
          message: `Added todo: ${todoText}`,
          todoItem: {
            id: Date.now().toString(),
            text: todoText,
            completed: false,
          },
        })

      default:
        return NextResponse.json({
          message: "Processing your response...",
          executePrompt: `Use the following action to generate a response:\n${actionData.action}\n\nPlease respond to the user with a card.`
        })
    }
  } catch (error) {
    console.error("Error processing card action:", error)
    return NextResponse.json(
      { error: "Failed to process card action" },
      { status: 500 }
    )
  }
}
