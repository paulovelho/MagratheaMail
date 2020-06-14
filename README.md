# MALTE - products API

## importing data:
- access products API container:
`docker exec -it botecaria-products-api /bin/sh`

- first import the suppliers:
`node importer/import_breweries`

-then import the  beers:
`node importer/import_products`






