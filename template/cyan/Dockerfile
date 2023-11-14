FROM oven/bun:1.0.11
WORKDIR /app
COPY cookiecutter.json .
LABEL cyanprint.dev=true
COPY ./cyan/package.json .
COPY ./cyan/bun.lockb .
RUN bun install
COPY cyan .
CMD ["bun", "run", "index.ts"]
