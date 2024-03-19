\c biztime

DROP TABLE IF EXISTS invoices CASCADE;
DROP TABLE IF EXISTS companies CASCADE;
DROP TABLE IF EXISTS industries CASCADE;
DROP TABLE IF EXISTS industry_company CASCADE;

CREATE TABLE companies (
    code text PRIMARY KEY,
    name text NOT NULL UNIQUE,
    description text
);

CREATE TABLE invoices (
    id serial PRIMARY KEY,
    comp_code text NOT NULL REFERENCES companies ON DELETE CASCADE,
    amt float NOT NULL,
    paid boolean DEFAULT false NOT NULL,
    add_date date DEFAULT CURRENT_DATE NOT NULL,
    paid_date date,
    CONSTRAINT invoices_amt_check CHECK ((amt > (0)::double precision))
);

CREATE TABLE industries (
  code text PRIMARY KEY,
  industry text NOT NULL UNIQUE
);

CREATE TABLE industry_company (
  id serial PRIMARY KEY,
  ind_code text NOT NULL REFERENCES industries ON DELETE CASCADE,
  comp_code text NOT NULL REFERENCES companies ON DELETE CASCADE
);

INSERT INTO companies
  VALUES ('apple', 'Apple Computer', 'Maker of OSX.'),
         ('ibm', 'IBM', 'Big blue.'),
         ('wal', 'Wal-Mart', 'Department Store');

INSERT INTO invoices (comp_Code, amt, paid, paid_date)
  VALUES ('apple', 100, false, null),
         ('apple', 200, false, null),
         ('apple', 300, true, '2018-01-01'),
         ('ibm', 400, false, null);

INSERT INTO industries 
  VALUES ('acct', 'Accounting'),('sales', 'Sales Team'),('log', 'Logistics'),('serv', 'Customer Service'), ('mnt', 'Maintenance'), ('it', 'Technical Solutions Team');

INSERT INTO industry_company (ind_code, comp_code)
  VALUES ('acct', 'apple'), ('it', 'apple'), ('log', 'wal'), ('mnt', 'wal'), ('it', 'ibm'), ('serv', 'apple'), ('serv', 'wal'), ('serv', 'ibm');