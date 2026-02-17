import bcrypt from "bcrypt";

const password = "123456"; // ganti dengan password yang mau kamu pakai

async function generate() {
  const hash = await bcrypt.hash(password, 10);
  console.log("Password Asli :", password);
  console.log("Password Hash :", hash);
}

generate();
