/**
 * Resolve um caminho de asset público (ex: "/images/foo.jpg") relativo ao
 * BASE_URL configurado no Vite. Necessário porque o site é publicado em um
 * subcaminho (github.io/sitezinho/) e não na raiz do domínio.
 */
export function assetUrl(path) {
  if (!path) return path;
  const base = import.meta.env.BASE_URL || '/';
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  return base.endsWith('/') ? `${base}${cleanPath}` : `${base}/${cleanPath}`;
}
