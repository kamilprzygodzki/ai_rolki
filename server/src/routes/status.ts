import { Router, Request, Response } from 'express';
import { getSession, subscribe } from '../services/session.store';

const router = Router();

router.get('/:id', (req: Request<{ id: string }>, res: Response) => {
  const { id } = req.params;
  const session = getSession(id);

  if (!session) {
    res.status(404).json({ error: 'Sesja nie znaleziona' });
    return;
  }

  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
  });

  // Send current state
  res.write(`data: ${JSON.stringify(session)}\n\n`);

  if (session.status === 'done' || session.status === 'error') {
    res.end();
    return;
  }

  const unsubscribe = subscribe(id, (updated) => {
    res.write(`data: ${JSON.stringify(updated)}\n\n`);

    if (updated.status === 'done' || updated.status === 'error') {
      res.end();
      unsubscribe();
    }
  });

  req.on('close', () => {
    unsubscribe();
  });
});

export default router;
