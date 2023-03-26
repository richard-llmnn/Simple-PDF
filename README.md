# Simple-PDF
> Simple-PDF provides an easy and secure way to manage PDF files directly in your browser.  
> You can merge PDF files, reorder and resize pages, insert images on any device in 5 languages.  

Use it here now in English, German, French, Russian or Chinese: [https://richard-llmnn.github.io/Simple-PDF](https://richard-llmnn.github.io/Simple-PDF)

![](docu/example.gif)

It is written in JavaScript and utilizes [pdf.js](https://mozilla.github.io/pdf.js/) and [pdf-lib](https://pdf-lib.js.org/).

## Developer Info
| Command            | Documentation                                                              |
|--------------------|----------------------------------------------------------------------------|
| npm run build-dev  | Bundle the program with webpack in dev mode (sourcemaps, not minified, ...) |
| npm run build-prod | Bundle the program with webpack in prod mode (minified, ...)               |
| npm run serve      | Serve the program with webpacks webserver (automatic rebuilding)           |
| npm run format     | Format source files in `src/` directory with prettier                      |
| npm run deploy     | Deploy current version of branch `master` to github pages                  |

### Update Github-Pages:

1. Checkout to branch `master` and pull the latest version
2. Set new version in `package.json` file
3. Run `npm install`
2. Commit and push updated `package.json` and `package.lock` file
3. Run `npm run deploy`

## Used Libraries
- https://getbootstrap.com/docs/5.0/getting-started/introduction/
- https://mozilla.github.io/pdf.js/
- https://github.com/Hopding/pdf-lib 
- https://www.dropzone.dev/js/  
- https://shopify.github.io/draggable/
