const express = require('express');
const Disaster = require('../models/disaster'); 
const router = express.Router();
const validation = require('../middlewares/disasterMiddleware');

/**
 * Rota para registro dos desastres 
 * @param {String} req.body.name nome do desastre a ser cadastrado
 */
router.post("/register", validation.register, async(req, res) => {
    const {name} = req.body;
    try{    
        const disaster = await Disaster.create(req.body);  
        return res.send(disaster);      
    }catch (err){
        if(err.name==="MongoError" && err.code===11000){
            return res.status(400).send({error: 'Error, disaster already exists'});
        }else{
            return res.status(500).send({error: 'Error, create new disaster'});
        }
    }
});

/**
 * Rota para listas os desastres registrados
 */
router.get('/', async(req, res)=>{
    try{
        const disaster = await Disaster.find();
        return res.send( {disaster} );
    }catch(err){
        return res.status(400).send({error: 'Error load disaster'});
    }
});

//Deletar um desastre
router.delete('/delete', validation.delete, async(req, res)=>{
    const {name} = req.body;
    try{
        
        const disaster = await Disaster.findOne({name});
        if(!disaster){
            return res.status(400).send({error: 'Disaster not exists'});
        }
        await Disaster.findByIdAndRemove(disaster._id);
        const msg = `Disaster '${name}' has been deleted`;
        return res.send({succes:msg});
    }catch(err){

        return res.status(400).send({error: 'Error deleting project'});
    }
});

module.exports = (app) => app.use('/disaster', router);