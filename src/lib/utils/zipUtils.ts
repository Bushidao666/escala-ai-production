import JSZip from 'jszip';
import { saveAs } from 'file-saver';

// Tipos para o sistema de download
export interface CreativeForDownload {
  id: string;
  title: string;
  format: string;
  result_url: string;
  style?: string;
  created_at: string;
  type: 'creative' | 'request';
  request_id?: string | null;
}

export interface DownloadProgress {
  current: number;
  total: number;
  status: 'preparing' | 'downloading' | 'zipping' | 'complete' | 'error';
  message: string;
  error?: string;
}

export interface DownloadResult {
  success: boolean;
  downloadedCount: number;
  failedCount: number;
  failedItems: string[];
  zipSize?: number;
  error?: string;
}

/**
 * 🗜️ FUNÇÃO PRINCIPAL: Cria ZIP organizado com criativos agrupados por formato
 */
export async function createOrganizedCreativesZip(
  creatives: CreativeForDownload[], 
  onProgress?: (progress: DownloadProgress) => void
): Promise<DownloadResult> {
  const zip = new JSZip();
  let downloadedCount = 0;
  let failedCount = 0;
  const failedItems: string[] = [];
  
  try {
    // 🎯 ETAPA 1: Preparação e validação
    onProgress?.({
      current: 0,
      total: creatives.length,
      status: 'preparing',
      message: 'Preparando download...'
    });

    const validCreatives = creatives.filter(creative => creative.result_url);
    if (validCreatives.length === 0) {
      throw new Error('Nenhum criativo válido encontrado para download');
    }

    // 🗂️ ETAPA 2: Organizar por formato
    const creativesByFormat = organizeCreativesByFormat(validCreatives);
    
    // 🔍 ETAPA 3A: Validação prévia das URLs
    console.log(`🔍 Validando ${validCreatives.length} URLs antes do download...`);
    const validationResults: Array<{ creative: CreativeForDownload, valid: boolean, error?: string }> = [];
    
    // Testar URLs em lotes pequenos para não sobrecarregar
    for (let i = 0; i < validCreatives.length; i += 10) {
      const batch = validCreatives.slice(i, i + 10);
      const batchPromises = batch.map(async (creative) => {
        if (!creative.result_url || typeof creative.result_url !== 'string') {
          return { creative, valid: false, error: 'URL vazia ou inválida' };
        }
        
        try {
          new URL(creative.result_url);
        } catch {
          return { creative, valid: false, error: 'URL malformada' };
        }

        // Teste rápido de acessibilidade
        const testResult = await testImageUrl(creative.result_url);
        return { 
          creative, 
          valid: testResult.accessible, 
          error: testResult.error,
          size: testResult.size,
          type: testResult.type
        };
      });
      
      const batchResults = await Promise.all(batchPromises);
      validationResults.push(...batchResults);
      
      console.log(`✅ Validação lote ${Math.floor(i/10) + 1}: ${batchResults.filter(r => r.valid).length}/${batchResults.length} URLs válidas`);
    }
    
    const validUrls = validationResults.filter(r => r.valid);
    const invalidUrls = validationResults.filter(r => !r.valid);
    
    console.log(`📊 Resultado da validação: ${validUrls.length}/${validCreatives.length} URLs acessíveis`);
    
    if (invalidUrls.length > 0) {
      console.warn(`⚠️ ${invalidUrls.length} URLs problemáticas:`, 
        invalidUrls.slice(0, 5).map(r => `${r.creative.title}: ${r.error}`)
      );
      if (invalidUrls.length > 5) {
        console.warn(`... e mais ${invalidUrls.length - 5} URLs com problemas`);
      }
    }

    // Filtrar apenas criativos com URLs válidas para download
    const creativesToDownload = validUrls.map(r => r.creative);

    // 📥 ETAPA 3B: Download paralelo com limite de concorrência
    console.log(`🚀 Iniciando download de ${creativesToDownload.length} criativos com URLs válidas...`);
    
    // 🗂️ PRÉ-CRIAÇÃO: Criar todas as pastas necessárias no ZIP
    const requiredFolders = new Set(creativesToDownload.map(c => getFolderNameForFormat(c.format)));
    console.log(`📁 Criando pastas necessárias:`, Array.from(requiredFolders));
    
    for (const folderName of requiredFolders) {
      const folder = zip.folder(folderName);
      if (!folder) {
        throw new Error(`Falha crítica: não foi possível criar pasta ${folderName}`);
      }
      console.log(`✅ Pasta criada: ${folderName}`);
    }
    
    // 🔍 Verificar duplicatas de nomes de arquivo ANTES do download
    const fileNames = new Set<string>();
    const duplicateCheck = creativesToDownload.map(creative => {
      const fileName = generateSafeFileName(creative);
      const folderName = getFolderNameForFormat(creative.format);
      const fullPath = `${folderName}/${fileName}`;
      
      console.log(`🔍 Verificando: ${creative.title} (ID: ${creative.id.substring(0, 8)}) → ${fullPath}`);
      
      if (fileNames.has(fullPath)) {
        console.error(`🚨 DUPLICATA DETECTADA: ${fullPath}`);
        console.error(`   - Criativo atual: ${creative.title} (ID: ${creative.id})`);
        console.error(`   - Nome gerado: ${fileName}`);
        return { creative, fileName, fullPath, duplicate: true };
      }
      
      fileNames.add(fullPath);
      return { creative, fileName, fullPath, duplicate: false };
    });
    
    const duplicatesFound = duplicateCheck.filter(item => item.duplicate);
    if (duplicatesFound.length > 0) {
      console.error(`🚨 ${duplicatesFound.length} duplicatas encontradas antes do download!`);
      duplicatesFound.forEach(item => {
        console.error(`   - ${item.fileName} (${item.creative.title})`);
      });
    } else {
      console.log(`✅ Verificação de duplicatas: ${creativesToDownload.length} nomes únicos gerados`);
    }
    
    // Adicionar criativos com URLs inválidas ao relatório de falhas
    for (const invalidResult of invalidUrls) {
      failedItems.push(`${invalidResult.creative.title}: ${invalidResult.error}`);
      failedCount++;
    }
    
    // 🔄 DOWNLOADS SEQUENCIAIS PARA MÁXIMO CONTROLE
    console.log(`🚀 Iniciando downloads SEQUENCIAIS para controle total...`);
    
    for (let index = 0; index < creativesToDownload.length; index++) {
      const creative = creativesToDownload[index];
      const progressNum = index + 1;
      
      try {
        console.log(`\n🎯 [${progressNum}/${creativesToDownload.length}] Processando: ${creative.title}`);
        console.log(`🆔 ID: ${creative.id}`);
        console.log(`🔗 URL: ${creative.result_url}`);

        // Verificar URL antes do download
        if (!creative.result_url || typeof creative.result_url !== 'string') {
          throw new Error('URL da imagem não encontrada');
        }

        onProgress?.({
          current: progressNum,
          total: creativesToDownload.length,
          status: 'downloading',
          message: `Baixando ${creative.title}... (${progressNum}/${creativesToDownload.length})`
        });

        // 📥 Download da imagem
        console.log(`📥 Iniciando download...`);
        const imageBlob = await downloadImageWithRetry(creative.result_url, 3);
        console.log(`✅ Download concluído: ${imageBlob.size} bytes`);
        
        // 📁 Preparar nomes e caminhos
        const folderName = getFolderNameForFormat(creative.format);
        const fileName = generateSafeFileName(creative);
        const zipPath = `${folderName}/${fileName}`;
        
        console.log(`📂 Pasta: ${folderName}`);
        console.log(`📄 Arquivo: ${fileName}`);
        console.log(`🗂️ Caminho completo: ${zipPath}`);
        
        // 📦 Adicionar ao ZIP com verificação DUPLA
        console.log(`📦 Adicionando ao ZIP...`);
        const folder = zip.folder(folderName);
        
        if (!folder) {
          throw new Error(`Pasta ${folderName} não existe no ZIP`);
        }
        
        // Contar arquivos ANTES da adição
        const filesBeforeAdd = Object.keys(zip.files).length;
        console.log(`📊 Arquivos no ZIP antes: ${filesBeforeAdd}`);
        
        // Adicionar arquivo
        folder.file(fileName, imageBlob);
        
        // Contar arquivos DEPOIS da adição
        const filesAfterAdd = Object.keys(zip.files).length;
        console.log(`📊 Arquivos no ZIP depois: ${filesAfterAdd}`);
        
        // Verificação TRIPLA
        if (zip.files[zipPath]) {
          console.log(`✅ SUCESSO: Arquivo confirmado no ZIP: ${zipPath}`);
          downloadedCount++;
          console.log(`📈 Total baixados: ${downloadedCount}`);
        } else {
          console.error(`🚨 FALHA CRÍTICA: Arquivo não foi adicionado: ${zipPath}`);
          console.error(`🔍 Arquivos atuais no ZIP:`, Object.keys(zip.files));
          throw new Error(`Falha ao adicionar ${fileName} ao ZIP`);
        }
        
        // Log de todos os arquivos no ZIP a cada 10 downloads
        if (downloadedCount % 10 === 0) {
          const allFiles = Object.keys(zip.files).filter(f => f !== 'README.txt');
          console.log(`📋 [Checkpoint ${downloadedCount}] Arquivos no ZIP:`, allFiles.length);
          console.log(`📁 Primeiros 5:`, allFiles.slice(0, 5));
        }
        
      } catch (error: any) {
        console.error(`❌ [${progressNum}/${creativesToDownload.length}] ERRO:`, {
          title: creative.title,
          error: error.message,
          url: creative.result_url?.substring(0, 100)
        });
        
        failedItems.push(`${creative.title}: ${error.message}`);
        failedCount++;
      }
    }
    
    console.log(`📊 Download concluído: ${downloadedCount} sucessos, ${failedCount} falhas de ${validCreatives.length} total`);
    
    // 🔍 ANÁLISE FINAL COMPLETA DO ZIP
    console.log(`\n📊 ============ ANÁLISE FINAL DO ZIP ============`);
    
    const allZipFiles = Object.keys(zip.files);
    const imageFiles = allZipFiles.filter(name => name !== 'README.txt' && !name.endsWith('/'));
    const folderEntries = allZipFiles.filter(name => name.endsWith('/'));
    
    console.log(`📁 Total de entradas no ZIP: ${allZipFiles.length}`);
    console.log(`🖼️ Arquivos de imagem: ${imageFiles.length}`);
    console.log(`📂 Pastas: ${folderEntries.length}`);
    console.log(`📋 Pastas encontradas:`, folderEntries);
    
    // Análise detalhada por pasta
    const folderStats = imageFiles.reduce((acc, file) => {
      const folder = file.split('/')[0];
      if (!acc[folder]) acc[folder] = [];
      acc[folder].push(file);
      return acc;
    }, {} as Record<string, string[]>);
    
    console.log(`📊 Distribuição detalhada:`);
    Object.entries(folderStats).forEach(([folder, files]) => {
      console.log(`   📁 ${folder}: ${files.length} arquivos`);
      if (files.length <= 5) {
        console.log(`      📄 Arquivos:`, files);
      } else {
        console.log(`      📄 Primeiros 3:`, files.slice(0, 3));
        console.log(`      📄 Últimos 2:`, files.slice(-2));
      }
    });
    
    console.log(`📊 COMPARAÇÃO FINAL:`);
    console.log(`   🎯 Downloads esperados: ${downloadedCount}`);
    console.log(`   📦 Arquivos no ZIP: ${imageFiles.length}`);
    console.log(`   ❌ Falhas: ${failedCount}`);
    console.log(`   📈 Total processado: ${downloadedCount + failedCount}`);
    
    if (imageFiles.length !== downloadedCount) {
      console.error(`🚨 DISCREPÂNCIA CRÍTICA: ${Math.abs(downloadedCount - imageFiles.length)} arquivos perdidos!`);
      console.error(`🔍 Primeira análise das discrepâncias...`);
      
      if (imageFiles.length < downloadedCount) {
        console.error(`   💸 ${downloadedCount - imageFiles.length} arquivos PERDIDOS durante o processo`);
      } else {
        console.error(`   🤔 ${imageFiles.length - downloadedCount} arquivos EXTRAS no ZIP?!`);
      }
    } else {
      console.log(`✅ PERFEITO: Todos os ${downloadedCount} arquivos estão no ZIP!`);
    }
    
    console.log(`📊 ===============================================\n`);

    // 🔧 VERIFICAÇÃO FINAL DE INTEGRIDADE 
    console.log(`🔧 Verificação final de integridade do ZIP...`);
    const expectedFolders = [...requiredFolders];
    const actualFolders = folderEntries.map(f => f.replace('/', ''));
    
    console.log(`📁 Pastas esperadas:`, expectedFolders);
    console.log(`📁 Pastas encontradas:`, actualFolders);
    
    const missingFolders = expectedFolders.filter(f => !actualFolders.includes(f));
    if (missingFolders.length > 0) {
      console.error(`🚨 PASTAS FALTANDO:`, missingFolders);
    }

    // 📋 ETAPA 4: Criar arquivo README com metadados
    const readme = generateReadmeContent(validCreatives, downloadedCount, failedCount, failedItems);
    zip.file('README.txt', readme);

    // 🗜️ ETAPA 5: Gerar ZIP
    onProgress?.({
      current: downloadedCount,
      total: validCreatives.length,
      status: 'zipping',
      message: 'Criando arquivo ZIP...'
    });

    const zipBlob = await zip.generateAsync({
      type: 'blob',
      compression: 'DEFLATE',
      compressionOptions: { level: 6 }
    });

    // 💾 ETAPA 6: Trigger download
    const fileName = generateZipFileName();
    saveAs(zipBlob, fileName);

    onProgress?.({
      current: downloadedCount,
      total: validCreatives.length,
      status: 'complete',
      message: `Download concluído! ${downloadedCount} criativos baixados.`
    });

    return {
      success: true,
      downloadedCount,
      failedCount,
      failedItems,
      zipSize: zipBlob.size
    };

  } catch (error: any) {
    console.error('Erro no download em lote:', error);
    
    onProgress?.({
      current: downloadedCount,
      total: creatives.length,
      status: 'error',
      message: 'Erro durante o download',
      error: error.message
    });

    return {
      success: false,
      downloadedCount,
      failedCount: creatives.length - downloadedCount,
      failedItems: [...failedItems, 'Erro geral no processo'],
      error: error.message
    };
  }
}

