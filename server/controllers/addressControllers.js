const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get all addresses
const getAllAddresses = async (req, res) => {
    try {
        const addresses = await prisma.address.findMany();
        res.json(addresses);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching addresses', details: error.message });
    }
};

// Get address by ID
const getAddressById = async (req, res) => {
    try {
        const address = await prisma.address.findUnique({
            where: { addressId: req.params.id },
        });
        if (!address) {
            return res.status(404).json({ error: 'Address not found' });
        }
        res.json(address);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching address', details: error.message });
    }
};

// Create a new address
const createAddress = async (req, res) => {
    try {
        const { addressLine, city, state, country } = req.body;

        const newAddress = await prisma.address.create({
            data: {
                addressLine,
                city,
                state,
                country,
            },
        });

        res.status(200).json({ newAddress, message: "Address added successfully" });
    } catch (error) {
        res.status(500).json({ error: 'Error creating address', details: error.message });
    }
};

// Update address
const updateAddress = async (req, res) => {
    try {
        const { addressLine, city, state, country } = req.body;

        const existingAddress = await prisma.address.findUnique({
            where: { addressId: req.params.id },
        });

        if (!existingAddress) {
            return res.status(404).json({ error: 'Address not found' });
        }

        const updatedAddress = await prisma.address.update({
            where: { addressId: req.params.id },
            data: {
                addressLine,
                city,
                state,
                country,
            },
        });

        res.json(updatedAddress);
    } catch (error) {
        res.status(500).json({ error: 'Error updating address', details: error.message });
    }
};

// Delete address
const deleteAddress = async (req, res) => {
    try {
        const existingAddress = await prisma.address.findUnique({
            where: { addressId: req.params.id },
        });

        if (!existingAddress) {
            return res.status(404).json({ error: 'Address not found' });
        }

        await prisma.address.delete({
            where: { addressId: req.params.id },
        });

        res.json({ message: 'Address deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Error deleting address', details: error.message });
    }
};

module.exports = {
    getAllAddresses,
    getAddressById,
    createAddress,
    updateAddress,
    deleteAddress,
};
