// // pages/api/callback/[id].ts (Next.js example)
// import type { NextApiRequest, NextApiResponse } from 'next';

// export default function handler(req: NextApiRequest, res: NextApiResponse) {
//   if (req.method === 'POST') {
//     const data = req.body; // Dữ liệu từ BE: { success: true, message: '...' }
//     console.log('Callback received:', data);

//     // Gọi hàm global handlePythonCallback nếu tồn tại
//     if (typeof window !== 'undefined' && window.handlePythonCallback) {
//       window.handlePythonCallback(data);
//     } else {
//       // Hoặc dùng WebSocket/EventSource nếu cần, nhưng ở đây dùng window vì mã bạn đã có
//     }

//     res.status(200).json({ message: 'Callback processed' });
//   } else {
//     res.status(405).json({ message: 'Method not allowed' });
//   }
// }
