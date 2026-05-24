const express = require('express');

module.exports = (db) => {
    const router = express.Router();

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
     * Register/authenticate user for chat access (reads from auth headers)
     */
    router.post('/auth', (req, res) => {
        try {
            const user = getUserFromHeaders(req);
            if (!user.role || !user.email) {
                return res.status(401).json({ success: false, error: 'Missing user credentials' });
            }

            db.prepare(`
                INSERT OR IGNORE INTO chat_users (email, name, role, avatar)
                VALUES (?, ?, ?, '')
            `).run(user.email, user.email, user.role);

            return res.json({
                success: true,
                data: {
                    userId: user.email,
                    role: user.role,
                    email: user.email,
                    authenticated: true,
                }
            });
        } catch (err) {
            return res.status(500).json({ success: false, error: 'Auth failed: ' + err.message });
        }
    });

    /**
     * GET /api/chat/rooms
     */
    router.get('/rooms', authRequired, (req, res) => {
        try {
            const rooms = db.prepare(`
                SELECT cr.id, cr.name, cr.description, cr.isPublic,
                       COUNT(DISTINCT crm.user_id) as memberCount
                FROM chat_rooms cr
                LEFT JOIN chat_room_members crm ON cr.id = crm.room_id
                WHERE cr.isPublic = 1 OR EXISTS (
                    SELECT 1 FROM chat_room_members
                    WHERE room_id = cr.id AND user_id = ?
                )
                GROUP BY cr.id
                ORDER BY cr.created_at DESC
            `).all(req.user.email);

            return res.json({ success: true, data: { rooms } });
        } catch (err) {
            return res.status(500).json({ success: false, error: err.message });
        }
    });

    /**
     * POST /api/chat/rooms
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

            db.prepare(`
                INSERT OR IGNORE INTO chat_room_members (room_id, user_id)
                VALUES (?, ?)
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
     */
    router.post('/rooms/:roomId/join', authRequired, (req, res) => {
        const { roomId } = req.params;
        try {
            const room = db.prepare('SELECT * FROM chat_rooms WHERE id = ?').get(roomId);
            if (!room) {
                return res.status(404).json({ success: false, error: 'Room not found' });
            }

            db.prepare(`
                INSERT OR IGNORE INTO chat_room_members (room_id, user_id)
                VALUES (?, ?)
            `).run(roomId, req.user.email);

            return res.json({ success: true, data: { roomId, message: 'Joined room' } });
        } catch (err) {
            return res.status(500).json({ success: false, error: err.message });
        }
    });

    /**
     * GET /api/chat/messages?roomId=X
     */
    router.get('/messages', authRequired, (req, res) => {
        const { roomId, limit = 50, offset = 0 } = req.query;
        if (!roomId) {
            return res.status(400).json({ success: false, error: 'Room ID required' });
        }

        try {
            const member = db.prepare(
                'SELECT * FROM chat_room_members WHERE room_id = ? AND user_id = ?'
            ).get(roomId, req.user.email);

            if (!member) {
                return res.status(403).json({ success: false, error: 'Not a member of this room' });
            }

            const rows = db.prepare(`
                SELECT cm.id,
                       cu.email      AS senderId,
                       cm.body       AS content,
                       cm.created_at AS createdAt,
                       cu.role
                FROM chat_messages cm
                LEFT JOIN chat_users cu ON cm.sender_id = cu.id
                WHERE cm.room_id = ?
                ORDER BY cm.created_at DESC
                LIMIT ? OFFSET ?
            `).all(roomId, parseInt(limit), parseInt(offset));

            return res.json({ success: true, data: { messages: rows.reverse() } });
        } catch (err) {
            return res.status(500).json({ success: false, error: err.message });
        }
    });

    /**
     * POST /api/chat/messages
     */
    router.post('/messages', authRequired, (req, res) => {
        const { roomId, content } = req.body;
        if (!roomId || !content) {
            return res.status(400).json({ success: false, error: 'Room ID and content required' });
        }

        try {
            const member = db.prepare(
                'SELECT * FROM chat_room_members WHERE room_id = ? AND user_id = ?'
            ).get(roomId, req.user.email);

            if (!member) {
                return res.status(403).json({ success: false, error: 'Not a member of this room' });
            }

            const chatUser = db.prepare('SELECT id FROM chat_users WHERE email = ?').get(req.user.email);
            if (!chatUser) {
                return res.status(403).json({ success: false, error: 'User not registered in chat' });
            }

            const result = db.prepare(`
                INSERT INTO chat_messages (room_id, sender_id, body)
                VALUES (?, ?, ?)
            `).run(roomId, chatUser.id, content);

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
