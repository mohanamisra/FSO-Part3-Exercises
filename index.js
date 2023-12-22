require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');

const Person = require('./models/person');

morgan.token('type', function(req) {
	if(req.body)
		return JSON.stringify(req.body);
	else
		return '';
});
morgan(function (tokens, req, res) {
	return [
		tokens.method(req, res),
		tokens.url(req, res),
		tokens.status(req, res),
		tokens.res(req, res, 'content-length'), '-',
		tokens['response-time'](req, res), 'ms',
		tokens.type(req, res)
	].join(' ');
});

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
	].join(' ');
}));
const errorHandler = (error, request, response, next) => {
	console.log(error.message);
	if(error.name === 'CastError') {
		return response.status(400).send({error: 'malformatted id'});
	}
	else if(error.name === 'ValidationError') {
		return response.status(400).json({error: 'name is too short, it should be at least 3 characters long'});
	}
	next(error);
};
app.use(errorHandler);

//  REQUEST ROUTES

app.get('/api/persons', (request, response) => {
	Person.find({}).then(people => {
		response.json(people);
	});
});

app.get('/info', (request, response) => {
	let persons;
	const numberOfPeople = persons.length;
	const currentTime = new Date();
	response.send(
		`<p>Phonebook has info for ${numberOfPeople} people</p>
               <p>${currentTime}</p>`
	);
});

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
});

app.delete('/api/persons/:id', (request, response, next) => {
	Person.findByIdAndDelete(request.params.id)
		.then(() => {
			response.status(204).end();
		})
		.catch(error => next(error));
});

app.post('/api/persons', (request, response) => {
	const person = request.body;
	if(!person.name) {
		return response.status(400).json({
			error: 'name is missing'
		});
	}
	if(!person.number) {
		return response.status(400).json({
			error: 'number is missing'
		});
	}
	// IF SAME NAME:
	let allPersons;
	Person.find({}).then(result => {
		allPersons = [...result];
		if(allPersons.some(OGPerson => OGPerson.name === person.name)) {
			Person.find({name: person.name})
				.then(oldPerson => {
					console.log(oldPerson);
				});
		}
	});
	//
	const newPerson = new Person({
		name: person.name,
		number: person.number
	});

	newPerson.save().then(savedPerson => {
		response.json(savedPerson);
	});
});

app.put('/api/persons/:id', (request, response, next) => {
	const {name, number} = request.body;

	Person.findByIdAndUpdate(request.params.id, {name, number}, {new: true, runValidators: true, context: 'query'})
		.then(updatedPerson => {
			response.json(updatedPerson);
		})
		.catch(error => next(error));
});

// END OF REQUEST ROUTES

const PORT = process.env.PORT;
app.listen(PORT, ()=> {
	console.log('Server running on port 3001\nVISIT AT http://localhost:3001/api/persons');
});