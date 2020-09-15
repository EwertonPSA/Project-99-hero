/**
 * Operacao de criacao de conta 
 * Para a empresa poder cadastrar os desastres
 * A medida que for expandindo o negocio
 */

 /**
  * FALTA A ALTENTICACAO NESSE E TESTAR SE O TOKEN FUNCIONA NELE
  */
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../../config/securityApp');
const CompanyAccount = require('../models/companyAccount'); 
const router = express.Router();

function generateToken(params = {}){
    return jwt.sign(params, config.secret, {
        expiresIn: 86400, //Em 1 dia contado em segundos
    });
}

//Rota de cadastro utilizando requisicao do tipo POST
router.post("/register", async(req, res) => {
    const {email} = req.body;
    try{
        //Verifico se existe o email no banco
        if(await CompanyAccount.findOne({email})){
            return res.status(400).send({error: 'Account already exists'});
        }      
        
        //Aguarda a criacao do novo usuario antes de continuar
        const account = await CompanyAccount.create(req.body);
        
        //Escondendo o email cadastrado
        //Pois sera visualizado os dados apos o cadastro
        account.password = undefined;

        return res.send({
            account,
            token:generateToken({id: account.id}),
        });
    }catch (err){//Caso ocorra erro na criacao do usuario
        return res.status(400).send({error: 'Registration failed'});
    }
});

router.post("/authenticate", async(req, res) =>{
    const {email, password} = req.body;

    //busca usuario com senha no banco
    const account = await CompanyAccount.findOne({email}).select('+password');
    if (!account){//Caso nao encontre o usuario
        return res.status(400).send({error:'Account not found'});
    }

    //Verificando a senha
    if(! await bcrypt.compare(password, account.password)){
        return res.status(400).send({error: 'Invalid password'});
    }

    //Retirado o password para a exibicao dos dados
    account.password = undefined;

    res.send({
        account, 
        token:generateToken({id: account.id}),
    });
});

module.exports = (app) => app.use('/account', router);