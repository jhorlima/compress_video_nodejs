const {Parser} = require("json2csv");
const {createWriteStream} = require("fs");

module.exports = async (videos = [], outputPath) => {
    const fields = [
        "original_size",
        "compressed_size",
        "percentage_change",
        "video_file",
        "duration",
        "format_name",
    ];
    const json2csvParser = new Parser({fields});

    const csv = json2csvParser.parse(videos);
    const output = createWriteStream(outputPath, {encoding: "utf8"});

    output.write(csv);
    output.end();

    console.log("\x1b[33m", `Statistics stored in "${outputPath}".`);

};