export function formatBytes(size: number) {
  if (!size) return '0 B';
  const i = Math.floor(Math.log(size) / Math.log(1024));
  return (size / Math.pow(1024, i)).toFixed(1) + [' B',' KB',' MB',' GB',' TB'][i];
}
