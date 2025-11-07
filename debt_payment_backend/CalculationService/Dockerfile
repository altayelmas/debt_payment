FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY CalculationService/CalculationService.csproj CalculationService/

WORKDIR /src/CalculationService
RUN dotnet restore "CalculationService.csproj"

WORKDIR /src
COPY . .

WORKDIR /src/CalculationService
RUN dotnet publish "CalculationService.csproj" -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
COPY --from=build /app/publish .

ENTRYPOINT ["dotnet", "CalculationService.dll"]