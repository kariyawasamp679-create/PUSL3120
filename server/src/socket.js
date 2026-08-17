import crypto from 'crypto';
import { EventEmitter } from 'events';
import { verifyToken } from './utils/security.js';

let ioInstance = null;
const socketEmitter = new EventEmitter();

// Connected clients tracking
const connectedClients = new Set();
const rooms = new Map(); // roomName -> Set of sockets

/**
 * Universal WebSocket Server with native RFC 6455 framing & dynamic Socket.io compatibility
 */
export function initSocket(server) {
  // Try dynamic Socket.io first if package is installed in node_modules
  import('socket.io')
    .then(({ Server }) => {
      try {
        const io = new Server(server, {
          cors: { origin: '*', methods: ['GET', 'POST', 'PUT', 'DELETE'] }
        });

        io.use((socket, next) => {
          const token = socket.handshake.auth?.token || socket.handshake.query?.token;
          if (token) {
            const decoded = verifyToken(token);
            if (decoded) socket.user = decoded;
          }
          next();
        });

        io.on('connection', (socket) => {
          const userId = socket.user?.id;
          console.log(`[WebSocket] Socket.IO Client connected: ${socket.id} (User: ${userId || 'guest'})`);

          if (userId) socket.join(`user:${userId}`);
          socket.join('live:slots');

          socket.on('join:consultation', (appointmentId) => {
            if (appointmentId) socket.join(`consultation:${appointmentId}`);
          });

          socket.on('leave:consultation', (appointmentId) => {
            if (appointmentId) socket.leave(`consultation:${appointmentId}`);
          });

          socket.on('send:message', (payload) => {
            if (payload?.appointmentId) {
              io.to(`consultation:${payload.appointmentId}`).emit('new:message', {
                ...payload,
                timestamp: payload.timestamp || new Date().toISOString()
              });
            }
          });

          socket.on('typing:start', ({ appointmentId, senderName }) => {
            socket.to(`consultation:${appointmentId}`).emit('user:typing', { senderName, isTyping: true });
          });

          socket.on('typing:stop', ({ appointmentId }) => {
            socket.to(`consultation:${appointmentId}`).emit('user:typing', { isTyping: false });
          });
        });

        ioInstance = io;
        console.log('[WebSocket] Socket.IO engine initialized successfully');
      } catch (err) {
        setupNativeWebSockets(server);
      }
    })
    .catch(() => {
      // socket.io package not yet installed in local node_modules - use built-in native RFC 6455 WebSocket engine!
      setupNativeWebSockets(server);
    });

  return getIO();
}

/**
 * Built-in Native RFC 6455 WebSocket Engine (Zero External Dependencies)
 */
