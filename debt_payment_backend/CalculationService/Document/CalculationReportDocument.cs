using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;
using debt_payment_backend.CalculationService.Model.Dto;
using System.Globalization;

namespace debt_payment_backend.CalculationService.Document
{
    public class CalculationReportDocument : IDocument
    {
        private readonly CalculationResultDto _data;
        private readonly string _selectedStrategy;
        private readonly CultureInfo _culture;
        private readonly Dictionary<string, string> _translations;

        public CalculationReportDocument(CalculationResultDto data, string strategyName, string languageCode = "en")
        {
            _data = data;
            _selectedStrategy = strategyName;
            _culture = languageCode == "tr" ? new CultureInfo("tr-TR") : new CultureInfo("en-US");

            _translations = languageCode == "tr" ? new Dictionary<string, string>
            {
                {"Title", "Borç Ödeme Planı"},
                {"CreatedOn", "Oluşturulma Tarihi: "},
                {"Overview", "Finansal Genel Bakış"},
                {"InitialDebt", "Toplam Başlangıç Borcu"},
                {"ExtraPayment", "Aylık Ekstra Ödeme"},
                {"Recommendation", "Tavsiye"},
                {"ScheduleTitle", "Ödeme Planı"},
                {"Date", "Tarih"},
                {"Interest", "Faiz"},
                {"Principal", "Anapara"},
                {"Balance", "Kalan Bakiye"},
                {"Page", "Sayfa"},
                {"Snowball", "Kartopu (Snowball)"},
                {"Avalanche", "Çığ (Avalanche)"},
                {"RecTemplate", "{0} yöntemini kullanmanızı öneriyoruz. Bu yöntemle toplam {1} faiz tasarrufu yapabilirsiniz."},
                {"TotalPayment", "Toplam Ödeme"},
                {"Notes", "Notlar"},
                {"PaidOffPrefix", "Kapanan Borç: "}
            } : new Dictionary<string, string>
            {
                {"Title", "Debt Payment Plan"},
                {"CreatedOn", "Created on: "},
                {"Overview", "Financial Overview"},
                {"InitialDebt", "Total Initial Debt"},
                {"ExtraPayment", "Monthly Extra Payment"},
                {"Recommendation", "Recommendation"},
                {"ScheduleTitle", "Payment Schedule"},
                {"Date", "Date"},
                {"Interest", "Interest"},
                {"Principal", "Principal"},
                {"Balance", "Balance"},
                {"Page", "Page"},
                {"Snowball", "Snowball"},
                {"Avalanche", "Avalanche"},
                {"RecTemplate", "We recommend using the {0} method. You can save a total of {1} in interest."},
                {"TotalPayment", "Total Payment"},
                {"Notes", "Notes"},
                {"PaidOffPrefix", "Paid off: "}
            };
        }

        public DocumentMetadata GetMetadata() => DocumentMetadata.Default;

        public void Compose(IDocumentContainer container)
        {
            container
                .Page(page =>
                {
                    page.Margin(50);
                    page.Size(PageSizes.A4);
                    page.DefaultTextStyle(x => x.FontSize(12).FontFamily("Arial"));

                    page.Header().Element(ComposeHeader);
                    page.Content().Element(ComposeContent);
                    page.Footer().AlignCenter().Text(x =>
                    {
                        x.Span($"{_translations["Page"]} ");
                        x.CurrentPageNumber();
                    });
                });
        }

        void ComposeHeader(IContainer container)
        {
            var titleStyle = TextStyle.Default.FontSize(20).SemiBold().FontColor(Colors.Blue.Medium);

            container.Row(row =>
            {
                row.RelativeItem().Column(column =>
                {
                    column.Item().Text(_translations["Title"]).Style(titleStyle);
                    column.Item().Text(text =>
                    {
                        text.Span(_translations["CreatedOn"]);
                        text.Span($"{DateTime.Now.ToString("d", _culture)}").SemiBold();
                    });
                });

                row.ConstantItem(100).Height(50).Placeholder();
            });
        }

