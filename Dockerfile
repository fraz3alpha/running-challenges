# docker build -t rc:latest .
# docker run -v `pwd`:/rc rc:latest

FROM node:lts-jessie

RUN npm install --global web-ext

RUN mkdir /rc

WORKDIR /rc

ENTRYPOINT ["./build/extension-chrome/build.sh"]
ENTRYPOINT ["./build/extension-firefox/build.sh"]