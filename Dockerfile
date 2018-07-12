FROM alpine:3.8
LABEL maintainer="Marvin Menzerath <menzerath@ihf.rwth-aachen.de>"

RUN apk --no-cache upgrade && \
    apk --no-cache add curl git nginx nodejs npm wget

WORKDIR /app/
COPY . /app/

RUN cp /app/docker/nginx.conf /etc/nginx/conf.d/default.conf && \
    chmod +x /app/docker/coverage.sh && \
    chmod +x /app/docker/run.sh

RUN ln -sf /dev/stdout /var/log/nginx/access.log && \
    ln -sf /dev/stderr /var/log/nginx/error.log

RUN cd /app/ && \
    npm install

EXPOSE 80
VOLUME /app/src/store/config/

HEALTHCHECK --timeout=5s CMD curl --fail http://localhost:80 || exit 1

CMD /app/docker/run.sh
