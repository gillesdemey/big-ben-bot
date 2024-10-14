FROM oven/bun:latest

ENV TZ=Europe/Brussels

RUN apt update
RUN apt install -y ffmpeg

COPY package.json ./
COPY bun.lockb ./
COPY src ./

RUN bun install

USER bun
ENTRYPOINT [ "bun", "run", "main.ts" ]
