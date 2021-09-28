const express = require('express');
const router = express.Router();
const verifyToken = require('../app/middleware/auth');
const AnimeController = require('../app/controller/animeController');


router.get('/search', AnimeController.searchInForm);
router.get('/picked', AnimeController.getPicked);
router.get('/update', AnimeController.getUpdate);
router.get('/rank/:slug', AnimeController.getRanking);
router.get('/slide', AnimeController.getSlide);
router.get('/anime/:slug', AnimeController.getGenre);
router.get('/watch/:animeId/episodes/:episodeIndex', AnimeController.getEpisode);
router.get('/watch/:animeId', AnimeController.getEpisodes);
router.get('/cors/:proxyUrl*', AnimeController.corsAnywhere);
router.get('/:animeName', AnimeController.getInfo);

module.exports = router;
