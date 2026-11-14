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
