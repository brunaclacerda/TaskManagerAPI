const express = require('express');
const Task = require('../models/task');
const auth = require('../middleware/auth')
const router = new express.Router();


router.post('/tasks', auth, async (req, res) => {
    const task = new Task({
        ...req.body, 
        owner: req.user._id});
    // task.save().then( () => {
    //     res.status(201);
    //     res.send(task);
    // }).catch( e => {
    //     res.status(400);
    //     res.send(e);
    // })

    try {
        await task.save();  
        res.status(201);
        res.send(task);  
    } catch (e) {
        res.status(400);
        res.send(e);       
    }
})

router.get('/tasks', auth, async (req, res) => {
    // Task.find().then((tasks) => {
    //     res.send(tasks);
    // }).catch( (e) => {
    //     res.status(500);
    //     res.send(e);
    // })

    let match = {}
    let sort  = {}

    if (req.query.completed){
        match.completed = req.query.completed === 'true';
    }

    if (req.query.sortBy){
        const parts = req.query.sortBy.split(':')
        sort[parts[0]] = parts[1] === 'desc' ? -1 : 1
    }

    try {
        // const tasks = await Task.find();   
        await req.user.populate({
            path: 'tasks',
            match,
            options: {
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                sort
            }
        })
        res.send(req.user.tasks);    
    } catch (e) {
        res.status(500).send(e);        
    }
})

router.get('/tasks/:id', auth, async (req, res) => {
    // Task.findById(req.params.id).then( (tasks) => {
    //     if(!tasks){
    //         res.status(404);
    //     }
    //     res.send(tasks);
    // }).catch( (e) => {
    //     res.status(500);
    //     res.send(e);
    // })

    try {
        const task = await Task.findOne({_id: req.params.id, owner: req.user._id})
        if(!task){
            res.status(404);
        }
        res.send(task);
    } catch (e) {
        res.status(500).send(e);        
    }
})

router.patch('/tasks/:id', auth, async (req, res) => {
    const updates = Object.keys( req.body );
    const updatesAllowed = ['description', 'completed'];
    const isValidOperation = updates.every( (update) => updatesAllowed.includes(update));

    if (!isValidOperation){
        return res.status(400).send('Invalid update!') 
    }
    try {
        //const task = await Task.findByIdAndUpdate(req.params.id, req.body, {new: true, runValidators: true});
        const task = await Task.findOne({_id: req.params.id, owner: req.user._id});
        if (!task){
            return res.status(404).send();
        }
        updates.forEach( (element) => task[element] = req.body[element])
        await task.save()

        res.send(task);
        
    } catch (e) {
        res.status(404).send(e);   
    }
})

router.delete('/tasks/:id', auth, async (req, res) =>{
    try {
        const task = await Task.findOneAndDelete({_id: req.params.id, owner: req.user._id});
        
        if (!task){
            return res.status(404).send();
        }
        res.send(task);
    } catch (e) {
        res.status(400).send(e);        
    }
})

module.exports = router;