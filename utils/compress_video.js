/***
 * @Author Jhordan Lima <jhordan.lima@niduu.com>
 * @Company Niduu
 * @Year 2019
 *
 * **/

const path = require("path");
const ffmpeg = require("fluent-ffmpeg");
const ffmpegPath = require("@ffmpeg-installer/ffmpeg").path;

const allowedCodecs = ["264", "265"];

ffmpeg.setFfmpegPath(ffmpegPath);

module.exports = async (input, output, codec = "265", resolution = "640x?") => {

    if (allowedCodecs.indexOf(`${codec}`) < 0) {
        throw new Error("Invalid codec!");
    }

    const fileName = path.basename(input);
    const outputPath = path.join(output, fileName);

    return await new Promise((resolve, reject) => {

        try {
            console.log("\x1b[37m", `Processing video "${fileName}".`);
            process.stdout.write("\x1b[37m");

            ffmpeg(input)
                .videoCodec(`libx${codec}`)
                // .size(resolution)
                .audioBitrate("96k")
                .withFpsOutput(25)
                .outputOptions([
                    //Escalar o tamanho do vídeo
                    "-vf",
                    "scale=w=640:h=640:force_original_aspect_ratio=decrease",
                    "-r",
                    "24",
                    // As 3 linhas abaixo servem para tornar o vídeo compatível com mais versões do android.
                    "-level",
                    "3.0",
                    // As 2 linhas abaixo servem para tornar o codec h.265 compatível com ios
                    "-vtag",
                    "hvc1",
                    "-threads 0",
                    "-movflags faststart"
                ])
                .on("end", async () => {
                    process.stdout.write("\n");
                    console.log("\x1b[32m", `Video "${fileName}" successfully compressed!`);
                    ffmpeg.ffprobe(outputPath, (err, metadata) => {
                        if (err) {
                            reject(err);
                        } else {
                            resolve(metadata.format);
                        }
                    });
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