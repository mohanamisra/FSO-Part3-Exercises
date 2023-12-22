require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');

const Person = require('./models/person');

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

app.use(express.static('dist'));
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

const unknownEndpoint = (request, response) => {
    response.status(404).send({error: 'unknown endpoint'});
}

const errorHandler = (error, request, response, next) => {
    console.log(error.message);
    if(error.name === 'CastError') {
        return response.status(400).send({error: 'malformatted id'});
    }
    next(error);
}
app.use(errorHandler)

//  REQUEST ROUTES

app.get('/api/persons', (request, response) => {
    Person.find({}).then(people => {
        response.json(people);
    })
})

app.get('/info', (request, response) => {
    const numberOfPeople = persons.length;
    const currentTime = new Date();
    response.send(
        `<p>Phonebook has info for ${numberOfPeople} people</p>
               <p>${currentTime}</p>`
    )
})

app.get('/api/persons/:id', (request, response, next) => {
    Person.findById(request.params.id)
        .then(person => {
            if(person) {
                response.json(person);
            }
            else {
                response.status(404).end();
            }
        })
        .catch(error => next(error));
})

app.delete('/api/persons/:id', (request, response, next) => {
    Person.findByIdAndDelete(request.params.id)
        .then(result => {
            response.status(204).end();
        })
        .catch(error => next(error));
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
    const newPerson = new Person({
        name: person.name,
        number: person.number
    })

    newPerson.save().then(savedPerson => {
        response.json(savedPerson);
    })
})

// END OF REQUEST ROUTES

const PORT = process.env.PORT;
app.listen(PORT, ()=> {
    console.log('Server running on port 3001\nVISIT AT http://localhost:3001/api/persons')
})