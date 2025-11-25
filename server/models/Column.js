import mongoose from "mongoose";

const columnSchema = new mongoose.Schema({
    title:{type:String, required:true},
    taskIds:[{type: mongoose.Schema.Types.ObjectId, ref: 'Task'}]
});

export default mongoose.model('Column', columnSchema);