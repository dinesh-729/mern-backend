const {v4: uuid} = require('uuid');
const { validationResult } = require('express-validator');

const HttpError = require('../models/http-error');
const getCoordsForAddress = require('../util/location');

let DUMMY_PLACES = [
	{
    id: 'p1',
    title: 'Empire State Building',
    description: 'One of the most famous sky scrapers in the world!',
    imageUrl:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/d/df/NYC_Empire_State_Building.jpg/640px-NYC_Empire_State_Building.jpg',
    address: '20 W 34th St, New York, NY 10001',
    location: {
      lat: 40.7484405,
      lng: -73.9878584
    },
    creator: 'u1'
  },
  {
    id: 'p2',
    title: 'Emp. State Building',
    description: 'One of the most famous sky scrapers in the world!',
    imageUrl:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/d/df/NYC_Empire_State_Building.jpg/640px-NYC_Empire_State_Building.jpg',
    address: '20 W 34th St, New York, NY 10001',
    location: {
      lat: 40.7484405,
      lng: -73.9878584
    },
    creator: 'u2'
  }
];

const getPlacesById = (req,res,next)=>{

	const placeId = req.params.pid; //{pid:'p1'} dynamic url

	const place = DUMMY_PLACES.find(p=>{
		return p.id === placeId;
	});

	if (!place) {
		throw new HttpError('Could not find a place for the provided place id',404);
	}

	res.json({place});
}


const getPlacesByUserId = (req,res,next)=>{
	const userId = req.params.uid;

	const places = DUMMY_PLACES.filter(p=>{
		return p.creator===userId;
	})

	if(!places || places.length === 0) {
		return next(
			new HttpError('Could not find places for the provided user id',404)
		);
	}

	res.json({places});
}

const createPlace = async (req,res,next) => {
	const error = validationResult(req);
 	if (!error.isEmpty()) {
		return next(new Error ('Invalid inputs passed, please check your data',422));
	}

	const {title,description,address,creator} = req.body;

	let coordinates;
	try {
		coordinates = await getCoordsForAddress(address);
	} catch (error) {
		return next(error);
	}

	const createdPlace = {
		id:uuid(),
		title,
		description,
		location: coordinates,
		address,
		creator
	}

	DUMMY_PLACES.push(createdPlace);

	res.status(201).json({place:createdPlace})
}

const updatePlace = (req,res,next) => {
	const error = validationResult(req);
 	if (!error.isEmpty()) {
		throw new Error ('Invalid inputs passed, please check your data',422);
	}

	const {title,description} = req.body;
	const placeId = req.params.pid;

	const updatedPlace = {...DUMMY_PLACES.find(p=>p.id===placeId)};
	const placeIndex  = DUMMY_PLACES.findIndex(p=>p.id===placeId);
	updatedPlace.title = title;
	updatedPlace.description = description;

	DUMMY_PLACES[placeIndex] = updatedPlace;

	res.status(200).json({place:updatedPlace});

}

const deletePlace = (req,res,next) => {
	const placeId = req.params.pid;
	if(!DUMMY_PLACES.find(p => p.id === placeId)) {
		throw new Error('Could not find aplace for that id.',404);
	}

	DUMMY_PLACES = DUMMY_PLACES.filter(p=>p.id !== placeId);

	res.status(200).json({message:'Deleted Place'});
}

exports.getPlacesById = getPlacesById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlace = createPlace;
exports.updatePlace = updatePlace;
exports.deletePlace = deletePlace;