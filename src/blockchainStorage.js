import {readFile, writeFile} from 'node:fs/promises'
import {getDate, monSecret} from "./divers.js";
import {NotFoundError} from "./errors.js";
import {createHash} from 'node:crypto'
import {v4 as uuidv4} from 'uuid'



/* Chemin de stockage des blocks */
const path = './data/blockchain.json'

/**
 * Mes définitions
 * @typedef { id: string, nom: string, don: number, date: string,hash: string} Block
 * @property {string} id
 * @property {string} nom
 * @property {number} don
 * @property {string} date
 * @property {string} string
 *
 */

/**
 * Renvoie un tableau json de tous les blocks
 * @return {Promise<any>}
 */
export async function findBlocks() {
    const fileContent = await readFile(path, 'utf-8');
    const jsonData = JSON.parse(fileContent);
    return jsonData;
}

/**
 * Trouve un block à partir de son id
 * @param partialBlock
 * @return {Promise<Block[]>}
 */
export async function findBlock(id) {
    const data = await findBlocks();
    const block = data.find(block => block.id === id);
    return block;
}

/**
 * Trouve le dernier block de la chaine
 * @return {Promise<Block|null>}
 */
export async function findLastBlock() {
    const data = await findBlocks();
    return data[data.length - 1];
}

/**
 * Creation d'un block depuis le contenu json
 * @param contenu
 * @return {Promise<Block[]>}
 */
export async function createBlock(contenu) {
    const id = uuidv4();
    const date = getDate();
    const last = await findLastBlock() || monSecret;
    const hash = createHash('sha256').update(last + date + contenu.nom + contenu.don).digest('hex');
    const newBlock = {id, date, hash, ...contenu};
    const blocks = await findBlocks();


    blocks.push(newBlock);
    writeFile(path, JSON.stringify(blocks));
    return [newBlock];
}

export async function verifBlocks() {
    const blocks = await findBlocks();
    let lastHash = monSecret; //Le premier hash est le hash du secret
    for (let block of blocks) {
    //On vérifie que le has obtenu avec le block et le lastHash est bien le hash du block
        if (block.hash !== createHash('sha256').update(lastHash + block.date + block.nom + block.don).digest('hex')) {
            return false;
        }
        lastHash = block.hash;
    }
    //Aucun problème, on renvoie true
    return true;
}