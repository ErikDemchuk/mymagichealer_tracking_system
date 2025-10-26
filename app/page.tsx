"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LoginModal } from "@/components/login-modal"
import { Bot, BarChart3, Package, CheckCircle, Wrench } from "lucide-react"

export default function Home() {
  const router = useRouter()
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)

  const handleGetStarted = () => {
    setIsLoginModalOpen(true)
  }

  const handleLogin = (email: string) => {
    console.log('Logging in with email:', email)
    // TODO: Implement email authentication or redirect to chat
    router.push("/chat")
  }

  const handleCloseModal = () => {
    setIsLoginModalOpen(false)
  }

  const features = [
    { icon: BarChart3, title: "Production Tracking", description: "Monitor production metrics and batch progress" },
    { icon: Package, title: "Inventory Management", description: "Track stock levels and warehouse operations" },
    { icon: CheckCircle, title: "Quality Control", description: "Ensure product quality with systematic checks" },
    { icon: Wrench, title: "Maintenance", description: "Schedule and track equipment maintenance" },
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                <span className="text-lg font-bold text-primary-foreground">MH</span>
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Magic Healer</h1>
                <p className="text-sm text-gray-500">Production Tracking</p>
              </div>
            </div>
            <Button
              onClick={handleGetStarted}
              className="bg-primary hover:bg-primary/90"
            >
              Get Started
            </Button>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <div className="mx-auto w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-8">
            <Bot className="w-10 h-10 text-gray-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-6">
            What's on the agenda today?
          </h1>
          <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
            Streamline your production workflow with our intelligent tracking system. 
            Get real-time insights and manage your operations efficiently.
          </p>
          <Button
            onClick={handleGetStarted}
            size="lg"
            className="bg-primary hover:bg-primary/90 text-lg px-8 py-3"
          >
            Start Production Tracking
          </Button>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Everything you need for production management
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Powerful tools designed specifically for warehouse and production environments
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="p-6 text-center hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-sm">
                  {feature.description}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            Ready to optimize your production?
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Join the production teams already using our system to improve efficiency and reduce errors.
          </p>
          <Button
            onClick={handleGetStarted}
            size="lg"
            className="bg-primary hover:bg-primary/90 text-lg px-8 py-3"
          >
            Get Started Now
          </Button>
        </div>
      </div>

      {/* Login Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={handleCloseModal}
        onLogin={handleLogin}
      />
    </div>
  )
}