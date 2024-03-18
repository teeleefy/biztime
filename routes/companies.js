// Routes for companies

const express = require("express");
const router = express.Router();
const db = require("../db");

/** Get all companies: [company, company, company] */
router.get('/', async function(req, res, next){
        try{
            const results = await db.query('SELECT * FROM companies');
            return res.json(results.rows);
        }
        catch(e){
            next(e);
        }
    }
);



module.exports = router;