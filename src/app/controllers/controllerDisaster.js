/**
 * Cria a rota para cadastrar os desastres no banco
 * Soh eh permitido fazer o cadastro se tiver estiver autenticado
 * Com uma conta em CompanyAccount e o token nao estiver espirado
 */

 /**
  * FALTA A ALTENTICACAO NESSE E TESTAR SE O TOKEN FUNCIONA NELE
  */
const express = require('express');
const jwt = require('jsonwebtoken');
const config = require('../../config/securityApp');
const Disaster = require('../models/disaster'); 
const router = express.Router();

function generateToken(params = {}){
    return jwt.sign(params, config.secret, {
        expiresIn: 86400, //Em 1 dia contado em segundos
    });
}

/**
 * {
 *      "disaster":"Assalto a banco"
 * }
 */
//Rota de cadastro utilizando requisicao do tipo POST
router.post("/register", async(req, res) => {
    const {name} = req.body;
    try{
        //Verifica se o desastre ja existe
        if(await Disaster.findOne({name})){
            return res.status(400).send({error: 'Disaster already exists'});
        }      

        //Aguardar a criacao do novo desastre antes de continuar
        const disaster = await Disaster.create(req.body);        

        return res.send({
            disaster,
            token:generateToken({id: disaster.id}),
        });
    }catch (err){//Caso ocorra erro na criacao do usuario
        return res.status(400).send({error: 'Registration failed'});
    }
});

//Listagem
router.get('/', async(req, res)=>{
    try{
        const disaster = await Disaster.find();//Buscando os usuarios relacionados
        //Assim nao precisa fazer mais de uma query (buscar os projetos e depois query buscando os usuarios)
        return res.send( {disaster} );
    }catch(err){
        return res.status(400).send({error: 'Error load disaster'});
    }
});

//Deletar um desastre
router.delete('/delete', async(req, res)=>{
    const {name} = req.body;
    try{
        const disaster = await Disaster.findOne({name});
        if(!disaster){
            return res.status(400).send({error: 'Disaster not exists'});
        }
        await Disaster.findByIdAndRemove(disaster._id);
        return res.send();
    }catch(err){

        return res.status(400).send({error: 'Error deleting project'});
    }
});

module.exports = (app) => app.use('/disaster', router);