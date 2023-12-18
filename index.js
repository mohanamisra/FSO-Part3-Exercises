const express = require('express');
const app = express();

app.use(express.json());

const morgan = require('morgan');
app.use(morgan('tiny'));

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
    if(persons.filter(OGPerson => OGPerson.name === person.name)) {
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
    persons.concat(newPerson);
    response.json(newPerson);
})

// END OF REQUEST ROUTES

const PORT = 3001;
app.listen(PORT, ()=> {
    console.log('Server running on port 3001\nVISIT AT http://localhost:3001/api/persons')
})