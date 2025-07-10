figma.showUI(__html__, { width: 250, height: 280 });

let data: { id: string; characters: string }[] | undefined;

figma.ui.onmessage =  (msg: {type: string, payload: any}) => {

  if (msg.type === 'export-text') {
    const selection = figma.currentPage.selection;
    const textNodes = selection.filter(node => node.type === 'TEXT') as TextNode[];

    const extractedText = textNodes.map(node => ({
    id: node.id,
    name: node.name,
    characters: node.characters
    }));

    console.log(JSON.stringify(extractedText, null, 2));
    figma.ui.postMessage({
      type: 'save-json',
      data: JSON.stringify(extractedText, null, 2)
    });
  }
  if (msg.type === 'file-loaded') {
    console.log("try");

    try {
      data = JSON.parse(msg.payload);
    } catch (e) {
      console.error("Errore di parsing JSON:", e);
      figma.closePlugin();
      return;
    }

    if (!Array.isArray(data)) {
      console.error("Il file JSON non è un array");
      figma.closePlugin();
      return;
    }

  }

  if(msg.type === 'apply-text'){
    if (data && Array.isArray(data)) {
      data.forEach((element: { id: string; characters: string }) => {
        figma.getNodeByIdAsync(element.id).then(async (node) => {
          if (node && node.type === 'TEXT') {
            const textNode = node as TextNode;
            try {
              if (textNode.fontName !== figma.mixed) {
                await figma.loadFontAsync(textNode.fontName as FontName);
              } else {
                console.warn(`Nodo ${element.id} ha font misti, impossibile caricarlo.`);
                return;
              }
              textNode.characters = element.characters;
            } catch (err) {
              console.error(`Errore nel caricare il font per node ${element.id}:`, err);
            }
          }
        });
      });
    }
  }
  
  if (msg.type === 'ui-closed') {
    figma.closePlugin();
  }
};
