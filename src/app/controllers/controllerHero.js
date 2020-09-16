//FALTA CRIAR MIDDLEWARE TBM
const express = require ('express');
//const authMiddleware = require('../middlewares/auth');
const router = express.Router();
const Hero = require('../models/hero');//Nome do arquivo
const Disaster = require('../models/disaster');
const mongoose = require('../../database');

//Listagem
router.get('/', async(req, res)=>{
    try{
        const hero = await Hero.find().populate(['disaster']);//Buscando os usuarios relacionados
        //Assim nao precisa fazer mais de uma query (buscar os projetos e depois query buscando os usuarios)
        return res.send( {hero} );
    }catch(err){
        return res.status(400).send({error: 'Error load heros'});
    }
});

//Listar de um heroi pelo id
router.get('/', async(req, res)=>{
    try{
        const hero = await Project.findById(req.params.projectId).populate('disaster');
        return res.send( {hero} );
    }catch(err){
        return res.status(400).send({error: 'Error load user by Id'});
    }
});

/**
 * Defini o tipo de erro e atrelha a ele uma mensagem
 * @param {String} message - Mensagem do erro que deseja ser emitida pro erro 
 */
function UserException(message, attribute) {
    this.message = message;
    this.name = "UserException";
 }

//Criar heroi
router.post('/', async(req,res)=>{
    try{
        const {realName, codename, cities, disasters} = req.body;
        const hero = new Hero({realName, codename, cities});
        const valueNecessary = ['realName', 'codename', 'cities', 'disaster'];

        /**Se a key teamwork foi repassado entao
           Eh mudado o seu valor default*/
        if(req.body.hasOwnProperty('teamWork')){
            hero.set('teamWork', req.body.teamWork.toLowerCase());
        }

        if(!req.body.hasOwnProperty('disasters')){
            throw new UserException('Error, it is necessary to include disasters');
        }
       
        /**
         * Incluindo os desastres no esquema do heroi
         * Eh passado por cada desastre e se um desastre nao
         * for encontrado no database entao o heroi nao eh cadastrado,
         * Disaster.name esta em lowercase entao eh feito 
         * O tratamento da entrada antes de busca-lo no banco
         */
        await Promise.all(disasters.map( async disaster => {
            var disasterInDatabase = await Disaster.findOne({name: disaster.name.toLowerCase()});
            //Cadastra dados com o ID pois eh referenciado
            hero.disasters.push(disasterInDatabase);
        })).then(async function(){
            /*Caso todos dessastres estejam na base de dados
              entao ele eh incluido no heoi*/
            await hero.save();
            hero.realName = undefined;//Nao exibir o nome usado pro cadastro
            return res.send({hero});
        }).catch(err => {
            //Emite erro que deve ser tratado no try catch por fora
            //Que inclui todas validacoes de atributos no banco
            throw err;
        });
    }catch(err){//Problema nas keys do json
        if(err.name === "ValidationError"){
            var error = {};
            const keys = Object.keys(err.errors);
            console.log(keys);
            keys.forEach((key) => {
                error[key] = err.errors[key].message;
            });
            return res.status(400).send({error: error}); // or return next(error);
        }else if(err.name=="UserException"){
            return res.status(400).send({error: err.message});
        }else{
            console.log('No catch de fora', err.name, err);
            return res.status(400).send({error: 'Error create new hero'});
        }
    }
});


/*
//Atualizar um projeto
router.put('/:projectId', authMiddleware, async(req, res)=>{
    try{
        const {title, description, tasks_arr} = req.body;
        const project = await Project.findByIdAndUpdate(req.params.projectId, {//projectId eh informado no link
            title, 
            description
        },{ new: true }); //Por padrao findByIdAndUpdate retorna o valo antigo, alterei pra retornar o novo
        
        project.tasks = [];//Retira do project os arrays atuais
        
        Task.remove({ project: project._id });//Remove os taks associados ao projeto a partir do id(contido em project)

        await Promise.all(tasks_arr.map( async task => {
            const projectTask = new Task({ ...task, project: project._id});//Nao salva no banco, soh cria

            await projectTask.save();//Salva no banco primeiro uma task
            project.tasks.push(projectTask);//Inlcui essa tasks no array de project
        }));
        
        await project.save();

        return res.send(project);
    }catch(err){
        return res.status(400).send({error: 'Error create new project'});
    }
});

//Deletar um projeto
router.delete('/:projectId', authMiddleware, async(req, res)=>{
    try{
        await Project.findByIdAndRemove(req.params.projectId);
        return res.send();
    }catch(err){
        return res.status(400).send({error: 'Error deleting project'});
    }
});
*/
module.exports = app => app.use('/hero', router);