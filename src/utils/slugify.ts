export const generateSlug = (text: string): string => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .normalize('NFD')                // Separa letras de acentos para poder quitarlos
    .replace(/[\u0300-\u036f]/g, '') // Borra los acentos
    .replace(/\s+/g, '-')            // Cambia espacios por guiones
    .replace(/[^\w-]+/g, '')         // Borra caracteres especiales ($, %, &, etc)
    .replace(/--+/g, '-')            // Si quedaron guiones dobles, los hace uno solo
    .replace(/^-+/, '')              // Quita guiones al inicio
    .replace(/-+$/, '');             // Quita guiones al final
};