import { NextResponse } from "next/server"
import { getCardTemplate } from "@/lib/adaptive-cards"

// Mock data for Azure resources
const mockVMs = [
  { name: "vm-prod-01", resourceGroup: "rg-production", location: "eastus" },
  { name: "vm-dev-01", resourceGroup: "rg-development", location: "westus2" },
  { name: "vm-test-01", resourceGroup: "rg-testing", location: "centralus" },
];

// Mock function to execute KQL queries
const executeKQLQuery = (query: string) => {
  console.log(`Executing KQL query: ${query}`);
  
  // Simple parsing to extract what resources we're looking for
  if (query.includes("Microsoft.Compute/virtualMachines")) {
    return mockVMs;
  }
  
  // Default response with some sample data
  return [
    { name: "resource-1", type: "Microsoft.Storage/storageAccounts", resourceGroup: "rg-storage", location: "eastus" },
    { name: "resource-2", type: "Microsoft.Web/sites", resourceGroup: "rg-web", location: "westus2" },
  ];
};

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
      // Original actions
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
      
      // Azure Copilot specific actions
      case "copyQuery":
        // Handle copying a KQL query
        const query = actionData.query
        if (!query) {
          return NextResponse.json(
            { error: "Missing query text" },
            { status: 400 }
          )
        }
        
        console.log(`Copying query: ${query}`)
        
        return NextResponse.json({
          message: "Query copied to clipboard",
        })
      
      case "runQuery":
        // Handle running a KQL query
        const kqlQuery = actionData.query
        if (!kqlQuery) {
          return NextResponse.json(
            { error: "Missing query text" },
            { status: 400 }
          )
        }
        
        console.log(`Running query: ${kqlQuery}`)
        
        // Execute the query and get results
        const queryResults = executeKQLQuery(kqlQuery)
        
        // Generate a prompt to display the results
        const resultsPrompt = `Here are the results of the KQL query:\n\n\`\`\`kql\n${kqlQuery}\n\`\`\`\n\nPlease display these results in a table:\n\n${JSON.stringify(queryResults, null, 2)}`
        
        return NextResponse.json({
          message: "Executing your query...",
          executePrompt: resultsPrompt,
        })
      
      case "restartVMs":
        // Handle restarting VMs
        const vmSelection = actionData.vmSelection
        const confirmToggle = actionData.confirmToggle
        
        if (!vmSelection) {
          return NextResponse.json(
            { error: "No VMs selected" },
            { status: 400 }
          )
        }
        
        if (confirmToggle !== "true") {
          return NextResponse.json(
            { error: "Action not confirmed" },
            { status: 400 }
          )
        }
        
        // Convert string to array if needed
        const vmList = typeof vmSelection === 'string' ? vmSelection.split(',') : vmSelection;
        
        console.log(`Restarting VMs: ${vmList.join(", ")}`)
        
        return NextResponse.json({
          message: "VMs restarted successfully",
          executePrompt: `I've successfully restarted the following VMs: ${vmList.join(", ")}. The operation completed successfully.`,
        })
      
      case "showCode":
        // Handle showing different code languages
        const language = actionData.language
        if (!language) {
          return NextResponse.json(
            { error: "Missing language selection" },
            { status: 400 }
          )
        }
        
        console.log(`Showing code for language: ${language}`)
        
        // Generate a prompt to show the selected language
        const codePrompt = `Please update the code display to show the ${language} example.`
        
        return NextResponse.json({
          message: `Showing ${language} code example`,
          executePrompt: codePrompt,
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
