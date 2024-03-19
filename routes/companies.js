// Routes for companies

const express = require("express");
const router = express.Router();
const ExpressError = require("../expressError")
const db = require("../db");
const slugify = require('slugify');

/** Get all companies: [company, company, company] */
// **GET /companies :** Returns list of companies, like `{companies: [{code, name}, ...]}`
router.get('/', async function(req, res, next){
        try{
            const results = await db.query('SELECT * FROM companies');
            return res.json({companies: results.rows});
        }
        catch(e){
            return next(e);
        }
    }
);

// **GET /companies/[code] :** Return obj of company: `{company: {code, name, description}}`
// If the company given cannot be found, this should return a 404 status response.


router.get('/:code', async function(req, res, next){
        try{
            let code = req.params.code; 
            const companyRes = await db.query(`SELECT * FROM companies WHERE code=$1`, [code]);
            //acquire invoices associated with this company
            const invoicesRes = await db.query(`SELECT id FROM invoices WHERE comp_code = $1`, [code]);
            //acquire industries associated with this company
            const indRes = await db.query(`SELECT ind_code FROM industry_company WHERE comp_code = $1`, [code]);
            let industries = indRes.rows;
            //
            if(companyRes.rows.length === 0){
                throw new ExpressError('Did not find that company in our records', 404);
            }
            const company = companyRes.rows[0];
            const invoices = invoicesRes.rows;
            company.invoices = invoices.map(inv => inv.id);
            company.industries = industries;
            return res.json({company: company});
        }
        catch(e){
            return next(e);
        }   
    }
);

// **POST /companies :** Adds a company. Needs to be given JSON like: `{code, name, description}` Returns obj of new company:  `{company: {code, name, description}}`
router.post('/', async function(req, res, next){
        try{
            const { name, description } = req.body; 
            const code = slugify(name, {lower: true});
            const results = await db.query(`INSERT INTO companies (code, name, description) VALUES ($1, $2, $3) RETURNING code, name, description`, [code, name, description]);
            return res.status(201).json({company: results.rows});
        }
        catch(e){
            return next(e);
        }
    }
);


// ### **Routes Needed**

// **PUT /companies/[code] :** Edit existing company. Should return 404 if company cannot be found.
// Needs to be given JSON like: `{name, description}` Returns update company object: `{company: {code, naime, description}}`
router.put('/:code', async function(req, res, next){
        try{
        let code = req.params.code; 
        //Check to see if the code  is a valid company
        const currentCompanyDetails = await db.query(`SELECT * FROM companies WHERE code=$1`, [code]);
        if(currentCompanyDetails.rows.length === 0){
            throw new ExpressError(`Did not find that company in our records`, 404)
        }
        //check to see if name was updated. Set to current name if not;
        let name= req.body.name;
        if(!name){
            name = currentCompanyDetails.rows[0].name;
        }
        //check to see if description was updated. Set to current description if not;
        let description= req.body.description;
        if(!description){
            description = currentCompanyDetails.rows[0].description;
        }
        const results = await db.query('UPDATE companies SET name=$2, description=$3 WHERE code=$1 RETURNING code, name, description', [code, name, description]);

        return res.json({company: results.rows[0]});
        }
        catch(e){
            return next(e);
        }
});




// **DELETE /companies/[code] :** Deletes company. Should return 404 if company cannot be found.
// Returns `{status: "deleted"}`
router.delete('/:code', async function(req, res, next){
        try{
            let code = req.params.code; 
            const results = await db.query(`DELETE FROM companies WHERE code=$1`, [code]);
            return res.send({ status : "deleted"});
        }
        catch(e){
            return next(e);
        }
    }
);



module.exports = router;