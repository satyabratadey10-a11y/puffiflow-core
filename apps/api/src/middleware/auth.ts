import { Request, Response, NextFunction } from 'express';
import { getSupabaseClient } from '../services/supabase';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email?: string;
  };
}

export async function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    let token: string | null = null;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.replace('Bearer ', '').trim();
    } else if (req.body?.token) {
      token = req.body.token;
    }

    if (!token) {
      return res.status(401).json({ error: 'Unauthorized: Missing authentication token.' });
    }

    const supabaseAdmin = getSupabaseClient();
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ error: 'Unauthorized: Invalid or expired session token.' });
    }

    req.user = {
      id: user.id,
      email: user.email,
    };

    next();
  } catch (err: any) {
    console.error('[Auth Middleware Error]:', err.message || err);
    return res.status(401).json({ error: 'Unauthorized: Session verification failed.' });
  }
}
