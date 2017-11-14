import express      from 'express';
import path         from 'path';
import bodyParser   from 'body-parser';
import puppeteer    from 'puppeteer';
import config from './config';
import downloadTenSongs from './download';

//scraping function
const PORT = process.env.PORT || 3001;
const app = express();

// Serve static assets
app.use(express.static(path.resolve(__dirname, '..', 'public')));
app.use(bodyParser());
app.use(bodyParser.json());

app.use(bodyParser.urlencoded({extended: true}));

let scrapFunc = () => {

    let startScraping = async() => {
        const browser = await puppeteer.launch({
            headless: false,
            slowMo: 5,
        });
        const page = await browser.newPage();
        await page.goto(config.link);
        await page.focus('input[name="email"]');
        await page.type('input[name="email"]', config.login);
        await page.focus('input[name="pass"]');
        await page.type('input[name="pass"]', config.pass);
        await page.click('.wide_button');
        await page.waitFor(3000);

        console.log('Song searching was started...wait.');
        const scrollPage = await page.evaluate(() => {
                return new Promise((resolve) => {
                    scrollWindowToBottom = () => {
                        if (window.scrollTop() + window.outerHeight < document.body.clientHeight) {
                            window.scrollTo(0, document.body.scrollHeight);
                            setTimeout(function () {
                                scrollWindowToBottom()
                            }, 1500);
                        } else {
                                let result = () => {
                                    let allSongs = document.querySelectorAll('.audios_list .audio_item:not(.audio_item_disabled) .ai_body'),
                                        allSongsLen = allSongs.length,
                                        array = [];

                                    for (let i = 0; i <= allSongsLen - 1; i++) {
                                        let song = {
                                            name: allSongs[i].childNodes[1].children[0].innerText.slice(0, 50).trim().replace("/", ''),
                                            artist: allSongs[i].childNodes[1].children[2].innerText.slice(0, 50).trim().replace("/", ''),
                                            url: allSongs[i].childNodes[2].value
                                        };
                                        array.push(song);
                                    }
                                    return {array}
                                };
                                let songArray = result();
                                resolve(songArray.array)
                        }
                    };
                    scrollWindowToBottom()
                });
            });
        return scrollPage;
    };
    startScraping().then((array) => {
        let totalSongsLen = array.length,
            index = 0,
            temporaryLen = totalSongsLen < 10 ? totalSongsLen : 10;

        console.log(totalSongsLen, ' songs were found');

        //start downloading
        downloadTenSongs(array, index, totalSongsLen, temporaryLen);
    });
};

module.exports = scrapFunc;

//server

app.listen(PORT, () => {
    console.log(`Server listening on: ${PORT}`);
});


