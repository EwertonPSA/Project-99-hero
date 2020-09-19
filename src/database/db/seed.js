const Disaster = require('../../app/models/disaster');
const Hero = require('../../app/models/hero');

getIdDisasters = function( mapByNameDisasters,disastersID, disastersHeros){
    const disastersHeroWithID = [];
    disastersHeros.forEach(disasterHero => {
        const indexDisaster = mapByNameDisasters.indexOf(disasterHero.name);
        disastersHeroWithID.push(disastersID[indexDisaster]);
    });
    return disastersHeroWithID;
}

exports.startInformationDB =  async function(){
    try{
        const heros = await Hero.find();
        const disasters = await Disaster.find();
        if(true && disasters.length===0){
            const disasterInDB = [
                {insertOne: {document:{"name":"assalto a bancos"}}},
                {insertOne: {document:{"name":"monstros gigantes"}}},
                {insertOne: {document:{"name":"desastres naturais"}}}
            ];
            await Disaster.bulkWrite(disasterInDB);
            const disastersID = await Disaster.find();
            const mapByNameDisasters = disastersID.map(item => item.name);
            const heroWithIDdisasters = [
                {
                    insertOne:{
                        document:{
                            "realName":"Steve Rogers",
                            "codename":"Capitão América",
                            "disasters": getIdDisasters(
                                mapByNameDisasters,
                                disastersID,
                                [
                                    {"name":"assalto a bancos"},
                                    {"name":"desastres naturais"}
                                ]
                            ),
                            "cities":["new york"]
                        }
                    }
                },
                {
                    insertOne:{
                        document:{
                            "realName":"Tommy Oliver",
                            "codename":"Power Ranger Branco",
                            "disasters":getIdDisasters(
                                mapByNameDisasters,
                                disastersID,
                                [
                                    {"name":"monstros gigantes"},
                                    {"name":"desastres naturais"}
                                ]
                            ),
                            "cities":["New York","Tókio"]
                        }
                    }
                },
                {
                    insertOne:{
                        document:{
                            "realName":"Logan",
                            "codename":"Wolverine",
                            "disasters":getIdDisasters(
                                mapByNameDisasters,
                                disastersID,
                                [
                                    {"name":"assalto a bancos"},
                                    {"name":"monstros gigantes"},
                                    {"name":"desastres naturais"}
                                ]
                            ),
                            "cities":["New York","Tókio"]
                        }    
                    }
                },
                {
                    insertOne:{
                        document:{
                            "realName":"Clark Joseph Kent",
                            "codename":"Superman",
                            "disasters":getIdDisasters(
                                mapByNameDisasters,
                                disastersID,
                                [
                                    {"name":"assalto a bancos"},
                                    {"name":"monstros gigantes"},
                                    {"name":"desastres naturais"}
                                ]
                            ),
                            "cities":["New York"]
                        }
                    }
                },
                {
                    insertOne:{
                        document:{ 
                            "realName":"Touha Yamaji",
                            "codename":"Ninja Jiraya",
                            "disasters":getIdDisasters(
                                mapByNameDisasters,
                                disastersID,
                                [
                                    {"name":"monstros gigantes"}
                                ]
                            ),
                            "cities":["Tókio"]
                        }
                    }
                },
                {
                    insertOne:{
                        document:{  
                            "realName":"Roberto da Costa",
                            "codename":"Macha Solar",
                            "disasters":getIdDisasters(
                                mapByNameDisasters,
                                disastersID,
                                [
                                    {"name":"assalto a bancos"},
                                    {"name":"monstros gigantes"},
                                    {"name":"desastres naturais"}
                                ]
                            ),
                            "cities":["Rio de Janeiro","New York"]
                        }
                    }
                },
                {
                    insertOne:{
                        document:{       
                            "realName":"Amara Aquilla",
                            "codename":"Magma",
                            "disasters":getIdDisasters(
                                mapByNameDisasters,
                                disastersID,
                                [
                                    {"name":"desastres naturais"}
                                ]
                            ),
                            "cities":["Rio de Janeiro"]
                        }
                    }
                },
            ];
            await Hero.bulkWrite(heroWithIDdisasters);
        }
    }catch(error){
        console.log(error);
    }
}