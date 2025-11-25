import React, { useEffect, useState } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import axiosClient from '../api/axiosClient.js';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { 
  CheckSquare, Square, RotateCcw, 
  Plus, AlertTriangle, AlignJustify, X, Calendar, User, Trash2, Edit2 
} from 'lucide-react';

const BoardPage = () => {
  const [columns, setColumns] = useState([]);
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [formData, setFormData] = useState({ title: '', assigneeName: '', dueDate: '', priority: 'medium' });

  const navigate = useNavigate();

  useEffect(() => {
    fetchBoard();
    fetchUsers();
    const userStr = localStorage.getItem('user');
    if (userStr) setCurrentUser(JSON.parse(userStr));
  }, [navigate]);

  const fetchBoard = async () => {
    try {
      const res = await axiosClient.get('/board');
      setColumns(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      if (error.response?.status === 401) navigate('/login');
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await axiosClient.get('/board/users');
      setUsers(res.data);
    } catch (err) { console.error(err); }
  };

  const openCreateModal = () => {
    setEditingTask(null); 
    setFormData({ title: '', assigneeName: '', dueDate: '', priority: 'medium' });
    setIsModalOpen(true);
  };

  const openEditModal = (task) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      assigneeName: '', 
      dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
      priority: task.priority || 'medium'
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingTask) {
        await axiosClient.put(`/board/task/${editingTask._id}`, formData);
      } else {
        await axiosClient.post('/board/task', formData);
      }
      setIsModalOpen(false);
      fetchBoard();
    } catch (error) {
      alert("Lỗi: " + (error.response?.data?.msg || error.message));
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm("Bạn chắc chắn muốn xóa task này?")) return;
    try {
      await axiosClient.delete(`/board/task/${taskId}`);
      fetchBoard();
    } catch (err) { alert("Lỗi xóa task"); }
  };

  const handleDeleteColumn = async (columnId) => {
    if (!window.confirm("Xóa cột này?")) return;
    try {
      await axiosClient.delete(`/board/column/${columnId}`);
      fetchBoard();
    } catch (err) { alert("Lỗi xóa cột"); }
  };

  const handleAddColumn = async () => {
    const title = window.prompt("Nhập tên cột mới:");
    if (!title) return;
    try {
      await axiosClient.post('/board/column', { title });
      fetchBoard();
    } catch (err) { alert("Lỗi tạo cột"); }
  };

  const onDragEnd = async (result) => {
    const { destination, source } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const sourceColIndex = columns.findIndex(col => col._id === source.droppableId);
    const destColIndex = columns.findIndex(col => col._id === destination.droppableId);
    if (sourceColIndex === -1 || destColIndex === -1) return;

    const sourceCol = columns[sourceColIndex];
    const destCol = columns[destColIndex];
    const sourceTaskIds = [...sourceCol.taskIds];
    const destTaskIds = [...destCol.taskIds];

    if (sourceCol._id === destCol._id) {
      const [movedTask] = sourceTaskIds.splice(source.index, 1);
      sourceTaskIds.splice(destination.index, 0, movedTask);
      const newColumns = [...columns];
      newColumns[sourceColIndex] = { ...sourceCol, taskIds: sourceTaskIds };
      setColumns(newColumns);
      axiosClient.put('/board/update-column', { columnId: sourceCol._id, newTaskIds: sourceTaskIds.map(t => t._id) });
    } else {
      const [movedTask] = sourceTaskIds.splice(source.index, 1);
      destTaskIds.splice(destination.index, 0, movedTask);
      const newColumns = [...columns];
      newColumns[sourceColIndex] = { ...sourceCol, taskIds: sourceTaskIds };
      newColumns[destColIndex] = { ...destCol, taskIds: destTaskIds };
      setColumns(newColumns);

      Promise.all([
        axiosClient.put('/board/update-column', { columnId: sourceCol._id, newTaskIds: sourceTaskIds.map(t => t._id) }),
        axiosClient.put('/board/update-column', { columnId: destCol._id, newTaskIds: destTaskIds.map(t => t._id) })
      ]);
    }
  };

  const getStatusIcon = (columnTitle) => {
    const title = columnTitle.toUpperCase();
    if (title === 'DONE') return <CheckSquare size={16} className="text-blue-600" />;
    if (title === 'REVIEWING') return <RotateCcw size={16} className="text-orange-500" />;
    return <Square size={16} className="text-gray-400" />;
  };

  return (
    <div className="h-screen flex flex-col bg-white overflow-hidden font-sans text-gray-700">
      <div className="px-6 py-3 border-b border-gray-200 flex justify-between items-center shrink-0 h-16 bg-white">
        <div className="flex items-center gap-4">
          <div className="bg-blue-600 text-white p-1 rounded"><AlignJustify size={20}/></div>
          <h1 className="text-lg font-bold text-gray-800">Board</h1>
        </div>
        <div className="flex items-center gap-3">
             <button onClick={() => {localStorage.removeItem('token'); navigate('/login')}} className="text-gray-400 hover:text-red-500 text-sm font-medium">Logout</button>
             <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-700 border border-blue-200 shadow-sm">
                {currentUser ? currentUser.username.charAt(0).toUpperCase() : 'ME'}
             </div>
        </div>
      </div>

      <div className="flex-1 overflow-x-auto overflow-y-hidden p-6 bg-gray-50">
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="flex h-full items-start gap-4">
            {columns?.map((column) => {
              const isDone = column.title.toUpperCase() === 'DONE';
              const countDisplay = isDone ? `${column.taskIds.length}` : column.taskIds.length;

              return (
              <div key={column._id} className="w-[300px] shrink-0 flex flex-col max-h-full">
                <div className="flex justify-between items-center mb-3 px-1 group">
                  <h2 className="font-semibold text-xs text-gray-500 uppercase tracking-wider flex items-center gap-2">
                    {column.title}
                    <span className="bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full text-[10px] font-bold">{countDisplay}</span>
                  </h2>
                  <button onClick={() => handleDeleteColumn(column._id)} className="text-gray-300 hover:text-red-500 opacity-90 group-hover:opacity-100 transition-opacity">
                    <Trash2 size={14}/>
                  </button>
                </div>

                <Droppable droppableId={column._id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`flex-1 overflow-y-auto min-h-[150px] transition-colors rounded-lg ${snapshot.isDraggingOver ? 'bg-blue-50/50 ring-2 ring-blue-100' : ''}`}
                      style={{ scrollbarWidth: 'none' }} 
                    >
                      {column.taskIds.map((task, index) => (
                        <Draggable key={task._id} draggableId={task._id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              onClick={() => openEditModal(task)}
                              className={`bg-white p-3 mb-2 rounded-[3px] shadow-sm border border-gray-200 group hover:shadow-md hover:border-blue-300 transition-all cursor-pointer relative
                                ${snapshot.isDragging ? 'shadow-xl ring-2 ring-blue-500 rotate-2 z-50' : ''}`}
                              style={{ ...provided.draggableProps.style }}
                            >
                              <button 
                                onClick={(e) => { e.stopPropagation(); handleDeleteTask(task._id); }}
                                className="absolute top-2 right-2 text-gray-300 hover:text-red-500 opacity-90 group-hover:opacity-100 transition-opacity z-10"
                              >
                                <Trash2 size={14} />
                              </button>

                              <div className={`text-sm text-gray-800 font-medium mb-2 leading-snug ${isDone ? 'text-gray-400' : ''}`}>
                                {task.title}
                              </div>

                              {task.dueDate && !isDone && (
                                <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[3px] border text-[11px] font-medium mb-3 bg-red-50 border-red-200 text-red-600">
                                  <AlertTriangle size={12} />
                                  {format(new Date(task.dueDate), 'MMM dd, yyyy')}
                                </div>
                              )}

                              <div className="flex justify-between items-center mt-1 pt-2 border-t border-gray-50">
                                <div className="flex items-center gap-2 text-gray-500">
                                  <div className="p-0.5">{getStatusIcon(column.title)}</div>
                                  <span className={`text-xs font-semibold uppercase ${isDone ? 'line-through text-gray-300' : ''}`}>
                                    {task.taskId}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                     {task.priority === 'high' && !isDone && <div className="h-1.5 w-1.5 bg-orange-500 rounded-full"></div>}
                                     {task.assignee ? (
                                        <img src={task.assignee} alt="User" className={`w-5 h-5 rounded-full border border-white shadow-sm ${isDone ? 'opacity-60' : ''}`} />
                                     ) : (<div className="w-5 h-5 rounded-full bg-gray-200"></div>)}
                                </div>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            )})}

            {/* NÚT THÊM CỘT MỚI */}
            <div className="w-[300px] shrink-0">
                 <button 
                    onClick={handleAddColumn}
                    className="flex items-center justify-center w-full h-12 rounded-lg border-2 border-dashed border-gray-300 text-gray-500 hover:border-blue-500 hover:text-blue-500 hover:bg-blue-50 transition-all font-medium gap-2 mb-3"
                 >
                    <Plus size={20}/> Add Column
                 </button>
                 
                 {/* Nút Add Task cũng để ở đây cho tiện */}
                 <button 
                    onClick={openCreateModal}
                    className="flex items-center justify-center w-full h-12 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 font-medium gap-2"
                 >
                    <Plus size={20}/> New Task
                 </button>
            </div>

          </div>
        </DragDropContext>
      </div>

      {/* MODAL (Dùng chung Create/Edit) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b bg-gray-50">
              <h3 className="font-bold text-gray-700">
                {editingTask ? 'Edit Task' : 'Create New Task'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              
              {/* Task ID Readonly (Chỉ hiện khi Edit) */}
              {editingTask && (
                <div className="text-xs font-bold text-gray-400 uppercase">
                   ID: {editingTask.taskId}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input type="text" autoFocus required className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1"><User size={14}/> Assignee</label>
                    <select className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                      value={formData.assigneeName} onChange={(e) => setFormData({...formData, assigneeName: e.target.value})}>
                      <option value="">{editingTask ? '(Keep current)' : '-- Me --'}</option>
                      {users.map(user => (<option key={user._id} value={user.username}>{user.username}</option>))}
                    </select>
                  </div>
                  <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                     <select className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                        value={formData.priority} onChange={(e) => setFormData({...formData, priority: e.target.value})}>
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                     </select>
                  </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1"><Calendar size={14}/> Due Date</label>
                <input type="date" className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  value={formData.dueDate} onChange={(e) => setFormData({...formData, dueDate: e.target.value})} />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-medium">
                    {editingTask ? 'Save Changes' : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
export default BoardPage;