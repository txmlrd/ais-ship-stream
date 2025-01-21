const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect('mongodb://localhost:27017/aismade', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log(`MongoDB terhubung: ${conn.connection.host}`);
  } catch (err) {
    console.error('Error saat menghubungkan ke MongoDB', err);
    process.exit(1); // Menghentikan aplikasi jika koneksi gagal
  }
};

module.exports = connectDB;
