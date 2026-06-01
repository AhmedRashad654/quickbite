import {Router} from 'express';
import { pingDB } from '../../lib/knex/knex.js';

export const healthRouter = Router();

healthRouter.get('/', async(_req, res) => {
        await pingDB();
        res.status(200).send('OK');
});