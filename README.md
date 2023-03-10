# Simple-PDF
> Simple-PDF provides an easy and secure way to manage PDF files directly in your browser.  
> You can merge PDF files, reorder pages and insert images on any device.  

Use it here now: [https://richard-llmnn.github.io/Simple-PDF](https://richard-llmnn.github.io/Simple-PDF)

![](docu/example.gif)

It is written in JavaScript and utilizes [pdf.js](https://mozilla.github.io/pdf.js/) and [pdf-lib](https://pdf-lib.js.org/).

## Developer Info
| Command            | Documentation                                                              |
|--------------------|----------------------------------------------------------------------------|
| npm run build-dev  | Bundle the program with webpack in dev mode (sourcemaps, not minified, ...) |
| npm run build-prod | Bundle the program with webpack in prod mode (minified, ...)               |
| npm run serve      | Serve the program with webpacks webserver (automatic rebuilding)           |
| npm run format     | Format source files in `src/` directory with prettier                      |

**Update Github-Pages:**

1. Build the program in branch `master` in mode `production`
2. Switch to `gh-pages` branch
3. Remove old website files
4. Paste the currently generated files from the `dist` folder to the git-root
5. Commit and push

## Used Libraries
- https://getbootstrap.com/docs/5.0/getting-started/introduction/
- https://mozilla.github.io/pdf.js/
- https://github.com/Hopding/pdf-lib 
- https://www.dropzone.dev/js/  
- https://shopify.github.io/draggable/
