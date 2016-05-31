#Dockerfile for an OpenWhisk action based on the Docker skeleton example 
#from the Bluemix documentation 
# https://new-console.ng.bluemix.net/docs/openwhisk/openwhisk_actions.html#openwhisk_actions_docker

FROM ubuntu:14.04

ENV DEBIAN_FRONTEND noninteractive

#install wget and curl
RUN apt-get update --fix-missing && \
apt-get install -y wget && \
apt-get update && \
apt-get install -y curl && \
apt-get update

# install nodejs and npm
RUN curl -sL https://deb.nodesource.com/setup_0.12 | bash - && \
apt-get install -y nodejs

# install common packages
RUN npm install -g body-parser@1.12.0 \
cookie-parser@1.3.4 \
express@4.12.2 \
express-session@1.11.1 \
log4js@0.6.25 \
request@2.60.0 \
pg@4.5.5

ADD server /server
RUN cd /server; ln -s /usr/lib/node_modules node_modules
RUN cd /server; npm install .

EXPOSE 8080
CMD ["/bin/bash", "-c", "cd /server && node ./app.js"]
