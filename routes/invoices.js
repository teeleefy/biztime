// // // Routes for invoices

const express = require("express");
const router = express.Router();
const ExpressError = require("../expressError");
const db = require("../db");


// **GET /invoices :** Return info on invoices: like `{invoices: [{id, comp_code}, ...]}`
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

// **GET /invoices/[id] :** Returns obj on given invoice.
// If invoice cannot be found, returns 404. Returns `{invoice: {id, amt, paid, add_date, paid_date, company: {code, name, description}}}`
router.get('/:id', async function(req, res, next){
        try{
            let id = req.params.id; 
            const results = await db.query(`SELECT * FROM invoices INNER JOIN companies ON companies.code=invoices.comp_code WHERE id=$1`, [id]);
            if(results.rows.length === 0){
                throw new ExpressError('Did not find that invoice in our records', 404);
            }
            const data = results.rows[0];
            const invoice = {
                    id: data.id,
                    amt: data.amt,
                    paid: data.paid,
                    add_date: data.add_date,
                    paid_date: data.paid_date,
                    company: {
                        code: data.comp_code,
                        name: data.name,
                        description: data.description,
                    }
                };
            return res.json({invoice: invoice});
        }
        catch(e){
            return next(e);
        }
    }
);

// **POST /invoices :** Adds an invoice. Needs to be passed in JSON body of: `{comp_code, amt}`
// Returns: `{invoice: {id, comp_code, amt, paid, add_date, paid_date}}`

router.post('/', async function(req, res, next){
        try{
            let { compCode, amt} = req.body; 
            const results = await db.query(`INSERT INTO invoices (comp_code, amt) VALUES ($1, $2) RETURNING comp_code, amt, paid, add_date, paid_date`, [compCode, amt]);
            return res.status(201).json({invoice: results.rows[0]});
        }
        catch(e){
            return next(e);
        }
    }
);

// **PUT /invoices/[id] :** Updates an invoice. If invoice cannot be found, returns a 404.
// Needs to be passed in a JSON body of `{amt}` Returns: `{invoice: {id, comp_code, amt, paid, add_date, paid_date}}`

router.put('/:id', async function(req, res, next){
        try{
        const id = req.params.id; 

        //Check to see if invoice is in database;
        const currInvoiceInfo = await db.query(`SELECT * FROM invoices WHERE id = $1`, [id]);

        if (currInvoiceInfo.rows.length === 0) {
        throw new ExpressError(`Did not find that invoice in our records`, 404);
        }

        let amt = req.body.amt; 
        let paid = req.body.paid; 
        let paidDate;
        //Check if there is already a current paid_date recorded in the database;
        const currentPaidDate = currInvoiceInfo.rows[0].paid_date;
        const currentPaidStatus= currInvoiceInfo.rows[0].paid;
        if(typeof paid !== "boolean"){
            paid = currentPaidStatus;
        }
        //If amount has not been paid yet, then the paidDate will remain null.
        if(!paid){
            paidDate = null;
        } else {
            currentPaidDate ? paidDate = currentPaidDate: paidDate = new Date();
        }
        const results = await db.query('UPDATE invoices SET amt=$2, paid=$3, paid_date=$4 WHERE id=$1 RETURNING comp_code, amt, paid, add_date, paid_date', [id, amt, paid, paidDate]);
        return res.json({invoice: results.rows[0]});
        }
        catch(e){
            return next(e);
        }
});

// **DELETE /invoices/[id] :** Deletes an invoice.If invoice cannot be found, returns a 404. Returns: `{status: "deleted"}` Also, one route from the previous part should be updated:

router.delete('/:id', async function(req, res, next){
        try{
            let id = req.params.id; 
            const results = await db.query(`DELETE FROM invoices WHERE id=$1`, [id]);
            return res.send({ status : "deleted"});
        }
        catch(e){
            return next(e);
        }
    }
);


module.exports = router;