import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';

type PageMetaProps = {
  title: string;
  description?: string;
  canonicalPath?: string;
  imageUrl?: string;
  type?: 'website' | 'article';
  noindex?: boolean;
};

const DEFAULT_SITE_URL = (import.meta.env.VITE_SITE_URL as string | undefined) ?? 'https://www.quincenalia.com';
const DEFAULT_IMAGE_PATH = '/hero.jpg';

function toAbsoluteUrl(input: string, siteUrl: string) {
  if (!input) return siteUrl;
  if (input.startsWith('http://') || input.startsWith('https://')) return input;
  return `${siteUrl.replace(/\/+$/, '')}/${input.replace(/^\/+/, '')}`;
}

function buildCanonicalUrl(siteUrl: string, pathname: string) {
  const base = siteUrl.replace(/\/+$/, '');
  const path = pathname.startsWith('/') ? pathname : `/${pathname}`;
  return `${base}${path}`;
}

export function PageMeta({
  title,
  description,
  canonicalPath,
  imageUrl,
  type = 'website',
  noindex,
}: PageMetaProps) {
  const location = useLocation();
  const siteUrl = DEFAULT_SITE_URL;

  const canonical = buildCanonicalUrl(siteUrl, canonicalPath ?? location.pathname);
  const ogImage = toAbsoluteUrl(imageUrl ?? DEFAULT_IMAGE_PATH, siteUrl);

  return (
    <Helmet>
      <html lang="es" />
      <title>{title}</title>
      {description ? <meta name="description" content={description} /> : null}
      <link rel="canonical" href={canonical} />

      {noindex ? <meta name="robots" content="noindex, nofollow" /> : null}

      <meta property="og:title" content={title} />
      {description ? <meta property="og:description" content={description} /> : null}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={canonical} />
      <meta property="og:image" content={ogImage} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      {description ? <meta name="twitter:description" content={description} /> : null}
      <meta name="twitter:image" content={ogImage} />
    </Helmet>
  );
}

