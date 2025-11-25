import Task from "../models/Task.js";
import Column from "../models/Column.js";
import User from '../models/User.js';

export const getBoard =async(req, res) =>{
    try{
        const columns= await Column.find({}).populate('taskIds');
        res.status(200).json(columns);
    } catch(error){
        res.status(500).json({message: error.message}); 
    }
}

export const createSampleData = async (req, res) => {
  try {
    
    await Task.deleteMany({});
    await Column.deleteMany({});

    
    await Column.create({ title: 'TO DO', taskIds: [] });
    await Column.create({ title: 'IN PROGRESS', taskIds: [] });
    await Column.create({ title: 'REVIEWING', taskIds: [] });
    await Column.create({ title: 'DONE', taskIds: [] });

    res.json({ msg: 'Database initialized with 4 columns' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateColumnOrder = async (req, res) => {
  const { columnId, newTaskIds } = req.body; 
  try {
    await Column.findByIdAndUpdate(columnId, { 
      taskIds: newTaskIds 
    });
    res.status(200).json({ msg: 'Updated' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const addTask = async (req, res) => {
  try {
    const { title, assigneeName, dueDate } = req.body;
    
    let assignedUser;

    if (assigneeName) {
      assignedUser = await User.findOne({ username: assigneeName });
      if (!assignedUser) {
        return res.status(404).json({ msg: `Không tìm thấy user tên: ${assigneeName}` });
      }
    } else {
      assignedUser = await User.findById(req.user.id);
    }

    const projectPrefix = "TASK"; 
    const randomNum = Math.floor(1000 + Math.random() * 9000); 
    const generatedTaskId = `${projectPrefix}-${randomNum}`;

    const avatarUrl = `https://ui-avatars.com/api/?name=${assignedUser.username}&background=random&color=fff`;

    const newTask = await Task.create({
      title: title,
      taskId: generatedTaskId,
      priority: 'medium',
      dueDate: dueDate || new Date(),
      assignee: avatarUrl 
    });

    const todoColumn = await Column.findOne({ title: 'TO DO' });
    if (todoColumn) {
      todoColumn.taskIds.unshift(newTask._id);
      await todoColumn.save();
    } else {
       await Column.create({ title: 'TO DO', taskIds: [newTask._id] });
    }

    res.json(newTask);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}, 'username _id');
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { title, assigneeName, priority, dueDate } = req.body;

    const updateData = { title, priority, dueDate };

    if (assigneeName) {
       const user = await User.findOne({ username: assigneeName });
       if (user) {
          updateData.assignee = `https://ui-avatars.com/api/?name=${user.username}&background=random&color=fff`;
       }
    }

    const updatedTask = await Task.findByIdAndUpdate(taskId, updateData, { new: true });
    res.json(updatedTask);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    
    await Task.findByIdAndDelete(taskId);

    await Column.updateMany({}, { $pull: { taskIds: taskId } });

    res.json({ msg: 'Task deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


export const addColumn = async (req, res) => {
  try {
    const { title } = req.body;
    const newColumn = await Column.create({ title, taskIds: [] });
    res.json(newColumn);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


export const deleteColumn = async (req, res) => {
  try {
    const { columnId } = req.params;
    await Column.findByIdAndDelete(columnId);
    res.json({ msg: 'Column deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};