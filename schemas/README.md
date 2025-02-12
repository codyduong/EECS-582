## Schemas for various endpoint models

Primarily used to validate data export. Typically endpoints will validate with
a less strict model.

Generated from [/tooling/schema-gen](../tooling/schema-gen/) and manually
refined to improve schema behavior. IE. a pattern matcher may be restricted
even further than what can be intepreted by serdejson.