# DAPNET Web

## Installation
* Copy `index.html`, `config.json` and `assets/` into your webserver's root-path.
* Adjust `config.json` inside your webserver's root path.
* Adjust `assets/js/custom.js` to run custom (analytics-)scripts (optional).
* Done.

## Translations
* Translations are stored inside `assets/langs/` and use a simple Key-Value-format.  
* `languages.json` contains a list of all available languages.
* Some translation-files are simple links to other translation-files to prevent duplicate content.

### Add your own Translation
* Copy one of the available translation-files
* Name it accordingly to the new language
* Translate the values inside the file
* Create symbolic links to this file (if necessary)
* Add the new language-code inside `languages.json`

## Changelog

### Create Changelog
```bash
git log v1.0.4...v1.0.5 --pretty=format:'* %s - %h'
```

## Used Software
* [Bootstrap](https://getbootstrap.com) (MIT) / [Bootswatch](https://bootswatch.com) (MIT)
* [Chart.js](https://github.com/chartjs/Chart.js) (MIT)
* [Chosen](https://github.com/harvesthq/chosen) (MIT)
* [DataTables](https://github.com/DataTables/DataTables) (MIT)
* [Font Awesome](https://fortawesome.github.io/Font-Awesome) (SIL OFL 1.1 / MIT)
* [jQuery](https://jquery.com) (MIT)
* [jQuery.i18n.properties](https://github.com/jquery-i18n-properties/jquery-i18n-properties) (MIT)
* [js-cookie](https://github.com/js-cookie/js-cookie) (MIT)
* [Leaflet](http://leafletjs.com) (2-clause BSD License)
* [SweetAlert2](https://github.com/limonte/sweetalert2) (MIT)
