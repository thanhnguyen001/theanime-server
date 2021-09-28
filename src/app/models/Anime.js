
const axios = require("axios");
const { JSDOM } = require("jsdom");
const { LIMIT } = require("../../constants");
const { toSlug, encodeString, prettierViews } = require("../../utils");

const instance = axios.create({
    baseURL: process.env.API_URL,
    headers: {
        'Content-Type': 'application/json',
        "X-Requested-With": "XMLHttpRequest",
        Referer: "https://vuighe.net/idoly-pride"
    }
});

const WEBSITE_URL = process.env.WEBSITE_URL;


class Anime {
    static async getSlide() {
        const URL = WEBSITE_URL;
        const { data } = await axios.get(URL);
        const { window } = new JSDOM(data);
        const { document } = window;

        const sliderItems = document.querySelectorAll('.slider-item');

        const list = [...sliderItems].map(item => {
            const thumbnail = item.querySelector(".slider-item-img").dataset.src;
            const title = item.dataset.title;
            const views = item.dataset.views;
            const slug = toSlug(title);

            return { thumbnail, slug, views, name: title };
        });

        return list;
    }

    static async scrapeRanking(slug) {
        // if (!slug) slug = '';
        const { data } = await axios.get(`${WEBSITE_URL}/bang-xep-hang/${slug}`);
        return this.parseList(data);
    }

    static async scrapeGenre(slug, page) {
        let URL = '';
        if (slug === 'all') URL = `${WEBSITE_URL}/anime/trang-${page}`;
        else URL = `${WEBSITE_URL}/anime/${slug}/trang-${page}`;

        const { data } = await axios.get(URL);

        const list = await this.parseList(data);
        const { window } = new JSDOM(data);
        const { document } = window

        const total = document.querySelector('input[name="total-item"]').value;
        // const currentPage = document.querySelector('input[name="current-page"]').value;

        return { total, currentPage: page, data: list };
    }

    static async searchInForm(keyword, limit = LIMIT) {
        const URL = `/search?q=${encodeURIComponent(keyword)}&limit=${limit}`;
        const { data } = await instance.get(URL);
        const list = [...data.data].map(item => {
            const { time, meta, views, ...info } = item;
            const viewsBetter = prettierViews(views);
            const isUpdating = !item.is_movie ? `${meta.max_episode_name}/${time}` : time;

            return { ...info, views: viewsBetter, time: isUpdating };
        })

        return list;
    }
    // Scrape Info Anime 
    static async scrapeInfo(animeName) {
        const { data } = await axios.get(`${WEBSITE_URL}/${animeName}`);
        const { window } = new JSDOM(data);
        const { document } = window;

        const infoElement = document.querySelector('.container.play');
        const { id, name } = infoElement.dataset;

        const genreElements = document.querySelectorAll(".film-info-genre a");
        const genreList = [...genreElements].map(item => {
            const url = item.getAttribute('href');
            const slug = url.split('/')[2];
            const genre = item.textContent;

            return { url, slug, genre };
        });
        const collection = genreList.pop();

        const subTeamElements = document.querySelectorAll('.film-info-subteam a');
        const subTeamList = [...subTeamElements].map(item => {
            return item.textContent;
        });

        const description = document.querySelector('.film-info-description').textContent;
        const episodes = await this.scrapeEpisodes(id);
        
        const list = await this.searchInForm(name);
        const thumbnail = list[0].thumbnail;
        const slug = list[0].slug;
        const time = list[0].time;

        return { id, name, slug, time, thumbnail, genre: genreList, subTeam: subTeamList, description, collection, episodes };

    }

    // Scrape All Episodes
    static async scrapeEpisodes(animeId) {
        const { data } = await instance.get(`/films/${animeId}/episodes?sort=name`);
        const episodes = [...data.data].filter(episode => !episode.special_name);

        return episodes;
    }

    static async scrapeEpisode(animeId, episodeIndex) {
        const episodes = await this.scrapeEpisodes(animeId);
        const episode = episodes[episodeIndex];
        const sources = await this.scrapeSources(animeId, episode.id);

        return { ...episode, sources };
    }
    static async scrapeUpdate() {
        const URL = `${WEBSITE_URL}/tap-moi-nhat`;
        const { data } = await axios.get(URL);
        const list = await this.parseList(data);
        return list;
    }

    // Scrape Sources Video
    static async scrapeSources(animeId, episodeId) {
        const { data } = await instance.get(`/films/${animeId}/episodes/${episodeId}`);

        const CORS_API = process.env.MY_CORS_API || 'localhost:8000/api/v1/cors';

        const sources = data.sources;
        let vSource = 'nothing-in-here'; // nothing-in-here

        if (sources.fb.length > 0) {
            vSource = sources.fb[0].src;
        }
        else if (sources.vip.length > 0) {
            vSource = `${CORS_API}/${sources.vip[0].src}`;
        }
        

        // if (Array.isArray(sources.m3u8) ? !sources.m3u8.length : !sources.m3u8) {
        //     const whitelistKeys = [];

        //     const sourceKey = Object.keys(sources)
        //         .filter(key => !whitelistKeys.includes(key))
        //         .find(key => !!sources[key].length);

        //     let source = sources[sourceKey][0].src;

        //     if (sourceKey === "vip") {
        //         source = `${CORS_API}/${source}`;
        //     }

        //     return {
        //         videoSource: source
        //     };
        // }

        // const m3u8Source = sources.m3u8;
        // const source =
        //     m3u8Source.hls || m3u8Source.sd || m3u8Source[Object.keys(m3u8Source)[0]];

        // const m3u8 = encodeString(source);

        // const m3u8P = m3u8.replace("vdicdn.com", "phim1080.me").split("/")[4];

        // vSource = `https://ima21.xyz/hls/${m3u8P}/playlist.m3u8`;

        return {
            videoSource: vSource
        };


    }

    static async parseList(html) {
        const { window } = new JSDOM(html);
        const { document } = window;

        const traysElements = document.querySelectorAll('.tray-item a');

        const list = [...traysElements].map((item) => {
            const slugURL = item.href.slice(1);
            const thumbnail = item.querySelector('img.tray-item-thumbnail').dataset.src;
            const title = item.querySelector('.tray-item-title').textContent;
            const views = item.querySelector('.tray-film-views')?.textContent;
            const updating = item.querySelector('.tray-film-update')?.textContent.replace(/ /g, "").slice(0, -3);
            const lastEpisodeName = item.querySelector('.tray-episode-name')?.textContent;
            const isCompleted = item.querySelector('.tray-item-complete')?.textContent;

            return { thumbnail, views, name: title, slug: slugURL, updating, lastEpisodeName, isCompleted };

        })

        return list;
    }

    static async scrapePicked() {
        const URL = `${WEBSITE_URL}/hom-nay-xem-gi`;
        const { data } = await axios.get(URL);

        return this.parseList(data)
    }
}

module.exports = Anime;