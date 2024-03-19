// // // Routes for invoices

const express = require("express");
const router = express.Router();
const ExpressError = require("../expressError");
const db = require("../db");

/** Get all companies: [company, company, company] */
router.get('/', async function(req, res, next){
        try{
            const results = await db.query('SELECT * FROM invoices');
            return res.json(results.rows);
        }
        catch(e){
            next(e);
        }
    }
);




module.exports = router;