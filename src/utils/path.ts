export const resolveUrl = (path: string): string =>
  import.meta.env.BASE_URL.slice(0, -1) + path;

export const processHtml = (html: string): string =>
  html.replace(/src="\//g, `src="${import.meta.env.BASE_URL}`);
