import { PrismaClient } from "../generated/prisma/index.mjs";

let prisma;

if (!global.prisma) {
  global.prisma = new PrismaClient();
}

prisma = global.prisma;

export default prisma;