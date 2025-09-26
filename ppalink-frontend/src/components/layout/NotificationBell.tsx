import { formatDistanceToNow } from 'date-fns';
import { Bell, Check } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../../context/SocketContext';
import notificationService from '../../services/notification.service';
import type { Notification } from '../../types/notification';
import { BellDropdown, BellDropdownItem } from '../ui/BellDropdown';
import { InteractiveToast } from '../ui/InteractiveToast';
import { Button } from '../ui/Button';

export const NotificationBell = () => {
  const navigate = useNavigate();
  const { socket } = useSocket();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const refetch = async () => {
    try {
      const fetched = await notificationService.getMyNotifications();
      setNotifications(fetched);
    } catch (error) {
      console.error('Failed to fetch notifications');
    }
  };

  useEffect(() => {
    refetch();

    if (!socket) return;

    const handleNewNotification = (newNotification: Notification) => {
      refetch();
      toast.custom((t) => (
        <InteractiveToast
          t={t}
          Icon={Bell}
          iconColorClass="text-primary-500"
          title="New Notification"
          message={newNotification.message}
          link={newNotification.link || '#'}
          navigate={navigate}
        />
      ));
    };

    socket.on('new_notification', handleNewNotification);

    return () => {
      socket.off('new_notification', handleNewNotification);
    };
  }, [socket, navigate]);

  const handleMarkAllAsRead = async () => {
    if (unreadCount === 0) return;
    try {
      await notificationService.markAllAsRead('GENERIC');
      refetch();
    } catch (error) {
      toast.error('Failed to mark notifications as read.');
    }
  };

  const handleNotificationClick = async (notif: Notification) => {
    if (!notif.read) {
      try {
        await notificationService.markOneAsRead(notif.id);
        // Optimistically update the UI
        setNotifications((prev) =>
          prev.map((n) => (n.id === notif.id ? { ...n, read: true } : n))
        );
      } catch (error) {
        console.error('Failed to mark notification as read');
      }
    }
    navigate(notif.link || '#');
  };

  // Polished Dropdown Trigger
  const DropdownTrigger = (
    <Button
          size="icon"
          className="bg-transparent hover:bg-transparent focus:ring-0 border-none shadow-none"
          variant="ghost"
        >
      <Bell className="h-5 w-5 text-gray-600" />
      {unreadCount > 0 && (
        <span className="absolute top-1 right-1 block h-2.5 w-2.5 rounded-full bg-red-500 border-2 border-white" />
      )}
    </Button>
  );

  return (
    <BellDropdown
      trigger={DropdownTrigger}
      widthClass="w-[16rem] sm:w-[24rem]"
      maxHeight="max-h-[16rem] sm:max-h-[28rem]"
    >
      {/* Polished and Compact Header */}
      <div className="px-4 py-2.5 flex justify-between items-center border-b border-gray-100">
        <h3 className="font-semibold text-gray-900">Notifications</h3>
        {unreadCount > 0 && (
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
          // Polished Item with reduced padding via className override
          <BellDropdownItem
            key={notif.id}
            onSelect={() => handleNotificationClick(notif)}
            className="!px-3 !py-2.5" // Reduced padding
          >
            <div className="flex items-start gap-3 w-full">
              {/* Polished Unread Indicator */}
              {!notif.read && (
                 <div className="h-2 w-2 rounded-full bg-primary-500 mt-1.5 flex-shrink-0" aria-label="Unread" />
              )}
              {/* Read items have a placeholder for alignment */}
              {notif.read && <div className="w-2 flex-shrink-0" />}

              <div className="flex-grow">
                <p className={`text-sm ${!notif.read ? 'font-semibold text-gray-800' : 'text-gray-600'}`}>{notif.message}</p>
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
          You're all caught up!
        </div>
      )}
    </BellDropdown>
  );
};