import bcrypt from "bcrypt";

  const hashPassword = async (password) => {
    return await bcrypt.hash(password, 12);
  };
  

  const verifyPassword = async (password, hashedPassword) => {
    return await bcrypt.compare(password, hashedPassword);
};

export {
    hashPassword,
    verifyPassword
  };