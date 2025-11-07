FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY ApiGateway/ApiGateway.csproj ApiGateway/

WORKDIR /src/ApiGateway
RUN dotnet restore

WORKDIR /src
COPY . .
WORKDIR /src/ApiGateway
RUN dotnet publish -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
COPY --from=build /app/publish .

ENTRYPOINT ["dotnet", "ApiGateway.dll"]