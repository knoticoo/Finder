'use client'

import { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import { 
  ChatBubbleLeftRightIcon,
  PaperAirplaneIcon,
  UserIcon,
  CalendarIcon,
  ClockIcon,
  PaperClipIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import { messagesAPI, bookingsAPI } from '@/lib/api'

interface Message {
  id: string
  content: string
  messageType: string
  attachments: string[]
  createdAt: string
  sender: {
    id: string
    firstName: string
    lastName: string
    avatar: string
  }
  receiver: {
    id: string
    firstName: string
    lastName: string
    avatar: string
  }
}

interface Conversation {
  id: string
  participant: {
    id: string
    firstName: string
    lastName: string
    avatar: string
  }
  lastMessage: {
    content: string
    createdAt: string
    senderId: string
  }
  unreadCount: number
  booking?: {
    id: string
    service: {
      title: string
    }
  }
}

export default function ProviderMessagesPage() {
  const searchParams = useSearchParams()
  const customerId = searchParams.get('customer')
  
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingMessages, setIsLoadingMessages] = useState(false)
  const [newMessage, setNewMessage] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [showConversationList, setShowConversationList] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchConversations()
  }, [])

  useEffect(() => {
    if (customerId && conversations.length > 0) {
      const conversation = conversations.find(c => c.participant.id === customerId)
      if (conversation) {
        setSelectedConversation(conversation)
        fetchMessages(conversation.participant.id)
      }
    }
  }, [customerId, conversations])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const fetchConversations = async () => {
    try {
      const response = await messagesAPI.getUserConversations()
      if (response.data.success) {
        setConversations(response.data.data)
      }
    } catch (error) {
      console.error('Error fetching conversations:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchMessages = async (participantId: string) => {
    setIsLoadingMessages(true)
    try {
      const response = await messagesAPI.getConversation(participantId)
      if (response.data.success) {
        setMessages(response.data.data)
      }
    } catch (error) {
      console.error('Error fetching messages:', error)
    } finally {
      setIsLoadingMessages(false)
    }
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !selectedConversation) return

    setIsSending(true)
    try {
      const response = await messagesAPI.sendMessage({
        receiverId: selectedConversation.participant.id,
        content: newMessage,
        messageType: 'TEXT'
      })

      if (response.data.success) {
        setNewMessage('')
        fetchMessages(selectedConversation.participant.id)
      }
    } catch (error: any) {
      alert(error.response?.data?.message || 'Neizdevās nosūtīt ziņojumu')
    } finally {
      setIsSending(false)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('lv-LV', { hour: '2-digit', minute: '2-digit' })
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) {
      return 'Šodien'
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Vakar'
    } else {
      return date.toLocaleDateString('lv-LV')
    }
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-900">Ziņojumi</h1>
          <button
            onClick={() => setShowConversationList(!showConversationList)}
            className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600"
          >
            <ChatBubbleLeftRightIcon className="h-6 w-6" />
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Conversation List */}
        <div className={`w-full lg:w-80 bg-white border-r border-gray-200 flex flex-col ${
          showConversationList ? 'block' : 'hidden lg:block'
        }`}>
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Sarunas</h2>
          </div>

          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="p-4 space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-12 bg-gray-200 rounded"></div>
                  </div>
                ))}
              </div>
            ) : conversations.length > 0 ? (
              <div className="divide-y divide-gray-200">
                {conversations.map((conversation) => (
                  <button
                    key={conversation.id}
                    onClick={() => {
                      setSelectedConversation(conversation)
                      fetchMessages(conversation.participant.id)
                      setShowConversationList(false)
                    }}
                    className={`w-full p-4 text-left hover:bg-gray-50 focus:outline-none focus:bg-gray-50 ${
                      selectedConversation?.id === conversation.id ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center text-white font-medium">
                          {conversation.participant.firstName.charAt(0)}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {conversation.participant.firstName} {conversation.participant.lastName}
                          </p>
                          {conversation.unreadCount > 0 && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              {conversation.unreadCount}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 truncate">
                          {conversation.lastMessage.content}
                        </p>
                        <p className="text-xs text-gray-400">
                          {formatDate(conversation.lastMessage.createdAt)}
                        </p>
                        {conversation.booking && (
                          <p className="text-xs text-blue-600">
                            {conversation.booking.service.title}
                          </p>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center">
                <ChatBubbleLeftRightIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Nav sarunu</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Jums vēl nav sarunu ar klientiem.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 flex flex-col bg-gray-50">
          {selectedConversation ? (
            <>
              {/* Conversation Header */}
              <div className="bg-white border-b border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center text-white font-medium">
                      {selectedConversation.participant.firstName.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">
                        {selectedConversation.participant.firstName} {selectedConversation.participant.lastName}
                      </h3>
                      {selectedConversation.booking && (
                        <p className="text-sm text-gray-500">
                          {selectedConversation.booking.service.title}
                        </p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => setShowConversationList(true)}
                    className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>
              </div>

              {/* Messages List */}
              <div className="flex-1 overflow-y-auto p-4">
                {isLoadingMessages ? (
                  <div className="space-y-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-16 bg-gray-200 rounded"></div>
                      </div>
                    ))}
                  </div>
                ) : messages.length > 0 ? (
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.sender.id === 'current-user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          message.sender.id === 'current-user'
                            ? 'bg-green-600 text-white'
                            : 'bg-white text-gray-900 border border-gray-200'
                        }`}>
                          <p className="text-sm">{message.content}</p>
                          <p className={`text-xs mt-1 ${
                            message.sender.id === 'current-user' ? 'text-green-100' : 'text-gray-500'
                          }`}>
                            {formatTime(message.createdAt)}
                          </p>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <ChatBubbleLeftRightIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">Nav ziņojumu</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Sāciet sarunu ar {selectedConversation.participant.firstName}!
                    </p>
                  </div>
                )}
              </div>

              {/* Message Input */}
              <div className="bg-white border-t border-gray-200 p-4">
                <form onSubmit={handleSendMessage} className="flex space-x-4">
                  <div className="flex-1">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Rakstiet ziņojumu..."
                      className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-green-500 focus:border-green-500"
                      disabled={isSending}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={!newMessage.trim() || isSending}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <PaperAirplaneIcon className="h-4 w-4" />
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <ChatBubbleLeftRightIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Izvēlieties sarunu</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Izvēlieties sarunu, lai sāktu ziņojumus.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}