import mongoose from "mongoose";

const taskSchema = new mongoose.Schema({
    title:{type: String, required:true},
    taskId: { type: String },
    priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
    dueDate: { type: Date },
    assignee: { type: String }
}, { timestamps: true });

export default mongoose.model('Task', taskSchema);