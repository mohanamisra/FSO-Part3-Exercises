const mongoose = require('mongoose')

if(process.argv.length < 3) {
    console.log('give password as argument')
    process.exit(1);
}

const password = process.argv[2];

const url = `mongodb+srv://lordmagic:${password}@cluster0.z6jhhex.mongodb.net/?retryWrites=true&w=majority`;

