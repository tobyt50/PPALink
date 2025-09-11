import { ChevronLeft, Loader2, MessageSquare, Send } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useLocation } from 'react-router-dom';
import { EmptyState } from '../../components/ui/EmptyState';
import { useAuthStore } from '../../context/AuthContext';
import useFetch from '../../hooks/useFetch';
import messageService, { type Conversation } from '../../services/message.service';
import type { Message } from '../../types/message';

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

  useEffect(() => {
    if (fetchedMessages) {
      setMessages(fetchedMessages);
    }
  }, [fetchedMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !otherUserId) return;

    const tempId = `temp-${Date.now()}`;
    const optimisticMessage: Message = {
      id: tempId, fromId: currentUserId!, toId: otherUserId,
      body: newMessage, createdAt: new Date().toISOString(), subject: null,
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
    <div className="flex flex-col h-full bg-white">
      <div className="p-4 border-b flex-shrink-0 flex items-center">
        <button onClick={onGoBack} className="md:hidden mr-3 p-1 rounded-full hover:bg-gray-100">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <p className="font-semibold">{getUserName(activeConversation.otherUser)}</p>
      </div>
      <div className="flex-grow p-4 space-y-4 overflow-y-auto">
        {messages?.map(msg => (
          <div key={msg.id} className={`flex ${msg.fromId === currentUserId ? 'justify-end' : 'justify-start'}`}>
            <div className={`${msg.fromId === currentUserId ? 'bg-primary-600 text-white' : 'bg-gray-200'} rounded-lg p-3 max-w-sm`}>
              {msg.body}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-4 border-t bg-gray-50 flex-shrink-0">
        <form onSubmit={handleSendMessage} className="relative">
          <textarea
            rows={1} value={newMessage} onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(e); } }}
            placeholder="Type your message..."
            className="w-full rounded-full border-gray-300 pr-12 py-2 px-4 text-sm focus:ring-primary-500 focus:border-primary-500 resize-none"
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
      <div className="p-4 border-b flex-shrink-0"><h2 className="font-semibold text-lg">Conversations</h2></div>
      <ul className="divide-y h-[calc(100%-61px)] overflow-y-auto">
        {conversations.map((conv) => (
          <li
            key={conv.otherUser.id}
            onClick={() => onSelect(conv)}
            className={`p-4 cursor-pointer hover:bg-gray-50 ${conv.otherUser.id === activeConversationId ? 'bg-primary-50 border-r-2 border-primary-600' : ''}`}
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