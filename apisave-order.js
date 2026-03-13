// api/save-order.js - 马六甲小炒订单保存API（修复版）

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

        // 4. 动态导入neon（避免包未安装的问题）
        const { neon } = await import('@neondatabase/serverless');
        
        // 5. 连接数据库 - 使用正确的环境变量名
        // 注意：根据您的截图，应该是 POSTGRES_PRISMA_URL_POSTGRES_URL（没有多余的S）
        const sql = neon(process.env.POSTGRES_PRISMA_URL_POSTGRES_URL);
        
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
        // 返回详细错误信息以便排查
        res.status(500).json({ 
            error: '服务器错误，订单保存失败',
            details: error.message,
            stack: error.stack
        });
    }
}
