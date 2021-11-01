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

    await populateChart('brazil', new Date(2021, 10, 1), new Date(2020, 1, 1), 'Deaths', 'Número de óbitos');

    function dailyNumbers(data) {
        const result = [];
        result.push(0);
        for (let i = 1; i < data.length; i++) {
            result.push(data[i] - data[i-1]);
        }
        console.log(data)
        console.log(result)
        return result;
    }

    async function populateChart(country, to, from, dados, label) {
        console.log(JSON.stringify({country, to, from, dados, label}));
        const dataByCountry = await searchCountry(country, from, to);
        const ctx = document.querySelector("#linhas").getContext("2d");
        if (!linesChart) {
            const data = dailyNumbers(dataByCountry.map(d => d[dados]));
            const mean = _.mean(data);
            const meanArray = new Array(data.length);
            _.fill(meanArray, mean);
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
                            data: data,
                        },
                        {
                            label: 'Média',
                            data: meanArray,
                            borderColor: 'rgb(75, 192, 192)',
                            fill: false,
                            tension: 0.1,
                        }
                    ],
                }
            });
        } else {
            const data = dailyNumbers(dataByCountry.map(d => d[dados]));
            const mean = _.mean(data);
            const meanArray = new Array(data.length);
            _.fill(meanArray, mean);
            linesChart.data.labels = dataByCountry.map(d => d.Date);
            linesChart.data.datasets[0].label = label;
            linesChart.data.datasets[0].data = data;
            linesChart.data.datasets[1].data = meanArray;
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

    function formatDate(date) {
        let data;
        if (date instanceof Date) {
            data = date;   
        } else {
            let [y, m, d] = date.split("-");
            data = new Date(y, +m-1, d);
        }
        let dia  = data.getDate().toString(),
            diaF = (dia.length == 1) ? '0'+dia : dia,
            mes  = (data.getMonth()+1).toString(), //+1 pois no getMonth Janeiro começa com zero.
            mesF = (mes.length == 1) ? '0'+mes : mes,
            anoF = data.getFullYear();
        return anoF + "-" + mesF + "-" + diaF;
    }

    async function searchCountry(country, from, to) {
        try {
            return (await axios.get(`${countryByStatus}/${country}?from=${formatDate(from)}&to=${formatDate(to)}`)).data;
        } catch (e) {
            console.error(e);
        }
    }
})();
