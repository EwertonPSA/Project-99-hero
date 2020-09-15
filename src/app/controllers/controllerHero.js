//FALTA CRIAR MIDDLEWARE TBM
const express = require ('express');
//const authMiddleware = require('../middlewares/auth');
const router = express.Router();
const Hero = require('../models/hero');//Nome do arquivo
const Disaster = require('../models/disaster');
const { promises } = require('fs');
const { send } = require('process');

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

//Criar heroi
router.post('/', async(req,res)=>{
    try{
        const {realName, codename, disasters, city} = req.body;
        const hero = new Hero({realName, codename, city});

        /**
         * Inclui os desastres no esquema do heroi
         */
        await Promise.all(
            disasters.map( async disaster => {
                const disasterInDatabase = await Disaster.findOne({...disaster});
                console.log(disasterInDatabase);
                if(!disasterInDatabase){
                    throw new Error('Disaster not found in database!');
                    //return res.status(400).send({error: 'Error disaster not found'});
                }
                hero.disasters.push(disasterInDatabase);//Inlcui o desastre pro heroi
            })
        ).then(res =>{
            console.log('Nao era pra ta aq2');
        }).catch(err => {
            //Como eu eu pego um throw que foi levantado?
            console.log(err);
            return res.status(400).send({err});
        });
        
        //await hero.save();
        //return res.send(hero);

        
        //Atualizando o project com as tasks
        

        
    }catch(err){
        console.log('Ta no catch')
        return res.status(400).send({error: 'Error create new hero'});
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