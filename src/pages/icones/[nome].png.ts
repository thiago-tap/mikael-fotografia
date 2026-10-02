import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { APIRoute, GetStaticPaths } from 'astro';
import sharp from 'sharp';
import { arquivoDoIcone, tamanhosDoIcone, type NomeDoIcone } from '../../lib/marca';

const papel = '#faf8f5';
const transparente = { r: 0, g: 0, b: 0, alpha: 0 };

export const getStaticPaths = (() =>
  arquivoDoIcone ? Object.keys(tamanhosDoIcone).map((nome) => ({ params: { nome } })) : []) satisfies GetStaticPaths;

export const GET: APIRoute = async ({ params }) => {
  const { lado, fundo } = tamanhosDoIcone[params.nome as NomeDoIcone];
  const original = readFileSync(join(process.cwd(), arquivoDoIcone!));
  const { format, width = lado, height = lado } = await sharp(original).metadata();
  const densidade = format === 'svg' ? Math.min(2400, Math.max(72, (72 * lado * 2) / Math.min(width, height))) : undefined;
  const margem = fundo ? Math.round(lado * 0.12) : 0;
  const desenho = await sharp(original, { density: densidade })
    .resize(lado - margem * 2, lado - margem * 2, { fit: 'contain', background: transparente })
    .png()
    .toBuffer();
  const icone = fundo
    ? sharp(desenho).extend({ top: margem, bottom: margem, left: margem, right: margem, background: papel }).flatten({ background: papel })
    : sharp(desenho);
  const png = await icone.png({ compressionLevel: 9 }).toBuffer();
  return new Response(new Uint8Array(png), { headers: { 'Content-Type': 'image/png' } });
};
