# Simple-PDF
> Simple-PDF provides an easy way to rearrange or merge pdf files.  

![](docu/example.gif)

Simple-PDF can be used through the browser on [https://richard-llmnn.github.io/Simple-PDF](https://richard-llmnn.github.io/Simple-PDF)  
It is written in JavaScript and utilizes [pdf.js](https://mozilla.github.io/pdf.js/) and [pdf-lib](https://pdf-lib.js.org/).

## Developer Info
| Command             | Documentation                                                               |
|---------------------|-----------------------------------------------------------------------------|
| yarn run build-dev  | Bundle the program with webpack in dev mode (sourcemaps, not minified, ...) |
| yarn run build-prod | Bundle the program with webpack in prod mode (minified, ...)                |
| yarn run serve      | Serve the program with webpacks webserver (automatic rebuilding)            |

**Update Github-Pages:**

1. Build the program in production mode
2. Switch to `gh-pages` branch
3. Remove old website files
4. Paste the currently generated files from the `dist` folder to the git-root
5. Commit and push

## Used Libraries
* https://getbootstrap.com/docs/5.0/getting-started/introduction/
* https://mozilla.github.io/pdf.js/
* https://github.com/Hopding/pdf-lib 
* https://www.dropzone.dev/js/  
* https://shopify.github.io/draggable/
