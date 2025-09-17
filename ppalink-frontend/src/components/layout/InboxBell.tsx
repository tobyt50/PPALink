import { formatDistanceToNow } from 'date-fns';
import { Mail } from 'lucide-react';
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

  const DropdownTrigger = (
    <button className="relative p-2 rounded-full hover:bg-gray-100">
      <Mail className="h-5 w-5 text-gray-600" />
      {unreadMessageCount > 0 && (
        <span className="absolute top-1.5 right-1.5 h-4 w-4 text-xs flex items-center justify-center rounded-full bg-red-500 text-white">
          {unreadMessageCount > 9 ? '9+' : unreadMessageCount}
        </span>
      )}
    </button>
  );

  return (
    // The onOpenChange prop is removed from the BellDropdown
    <BellDropdown
      trigger={DropdownTrigger}
      widthClass="w-[16rem] md:w-[20rem]"
      maxHeight="max-h-[16rem]"
    >
      <div className="p-3 border-b flex justify-between items-center">
        <h3 className="font-semibold text-gray-800">Messages</h3>
        {unreadMessageCount > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            className="text-xs text-primary-600 hover:underline"
          >
            Mark all as read
          </button>
        )}
      </div>
      {notifications.length > 0 ? (
        notifications.map((notif) => (
          <BellDropdownItem
            key={notif.id}
            onSelect={() => handleNotificationClick(notif)}
          >
            <div
              className={`block w-full p-2 ${
                !notif.read ? 'bg-primary-50 rounded-md' : ''
              }`}
            >
              <p className={`text-sm truncate ${
                !notif.read ? 'font-bold text-gray-900' : 'font-semibold text-gray-800'
              }`}>
                {notif.message.replace('You have a new message from ', '')}
              </p>
              <p className={`text-sm truncate ${
                !notif.read ? 'font-semibold text-gray-700' : 'text-gray-600'
              }`}>
                {notif.meta?.lastMessage || 'Click to view message...'}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {formatDistanceToNow(new Date(notif.createdAt))} ago
              </p>
            </div>
          </BellDropdownItem>
        ))
      ) : (
        <div className="p-4 text-center text-sm text-gray-500">
          You have no new messages.
        </div>
      )}
    </BellDropdown>
  );
};