export const resolveUrl = (path: string): string =>
  import.meta.env.BASE_URL.replace(/\/$/, '') + path;

export const processHtml = (html: string): string =>
  html.replace(/src="\//g, `src="${import.meta.env.BASE_URL}`);
