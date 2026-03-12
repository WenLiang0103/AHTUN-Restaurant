// api/save-order.js - 马六甲小炒订单保存API（简化版）

import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
    // 1. 只接受POST请求
    if (req.method !== 'POST') {
        return res.status(405).json({ error: '只接受POST请求' });
    }

    try {
        // 2. 获取订单数据
        const order = req.body;
        console.log('收到新订单:', order);

        // 3. 检查数据
        if (!order.tableNo || !order.items || order.items.length === 0) {
            return res.status(400).json({ error: '订单数据不完整' });
        }

        // 4. 连接数据库
        const sql = neon(process.env.POSTGRES_PRISMA_URL_POSTGRES_URL);
        
        // 5. 把订单插入数据库（直接使用已存在的表）
        const result = await sql`
            INSERT INTO orders (order_id, table_no, items, total, timestamp, status)
            VALUES (
                ${order.orderId},
                ${order.tableNo},
                ${JSON.stringify(order.items)},
                ${order.total},
                ${order.timestamp},
                '进行中'
            )
            RETURNING id
        `;

        // 6. 返回成功
        res.status(200).json({ 
            success: true, 
            message: '订单保存成功',
            orderId: result[0].id 
        });

    } catch (error) {
        console.error('保存订单失败:', error);
        res.status(500).json({ 
            error: '服务器错误，订单保存失败',
            details: error.message 
        });
    }
}
