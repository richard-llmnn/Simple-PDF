# Simple-PDF
> Simple-PDF provides an easy and secure way to manage PDF files directly in your browser.  
> You can merge PDF files, reorder and resize pages, insert images on any device in 5 languages.  

Use it here now in English, German, French, Russian or Chinese: [https://richard-llmnn.github.io/Simple-PDF](https://richard-llmnn.github.io/Simple-PDF)

![](docu/example.gif)

It is written in JavaScript and utilizes [pdf.js](https://mozilla.github.io/pdf.js/) and [pdf-lib](https://pdf-lib.js.org/).

## Developer Info
| Command            | Documentation                                                              |
|--------------------|----------------------------------------------------------------------------|
| bun run build:dev  | Bundle the program with bun in dev mode (sourcemaps, not minified, ...)    |
| bun run build:prod | Bundle the program with bun in prod mode (minified, ...)                   |
| bun run serve      | Serve the program with bun's dev server and HMR                            |
| bun run format     | Format source files in `src/` directory with prettier                      |
| bun run deploy     | Deploy current version of branch `master` to github pages                  |

### Update Github-Pages:

1. Checkout to branch `master` and pull the latest version
2. Set new version in `package.json` file
3. Run `bun install`
4. Commit and push updated `package.json` and `bun.lock` file
5. Run `git tag "[package.json verion here]"` and then `git push --tags`
6. Run `bun run deploy`

## Used Libraries
- https://getbootstrap.com/docs/5.0/getting-started/introduction/
- https://mozilla.github.io/pdf.js/
- https://github.com/Hopding/pdf-lib 
- https://www.dropzone.dev/js/  
- https://shopify.github.io/draggable/
