# Plan Dashboard Project - Context

## Vision
We're building a **unified production management system** that combines task planning with inventory tracking for manufacturing/production environments. The goal is to create a single platform where teams can manage both their daily tasks/projects AND track physical inventory in real-time.

## The Problem We're Solving
Production teams currently juggle multiple disconnected tools - one for task management (like Monday.com), another for inventory, and yet another for team communication. This creates inefficiency, data silos, and context switching. Our solution integrates all three into one AI-powered platform.

## Current Implementation

### Three Core Modules:

1. **Plan Dashboard (`/plan`)** - Project Management
   - Task tracking with hierarchical structures (tasks, subtasks, sections)
   - Team collaboration with assignees, due dates, priorities
   - Progress tracking with visual indicators
   - Multiple view options: Spreadsheet, Timeline, Calendar, Board
   - **Status**: UI complete with mock data, needs backend integration

2. **Inventory Dashboard (`/dashboard`)** - Stock Management
   - Real-time inventory tracking by location, batch, and product
   - Visual status indicators (labeled, unlabeled, boxes)
   - Collapsible hierarchical views for easy navigation
   - **Status**: Functional with mock data

3. **AI Chat Interface (`/chat`)** - Intelligent Assistant
   - Conversational interface for both modules
   - Natural language queries about inventory or tasks
   - Slash commands for quick actions (`/production`, `/inventory`, `/quality`)
   - Persistent chat history with MongoDB
   - **Status**: Fully functional with MiniMax M-2 or OpenAI

## Next Phase
We need to:
- Connect Plan Dashboard to MongoDB for data persistence
- Build API endpoints for CRUD operations on tasks/projects
- Enable real-time collaboration (WebSockets)
- Integrate AI chat with both Plan and Inventory modules
- Add drag-and-drop, filtering, and search functionality
- Implement user roles and permissions

## Technical Foundation
Built with Next.js 16, TypeScript, MongoDB, and Tailwind CSS. Session-based authentication. Designed for scalability and real-time updates.

