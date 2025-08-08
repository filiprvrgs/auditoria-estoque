// Dicionário padrão das classes conhecido a partir das imagens enviadas.
// Você pode expandir livremente esta lista. Caso exista `public/classes.json`,
// ele será mesclado por cima destes valores.

export interface ClassInfo {
  name: string
  category?: string
  warehouse?: string
}

export const DEFAULT_CLASS_DICTIONARY: Record<string, ClassInfo> = {
  // Rele (exemplos da imagem)
  "9098": { name: "Tampas", category: "Relé", warehouse: "Galpão 02" },
  "9601": { name: "Carcaças", category: "Relé", warehouse: "Galpão 02" },
  "9603": { name: "Embolos", category: "Relé", warehouse: "Galpão 02" },
  "9608": { name: "Isolantes", category: "Relé", warehouse: "Galpão 02" },
  "9609": { name: "Pinos Relay", category: "Relé", warehouse: "Galpão 02" },
  "9612": { name: "Parafusos de contato", category: "Relé", warehouse: "Galpão 02" },
  "9613": { name: "Chapas de contato", category: "Relé", warehouse: "Galpão 02" },
  "9615": { name: "Mancais flangeados", category: "Relé", warehouse: "Galpão 02" },
  "9616": { name: "Tubos de latão", category: "Relé", warehouse: "Galpão 02" },
  "9617": { name: "Mancais", category: "Relé", warehouse: "Galpão 02" },
  "9618": { name: "Molas", category: "Relé", warehouse: "Galpão 02" },
  "9619": { name: "Parafusos", category: "Relé", warehouse: "Galpão 02" },
  "9621": { name: "Porcas", category: "Relé", warehouse: "Galpão 02" },
  "9643": { name: "Parafuso de cobre", category: "Relé", warehouse: "Galpão 02" },
  // Alguns compostos marcados na imagem
  "9501": { name: "Embolagens", category: "Relé", warehouse: "Galpão 02" },
  "9145": { name: "Motores", category: "Relé", warehouse: "Galpão 02 - 05" },
  "9250": { name: "Fio de cobre", category: "Relé", warehouse: "Galpão 02 - 03" },

  // Matéria prima (exemplos)
  "9220": { name: "Fio Máquina", category: "Conformação", warehouse: "Galpão 02" },
  "9226": { name: "Arame trefilado na ZM", category: "Conformação", warehouse: "Galpão 02" },
  "9203": { name: "Chapas de Aço", category: "Estamparia", warehouse: "Galpão 04" },

  // Almox Geral (amostras da lista)
  "9527": { name: "Reatores", category: "ALMOX. GERAL", warehouse: "Galpão 03" },
  "9529": { name: "Luvas Diversas / EPI", category: "ALMOX. GERAL", warehouse: "Galpão 03" },
  "9530": { name: "Sapatos e Botas de Segurança", category: "ALMOX. GERAL", warehouse: "Galpão 03" },
  "9533": { name: "Peças Reposição / Empilhadeira", category: "ALMOX. GERAL", warehouse: "Galpão 03" },
}


