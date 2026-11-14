# F-22 Raptor — Forma em voo

Landing editorial independente para portfólio. Um ensaio de aviação que aproxima fotografias reais, um recorte de vídeo oficial e tipografia em grande escala. Não é um site oficial nem representa o fabricante, a U.S. Air Force ou qualquer órgão governamental.

## Executar

Requisitos: Python 3 e, para os atalhos npm, Node.js. O site publicado não precisa de backend ou serviços externos.

```bash
npm run build
npm run preview
```

Abra `http://127.0.0.1:4176`. Também é possível servir a pasta raiz com qualquer servidor HTTP estático. Os caminhos são relativos para permitir publicação em subdiretórios, como `/demos/f22/`.

## Direção visual

A referência de Hyer Aviation fornecida pelo autor orienta a composição: tipografia de escala arquitetônica, campos claros, céu azul, uma nota em argila e fechamento escuro. Nenhum logo, código ou mídia da Hyer foi copiado. A família de sistema Arial/Helvetica preserva a construção tipográfica sem distribuir uma fonte proprietária.

## Recursos

- Hero fotográfico com entrada curta, sem esconder conteúdo no modo de movimento reduzido.
- Navegação por âncoras e seção atual marcada por `IntersectionObserver`.
- Scroll fluido com Lenis local; toque permanece nativo.
- Botão global de pausa e respeito a `prefers-reduced-motion` e `saveData`.
- Filme local de dez segundos, sem áudio, carregado apenas após o usuário pedir reprodução.
- Vídeo pausado ao sair de vista. Poster mantém a composição sem download do MP4.
- Galeria com `dialog` nativo, Escape para fechar e restauração do foco.
- Fontes e créditos consultáveis em `details` nativo.
- Layout responsivo, foco visível, títulos e alternativas textuais.

## Estrutura

```text
index.html       conteúdo e estrutura semântica
styles.css       identidade, componentes e responsividade
entry.js         scroll, navegação, vídeo e galeria
media/           fotografias, filme, poster e Lenis local
scripts/build.py build determinístico por cópia dos arquivos públicos
docs/            capturas, fontes e evidências de QA
```

## Mídia e procedência

Fotografias de Staff Sgt. Lauren Diaz e vídeo de Staff Sgt. Mary Bowers, U.S. Air Force, publicados no DVIDS e identificados como domínio público nas páginas originais. O vídeo completo não é distribuído neste repositório: `media/flight.mp4` é um trecho sem áudio de 00:02:28 a 00:02:38, convertido para H.264 1280px / 24fps; o poster foi extraído do mesmo registro. Fotografias foram convertidas para WebP, sem composição sintética. A lista completa de fontes e condições está em [docs/MEDIA-SOURCES.md](docs/MEDIA-SOURCES.md).

The appearance of U.S. Department of War (DoW) visual information does not imply or constitute DoW endorsement.

## Dependência

Lenis foi distribuído localmente a partir da instalação oficial npm existente no portfólio. Licença MIT em `media/LENIS-LICENSE.txt`. Não há CDN, rastreamento, formulário ou coleta de dados.

## Verificação

Build com Python. QA de navegador em 320, 390, 768 e 1440px: largura, imagens, erros de JavaScript, comportamento de movimento reduzido e abertura/fechamento da galeria. Evidência em `docs/qa.json`; capturas em `docs/inicio.jpg` e `docs/detalhe.jpg`. A auditoria automatizada não substitui teste com leitor de tela ou dispositivo físico.

## Hero com vídeo pela rolagem

A abertura usa o próprio registro oficial como vídeo de fundo. A posição da página controla o quadro do filme, inclusive ao voltar: uma seção de200svh no desktop e150svh no celular mantém o palco sticky durante um percurso finito. Não há captura da roda do mouse, autoplay nem reprodução contínua. O progresso é calculado em um único `requestAnimationFrame` por demanda; a próxima busca aguarda `seeked`, evitando filas de decodificação.

`media/hero-flight.mp4` é derivado do mesmo trecho oficial documentado em `docs/MEDIA-SOURCES.md`, sem áudio, H.264 com keyframes em todos os quadros (CRF27). Essa versão de aproximadamente1,7MB facilita buscar qualquer instante. Para servir vídeo, a hospedagem deve enviar `Content-Length` e preferencialmente suportar byte ranges; a Vercel suporta ambos. O player normal continua disponível na seção Em movimento.

A tipografia técnica e inclinada usa **Chakra Petch**, distribuída pelo Google Fonts sob SIL Open Font License. Arquivos e licença ficam em `media/`; nenhuma fonte ou marca proprietária da Fórmula1 foi copiada. Os princípios das skills oficiais GSAP ScrollTrigger e Performance orientaram o percurso finito, as leituras de layout agrupadas e o fallback. O controlador nativo foi mantido para não duplicar o scheduler de Lenis com outra dependência.

Com `prefers-reduced-motion`, economia de dados ou sem JavaScript, a abertura usa fotografia estática; nenhum MP4 do hero é carregado inicialmente nesses modos. A pausa global interrompe o vínculo com a rolagem e volta à fotografia, preservando o arquivo já carregado em memória. `docs/scroll-hero-qa.json` registra as quatro larguras, o percurso0→meio→fim→retorno e o fallback semJS.

## Correção de entrega e animação

O hero é a única instância de vídeo da página. GSAP3.13 e ScrollTrigger locais controlam progresso e entrada tipográfica; Lenis usa o mesmo ticker. Busca do vídeo serializada para não acumular seeks. CSS e scripts recebem hash no build para evitar mistura entre HTML novo e assets antigos do cache. “Ativar animação” permite escolha explícita quando movimento reduzido estiver ativo.

## Refinamento de fluidez e navegação

A navbar foi refinada com uma proposta de apoio do Claude: sobreposição discreta ao filme, 72px no desktop/64px no celular, marca Chakra Petch, detalhes âmbar e controles de 44px. O menu mobile oferece Escape, foco restaurado e navegação por teclado.

O hero agora apresenta os 240 quadros reais do mesmo vídeo em canvas. Um pacote WebP de aproximadamente 0,83 MiB evita 240 requisições separadas; apenas 16 bitmaps ficam no cache, com no máximo quatro decodificações concorrentes. A suavização usa o tempo transcorrido no ticker GSAP compartilhado com Lenis. O MP4 continua como fallback se canvas/quadros falharem; movimento reduzido mantém o pôster até ativação explícita. Não há segundo filme na página.

Para regenerar os assets: `python3 scripts/generate-frames.py` (ffmpeg instalado), depois `python3 scripts/build.py`. `scripts/qa.mjs` verifica a ida e volta da sequência, pausa, fallback, opt-in, menu mobile, galeria, no-JS e 320/390/768/1440px.

Comparação local de 3,5s de rolagem com a mesma fração do hero: 84 atualizações distintas/211 amostras na versão anterior e 205/211 na sequência suavizada. É um diagnóstico deste ambiente, não uma garantia de FPS em outros aparelhos. O vídeo original tem 24 quadros por segundo; a composição interpola quadros vizinhos, sem inventar detalhes do movimento.
