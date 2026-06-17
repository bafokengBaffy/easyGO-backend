// src/pages/common/SupportTickets.jsx
import React, { useState, useEffect } from 'react';
import {
  Headphones, MessageCircle, Send, Paperclip, Clock,
  CheckCircle, AlertCircle, XCircle, ChevronRight, Plus
} from 'lucide-react';
import { userService } from '@/services/user.service';
import Button from '@/components/common/Button';
import Modal from '@/components/common/Modal';
import { formatDate } from '@/utils/formatters';
import toast from 'react-hot-toast';

const SupportTickets = () => {
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showNewTicketModal, setShowNewTicketModal] = useState(false);
  const [newTicket, setNewTicket] = useState({
    category: 'ride_issue',
    subject: '',
    message: '',
    urgency: 'medium',
    rideId: ''
  });
  const [newMessage, setNewMessage] = useState('');
  const [attachments, setAttachments] = useState([]);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const data = await userService.getSupportTickets();
      setTickets(data);
    } catch (error) {
      console.error('Failed to fetch tickets:', error);
      toast.error('Failed to load support tickets');
    } finally {
      setLoading(false);
    }
  };

  const fetchTicketDetails = async (ticketId) => {
    try {
      const data = await userService.getSupportTicket(ticketId);
      setSelectedTicket(data);
    } catch (error) {
      toast.error('Failed to load ticket details');
    }
  };

  const handleCreateTicket = async () => {
    if (!newTicket.subject || !newTicket.message) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      await userService.createSupportTicket(newTicket);
      toast.success('Support ticket created successfully');
      setShowNewTicketModal(false);
      setNewTicket({
        category: 'ride_issue',
        subject: '',
        message: '',
        urgency: 'medium',
        rideId: ''
      });
      fetchTickets();
    } catch (error) {
      toast.error('Failed to create ticket');
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() && attachments.length === 0) return;

    try {
      await userService.addTicketMessage(selectedTicket.id, newMessage, attachments);
      toast.success('Message sent');
      setNewMessage('');
      setAttachments([]);
      fetchTicketDetails(selectedTicket.id);
    } catch (error) {
      toast.error('Failed to send message');
    }
  };

  const handleCloseTicket = async () => {
    try {
      await userService.closeTicket(selectedTicket.id);
      toast.success('Ticket closed');
      setSelectedTicket(null);
      fetchTickets();
    } catch (error) {
      toast.error('Failed to close ticket');
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      open: { icon: AlertCircle, color: 'text-yellow-600 bg-yellow-100' },
      in_progress: { icon: Clock, color: 'text-blue-600 bg-blue-100' },
      resolved: { icon: CheckCircle, color: 'text-green-600 bg-green-100' },
      closed: { icon: XCircle, color: 'text-gray-600 bg-gray-100' }
    };
    const badge = badges[status] || badges.open;
    const Icon = badge.icon;
    return (
      <span className={`px-2 py-1 rounded-full text-xs flex items-center ${badge.color}`}>
        <Icon className="w-3 h-3 mr-1" />
        {status.replace('_', ' ')}
      </span>
    );
  };

  const getUrgencyBadge = (urgency) => {
    const colors = {
      low: 'bg-gray-100 text-gray-600',
      medium: 'bg-yellow-100 text-yellow-600',
      high: 'bg-red-100 text-red-600'
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs ${colors[urgency]}`}>
        {urgency}
      </span>
    );
  };

  const getCategoryIcon = (category) => {
    const icons = {
      ride_issue: '🚗',
      payment: '💰',
      driver: '👤',
      technical: '🔧',
      other: '📝'
    };
    return icons[category] || '📝';
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container-custom py-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Support Center</h1>
            <p className="text-gray-600 mt-2">Get help with your rides, payments, or account issues</p>
          </div>
          <Button onClick={() => setShowNewTicketModal(true)} icon={Plus}>
            New Ticket
          </Button>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Tickets List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow">
              <div className="p-4 border-b">
                <h2 className="font-semibold">My Tickets</h2>
                <p className="text-sm text-gray-500 mt-1">{tickets.length} tickets total</p>
              </div>
              <div className="divide-y max-h-96 overflow-y-auto">
                {loading ? (
                  <div className="p-8 text-center">Loading...</div>
                ) : tickets.length > 0 ? (
                  tickets.map(ticket => (
                    <button
                      key={ticket.id}
                      onClick={() => fetchTicketDetails(ticket.id)}
                      className={`w-full text-left p-4 hover:bg-gray-50 transition-colors ${
                        selectedTicket?.id === ticket.id ? 'bg-blue-50' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center">
                          <span className="text-xl mr-2">{getCategoryIcon(ticket.category)}</span>
                          <span className="font-medium">{ticket.subject}</span>
                        </div>
                        {getStatusBadge(ticket.status)}
                      </div>
                      <p className="text-sm text-gray-500 mb-2 line-clamp-2">{ticket.lastMessage}</p>
                      <div className="flex justify-between items-center text-xs text-gray-400">
                        <span>{formatDate(ticket.updatedAt)}</span>
                        {getUrgencyBadge(ticket.urgency)}
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="p-8 text-center">
                    <Headphones className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No support tickets</p>
                    <Button size="sm" onClick={() => setShowNewTicketModal(true)} className="mt-3">
                      Create Ticket
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Ticket Details */}
          <div className="lg:col-span-2">
            {selectedTicket ? (
              <div className="bg-white rounded-lg shadow">
                {/* Ticket Header */}
                <div className="p-6 border-b">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h2 className="text-xl font-bold">{selectedTicket.subject}</h2>
                      <div className="flex gap-2 mt-2">
                        {getStatusBadge(selectedTicket.status)}
                        {getUrgencyBadge(selectedTicket.urgency)}
                        <span className="text-sm text-gray-500">
                          Ticket #{selectedTicket.id}
                        </span>
                      </div>
                    </div>
                    {selectedTicket.status !== 'closed' && selectedTicket.status !== 'resolved' && (
                      <Button variant="danger" size="sm" onClick={handleCloseTicket}>
                        Close Ticket
                      </Button>
                    )}
                  </div>
                  <div className="text-sm text-gray-500">
                    Created {formatDate(selectedTicket.createdAt)}
                  </div>
                </div>

                {/* Messages */}
                <div className="p-6 max-h-96 overflow-y-auto space-y-4">
                  {selectedTicket.messages?.map((message, index) => (
                    <div
                      key={index}
                      className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[70%] rounded-lg p-3 ${
                          message.isUser
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        <div className="text-sm mb-1">
                          {message.isUser ? 'You' : 'Support Agent'}
                        </div>
                        <p className="text-sm">{message.content}</p>
                        {message.attachments?.length > 0 && (
                          <div className="mt-2">
                            {message.attachments.map((file, i) => (
                              <a
                                key={i}
                                href={file.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs underline block"
                              >
                                📎 {file.name}
                              </a>
                            ))}
                          </div>
                        )}
                        <div className="text-xs mt-1 opacity-75">
                          {formatDate(message.createdAt, 'HH:mm')}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Reply Box */}
                {selectedTicket.status !== 'closed' && selectedTicket.status !== 'resolved' && (
                  <div className="p-6 border-t">
                    <div className="flex items-end gap-3">
                      <div className="flex-1">
                        <textarea
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          placeholder="Type your message here..."
                          rows="3"
                          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <div className="mt-2 flex items-center gap-2">
                          <label className="cursor-pointer">
                            <Paperclip className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                            <input
                              type="file"
                              multiple
                              className="hidden"
                              onChange={(e) => setAttachments([...attachments, ...e.target.files])}
                            />
                          </label>
                          {attachments.length > 0 && (
                            <span className="text-sm text-gray-500">
                              {attachments.length} file(s) selected
                            </span>
                          )}
                        </div>
                      </div>
                      <Button onClick={handleSendMessage} icon={Send}>
                        Send
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow p-12 text-center">
                <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-600 mb-2">Select a ticket</h3>
                <p className="text-gray-500">Choose a ticket from the list to view details</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* New Ticket Modal */}
      <Modal
        isOpen={showNewTicketModal}
        onClose={() => setShowNewTicketModal(false)}
        title="Create Support Ticket"
        size="lg"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              value={newTicket.category}
              onChange={(e) => setNewTicket({ ...newTicket, category: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ride_issue">Ride Issue</option>
              <option value="payment">Payment Problem</option>
              <option value="driver">Driver Issue</option>
              <option value="technical">Technical Issue</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Subject
            </label>
            <input
              type="text"
              value={newTicket.subject}
              onChange={(e) => setNewTicket({ ...newTicket, subject: e.target.value })}
              placeholder="Brief description of your issue"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Urgency Level
            </label>
            <select
              value={newTicket.urgency}
              onChange={(e) => setNewTicket({ ...newTicket, urgency: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="low">Low - General inquiry</option>
              <option value="medium">Medium - Need assistance</option>
              <option value="high">High - Urgent issue</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Message
            </label>
            <textarea
              value={newTicket.message}
              onChange={(e) => setNewTicket({ ...newTicket, message: e.target.value })}
              placeholder="Describe your issue in detail..."
              rows="6"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Related Ride ID (Optional)
            </label>
            <input
              type="text"
              value={newTicket.rideId}
              onChange={(e) => setNewTicket({ ...newTicket, rideId: e.target.value })}
              placeholder="Enter ride ID if applicable"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={() => setShowNewTicketModal(false)} fullWidth>
              Cancel
            </Button>
            <Button onClick={handleCreateTicket} fullWidth>
              Create Ticket
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default SupportTickets;