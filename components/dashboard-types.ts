export type GatewayStatus = 'checking' | 'online' | 'offline'

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant' | 'error'
  text: string
  timestamp: string
}

export interface ActivityItem {
  id: number
  time: string
  text: string
  status: 'loading' | 'success' | 'warning'
}

export interface PendingTask {
  id: number
  title: string
  desc: string
}
