// Import necessary modules from 'fs/promises' and 'path'
import { readFile, writeFile } from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

// Import the __dirname variable using import.meta
const __dirname = import.meta.dirname;

// Function to get the list of expenses
const getGastos = async (req, res) => {
    try {
        // Read the data from gastos.json file
        const data = await readFile(path.join(__dirname, '../data/gastos.json'), 'utf-8');
        // Parse the JSON data into an object
        const gastos = JSON.parse(data);
        // Send the parsed data as JSON response
        res.json(gastos);
    } catch (error) {
        // Log the error message to the console
        console.log(error);
    }
};

// Function to add a new expense
const postGastos = async (req, res) => {
    try {
        // Destructure the request body
        const { roommate, descripcion, monto } = req.body;

        // Validate the input data
        if (!roommate || !descripcion || !monto || !roommate.trim() || !descripcion.trim()) {
            return res.status(400).json({ error: 'Completar todos los campos.' });
        }

        // Generate a unique ID for the new expense
        const id = uuidv4().slice(0, 3);
        const newGasto = {
            id: id,
            roommate: roommate,
            descripcion: descripcion,
            monto: monto
        };

        // Read the existing roommates data from the JSON file
        const getRoommates = await readFile(path.join(__dirname, '../data/roommates.json'), 'utf-8');
        const roommates = JSON.parse(getRoommates);

        // Read the existing expenses data from the JSON file
        const getGastos = await readFile(path.join(__dirname, '../data/gastos.json'), 'utf-8');
        const gastos = JSON.parse(getGastos);

        // Calculate the amount each roommate should pay/receive
        const amountPerRoommate = monto / roommates.roommates.length;

        // Update the balance for each roommate
        roommates.roommates.forEach(r => {
            if (r.nombre === roommate) {
                r.recibe += monto - amountPerRoommate;
            } else {
                r.debe += amountPerRoommate;
            }
        });

        // Write the updated roommates data back to the JSON file
        await writeFile(path.join(__dirname, '../data/roommates.json'), JSON.stringify(roommates));

        // Add the new expense to the expenses list and write it back to the JSON file
        gastos.gastos.push(newGasto);
        await writeFile(path.join(__dirname, '../data/gastos.json'), JSON.stringify(gastos));

        // Send the updated expenses data as JSON response
        res.json(gastos);
    } catch (error) {
        // Log the error message to the console
        console.error('Error al agregar un nuevo gasto:', error);
        // Send a 500 status code with an error message
        res.status(500).json({ error: 'Error de servidor', message: error.message });
    }
};

// Function to remove an expense
const removeGastos = async (req, res) => {
    try {
        // Get the ID of the expense to be removed from the query parameters
        const { id } = req.query;

        // Read the existing roommates data from the JSON file
        const getRoommates = await readFile(path.join(__dirname, '../data/roommates.json'), 'utf-8');
        const roommates = JSON.parse(getRoommates);

        // Read the existing expenses data from the JSON file
        const getGastos = await readFile(path.join(__dirname, '../data/gastos.json'), 'utf-8');
        const gastos = JSON.parse(getGastos);

        // Find the index of the expense to be removed
        const gastoIndex = gastos.gastos.findIndex(g => g.id === id);
        const monto = gastos.gastos[gastoIndex].monto;
        const roommate = gastos.gastos[gastoIndex].roommate;

        // Calculate the amount each roommate should pay/receive
        const amountPerRoommate = monto / roommates.roommates.length;

        // Update the balance for each roommate
        roommates.roommates.forEach(r => {
            if (r.nombre === roommate) {
                r.recibe -= monto - amountPerRoommate;
            } else {
                r.debe -= amountPerRoommate;
            }
        });

        // Remove the expense from the expenses list
        gastos.gastos.splice(gastoIndex, 1);

        // Write the updated roommates data back to the JSON file
        await writeFile(path.join(__dirname, '../data/roommates.json'), JSON.stringify(roommates));
        // Write the updated expenses data back to the JSON file
        await writeFile(path.join(__dirname, '../data/gastos.json'), JSON.stringify(gastos));

        // Send the updated roommates and expenses data as JSON response
        res.json({ roommates, gastos });
    } catch (error) {
        // Log the error message to the console
        console.error('Error al eliminar un gasto:', error);
        // Send a 500 status code with an error message
        res.status(500).json({ error: 'Error de Servidor', message: error.message });
    }
};

// Function to edit an expense
const putGastos = async (req, res) => {
    try {
        // Get the ID of the expense to be edited from the query parameters
        const { id } = req.query;
        // Destructure the request body
        const { roommate, descripcion, monto } = req.body;

        // Validate the input data
        if (!roommate || !descripcion || !monto || !roommate.trim() || !descripcion.trim() || typeof monto !== 'number' || monto <= 0) {
            return res.status(400).json({ error: 'Completar todos los campos.' });
        }

        // Read the existing roommates data from the JSON file
        const getRoommates = await readFile(path.join(__dirname, '../data/roommates.json'), 'utf-8');
        const roommates = JSON.parse(getRoommates);

        // Read the existing expenses data from the JSON file
        const getGastos = await readFile(path.join(__dirname, '../data/gastos.json'), 'utf-8');
        const gastos = JSON.parse(getGastos);

        // Find the index of the expense to be edited
        const gastoIndex = gastos.gastos.findIndex(g => g.id === id);
        const oldMonto = gastos.gastos[gastoIndex].monto;
        const oldRoommate = gastos.gastos[gastoIndex].roommate;

        // Calculate the old and new amount each roommate should pay/receive
        const oldCountPorRoommate = oldMonto / roommates.roommates.length;
        const newCountPorRoommate = monto / roommates.roommates.length;

        // Update the balance for each roommate
        roommates.roommates.forEach(r => {
            if (r.nombre === oldRoommate) {
                r.recibe -= oldMonto - oldCountPorRoommate;
            } else {
                r.debe -= oldCountPorRoommate;
            }

            if (r.nombre === roommate.trim()) {
                r.recibe += monto - newCountPorRoommate;
            } else {
                r.debe += newCountPorRoommate;
            }
        });

        // Update the expense with the new data
        gastos.gastos[gastoIndex].roommate = roommate.trim();
        gastos.gastos[gastoIndex].descripcion = descripcion.trim();
        gastos.gastos[gastoIndex].monto = monto;

        // Write the updated roommates data back to the JSON file
        await writeFile(path.join(__dirname, '../data/roommates.json'), JSON.stringify(roommates));
        // Write the updated expenses data back to the JSON file
        await writeFile(path.join(__dirname, '../data/gastos.json'), JSON.stringify(gastos));

        // Send the updated roommates and expenses data as JSON response
        res.json({ roommates, gastos });
    } catch (error) {
        // Log the error message to the console
        console.error('Error al editar:', error);
        // Send a 500 status code with an error message
        res.status(500).json({ error: 'Error de servidor', message: error.message });
    }
};

// Export the controller functions
export const controllerGastos = {
    getGastos,
    postGastos,
    removeGastos,
    putGastos
};
