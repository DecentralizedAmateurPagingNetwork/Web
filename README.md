# DAPNET Web
The default DAPNET Web-frontend.
Written in the [Vue.js](https://github.com/vuejs/vue) framework and built using [webpack](https://github.com/webpack/webpack).

## Requirements
* Installed packages: `git`, `nodejs`, `npm`
	* You should install a current Node.js version (e.g. v6 LTS) by following [these instructions](https://nodejs.org/en/download/package-manager/)
	* This process will also install the `npm` binary
	* Be advised that most linux distributions ship an older version of Node.js which will not work correctly
* A running webserver (e.g. apache2, nginx, lighttpd, etc.)
* A running [DAPNET Core](https://github.com/DecentralizedAmateurPagingNetwork/Core) with a reachable REST-interface

## Installation
1. Download the repository: `git clone https://github.com/DecentralizedAmateurPagingNetwork/Web.git`
2. Checkout a specific tag: `git checkout tags/v2.0.0`
	* This is highly recommended for improved stability and a consistent user experience
3. Change the default url-settings in `src/store/defaultUrls.json`
4. Change the default custom text (displayed on the home page) in `src/store/defaultText.json`
	* You may use HTML markup here
5. Change the default map-settings in `src/store/defaultMap.json`
6. (Optional) Edit `static/js/custom.js` and insert your custom javascript code (e.g. a Piwik tracking code)
	* You may use jQuery here
7. Download all dependencies: `npm install --only=prod`
8. Test your setup: `npm run dev`
	* Open your browser at `http://localhost:8081` and check that each of your customizations was successful
9. Generate the production build: `npm run build`
10. Copy your freshly generated files from `dist/` into your webserver's `htdocs/` directory
11. Done!

### Deployment into a subdirectory
It is recommended to serve the DAPNET Web module from its own sub-domain.
If you really need to use a sub-directory, make sure to edit `config/index.js` and adapt the content of line 11 (`publicPath`).
Now run `npm run build` again and the page should be rendered correctly.

## Updating
Before updating make sure to read the changelog and to backup your customized files (see above)!

1. Update your local repository: `git fetch`
2. Run through step 2 of the installation process
3. Make sure that your changes in the files listed in steps 3. to 6. of the installation process are still in place
4. Run through steps 7. to 10. of the installation process
5. Done!

## Changelog
A list of changes is always available on the [Releases](https://github.com/DecentralizedAmateurPagingNetwork/Web/releases)-page.

### Create Changelog
```bash
git log v2.0.0...v2.0.1 --pretty=format:'* %s - %h'
```

## Directories
```
├── build          -> webpack build files
├── config         -> webpack build config
├── dist           -> generated webapp (after "npm run build")
├── src            -> the webapp's source code
│   ├── assets     -> assets (css, images, etc.) which will be processed by webpack
│   ├── components -> all vue-components (all pages with their template, javascript and css)
│   ├── global     -> global methods used by many components
│   ├── router     -> vue-router configuration
│   └── store      -> user-data store with its default values
└── static         -> assets (css, images, etc.) which will not be processed by webpack
```
