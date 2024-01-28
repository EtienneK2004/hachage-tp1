
import {createServer} from "node:http"
import {create, liste} from "./blockchain.js";
import {NotFoundError} from "./errors.js";
import {findBlock, findLastBlock, verifBlocks} from "./blockchainStorage.js";

createServer(async (req, res) => {
        res.setHeader('Content-Type', 'application/json')
        const url = new URL(req.url, `http://${req.headers.host}`)
        const endpoint = `${req.method}:${url.pathname}`

        let results

        try {
            switch (endpoint) {
                case 'GET:/blockchain':
                //On verifie si le param 'id' est présent, pour appeler findBlock au lieu de liste
                    if(url.searchParams.has('id'))
                        results = await findBlock(url.searchParams.get('id'));
                    else
                        results = await liste(req, res, url);

                    console.log("results GET", results);
                    break
                case 'POST:/blockchain':
                    results = await create(req, res);
                    console.log("results POST", results);
                    break
                case 'GET:/blockchain/last':
                    results = await findLastBlock();
                    break
                case 'GET:/blockchain/verify':
                    const result = await verifBlocks();
                    results = {valid: result};
                    console.log("results GET verify", results)
                    break
                default :
                    res.writeHead(404)
            }
            if (results) {
                res.write(JSON.stringify(results))
            }
        } catch (erreur) {
            if (erreur instanceof NotFoundError) {
                res.writeHead(404)
            } else {
                throw erreur
            }
        }
        res.end()
    }
).listen(3000)
