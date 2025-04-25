const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Helper to extract and verify token
const verifyToken = (req) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new Error("Token missing");
  }
  const token = authHeader.split(" ")[1];
  return jwt.verify(token, process.env.JWT_SECRET);
};

// Generic authentication middleware
const authenticateUser = (req, res, next) => {
  try {
    const decoded = verifyToken(req);
    req.user = decoded;
    req.userId = decoded.userId;
    req.role = decoded.role;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Unauthorized or invalid token" });
  }
};

// Role-based middleware: Hall Manager
const authenticateHallManager = async (req, res, next) => {
  try {
    const decoded = verifyToken(req);
    const user = await prisma.user.findUnique({
      where: { email: decoded.email },
    });

    if (!user || user.role !== "manager") {
      return res
        .status(403)
        .json({ message: "Access denied: Hall Manager only" });
    }

    req.user = user;
    req.userId = user.userId;
    req.role = user.role;
    next();
  } catch (err) {
    console.error("Auth error:", err.message);
    return res.status(401).json({ message: "Unauthorized or invalid token" });
  }
};

// Role-based middleware: Admin only
const authenticateAdmin = async (req, res, next) => {
  try {
    const decoded = verifyToken(req);
    const user = await prisma.user.findUnique({
      where: { email: decoded.email },
    });

    if (!user || user.role !== "admin") {
      return res.status(403).json({ message: "Access denied: Admin only" });
    }

    req.user = user;
    req.userId = user.userId;
    req.role = user.role;
    next();
  } catch (err) {
    console.error("Auth error:", err.message);
    return res.status(401).json({ message: "Unauthorized or invalid token" });
  }
};

const verifyHallOwnership = async (req, res, next) => {
  try {
    const hallId = req.params.id;
    const hall = await prisma.hall.findUnique({ where: { hallId } });

    if (!hall) {
      return res.status(404).json({ message: "Hall not found" });
    }

    if (hall.userId !== req.user.userId) {
      return res
        .status(403)
        .json({ message: "Access denied: You do not own this hall" });
    }

    // If passed
    next();
  } catch (err) {
    console.error("Ownership check error:", err.message);
    return res.status(500).json({ message: "Error verifying hall ownership" });
  }
};

module.exports = {
  authenticateUser,
  authenticateHallManager,
  authenticateAdmin,
  verifyHallOwnership,
};
