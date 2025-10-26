"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { FormCard, FormData } from "@/components/form-card"
import { CookForm, CookFormData } from "@/components/cook-form"
import { SlashCommandPopup } from "@/components/slash-command-popup"
import { 
  Plus, 
  Mic, 
  Send,
  Bot,
  User
} from "lucide-react"
import { submitToN8N } from "@/lib/n8n-service"

interface Message {
  id: string
  text?: string
  isUser: boolean
  timestamp: Date
  formData?: FormData
}

interface ChatInterfaceProps {
  onSlashCommand: (command: string) => string
}

export function ChatInterface({ onSlashCommand }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showCookForm, setShowCookForm] = useState(false)
  const [showSlashPopup, setShowSlashPopup] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setInput(value)
    
    // Show popup when user types "/"
    if (value === "/") {
      setShowSlashPopup(true)
    } else if (value.startsWith("/")) {
      setShowSlashPopup(true)
    } else {
      setShowSlashPopup(false)
    }
  }

  const handleSlashCommandSelect = (command: string) => {
    setInput(command)
    setShowSlashPopup(false)
    
    // Handle the command immediately
    if (command === "/cook") {
      setShowCookForm(true)
    } else {
      // For other commands, show text response
      setIsLoading(true)
      setTimeout(() => {
        const response = onSlashCommand(command)
        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: response,
          isUser: false,
          timestamp: new Date(),
        }
        setMessages(prev => [...prev, botMessage])
        setIsLoading(false)
      }, 1000)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    const currentInput = input.trim()
    setInput("") // Clear input immediately
    setShowSlashPopup(false) // Close popup

    // Handle slash commands that open modals - don't add to chat
    if (currentInput === "/cook") {
      setShowCookForm(true)
      return // Exit early, don't add to chat
    }

    // For other slash commands or regular messages, add to chat
    const userMessage: Message = {
      id: Date.now().toString(),
      text: currentInput,
      isUser: true,
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMessage])
    setIsLoading(true)

    // Handle other slash commands or regular messages
    if (currentInput.startsWith("/")) {
      setTimeout(() => {
        const response = onSlashCommand(currentInput)
        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: response,
          isUser: false,
          timestamp: new Date(),
        }
        setMessages(prev => [...prev, botMessage])
        setIsLoading(false)
      }, 1000)
    } else {
      // Regular message
      setTimeout(() => {
        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: "I received your message. Use slash commands like /cook to open forms.",
          isUser: false,
          timestamp: new Date(),
        }
        setMessages(prev => [...prev, botMessage])
        setIsLoading(false)
      }, 1000)
    }
  }

  const handleFormSubmit = async (formData: CookFormData) => {
    // Add form card to chat
        const formMessage: Message = {
          id: Date.now().toString(),
          isUser: true,
          timestamp: new Date(),
          formData: {
            batchNumber: formData.batchNumber,
            storageLocation: formData.storageLocation,
            productType: formData.productType,
            crateId: formData.crateId,
            jarCount: formData.jarCount,
            jobBoxNumber: formData.jobBoxNumber,
            summary: formData.summary,
            user: formData.user,
            timestamp: formData.timestamp,
            status: formData.status,
            taskType: formData.taskType
          }
        }

    setMessages(prev => [...prev, formMessage])

    // Submit to N8N
    try {
      const success = await submitToN8N({
        batch_id: formData.batchNumber,
        product_type: formData.productType,
        location: formData.storageLocation,
        crate_id: formData.crateId,
        units: parseInt(formData.jarCount),
        job_box: formData.jobBoxNumber || '',
        timestamp: formData.timestamp.toISOString(),
        user: formData.user
      })

          // Update form status based on N8N response
          const updatedFormData = {
            batchNumber: formData.batchNumber,
            storageLocation: formData.storageLocation,
            productType: formData.productType,
            crateId: formData.crateId,
            jarCount: formData.jarCount,
            jobBoxNumber: formData.jobBoxNumber,
            summary: formData.summary,
            user: formData.user,
            timestamp: formData.timestamp,
            status: success ? 'completed' as const : 'failed' as const,
            taskType: formData.taskType
          }

      // Update the message with the new status
      setMessages(prev => 
        prev.map(msg => 
          msg.id === formMessage.id 
            ? { ...msg, formData: updatedFormData }
            : msg
        )
      )
    } catch (error) {
      console.error('Failed to submit form:', error)
          // Update form status to failed
          const updatedFormData = {
            batchNumber: formData.batchNumber,
            storageLocation: formData.storageLocation,
            productType: formData.productType,
            crateId: formData.crateId,
            jarCount: formData.jarCount,
            jobBoxNumber: formData.jobBoxNumber,
            summary: formData.summary,
            user: formData.user,
            timestamp: formData.timestamp,
            status: 'failed' as const,
            taskType: formData.taskType
          }
      setMessages(prev => 
        prev.map(msg => 
          msg.id === formMessage.id 
            ? { ...msg, formData: updatedFormData }
            : msg
        )
      )
    }
  }

  return (
    <div className="flex-1 flex flex-col bg-white h-full">
      {/* Main Chat Area */}
      <div className="flex-1 overflow-y-auto p-6 pb-24">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Bot className="w-8 h-8 text-gray-400" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              What's on the agenda today?
            </h2>
            <p className="text-gray-500 mb-8 max-w-md">
              I'm here to help you with production tracking. Use slash commands to get started with forms and reports.
            </p>
            
            {/* Quick Command Suggestions */}
            <div className="grid grid-cols-2 gap-3 max-w-lg">
              {[
                { cmd: "/cook", label: "Cook Action" },
                { cmd: "/production", label: "Production Form" },
                { cmd: "/inventory", label: "Inventory Check" },
                { cmd: "/quality", label: "Quality Check" },
              ].map(({ cmd, label }) => (
                <Button
                  key={cmd}
                  variant="outline"
                  onClick={() => setInput(cmd)}
                  className="justify-start h-auto p-4 text-left"
                >
                  <div>
                    <div className="font-medium">{label}</div>
                    <div className="text-sm text-gray-500">{cmd}</div>
                  </div>
                </Button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-6 max-w-4xl mx-auto">
            {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.isUser ? "justify-start" : "justify-start"}`}
                  >
                    <div className={`flex space-x-3 max-w-3xl`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        message.isUser 
                          ? "bg-red-500 text-white" 
                          : "bg-gray-100 text-gray-600"
                      }`}>
                        {message.isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                      </div>
                      <div className={`flex-1`}>
                        {message.formData ? (
                          <div className="flex flex-col space-y-2">
                            <div className="flex items-start space-x-3">
                              <div className="text-sm text-gray-600 font-medium">{message.formData.summary}</div>
                              <FormCard formData={message.formData} />
                            </div>
                            <div className="text-xs text-gray-500 ml-auto">
                              {message.timestamp.toLocaleTimeString()}
                            </div>
                          </div>
                        ) : (
                          <div className={`inline-block p-4 rounded-2xl ${
                            message.isUser
                              ? "bg-primary text-primary-foreground"
                              : "bg-gray-100 text-gray-900"
                          }`}>
                            <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.text}</p>
                          </div>
                        )}
                        {!message.formData && (
                          <div className={`text-xs text-gray-500 mt-1`}>
                            {message.timestamp.toLocaleTimeString()}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="flex space-x-3 max-w-3xl">
                  <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <div className="inline-block p-4 rounded-2xl bg-gray-100">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {/* Scroll reference div */}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Area - Fixed at bottom */}
      <div className="border-t border-gray-200 p-4 bg-white flex-shrink-0">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
          <div className="relative">
            <div className="flex items-end space-x-2 p-4 bg-white border border-gray-200 rounded-2xl shadow-sm focus-within:ring-2 focus-within:ring-primary focus-within:border-transparent">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <Plus className="w-4 h-4" />
              </Button>
              
              <div className="flex-1 relative">
                <Input
                  value={input}
                  onChange={handleInputChange}
                  placeholder="Ask anything"
                  className="border-0 shadow-none focus-visible:ring-0 text-base resize-none"
                  disabled={isLoading}
                />
                <SlashCommandPopup
                  isOpen={showSlashPopup}
                  onClose={() => setShowSlashPopup(false)}
                  onSelectCommand={handleSlashCommandSelect}
                  inputValue={input}
                />
              </div>
              
              <div className="flex items-center space-x-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-gray-400 hover:text-gray-600 p-1"
                >
                  <Mic className="w-4 h-4" />
                </Button>
                
                <Button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  size="sm"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* Cook Form Modal */}
      <CookForm
        isOpen={showCookForm}
        onClose={() => setShowCookForm(false)}
        onSubmit={handleFormSubmit}
      />
    </div>
  )
}
