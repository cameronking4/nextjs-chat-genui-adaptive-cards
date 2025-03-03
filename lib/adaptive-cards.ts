/**
 * Adaptive Cards utility functions and templates
 */

// Example card templates that can be used throughout the application
export const cardTemplates = {
  // Welcome card shown to new users
  welcome: {
    type: "AdaptiveCard",
    version: "1.5",
    body: [
      {
        type: "TextBlock",
        size: "Large",
        weight: "Bolder",
        text: "Welcome to Copilot in Azure!"
      },
      {
        type: "TextBlock",
        text: "I can help you with Azure cloud services using interactive cards for a better experience.",
        wrap: true
      },
      {
        type: "TextBlock",
        text: "Choose a prompt to get started or type your own message:",
        wrap: true,
        spacing: "Medium"
      },
      {
        type: "ActionSet",
        actions: [
          {
            type: "Action.Submit",
            title: "Generate a KQL query",
            data: {
              action: "executePrompt",
              prompt: "Generate a KQL query to list all virtual machines in my Azure subscription"
            }
          },
          {
            type: "Action.Submit",
            title: "Show Azure VM management",
            data: {
              action: "executePrompt",
              prompt: "I need to restart some Azure VMs"
            }
          },
          {
            type: "Action.Submit",
            title: "Create a storage account",
            data: {
              action: "executePrompt",
              prompt: "Show me how to create an Azure Storage Account with different methods"
            }
          },
          {
            type: "Action.Submit",
            title: "Explain Azure VMs",
            data: {
              action: "executePrompt",
              prompt: "What are Azure Virtual Machines and how do they work?"
            }
          }
        ]
      }
    ]
  },

  // Weather forecast card template
  weather: {
    type: "AdaptiveCard",
    version: "1.5",
    body: [
      {
        type: "TextBlock",
        size: "Medium",
        weight: "Bolder",
        text: "Weather for ${location}"
      },
      {
        type: "ColumnSet",
        columns: [
          {
            type: "Column",
            width: "auto",
            items: [
              {
                type: "Image",
                url: "${weatherIconUrl}",
                size: "Small"
              }
            ]
          },
          {
            type: "Column",
            width: "stretch",
            items: [
              {
                type: "TextBlock",
                text: "${temperature}°C",
                size: "ExtraLarge",
                weight: "Bolder"
              },
              {
                type: "TextBlock",
                text: "${weatherDescription}",
                spacing: "None"
              }
            ]
          }
        ]
      },
      {
        type: "FactSet",
        facts: [
          {
            title: "Humidity",
            value: "${humidity}%"
          },
          {
            title: "Wind",
            value: "${windSpeed} km/h"
          }
        ]
      }
    ]
  },

  // To-do list card template
  todoList: {
    type: "AdaptiveCard",
    version: "1.5",
    body: [
      {
        type: "TextBlock",
        size: "Medium",
        weight: "Bolder",
        text: "To-Do List"
      },
      {
        type: "Input.Text",
        id: "newTodo",
        placeholder: "Add a new task"
      },
      {
        type: "ActionSet",
        actions: [
          {
            type: "Action.Submit",
            title: "Add Task",
            data: {
              action: "addTodo"
            }
          }
        ]
      },
      {
        type: "Container",
        id: "todoItems",
        items: [
          // Dynamic items will be added here
        ]
      }
    ]
  },

  // Quiz/poll card template
  quiz: {
    type: "AdaptiveCard",
    version: "1.5",
    body: [
      {
        type: "TextBlock",
        size: "Medium",
        weight: "Bolder",
        text: "${quizTitle}"
      },
      {
        type: "TextBlock",
        text: "${quizQuestion}",
        wrap: true
      },
      {
        type: "Input.ChoiceSet",
        id: "quizAnswer",
        style: "expanded",
        isMultiSelect: false,
        choices: [
          // Dynamic choices will be added here
          // Example: { "title": "Option 1", "value": "1" }
        ]
      }
    ],
    actions: [
      {
        type: "Action.Submit",
        title: "Submit Answer",
        data: {
          action: "submitQuiz"
        }
      }
    ]
  },

  // Error card template
  error: {
    type: "AdaptiveCard",
    version: "1.5",
    body: [
      {
        type: "TextBlock",
        size: "Medium",
        weight: "Bolder",
        text: "Error",
        color: "Attention"
      },
      {
        type: "TextBlock",
        text: "${errorMessage}",
        wrap: true
      }
    ]
  }
};

/**
 * Get a card template and replace variables with values
 * @param templateName The name of the template to use
 * @param variables Key-value pairs of variables to replace in the template
 * @returns The card JSON with variables replaced
 */
export function getCardTemplate(
  templateName: keyof typeof cardTemplates,
  variables: Record<string, string> = {}
): object | null {
  const template = cardTemplates[templateName];
  if (!template) return null;
  
  // Deep clone the template to avoid modifying the original
  const card = JSON.parse(JSON.stringify(template));
  
  // Type for Adaptive Card objects
  type AdaptiveCardObject = {
    [key: string]: string | number | boolean | null | AdaptiveCardObject | AdaptiveCardObject[];
  };

  // Replace variables in text fields
  const replaceVariables = (obj: AdaptiveCardObject) => {
    if (typeof obj !== 'object' || obj === null) return;
    
    Object.keys(obj).forEach(key => {
      if (typeof obj[key] === 'string') {
        // Replace ${variable} with actual value
        obj[key] = (obj[key] as string).replace(/\${(\w+)}/g, (_, varName) => 
          variables[varName] || `\${${varName}}`
        );
      } else if (typeof obj[key] === 'object') {
        replaceVariables(obj[key] as AdaptiveCardObject);
      }
    });
  };
  
  replaceVariables(card);
  return card;
}

/**
 * Extract JSON from a message that contains a code block
 * @param content The message content
 * @returns The parsed JSON object or null if no valid JSON found
 */
export function extractCardJson(content: string): object | null {
  console.log("Extracting card JSON from content:", content.substring(0, 100) + "...");
  
  try {
    const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/);
    if (jsonMatch && jsonMatch[1]) {
      console.log("JSON match found, parsing:", jsonMatch[1].substring(0, 100) + "...");
      const parsedJson = JSON.parse(jsonMatch[1]);
      console.log("Successfully parsed JSON");
      return parsedJson;
    }
    console.log("No JSON match found in content");
    return null;
  } catch (error) {
    console.error("Failed to parse card JSON:", error);
    return null;
  }
}

/**
 * Process an action from an Adaptive Card
 * @param action The action data from the card
 * @returns Response data or null
 */
export async function processCardAction(action: Record<string, unknown>): Promise<object | null> {
  // This function would handle different action types and communicate with your backend
  // For now, it just returns the action data
  console.log("Processing card action:", action);
  
  // Example: if (action.action === 'getWeather') { fetch weather data }
  
  return action;
}
