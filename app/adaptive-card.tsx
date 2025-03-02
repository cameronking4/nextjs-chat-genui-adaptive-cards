"use client"

import { useEffect, useRef, useState } from "react"
import * as AdaptiveCards from "adaptivecards"

interface AdaptiveCardProps {
  cardJson: object
}

export function AdaptiveCard({ cardJson }: AdaptiveCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [error, setError] = useState<string | null>(null)
  const [actionResponse, setActionResponse] = useState<string | null>(null)

  useEffect(() => {
    if (!cardRef.current || !cardJson || Object.keys(cardJson).length === 0) {
      console.log("Skipping card render - missing ref or empty JSON:", { 
        hasRef: !!cardRef.current, 
        cardJson, 
        jsonKeys: cardJson ? Object.keys(cardJson).length : 0 
      });
      return;
    }

    console.log("Rendering adaptive card with JSON:", cardJson);

    try {
      // Clear previous content
      cardRef.current.innerHTML = ""
      setActionResponse(null)

      // Create an AdaptiveCard instance
      const adaptiveCard = new AdaptiveCards.AdaptiveCard()

      // Set host config for styling - match the chat UI theme
      adaptiveCard.hostConfig = new AdaptiveCards.HostConfig({
        fontFamily: "var(--font-sans)",
        containerStyles: {
          default: {
            backgroundColor: "var(--card-background, #FFFFFF)",
            foregroundColors: {
              default: {
                default: "var(--foreground, #000000)",
                subtle: "var(--muted-foreground, #767676)",
              },
            },
          },
          emphasis: {
            backgroundColor: "var(--muted, #F0F0F0)",
            foregroundColors: {
              default: {
                default: "var(--foreground, #000000)",
                subtle: "var(--muted-foreground, #767676)",
              },
            },
          },
          accent: {
            backgroundColor: "var(--primary, #0070f3)",
            foregroundColors: {
              default: {
                default: "var(--primary-foreground, #FFFFFF)",
                subtle: "var(--primary-foreground, #FFFFFF)",
              },
            },
          },
          good: {
            backgroundColor: "var(--success, #10b981)",
            foregroundColors: {
              default: {
                default: "#FFFFFF",
                subtle: "#FFFFFF",
              },
            },
          },
          attention: {
            backgroundColor: "var(--warning, #f59e0b)",
            foregroundColors: {
              default: {
                default: "#FFFFFF",
                subtle: "#FFFFFF",
              },
            },
          },
          warning: {
            backgroundColor: "var(--warning, #f59e0b)",
            foregroundColors: {
              default: {
                default: "#FFFFFF",
                subtle: "#FFFFFF",
              },
            },
          },
          remove: {
            backgroundColor: "var(--destructive, #ef4444)",
            foregroundColors: {
              default: {
                default: "#FFFFFF",
                subtle: "#FFFFFF",
              },
            },
          },
        },
        spacing: {
          small: 4,
          default: 8,
          medium: 12,
          large: 16,
          extraLarge: 24,
        },
        actions: {
          actionsOrientation: "horizontal",
          actionAlignment: "stretch",
          buttonSpacing: 8,
          showCard: {
            actionMode: "inline",
            inlineTopMargin: 16,
          },
          maxActions: 5,
        },
        adaptiveCard: {
          allowCustomStyle: true,
        },
        textStyles: {
          heading: {
            fontFamily: "var(--font-sans)",
            fontSizes: {
              small: 14,
              default: 17,
              medium: 20,
              large: 23,
              extraLarge: 26,
            },
            fontWeights: {
              lighter: 200,
              default: 400,
              bolder: 600,
            },
          },
        },
      })

      // Handle action events
      adaptiveCard.onExecuteAction = async (action) => {
        console.log("Action executed:", action)
        
        // Handle different action types
        if (action instanceof AdaptiveCards.SubmitAction && action.data) {
          console.log("Submit data:", action.data)
          
          // Display processing message
          setActionResponse("Processing your request...");
          
          try {
            // Send the action data to our API endpoint
            const actionData = action.data as Record<string, unknown>;
            const response = await fetch('/api/card-action', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(actionData)
            });
            
            const result = await response.json();
            
            if (response.ok) {
              // Display success message
              setActionResponse(result.message || `Action "${actionData.action}" completed successfully.`);
              
              // If the result contains data to execute a prompt, dispatch a window message
              if (result.executePrompt) {
                window.postMessage({
                  type: 'adaptive-card-action',
                  data: result
                }, '*');
              }
            } else {
              // Display error message
              setActionResponse(`Error: ${result.error || 'Failed to process action'}`);
            }
          } catch (error) {
            console.error("Error sending action to API:", error);
            setActionResponse("Error: Failed to send action to server.");
          }
        } else if (action instanceof AdaptiveCards.OpenUrlAction && action.url) {
          // Open URL in a new tab
          window.open(action.url, '_blank');
        } else if (action instanceof AdaptiveCards.ShowCardAction) {
          // ShowCard is handled automatically by the SDK
        } else if (action instanceof AdaptiveCards.ToggleVisibilityAction) {
          // ToggleVisibility is handled automatically by the SDK
        }
      }

      // Parse the card JSON
      adaptiveCard.parse(cardJson)

      // Render the card
      const renderedCard = adaptiveCard.render()
      if (renderedCard) {
        cardRef.current.appendChild(renderedCard)
        
        // Add custom styling to buttons
        const buttons = renderedCard.querySelectorAll('.ac-pushButton');
        buttons.forEach((button: Element) => {
          button.classList.add('rounded-md', 'font-medium', 'transition-colors');
        });
      }
    } catch (err) {
      console.error("Error rendering adaptive card:", err)
      setError("Failed to render card")
    }
  }, [cardJson])

  if (error) {
    return <div className="p-3 text-destructive">{error}</div>
  }

  return (
    <div className="bg-card text-card-foreground rounded-lg overflow-hidden shadow-sm border">
      <div ref={cardRef} className="adaptive-card p-4" />
      {actionResponse && (
        <div className="px-4 py-2 bg-muted text-muted-foreground text-sm border-t">
          {actionResponse}
        </div>
      )}
    </div>
  )
}
