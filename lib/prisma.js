const { PrismaClient } = require("../generated/prisma/index.js");

//global singleton
if (!global.prisma) {
  global.prisma = new PrismaClient();
  
  // Graceful shutdown
  process.on('beforeExit', async () => {
    await global.prisma.$disconnect();
  });
}

module.exports = global.prisma;