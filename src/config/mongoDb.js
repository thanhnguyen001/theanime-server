
const mongoose = require('mongoose');

const connect = async () => {
    const url = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.h0o6c.mongodb.net/mern-movies?retryWrites=true&w=majority`;
    try {
        mongoose.connect(
            url,
            {
                useNewUrlParser: true,
                useUnifiedTopology: true
            });

        console.log('MongoDB connected')
    } catch (error) {
        console.log(error);
        process.exit(1);
    }
}

module.exports = { connect };