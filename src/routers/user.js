const express = require('express')
const multer = require('multer')
const sharp = require('sharp')
const User = require('../models/user')
const auth = require('../middleware/auth')
const {sendWelcomeEmail, sendUserDeletedEmail} = require('../emails/account')
const router = new express.Router()


router.post('/users', async (req, res) => {
    const user = new User(req.body);
    // user.save().then( () => {
    //     res.status(201);
    //     res.send(user);
    // }).catch(e => {
    //     res.send(e);
    // })

    try {
        await user.save();
        const token = await user.generateAuthToken();
        sendWelcomeEmail(user.name, user.email)
        res.status(201);
        res.send({user, token});
    } catch (e) {
        res.status(400).send(e);       
    }
})

router.post('/users/login', async (req, res) => {
    try {
        const user = await User.findByCredential(req.body.email, req.body.password)
        const token = await user.generateAuthToken();

        res.send({user, token})
        
    } catch (e) {
        res.status(400).send()       
    }
})

router.post('/users/logout', auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token
        })
        await req.user.save();
        res.send()

    } catch (e) {
        res.status(500).send()
    }
})

router.post('/users/logoutAll', auth, async (req, res) => {
    try {
        req.user.tokens = [];
        await req.user.save();
        res.send()

    } catch (e) {
        res.status(500).send()
        
    }
})

router.get('/users/me', auth, async (req, res) => {
    // User.find().then( (users) => {
    //     res.send(users);
    // }).catch( e => {
    //     res.status(500);
    //     res.send(e);
    // })

    // try {
    //     const users = await User.find(); 
    //     res.send(users);   
    // } catch (e) {
    //     res.status(500).send(e);        
    // }

    res.send(req.user)
})

const upAvatar = multer({ 
   // dest: 'avatars', file will be saved in db
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)){
            return cb(new Error('Upload an image'))
        }
        cb(undefined, true)
    }
})

// The user should be able to see just his profile
// router.get('/users/:id', async(req, res) => {
//     // User.findById(req.params.id).then( (user) => {
//     //     if (!user){
//     //         res.status(404);
//     //     }
//     //     res.send(user);
//     // }).catch( (e) => {
//     //     res.status(500);
//     //     res.send(e);
//     // })

//     try {
//         const user =  await User.findById(req.params.id);     
//         if (!user){
//             res.status(404);
//         }
//         res.send(user); 
//     } catch (e) {
//         res.status(500);
//         res.send(e);        
//     }
// })

router.patch('/users/me', auth, async (req, res) => {
    const updates = Object.keys( req.body );
    const updatesAllowed = ['name', 'age', 'password', 'email'];
    const isValidOperation = updates.every( (update) => updatesAllowed.includes(update));

    if (!isValidOperation){
        return res.status(400).send('Invalid update!') 
    }
    try {
        //const user = await User.findByIdAndUpdate(req.params.id, req.body, {new: true, runValidators: true});

        // const user = await User.findById(req.params.id);
        // if (!user){
        //     return res.status(404).send();
        // }
        updates.forEach( (element) => req.user[element] = req.body[element])
        await req.user.save()

        res.send(req.user);     
    } catch (e) {
        res.status(400).send(e);
    }
})

router.delete('/users/me', auth, async (req, res) => {
    try {
        // the user is already set em req by auth
        // const user = await User.findByIdAndDelete(req.params.id);

        // if (!user){
        //     return res.status(404).send();
        // }
        await req.user.deleteOne()
        sendUserDeletedEmail(req.user.name, req.user.email)

        res.send(req.user)
        
    } catch (e) {
        res.status(500).send(e)
    }

})

router.post('/users/me/avatar', auth, upAvatar.single('avatar'), async (req, res) => {    
    const buffer = await sharp(req.file.buffer).resize({ height: 250, width: 250}).png().toBuffer()
    req.user.avatar = buffer
    await req.user.save()
    res.send()

}, (error, req, res, next) => {
    res.status(400).send({error: error.message})
})

router.delete('/users/me/avatar', auth, async (req, res) => {
    try {
        req.user.avatar = undefined
        await req.user.save()
        res.send()
    } catch (e) {
        res.status(400).send({ message: e})
    }
})

router.get('/users/:id/avatar', async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
        if(!user || !user.avatar){
            throw new Error('Avatar not found')
        }

        res.set('Content-type', 'image/jpg' )
        res.send(user.avatar)
    } catch (e) {
       res.status(404).send({ message : e.message}) 
    }
})

module.exports = router