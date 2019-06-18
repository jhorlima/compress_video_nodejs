const fs = require("fs");
const path = require("path");
const program = require("commander");
const jsonToCsv = require("./utils/json_to_csv");
const sizeFileMb = require("./utils/size_file_mb");
const compressVideo = require("./utils/compress_video");
const discoverVideos = require("./utils/discover_videos");

program.command("input <input>")
    .option("-c, --codec <codec>", "output codec", "265")
    .option("-o, --output", "output directory")
    .option("-r, --resolution <resolution>", "output resolution", "640x?")
    .action(async (input, cmd) => {
        try {
            const results = [];
            const videos = await discoverVideos(input);
            const outputPath = cmd.output ? (!path.extname(cmd.output) ? path.dirname(cmd.output) : cmd.output) : path.join((!path.extname(input) ? path.dirname(input) : input), cmd.codec);

            if (!fs.existsSync(outputPath)) {
                fs.mkdirSync(outputPath, {recursive: true});
            }

            for (const video of videos) {
                try {
                    const originalSize = sizeFileMb(video);
                    const newVideo = await compressVideo(video, outputPath, cmd.codec, cmd.resolution);
                    const compressedSize = sizeFileMb(newVideo.filename);
                    const decreaseSize = originalSize - compressedSize;
                    const percentageChange = ((decreaseSize / originalSize) * 100).toFixed(2);
                    results.push({
                        "original_size": originalSize,
                        "compressed_size": compressedSize,
                        "percentage_change": percentageChange,
                        "video_file": newVideo.filename,
                        "duration": newVideo.duration,
                        "format_name": newVideo.format_name,
                    });
                    console.log("\x1b[32m", `Original size: ${originalSize}mb. Compressed size: ${compressedSize}mb. Decreased ${percentageChange}%`);
                } catch (e) {
                    console.log("\x1b[31m", e);
                }
            }

            if (!results.length) {
                throw new Error("No video was compressed!");
            }

            console.log("");

            jsonToCsv(results, path.join(outputPath, `${Date.now()}_results.csv`));

            console.log("");

            const resultPercentage = results.map((result) => result["percentage_change"]);

            const maxDecreased = Math.max.apply(null, resultPercentage);
            const minDecreased = Math.min.apply(null, resultPercentage);

            const bestResult = results.find((result) => result["percentage_change"] == maxDecreased);
            const worstResult = results.find((result) => result["percentage_change"] == minDecreased);

            console.log("");

            console.log("\x1b[36m", `Best Result: ${bestResult["video_file"]}.`);
            console.log("\x1b[36m", `Original Size: ${bestResult["original_size"]}mb.`);
            console.log("\x1b[36m", `Compressed Size: ${bestResult["compressed_size"]}mb.`);
            console.log("\x1b[36m", `Percentage Change Size: ${bestResult["percentage_change"]}%.`);

            console.log("");

            console.log("\x1b[33m", `Worst Result: ${worstResult["video_file"]}.`);
            console.log("\x1b[33m", `Original Size: ${worstResult["original_size"]}mb.`);
            console.log("\x1b[33m", `Compressed Size: ${worstResult["compressed_size"]}mb.`);
            console.log("\x1b[33m", `Percentage Change Size: ${worstResult["percentage_change"]}%.`);

        } catch (e) {
            console.error("\x1b[31m", e.message);
        }
    });

program.on("--help", () => {
    console.log("");
    console.log("Exemplos:");
    console.log("* Comprimir vídeos em h.265:");
    console.log("  $ node index.js input /var/tmp/videos -c 265");
    console.log("  $ node index.js input /var/tmp/videos -c 264");
    console.log("  $ node index.js input /var/tmp/videos -c 264 -r 640x?");
    console.log("  $ node index.js input /var/tmp/videos -c 264 -o /var/tmp/videos_compressed/");
});

program.parse(process.argv);