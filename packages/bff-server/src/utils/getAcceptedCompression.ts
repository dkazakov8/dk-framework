import { Request } from 'express';

import { compressions } from './compressions';

export function getAcceptedCompression(req: Request) {
  const acceptedEncodings = req.acceptsEncodings();

  return compressions.find(({ encoding }) => acceptedEncodings.includes(encoding));
}
