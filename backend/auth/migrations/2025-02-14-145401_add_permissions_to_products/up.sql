/*
  Name: up.sql

  Description:
  This SQL script updates the `permissions` table in the database, defining the necessary 
  fields and constraints for managing user permissions.

  Programmer: Harrison Wendt
  Date Created: 2/14/25

  Revision History:
  - 2/14/25 - Harrison Wendt - Initial implementation of updated permissions.
  - 2/16/25 - Cody Duong - Make migration script idempotent.

  Preconditions:
  - A PostgreSQL database must exist and be connected.

  Acceptable Inputs:
  - A database migration system such as Diesel.

  Unacceptable Inputs:
  - Running this script on a database where the `permissions` table already exists 
    without checking for conflicts.

  Postconditions:
  - A `permissions` table will be created in the database.

  Return Values:
  - No return values; this script modifies the database schema.

  Error and Exception Conditions:
  - Database connection issues may prevent execution.

  Side Effects:
  - This script modifies the database schema, which may affect dependent queries.

  Invariants:
  - N/A

  Known Faults:
  - If executed multiple times without proper migration tracking, it may fail due to duplicate tables.
*/

INSERT INTO permissions (name)
SELECT name
FROM (
    VALUES
        ('create:product'), ('read:product'), ('update:product'), ('delete:product'),
        ('create:marketplace'), ('read:marketplace'), ('update:marketplace'), ('delete:marketplace'),
        ('create:price_report'), ('read:price_report'), ('update:price_report'), ('delete:price_report')
) AS new_permissions(name)
WHERE NOT EXISTS (
    SELECT 1
    FROM permissions
    WHERE permissions.name = new_permissions.name
);

