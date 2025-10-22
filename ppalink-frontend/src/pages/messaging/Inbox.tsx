import { format } from "date-fns";
import {
  Check,
  CheckCheck,
  ChevronLeft,
  Loader2,
  MessageSquare,
  Send,
} from "lucide-react";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "react-hot-toast";
import { useLocation, useSearchParams, Link } from "react-router-dom";
import { Avatar } from "../../components/ui/Avatar";
import { EmptyState } from "../../components/ui/EmptyState";
import { useAuthStore } from "../../context/AuthContext";
import { useSocket } from "../../context/SocketContext";
import useFetch from "../../hooks/useFetch";
import messageService, {
  type Conversation,
} from "../../services/message.service";
import type { Message } from "../../types/message";

interface OtherUser {
  id: string;
  email: string | null;
  avatarKey?: string | null;
  ownedAgencies?: {
    id: string;
    name: string;
    logoKey?: string | null;
  }[];
  candidateProfile: {
    id: string;
    firstName: string | null;
    lastName: string | null;
  } | null;
}

const isNewDay = (date1: string, date2: string | undefined) => {
  if (!date2) return true;
  return new Date(date1).toDateString() !== new Date(date2).toDateString();
};

const getUserName = (user: Conversation["otherUser"]) => {
  if (user.candidateProfile)
    return `${user.candidateProfile.firstName} ${user.candidateProfile.lastName}`;
  if (user.ownedAgencies && user.ownedAgencies.length > 0)
    return user.ownedAgencies[0].name;
  return user.email;
};