/**
 * 🗂️ Organiza criativos por formato para estrutura de pastas
 */
function organizeCreativesByFormat(creatives: CreativeForDownload[]) {
  return creatives.reduce((acc, creative) => {
    const format = creative.format;
    if (!acc[format]) {
      acc[format] = [];
    }
    acc[format].push(creative);
    return acc;
  }, {} as Record<string, CreativeForDownload[]>);
}

/**
 * 📁 Gera nome da pasta baseado no formato
 */
function getFolderNameForFormat(format: string): string {
  const formatLabels: Record<string, string> = {
    '1:1': '1x1-Feed',
    '9:16': '9x16-Stories', 
    '16:9': '16x9-Google',
    '4:3': '4x3-Display',
    '3:4': '3x4-Vertical'
  };
  
  return formatLabels[format] || `${format}-Outros`;
}

/**
 * 📄 Gera nome seguro e ÚNICO para arquivo (sanitização + ID único)
 */
function generateSafeFileName(creative: CreativeForDownload): string {
  // Sanitizar título removendo caracteres especiais
  const safeTitle = creative.title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .replace(/[^a-z0-9\s-]/g, '') // Remove caracteres especiais
    .replace(/\s+/g, '-') // Espaços viram hífens
    .replace(/-+/g, '-') // Múltiplos hífens viram um
    .substring(0, 40); // Reduzir para dar espaço ao ID único
  
  // Detectar extensão da URL
  const extension = getFileExtensionFromUrl(creative.result_url) || 'png';
  
  // 🔑 Gerar identificador único baseado no ID do criativo
  const uniqueId = creative.id.substring(0, 8); // Primeiros 8 caracteres do UUID
  
  // Formato: titulo-ID-formato.extensao
  const finalName = `${safeTitle}-${uniqueId}-${creative.format}.${extension}`;
  
  // Log apenas se houver problemas potenciais (título muito longo, etc.)
  if (creative.title.length > 60 || safeTitle.length < 10) {
    console.log(`🏗️ Nome especial: "${creative.title}" → "${finalName}"`);
  }
  
  return finalName;
}

