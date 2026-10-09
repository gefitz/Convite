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

sim.addEventListener("click", () => {
  nao.remove();
  document.getElementById("pergunta").classList.add("hidden");
  document.getElementById("aceito").classList.remove("hidden");
  document.getElementById("aceito").scrollIntoView({ behavior: "smooth" });
});
