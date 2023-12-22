const express = require('express');
const morgan = require('morgan');
const cors = require('cors');

morgan.token('type', function(req, res) {
    if(req.body)
    return JSON.stringify(req.body);
    else
        return "";
});
morgan(function (tokens, req, res) {
    return [
        tokens.method(req, res),
        tokens.url(req, res),
        tokens.status(req, res),
        tokens.res(req, res, 'content-length'), '-',
        tokens['response-time'](req, res), 'ms',
        tokens.type(req, res)
    ].join(' ')
})

const app = express();

app.use(express.json());
app.use(cors());
app.use(morgan(function (tokens, req, res) {
    return [
        tokens.method(req, res),
        tokens.url(req, res),
        tokens.status(req, res),
        tokens.res(req, res, 'content-length'), '-',
        tokens['response-time'](req, res), 'ms',
        tokens.type(req, res)
    ].join(' ')
}));
app.use(express.static('dist'));

let persons = [
    {
        "id": 1,
        "name": "Arto Hellas",
        "number": "040-123456"
    },
    {
        "id": 2,
        "name": "Ada Lovelace",
        "number": "39-44-5323523"
    },
    {
        "id": 3,
        "name": "Dan Abramov",
        "number": "12-43-234345"
    },
    {
        "id": 4,
        "name": "Mary Poppendieck",
        "number": "39-23-6423122"
    }
]

//MONGODB CODE

const mongoose = require('mongoose')

if(process.argv.length < 3) {
    console.log('give password as argument')
    process.exit(1);
}

const password = process.argv[2];

const url = `mongodb+srv://lordmagic:${password}@cluster0.z6jhhex.mongodb.net/?retryWrites=true&w=majority`;

mongoose.set('strictQuery', false);
mongoose.connect(url);

const personSchema = new mongoose.Schema({
    name: String,
    number: Number,
});

const Person = mongoose.model('Person', personSchema);

const length = process.argv.length;
if(length > 3) {
    const personNumber = Number(process.argv[length - 1]);
    const personName = process.argv[3];

    const person = new Person({
        name: personName,
        number: personNumber,
    })

    person.save().then(result => {
        console.log(`added ${person.name} number ${person.number} to phonebook`);
        mongoose.connection.close();
    })
}
else {
    console.log('phonebook:');
    Person.find({}).then(result => {
        result.forEach(person => {
            console.log(person);
        })
        mongoose.connection.close();
    })
}

//  REQUEST ROUTES

app.get('/api/persons', (request, response) => {
    response.json(persons);
})

app.get('/info', (request, response) => {
    const numberOfPeople = persons.length;
    const currentTime = new Date();
    response.send(
        `<p>Phonebook has info for ${numberOfPeople} people</p>
               <p>${currentTime}</p>`
    )
})

app.get('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id);
    const person = persons.find(person => person.id === id);
    if(person)
        response.json(person);
    else
        response.status(404).end();
})

app.delete('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id);
    persons = persons.filter(person => person.id !== id)
    response.status(204).end();
})

app.post('/api/persons', (request, response) => {
    const person = request.body;
    if(!person.name) {
        return response.status(400).json({
            error: 'name is missing'
        })
    }
    if(!person.number) {
        return response.status(400).json({
            error: 'number is missing'
        })
    }
    if(persons.some(OGPerson => OGPerson.name === person.name)) {
        return response.status(400).json({
            error: 'name already exists'
        })
    }

    const newId = Math.floor(Math.random() * (100 - 5 + 1) + 5);
    const newPerson = {
        id: newId,
        name: person.name,
        number: person.number
    }
    persons = persons.concat(newPerson);
    response.json(newPerson);
})

// END OF REQUEST ROUTES

const PORT = process.env.PORT || 3001;
app.listen(PORT, ()=> {
    console.log('Server running on port 3001\nVISIT AT http://localhost:3001/api/persons')
})