/**
 * 🔗 Extrai extensão do arquivo da URL
 */
function getFileExtensionFromUrl(url: string): string | null {
  try {
    const pathname = new URL(url).pathname;
    const extension = pathname.split('.').pop()?.toLowerCase();
    return ['png', 'jpg', 'jpeg', 'webp'].includes(extension || '') ? (extension || null) : null;
  } catch {
    return null;
  }
}

/**
 * 🔍 Testa se uma URL de imagem está acessível
 */
async function testImageUrl(url: string): Promise<{ accessible: boolean, error?: string, size?: number, type?: string }> {
  try {
    const response = await fetch(url, {
      method: 'HEAD', // Usar HEAD para não baixar o arquivo todo
      headers: {
        'Accept': 'image/*',
        'User-Agent': 'Creative-Generator/1.0'
      },
      signal: AbortSignal.timeout(10000) // 10 segundos timeout
    });

    if (!response.ok) {
      return {
        accessible: false,
        error: `HTTP ${response.status}: ${response.statusText}`
      };
    }

    const contentType = response.headers.get('content-type') || '';
    const contentLength = parseInt(response.headers.get('content-length') || '0');

    if (!contentType.startsWith('image/')) {
      return {
        accessible: false,
        error: `Não é uma imagem: ${contentType}`
      };
    }

    return {
      accessible: true,
      size: contentLength,
      type: contentType
    };

  } catch (error: any) {
    return {
      accessible: false,
      error: error.message
    };
  }
}

