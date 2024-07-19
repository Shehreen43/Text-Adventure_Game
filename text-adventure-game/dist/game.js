#! /usr/bin/env node
import inquirer from 'inquirer';
import chalk from 'chalk';
const rooms = {
    'start': {
        description: '\nYou are in a dark room. There are doors to the north and east.',
        actions: { north: 'hallway', east: 'library', look: 'start' },
        items: ['key', 'Spider']
    },
    'hallway': {
        description: 'You are in a hallway. There is a door to the south and a locked door to the east.',
        actions: { south: 'start', east: 'quiz', look: 'hallway' }, // Use 'quiz' as a placeholder
        puzzle: 'The door to the east is locked. You need to answer a question to open it.'
    },
    'library': {
        description: 'You are in a library. There is a door to the west and a passage to the north.',
        actions: { west: 'start', north: 'garden', look: 'library' },
        npc: 'librarian'
    },
    'garden': {
        description: 'You are in a beautiful garden. There is a path to the south.',
        actions: { south: 'library', look: 'garden' },
        items: ['flower', 'Birds', 'lake']
    },
    'treasureRoom': {
        description: 'You are in the treasure room. There is a door to the west.',
        actions: { west: 'hallway', look: 'treasureRoom' },
        items: ['treasure box', 'Bom']
    }
};
const questions = [
    {
        question: 'Who is the author of this Game?',
        choices: ['Shehreen', 'Saira', 'Zia'],
        correctAnswer: 'Shehreen'
    },
    {
        question: 'What color is the sky on a clear day?',
        choices: ['Blue', 'Green', 'Red'],
        correctAnswer: 'Blue'
    },
    {
        question: 'What is the capital of France?',
        choices: ['London', 'Berlin', 'Paris'],
        correctAnswer: 'Paris'
    },
    {
        question: 'Which planet is known as the Red Planet?',
        choices: ['Mars', 'Venus', 'Jupiter'],
        correctAnswer: 'Mars'
    },
    {
        question: 'What is 2 + 2?',
        choices: ['3', '4', '5'],
        correctAnswer: '4'
    }
];
let currentRoom = 'start';
const inventory = {};
function describeRoom(room) {
    console.log(chalk.yellow(rooms[room].description)); // Using chalk to colorize the room description
    if (rooms[room].items) {
        console.log(chalk.cyan.bgGray('You see the following items:'), chalk.bgMagenta.bold(rooms[room].items?.join(', '))); // Colorizing item list
    }
    if (rooms[room].puzzle) {
        console.log(chalk.gray('Please Solve this puzzle:'), chalk.red(rooms[room].puzzle)); // Colorizing puzzle description
    }
    if (rooms[room].npc) {
        console.log(chalk.green(`There is a ${rooms[room].npc} here.`)); // Colorizing NPC presence
    }
}
async function handleAction(action) {
    const room = rooms[currentRoom];
    switch (action) {
        case 'look':
            describeRoom(currentRoom);
            break;
        case 'take':
            if (room.items && room.items.length > 0) {
                const answers = await inquirer.prompt([
                    {
                        type: 'list',
                        name: 'item',
                        message: 'What do you want to take?',
                        choices: room.items
                    }
                ]);
                const item = answers.item;
                inventory[item] = true;
                room.items = room.items.filter(i => i !== item);
                console.log(chalk.green(`You have taken the ${item}.`)); // Colorizing item taken message
            }
            else {
                console.log(chalk.yellow('There is nothing to take.')); // Colorizing no items message
            }
            break;
        case 'use':
            if (Object.keys(inventory).length > 0) {
                const answers = await inquirer.prompt([
                    {
                        type: 'list',
                        name: 'item',
                        message: 'What do you want to use?',
                        choices: Object.keys(inventory)
                    }
                ]);
                const item = answers.item;
                if (item === 'key' && currentRoom === 'hallway') {
                    console.log(chalk.green('You used the key to unlock the door to the east.')); // Colorizing key usage message
                    room.actions.east = 'treasureRoom';
                    delete inventory[item]; // Remove key from inventory
                }
                else {
                    console.log(chalk.yellow(`You used the ${item}.`)); // Colorizing item usage message
                }
            }
            else {
                console.log(chalk.yellow('You have nothing to use.')); // Colorizing no items to use message
            }
            break;
        case 'talk':
            if (room.npc) {
                console.log(chalk.blue(`You talk to the ${room.npc}.`)); // Colorizing NPC interaction message
                if (room.npc === 'librarian') {
                    console.log(chalk.blue('Librarian: "Hello! The key to the treasure room is in the dark room."')); // Colorizing NPC dialogue
                }
            }
            else {
                console.log(chalk.yellow('There is no one to talk to.')); // Colorizing no NPC message
            }
            break;
        case 'quit':
            console.log(chalk.yellow('Thanks for playing!'));
            process.exit(0);
        case 'east':
            if (currentRoom === 'hallway') {
                const questionIndex = Math.floor(Math.random() * questions.length);
                const selectedQuestion = questions[questionIndex];
                const answers = await inquirer.prompt([
                    {
                        type: 'list',
                        name: 'answer',
                        message: selectedQuestion.question,
                        choices: selectedQuestion.choices
                    }
                ]);
                if (answers.answer === selectedQuestion.correctAnswer) {
                    console.log(chalk.green('****** Congratulations! You are right. You go directly to the treasure room. ******'));
                    currentRoom = 'treasureRoom';
                    describeRoom(currentRoom);
                }
                else {
                    console.log(chalk.red('Incorrect answer. You lose the game.'));
                    process.exit(0); // End the game
                }
            }
            else {
                const nextRoom = room.actions[action];
                if (nextRoom) {
                    currentRoom = nextRoom;
                    describeRoom(currentRoom);
                }
                else {
                    console.log(chalk.red('You can\'t go that way.')); // Colorizing invalid action message
                }
            }
            break;
        default:
            const nextRoom = room.actions[action];
            if (nextRoom) {
                currentRoom = nextRoom;
                describeRoom(currentRoom);
            }
            else {
                console.log(chalk.red('You can\'t go that way.')); // Colorizing invalid action message
            }
    }
    if (action) {
        await promptAction();
    }
}
async function promptAction() {
    const answers = await inquirer.prompt([
        {
            type: 'list',
            name: 'action',
            message: 'What do you want to do?',
            choices: ['north', 'south', 'east', 'west', 'look', 'take', 'use', 'talk', 'quit']
        }
    ]);
    const action = answers.action;
    await handleAction(action);
}
async function startGame() {
    describeRoom(currentRoom);
    await promptAction();
}
export { startGame };
