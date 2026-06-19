let intervaloContagem;

// Atualiza a contagem regressiva da página inicial.
function inicializarContagem() {
    const countdownSection = document.querySelector(".countdown-section");

    if (intervaloContagem) {
        clearInterval(intervaloContagem);
        intervaloContagem = null;
    }

    if (!countdownSection) {
        return;
    }

    const dataCasamento = new Date(countdownSection.dataset.date).getTime();
    const dias = document.getElementById("dias");
    const horas = document.getElementById("horas");
    const minutos = document.getElementById("minutos");
    const segundos = document.getElementById("segundos");
    const mensagem = document.querySelector(".countdown-message");

    function atualizarContagem() {
        const agora = new Date().getTime();
        const diferenca = dataCasamento - agora;

        if (diferenca <= 0) {
            dias.textContent = "00";
            horas.textContent = "00";
            minutos.textContent = "00";
            segundos.textContent = "00";
            mensagem.textContent = "chegou o nosso grande dia";
            clearInterval(intervaloContagem);
            intervaloContagem = null;
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

// Copia textos em navegadores sem suporte ao Clipboard API.
function copiarComFallback(text) {
    const input = document.createElement("textarea");
    input.value = text;
    input.setAttribute("readonly", "");
    input.style.position = "fixed";
    input.style.opacity = "0";
    document.body.appendChild(input);
    input.select();
    document.execCommand("copy");
    input.remove();
}

// Configura o botão de copiar a chave Pix.
function inicializarCopiarChave() {
    const copyButtons = document.querySelectorAll("[data-copy-target]");

    copyButtons.forEach(button => {
        if (button.dataset.copyInitialized) {
            return;
        }

        button.dataset.copyInitialized = "true";
        const originalText = button.textContent.trim();
        const targetId = button.dataset.copyTarget;
        const target = document.getElementById(targetId);

        if (!target) {
            return;
        }

        function setButtonMessage(message) {
            button.classList.add("is-copied");
            button.innerHTML = `<i class="fa-solid fa-check" aria-hidden="true"></i>${message}`;

            window.setTimeout(() => {
                button.classList.remove("is-copied");
                button.innerHTML = `<i class="fa-regular fa-copy" aria-hidden="true"></i>${originalText}`;
            }, 2200);
        }

        button.addEventListener("click", async () => {
            const textToCopy = target.textContent.trim();

            try {
                if (navigator.clipboard) {
                    await navigator.clipboard.writeText(textToCopy);
                } else {
                    copiarComFallback(textToCopy);
                }

                setButtonMessage("Chave copiada");
            } catch (error) {
                copiarComFallback(textToCopy);
                setButtonMessage("Chave copiada");
            }
        });
    });
}

// Mostra uma confirmação visual ao enviar o formulário de RSVP.
function inicializarFormularioRsvp() {
    const rsvpForm = document.querySelector("[data-rsvp-form]");

    if (!rsvpForm || rsvpForm.dataset.rsvpInitialized) {
        return;
    }

    rsvpForm.dataset.rsvpInitialized = "true";
    const feedback = rsvpForm.querySelector("[data-rsvp-feedback]");

    rsvpForm.addEventListener("submit", event => {
        event.preventDefault();

        const formData = new FormData(rsvpForm);
        const name = formData.get("nome");
        const attendance = formData.get("presenca");

        if (feedback) {
            feedback.classList.add("is-visible");
            feedback.textContent = `${name}, sua resposta foi registrada na página: ${attendance}. Obrigado pelo carinho!`;
        }

        rsvpForm.reset();
    });
}

// Reinicia os recursos que dependem dos elementos da página atual.
function inicializarComponentes() {
    inicializarContagem();
    inicializarCopiarChave();
    inicializarFormularioRsvp();
}

// Verifica se o link deve ser aberto via AJAX.
function linkInternoAjax(link) {
    const href = link.getAttribute("href");

    if (!href || href.startsWith("#")) {
        return false;
    }

    const url = new URL(link.href, window.location.href);

    return url.origin === window.location.origin
        && url.pathname.endsWith(".html")
        && !link.target
        && !link.hasAttribute("download");
}

// Carrega uma nova página sem recarregar o navegador inteiro.
async function carregarPagina(url, adicionarHistorico = true) {
    try {
        document.body.classList.add("is-loading-page");

        const resposta = await fetch(url);

        if (!resposta.ok) {
            throw new Error("Página não encontrada");
        }

        const html = await resposta.text();
        const parser = new DOMParser();
        const novaPagina = parser.parseFromString(html, "text/html");
        const novoBody = novaPagina.body;

        document.title = novaPagina.title;
        document.body.className = novoBody.className;
        document.body.innerHTML = novoBody.innerHTML;

        if (adicionarHistorico) {
            history.pushState({ url }, "", url);
        }

        inicializarComponentes();
        window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (erro) {
        console.error(erro);
        window.location.href = url;
    } finally {
        document.body.classList.remove("is-loading-page");
    }
}

// Intercepta os cliques nos links internos do site.
document.addEventListener("click", event => {
    const link = event.target.closest("a");

    if (!link || !linkInternoAjax(link)) {
        return;
    }

    event.preventDefault();
    carregarPagina(link.href);
});

// Permite usar os botões voltar e avançar do navegador.
window.addEventListener("popstate", () => {
    carregarPagina(window.location.href, false);
});

// Inicializa os recursos da primeira página aberta.
inicializarComponentes();
