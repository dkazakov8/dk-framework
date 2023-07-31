export function setResponseStatus({
  res,
  route,
  routes,
  isClient,
}: {
  res: any;
  route: any;
  routes: any;
  isClient: boolean;
}) {
  if (isClient) return Promise.resolve();

  // eslint-disable-next-line @typescript-eslint/no-magic-numbers
  if (route.name === routes.error404.name) res.status(404);

  // eslint-disable-next-line @typescript-eslint/no-magic-numbers
  if (route.name === routes.error500.name) res.status(500);

  return Promise.resolve();
}
