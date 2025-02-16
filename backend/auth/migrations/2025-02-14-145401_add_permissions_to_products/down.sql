/*
  Name: down.sql

  Description:
  This SQL script reverts corresponding up.sql changes in the database.

  Programmer: Harrison Wendt
  Date Created: 2/14/25

  Revision History:
  - 2/14/25 - Harrison Wendt - Initial implementation of updated permissions.
  - 2/16/25 - Cody Duong - Remove unnecessary table drop.

  Preconditions:
  - The `permissions` table must exist before running this script.

  Acceptable Inputs:
  - A PostgreSQL database with a `permissions` table.

  Unacceptable Inputs:
  - Running this script on a database where the `permissions` table does not exist.

  Postconditions:
  - Some values will be removed from the `permissions` table.

  Return Values:
  - No return values; this script modifies the database schema.

  Error and Exception Conditions:
  - Dropping a non-existent table will cause an error unless handled.
  - Dependencies on the `permissions` table must be resolved before execution.

  Side Effects:
  - This script permanently deletes the `permissions` table and all associated data.

  Invariants:
  - N/A

  Known Faults:
  - Running this script in a production environment without backups may lead to data loss.
*/

DELETE FROM permissions WHERE name IN (
    'create:product', 'read:product', 'update:product', 'delete:product',
    'create:marketplace', 'read:marketplace', 'update:marketplace', 'delete:marketplace',
    'create:price_report', 'read:price_report', 'update:price_report', 'delete:price_report'
);

