const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const createAmenity = async (req, res) => {
  try {
    const { name, description } = req.body;
    const amenity = await prisma.amenity.create({
      data: { name, description },
    });
    res.status(200).json(amenity);
  } catch (err) {
    res
      .status(500)
      .json({ error: "Error creating amenity", details: err.message });
  }
};

const getAllAmenities = async (req, res) => {
  try {
    const amenities = await prisma.amenity.findMany();
    res.json(amenities);
  } catch (err) {
    res
      .status(500)
      .json({ error: "Error fetching amenities", details: err.message });
  }
};

const getAmenityById = async (req, res) => {
  try {
    const amenity = await prisma.amenity.findUnique({
      where: { amenityId: req.params.id },
    });
    if (!amenity) {
      return res.status(404).json({ error: "Amenity not found" });
    }
    res.json(amenity);
  } catch (err) {
    res
      .status(500)
      .json({ error: "Error fetching amenity", details: err.message });
  }
};

const updateAmenity = async (req, res) => {
  try {
    const { name, description } = req.body;
    const amenity = await prisma.amenity.update({
      where: { amenityId: req.params.id },
      data: { name, description },
    });
    res.json(amenity);
  } catch (err) {
    res
      .status(500)
      .json({ error: "Error updating amenity", details: err.message });
  }
};

const deleteAmenity = async (req, res) => {
  try {
    await prisma.amenity.delete({ where: { amenityId: req.params.id } });
    res.json({ message: "Amenity deleted successfully" });
  } catch (err) {
    res
      .status(500)
      .json({ error: "Error deleting amenity", details: err.message });
  }
};

module.exports = {
  createAmenity,
  getAllAmenities,
  getAmenityById,
  updateAmenity,
  deleteAmenity,
};
