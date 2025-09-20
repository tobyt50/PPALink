import { formatDistanceToNow } from 'date-fns';
import { Mail, Check } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useMessageNotificationStore } from '../../context/MessageNotificationStore';
import { useSocket } from '../../context/SocketContext';
import messageService from '../../services/message.service';
import notificationService from '../../services/notification.service';
import type { Notification } from '../../types/notification';
import { BellDropdown, BellDropdownItem } from '../ui/BellDropdown';
import { InteractiveToast } from '../ui/InteractiveToast';

export const InboxBell = () => {
  const navigate = useNavigate();
  const { socket } = useSocket();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { unreadMessageCount, setUnreadMessageCount } = useMessageNotificationStore();

  const refetch = async () => {
    try {
      const fetched = await messageService.getMyMessageNotifications();
      setNotifications(fetched);
      setUnreadMessageCount(fetched.filter((n) => !n.read).length);
    } catch (error) {
      console.error('Failed to fetch message notifications');
    }
  };

  useEffect(() => {
    refetch();
  }, []);

  useEffect(() => {
    if (!socket) return;

    const handleNewMessageNotification = (newNotification: Notification) => {
      refetch();
      toast.custom((t) => (
        <InteractiveToast
          t={t}
          Icon={Mail}
          iconColorClass="text-blue-500"
          title="New Message"
          message={newNotification.message}
          link={newNotification.link || '/inbox'}
          navigate={navigate}
        />
      ));
    };

    socket.on('new_message_notification', handleNewMessageNotification);
    return () => {
      socket.off('new_message_notification', handleNewMessageNotification);
    };
  }, [socket, navigate]);

  const handleMarkAllAsRead = async () => {
    if (unreadMessageCount === 0) return;
    try {
      await notificationService.markAllAsRead('MESSAGE');
      refetch();
    } catch (error) {
      toast.error('Failed to mark messages as read.');
    }
  };

  const handleNotificationClick = async (notif: Notification) => {
    if (!notif.read) {
      try {
        await notificationService.markOneAsRead(notif.id);
        refetch(); 
      } catch (error) {
        console.error('Failed to mark notification as read');
      }
    }
    navigate(notif.link || '/inbox');
  };

  // Polished Dropdown Trigger
  const DropdownTrigger = (
  <button className="relative flex items-center justify-center h-10 w-10 rounded-full hover:bg-gray-100/80 transition-colors focus:outline-none">
    <Mail className="h-5 w-5 text-gray-600" />
    {unreadMessageCount > 0 && (
      <span className="absolute top-0 right-0 h-5 min-w-[1.25rem] px-1 text-xs flex items-center justify-center rounded-full bg-red-500 text-white font-bold border-2 border-white">
        {unreadMessageCount > 9 ? '9+' : unreadMessageCount}
      </span>
    )}
  </button>
);

  return (
    <BellDropdown
      trigger={DropdownTrigger}
      widthClass="w-[22rem] sm:w-[24rem]"
      maxHeight="max-h-[28rem]"
    >
      {/* Polished and Compact Header */}
      <div className="px-4 py-2.5 flex justify-between items-center border-b border-gray-100">
        <h3 className="font-semibold text-gray-900">Messages</h3>
        {unreadMessageCount > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            className="flex items-center text-xs font-medium text-primary-600 hover:text-primary-700 hover:underline"
          >
             <Check className="h-3 w-3 mr-1" />
            Mark all as read
          </button>
        )}
      </div>
      {notifications.length > 0 ? (
        notifications.map((notif) => (
          // Polished Item with reduced padding
          <BellDropdownItem
            key={notif.id}
            onSelect={() => handleNotificationClick(notif)}
            className="!px-3 !py-2.5"
          >
            <div className="flex items-start gap-3 w-full">
               {/* Polished Unread Indicator */}
              {!notif.read && (
                 <div className="h-2 w-2 rounded-full bg-primary-500 mt-1.5 flex-shrink-0" aria-label="Unread" />
              )}
              {notif.read && <div className="w-2 flex-shrink-0" />}

              <div className="flex-grow overflow-hidden">
                <p className={`text-sm truncate ${!notif.read ? 'font-semibold text-gray-800' : 'font-medium text-gray-700'}`}>
                  {notif.message.replace('You have a new message from ', '')}
                </p>
                <p className={`text-sm truncate mt-0.5 ${!notif.read ? 'text-gray-600' : 'text-gray-500'}`}>
                  {notif.meta?.lastMessage || 'Click to view message...'}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {formatDistanceToNow(new Date(notif.createdAt))} ago
                </p>
              </div>
            </div>
          </BellDropdownItem>
        ))
      ) : (
        // Polished Empty State
        <div className="px-4 py-8 text-center text-sm text-gray-500">
          You have no new messages.
        </div>
      )}
    </BellDropdown>
  );
};