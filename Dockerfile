FROM alpine:3.3
MAINTAINER Marvin Menzerath <menzerath@ihf.rwth-aachen.de>

RUN apk add --update lighttpd \
	&& rm -rf /var/cache/apk/*
RUN adduser www-data -G www-data -H -s /bin/false -D

COPY . /app/

EXPOSE 80
ENTRYPOINT ["lighttpd", "-D", "-f", "/app/docker/lighttpd.conf"]