        void ComposeContent(IContainer container)
        {
            var targetResult = _selectedStrategy == "Avalanche" 
                           ? _data.AvalancheResult 
                           : _data.SnowballResult;

            container.PaddingVertical(40).Column(column =>
            {
                column.Spacing(20);

                column.Item().Text(_translations["Overview"]).FontSize(16).SemiBold();
                column.Item().Table(table =>
                {
                    table.ColumnsDefinition(columns =>
                    {
                        columns.RelativeColumn();
                        columns.RelativeColumn();
                    });

                    table.Cell().Text($"{_translations["InitialDebt"]}: {_data.BeginningDebt.ToString("C2", _culture)}");
                    table.Cell().Text($"{_translations["ExtraPayment"]}: {_data.ExtraPayment.ToString("C2", _culture)}");
                });

                column.Item().LineHorizontal(1).LineColor(Colors.Grey.Lighten2);

                column.Item().Background(Colors.Grey.Lighten4).Padding(10).Column(c => 
                {
                    c.Item().Text(_translations["Recommendation"]).FontSize(14).SemiBold();
                    var snowInterest = _data.SnowballResult.TotalInterestPaid;
                    var avlInterest = _data.AvalancheResult.TotalInterestPaid;

                    var diff = snowInterest - avlInterest;
                    string strategyKey = diff > 0 ? "Avalanche" : "Snowball";
                    decimal savedAmount = Math.Abs(diff);

                    string strategyName = _translations[strategyKey];
                    string formattedAmount = savedAmount.ToString("C2", _culture);

                    string recommendationText = string.Format(_translations["RecTemplate"], strategyName, formattedAmount);
                    c.Item().Text(recommendationText);
                });

                column.Item().LineHorizontal(1).LineColor(Colors.Grey.Lighten2);

                var rawStrategyName = targetResult.StrategyName;
                var translatedStrategyName = _translations.ContainsKey(rawStrategyName) ? _translations[rawStrategyName] : rawStrategyName;
                column.Item().Text($"{translatedStrategyName} {_translations["ScheduleTitle"]}").FontSize(16).SemiBold();
                
                column.Item().Table(table =>
                {
                    table.ColumnsDefinition(columns =>
                    {
                        columns.ConstantColumn(40); 
                        columns.RelativeColumn(2); 
                        columns.RelativeColumn(2);
                        columns.RelativeColumn(2);
                        columns.RelativeColumn(2);  
                        columns.RelativeColumn(2);  
                        columns.RelativeColumn(3);  
                    });

                    static IContainer CellStyle(IContainer container)
                    {
                        return container.DefaultTextStyle(x => x.SemiBold().FontSize(10)).PaddingVertical(5).BorderBottom(1).BorderColor(Colors.Black);
                    }

                    static IContainer HeaderStyle(IContainer container)
                    {
                        return container.DefaultTextStyle(x => x.SemiBold().FontSize(10)).PaddingVertical(5).BorderBottom(1).BorderColor(Colors.Black);
                    }

                    table.Header(header =>
                    {
                        header.Cell().Element(HeaderStyle).Text("#");
                        header.Cell().Element(HeaderStyle).Text(_translations["Date"]);
                        header.Cell().Element(HeaderStyle).AlignRight().Text(_translations["Interest"]);
                        header.Cell().Element(HeaderStyle).AlignRight().Text(_translations["Principal"]);
                        header.Cell().Element(HeaderStyle).AlignRight().Text(_translations["TotalPayment"]);
                        header.Cell().Element(HeaderStyle).AlignRight().Text(_translations["Balance"]);
                        header.Cell().Element(HeaderStyle).PaddingLeft(5).Text(_translations["Notes"]);
                    });

                    foreach (var row in targetResult.PaymentSchedule)
                    {
                        table.Cell().Element(CellStyle).Text(row.Month.ToString());
                        string formattedDate = row.MonthYear;

                        if (DateTime.TryParseExact(row.MonthYear, "MMMM yyyy", CultureInfo.GetCultureInfo("en-US"), DateTimeStyles.None, out var dateValue))
                        {
                            formattedDate = dateValue.ToString("MMMM yyyy", _culture);
                        }

                        table.Cell().Element(CellStyle).Text(formattedDate);
                        table.Cell().Element(CellStyle).AlignRight().Text(row.InterestPaid.ToString("N2", _culture));
                        table.Cell().Element(CellStyle).AlignRight().Text(row.PrincipalPaid.ToString("N2", _culture));
                        table.Cell().Element(CellStyle).AlignRight().Text(row.TotalPaymentAmount.ToString("N2", _culture));
                        table.Cell().Element(CellStyle).AlignRight().Text(row.EndingBalance.ToString("N2", _culture));

                        string noteText = "";
                        if (row.PaidOffDebts != null && row.PaidOffDebts.Any())
                        {
                            string debtNames = string.Join(", ", row.PaidOffDebts);
                            noteText = $"{_translations["PaidOffPrefix"]}{debtNames}";
                        }
                        
                        table.Cell().Element(CellStyle).PaddingLeft(5).Text(noteText).FontColor(Colors.Green.Medium);
                    }
                });
            });
        }
    }
}