const ChatWindow = ({
  activeConversation,
  onGoBack,
  refetchConversations,
}: {
  activeConversation: Conversation;
  onGoBack: () => void;
  refetchConversations?: () => void;
}) => {
  const currentUser = useAuthStore((state) => state.user);
  const currentUserId = currentUser?.id;
  const otherUser = activeConversation.otherUser;
  const {
    data: fetchedMessages,
    isLoading,
    error,
  } = useFetch<Message[]>(
    otherUser.id ? `/messages/conversation/${otherUser.id}` : null
  );
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { socket } = useSocket();

  // Compute link logic
  const getNameLink = (user: Conversation["otherUser"]) => {
    if (currentUser?.role === "ADMIN") return "#";
    if (user.candidateProfile && currentUser?.role === "AGENCY") {
      return `/dashboard/agency/candidates/${user.candidateProfile.id}/profile`;
    }
    if (user.ownedAgencies && user.ownedAgencies.length > 0) {
      return `/agencies/${user.ownedAgencies[0].id}/profile`;
    }
    return "#";
  };

  const nameLink = getNameLink(otherUser);
  const isClickable = nameLink !== "#";

  useEffect(() => {
    if (fetchedMessages) {
      setMessages(fetchedMessages);
      if (
        otherUser.id &&
        fetchedMessages.some((m) => m.fromId === otherUser.id && !m.readAt)
      ) {
        messageService.markConversationAsRead(otherUser.id);
      }
    }
  }, [fetchedMessages, otherUser.id]);
  useEffect(() => {
    if (!socket || !otherUser.id) return;
    const handleNewMessage = (receivedMessage: Message) => {
      if (receivedMessage.fromId === otherUser.id) {
        setMessages((prev) => [...prev, receivedMessage]);
        messageService.markConversationAsRead(otherUser.id);
      }
    };
    const handleMessagesRead = ({
      conversationPartnerId,
      readMessageIds,
    }: {
      conversationPartnerId: string;
      readMessageIds: string[];
    }) => {
      if (conversationPartnerId === currentUserId) {
        const now = new Date().toISOString();
        setMessages((prev) =>
          prev.map((msg) =>
            readMessageIds.includes(msg.id) ? { ...msg, readAt: now } : msg
          )
        );
      }
    };
    socket.on("new_message", handleNewMessage);
    socket.on("messages_read", handleMessagesRead);
    return () => {
      socket.off("new_message", handleNewMessage);
      socket.off("messages_read", handleMessagesRead);
    };
  }, [socket, otherUser.id, currentUserId]);
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !otherUser.id) return;
    const tempId = `temp-${Date.now()}`;
    const optimisticMessage: Message = {
      id: tempId,
      fromId: currentUserId!,
      toId: otherUser.id,
      body: newMessage,
      createdAt: new Date().toISOString(),
      subject: null,
      readAt: null,
    };
    setMessages((prev) => [...prev, optimisticMessage]);
    const messageToSend = newMessage;
    setNewMessage("");
    try {
      const sentMessage = await messageService.sendMessage(
        otherUser.id,
        messageToSend
      );
      setMessages((prev) =>
        prev.map((msg) => (msg.id === tempId ? sentMessage : msg))
      );
      if (refetchConversations) {
        refetchConversations();
      }
    } catch (err) {
      toast.error("Failed to send message.");
      setMessages((prev) => prev.filter((msg) => msg.id !== tempId));
      setNewMessage(messageToSend);
    }
  };

  if (isLoading)
    return (
      <div className="flex justify-center items-center h-full bg-gray-50 dark:bg-zinc-900/50">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600 dark:text-primary-400" />
      </div>
    );
  if (error)
    return (
      <div className="p-8 text-center text-red-600 dark:text-red-400">
        Failed to load messages.
      </div>
    );

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-zinc-900/50">
      <div className="h-14 px-4 flex items-center border-b border-gray-100 dark:border-zinc-800 flex-shrink-0 bg-white dark:bg-zinc-900">
        <button
          onClick={onGoBack}
          className="md:hidden mr-3 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
        >
          <ChevronLeft className="h-5 w-5 text-gray-600 dark:text-zinc-300" />
        </button>
        <Avatar user={otherUser as any} size="md" />
        <div className="ml-3">
          {isClickable ? (
            <Link
              to={nameLink}
              className="font-semibold text-primary-600 dark:text-primary-400 hover:underline"
            >
              {getUserName(otherUser)}
            </Link>
          ) : (
            <p className="font-semibold text-primary-600 dark:text-primary-400">
              {getUserName(otherUser)}
            </p>
          )}
        </div>
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
                  <span className="bg-gray-200 dark:bg-zinc-800/70 rounded-full px-3 py-1">
                    {format(new Date(msg.createdAt), "MMMM d, yyyy")}
                  </span>
                </div>
              )}
              <div
                className={`flex items-end gap-2 ${
                  isMyMessage ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`py-2.5 px-4 max-w-[80%] text-sm ${
                    isMyMessage
                      ? "bg-primary-500 dark:bg-primary-500 text-white dark:text-zinc-100 rounded-2xl rounded-br-lg shadow-md dark:shadow-none dark:ring-1 dark:ring-white/10"
                      : "bg-white dark:bg-zinc-900 text-gray-800 dark:text-zinc-100 ring-1 ring-gray-100 rounded-2xl rounded-bl-lg shadow-sm dark:shadow-none dark:ring-1 dark:ring-white/10"
                  }`}
                >
                  <p className="whitespace-pre-wrap break-words">{msg.body}</p>
                  <div
                    className={`flex items-center gap-1.5 mt-1.5 ${
                      isMyMessage ? "justify-end" : ""
                    }`}
                  >
                    <p
                      className={`text-xs ${
                        isMyMessage
                          ? "text-green-50"
                          : "text-gray-400 dark:text-zinc-500"
                      }`}
                    >
                      {format(new Date(msg.createdAt), "h:mm a")}
                    </p>
                    {isMyMessage &&
                      (msg.readAt ? (
                        <CheckCheck className="h-4 w-4 text-blue-300" />
                      ) : (
                        <Check className="h-4 w-4 text-green-100/80" />
                      ))}
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
                if (e.key === "Enter" && !e.shiftKey) {
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

const ConversationList = ({
  conversations,
  onSelect,
  activeConversationId,
}: {
  conversations: Conversation[];
  onSelect: (conv: Conversation) => void;
  activeConversationId: string | null;
}) => {
  const currentUser = useAuthStore((state) => state.user);

  // Compute link logic
  const getNameLink = (user: Conversation["otherUser"]) => {
    if (currentUser?.role === "ADMIN") return "#";
    if (user.candidateProfile && currentUser?.role === "AGENCY") {
      return `/dashboard/agency/candidates/${user.candidateProfile.id}/profile`;
    }
    if (user.ownedAgencies && user.ownedAgencies.length > 0) {
      return `/agencies/${user.ownedAgencies[0].id}/profile`;
    }
    return "#";
  };

  return (
    <div className="border-r border-gray-100 dark:border-zinc-800 h-full bg-white dark:bg-zinc-900 flex flex-col">
      <div className="h-14 px-5 flex items-center border-b border-gray-100 dark:border-zinc-800 flex-shrink-0">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-zinc-50">
          Conversations
        </h2>
      </div>
      <ul className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-zinc-700 hover:scrollbar-thumb-gray-400 dark:hover:scrollbar-thumb-zinc-600 scrollbar-track-transparent">
        {conversations.map((conv) => {
          const isActive = conv.otherUser.id === activeConversationId;
          const hasUnread =
            conv.lastMessage &&
            conv.lastMessage.fromId !== currentUser?.id &&
            !conv.lastMessage.readAt;
          const nameLink = getNameLink(conv.otherUser);
          const isClickable = nameLink !== "#";
          const name = getUserName(conv.otherUser);
          return (
            <li
              key={conv.otherUser.id}
              onClick={() => onSelect(conv)}
              className={`group block px-4 py-3 cursor-pointer transition-all ${
                isActive
                  ? "bg-gradient-to-r from-primary-50 dark:from-primary-950/60 to-green-50 dark:to-green-950/60"
                  : "hover:bg-gray-50 dark:hover:bg-zinc-800/70"
              }`}
            >
              <div className="flex items-center">
                <Avatar user={conv.otherUser as any} size="sm" />
                <div className="ml-3 flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div
                      className={`font-semibold text-sm truncate ${
                        isActive
                          ? "text-primary-600 dark:text-primary-400"
                          : "text-gray-800 dark:text-zinc-100"
                      }`}
                    >
                      {isClickable ? (
                        <Link
                          to={nameLink}
                          onClick={(e) => e.stopPropagation()}
                          className={`hover:underline ${
                            isActive
                              ? "text-primary-600 dark:text-primary-400"
                              : "text-gray-800 dark:text-zinc-100 hover:text-primary-600 dark:hover:text-primary-400"
                          }`}
                        >
                          {name}
                        </Link>
                      ) : (
                        <p
                          className={`${
                            isActive
                              ? "text-primary-600 dark:text-primary-400"
                              : "text-gray-800 dark:text-zinc-100"
                          }`}
                        >
                          {name}
                        </p>
                      )}
                    </div>
                    {hasUnread && (
                      <div className="h-2 w-2 rounded-full bg-primary-500 dark:bg-primary-500" />
                    )}
                  </div>
                  <p
                    className={`text-sm text-gray-500 dark:text-zinc-400 truncate mt-0.5 ${
                      hasUnread && !isActive
                        ? "font-semibold text-gray-700 dark:text-zinc-200"
                        : ""
                    }`}
                  >
                    {conv.lastMessage?.body || "No messages yet."}
                  </p>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

const InboxPage = () => {
  const { data: initialConversations, isLoading, error, refetch: refetchConversations } = useFetch<Conversation[]>('/messages/conversations');
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isMobile, setIsMobile] = useState(false);
  const [pendingConvId, setPendingConvId] = useState<string | null>(null);
  const hasAutoSelectedRef = useRef(false);

  const { data: pendingUser, isLoading: loadingUser, error: userError } = useFetch<OtherUser>(
    pendingConvId ? `/messages/user/${pendingConvId}` : null
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 767px)');
    setIsMobile(mediaQuery.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Sync state with URL params (for browser navigation, refresh, etc.)
  useEffect(() => {
    const view = searchParams.get('view');
    const convId = searchParams.get('conversation');

    if (view === 'chat') {
      if (convId) {
        const conv = conversations.find((c) => c.otherUser.id === convId);
        if (conv) {
          setActiveConversation(conv);
          setPendingConvId(null);
          return;
        } else {
          // Fetch user details for new chat
          setPendingConvId(convId);
          setActiveConversation(null); // Ensure we don't show partial UI
          return;
        }
      }
      // Invalid chat view, go to list
      setActiveConversation(null);
      setPendingConvId(null);
      setSearchParams({}, { replace: true });
      return;
    } else {
      setActiveConversation(null);
      setPendingConvId(null);
    }
  }, [searchParams, conversations]);

  // Set active conversation once pending user is fetched
  useEffect(() => {
    if (pendingUser && pendingConvId) {
      const conv: Conversation = {
        otherUser: pendingUser,
        lastMessage: undefined,
      };
      setConversations((prev) => {
        if (prev.some((c) => c.otherUser.id === pendingConvId)) return prev;
        return [conv, ...prev];
      });
      setActiveConversation(conv);
      setPendingConvId(null);
    }
  }, [pendingUser, pendingConvId]);

  // Handle navigation from location.state
  useEffect(() => {
    const stateConv = location.state?.activeConversation;
    if (stateConv && !activeConversation) {
      setActiveConversation(stateConv);
      setSearchParams(
        { view: 'chat', conversation: stateConv.otherUser.id },
        { replace: true }
      );
    }
  }, [location.state, activeConversation]);

  // Auto-select first conversation on desktop initial load
  useEffect(() => {
    if (
      !hasAutoSelectedRef.current &&
      conversations.length > 0 &&
      !isMobile &&
      !searchParams.get('view')
    ) {
      hasAutoSelectedRef.current = true;
      const firstConv = conversations[0];
      setActiveConversation(firstConv);
      setSearchParams(
        { view: 'chat', conversation: firstConv.otherUser.id },
        { replace: true }
      );
    }
  }, [conversations, isMobile, searchParams]);

  // Load and prepare conversations
  useEffect(() => {
    if (initialConversations) {
      let currentConversations = [...initialConversations];
      const newConversationFromState = location.state?.activeConversation;

      if (newConversationFromState) {
        const existingConv = currentConversations.find(
          (c) => c.otherUser.id === newConversationFromState.otherUser.id
        );

        if (!existingConv) {
          const tempNewConv: Conversation = {
            ...newConversationFromState,
            lastMessage: null,
          };
          currentConversations.unshift(tempNewConv);
        }
      }

      setConversations(currentConversations);
    }
  }, [initialConversations, location.state]);

  const handleSelectConversation = useCallback(
    (conv: Conversation) => {
      setActiveConversation(conv);
      setSearchParams(
        { view: 'chat', conversation: conv.otherUser.id },
        { replace: true }
      );
    },
    [setSearchParams]
  );

  const handleGoBack = useCallback(() => {
    setActiveConversation(null);
    setSearchParams({}, { replace: true });
  }, [setSearchParams]);

  // Handle pending user fetch states
  if (pendingConvId) {
    if (loadingUser) {
      return (
        <div className="h-full flex items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary-600 dark:text-primary-400" />
        </div>
      );
    }
    if (userError) {
      return (
        <div className="p-8 text-center text-red-500">
          Failed to load user details.
        </div>
      );
    }
  }

  if (isLoading)
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary-600 dark:text-primary-400" />
      </div>
    );
  if (error)
    return (
      <div className="p-8 text-center text-red-500">
        Failed to load conversations.
      </div>
    );
  if (!conversations || conversations.length === 0) {
    return (
      <div className="h-full flex items-center justify-center p-4">
        <EmptyState
          icon={MessageSquare}
          title="No Conversations Yet"
          description="Your message threads will appear here."
        />
      </div>
    );
  }

  return (
    <div className="h-full flex overflow-hidden relative">
      <aside
        className={`w-full transition-transform duration-300 ease-in-out md:w-1/3 xl:w-1/4 flex-shrink-0 ${
          activeConversation
            ? "max-md:-translate-x-full"
            : "max-md:translate-x-0"
        }`}
      >
        <ConversationList
          conversations={conversations}
          onSelect={handleSelectConversation}
          activeConversationId={activeConversation?.otherUser.id || null}
        />
      </aside>
      <main
        className={`flex-1 transition-transform duration-300 ease-in-out w-full ${
          !activeConversation && "max-md:hidden"
        } ${
          activeConversation
            ? "max-md:translate-x-0"
            : "max-md:translate-x-full"
        } max-md:absolute max-md:top-0 max-md:left-0 max-md:h-full`}
      >
        {activeConversation ? (
          <ChatWindow
            key={activeConversation.otherUser.id}
            activeConversation={activeConversation}
            onGoBack={handleGoBack}
            refetchConversations={refetchConversations}
          />
        ) : (
          <div className="hidden md:flex flex-col h-full items-center justify-center text-center text-gray-500 dark:text-zinc-400 bg-gray-50 dark:bg-zinc-900/50">
            <MessageSquare className="h-16 w-16 text-gray-300" />
            <h2 className="mt-4 text-lg font-medium text-gray-600 dark:text-zinc-300">
              Select a conversation
            </h2>
            <p className="text-sm text-gray-500 dark:text-zinc-400">
              Choose from the list on the left to start chatting.
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default InboxPage;