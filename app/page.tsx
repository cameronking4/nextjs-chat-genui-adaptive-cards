"use client"

import { useChat } from "ai/react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send } from "lucide-react"
import { AdaptiveCard } from "./adaptive-card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { extractCardJson, getCardTemplate } from "@/lib/adaptive-cards"
import { useEffect, useRef } from "react"

export default function ChatPage() {
  const { messages, input, handleInputChange, handleSubmit, isLoading, setInput } = useChat({
    api: "/api/chat",
    onResponse: (response) => {
      console.log("Chat response received:", response);
      // Log the response headers and status
      console.log("Response status:", response.status);
      console.log("Response headers:", Object.fromEntries(response.headers.entries()));
      
      // Try to read the response body for debugging
      response.clone().text().then(text => {
        console.log("Response body preview:", text.substring(0, 200));
      }).catch(err => {
        console.error("Error reading response body:", err);
      });
    },
    onFinish: (message) => {
      console.log("Chat message finished:", message);
      console.log("Message role:", message.role);
      console.log("Message content length:", message.content.length);
      console.log("Message content preview:", message.content.substring(0, 200));
      
      if (message.content.includes("```json")) {
        console.log("JSON content detected in message");
        const json = extractCardJson(message.content);
        console.log("Extracted JSON:", json);
      }
    },
    onError: (error) => {
      console.error("Chat error:", error);
    }
  });
  
  // Log messages for debugging
  useEffect(() => {
    console.log("Current messages:", messages);
  }, [messages]);

  // Reference to track if we've handled card actions
  const actionHandledRef = useRef(false);

  // Function to handle prompt execution
  const executePrompt = (prompt: string) => {
    console.log("Executing prompt:", prompt);
    setInput(prompt);
    // Use setTimeout to allow the input to update before submitting
    setTimeout(() => {
      const form = document.querySelector("form");
      if (form) {
        form.dispatchEvent(new Event("submit", { cancelable: true, bubbles: true }));
      }
    }, 0);
  };

  // Handle card actions
  useEffect(() => {
    const handleCardAction = async (event: MessageEvent) => {
      if (event.data && event.data.type === "adaptive-card-action") {
        const actionData = event.data.data;
        console.log("Received card action in page:", actionData);
        
        if (actionData.executePrompt && !actionHandledRef.current) {
          actionHandledRef.current = true;
          executePrompt(actionData.executePrompt);
          // Reset the flag after a short delay to allow for future actions
          setTimeout(() => {
            actionHandledRef.current = false;
          }, 500);
        }
      }
    };

    window.addEventListener("message", handleCardAction);
    return () => window.removeEventListener("message", handleCardAction);
  }, []);

  return (
    <div className="flex flex-col h-screen max-h-screen p-4 md:p-8">
      <Card className="flex-grow flex flex-col overflow-hidden">
        <ScrollArea className="flex-grow p-4">
          <div className="space-y-4">
            {/* Only show the static welcome card if there are no messages and we're not loading */}
            {messages.length === 0 && !isLoading && (
              <div className="flex justify-start">
                <div className="flex items-start max-w-[80%] gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="AI" />
                    <AvatarFallback>AI</AvatarFallback>
                  </Avatar>
                  <div>
                    <AdaptiveCard cardJson={getCardTemplate('welcome') || {}} />
                  </div>
                </div>
              </div>
            )}
            
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className="flex items-start max-w-[80%] gap-2">
                  {message.role !== "user" && (
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="AI" />
                      <AvatarFallback>AI</AvatarFallback>
                    </Avatar>
                  )}

                  <div>
                    {message.role === "user" ? (
                      <div className="bg-primary text-primary-foreground p-3 rounded-lg">{message.content}</div>
                    ) : (
                      <div>
                        {message.content.includes("```json") ? (
                          <AdaptiveCard cardJson={extractCardJson(message.content) || {}} />
                        ) : (
                          <div className="bg-muted p-3 rounded-lg">
                            {message.content.split('\n').map((part, index) => (
                              <div key={index}>
                                {part}
                                {index < message.content.split('\n').length - 1 && <br />}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {message.role === "user" && (
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="User" />
                      <AvatarFallback>You</AvatarFallback>
                    </Avatar>
                  )}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="flex items-start max-w-[80%] gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="AI" />
                    <AvatarFallback>AI</AvatarFallback>
                  </Avatar>
                  <div className="bg-muted p-3 rounded-lg">
                    <div className="flex space-x-2">
                      <div className="h-2 w-2 bg-foreground/30 rounded-full animate-bounce"></div>
                      <div className="h-2 w-2 bg-foreground/30 rounded-full animate-bounce delay-75"></div>
                      <div className="h-2 w-2 bg-foreground/30 rounded-full animate-bounce delay-150"></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="p-4 border-t">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              value={input}
              onChange={handleInputChange}
              placeholder="Type your message..."
              className="flex-grow"
              disabled={isLoading}
            />
            <Button type="submit" disabled={isLoading || !input.trim()}>
              <Send className="h-4 w-4" />
              <span className="sr-only">Send</span>
            </Button>
          </form>
        </div>
      </Card>
    </div>
  )
}
