// Routes for industries

const express = require("express");
const router = express.Router();
const ExpressError = require("../expressError")
const db = require("../db");

// Add routes for:

// - adding an industry
// - listing all industries, which should show the company code(s) for that industry
// - associating an industry to a company

//see all industries
router.get('/', async function(req, res, next){
        try{
            const results = await db.query('SELECT * FROM industries');
            // const compRes = await db.query(`SELECT comp_code FROM industry_company WHERE comp_code = $1`, [code]);
            let data = results.rows;
            let industries = await getIndustryWithCompanies(data);
            return res.json({industries: industries});
        }
        catch(e){
            return next(e);
        }
    }
);

async function getIndustryWithCompanies (array){
    //make empty array to return massive object with appropriate data at end of function;
    let allIndustries = [];
    //loop through each industry in the array
    for(let industry of array){
        //access the industry code
        let industry_code = industry.code
        //acquire all companies associated with each industry code
        const compResults = await db.query(`SELECT comp_code FROM industry_company WHERE ind_code = $1`, [industry.code]);
        let companies = compResults.rows;
        //formulate an individual object with info on the industry and its associated companies
        let industryWithCompany = {
            code: industry.code,
            industry: industry.industry,
            companies: companies,
        }
        //push the individual industry into the large object which will be returned by the function
        allIndustries.push(industryWithCompany);
    }
    return allIndustries;
}

//see industry_company relationships
router.get('/companies', async function(req, res, next){
        try{
            const results = await db.query('SELECT * FROM industry_company');
            return res.json({industries: results.rows});
        }
        catch(e){
            return next(e);
        }
    }
);

//add an industry
router.post('/', async function(req, res, next){
        try{
            let { code, industry } = req.body; 
            if(!code || !industry){
                throw new ExpressError('Missing data. Cannot add industry.', 400)
            }
            const results = await db.query(`INSERT INTO industries (code, industry) VALUES ($1, $2) RETURNING code, industry`, [code, industry]);
            return res.status(201).json({industry: results.rows});
        }
        catch(e){
            return next(e);
        }
    }
);

//add an industry to a company
router.post('/company', async function(req, res, next){
        try{
            let { ind_code, comp_code } = req.body; 
            if(!ind_code || !comp_code){
                throw new ExpressError('Missing data. Cannot add industry to company.', 400)
            }
            const results = await db.query(`INSERT INTO industry_company (ind_code, comp_code) VALUES ($1, $2) RETURNING id, ind_code, comp_code`, [ind_code, comp_code]);
            return res.status(201).json({industry_company: results.rows});
        }
        catch(e){
            return next(e);
        }
    }
);


module.exports = router;