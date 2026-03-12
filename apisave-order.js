// api/save-order.js - 马六甲小炒订单保存API

// 导入Neon数据库连接包
import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
    // 1. 只接受POST请求（下单都是POST）
    if (req.method !== 'POST') {
        return res.status(405).json({ error: '只接受POST请求' });
    }

    try {
        // 2. 从请求中获取订单数据
        const order = req.body;
        console.log('收到新订单:', order);

        // 3. 检查必要数据
        if (!order.tableNo || !order.items || order.items.length === 0) {
            return res.status(400).json({ error: '订单数据不完整' });
        }

        // 4. 连接数据库（使用您之前保存的POSTGRES_URL）
        const sql = neon(process.env.POSTGRES_URL);
        
        // 5. 创建订单表（如果还没有的话）
        await sql`
            CREATE TABLE IF NOT EXISTS orders (
                id SERIAL PRIMARY KEY,
                order_id TEXT NOT NULL,
                table_no TEXT NOT NULL,
                items JSONB NOT NULL,
                total DECIMAL(10,2) NOT NULL,
                timestamp TIMESTAMP NOT NULL,
                status TEXT DEFAULT '进行中',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `;

        // 6. 把订单插入数据库
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

        // 7. 返回成功
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