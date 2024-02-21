const mongoose = require('mongoose');

async function main() {
  await mongoose.connect(process.env.MONGODB_URL);
}

main().catch(err => console.log(err));

