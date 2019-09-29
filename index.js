const Discord = require('discord.js');
const config = require('./config.json')
const client = new Discord.Client();

var firstVoiceChannel
var secondVoiceChannel
var currentUserChannel
var userChannelBeforePoking
var shouldKeepPoking = true

client.once('ready', () => {
	console.log('Ready!');
});

client.on('message', message => {
    if (!message.content.startsWith(config.prefix) || message.author.bot) return;

    else if (message.content.startsWith(`${config.prefix}stop`)) {
        message.channel.send('Stopped poking')
        shouldKeepPoking = false
    }

    else if (message.content.startsWith(`${config.prefix}poke`)) {

        const args = message.content.trim().slice(config.prefix.length).split(' ');
        const command = args.shift().toLowerCase();
        const server = message.guild

        var howLongToPokeInSeconds
        var userToPoke 
        
        console.log(args)

        if (!args.length) {
            return message.channel.send(`You didn't provide any arguments, ${message.author}!`);
        }

        else if (args.length == 1) {
            if (!message.mentions.users.size) {
                return message.reply('You need to tag a user in order to poke them!');
            }
            userToPoke = args[0]
            message.channel.send(`Poking ${args[0]}`)
        }
        else if (args.length == 2) {
            if (!message.mentions.users.size) {
                return message.reply('You need to tag a user in order to poke them!');
            }
            

            userToPoke = message.mentions.members.first()
            userChannelBeforePoking = userToPoke.voiceChannel
            console.log('user channel ' + userChannelBeforePoking.name)
            howLongToPokeInSeconds = args[1]
            message.channel.send(`Poking ${userToPoke} for ${howLongToPokeInSeconds} times`)
        }
        
        
        pokeUser(userToPoke, howLongToPokeInSeconds, server)
        
        
    }
})

client.login(config.token);

async function pokeUser(userToPoke, howLongToPokeInSeconds, server){

    if (firstVoiceChannel == null) {
        await createNewTwoVoiceChannels(server)
    }

    await throwUserBetweenChannels(userToPoke, howLongToPokeInSeconds)

    await deleteVoiceChannels();

}

async function throwUserBetweenChannels(userToPoke, howManyTimesToPoke){
    await moveUserToFirstChannel(userToPoke)

    i = howManyTimesToPoke
    for(i; i > 0; i--){
        if (shouldKeepPoking == false){
            i = 0
        }
        console.log(i)
        if (currentUserChannel == firstVoiceChannel){
            await moveUserToSecondChannel(userToPoke)
        }
        else if (currentUserChannel == secondVoiceChannel) {
            await moveUserToFirstChannel(userToPoke)
        }
    }
    await moveUserToChannelHeWasAtStart(userToPoke)
    shouldKeepPoking = true
}

async function moveUserToFirstChannel(userToPoke) {
    await userToPoke.setVoiceChannel(firstVoiceChannel)
            .then(() => {
                console.log('Moved user to first channel')
                currentUserChannel = firstVoiceChannel
            })
            .catch(console.error)
}

async function moveUserToSecondChannel(userToPoke) {
    await userToPoke.setVoiceChannel(secondVoiceChannel)
            .then(() => {
                console.log('Moved user to second channel')
                currentUserChannel = secondVoiceChannel
            })
            .catch(console.error)
}

async function moveUserToChannelHeWasAtStart(userToPoke) {
    await userToPoke.setVoiceChannel(userChannelBeforePoking)
            .then(() => {
                console.log('Moved user to the channel he was at start')
                currentUserChannel = userChannelBeforePoking
            })
            .catch(console.error)
}

async function createNewTwoVoiceChannels(server){

    console.log('Creating new voice channels')
    
    firstVoiceChannel = await createNewVoiceChannel(server, config.firstVoiceChannelName)
    secondVoiceChannel = await createNewVoiceChannel(server, config.secondVoiceChannelName)


}

async function createNewVoiceChannel(server, name) {

    var tempChannel

    await server.createChannel(name, {type: 'voice'})
    .then(()=>{
        tempChannel = server.channels.find(channel => channel.name === name)
        
    })
    .catch(console.error)
    return tempChannel

}

async function deleteVoiceChannels() {

    await firstVoiceChannel.delete()
        .then(console.log('Deleted first channel'))
        .catch(console.error);

    firstVoiceChannel = null
    
    await secondVoiceChannel.delete()
        .then(console.log('Deleted second channel'))
        .catch(console.error);

    secondVoiceChannel = null
}