function setupNativeWebSockets(server) {
  console.log('[WebSocket] Initializing native Node.js RFC 6455 WebSocket Engine (Zero-dependency mode)...');

  server.on('upgrade', (req, socket, head) => {
    const upgradeHeader = req.headers['upgrade'];
    if (!upgradeHeader || upgradeHeader.toLowerCase() !== 'websocket') {
      socket.destroy();
      return;
    }

    const secKey = req.headers['sec-websocket-key'];
    if (!secKey) {
      socket.destroy();
      return;
    }

    // Parse token from query if provided
    const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    const token = url.searchParams.get('token');
    let user = null;
    if (token) {
      user = verifyToken(token);
    }

    // SHA-1 handshake response
    const GUID = '258EAFA5-E914-47DA-95CA-C5AB0DC85B11';
    const acceptKey = crypto
      .createHash('sha1')
      .update(secKey + GUID)
      .digest('base64');

    const responseHeaders = [
      'HTTP/1.1 101 Switching Protocols',
      'Upgrade: websocket',
      'Connection: Upgrade',
      `Sec-WebSocket-Accept: ${acceptKey}`,
      '\r\n'
    ];

    socket.write(responseHeaders.join('\r\n'));

    // Wrap socket in client object
    const client = {
      id: `ws-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      socket,
      user,
      rooms: new Set(['live:slots'])
    };

    if (user?.id) {
      client.rooms.add(`user:${user.id}`);
    }

    connectedClients.add(client);
    addToRoom('live:slots', client);
    if (user?.id) {
      addToRoom(`user:${user.id}`, client);
    }

    console.log(`[WebSocket Native] Client connected: ${client.id} (User: ${user?.name || 'guest'})`);

    // Handle incoming frames
    let buffer = Buffer.alloc(0);
    socket.on('data', (chunk) => {
      buffer = Buffer.concat([buffer, chunk]);

      while (buffer.length >= 2) {
        const firstByte = buffer[0];
        const secondByte = buffer[1];
        const opcode = firstByte & 0x0f;
        const isMasked = (secondByte & 0x80) === 0x80;
        let payloadLength = secondByte & 0x7f;

        let offset = 2;
        if (payloadLength === 126) {
          if (buffer.length < 4) break;
          payloadLength = buffer.readUInt16BE(2);
          offset = 4;
        } else if (payloadLength === 127) {
          if (buffer.length < 10) break;
          payloadLength = Number(buffer.readBigUInt64BE(2));
          offset = 10;
        }

        let mask = null;
        if (isMasked) {
          if (buffer.length < offset + 4) break;
          mask = buffer.slice(offset, offset + 4);
          offset += 4;
        }

        if (buffer.length < offset + payloadLength) break;

        const payload = buffer.slice(offset, offset + payloadLength);
        buffer = buffer.slice(offset + payloadLength);

        // Unmask
        if (isMasked && mask) {
          for (let i = 0; i < payload.length; i++) {
            payload[i] ^= mask[i % 4];
          }
        }

        // Process opcode
        if (opcode === 0x8) {
          // Close frame
          socket.end();
          break;
        } else if (opcode === 0x9) {
          // Ping -> send Pong
          sendFrame(socket, 0xa, payload);
        } else if (opcode === 0x1) {
          // Text frame
          try {
            const text = payload.toString('utf-8');
            const data = JSON.parse(text);
            handleNativeClientMessage(client, data);
          } catch (e) {
            // Ignore non-JSON frames
          }
        }
      }
    });

    socket.on('close', () => {
      connectedClients.delete(client);
      for (const roomName of client.rooms) {
        removeFromRoom(roomName, client);
      }
      console.log(`[WebSocket Native] Client disconnected: ${client.id}`);
    });

    socket.on('error', () => {
      connectedClients.delete(client);
    });
  });

  ioInstance = {
    emit: (event, data) => {
      broadcastNativeEvent(event, data);
    },
    to: (roomName) => ({
      emit: (event, data) => {
        emitToNativeRoom(roomName, event, data);
      }
    })
  };
}

function sendFrame(socket, opcode, payload) {
  try {
    const payloadBuf = Buffer.isBuffer(payload) ? payload : Buffer.from(payload);
    const length = payloadBuf.length;

    let header;
    if (length <= 125) {
      header = Buffer.alloc(2);
      header[0] = 0x80 | opcode;
      header[1] = length;
    } else if (length <= 65535) {
      header = Buffer.alloc(4);
      header[0] = 0x80 | opcode;
      header[1] = 126;
      header.writeUInt16BE(length, 2);
    } else {
      header = Buffer.alloc(10);
      header[0] = 0x80 | opcode;
      header[1] = 127;
      header.writeBigUInt64BE(BigInt(length), 2);
    }

    socket.write(Buffer.concat([header, payloadBuf]));
  } catch (err) {
    // Socket might be closed
  }
}

function addToRoom(roomName, client) {
  if (!rooms.has(roomName)) {
    rooms.set(roomName, new Set());
  }
  rooms.get(roomName).add(client);
  client.rooms.add(roomName);
}

function removeFromRoom(roomName, client) {
  if (rooms.has(roomName)) {
    rooms.get(roomName).delete(client);
    if (rooms.get(roomName).size === 0) {
      rooms.delete(roomName);
    }
  }
  client.rooms.delete(roomName);
}

function handleNativeClientMessage(client, msg) {
  const { event, data } = msg;

  if (event === 'join:consultation' && data?.appointmentId) {
    addToRoom(`consultation:${data.appointmentId}`, client);
  } else if (event === 'leave:consultation' && data?.appointmentId) {
    removeFromRoom(`consultation:${data.appointmentId}`, client);
  } else if (event === 'send:message' && data?.appointmentId) {
    emitToNativeRoom(`consultation:${data.appointmentId}`, 'new:message', {
      ...data,
      timestamp: data.timestamp || new Date().toISOString()
    });
  } else if (event === 'typing:start' && data?.appointmentId) {
    emitToNativeRoom(`consultation:${data.appointmentId}`, 'user:typing', {
      senderName: data.senderName,
      isTyping: true
    }, client);
  } else if (event === 'typing:stop' && data?.appointmentId) {
    emitToNativeRoom(`consultation:${data.appointmentId}`, 'user:typing', {
      isTyping: false
    }, client);
  }
}

function broadcastNativeEvent(event, data) {
  const message = JSON.stringify({ event, data });
  for (const client of connectedClients) {
    sendFrame(client.socket, 0x1, message);
  }
}

function emitToNativeRoom(roomName, event, data, excludeClient = null) {
  const roomSet = rooms.get(roomName);
  if (!roomSet) return;

  const message = JSON.stringify({ event, data });
  for (const client of roomSet) {
    if (client !== excludeClient) {
      sendFrame(client.socket, 0x1, message);
    }
  }
}

/**
 * Returns the current Socket instance
 */
export function getIO() {
  return (
    ioInstance || {
      emit: (event, data) => broadcastNativeEvent(event, data),
      to: (roomName) => ({
        emit: (event, data) => emitToNativeRoom(roomName, event, data)
      })
    }
  );
}

/**
 * Helper to emit real-time event to a user or room
 */
export function emitNotification(room, event, data) {
  const io = getIO();
  if (io && typeof io.to === 'function') {
    io.to(room).emit(event, data);
  }
}

/**
 * Helper to broadcast appointment creation/update across all clients
 */
export function broadcastAppointmentEvent(event, data) {
  const io = getIO();
  if (io && typeof io.emit === 'function') {
    io.emit(event, data);
  }
}
