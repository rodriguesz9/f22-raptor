# Verificação — 14/11/2026

GATE: ERROR. O gate da skill não encontrou Chrome/Edge/Chromium em seu mecanismo de descoberta. `consistency.mjs` e `check.mjs` não executaram. O comando não foi repetido, conforme a instrução do gate. Saída integral em `taste-gate.txt`. Os três WARN de copy-lint (fragmentos editoriais, eyebrows e ritmo) são mantidos por fazerem parte da hierarquia editorial solicitada, sem métricas ou promessas inventadas.

Verificação funcional independente com Playwright/Chromium provisionado no ambiente:

- 320,390,768,1440px: sem overflow horizontal, imagens quebradas ou erros JavaScript. Um único h1.
- Movimento reduzido: Lenis não inicializado; MP4 não requisitado; poster e fotografias presentes.
- Modo normal: Lenis ativo; acionamento explícito do filme avança currentTime; pausa interrompe o vídeo e destrói Lenis.
- Galeria: dialog abre, fecha com Escape e foco retorna ao disparador.
- Capturas reais em1280×800, hero e ensaio.
- Build Python aprovado. Nenhuma API externa necessária em runtime.

Evidências: `qa.json`, `motion-qa.json`, `inicio.jpg`, `detalhe.jpg`.

Não houve teste em aparelho físico ou leitor de tela. O gate de layout da skill não foi aprovado; não se declara GATE:PASS.

`node scripts/qa.mjs` usa Playwright disponível no ambiente ou o módulo indicado por `PLAYWRIGHT_MODULE`; binário pode ser localizado por `PLAYWRIGHT_BROWSERS_PATH`.
