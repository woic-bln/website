export const resolveUrl = (path: string): string =>
  import.meta.env.BASE_URL.replace(/\/$/, '') + path;

export const processHtml = (html: string): string => {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  return html.replace(/src="\//g, `src="${base}/`);
};
