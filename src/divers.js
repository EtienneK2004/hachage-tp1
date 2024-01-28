import {createHash} from 'node:crypto'

/**
 * @description Definie la variable pour le hash du premier bloc
 * @type {string}
 */
export const monSecret = "";

/**
 * @description Retourne un timestamp au format aaaammjj-hh:mm:ss
 * @return {string}
 */
export function getDate() {
    const date = new Date();
    const annee = date.getFullYear();
    const mois = date.getMonth() + 1;
    const jour = date.getDate();
    const heure = date.getHours();
    const minute = date.getMinutes();
    const seconde = date.getSeconds();
    const moisFormat = mois < 10 ? "0" + mois : mois;
    const jourFormat = jour < 10 ? "0" + jour : jour;
    const heureFormat = heure < 10 ? "0" + heure : heure;
    const minuteFormat = minute < 10 ? "0" + minute : minute;
    const secondeFormat = seconde < 10 ? "0" + seconde : seconde;
    return `${annee}${moisFormat}${jourFormat}-${heureFormat}:${minuteFormat}:${secondeFormat}`;
}

/**
 * @description Retourne le dernier block d'une liste
 * @param list: Block[]
 * @return {Block}
 */
export function findLastBlockFromList(list) {
    return list[list.length - 1];
}



/**
 * @description Hash un block, fonction créée pour assurer la cohérence entre createBlock et verifBlocks
 * @param lastHash: string
 * @param id: string
 * @param date: string
 * @param nom: string
 * @param don: number
 * @return {string}
 */
export function hashBlock(lastHash, id, date, nom, don) {
    const hash = createHash('sha256');

    hash.update(""+lastHash + id + date + nom + don);
    return hash.digest('hex');
}