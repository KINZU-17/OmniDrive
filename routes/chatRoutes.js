const express = require('express');

module.exports = (db) => {
    const router = express.Router();

    // Middleware to extract user from headers
    function getUserFromHeaders(req) {
        return {
            role: (req.headers['x-user-role'] || '').toLowerCase(),
            email: req.headers['x-user-email'] || '',
            userId: req.headers['x-user-id'] || req.headers['x-user-email'] || 'anonymous'
        };
    }

    function authRequired(req, res, next) {
        const user = getUserFromHeaders(req);
        if (!user.role || !user.email) {
            return res.status(401).json({ success: false, error: 'Missing authentication headers' });
        }
        req.user = user;
        next();
    }

    /**
     * POST /api/chat/auth
     * Authenticate user for chat access
     */
    router.post('/auth', (req, res) => {
        try {
            const user = getUserFromHeaders(req);
            if (!user.role || !user.email) {
                return res.status(401).json({ success: false, error: 'Missing user credentials' });
            }

            // Try to insert or ignore if exists
            const stmt = db.prepare(`
                INSERT OR IGNORE INTO chat_users (email, name, role, avatar)
                VALUES (?, ?, ?, '')
            `);
            const result = stmt.run(user.email, user.email, user.role);

            return res.json({
                success: true,
                data: {
                    userId: user.email,
                    role: user.role,
                    email: user.email,
                    authenticated: true,
                    inserted: result.changes > 0
                }
            });
        } catch (err) {
            console.error('[chatAuth error]', err.message, err.stack);
            return res.status(500).json({ 
                success: false, 
                error: 'Auth failed: ' + err.message 
            });
        }
    });

    /**
     * GET /api/chat/rooms
     * Get list of available chat rooms for user
     */
    router.get('/rooms', authRequired, (req, res) => {
        try {
            const rooms = db.prepare(`
                SELECT cr.id, cr.name, cr.description, COUNT(DISTINCT crm.user_id) as memberCount
                FROM chat_rooms cr
                LEFT JOIN chat_room_members crm ON cr.id = crm.room_id
                WHERE cr.isPublic = 1 OR EXISTS (
                    SELECT 1 FROM chat_room_members
                    WHERE room_id = cr.id AND user_id = ?
                )
                GROUP BY cr.id
                ORDER BY cr.createdAt DESC
            `).all(req.user.email);

            return res.json({ success: true, data: { rooms } });
        } catch (err) {
            return res.status(500).json({ success: false, error: err.message });
        }
    });

    /**
     * POST /api/chat/rooms
     * Create a new chat room
     */
    router.post('/rooms', authRequired, (req, res) => {
        const { name, description, isPublic = true } = req.body;
        if (!name) {
            return res.status(400).json({ success: false, error: 'Room name required' });
        }

        try {
            const result = db.prepare(`
                INSERT INTO chat_rooms (name, description, isPublic, createdBy)
                VALUES (?, ?, ?, ?)
            `).run(name, description || '', isPublic ? 1 : 0, req.user.email);

            // Add creator as member
            db.prepare(`
                INSERT INTO chat_room_members (room_id, user_id, joinedAt)
                VALUES (?, ?, datetime('now'))
            `).run(result.lastInsertRowid, req.user.email);

            return res.json({
                success: true,
                data: { roomId: result.lastInsertRowid, name, description }
            });
        } catch (err) {
            return res.status(500).json({ success: false, error: err.message });
        }
    });

    /**
     * POST /api/chat/rooms/:roomId/join
     * Join a chat room
     */
    router.post('/rooms/:roomId/join', authRequired, (req, res) => {
        const { roomId } = req.params;
        try {
            // Check if room exists
            const room = db.prepare('SELECT * FROM chat_rooms WHERE id = ?').get(roomId);
            if (!room) {
                return res.status(404).json({ success: false, error: 'Room not found' });
            }

            // Add user to room
            db.prepare(`
                INSERT OR IGNORE INTO chat_room_members (room_id, user_id, joinedAt)
                VALUES (?, ?, datetime('now'))
            `).run(roomId, req.user.email);

            return res.json({ success: true, data: { roomId, message: 'Joined room' } });
        } catch (err) {
            return res.status(500).json({ success: false, error: err.message });
        }
    });

    /**
     * GET /api/chat/messages
     * Get messages from a room
     */
    router.get('/messages', authRequired, (req, res) => {
        const { roomId, limit = 50, offset = 0 } = req.query;
        if (!roomId) {
            return res.status(400).json({ success: false, error: 'Room ID required' });
        }

        try {
            // Verify user is member of room
            const member = db.prepare(
                'SELECT * FROM chat_room_members WHERE room_id = ? AND user_id = ?'
            ).get(roomId, req.user.email);

            if (!member) {
                return res.status(403).json({ success: false, error: 'Not a member of this room' });
            }

            const messages = db.prepare(`
                SELECT cm.id, cm.content, cm.senderId, cm.createdAt,
                       cu.email, cu.role,
                       CASE WHEN cr.id IS NOT NULL THEN 1 ELSE 0 END as isRead
                FROM chat_messages cm
                JOIN chat_users cu ON cm.senderId = cu.email
                LEFT JOIN chat_reads cr ON cm.id = cr.message_id AND cr.user_id = ?
                WHERE cm.room_id = ?
                ORDER BY cm.createdAt DESC
                LIMIT ? OFFSET ?
            `).all(req.user.email, roomId, parseInt(limit), parseInt(offset));

            return res.json({ success: true, data: { messages: messages.reverse() } });
        } catch (err) {
            return res.status(500).json({ success: false, error: err.message });
        }
    });

    /**
     * POST /api/chat/messages
     * Send a message to a room
     */
    router.post('/messages', authRequired, (req, res) => {
        const { roomId, content } = req.body;
        if (!roomId || !content) {
            return res.status(400).json({ success: false, error: 'Room ID and content required' });
        }

        try {
            // Verify user is member of room
            const member = db.prepare(
                'SELECT * FROM chat_room_members WHERE room_id = ? AND user_id = ?'
            ).get(roomId, req.user.email);

            if (!member) {
                return res.status(403).json({ success: false, error: 'Not a member of this room' });
            }

            const result = db.prepare(`
                INSERT INTO chat_messages (room_id, senderId, content, createdAt)
                VALUES (?, ?, ?, datetime('now'))
            `).run(roomId, req.user.email, content);

            return res.json({
                success: true,
                data: { messageId: result.lastInsertRowid, content }
            });
        } catch (err) {
            return res.status(500).json({ success: false, error: err.message });
        }
    });

    /**
     * GET /api/chat/users
     * Get list of online users
     */
    router.get('/users', authRequired, (req, res) => {
        try {
            const users = db.prepare(`
                SELECT email, role, status, lastSeen
                FROM chat_users
                ORDER BY lastSeen DESC
                LIMIT 100
            `).all();

            return res.json({ success: true, data: { users } });
        } catch (err) {
            return res.status(500).json({ success: false, error: err.message });
        }
    });

    /**
     * POST /api/chat/presence
     * Update user presence status
     */
    router.post('/presence', authRequired, (req, res) => {
        const { status = 'online' } = req.body;
        try {
            db.prepare(`
                UPDATE chat_users SET status = ?, lastSeen = datetime('now')
                WHERE email = ?
            `).run(status, req.user.email);

            return res.json({ success: true, data: { status } });
        } catch (err) {
            return res.status(500).json({ success: false, error: err.message });
        }
    });

    return router;
};
