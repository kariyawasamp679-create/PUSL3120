import Message from '../models/Message.js';
import Appointment from '../models/Appointment.js';
import { getIO } from '../socket.js';

/**
 * @desc    Get all chat messages for an appointment consultation
 * @route   GET /api/messages/appointment/:appointmentId
 * @access  Private
 */
export async function getMessagesByAppointment(req, res, next) {
  try {
    const { appointmentId } = req.params;

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    const messages = await Message.find({ appointment: appointmentId })
      .populate('sender', 'name role avatar')
      .sort({ createdAt: 1 });

    res.json({
      success: true,
      count: messages.length,
      messages
    });
  } catch (error) {
    next(error);
  }
}

/**
 * @desc    Send a message in an appointment consultation
 * @route   POST /api/messages
 * @access  Private
 */
export async function sendMessage(req, res, next) {
  try {
    const { appointmentId, receiverId, content } = req.body;
    const senderId = req.user._id || req.user.id;

    if (!appointmentId || !receiverId || !content) {
      return res.status(400).json({
        success: false,
        message: 'Please provide appointmentId, receiverId, and message content'
      });
    }

    const message = await Message.create({
      appointment: appointmentId,
      sender: senderId,
      receiver: receiverId,
      content: content.trim()
    });

    const populatedMessage = await Message.findById(message._id)
      .populate('sender', 'name role avatar')
      .populate('receiver', 'name role avatar');

    // Broadcast via socket.io to room
    const io = getIO();
    if (io) {
      io.to(`consultation:${appointmentId}`).emit('new:message', {
        _id: populatedMessage._id,
        appointmentId,
        sender: populatedMessage.sender,
        receiver: populatedMessage.receiver,
        content: populatedMessage.content,
        createdAt: populatedMessage.createdAt
      });
    }

    res.status(201).json({
      success: true,
      message: populatedMessage
    });
  } catch (error) {
    next(error);
  }
}
