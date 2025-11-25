import express from 'express';
import { getBoard, updateColumnOrder, createSampleData, addTask, getAllUsers, updateTask, deleteTask, addColumn, deleteColumn } from '../controllers/boardController.js';
import { verify } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', verify, getBoard);
router.post('/init', createSampleData);
router.post('/task', verify, addTask);
router.put('/update-column', verify, updateColumnOrder);
router.get('/users', verify, getAllUsers);

// --- CÁC ROUTE MỚI ---
router.put('/task/:taskId', verify, updateTask);   // Sửa Task
router.delete('/task/:taskId', verify, deleteTask); // Xóa Task
router.post('/column', verify, addColumn);          // Thêm Cột
router.delete('/column/:columnId', verify, deleteColumn); // Xóa Cột

export default router;