const readline = require('readline');

/********************* Game functions/state *********************/
const PC = {
    name: 'Gell',
    level: 1,
    attributes: {
        str: 16,
        dex: 12,
        con: 14,
        int: 11,
        wis: 15,
        cha: 11,
    },
    maxHp: 7,
    ac: 5,
    classAtkBonus: 1,
    weapon: {
        dice: {
            num: 1,
            sides: 6,
        },
        name: 'Truncheon',
        attribute: 'str',
    },
    frayDice: {
        num: 1,
        sides: 6,
    }
}

const NPCs = {
    'goblin': {
        ac: 6,

    }
}

function rollDice(sides, dice = 1) {
    let result = 0;
    for (let i = 0; i < dice; i++) {
        result += Math.floor(Math.random() * sides) + 1;
    }

    return result;
}

function calcAttrMod(attrScore) {
    if (attrScore >= 18) {
        return 3;
    } else if (attrScore >= 16) {
        return 2;
    } else if (attrScore >= 13) {
        return 1;
    } else if (attrScore >= 9) {
        return 0;
    } else if (attrScore >= 6) {
        return -1;
    } else if (attrScore >= 4) {
        return -2;
    } else {
        return -3;
    }
}

function calcDamage(rollResult) {
    if (rollResult >= 10) {
        return 4;
    } else if (rollResult >= 6) {
        return 2;
    } else if (rollResult >= 2) {
        return 1;
    } else {
        return 0;
    }
}

function parseDiceStr(diceStr) {
    let diceReg = /(\d+)d(\d+)\+?(\d+)?/;
    let diceObj;
    let matchArr;
    if ((matchArr = diceReg.exec(diceStr))) {
        diceObj = {
            num: parseFloat(matchArr[1]),
            sides: parseFloat(matchArr[2]),
            bonus: (matchArr[3] == null ? 0 : parseFloat(matchArr[3])),
        }
    } else {
        console.log('Invalid dice string');
    }

    return diceObj;
}

// make attack as the PC. bonus is enemy ac + any circumstantial bonus if any apply
function attack(targetAC) {
    let message;
    let d20Result = rollDice(20);
    let attackResult = d20Result + PC.classAtkBonus + calcAttrMod(PC.attributes[PC.weapon.attribute]) + targetAC;
    if (d20Result === 20 || (d20Result !== 1 && attackResult >= 20)) {
        let damage = calcDamage(rollDice(PC.weapon.dice.sides, PC.weapon.dice.num) + calcAttrMod(PC.attributes[PC.weapon.attribute]));
        let frayDamage = calcDamage(rollDice(PC.frayDice.sides, PC.frayDice.num));

        message = `${PC.name} hits vs AC ${targetAC + (d20Result === 20 ? ' (Nat 20)' : '')} for ${damage} damage! Fray damage: ${frayDamage}`;
    } else {
        message = `${PC.name} misses vs AC ${targetAC + (d20Result === 1 ? ' (Nat 1)' : '')}`;
    }

    console.log(message);
}

// make attack against PC
function npcAttack(npcName = 'Monster', atkBonus, dmgDiceNum, dmgDiceSides, dmgBonus) {
    let message;
    let d20Result = rollDice(20);
    let attackResult = d20Result + atkBonus + PC.ac;
    if (d20Result === 20 || (d20Result !== 1 && attackResult >= 20)) {
        let damage = calcDamage(rollDice(dmgDiceSides, dmgDiceNum) + dmgBonus);

        message = `${npcName} hits ${PC.name + (d20Result === 20 ? ' (Nat 20)' : '')} for ${damage} damage!`;
    } else {
        message = `${npcName} misses ${PC.name + (d20Result === 1 ? ' (Nat 1)' : '')}`;
    }

    console.log(message);
}

function parseCommand(command) {
    const invalidCmdMsg = 'Invalid command';
    let matchArr;
    if (command.startsWith('attack')) {
        let attackReg = /^attack (\d+)/; // attack 8
        if ((matchArr = attackReg.exec(command))) {
            attack(parseFloat(matchArr[1]));
        } else {
            console.log(invalidCmdMsg);
        }
    } else if (command.startsWith('npcattack')) {
        let npcAttackReg = /^npcattack (\S+) (\d+) (\S+)/; // npcattack Goblin1 2 1d6+3
        if ((matchArr = npcAttackReg.exec(command))) {
            let damageDice = parseDiceStr(matchArr[3]);
            if (damageDice) {
                npcAttack(matchArr[1], parseFloat(matchArr[2]), damageDice.num, damageDice.sides, damageDice.bonus);
            }
        } else {
            console.log(invalidCmdMsg);
        }
    } else if (command.startsWith('roll')) {
        let rollReg = /^roll (\S+)/;
        if ((matchArr = rollReg.exec(command))) {
            let diceStr = matchArr[1];
            let dice = parseDiceStr(diceStr);
            if (dice) {
                let diceResult = rollDice(dice.sides, dice.num) + dice.bonus;
                console.log(`Rolled ${diceStr} for ${diceResult}`)
            }
        } else {
            console.log(invalidCmdMsg);
        }
    } else {
        console.log(invalidCmdMsg)
    }
}
// function attributeCheck()
// function savingThrow()

/********************* Stuff to make user in work *********************/
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    // terminal: true,
});

let readInputResolve = null;

rl.on('line', (line) => {
    if (readInputResolve) {
        readInputResolve(line);
    }
    // rl.close();
})

async function readInput() {
    return new Promise ((resolve) => {
        readInputResolve = resolve;
    });
}

/********************* Game loop *********************/
(async function() {
    console.log('SH Combat Script started! Input a command to begin.')
    while (true) {
        const userIn = await readInput();
        parseCommand(userIn);
    }
})();
