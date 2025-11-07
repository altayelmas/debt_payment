FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY DebtService/DebtService.csproj DebtService/

WORKDIR /src/DebtService
RUN dotnet restore "DebtService.csproj"

WORKDIR /src
COPY . .

WORKDIR /src/DebtService
RUN dotnet publish "DebtService.csproj" -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
COPY --from=build /app/publish .

ENTRYPOINT ["dotnet", "DebtService.dll"]