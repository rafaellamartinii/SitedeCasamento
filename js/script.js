function carregarPagina(url) {
    const conteudo = document.getElementById("conteudo");

    if (!conteudo) {
        console.error("Elemento #conteudo não encontrado.");
        return;
    }

    fetch(url)
        .then(resposta => {
            if (!resposta.ok) {
                throw new Error("Página não encontrada");
            }

            return resposta.text();
        })
        .then(html => {
            conteudo.innerHTML = html;
        })
        .catch(erro => {
            conteudo.innerHTML = "<h2>Erro ao carregar a página.</h2>";
            console.error(erro);
        });
}

const countdownSection = document.querySelector(".countdown-section");

if (countdownSection) {
    const dataCasamento = new Date(countdownSection.dataset.date).getTime();
    const dias = document.getElementById("dias");
    const horas = document.getElementById("horas");
    const minutos = document.getElementById("minutos");
    const segundos = document.getElementById("segundos");
    const mensagem = document.querySelector(".countdown-message");
    let intervaloContagem;

    function atualizarContagem() {
        const agora = new Date().getTime();
        const diferenca = dataCasamento - agora;

        if (diferenca <= 0) {
            dias.textContent = "00";
            horas.textContent = "00";
            minutos.textContent = "00";
            segundos.textContent = "00";
            mensagem.textContent = "chegou o nosso grande dia";
            if (intervaloContagem) {
                clearInterval(intervaloContagem);
            }
            return;
        }

        const totalSegundos = Math.floor(diferenca / 1000);
        const diasRestantes = Math.floor(totalSegundos / 86400);
        const horasRestantes = Math.floor((totalSegundos % 86400) / 3600);
        const minutosRestantes = Math.floor((totalSegundos % 3600) / 60);
        const segundosRestantes = totalSegundos % 60;

        dias.textContent = String(diasRestantes).padStart(2, "0");
        horas.textContent = String(horasRestantes).padStart(2, "0");
        minutos.textContent = String(minutosRestantes).padStart(2, "0");
        segundos.textContent = String(segundosRestantes).padStart(2, "0");
    }

    atualizarContagem();
    intervaloContagem = setInterval(atualizarContagem, 1000);
}
