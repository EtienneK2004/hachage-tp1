import {readFile, writeFile} from 'node:fs/promises'
import {getDate, monSecret, findLastBlockFromList, hashBlock} from "./divers.js";
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
    //Le contenu du fichier est un string, on le transforme en objet JS
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
    const blockIndex = data.findIndex(block => block.id === id);

    if(blockIndex === -1)
        throw new NotFoundError();

    const block = data[blockIndex];

    const lastHash = blockIndex == 0 ? monSecret : data[blockIndex - 1].hash;
    if(block.hash !== hashBlock(lastHash, block.id, block.date, block.nom, block.don))
        return {message: "Le bloc n'est plus fiable"};

    return [block];
}

/**
 * Trouve le dernier block de la chaine
 * @return {Promise<Block|null>}
 */
export async function findLastBlock() {
    const data = await findBlocks();
    return data?findLastBlockFromList(data):null;
}

/**
 * Creation d'un block depuis le contenu json
 * @param contenu
 * @return {Promise<Block[]>}
 */
export async function createBlock(contenu) {
    const id = uuidv4();
    const date = getDate();
    const blocks = await findBlocks();
    const last = findLastBlockFromList(blocks);
    const lastHash = last?last.hash:monSecret //Si c'est le premier block, on utilise monSecret comme lastHash
    //l'attribut 'hash' du block contient la concaténation du précedent hash, l'id, la date, le nom et la valeur du don
    const hash = hashBlock(lastHash, id, date, contenu.nom, contenu.don);
    const newBlock = {id: id, date: date, hash: hash, nom: contenu.nom, don: contenu.don};
    

    blocks.push(newBlock);
    writeFile(path, JSON.stringify(blocks));
    return [newBlock];
}

/**
 * Vérifie la chaine de block
 * @return {Promise<boolean>}
 */
export async function verifBlocks() {
    const blocks = await findBlocks();
    let lastHash = monSecret; // Le premier hash n'existe pas et est donc monSecret
    for (let block of blocks) {
    //On vérifie que le has obtenu avec le contenu du block et le lastHash est bien le hash stocké dans le block
        if (block.hash !== hashBlock(lastHash, block.id, block.date, block.nom, block.don)) {
            return false
        }
        lastHash = block.hash;
    }
    //Aucun problème, on renvoie true
    return true;
}