/**
 * 📥 Download de imagem com retry automático
 */
async function downloadImageWithRetry(url: string, maxRetries: number): Promise<Blob> {
  let lastError: Error;
  
  // 🔍 Validação prévia da URL
  if (!url || typeof url !== 'string') {
    throw new Error(`URL inválida: ${url}`);
  }

  // Verificar se é uma URL válida
  try {
    new URL(url);
  } catch {
    throw new Error(`URL malformada: ${url}`);
  }

  console.log(`🔄 Iniciando download: ${url}`);
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`📥 Tentativa ${attempt}/${maxRetries} para: ${url.substring(0, 100)}...`);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'image/*',
          'User-Agent': 'Creative-Generator/1.0'
        },
        // Adicionar timeout de 30 segundos
        signal: AbortSignal.timeout(30000)
      });
      
      console.log(`📊 Response status: ${response.status} ${response.statusText} para ${url.substring(0, 50)}...`);
      
      if (!response.ok) {
        const errorText = await response.text().catch(() => 'N/A');
        throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`);
      }
      
      const contentType = response.headers.get('content-type') || '';
      console.log(`📄 Content-Type: ${contentType} para ${url.substring(0, 50)}...`);
      
      const blob = await response.blob();
      console.log(`📦 Blob size: ${blob.size} bytes, type: ${blob.type} para ${url.substring(0, 50)}...`);
      
      // Validar se é uma imagem válida (mais flexível)
      if (!blob.type.startsWith('image/') && !contentType.startsWith('image/')) {
        throw new Error(`Tipo de arquivo inválido: ${blob.type || contentType || 'unknown'}`);
      }

      // Validar tamanho mínimo (evitar downloads vazios)
      if (blob.size < 100) {
        throw new Error(`Arquivo muito pequeno: ${blob.size} bytes`);
      }
      
      console.log(`✅ Download bem-sucedido: ${url.substring(0, 50)}... (${blob.size} bytes)`);
      return blob;
      
    } catch (error: any) {
      lastError = error;
      console.error(`❌ Tentativa ${attempt}/${maxRetries} falhou para ${url.substring(0, 50)}...:`, {
        message: error.message,
        name: error.name,
        stack: error.stack?.substring(0, 200)
      });
      
      // Se não é a última tentativa, aguardar antes de tentar novamente
      if (attempt < maxRetries) {
        const delay = Math.min(1000 * attempt, 5000); // Max 5 segundos
        console.log(`⏱️ Aguardando ${delay}ms antes da próxima tentativa...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  console.error(`🚫 Falha definitiva no download após ${maxRetries} tentativas: ${url}`);
  throw lastError!;
}

