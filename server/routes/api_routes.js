import express from 'express';
import { getBoard, updateColumnOrder, addTask, getAllUsers, updateTask, deleteTask, addColumn, deleteColumn } from '../controllers/boardController.js';
import { verify } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', verify, getBoard);
router.post('/task', verify, addTask);
router.put('/update-column', verify, updateColumnOrder);
router.get('/users', verify, getAllUsers);


router.put('/task/:taskId', verify, updateTask);  
router.delete('/task/:taskId', verify, deleteTask);
router.post('/column', verify, addColumn);          
router.delete('/column/:columnId', verify, deleteColumn);

export default router;