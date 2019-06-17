/***
 * @Author Jhordan Lima <jhordan.lima@niduu.com>
 * @Company Niduu
 * @Year 2019
 *
 * **/

const fs = require("fs");
const path = require("path");
const ffmpeg = require("fluent-ffmpeg");
const ffmpegPath = require("@ffmpeg-installer/ffmpeg").path;

const allowedCodecs = ["264", "265"];

ffmpeg.setFfmpegPath(ffmpegPath);

module.exports = async (input, output, codec = "265", resolution = "640x?") => {

    if (allowedCodecs.indexOf(`${codec}`) < 0) {
        throw new Error("Invalid codec!");
    }

    const filePath = path.dirname(input);
    const fileName = path.basename(input);
    const outputPath = output ? path.join(path.dirname(output), fileName) : path.join(filePath, codec, fileName);
    const outputDirectory = path.dirname(outputPath);

    if (!fs.existsSync(outputDirectory)) {
        fs.mkdirSync(outputDirectory, {recursive: true});
    }

    return await new Promise((resolve, reject) => {

        try {
            console.log("\x1b[37m", `Processing video "${fileName}".`);
            process.stdout.write("\x1b[37m");

            ffmpeg(input)
                .videoCodec(`libx${codec}`)
                .size(resolution)
                .audioBitrate("96k")
                .outputOptions([
                    "-r",
                    "24",
                    // As 3 linhas abaixo servem para tornar o vídeo compatível com mais versões do android.
                    "-level",
                    "3.0",
                    // As 2 linhas abaixo servem para tornar o codec h.265 compatível com ios
                    "-vtag",
                    "hvc1",
                ])
                .on("end", async () => {
                    process.stdout.write("\n");
                    console.log("\x1b[32m", `Video "${fileName}" successfully compressed!`);
                    resolve(outputPath);
                })
                .on("error", err => {
                    console.log("\x1b[31m", `Could not compress video "${fileName}". Error: ${err.message}.`);
                    reject(err);
                })
                .on("progress", progress => {
                    process.stdout.clearLine();
                    process.stdout.cursorTo(1);
                    process.stdout.write(`${progress.percent ? progress.percent.toFixed(2) : 0} % completed.`);
                })
                .save(outputPath);

        } catch (err) {
            reject(err);
        }
    });

};