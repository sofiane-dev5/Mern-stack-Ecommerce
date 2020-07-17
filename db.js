const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const db = process.env.MONGO_URI;

const connectDB = async () => {
  try {
    await mongoose.connect(db, {useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false});
    console.log("Mongodb Connected...");
  } catch (err) {
    console.log(err.message);
    process.exit(1);
  }
}

module.exports = connectDB;
