/***
 * @Author Jhordan Lima <jhordan.lima@niduu.com>
 * @Company Niduu
 * @Year 2019
 *
 * **/

const fs = require("fs");
const path = require("path");

const allowedExtensions = [".mp4"];

module.exports = async (dir) => {

    const stat = fs.lstatSync(dir);
    const files = [];

    if (stat.isFile()) {
        files.push(dir);
    } else {
        fs.readdirSync(dir).filter((file) => {
            return !!path.extname(file);
        }).forEach((file) => {
            files.push(path.join(dir, file));
        });
    }

    const videos = files.filter((file) => {
        return allowedExtensions.indexOf(path.extname(file)) > -1;
    });

    if (videos.length === 0) {
        throw new Error("There are no videos to be compressed!");
    }

    return videos.map((video) => path.normalize(video));

};