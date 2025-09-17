import { format } from 'date-fns';
import { Check, CheckCheck, ChevronLeft, Loader2, MessageSquare, Send } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useLocation } from 'react-router-dom';
import { EmptyState } from '../../components/ui/EmptyState';
import { useAuthStore } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import useFetch from '../../hooks/useFetch';
import messageService, { type Conversation } from '../../services/message.service';
import type { Message } from '../../types/message';

// Helper to check if a new day has started between messages
const isNewDay = (date1: string, date2: string | undefined) => {
  if (!date2) return true;
  return new Date(date1).toDateString() !== new Date(date2).toDateString();
};

const getUserName = (user: Conversation['otherUser']) => {
  if (user.candidateProfile) {
    return `${user.candidateProfile.firstName} ${user.candidateProfile.lastName}`;
  }
  if (user.ownedAgencies && user.ownedAgencies.length > 0) {
    return user.ownedAgencies[0].name;
  }
  return user.email;
};

const ChatWindow = ({ activeConversation, onGoBack }: { activeConversation: Conversation; onGoBack: () => void; }) => {
  const currentUserId = useAuthStore((state) => state.user?.id);
  const otherUserId = activeConversation.otherUser.id;

  const { data: fetchedMessages, isLoading, error } = useFetch<Message[]>(
    otherUserId ? `/messages/conversation/${otherUserId}` : null
  );

  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { socket } = useSocket();

  useEffect(() => {
    if (fetchedMessages) {
      setMessages(fetchedMessages);
      if (otherUserId) {
        const hasUnread = fetchedMessages.some(m => m.fromId === otherUserId && !m.readAt);
        if (hasUnread) {
          messageService.markConversationAsRead(otherUserId);
        }
      }
    }
  }, [fetchedMessages, otherUserId]);

  useEffect(() => {
    if (!socket || !otherUserId) return;

    const handleNewMessage = (receivedMessage: Message) => {
      if (receivedMessage.fromId === otherUserId) {
        setMessages((prev) => [...prev, receivedMessage]);
        messageService.markConversationAsRead(otherUserId);
      }
    };

    // Listen for the new, more specific 'messages_read' event
    const handleMessagesRead = ({ conversationPartnerId, readMessageIds }: { conversationPartnerId: string, readMessageIds: string[] }) => {
      // Check if the update is for the sender in our current conversation
      if (conversationPartnerId === currentUserId) {
        // Update the local state directly without a refetch
        const now = new Date().toISOString();
        setMessages(prevMessages => 
          prevMessages.map(msg => 
            readMessageIds.includes(msg.id) ? { ...msg, readAt: now } : msg
          )
        );
      }
    };

    socket.on('new_message', handleNewMessage);
    socket.on('messages_read', handleMessagesRead); // Use the new event
    
    return () => {
      socket.off('new_message', handleNewMessage);
      socket.off('messages_read', handleMessagesRead); // Clean up the new event
    };
  }, [socket, otherUserId, currentUserId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !otherUserId) return;

    const tempId = `temp-${Date.now()}`;
    const optimisticMessage: Message = {
      id: tempId, fromId: currentUserId!, toId: otherUserId,
      body: newMessage, createdAt: new Date().toISOString(), subject: null, readAt: null
    };
    
    setMessages(prev => [...prev, optimisticMessage]);
    const messageToSend = newMessage;
    setNewMessage('');

    try {
      const sentMessage = await messageService.sendMessage(otherUserId, messageToSend);
      setMessages(prev => prev.map(msg => (msg.id === tempId ? sentMessage : msg)));
    } catch (err) {
      toast.error("Failed to send message.");
      setMessages(prev => prev.filter(msg => msg.id !== tempId));
      setNewMessage(messageToSend);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-full"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }
  
  if (error) {
    return <div className="p-8 text-center text-red-500">Failed to load messages.</div>;
  }

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-gray-50 to-green-100">
      <div className="h-14 flex items-center px-4 border-b flex-shrink-0 bg-white">
  <button onClick={onGoBack} className="md:hidden mr-3 p-1 rounded-full hover:bg-gray-100">
    <ChevronLeft className="h-5 w-5" />
  </button>
  <p className="font-semibold">{getUserName(activeConversation.otherUser)}</p>
</div>
<div className="flex-grow p-6 space-y-3 overflow-y-auto bg-transparent">
        {messages?.map((msg, index) => {
          const prevMsg = messages[index - 1];
          const showDateSeparator = isNewDay(msg.createdAt, prevMsg?.createdAt);
          const isMyMessage = msg.fromId === currentUserId;

          return (
            <React.Fragment key={msg.id}>
              {showDateSeparator && (
                <div className="text-center text-xs text-gray-400 py-2">
                  {format(new Date(msg.createdAt), 'MMMM d, yyyy')}
                </div>
              )}
              <div className={`flex items-end gap-2 ${isMyMessage ? 'justify-end' : 'justify-start'}`}>
              <div
  className={`${
    isMyMessage
      ? 'bg-primary-600 text-white rounded-2xl rounded-br-sm shadow-md'
      : 'bg-white text-gray-800 border border-gray-200 rounded-2xl rounded-bl-sm shadow-sm'
  } py-2 px-4 max-w-[75%] text-sm`}
>

                  <p className="whitespace-pre-wrap break-words">{msg.body}</p>
                  <div className={`flex items-center gap-1 mt-1 ${isMyMessage ? 'justify-end' : ''}`}>
                    <p className="text-xs opacity-70">{format(new Date(msg.createdAt), 'h:mm a')}</p>
                    {isMyMessage && (
                      msg.readAt 
                        ? <CheckCheck className="h-4 w-4 text-blue-300" />
                        : <Check className="h-4 w-4 opacity-70" />
                    )}
                  </div>
                </div>
              </div>
            </React.Fragment>
          );
        })}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-4 border-t bg-gray-50 flex-shrink-0">
        <form onSubmit={handleSendMessage} className="relative">
        <textarea
  rows={1}
  value={newMessage}
  onChange={(e) => setNewMessage(e.target.value)}
  onKeyDown={(e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  }}
  placeholder="Type your message..."
  className={`w-full bg-transparent border-0 focus:ring-0 focus:outline-none pr-12 py-2 px-0 text-sm resize-none placeholder-gray-400 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent focus:shadow-inner`}
  style={{ direction: 'ltr', textAlign: 'left' }}
/>



          <button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-primary-600 text-white hover:bg-primary-700 disabled:bg-primary-300"
            disabled={!newMessage.trim()}
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
};

const ConversationList = ({ conversations, onSelect, activeConversationId }: { conversations: Conversation[], onSelect: (conv: Conversation) => void, activeConversationId: string | null }) => {
  return (
    <div className="border-r h-full bg-white flex flex-col">
  {/* Header */}
  <div className="h-14 flex items-center px-4 border-b flex-shrink-0">
  <h2 className="font-semibold text-lg">Conversations</h2>
</div>

  {/* Scrollable list */}
  <ul className="divide-y flex-1 overflow-y-auto">
    {conversations.map((conv) => (
      <li
        key={conv.otherUser.id}
        onClick={() => onSelect(conv)}
        className={`p-4 cursor-pointer hover:bg-gray-50 ${
          conv.otherUser.id === activeConversationId
            ? 'bg-primary-50 border-r-2 border-primary-600'
            : ''
        }`}
      >
        <p className="font-semibold text-sm">{getUserName(conv.otherUser)}</p>
        <p className="text-sm text-gray-500 truncate">{conv.lastMessage?.body}</p>
      </li>
    ))}
  </ul>
</div>

  );
};

const InboxPage = () => {
  const { data: conversations, isLoading, error } = useFetch<Conversation[]>('/messages/conversations');
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const location = useLocation();

  useEffect(() => {
    if (location.state?.activeConversation) {
      setActiveConversation(location.state.activeConversation);
    } else if (conversations && conversations.length > 0 && !activeConversation) {
      setActiveConversation(conversations[0]);
    }
  }, [location.state, conversations, activeConversation]);

  if (isLoading) {
    return <div className="flex h-[calc(100vh-56px)] items-center justify-center"><Loader2 className="h-10 w-10 animate-spin text-primary-600" /></div>;
  }
  
  if (error) {
      return <div className="p-8 text-center text-red-500">Failed to load conversations.</div>
  }

  if ((!conversations || conversations.length === 0) && !activeConversation) {
    return (
      <div className="h-[calc(100vh-56px)] flex items-center justify-center p-4">
        <EmptyState
          icon={MessageSquare}
          title="No Conversations Yet"
          description="Your message threads will appear here."
        />
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-56px)] flex overflow-hidden">
      <aside className={`w-full transition-transform duration-300 ease-in-out md:w-1/3 xl:w-1/4 flex-shrink-0
        ${activeConversation ? 'max-md:-translate-x-full' : 'max-md:translate-x-0'}
      `}>
        {conversations && (
          <ConversationList
            conversations={conversations}
            onSelect={setActiveConversation}
            activeConversationId={activeConversation?.otherUser.id || null}
          />
        )}
      </aside>
      
      <main className={`flex-1 transition-transform duration-300 ease-in-out w-full
        ${!activeConversation && 'max-md:hidden'}
        ${activeConversation ? 'max-md:translate-x-0' : 'max-md:translate-x-full'}
        max-md:absolute max-md:top-0 max-md:left-0 max-md:h-full
      `}>
        {activeConversation ? (
            <ChatWindow 
                activeConversation={activeConversation} 
                onGoBack={() => setActiveConversation(null)} 
            />
        ) : (
            <div className="hidden md:flex flex-col h-full items-center justify-center text-center text-gray-500">
                <MessageSquare className="h-16 w-16" />
                <h2 className="mt-2 text-lg font-medium">Select a conversation</h2>
                <p className="text-sm">Choose a conversation from the left to start chatting.</p>
            </div>
        )}
      </main>
    </div>
  );
};

export default InboxPage;