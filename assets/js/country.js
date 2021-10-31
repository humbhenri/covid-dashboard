(async () => {
    const apiUrl = "https://api.covid19api.com";
    const countriesUrl = `${apiUrl}/countries`;
    const summaryUrl = `${apiUrl}/summary`;
    const countryByStatus = `${apiUrl}/country`;
    const countrySel = document.querySelector("#cmbCountry");
    let linesChart;    

    await populateCountryComb();

    const summary = (await axios.get(summaryUrl)).data;
    const { TotalConfirmed, TotalDeaths } = summary.Global;
    const TotalRecovered = TotalConfirmed - TotalDeaths;

    const kpiconfirmed = document.querySelector("#kpiconfirmed");
    kpiconfirmed.innerHTML = TotalConfirmed;
    const kpideaths = document.querySelector("#kpideaths");
    kpideaths.innerHTML = TotalDeaths;
    const kpirecovered = document.querySelector("#kpirecovered");
    kpirecovered.innerHTML = TotalRecovered;

    document.querySelector("#filtro").addEventListener("click", (ev) => {
        const country = document.querySelector("#cmbCountry").value;
        const from = document.querySelector("#date_start").value;
        const to = document.querySelector("#date_end").value;
        const dados = document.querySelector("#cmbData").value;
        const label = document.querySelector("#cmbData").selectedOptions[0].innerText;
        populateChart(country, to, from, dados, label);
        const countrySummary = _.find(summary.Countries, { "Slug": country });
        if (countrySummary) {
            kpiconfirmed.innerHTML = countrySummary.TotalConfirmed;
            kpideaths.innerHTML = countrySummary.TotalDeaths;
            kpirecovered.innerHTML = countrySummary.TotalConfirmed - countrySummary.TotalDeaths;
        } else {
            kpiconfirmed.innerHTML = 0;
            kpideaths.innerHTML = 0;
            kpirecovered.innerHTML = 0;
        }
    });

    // await populateChart('brazil', new Date(2021, 10, 1), new Date(2020, 1, 1), 'Deaths', 'Número de óbitos');

    async function populateChart(country, to, from, dados, label) {
        const dataByCountry = await searchCountry(country, to, from);
        const ctx = document.querySelector("#linhas").getContext("2d");
        if (!linesChart) {
            linesChart = new Chart(ctx, {
                type: "line",
                options: {
                    responsive: true,
                    legend: {
                        position: "top"
                    },
                    title: {
                        display: true,
                        text: "Curva diária de Covid - 19"
                    }
                },
                data: {
                    labels: dataByCountry.map(d => d.Date),
                    datasets: [
                        {
                            label: label,
                            data: dataByCountry.map(d => d[dados]),
                        }
                    ],
                }
            });
        } else {
            linesChart.data.labels = dataByCountry.map(d => d.Date);
            linesChart.data.datasets[0].label = label;
            linesChart.data.datasets[0].data = dataByCountry.map(d => d[dados]);
            linesChart.update();
        }
    }

    async function populateCountryComb() {
        try {
            const countries = _.sortBy((await axios.get(countriesUrl)).data, 'Country');
            countrySel.innerHTML = countries
                .map(c => `<option value="${c.Slug}">${c.Country}</option>`)
                .join("");
        } catch (e) {
            console.error(e);
        }
    }

    async function searchCountry(country, from, to) {
        try {
            return (await axios.get(`${countryByStatus}/${country}?from=${from}&to=${to}`)).data;
        } catch (e) {
            console.error(e);
        }
    }
})();