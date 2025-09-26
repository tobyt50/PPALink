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

const isNewDay = (date1: string, date2: string | undefined) => {
  if (!date2) return true;
  return new Date(date1).toDateString() !== new Date(date2).toDateString();
};

const getUserName = (user: Conversation['otherUser']) => {
  if (user.candidateProfile) return `${user.candidateProfile.firstName} ${user.candidateProfile.lastName}`;
  if (user.ownedAgencies && user.ownedAgencies.length > 0) return user.ownedAgencies[0].name;
  return user.email;
};

const ChatWindow = ({ activeConversation, onGoBack }: { activeConversation: Conversation; onGoBack: () => void; }) => {
  const currentUserId = useAuthStore((state) => state.user?.id);
  const otherUserId = activeConversation.otherUser.id;

  const { data: fetchedMessages, isLoading, error } = useFetch<Message[]>(otherUserId ? `/messages/conversation/${otherUserId}` : null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { socket } = useSocket();

  useEffect(() => {
    if (fetchedMessages) {
      setMessages(fetchedMessages);
      if (otherUserId && fetchedMessages.some(m => m.fromId === otherUserId && !m.readAt)) {
        messageService.markConversationAsRead(otherUserId);
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
    const handleMessagesRead = ({ conversationPartnerId, readMessageIds }: { conversationPartnerId: string, readMessageIds: string[] }) => {
      if (conversationPartnerId === currentUserId) {
        const now = new Date().toISOString();
        setMessages(prev => prev.map(msg => readMessageIds.includes(msg.id) ? { ...msg, readAt: now } : msg));
      }
    };
    socket.on('new_message', handleNewMessage);
    socket.on('messages_read', handleMessagesRead);
    return () => {
      socket.off('new_message', handleNewMessage);
      socket.off('messages_read', handleMessagesRead);
    };
  }, [socket, otherUserId, currentUserId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !otherUserId) return;
    const tempId = `temp-${Date.now()}`;
    const optimisticMessage: Message = { id: tempId, fromId: currentUserId!, toId: otherUserId, body: newMessage, createdAt: new Date().toISOString(), subject: null, readAt: null };
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

  if (isLoading) return <div className="flex justify-center items-center h-full bg-gray-50 dark:bg-gray-920"><Loader2 className="h-8 w-8 animate-spin text-primary-600 dark:text-primary-400" /></div>;
  if (error) return <div className="p-8 text-center text-red-600 dark:text-red-400">Failed to load messages.</div>;

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-zinc-900/50"> 
      <div className="h-14 px-4 flex items-center border-b border-gray-100 dark:border-zinc-800 flex-shrink-0 bg-white dark:bg-zinc-900">
        <button onClick={onGoBack} className="md:hidden mr-3 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors">
          <ChevronLeft className="h-5 w-5 text-gray-600 dark:text-zinc-300" />
        </button>
        <p className="font-semibold text-primary-600 dark:text-primary-400">{getUserName(activeConversation.otherUser)}</p>
      </div>
      <div className="flex-grow p-4 space-y-2 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-zinc-700 hover:scrollbar-thumb-gray-400 dark:hover:scrollbar-thumb-zinc-600 scrollbar-track-transparent">
        {messages?.map((msg, index) => {
          const prevMsg = messages[index - 1];
          const showDateSeparator = isNewDay(msg.createdAt, prevMsg?.createdAt);
          const isMyMessage = msg.fromId === currentUserId;
          return (
            <React.Fragment key={msg.id}>
              {showDateSeparator && (
                <div className="text-center text-xs text-gray-500 dark:text-zinc-400 py-3">
                  <span className="bg-gray-200 dark:bg-zinc-800/70 rounded-full px-3 py-1">{format(new Date(msg.createdAt), 'MMMM d, yyyy')}</span>
                </div>
              )}
              <div className={`flex items-end gap-2 ${isMyMessage ? 'justify-end' : 'justify-start'}`}>
                <div className={`py-2.5 px-4 max-w-[80%] text-sm ${isMyMessage ? 'bg-primary-500 dark:bg-primary-500 text-white dark:text-zinc-100 rounded-2xl rounded-br-lg shadow-md dark:shadow-none dark:ring-1 dark:ring-white/10' : 'bg-white dark:bg-zinc-900 text-gray-800 dark:text-zinc-100 ring-1 ring-gray-100 rounded-2xl rounded-bl-lg shadow-sm dark:shadow-none dark:ring-1 dark:ring-white/10'}`}>
                  <p className="whitespace-pre-wrap break-words">{msg.body}</p>
                  <div className={`flex items-center gap-1.5 mt-1.5 ${isMyMessage ? 'justify-end' : ''}`}>
                    <p className={`text-xs ${isMyMessage ? 'text-green-50' : 'text-gray-400 dark:text-zinc-500'}`}>{format(new Date(msg.createdAt), 'h:mm a')}</p>
                    {isMyMessage && (msg.readAt ? <CheckCheck className="h-4 w-4 text-blue-300" /> : <Check className="h-4 w-4 text-green-100/80" />)}
                  </div>
                </div>
              </div>
            </React.Fragment>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-3 border-t border-gray-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex-shrink-0">
        <form onSubmit={handleSendMessage}>
          <div className="relative flex items-center rounded-full bg-gray-100 dark:bg-zinc-800 px-3 py-2.5">
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
              placeholder="Type a message..."
              className="flex-1 bg-transparent border-0 p-0 text-sm resize-none placeholder-gray-500 focus:outline-none"
            />
            <button
              type="submit"
              className="ml-3 flex-shrink-0 p-2.5 rounded-full bg-primary-500 dark:bg-primary-500 text-white dark:text-zinc-100 transition-opacity hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
              disabled={!newMessage.trim()}
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const ConversationList = ({ conversations, onSelect, activeConversationId }: { conversations: Conversation[], onSelect: (conv: Conversation) => void, activeConversationId: string | null }) => {
  return (
    <div className="border-r border-gray-100 dark:border-zinc-800 h-full bg-white dark:bg-zinc-900 flex flex-col">
      <div className="h-14 px-5 flex items-center border-b border-gray-100 dark:border-zinc-800 flex-shrink-0">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-zinc-50">Conversations</h2>
      </div>
      <ul className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-zinc-700 hover:scrollbar-thumb-gray-400 dark:hover:scrollbar-thumb-zinc-600 scrollbar-thumb-gray-200 scrollbar-track-transparent">
        {conversations.map((conv) => {
          const isActive = conv.otherUser.id === activeConversationId;
          const hasUnread = conv.lastMessage && conv.lastMessage.fromId !== useAuthStore.getState().user?.id && !conv.lastMessage.readAt;
          return (
            <li
              key={conv.otherUser.id}
              onClick={() => onSelect(conv)}
              className={`group block px-4 py-3 cursor-pointer transition-all ${isActive ? 'bg-gradient-to-r from-primary-50 dark:from-primary-950/60 to-green-50 dark:to-green-950/60' : 'hover:bg-gray-50 dark:hover:bg-zinc-800/70'}`}
            >
              <div className="flex items-center justify-between">
                <p className={`font-semibold text-sm truncate ${isActive ? 'text-primary-600 dark:text-primary-400' : 'text-gray-800 dark:text-zinc-100'}`}>{getUserName(conv.otherUser)}</p>
                {hasUnread && <div className="h-2 w-2 rounded-full bg-primary-500 dark:bg-primary-500" />}
              </div>
              <p className={`text-sm text-gray-500 dark:text-zinc-400 truncate mt-0.5 ${hasUnread && !isActive ? 'font-semibold text-gray-700 dark:text-zinc-200' : ''}`}>
                {conv.lastMessage?.body || 'No messages yet.'}
              </p>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

const InboxPage = () => {
  const { data: conversations, isLoading, error } = useFetch<Conversation[]>('/messages/conversations');
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const location = useLocation();

  useEffect(() => {
    if (location.state?.activeConversation) setActiveConversation(location.state.activeConversation);
    else if (conversations && conversations.length > 0 && !activeConversation) setActiveConversation(conversations[0]);
  }, [location.state, conversations, activeConversation]);

  if (isLoading) return <div className="flex h-[calc(100vh-56px)] items-center justify-center"><Loader2 className="h-10 w-10 animate-spin text-primary-600 dark:text-primary-400" /></div>;
  if (error) return <div className="p-8 text-center text-red-500">Failed to load conversations.</div>;
  if (!conversations || conversations.length === 0) {
    return (
      <div className="h-[calc(100vh-56px)] flex items-center justify-center p-4">
        <EmptyState icon={MessageSquare} title="No Conversations Yet" description="Your message threads will appear here." />
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-56px)] flex overflow-hidden">
      <aside className={`w-full transition-transform duration-300 ease-in-out md:w-1/3 xl:w-1/4 flex-shrink-0 ${activeConversation ? 'max-md:-translate-x-full' : 'max-md:translate-x-0'}`}>
        <ConversationList conversations={conversations} onSelect={setActiveConversation} activeConversationId={activeConversation?.otherUser.id || null} />
      </aside>
      <main className={`flex-1 transition-transform duration-300 ease-in-out w-full ${!activeConversation && 'max-md:hidden'} ${activeConversation ? 'max-md:translate-x-0' : 'max-md:translate-x-full'} max-md:absolute max-md:top-0 max-md:left-0 max-md:h-full`}>
        {activeConversation ? <ChatWindow activeConversation={activeConversation} onGoBack={() => setActiveConversation(null)} /> : (
          <div className="hidden md:flex flex-col h-full items-center justify-center text-center text-gray-500 dark:text-zinc-400 bg-gray-50 dark:bg-zinc-900/50">
            <MessageSquare className="h-16 w-16 text-gray-300" />
            <h2 className="mt-4 text-lg font-medium text-gray-600 dark:text-zinc-300">Select a conversation</h2>
            <p className="text-sm text-gray-500 dark:text-zinc-400">Choose from the list on the left to start chatting.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default InboxPage;


