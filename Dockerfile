# docker build -t rc:latest .
# docker run -v `pwd`:/rc rc:latest

FROM node:lts-jessie

RUN npm -g config set user root
RUN npm install --global web-ext

RUN mkdir /rc

WORKDIR /rc

ENTRYPOINT ["./build_all.sh"]
