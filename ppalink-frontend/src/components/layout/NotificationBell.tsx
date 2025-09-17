import { formatDistanceToNow } from 'date-fns';
import { Bell } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../../context/SocketContext';
import notificationService from '../../services/notification.service';
import type { Notification } from '../../types/notification';
import { BellDropdown, BellDropdownItem } from '../ui/BellDropdown';
import { InteractiveToast } from '../ui/InteractiveToast';

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

  // Initial fetch and real-time listener setup
  useEffect(() => {
    refetch(); // Fetch on component mount

    if (!socket) return;

    const handleNewNotification = (newNotification: Notification) => {
      refetch(); // Refetch the list to include the new notification
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
  }, [socket]);

  const handleMarkAllAsRead = async () => {
    if (unreadCount === 0) return;
    try {
      await notificationService.markAllAsRead('GENERIC');
      refetch(); // Refetch to show the updated "read" state
    } catch (error) {
      toast.error('Failed to mark notifications as read.');
    }
  };

  const handleNotificationClick = async (notif: Notification) => {
    if (!notif.read) {
      try {
        await notificationService.markOneAsRead(notif.id);
        setNotifications((prev) =>
          prev.map((n) => (n.id === notif.id ? { ...n, read: true } : n))
        );
      } catch (error) {
        console.error('Failed to mark notification as read');
      }
    }
    navigate(notif.link || '#');
  };

  const DropdownTrigger = (
    <button className="relative p-2 rounded-full hover:bg-gray-100">
      <Bell className="h-5 w-5 text-gray-600" />
      {unreadCount > 0 && (
        <span className="absolute top-1.5 right-1.5 h-2.5 w-2.5 rounded-full bg-red-500 border-2 border-white" />
      )}
    </button>
  );

  return (
    <BellDropdown
      trigger={DropdownTrigger}
      widthClass="w-[16rem] md:w-[20rem]"
      maxHeight="max-h-[16rem]"
    >
      <div className="p-3 flex justify-between items-center border-b">
        <h3 className="font-semibold text-gray-800">Notifications</h3>
        {unreadCount > 0 && (
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
              className={`block w-full p-1 ${
                !notif.read ? 'bg-primary-50 rounded-md' : ''
              }`}
            >
              <p className="text-sm text-gray-700">{notif.message}</p>
              <p className="text-xs text-gray-400 mt-1">
                {formatDistanceToNow(new Date(notif.createdAt))} ago
              </p>
            </div>
          </BellDropdownItem>
        ))
      ) : (
        <div className="p-4 text-center text-sm text-gray-500">
          You have no notifications.
        </div>
      )}
    </BellDropdown>
  );
};