/**
 * ⚡ Executa promises com limite de concorrência
 */
async function executeWithConcurrencyLimit<T>(promises: Promise<T>[], limit: number): Promise<T[]> {
  const results: T[] = [];
  const executing: Promise<any>[] = [];
  
  for (const promise of promises) {
    const wrappedPromise = promise.then(result => {
      results.push(result);
      return result;
    });
    
    executing.push(wrappedPromise);
    
    if (executing.length >= limit) {
      await Promise.race(executing);
      executing.splice(executing.findIndex(p => p === wrappedPromise), 1);
    }
  }
  
  await Promise.all(executing);
  return results;
}

/**
 * 📋 Gera conteúdo do arquivo README
 */
function generateReadmeContent(
  creatives: CreativeForDownload[], 
  downloadedCount: number, 
  failedCount: number,
  failedItems: string[] = []
): string {
  const now = new Date();
  const formatDate = (date: Date) => date.toLocaleString('pt-BR');
  
  // Estatísticas por formato
  const formatStats = creatives.reduce((acc, creative) => {
    acc[creative.format] = (acc[creative.format] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const successRate = creatives.length > 0 ? Math.round((downloadedCount / creatives.length) * 100) : 0;
  
  return `# Download de Criativos - ${formatDate(now)}

## Resumo do Download
- ✅ Criativos baixados com sucesso: ${downloadedCount}
- ❌ Falhas no download: ${failedCount}
- 📊 Total de criativos: ${creatives.length}
- 📈 Taxa de sucesso: ${successRate}%
- 📅 Data do download: ${formatDate(now)}

## Estatísticas por Formato
${Object.entries(formatStats).map(([format, count]) => `- **${format}**: ${count} criativos`).join('\n')}

## Organização das Pastas
Os criativos foram organizados por formato para facilitar o uso:

### 📁 Estrutura de Pastas:
- **1x1-Feed/**: Criativos quadrados para feed do Instagram (1:1)
- **9x16-Stories/**: Criativos verticais para Stories (9:16)  
- **16x9-Google/**: Criativos horizontais para Google Ads (16:9)
- **4x3-Display/**: Criativos para display ads (4:3)
- **3x4-Vertical/**: Criativos verticais para Pinterest (3:4)

### 📄 Nomenclatura dos Arquivos:
Formato: \`titulo-do-criativo-formato.extensao\`
Exemplo: \`campanha-verao-1x1.png\`

## Detalhes dos Criativos

${creatives.map((creative, index) => {
  const status = index < downloadedCount ? '✅' : '❌';
  return `${status} ${creative.title} (${creative.format}) - ${formatDate(new Date(creative.created_at))}`;
}).join('\n')}

${failedItems.length > 0 ? `
## 🔍 Análise das Falhas

As seguintes falhas foram identificadas durante o download:

${failedItems.map((item, index) => `${index + 1}. ${item}`).join('\n')}

### Possíveis Causas:
- URLs de imagens inacessíveis ou expiradas
- Problemas de conectividade durante o download
- Imagens corrompidas ou em formato inválido
- Timeout de conexão (>30 segundos por imagem)

### Como Resolver:
1. Verifique se as imagens ainda estão disponíveis na galeria
2. Tente fazer o download novamente (algumas falhas podem ser temporárias)
3. Se o problema persistir, entre em contato com o suporte técnico
` : ''}

---
Gerado automaticamente pelo Creative Generator
${now.toISOString()}
`;
}

/**
 * 📦 Gera nome do arquivo ZIP com timestamp
 */
function generateZipFileName(): string {
  const now = new Date();
  const timestamp = now.toISOString()
    .slice(0, 16) // YYYY-MM-DDTHH:MM
    .replace('T', '-')
    .replace(':', 'h') + 'm';
  
  return `criativos-${timestamp}.zip`;
}

/**
 * 🧮 Calcula tamanho estimado do ZIP
 */
export function estimateZipSize(creatives: CreativeForDownload[]): string {
  // Estimativa baseada em tamanho médio de imagem (500KB por criativo)
  const estimatedBytes = creatives.length * 500 * 1024;
  return formatFileSize(estimatedBytes);
}

/**
 * 📏 Formata tamanho de arquivo para exibição
 */
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
} 