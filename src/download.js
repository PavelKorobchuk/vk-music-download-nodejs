import path         from 'path';
import fs           from 'fs';
import request      from 'request';
import parseUrlSong from './getSongUrl';

const downloadTenSongs = (array, index, totalSongsLen, temporaryLen) => {
    if (index >= totalSongsLen) {
        console.log('Finished!');
    } else {
        let chunkArray = [];
        console.log(temporaryLen, 'songs are being downloaded...');

        for (let i = index; i <= temporaryLen - 1; i++) {
            chunkArray.push(new Promise(function (resolve) {
                let url = parseUrlSong(array[i].url);
                request.get(url).on('response', function (response) {
                    response.pipe(fs.createWriteStream(path.resolve(__dirname + '/download', array[i].name + '-' + array[i].artist + '.mp3')))
                        .on('finish', function () {
                            resolve();
                        });
                })
            }));
            index = i;
        }
        index += 1;

        Promise.all(chunkArray).then(function (data) {
            console.log(index, ' songs was downloaded successfully!');
            temporaryLen = (temporaryLen + 10 >= totalSongsLen) ? totalSongsLen : (temporaryLen += 10);
            downloadTenSongs(array, index, totalSongsLen, temporaryLen);
        })
    }
};

module.exports = downloadTenSongs;