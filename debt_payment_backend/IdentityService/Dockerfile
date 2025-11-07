FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY IdentityService/IdentityService.csproj IdentityService/

WORKDIR /src/IdentityService
RUN dotnet restore "IdentityService.csproj"

WORKDIR /src
COPY . .

WORKDIR /src/IdentityService
RUN dotnet publish "IdentityService.csproj" -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
COPY --from=build /app/publish .

ENTRYPOINT ["dotnet", "IdentityService.dll"]