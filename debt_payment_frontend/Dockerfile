FROM node:20-alpine AS build
WORKDIR /app

COPY . .

RUN npm install

RUN npm run build

FROM node:20-alpine AS final
WORKDIR /app

COPY --from=build /app/.next/standalone .
COPY --from=build /app/.next/static ./.next/static
COPY --from=build /app/public ./public

COPY --from=build /app/messages ./messages
COPY --from=build /app/i18n ./i18n


EXPOSE 3000
CMD ["node", "server.js"]