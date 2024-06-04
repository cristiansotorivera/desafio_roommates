// Importing necessary modules from 'path' and 'fs/promises'
import path from 'path';
import { readFile, writeFile } from 'fs/promises';
import axios from 'axios';

// Importing the __dirname variable using import.meta
const __dirname = import.meta.dirname;

// Function to get the list of roommates
const getRoommates = async (req, res) => {
    try {
        // Reading the data from roommates.json file
        const data = await readFile(path.join(__dirname, '../data/roommates.json'), 'utf-8');
        // Parsing the JSON data into an object
        const roommates = JSON.parse(data);
        // Sending the parsed data as JSON response
        res.json(roommates);
    } catch (error) {
        // Logging the error message to the console
        console.error('Error de servidor :', error);
        // Sending a 500 status code with an error message
        res.status(500).json({ error: 'Error de servidor', message: error.message });
    }
};

// Function to add a new roommate
const postRoommate = async (req, res) => {
    try {
        // Fetching random user data from the API
        const { data } = await axios('https://randomuser.me/api');
        // Creating a new user object with the fetched data
        const newUser = {
            nombre: data.results[0].name.first,
            debe: 0,
            recibe: 0
        };
        // Reading the existing roommates data from the JSON file
        const getroommates = await readFile(path.join(__dirname, '../data/roommates.json'), 'utf-8');
        // Parsing the JSON data into an object
        const roommates = JSON.parse(getroommates);
        // Adding the new user to the roommates array
        roommates.roommates.push(newUser);
        // Writing the updated roommates data back to the JSON file
        await writeFile(path.join(__dirname, '../data/roommates.json'), JSON.stringify(roommates));
        // Sending the updated roommates data as JSON response
        res.json(roommates);
    } catch (error) {
        // Logging the error message to the console
        console.error('Error de servidor', error);
        // Sending a 500 status code with an error message
        res.status(500).json({ error: 'Error de servidor', message: error.message });
    }
};

// Exporting the controller functions
export const controllerRoommate = {
    getRoommates,
    postRoommate
};
