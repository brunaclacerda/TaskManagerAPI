const mongoose = require('mongoose');

const { Schema } = mongoose;

//async function saveDocument(newDoc){
//     await newDoc.save();
// }

// saveDocument(user).catch(err => console.log('Erro ', err))

const taskSchema = new Schema({
    description: {
        type: String,
        required: true
    },
    completed: {
        type: Boolean,
        default: false
    },
    owner: {
        type: mongoose.Schema.ObjectId,
        required: true,
        ref: 'User'
    }
}, {
    timestamps: true
})

const Task = mongoose.model('Task', taskSchema);

const task = new Task ({
    description: 'Complete node course',
    completed: false
})

module.exports = Task;