# DAPNET Web
The default DAPNET Web-frontend.
Written in the [Vue.js](https://github.com/vuejs/vue) framework and built using [webpack](https://github.com/webpack/webpack).

For further information visit this project's [wiki](https://github.com/DecentralizedAmateurPagingNetwork/Web/wiki).

## Setup using Docker
1. Make sure you have a current installation of Docker on your server
2. Prepare a directory to hold your configuration (e.g. `/srv/dapnet/web/config`) and copy the following files from this repository there:
    * `src/store/config/defaultUrls.json.example` to `defaultUrls.json` and change the default url-settings
    * `src/store/config/defaultText.json.example` to `defaultText.json` and change the default custom text (displayed on the home page)
    * `src/store/config/defaultMap.json.example` to `defaultMap.json` and change the default map-settings
3. Pull the image and run the container while mapping the webserver to port `8080`:
```bash
docker run --name dapnet-web -d -v /srv/dapnet/web/config:/app/src/store/config:ro -p 8080:80 dapnet/web
```
4. You are done. The container will build the website, update the coverage data and publish the website on the specified port

## Setup manually
If you do not want to use the all-in-one Docker image, you are free to follow the [manual installation guide](https://github.com/DecentralizedAmateurPagingNetwork/Web/wiki/Manual-Installation).
