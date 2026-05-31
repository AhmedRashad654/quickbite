import {Router} from 'express';
import { pingDB } from '../../lib/knex/knex.js';

export const healthRouter = Router();

healthRouter.get('/', async(_req, res) => {
    try {
        await pingDB();
        res.status(200).send('OK');
    }
    catch {
        res.status(500).send({
            message: "db down",
        });
    }
});