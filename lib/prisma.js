const { PrismaClient } = require("../generated/prisma/index.js");

let prisma;

if (!global.prisma) {
  global.prisma = new PrismaClient();
}
prisma = global.prisma;
module.exports = prisma;