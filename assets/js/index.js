(async () => {
  const api_url = "https://api.covid19api.com";

  function formatNumber(n) {
    return new Intl.NumberFormat("pt-BR").format(n);
  }

  function formatDate(d) {
    return new Intl.DateTimeFormat("pt-BR").format(d);
  }

  async function kpi({ TotalConfirmed, TotalDeaths }) {
    try {
      document.querySelector("#confirmed").innerHTML =
        formatNumber(TotalConfirmed);
      document.querySelector("#death").innerHTML = formatNumber(TotalDeaths);
      document.querySelector("#recovered").innerHTML =
        formatNumber(TotalConfirmed - TotalDeaths);
    } catch (e) {
      console.error(e);
    }
  }

  async function pizza({ NewConfirmed, NewDeaths }) {
    try {
      const ctx = document.querySelector("#pizza").getContext("2d");
      new Chart(ctx, {
        type: "pie",
        data: {
          labels: ["Confirmados", "Recuperados", "Mortes"],
          datasets: [
            {
              label: "Distribuição de novos casos",
              data: [NewConfirmed, NewConfirmed - NewDeaths, NewDeaths],
              backgroundColor: [
                "rgb(255, 99, 132)",
                "rgb(54, 162, 235)",
                "rgb(255, 205, 86)",
              ],
            },
          ],
        },
      });
    } catch (e) {
      console.error(e);
    }
  }

  async function countries(Countries) {
    try {
      Countries.sort((c1, c2) => c2.TotalDeaths - c1.TotalDeaths);
      const ctx = document.querySelector("#barras").getContext("2d");
      new Chart(ctx, {
        type: "bar",
        data: {
          labels: Countries.map((c) => c.Country).slice(0, 10),
          datasets: [
            {
              label: "Total de Mortes por país - Top 10",
              backgroundColor: "#3e95cd",
              data: Countries.map((c) => c.TotalDeaths).slice(0, 10),
            },
          ],
        },
        options: {
          legend: { display: false },
          title: {
            display: true,
            text: "Predicted world population (millions) in 2050",
          },
        },
      });
    } catch (e) {
      console.error(e);
    }
  }

  async function populateHome() {
    const { Global, Countries } = (await axios.get(`${api_url}/summary`)).data;
    await kpi(Global);
    await pizza(Global);
    await countries(Countries);
    const dataAtualizacao = formatDate(new Date());
    document.querySelector(
      "#date"
    ).innerHTML = `Data de atualização: ${dataAtualizacao}`;
  }

  await populateHome();
})();
