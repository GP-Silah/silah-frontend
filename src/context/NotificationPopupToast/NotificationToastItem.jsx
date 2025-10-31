import {
  FaTimes,
  FaEnvelope,
  FaFileInvoice,
  FaTag,
  FaTruck,
  FaUsers,
  FaStar,
} from 'react-icons/fa';

const TYPE_ICONS = {
  CHAT: FaEnvelope,
  INVOICE: FaFileInvoice,
  OFFER: FaTag,
  ORDER: FaTruck,
  GROUP_PURCHASE: FaUsers,
  REVIEW: FaStar,
  BID: FaTag,
};

const DefaultIcon = FaEnvelope;

const ToastItem = ({ notification, onClose, isBuyer }) => {
  const IconComponent =
    TYPE_ICONS[notification.relatedEntityType] || DefaultIcon;

  return (
    <div
      className={`toast-item ${isBuyer ? 'buyer' : 'supplier'} ${
        !notification.isRead ? 'unread' : ''
      }`}
    >
      <div className="toast-icon-circle">
        <IconComponent />
      </div>
      <div className="toast-content">
        <div className="toast-title">{notification.title}</div>
        <div className="toast-message">{notification.content}</div>
      </div>
      <button className="toast-close" onClick={onClose}>
        <FaTimes />
      </button>
    </div>
  );
};

export default ToastItem;
