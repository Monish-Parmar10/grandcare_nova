import ChatMessage from '../models/ChatMessage.js';

// @desc    Get messages for a specific help request
// @route   GET /api/chat/:requestId
// @access  Private
export const getChatMessages = async (req, res, next) => {
  try {
    const messages = await ChatMessage.find({ request: req.params.requestId })
      .sort({ createdAt: 1 }) // oldest first
      .populate('sender', 'name role');

    const formattedMessages = messages.map(msg => ({
      id: msg._id,
      requestId: msg.request,
      senderId: msg.sender._id,
      senderName: msg.sender.name,
      senderRole: msg.senderRole,
      text: msg.text,
      createdAt: msg.createdAt,
    }));

    res.json(formattedMessages);
  } catch (error) {
    next(error);
  }
};
