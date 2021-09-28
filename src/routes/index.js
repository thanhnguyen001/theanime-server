
const userRouter = require('./userRouter');
const animeRouter = require('./animeRouter');
const commentRouter = require('./commentRouter');

const routes = (app) => {

    // User
    app.use('/api/v1/user', userRouter);
    // Comment
    app.use('/api/v1/comment', commentRouter)
    //Home
    app.use('/api/v1', animeRouter);
}

module.exports = routes;