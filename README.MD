#### COMPRESS VIDEO NODEJS

### Examples:
```bash
$ node index --help      

Usage: index [options] [command]

Options:
  -h, --help               output usage information

Commands:
  input [options] <input>

$ node index input /Users/user/videos
$ node index.js input /var/tmp/videos -c 265
$ node index.js input /var/tmp/videos -c 264
$ node index.js input /var/tmp/videos -c 264 -r 640x?
$ node index.js input /var/tmp/videos -c 264 -o /var/tmp/videos_compressed/

$ node index input --help

Usage: input [options] <input>

Options:
  -c, --codec <codec>            output codec (default: "265")
  -o, --output                   output directory
  -r, --resolution <resolution>  output resolution (default: "640x?")
  -h, --help                     output usage information
```