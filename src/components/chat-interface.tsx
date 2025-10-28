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
import { getOpenAIResponse, generateChatTitle as generateAIChatTitle } from "@/lib/openai-service"
import { useChatStorage } from "@/hooks/use-chat-storage"

import { generateColorFromString, getInitials, getUserDisplayName } from "@/lib/avatar-utils"

interface Message {
  id: string
  text?: string
  isUser: boolean
  timestamp: Date
  formData?: FormData
  images?: string[] // Array of base64 image URLs
  userId?: string // Who sent this message
  userName?: string
  userEmail?: string
}

interface ChatSession {
  id: string
  title: string
  messages: Message[]
  createdAt: Date
  updatedAt: Date
}

interface ChatInterfaceProps {
  onSlashCommand: (command: string) => string
  currentChatId?: string | null
  onChatChange?: (chatId: string) => void
}

export function ChatInterface({ onSlashCommand, currentChatId, onChatChange }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showCookForm, setShowCookForm] = useState(false)
  const [showSlashPopup, setShowSlashPopup] = useState(false)
  const [selectedImages, setSelectedImages] = useState<string[]>([])
  const [currentUser, setCurrentUser] = useState<{ userId: string; email?: string; name?: string } | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { createChat, updateChat, getChat } = useChatStorage()

  // Track if we've initialized the chat to prevent infinite loop
  const [chatInitialized, setChatInitialized] = useState(false)
  const [isLoadingChat, setIsLoadingChat] = useState(false) // Track if we're loading a chat
  const prevChatIdRef = useRef<string | null>(null)
  const hasGeneratedTitleRef = useRef(false)
  
  // Get current user session
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await fetch('/api/auth/session')
        const data = await response.json()
        if (data.authenticated) {
          setCurrentUser({
            userId: data.user.userId,
            email: data.user.email,
            name: data.user.name
          })
        }
      } catch (error) {
        console.error('Error fetching user session:', error)
      }
    }
    fetchCurrentUser()
  }, [])

  // Create chat immediately when currentChatId is set
  useEffect(() => {
    const loadOrCreateChat = async () => {
      if (currentChatId && prevChatIdRef.current !== currentChatId) {
        console.log('ChatInterface: currentChatId changed from', prevChatIdRef.current, 'to', currentChatId)
        
        setIsLoadingChat(true) // Mark as loading to prevent save
        
        // Load or create chat using storage hook
        try {
          const existingChat = await getChat(currentChatId)
          
          if (existingChat) {
            console.log('Found existing chat:', currentChatId, 'with', existingChat.messages?.length || 0, 'messages')
            // Load existing chat messages
            setMessages(existingChat.messages || [])
            hasGeneratedTitleRef.current = true
          } else {
            console.log('Creating new chat:', currentChatId)
            // Create new empty chat
            const newChat = await createChat({
              id: currentChatId,
              title: generateChatTitle([]),
              messages: []
            })
            
            if (newChat) {
              console.log('✅ New chat created successfully:', newChat.id)
              setMessages([])
              hasGeneratedTitleRef.current = false
              
              // Notify parent
              if (onChatChange) {
                onChatChange(currentChatId)
              }
            } else {
              console.error('❌ Failed to create chat')
            }
          }
        } catch (error) {
          console.error('Error loading/creating chat:', error)
          // Fallback to empty messages
          setMessages([])
        }
        
        prevChatIdRef.current = currentChatId
        setChatInitialized(true)
        
        // Small delay before allowing saves (prevents immediate update)
        setTimeout(() => setIsLoadingChat(false), 500)
      } else if (!currentChatId && prevChatIdRef.current !== null) {
        // Chat was cleared
        setMessages([])
        setChatInitialized(false)
        prevChatIdRef.current = null
        setIsLoadingChat(false)
      }
    }
    
    loadOrCreateChat()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentChatId])


  // Save messages using database hook (only after initialization and not while loading)
  useEffect(() => {
    if (currentChatId && chatInitialized && !isLoadingChat && messages.length > 0) {
      // Debounce the save operation
      const timeoutId = setTimeout(async () => {
        console.log('ChatInterface: Saving messages', messages.length)
        
        try {
          // Update chat with new messages
          await updateChat(currentChatId, {
            messages: messages
          })
          
          // Notify parent that chat was updated
          if (onChatChange) {
            onChatChange(currentChatId)
          }
        } catch (error) {
          console.error('Error saving messages:', error)
        }
      }, 300)
      
      return () => clearTimeout(timeoutId)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages, currentChatId, chatInitialized, isLoadingChat])

  const generateChatTitle = (messages: Message[]): string => {
    // Generate title based on current date
    const today = new Date()
    const month = today.getMonth() + 1
    const day = today.getDate()
    const year = today.getFullYear()
    const dateStr = `${month}/${day}/${year}`
    
    // Always return date-based title (AI title will be generated separately)
    return `Production ${dateStr}`
  }

  // Generate AI title after first message
  const generateAITitle = async (firstMessage: string) => {
    if (!currentChatId) return
    
    try {
      const aiTitle = await generateAIChatTitle(firstMessage)
      console.log('Generated AI title:', aiTitle)
      
      // Update the chat title using the storage hook
      await updateChat(currentChatId, {
        title: aiTitle
      })
      
      // Trigger parent update
      if (onChatChange) {
        onChatChange(currentChatId)
      }
    } catch (error) {
      console.error('Error generating AI title:', error)
    }
  }

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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    Array.from(files).forEach(file => {
      const reader = new FileReader()
      reader.onloadend = () => {
        setSelectedImages(prev => [...prev, reader.result as string])
      }
      reader.readAsDataURL(file)
    })
  }

  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() && selectedImages.length === 0) return

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
      text: currentInput || undefined,
      isUser: true,
      timestamp: new Date(),
      images: selectedImages.length > 0 ? [...selectedImages] : undefined,
      userId: currentUser?.userId,
      userName: currentUser?.name,
      userEmail: currentUser?.email
    }

    // Clear images after adding to message
    const imagesToSend = selectedImages
    setSelectedImages([])

    setMessages(prev => [...prev, userMessage])
    
    // Generate AI title after first message if not already generated
    if (!hasGeneratedTitleRef.current && messages.length === 0 && currentInput.trim()) {
      hasGeneratedTitleRef.current = true
      // Generate AI title asynchronously
      generateAITitle(currentInput.trim())
    }
    
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
      // Regular message - use OpenAI with vision if images present
      try {
        const conversationHistory = messages
          .filter(msg => msg.text) // Only include text messages, not form data
          .map(msg => ({
            role: msg.isUser ? 'user' as const : 'assistant' as const,
            content: msg.text || ''
          }))
        
        // Build content for current message with images
        const content = imagesToSend.length > 0 ? 
          [{ type: 'text', text: currentInput || 'Please analyze this image' },
           ...imagesToSend.map(img => ({ type: 'image_url' as const, image_url: { url: img } }))]
          : currentInput
        
        const aiResponse = await getOpenAIResponse(content, conversationHistory, imagesToSend.length > 0)
        
        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: aiResponse,
          isUser: false,
          timestamp: new Date(),
        }
        setMessages(prev => [...prev, botMessage])
      } catch (error) {
        console.error('Error getting AI response:', error)
        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: "Sorry, I encountered an error. Please try again.",
          isUser: false,
          timestamp: new Date(),
        }
        setMessages(prev => [...prev, botMessage])
      } finally {
        setIsLoading(false)
      }
    }
  }

  const handleFormSubmit = async (formData: CookFormData) => {
    // Add form card to chat immediately with "pending" status
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
        status: 'pending' as const,
        taskType: formData.taskType
      }
    }

    setMessages(prev => [...prev, formMessage])

    // Submit to N8N in the background (don't wait for it, handle errors gracefully)
    submitToN8N({
      batch_id: formData.batchNumber,
      product_type: formData.productType,
      location: formData.storageLocation,
      crate_id: formData.crateId,
      units: parseInt(formData.jarCount),
      job_box: formData.jobBoxNumber || '',
      timestamp: formData.timestamp.toISOString(),
      user: formData.user,
      task_type: '/cook'
    }).then(success => {
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
    }).catch(error => {
      // Silently handle errors - don't let them bubble up to the UI
      console.log('Form submitted - N8N offline (expected during development):', error.message || error)
      // Update form status to failed silently
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
    })
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
            {messages.map((message) => {
              // Generate avatar properties for user messages
              const avatarColor = message.isUser && message.userId 
                ? generateColorFromString(message.userId)
                : message.isUser
                ? '#FF6B6B' // Fallback red
                : '#E5E7EB' // Bot gray
              
              const initials = message.isUser
                ? getInitials(message.userName, message.userEmail)
                : 'AI'
              
              const displayName = message.isUser
                ? getUserDisplayName(message.userName, message.userEmail)
                : 'AI Assistant'
              
              return (
                  <div
                    key={message.id}
                    className={`flex ${message.isUser ? "justify-start" : "justify-start"}`}
                  >
                    <div className={`flex space-x-3 max-w-3xl`}>
                      <div 
                        className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-white font-medium text-sm`}
                        style={{ backgroundColor: avatarColor }}
                        title={displayName}
                      >
                        {message.isUser ? initials : <Bot className="w-4 h-4" />}
                      </div>
                      <div className={`flex-1`}>
                        {message.formData ? (
                          <div className="flex flex-col space-y-2">
                            <div className="flex items-start space-x-3">
                              <div className="text-sm text-gray-600 font-medium">{message.formData.summary}</div>
                              <FormCard formData={message.formData} />
                            </div>
                            <div className="text-xs text-gray-500 ml-auto">
                              {message.timestamp instanceof Date 
                                ? message.timestamp.toLocaleTimeString() 
                                : new Date(message.timestamp).toLocaleTimeString()}
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-col gap-2">
                            {message.images && message.images.length > 0 && (
                              <div className="flex gap-2 flex-wrap">
                                {message.images.map((img, idx) => (
                                  <img key={idx} src={img} alt={`Upload ${idx}`} className="max-w-xs rounded-lg" />
                                ))}
                              </div>
                            )}
                            {message.text && (
                              <div className={`inline-block p-4 rounded-2xl ${
                                message.isUser
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-gray-100 text-gray-900"
                              }`}>
                                <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.text}</p>
                              </div>
                            )}
                          </div>
                        )}
                        {!message.formData && (
                          <div className={`text-xs text-gray-500 mt-1`}>
                            {message.timestamp instanceof Date 
                              ? message.timestamp.toLocaleTimeString() 
                              : new Date(message.timestamp).toLocaleTimeString()}
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
            {selectedImages.length > 0 && (
              <div className="mb-2 flex gap-2 flex-wrap">
                {selectedImages.map((img, idx) => (
                  <div key={idx} className="relative">
                    <img src={img} alt={`Preview ${idx}`} className="w-20 h-20 object-cover rounded-lg" />
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
            <div className="flex items-end space-x-2 p-4 bg-white border border-gray-200 rounded-2xl shadow-sm focus-within:ring-2 focus-within:ring-primary focus-within:border-transparent">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="hidden"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-gray-400 hover:text-gray-600 p-1"
                onClick={() => fileInputRef.current?.click()}
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
                  disabled={isLoading || (!input.trim() && selectedImages.length === 0)}
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
