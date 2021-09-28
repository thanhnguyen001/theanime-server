const corsAnywhere = require("cors-anywhere");

const { LIMIT } = require("../../constants");
const Anime = require("../models/Anime");
const { pageToPagination } = require("../../utils");
const handleErrors = require('../../errors/errors');

let proxy = corsAnywhere.createServer({
    originWhitelist: [],
    requireHeaders: [],
    removeHeaders: [],
    setHeaders: {
        referer: "https://vuighe.net/",
    },
});

class AnimeController {

    // [GET] /api/v1/slide 
    async getSlide(req, res, next) {
        try {
            const slideList = await Anime.getSlide();

            res.json({ success: true, data: slideList });
        } catch (err) {
            handleErrors(req, res, 401, 'Not found');
        }
    }

    // [GET] /api/v1/slide 
    async getPicked(req, res, next) {
        try {
            const slideList = await Anime.scrapePicked();

            res.json({ success: true, data: slideList });
        } catch (err) {
            handleErrors(req, res, 401, err.message);
        }
    }

    //[GET] api/v1/rank/:slug
    async getRanking(req, res, next) {
        try {
            const { slug } = req.params;
            const rankList = await Anime.scrapeRanking(slug);

            res.json({ success: true, data: rankList});

        } catch (error) {
            handleErrors(req, res, 401, 'Not found');
        }
    }
    // [GET] api/v1/anime/:slug
    async getGenre(req, res, next) {
        try {
            const { slug } = req.params;
            const { page = 1, limit } = req.query;
            let genreList = await Anime.scrapeGenre(slug, page);
            
            const maxPage = Math.ceil(Number.parseInt(genreList.total) / 24);
            if (page > maxPage) {
                genreList = await Anime.scrapeGenre(slug, maxPage);
            }
            
            res.json({ success: true, data: genreList });
        } catch (error) {
            handleErrors(req, res, 401, 'Not Found')
        }
    }
    // [GET] api/v1/:name
    async getInfo(req, res, next) {
        try {
            const { animeName } = req.params;
 
            const infoAnime = await Anime.scrapeInfo(animeName);

            res.json({ success: true, data: infoAnime });
        } catch (error) {
            handleErrors(req, res, 401, error.message)
        }
    }
    //[GET] api/v1/search?q=q&limit=12
    async searchInForm(req, res, next) {
        try {
            const { q, limit } = req.query;
            const listSearch = await Anime.searchInForm(q, limit);

            res.json({ success: true, data: listSearch });
        } catch (err) {
            handleErrors(req, res, 404, err.message)
        }
    }
    // [GET] api/v1/watch/:animeId
    async getEpisodes(req, res, next) {
        try {
            const { animeId } = req.params;
            const episodes = await Anime.scrapeEpisodes(animeId);

            res.json({ success: true, data: episodes });
        } catch (error) {
            handleErrors(req, res, 404, 'Not found data');
        }
    }
    // [GET] api/v1/watch/:animeId/:episodeIndex
    async getEpisode(req, res, next) {
        try {
            const { animeId, episodeIndex } = req.params;
            const episode = await Anime.scrapeEpisode(animeId, episodeIndex);

            res.json({ success: true, data: episode });
        } catch (error) {
            handleErrors(req, res, 404, 'Not found data');
        }
    }
    // [GET] api/v1/update
    async getUpdate(req, res, next) {
        try {
            const data = await Anime.scrapeUpdate();

            res.json({ success: true, data });
        } catch (error) {
            handleErrors(req, res, 404, 'Not found data');
        }
    }

    async corsAnywhere(req, res, next) {
        req.url = req.url.replace("/cors/", "/");
        proxy.emit("request", req, res);
    }
}



module.exports = new AnimeController;