// Data de hoje por extenso
const hoje = new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" });
const hojeFmt = hoje.charAt(0).toUpperCase() + hoje.slice(1);
document.getElementById("data").textContent = hojeFmt;
document.getElementById("data2").textContent = "hoje (" + hoje + ")";

// Esconde imagens que não carregarem
document.querySelectorAll(".gallery img").forEach(img =>
  img.addEventListener("error", () => img.closest("figure").remove()));

// Botão "Não" impossível de apertar
const nao = document.getElementById("nao");
const sim = document.getElementById("sim");
const provocacao = document.getElementById("provocacao");
const frases = [
  "Opção indisponível no momento.",
  "Tem certeza? A carne de onça discorda.",
  "O botão \"Não\" está em manutenção, assim como a máquina de lavar.",
  "Essa opção foi instalada igual ao cano do filtro: não funciona.",
  "Sistema indisponível. Tente o \"Sim\".",
  "O submarino já está gelando...",
];
let tentativas = 0;

function fugir(e) {
  if (e) e.preventDefault();
  tentativas++;
  const r = nao.getBoundingClientRect();
  if (!nao.classList.contains("fugindo")) {
    nao.style.left = r.left + "px";
    nao.style.top = r.top + "px";
    nao.classList.add("fugindo");
  }
  const margem = 16;
  const maxX = window.innerWidth - r.width - margem;
  const maxY = window.innerHeight - r.height - margem;
  nao.style.left = Math.max(margem, Math.random() * maxX) + "px";
  nao.style.top = Math.max(margem, Math.random() * maxY) + "px";
  nao.style.transform = `scale(${Math.max(0.4, 1 - tentativas * 0.08)})`;
  sim.style.transform = `scale(${Math.min(1.6, 1 + tentativas * 0.06)})`;
  provocacao.textContent = frases[tentativas % frases.length];
}

nao.addEventListener("mouseenter", fugir);
nao.addEventListener("touchstart", fugir, { passive: false });
nao.addEventListener("focus", fugir);
nao.addEventListener("click", fugir);

function mostrar(id) {
  ["pergunta", "formulario", "aceito"].forEach(s =>
    document.getElementById(s).classList.toggle("hidden", s !== id));
  document.getElementById(id).scrollIntoView({ behavior: "smooth" });
}

sim.addEventListener("click", () => {
  nao.remove();
  mostrar("formulario");
  document.getElementById("endereco").focus({ preventScroll: true });
});

// Endereço pela localização do navegador (o navegador pede permissão)
const campoEndereco = document.getElementById("endereco");
const statusLocal = document.getElementById("status-local");
let linkMapa = "";

document.getElementById("localizacao").addEventListener("click", () => {
  if (!("geolocation" in navigator)) {
    statusLocal.textContent = "Seu navegador não permite localização. Pode digitar o endereço abaixo.";
    return;
  }
  statusLocal.textContent = "Buscando sua localização...";
  navigator.geolocation.getCurrentPosition(async ({ coords }) => {
    const { latitude: lat, longitude: lon } = coords;
    linkMapa = `https://www.google.com/maps?q=${lat},${lon}`;
    try {
      const resp = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}&accept-language=pt-BR`);
      const dados = await resp.json();
      const a = dados.address || {};
      const partes = [
        [a.road, a.house_number].filter(Boolean).join(", "),
        a.suburb || a.neighbourhood,
        a.city || a.town,
      ].filter(Boolean);
      campoEndereco.value = partes.join(" - ") || dados.display_name || "";
      statusLocal.textContent = "Endereço encontrado. Confira e ajuste o número, se precisar.";
    } catch {
      statusLocal.textContent = "Localização obtida, mas não achei o nome da rua. Pode digitar abaixo.";
    }
  }, () => {
    statusLocal.textContent = "Não foi possível obter a localização. Pode digitar o endereço abaixo.";
  }, { enableHighAccuracy: true, timeout: 15000 });
});

// Envio por e-mail via FormSubmit (funciona em site estático, sem senha)
const DESTINO = "https://formsubmit.co/ajax/almeidafitz@gmail.com";
const form = document.getElementById("form-endereco");
const erro = document.getElementById("erro");
const confirmar = document.getElementById("confirmar");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  erro.textContent = "";
  const endereco = campoEndereco.value.trim();
  if (endereco.length < 5) {
    erro.textContent = "Por gentileza, informe o endereço.";
    campoEndereco.focus();
    return;
  }

  confirmar.disabled = true;
  confirmar.textContent = "Enviando...";
  try {
    const resp = await fetch(DESTINO, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Accept": "application/json" },
      body: JSON.stringify({
        _subject: "Mariana aceitou o convite! Endereço para buscar",
        _template: "table",
        Convite: `Hoje (${hoje}) às 20h00 - Bar do Alemão`,
        Endereco: endereco,
        Complemento: document.getElementById("complemento").value.trim() || "-",
        Observacao: document.getElementById("observacao").value.trim() || "-",
        Mapa: linkMapa || "-",
      }),
    });
    if (!resp.ok) throw new Error(resp.status);
    mostrar("aceito");
  } catch {
    erro.textContent = "Não consegui enviar agora. Pode tentar de novo?";
    confirmar.disabled = false;
    confirmar.textContent = "Confirmar";
  }
});
