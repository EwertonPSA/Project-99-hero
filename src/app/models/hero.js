const mongoose = require('../../database');
/*Esquema do heroi no banco de dados*/
const HeroSchema = new mongoose.Schema({
	realName:{
		type: String,
        required: true,
        select: false, //Impedir que o nome seja listado
        lowercase: true,
    },
    codename:{
        unique: true,
        type: String,
        required: true,
        lowercase: true,
    },
    disasters:{
        type:[{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Disaster',
            required: [true, 'disaster is not registered']
        }]
    },
    cities:{
        type:[{
            type: String,
            lowercase: true, 
            enum: {
                values: ['new york', 'rio de janeiro', 'tókio'], 
                message: 'city `{VALUE}` is not covered',
            },
        }],
    },
    teamWork: {
        type: String,
        enum: {
            values: ['sim', 'não', 'indiferente'],
            message: 'teamwork `{VALUE}` is not accepted'
        },
        default: 'indiferente',
        lowercase: true,
    }
});

 const Hero = mongoose.model('Hero', HeroSchema);
 module.exports = Hero;